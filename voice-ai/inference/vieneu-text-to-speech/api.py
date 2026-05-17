import os
import sys
import hashlib
import hmac
import json
import urllib.request
from pathlib import Path
from urllib.parse import urlparse

# Add src to path for src-layout packages
# We keep this for compatibility if running as a script alongside the cloned source
if os.path.exists(os.path.join(os.path.dirname(__file__), "src")):
    sys.path.append(os.path.join(os.path.dirname(__file__), "src"))

import asyncio
import logging
import re
import time
import unicodedata
import numpy as np
import queue
import torch
import uvicorn
import subprocess
import threading
from contextlib import asynccontextmanager, suppress

# Polyfill for missing torch bit-types if needed by dynamic imports (like torchao)
if not hasattr(torch, "int1"):
    torch.int1 = torch.int8 
if not hasattr(torch, "uint1"):
    torch.uint1 = torch.uint8

from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from vieneu import Vieneu
from loguru import logger

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Warm up in background to not block startup
    threading.Thread(target=get_tts, daemon=True).start()
    yield
    # Cleanup logic (if any) could go here

app = FastAPI(title="VieNeu-TTS OpenAI API Bridge", lifespan=lifespan)

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
_tts_init_lock = threading.Lock()

# ── GPU Concurrency Control ──────────────────────────────────────────────────
# Giới hạn chỉ 1 TTS inference chạy trên GPU tại một thời điểm.
# Tránh trường hợp 2 request đồng thời tranh nhau VRAM → OOM hoặc slowdown.
_gpu_semaphore = asyncio.Semaphore(1)

def get_tts():
    global tts
    if tts is not None:
        return tts

    with _tts_init_lock:
        if tts is not None:
            return tts
        try:
            # Detect device: prefer environment variable, fallback to auto-detection
            device_setting = os.getenv("TTS_DEVICE", "auto").strip().lower()
            if device_setting in ("", "auto"):
                device = "cuda" if torch.cuda.is_available() else "cpu"
            else:
                device = device_setting

            codec_device_setting = os.getenv("TTS_CODEC_DEVICE", "").strip().lower()
            codec_device = device if codec_device_setting in ("", "auto") else codec_device_setting
            mode = os.getenv("TTS_MODE", "").strip().lower()
            if not mode:
                mode = "fast" if device.startswith("cuda") else "standard"
            default_backbone_repo = {
                "fast": "pnnbao-ump/VieNeu-TTS",
                "gpu": "pnnbao-ump/VieNeu-TTS",
                "standard": "pnnbao-ump/VieNeu-TTS-0.3B-q4-gguf",
                "turbo_gpu": "pnnbao-ump/VieNeu-TTS-v2-Turbo",
                "turbo": "pnnbao-ump/VieNeu-TTS-v2-Turbo-GGUF",
            }.get(mode, "pnnbao-ump/VieNeu-TTS")
            backbone_repo = os.getenv("TTS_BACKBONE_REPO", default_backbone_repo)
            emotion = os.getenv("TTS_EMOTION", "natural").strip()
            gguf_filename = os.getenv("TTS_GGUF_FILENAME", "").strip()

            # ── GPU Memory Fraction ───────────────────────────────────────────
            # 16GB VRAM layout (ước tính):
            #   TTS  (VieNeu float16) : ~4-6 GB  → fraction 0.65 → max ~10.4 GB
            #   STT  (Whisper float16): ~3 GB    → phần còn lại tự nhiên
            #   Buffer an toàn        : ~2-3 GB
            # Nếu muốn giới hạn cứng thì set TTS_GPU_MEM_FRACTION=0.65 trong .env.
            # Để tắt giới hạn (dùng toàn bộ) thì set TTS_GPU_MEM_FRACTION=1.0
            if device.startswith("cuda") and torch.cuda.is_available():
                mem_fraction = float(os.getenv("TTS_GPU_MEM_FRACTION", "0.65"))
                if mem_fraction < 1.0:
                    torch.cuda.set_per_process_memory_fraction(mem_fraction)
                total_vram_gb = torch.cuda.get_device_properties(0).total_memory / 1e9
                logger.info(
                    f"🔧 GPU memory fraction set to {mem_fraction*100:.0f}% "
                    f"(~{total_vram_gb * mem_fraction:.1f}GB / {total_vram_gb:.1f}GB total)"
                )

            logger.info(
                "🚀 Initializing VieNeu-TTS "
                f"(Mode: {mode}, Device: {device}, Backbone: {backbone_repo}, Emotion: {emotion or 'default'})..."
            )

            # Initialize TTS
            mode_key = mode.strip().lower()
            if mode_key in {"turbo", "turbo_gpu"}:
                vieneu_kwargs = {
                    "mode": mode_key,
                    "backbone_repo": backbone_repo,
                    "device": device,
                }
                if mode_key == "turbo" and gguf_filename:
                    vieneu_kwargs["backbone_filename"] = gguf_filename
                if mode_key == "turbo_gpu":
                    vieneu_kwargs["backend"] = os.getenv("TTS_TURBO_BACKEND", "standard").strip().lower()
            elif mode_key in {"fast", "gpu"}:
                vieneu_kwargs = {
                    "mode": "fast",
                    "backbone_repo": backbone_repo,
                    "backbone_device": device,
                    "codec_device": codec_device,
                }
                memory_util = os.getenv("TTS_GPU_MEM_FRACTION", "").strip()
                if memory_util:
                    vieneu_kwargs["memory_util"] = float(memory_util)
            else:
                vieneu_kwargs = {
                    "mode": mode,
                    "backbone_repo": backbone_repo,
                    "backbone_device": device,
                    "codec_device": codec_device,
                }
                if emotion:
                    vieneu_kwargs["emotion"] = emotion
                if gguf_filename:
                    vieneu_kwargs["gguf_filename"] = gguf_filename
            try:
                tts = Vieneu(**vieneu_kwargs)
            except TypeError as exc:
                if "emotion" not in vieneu_kwargs:
                    raise
                logger.warning(f"VieNeu SDK rejected TTS_EMOTION={emotion!r}: {exc}; retrying without emotion")
                vieneu_kwargs.pop("emotion", None)
                tts = Vieneu(**vieneu_kwargs)

            # Log available voices once so operators can verify voice IDs from container logs.
            try:
                voices = tts.list_preset_voices()
                logger.info(f"🎤 Available preset voices ({len(voices)}):")
                for desc, vid in voices:
                    logger.info(f"  - {desc} [ID: {vid}]")
            except Exception as e:
                logger.error(f"Failed to list voices: {e}")

            logger.info(f"✅ VieNeu-TTS ({mode}) Initialized and Ready")
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
    voice: str = "Ly"
    response_format: str = "mp3"
    speed: float = 1.0

def _env_float(name: str, default: float, minimum: float | None = None, maximum: float | None = None) -> float:
    raw = os.getenv(name)
    if raw is None or str(raw).strip() == "":
        return default
    try:
        value = float(raw)
    except ValueError:
        logger.warning(f"Invalid {name}={raw!r}; using {default}")
        return default
    if minimum is not None:
        value = max(minimum, value)
    if maximum is not None:
        value = min(maximum, value)
    return value

def _env_int(name: str, default: int, minimum: int | None = None, maximum: int | None = None) -> int:
    raw = os.getenv(name)
    if raw is None or str(raw).strip() == "":
        return default
    try:
        value = int(raw)
    except ValueError:
        logger.warning(f"Invalid {name}={raw!r}; using {default}")
        return default
    if minimum is not None:
        value = max(minimum, value)
    if maximum is not None:
        value = min(maximum, value)
    return value

def _env_bool(name: str, default: bool = False) -> bool:
    raw = os.getenv(name)
    if raw is None or str(raw).strip() == "":
        return default
    return str(raw).strip().lower() in {"1", "true", "yes", "on", "y", "t"}

def _env_optional_float(name: str, minimum: float | None = None, maximum: float | None = None) -> float | None:
    raw = os.getenv(name)
    if raw is None or str(raw).strip() == "":
        return None
    try:
        value = float(raw)
    except ValueError:
        logger.warning(f"Invalid {name}={raw!r}; ignoring")
        return None
    if minimum is not None:
        value = max(minimum, value)
    if maximum is not None:
        value = min(maximum, value)
    return value

def _env_optional_int(name: str, minimum: int | None = None, maximum: int | None = None) -> int | None:
    raw = os.getenv(name)
    if raw is None or str(raw).strip() == "":
        return None
    try:
        value = int(raw)
    except ValueError:
        logger.warning(f"Invalid {name}={raw!r}; ignoring")
        return None
    if minimum is not None:
        value = max(minimum, value)
    if maximum is not None:
        value = min(maximum, value)
    return value

def _effective_speed(request_speed: float) -> float:
    try:
        request_speed = float(request_speed)
    except (TypeError, ValueError):
        return 1.0
    return max(0.5, min(2.0, request_speed))

def _build_atempo_filter(speed: float) -> str:
    parts: list[str] = []
    value = max(0.5, min(2.0, speed))
    while value < 0.5:
        parts.append("atempo=0.5")
        value /= 0.5
    while value > 2.0:
        parts.append("atempo=2.0")
        value /= 2.0
    parts.append(f"atempo={value:.4f}".rstrip("0").rstrip("."))
    return ",".join(parts)

def sanitize_tts_input(text: str) -> str:
    text = re.sub(r"<think>[\s\S]*?</think>", " ", text, flags=re.IGNORECASE)
    text = re.sub(r"<think>[\s\S]*", " ", text, flags=re.IGNORECASE)
    text = re.sub(r"</think>", " ", text, flags=re.IGNORECASE)
    text = re.sub(r"\b(?:câu\s*hỏi|cau\s*hoi)\s*(?:số\s*)?\d+\s*/\s*\d+\s*:?\s*", " ", text, flags=re.IGNORECASE)
    text = re.sub(r"\b(?:câu\s*hỏi|cau\s*hoi)\s+ti(?:ế|e)p\s+theo\s*:?\s*", " ", text, flags=re.IGNORECASE)
    text = re.sub(r"\b\d+\s*/\s*\d+\b", " ", text)
    text = re.sub(r"[!?]+", ".", text)
    text = re.sub(r"[:;]+", ",", text)
    text = re.sub(r"[/\\|_*#`<>{}\[\]()]+", " ", text)
    return " ".join(text.split()).strip()

def float32_to_pcm16(audio_float):
    audio = np.asarray(audio_float, dtype=np.float32)
    return (np.clip(audio, -1.0, 1.0) * 32767).astype(np.int16).tobytes()

def _voice_key(value: object) -> str:
    text = unicodedata.normalize("NFD", str(value or "").lower())
    return "".join(char for char in text if unicodedata.category(char) != "Mn").strip()


def _backend_voice_profile_url(profile_id: str) -> str:
    base_url = (
        os.getenv("VOICE_PROFILE_BACKEND_API_URL")
        or os.getenv("BACKEND_API_URL")
        or ""
    ).strip().rstrip("/")
    if not base_url:
        raise RuntimeError("BACKEND_API_URL is required for profile voices")
    if base_url.endswith("/v1"):
        return f"{base_url}/interview/compat/voice-profiles/{profile_id}"
    return f"{base_url}/v1/interview/compat/voice-profiles/{profile_id}"


def _signed_backend_headers(method: str, url: str, body: bytes = b"") -> dict[str, str]:
    headers = {"X-Forwarded-Proto": "https"}
    secret = (os.getenv("INTERVIEW_AGENT_SHARED_SECRET") or "").strip()
    if not secret:
        return headers

    timestamp = str(int(time.time()))
    path = urlparse(url).path
    body_digest = hashlib.sha256(body).hexdigest()
    message = "\n".join([method.upper(), path, timestamp, body_digest]).encode("utf-8")
    signature = hmac.new(secret.encode("utf-8"), message, hashlib.sha256).hexdigest()
    headers["X-Square-Agent-Timestamp"] = timestamp
    headers["X-Square-Agent-Signature"] = signature
    return headers


def _fetch_voice_profile(profile_id: str) -> dict:
    url = _backend_voice_profile_url(profile_id)
    request = urllib.request.Request(
        url,
        method="GET",
        headers=_signed_backend_headers("GET", url),
    )
    timeout = _env_float("VOICE_PROFILE_FETCH_TIMEOUT_SECONDS", 15.0, minimum=1.0, maximum=120.0)
    with urllib.request.urlopen(request, timeout=timeout) as response:
        payload = response.read().decode("utf-8")
    data = json.loads(payload)
    if not isinstance(data, dict):
        raise RuntimeError("Voice profile response is not an object")
    return data


def _cache_reference_audio(audio_url: str, profile_id: str, sample_id: str | int | None = None) -> str:
    cache_dir = Path(os.getenv("TTS_VOICE_PROFILE_CACHE_DIR", "/tmp/vieneu_voice_profiles"))
    cache_dir.mkdir(parents=True, exist_ok=True)

    parsed = urlparse(audio_url)
    ext = Path(parsed.path).suffix.lower()
    if ext not in {".wav", ".mp3", ".flac", ".ogg", ".m4a", ".webm"}:
        ext = ".wav"
    digest = hashlib.sha256(audio_url.encode("utf-8")).hexdigest()[:16]
    filename = f"profile_{profile_id}_{sample_id or 'sample'}_{digest}{ext}"
    target_path = cache_dir / filename
    if target_path.exists() and target_path.stat().st_size > 0:
        return str(target_path)

    timeout = _env_float("VOICE_PROFILE_AUDIO_TIMEOUT_SECONDS", 60.0, minimum=1.0, maximum=300.0)
    request = urllib.request.Request(audio_url, method="GET")
    with urllib.request.urlopen(request, timeout=timeout) as response, open(target_path, "wb") as output:
        while True:
            chunk = response.read(1024 * 1024)
            if not chunk:
                break
            output.write(chunk)
    return str(target_path)


def _resolve_profile_voice(req_voice: str) -> tuple[str | None, str | None, str | None]:
    if not req_voice.startswith("profile:"):
        return None, None, None

    profile_id = req_voice.split(":", 1)[1].strip()
    if not profile_id:
        raise RuntimeError("Missing voice profile id")

    profile = _fetch_voice_profile(profile_id)
    voice_type = str(profile.get("voiceType") or profile.get("voice_type") or "").strip().lower()
    if voice_type == "preset":
        preset_voice = str(profile.get("presetVoiceId") or profile.get("preset_voice_id") or "").strip()
        return preset_voice or None, None, None

    samples = profile.get("samples") or []
    if not samples:
        raise RuntimeError(f"Voice profile {profile_id} has no reference samples")

    sample = samples[0]
    audio_url = str(sample.get("audioUrl") or sample.get("audio_url") or "").strip()
    reference_text = str(sample.get("referenceText") or sample.get("reference_text") or "").strip()
    if not audio_url or not reference_text:
        raise RuntimeError(f"Voice profile {profile_id} sample is missing audioUrl/referenceText")
    ref_audio = _cache_reference_audio(audio_url, profile_id, sample.get("id"))
    logger.info(f"Resolved cloned voice profile {profile_id} with cached ref audio {ref_audio}")
    return None, ref_audio, reference_text

@app.get("/v1/voices")
@app.get("/voices")
async def list_voices():
    engine = get_tts()
    if engine is None:
        raise HTTPException(
            status_code=503,
            detail="TTS engine is still initializing or failed to load. Please check server logs.",
        )
    return [v[0] for v in engine.list_preset_voices()]

@app.post("/v1/audio/speech")
async def tts_speech(req: OpenAITTSRequest):  # noqa: C901
    req.input = sanitize_tts_input(req.input)

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
    clone_ref_audio = None
    clone_ref_text = None
    requested_voice = req.voice
    try:
        if req.voice.startswith("profile:"):
            requested_voice, clone_ref_audio, clone_ref_text = _resolve_profile_voice(req.voice)

        voices = engine.list_preset_voices()
        requested_key = _voice_key(requested_voice)
        # 1. Try exact match by description or ID
        if clone_ref_audio is None:
            for desc, vid in voices:
                if requested_voice == desc or requested_voice == vid or requested_key in {_voice_key(desc), _voice_key(vid)}:
                    logger.info(f"Matching voice found: {desc} ({vid})")
                    voice_data = engine.get_preset_voice(vid)
                    break
        
        # 2. Case-insensitive partial match
        if clone_ref_audio is None and voice_data is None and requested_voice:
            for desc, vid in voices:
                desc_key = _voice_key(desc)
                vid_key = _voice_key(vid)
                if requested_key and (requested_key in desc_key or requested_key in vid_key):
                    logger.info(f"Partial matching voice found: {desc} ({vid})")
                    voice_data = engine.get_preset_voice(vid)
                    break
                    
        # 3. Fallback to first available voice instead of None
        if clone_ref_audio is None and voice_data is None and voices:
            logger.warning(f"Voice '{req.voice}' not found. Falling back to first voice: {voices[0][0]}")
            voice_data = engine.get_preset_voice(voices[0][1])
            
    except Exception as e:
        logger.error(f"Voice resolution error: {e}")
        raise HTTPException(status_code=400, detail=f"Voice resolution failed: {str(e)}")

    def generator():
        input_sample_rate = 24000
        output_sample_rate = 24000
        stop_event = threading.Event()
        effective_speed = _effective_speed(req.speed)
        
        ffmpeg_cmd = [
            "ffmpeg", "-loglevel", "error", "-f", "s16le", "-ar", str(input_sample_rate), "-ac", "1", "-i", "-",
            "-ar", str(output_sample_rate), "-ac", "1"
        ]

        if abs(effective_speed - 1.0) > 0.01:
            ffmpeg_cmd.extend(["-filter:a", _build_atempo_filter(effective_speed)])
        
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
                infer_kwargs = {}
                temperature = _env_optional_float("TTS_INFER_TEMPERATURE", minimum=0.1, maximum=2.0)
                top_k = _env_optional_int("TTS_INFER_TOP_K", minimum=1, maximum=200)
                max_chars = _env_optional_int("TTS_MAX_CHARS", minimum=32, maximum=1024)
                if temperature is not None:
                    infer_kwargs["temperature"] = temperature
                if top_k is not None:
                    infer_kwargs["top_k"] = top_k
                if max_chars is not None:
                    infer_kwargs["max_chars"] = max_chars
                if clone_ref_audio:
                    infer_kwargs["ref_audio"] = clone_ref_audio
                    infer_kwargs["ref_text"] = clone_ref_text or ""
                elif voice_data is not None:
                    infer_kwargs["voice"] = voice_data
                normalize_audio = _env_bool("TTS_NORMALIZE_AUDIO", False)
                peak_limit = _env_float("TTS_PEAK_LIMIT", 0.98, minimum=0.1, maximum=1.0)
                peak_target = _env_float("TTS_PEAK_NORMALIZE_TARGET", 0.80, minimum=0.1, maximum=0.98)

                use_streaming = _env_bool("TTS_USE_STREAMING", False)
                if use_streaming:
                    audio_stream = engine.infer_stream(req.input, **infer_kwargs)
                else:
                    audio_stream = [engine.infer(req.input, **infer_kwargs)]

                logger.info(
                    "TTS inference params: "
                    f"mode={'stream' if use_streaming else 'full'}, "
                    f"custom_temperature={'temperature' in infer_kwargs}, "
                    f"custom_top_k={'top_k' in infer_kwargs}, "
                    f"custom_max_chars={'max_chars' in infer_kwargs}, "
                    f"normalize_audio={normalize_audio}, "
                    f"peak_limit={peak_limit}, "
                    f"speed={effective_speed}, "
                    f"profile_clone={bool(clone_ref_audio)}"
                )

                for chunk in audio_stream:
                    if stop_event.is_set():
                        logger.debug("TTS writer stopping early due to stream shutdown")
                        break

                    chunk_count += 1
                    
                    chunk = np.asarray(chunk, dtype=np.float32)
                    raw_max = float(np.abs(chunk).max()) if chunk.size else 0.0

                    if raw_max > 1e-7:
                        if normalize_audio:
                            chunk = chunk * (peak_target / raw_max)
                        elif raw_max > peak_limit:
                            chunk = chunk * (peak_limit / raw_max)
                            logger.info(
                                f"Chunk {chunk_count}: peak-limited raw_max={raw_max:.6f} -> {peak_limit:.2f}"
                            )
                    else:
                        logger.warning(f"⚠️ SILENT CHUNK {chunk_count} (max={raw_max:.8f}) - Skipping normalization")

                    chunk = np.clip(chunk, -peak_limit, peak_limit)
                    pcm_data = float32_to_pcm16(chunk)
                    try:
                        if process.stdin is None or process.stdin.closed:
                            raise BrokenPipeError("FFmpeg stdin already closed")
                        process.stdin.write(pcm_data)
                        process.stdin.flush()
                    except (BrokenPipeError, ValueError, OSError) as pipe_exc:
                        if stop_event.is_set() or process.poll() is not None:
                            logger.debug("TTS writer stopped after shutdown: %s", pipe_exc)
                            break
                        raise
                
                logger.info(f"Inference finished. Total chunks: {chunk_count}")
                if process.stdin and not process.stdin.closed:
                    process.stdin.close()
            except Exception as e:
                if stop_event.is_set() and isinstance(e, (BrokenPipeError, ValueError, OSError)):
                    logger.debug("Inference ended after shutdown: %s", e)
                else:
                    logger.error(f"Inference error: {e}", exc_info=True)
                    ex_q.put(e)
                with suppress(Exception):
                    if process.stdin and not process.stdin.closed:
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
            stop_event.set()
            with suppress(Exception):
                if process.stdin and not process.stdin.closed:
                    process.stdin.close()
            with suppress(Exception):
                process.terminate()
            with suppress(Exception):
                process.wait(timeout=2)
            if thread.is_alive():
                thread.join(timeout=2)

    media_type = "audio/mpeg" if req.response_format == "mp3" else "audio/wav"
    if req.response_format == "pcm":
        media_type = "audio/pcm;rate=24000"

    async def async_generator():
        """Wrap blocking generator với GPU semaphore để serialize GPU access."""
        async with _gpu_semaphore:
            logger.debug("🔒 GPU semaphore acquired for TTS inference")
            loop = asyncio.get_event_loop()
            gen = generator()
            try:
                while True:
                    # Chạy blocking read trong thread pool để không block event loop
                    chunk = await loop.run_in_executor(None, next, gen, None)
                    if chunk is None:
                        break
                    yield chunk
            finally:
                logger.debug("🔓 GPU semaphore released")

    return StreamingResponse(async_generator(), media_type=media_type)

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
