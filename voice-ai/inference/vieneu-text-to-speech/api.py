import os
import sys

# Add src to path for src-layout packages
# We keep this for compatibility if running as a script alongside the cloned source
if os.path.exists(os.path.join(os.path.dirname(__file__), "src")):
    sys.path.append(os.path.join(os.path.dirname(__file__), "src"))

import logging
import time
import numpy as np
import torch
import uvicorn
import subprocess
import threading
import queue
from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from vieneu import Vieneu
from loguru import logger

app = FastAPI(title="VieNeu-TTS OpenAI API Bridge")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health(response: Response):
    if tts is not None:
        return {"status": "ok", "model_loaded": True}
    
    # Return 503 Service Unavailable until the model is ready
    response.status_code = 503
    return {"status": "initializing", "model_loaded": False}

# Global TTS Instance
tts = None

def get_tts():
    global tts
    if tts is None:
        try:
            # Detect device: prefer environment variable, fallback to auto-detection
            device = os.getenv("TTS_DEVICE", "cuda" if torch.cuda.is_available() else "cpu")
            
            logger.info(f"🚀 Initializing VieNeu-TTS (Mode: standard, Device: {device})...")
            
            # Initialize TTS 
            # Switching to 'standard' mode for maximum stability 
            # as 'fast' mode (LMDeploy) is hitting a fatal buffer error on this system.
            tts = Vieneu(
                mode='standard', 
                backbone_repo="pnnbao-ump/VieNeu-TTS",
                backbone_device=device,
                codec_device=device
            )
            
            # DEBUG: List all available voices at startup
            try:
                voices = tts.list_preset_voices()
                logger.info(f"🎤 Available preset voices ({len(voices)}):")
                for desc, vid in voices:
                    logger.info(f"  - {desc} [ID: {vid}]")
            except Exception as e:
                logger.error(f"Failed to list voices: {e}")
                
            logger.info("✅ VieNeu-TTS (Standard Mode) Initialized and Ready")
        except Exception as e:
            logger.critical(f"❌ FATAL ERROR during VieNeu-TTS initialization: {e}")
            logger.exception(e)
            # We don't exit the process here to allow the health check to keep returning 503
            # which helps in debugging via logs rather than seeing continuous container restarts.
    return tts

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.exception(f"Unhandled exception during {request.method} {request.url}")
    return Response(
        content=f"Internal Server Error: {str(exc)}",
        status_code=500
    )

class OpenAITTSRequest(BaseModel):
    input: str
    model: str = "tts-1"
    voice: str = "Ly (nữ miền Bắc)"
    response_format: str = "mp3"
    speed: float = 1.0

def float32_to_pcm16(audio_float):
    return (audio_float * 32767).clip(-32768, 32767).astype(np.int16).tobytes()

@app.get("/v1/voices")
@app.get("/voices")
async def list_voices():
    engine = get_tts()
    return [v[0] for v in engine.list_preset_voices()]

@app.post("/v1/audio/speech")
async def tts_speech(req: OpenAITTSRequest):
    # Basic input validation
    if not req.input or not req.input.strip():
        logger.warning("Received empty TTS input")
        raise HTTPException(status_code=400, detail="Input text cannot be empty")
        
    logger.info(f"Received TTS request (len={len(req.input)}): {req.model} / {req.voice}")
    
    engine = get_tts()
    if engine is None:
        logger.error("TTS engine accessed but is None (not initialized)")
        raise HTTPException(
            status_code=503, 
            detail="TTS engine is still initializing or failed to load. Please check server logs."
        )
    
    # Resolve voice
    voice_data = None
    try:
        voices = engine.list_preset_voices()
        # 1. Try exact match by description or ID
        for desc, vid in voices:
            if req.voice == desc or req.voice == vid:
                logger.info(f"Matching voice found: {desc} ({vid})")
                voice_data = engine.get_preset_voice(vid)
                break
        
        # 2. Case-insensitive partial match
        if voice_data is None:
            for desc, vid in voices:
                if req.voice.lower() in desc.lower():
                    logger.info(f"Partial matching voice found: {desc} ({vid})")
                    voice_data = engine.get_preset_voice(vid)
                    break
                    
        # 3. Fallback to first available voice instead of None
        if voice_data is None and voices:
            logger.warning(f"Voice '{req.voice}' not found. Falling back to first voice: {voices[0][0]}")
            voice_data = engine.get_preset_voice(voices[0][1])
            
    except Exception as e:
        logger.error(f"Voice resolution error: {e}")
        raise HTTPException(status_code=400, detail=f"Voice resolution failed: {str(e)}")

    def generator():
        input_sample_rate = 24000
        output_sample_rate = 24000
        
        ffmpeg_cmd = [
            "ffmpeg", "-loglevel", "error", "-f", "s16le", "-ar", str(input_sample_rate), "-ac", "1", "-i", "-",
            "-ar", str(output_sample_rate), "-ac", "1"
        ]
        
        if req.response_format == "mp3":
            ffmpeg_cmd.extend(["-f", "mp3", "-c:a", "libmp3lame", "-ab", "128k"])
        elif req.response_format == "wav":
            ffmpeg_cmd.extend(["-f", "wav", "-c:a", "pcm_s16le"])
        elif req.response_format == "pcm":
            # For raw PCM, we just output s16le directly
            ffmpeg_cmd.extend(["-f", "s16le", "-c:a", "pcm_s16le"])
        else:
            ffmpeg_cmd.extend(["-f", "mp3", "-c:a", "libmp3lame", "-ab", "128k"])
        
        ffmpeg_cmd.extend(["-fflags", "nobuffer", "-flush_packets", "1", "-"])

        try:
            process = subprocess.Popen(ffmpeg_cmd, stdin=subprocess.PIPE, stdout=subprocess.PIPE, bufsize=0)
        except OSError as e:
            logger.error(f"Failed to start FFmpeg: {e}")
            raise HTTPException(status_code=500, detail=f"FFmpeg startup failed: {e}")

        ex_q = queue.Queue()

        def write_to_ffmpeg():
            try:
                chunk_count = 0
                # Using temperature=1.2 for more energy and variance
                for chunk in engine.infer_stream(req.input, voice=voice_data, temperature=1.2):
                    chunk_count += 1
                    
                    # Log detailed stats before normalization
                    raw_max = np.abs(chunk).max()
                    
                    # AGGRESSIVE NORMALIZATION: If the audio is too quiet, boost it
                    if raw_max > 1e-7:
                        # Normalize to 0.95 peak amplitude
                        chunk = chunk * (0.95 / raw_max)
                        boosted_max = np.abs(chunk).max()
                        logger.info(f"Chunk {chunk_count}: raw_max={raw_max:.6f} -> boosted_max={boosted_max:.2f}")
                    else:
                        logger.warning(f"⚠️ SILENT CHUNK {chunk_count} (max={raw_max:.8f}) - Skipping normalization")
                    
                    pcm_data = float32_to_pcm16(chunk)
                    process.stdin.write(pcm_data)
                    process.stdin.flush()
                
                logger.info(f"Inference finished. Total chunks: {chunk_count}")
                process.stdin.close()
            except Exception as e:
                logger.error(f"Inference error: {e}", exc_info=True)
                ex_q.put(e)
                if process.stdin:
                    process.stdin.close()

        thread = threading.Thread(target=write_to_ffmpeg, daemon=True)
        thread.start()
        
        try:
            total_bytes_out = 0
            while True:
                # Check for exceptions from the thread
                try:
                    e = ex_q.get_nowait()
                    raise e
                except queue.Empty:
                    pass

                data = process.stdout.read(4096)
                if not data:
                    logger.info(f"FFmpeg stdout closed. Total bytes output: {total_bytes_out}")
                    break
                total_bytes_out += len(data)
                yield data
        finally:
            process.terminate()
            if process.stdin:
                process.stdin.close()

    media_type = "audio/mpeg" if req.response_format == "mp3" else "audio/wav"
    if req.response_format == "pcm":
        media_type = "audio/pcm;rate=24000"
        
    return StreamingResponse(generator(), media_type=media_type)

@app.on_event("startup")
async def startup_event():
    # Warm up in background to not block startup
    threading.Thread(target=get_tts, daemon=True).start()

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8298))
    
    # Custom logging config to suppress /health logs
    log_config = uvicorn.config.LOGGING_CONFIG
    log_config["formatters"]["access"]["fmt"] = "%(asctime)s | %(levelname)s | %(client_addr)s - \"%(request_line)s\" %(status_code)s"
    
    # We use a filter to skip health checks in the access log
    class HealthCheckFilter(logging.Filter):
        def filter(self, record: logging.LogRecord) -> bool:
            return "/health" not in record.getMessage()

    logging.getLogger("uvicorn.access").addFilter(HealthCheckFilter())
    
    uvicorn.run(app, host="0.0.0.0", port=port, log_config=log_config)
