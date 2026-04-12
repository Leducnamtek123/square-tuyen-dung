import asyncio
import logging
import httpx
from typing import Any

from livekit.agents import (
    AgentServer,
    JobContext,
    JobProcess,
    cli,
)
from livekit.agents.pipeline import VoicePipelineAgent, ChatContext
from livekit.plugins import openai, silero
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

server = AgentServer()

def prewarm(proc: JobProcess) -> None:
    """Pre-load heavy models in the main (prewarm) process to save time on job startup."""
    proc.userdata["vad"] = silero.VAD.load()

server.setup_fnc = prewarm

@server.rtc_session()
async def entrypoint(ctx: JobContext) -> None:
    # Set log context for better debugging
    ctx.log_context_fields = {"room": ctx.room.name}
    logger.info(f"Starting interview agent for room: {ctx.room.name}")

    session = None
    try:
        # 1. Initialize Models
        # Optimized for high-quality, low-latency interaction
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

        # Create Interviewer logic engine
        interviewer = Interviewer(context=agent_context)
        
        from .prompts import INTERVIEWER_INSTRUCTIONS
        chat_ctx = ChatContext().append(
            role="system",
            text=f"{INTERVIEWER_INSTRUCTIONS}\n\nThông tin ngữ cảnh:\n- Ứng viên: {agent_context['candidateName']}\n- Vị trí: {agent_context['jobTitle']}\n- Mô tả công việc: {agent_context['jobDescription']}",
        )

        # 3. Create Voice Pipeline Agent
        from livekit.plugins.turn_detector.multilingual import MultilingualModel
        
        agent = VoicePipelineAgent(
            stt=stt_model,
            llm=llm_model,
            tts=tts_model,
            vad=ctx.proc.userdata["vad"],
            chat_ctx=chat_ctx,
            fnc_ctx=interviewer, # Provide interview tools (get_next_question, etc.)
            turn_detector=MultilingualModel(vad=ctx.proc.userdata["vad"]),
            interrupt_speech_duration=0.5,
            min_endpointing_delay=0.5,
        )

        # 4. Event Handlers (Persistence and Debugging)
        @agent.on("agent_speech_committed")
        def _on_agent_speech(msg):
            if msg.text:
                asyncio.create_task(interviewer._append_transcript("ai_agent", msg.text))

        @agent.on("user_speech_committed")
        def _on_user_speech(msg):
            if isinstance(msg.content, str) and msg.content.strip():
                asyncio.create_task(interviewer._append_transcript("candidate", msg.content.strip()))

        @agent.on("transcript_received")
        def _on_partial_transcript(ev):
            # Optional: push partial transcript to room attributes for UI
            pass

        # 5. Start the Agent in the room
        agent.start(ctx.room)
        
        # Mark interview as active in backend
        await _update_backend_status(ctx.room.name, "in_progress")

        # Initial Greeting
        candidate_name = agent_context["candidateName"]
        await agent.say(f"Xin chào {candidate_name}, tôi là trợ lý phỏng vấn ảo của Square. Rất vui được gặp bạn. Chúng ta bắt đầu buổi phỏng vấn nhé?", allow_interruptions=True)
        
        # Mark interview as active in backend
        await _update_backend_status(ctx.room.name, "in_progress")

        # 6. Wait loop - keep the worker alive while connected
        while ctx.room.is_connected():
            await asyncio.sleep(1)

    except Exception as e:
        logger.error(f"CRITICAL ERROR in interview_agent: {e}", exc_info=True)
    finally:
        # Final status sync
        await _update_backend_status(ctx.room.name, "completed")
        logger.info(f"Session finished for room: {ctx.room.name}")

@server.cli.command("download-files")
def download_files():
    """Download necessary models to the local cache. Used by Dockerfile."""
    print("Downloading models...")
    silero.VAD.load()
    print("Models downloaded successfully.")

if __name__ == "__main__":
    cli.run_app(server)
