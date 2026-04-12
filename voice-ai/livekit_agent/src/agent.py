import asyncio
import logging
import httpx
from typing import Any

from livekit.agents import (
    AgentServer,
    AgentSession,
    JobContext,
    JobProcess,
    cli,
)
from livekit.plugins import openai, silero
from livekit.plugins.turn_detector.multilingual import MultilingualModel
import openai as openai_lib

from .config import config
from .interviewer import Interviewer

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("agent")

# Set ONNX execution providers to CPU only to avoid GPU discovery warnings in Docker
import os
os.environ["ONNXRUNTIME_EXECUTION_PROVIDERS"] = "CPUExecutionProvider"

# --- Helper Functions ---
async def _update_backend_status(room_name: str, status: str) -> None:
    """Update the interview status in the central backend."""
    try:
        url = f"{config.BACKEND_API_URL}/v1/interview/compat/{room_name}/status"
        async with httpx.AsyncClient() as client:
            await client.patch(url, json={"status": status}, timeout=5.0)
    except Exception as e:
        logger.warning(f"Failed to update backend status for {room_name}: {e}")

# --- LiveKit Agent Implementation ---

def prewarm(proc: JobProcess) -> None:
    """Pre-load heavy models in the main (prewarm) process to save time on job startup."""
    proc.userdata["vad"] = silero.VAD.load()

async def entrypoint(ctx: JobContext) -> None:
    # Set log context for better debugging
    ctx.log_context_fields = {"room": ctx.room.name}
    logger.info(f"Starting interview agent for room: {ctx.room.name}")

    # CRITICAL for 1.x: Connect to the room first
    await ctx.connect()

    session = None
    try:
        # 1. Initialize Models
        stt_model = openai.STT(
            api_key=config.STT_API_KEY,
            base_url=config.STT_BASE_URL,
            model=config.STT_MODEL,
        )

        llm_model = openai.LLM(
            client=openai_lib.AsyncOpenAI(
                api_key="no-key-needed",
                base_url=config.LLAMA_BASE_URL,
                http_client=httpx.AsyncClient(timeout=httpx.Timeout(300.0, connect=10.0))
            ),
            model=config.LLAMA_MODEL, 
        )

        tts_model = openai.TTS(
            client=openai_lib.AsyncOpenAI(
                api_key=config.TTS_API_KEY,
                base_url=config.TTS_BASE_URL,
                http_client=httpx.AsyncClient(timeout=httpx.Timeout(120.0, connect=10.0))
            ),
            model=config.TTS_MODEL,
            voice=config.TTS_VOICE,
        )

        # 2. Context Preparation
        agent_context = {
            "candidateName": "Ứng viên",
            "jobTitle": "Vị trí này",
            "jobDescription": "",
            "backendApiUrl": config.BACKEND_API_URL,
            "roomName": ctx.room.name,
        }
        try:
            metadata = ctx.room.metadata
            if metadata:
                import json
                pm = json.loads(metadata)
                agent_context.update({
                    "candidateName": pm.get("candidate_name", "Ứng viên"),
                    "jobTitle": pm.get("job_title", "Vị trí này"),
                    "jobDescription": pm.get("job_description", ""),
                })
        except Exception as e:
            logger.warning(f"Failed to parse room metadata: {e}")

        # Create Interviewer logic engine (inherits from livekit.agents.Agent)
        interviewer = Interviewer(context=agent_context)

        # 3. Setup Session (Standard 1.5.x Pattern)
        from livekit.agents import TurnHandlingOptions

        
        session = AgentSession(
            stt=stt_model,
            llm=llm_model,
            tts=tts_model,
            vad=ctx.proc.userdata["vad"],
            turn_handling=TurnHandlingOptions(
                turn_detection=MultilingualModel(),


            ),
        )

        # 4. Event Handlers (Persistence and Debugging)
        @session.on("conversation_item_added")
        def _on_history_added(ev):
            item = ev.item
            role = "candidate" if item.role == "user" else "ai_agent"
            content = ""
            if isinstance(item.content, str):
                content = item.content
            elif isinstance(item.content, list):
                content = "".join([getattr(c, 'text', '') for c in item.content])
            
            if content and content.strip():
                asyncio.create_task(interviewer._append_transcript(role, content.strip()))

        @session.on("user_input_transcribed")
        def _on_debug_transcript(ev):
            if ev.transcript:
                asyncio.create_task(ctx.room.local_participant.set_attributes({
                    "lk.agent.last_heard": ev.transcript[:60] + ("..." if len(ev.transcript) > 60 else "")
                }))

        # 5. Start the Session and Greeting
        await session.start(
            agent=interviewer,
            room=ctx.room
        )
        
        # Mark interview as active in backend
        await _update_backend_status(ctx.room.name, "in_progress")

        # Initial Greeting
        await session.generate_reply(
            instructions=f"Hãy chào đón ứng viên {agent_context['candidateName']} một cách nồng nhiệt và giới thiệu về buổi phỏng vấn vị trí {agent_context['jobTitle']}."
        )

        # 6. Wait loop - keep the worker alive while connected
        while ctx.room.is_connected():
            await asyncio.sleep(1)

    except Exception as e:
        logger.error(f"CRITICAL ERROR in interview_agent: {e}", exc_info=True)
    finally:
        # Final status sync
        await _update_backend_status(ctx.room.name, "completed")
        logger.info(f"Session finished for room: {ctx.room.name}")


def download_files():
    """Download necessary models to the local cache. Used by Dockerfile."""
    print("Downloading Silero VAD...")
    silero.VAD.load()
    
    print("Downloading Multilingual Turn Detector...")
    try:
        from huggingface_hub import hf_hub_download
        repo_id = "livekit/turn-detector"
        # The multilingual assets are on a specific branch (note the typo 'multlingual')
        revision = "multlingual"
        for filename in ["languages.json", "onnx/model.onnx", "onnx/config.json"]:
            print(f"Downloading {filename} from {revision} branch...")
            hf_hub_download(repo_id=repo_id, filename=filename, revision=revision)
    except Exception as e:

        print(f"Warning: Could not pre-download turn detector files: {e}")
        # We don't raise here to allow build to continue if it's just a warning, 
        # but the print will help us debug.
        
    print("Models downloaded successfully.")




if __name__ == "__main__":
    import sys
    from livekit.agents import WorkerOptions
    
    if len(sys.argv) > 1 and sys.argv[1] == "download-files":
        download_files()
    else:
        cli.run_app(
            WorkerOptions(
                entrypoint_fnc=entrypoint,
                prewarm_fnc=prewarm,
                agent_name="square-ai-interviewer",
            )
        )





