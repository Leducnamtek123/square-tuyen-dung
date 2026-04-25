import asyncio
import json
import logging

import httpx
from dotenv import load_dotenv

from livekit.agents import (
    AgentServer,
    AgentSession,
    JobContext,
    JobProcess,
    MetricsCollectedEvent,
    TurnHandlingOptions,
    cli,
    metrics,
)
from livekit.agents.job import get_job_context
from livekit.agents.voice.events import CloseEvent
from livekit.plugins import openai, silero
from livekit.plugins.turn_detector.multilingual import MultilingualModel
import openai as openai_lib

from .config import config
from .interviewer import Interviewer
from .session_settings import build_session_kwargs

load_dotenv()

# Configure logging
logger = logging.getLogger("square-ai-interviewer")
logger.setLevel(logging.INFO)


# --- Helper Functions ---
async def _update_backend_status(room_name: str, status: str) -> None:
    """Update the interview status in the central backend."""
    try:
        url = f"{config.BACKEND_API_URL}/v1/interview/compat/{room_name}/status"
        async with httpx.AsyncClient() as client:
            await client.patch(url, json={"status": status}, timeout=5.0)
    except Exception as e:
        logger.warning(f"Failed to update backend status for {room_name}: {e}")


# --- AgentServer Setup (1.5.x Pattern) ---
server = AgentServer()


def prewarm(proc: JobProcess) -> None:
    """Pre-load heavy models in the main (prewarm) process to save time on job startup."""
    proc.userdata["vad"] = silero.VAD.load()


server.setup_fnc = prewarm


@server.rtc_session(agent_name="square-ai-interviewer")
async def entrypoint(ctx: JobContext) -> None:
    # Set log context for better debugging
    ctx.log_context_fields = {"room": ctx.room.name}
    logger.info(f"Starting interview agent for room: {ctx.room.name}")

    # 1. Initialize Models
    stt_model = openai.STT(
        api_key=config.STT_API_KEY,
        base_url=config.STT_BASE_URL,
        model=config.STT_MODEL,
        language=config.STT_LANGUAGE,
    )

    llm_model = openai.LLM(
        client=openai_lib.AsyncOpenAI(
            api_key=config.LLM_API_KEY,
            base_url=config.LLM_BASE_URL,
            http_client=httpx.AsyncClient(
                timeout=httpx.Timeout(600.0, connect=15.0)
            ),
        ),
        model=config.LLM_MODEL,
    )

    tts_model = openai.TTS(
        client=openai_lib.AsyncOpenAI(
            api_key=config.TTS_API_KEY,
            base_url=config.TTS_BASE_URL,
            max_retries=config.TTS_MAX_RETRIES,
            http_client=httpx.AsyncClient(
                timeout=httpx.Timeout(
                    connect=config.TTS_CONNECT_TIMEOUT_SECONDS,
                    read=config.TTS_READ_TIMEOUT_SECONDS,
                    write=config.TTS_WRITE_TIMEOUT_SECONDS,
                    pool=config.TTS_POOL_TIMEOUT_SECONDS,
                )
            ),
        ),
        model=config.TTS_MODEL,
        voice=config.TTS_VOICE,
    )

    # 2. Context Preparation from room metadata
    agent_context = {
        "candidateName": "Ứng viên",
        "jobTitle": "đang ứng tuyển",
        "jobDescription": "",
        "backendApiUrl": config.BACKEND_API_URL,
        "roomName": ctx.room.name,
    }
    try:
        metadata = ctx.room.metadata
        if metadata:
            pm = json.loads(metadata)
            agent_context.update(
                {
                    "candidateName": pm.get("candidate_name", "Ứng viên"),
                    "jobTitle": pm.get("job_title", "đang ứng tuyển"),
                    "jobDescription": pm.get("job_description", ""),
                }
            )
    except Exception as e:
        logger.warning(f"Failed to parse room metadata: {e}")

    # Fetch pre-loaded questions from context endpoint
    try:
        url = f"{config.BACKEND_API_URL}/v1/interview/compat/{ctx.room.name}/context"
        async with httpx.AsyncClient() as client:
            resp = await client.get(url, timeout=5.0)
        if resp.status_code == 200:
            data = resp.json()
            if isinstance(data, dict):
                agent_context.update(data)
                agent_context["questions"] = data.get("questions", [])
    except Exception as e:
        logger.warning(f"Failed to fetch predefined questions: {e}")

    # 3. Create Interviewer Agent (greeting is handled in on_enter)
    interviewer = Interviewer(context=agent_context)

    # 4. Setup Session (Standard 1.5.x Pattern)
    session = AgentSession(
        stt=stt_model,
        llm=llm_model,
        tts=tts_model,
        vad=ctx.proc.userdata["vad"],
        fnc_ctx=interviewer,
        turn_handling=TurnHandlingOptions(
            turn_detection=MultilingualModel(),
        ),
        **build_session_kwargs(),
    )

    # 5. Event Handlers
    @session.on("metrics_collected")
    def _on_metrics_collected(ev: MetricsCollectedEvent) -> None:
        metrics.log_metrics(ev.metrics)

    @session.on("close")
    def _on_close(ev: CloseEvent) -> None:
        logger.info(
            f"Session closed for room: {ctx.room.name}, reason: {ev.reason}"
        )
        # Sync remaining transcript from session history
        for item in session.history.items:
            if item.type == "message":
                role = "candidate" if item.role == "user" else "ai_agent"
                content = item.text_content
                if content and content.strip():
                    asyncio.create_task(
                        interviewer._append_transcript(role, content.strip())
                    )

        try:
            get_job_context().shutdown(reason=ev.reason.value)
        except Exception as exc:
            logger.warning(f"Failed to shutdown job context: {exc}")

    # 6. Shutdown callback for final status sync
    async def on_shutdown() -> None:
        await _update_backend_status(ctx.room.name, "completed")
        logger.info(f"Session finished for room: {ctx.room.name}")
        logger.info(f"Usage: {session.usage}")

    ctx.add_shutdown_callback(on_shutdown)

    # 7. Start the Session (no ctx.connect() needed - handled by session.start)
    await session.start(
        agent=interviewer,
        room=ctx.room,
    )

    # Mark interview as active in backend
    await _update_backend_status(ctx.room.name, "in_progress")

    # NO busy-wait loop needed - framework manages lifecycle automatically


if __name__ == "__main__":
    cli.run_app(server)
