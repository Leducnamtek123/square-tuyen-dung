import asyncio
import json
import logging

import httpx
from dotenv import load_dotenv

from livekit.agents import (
    AgentServer,
    AgentSession,
    AutoSubscribe,
    JobContext,
    JobProcess,
    cli,
    room_io,
)
from livekit.agents.job import get_job_context
from livekit.agents.voice.events import CloseEvent
from livekit.agents.voice.events import SessionUsageUpdatedEvent
from livekit.agents.llm import ChatMessage
from livekit.plugins import openai, silero
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
        "participantIdentity": "",
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

    async def _wait_for_participant(participant_identity: str | None, timeout_seconds: float = 2.0):
        if not participant_identity:
            return None

        deadline = asyncio.get_event_loop().time() + timeout_seconds
        while True:
            participant = ctx.room.remote_participants.get(participant_identity)
            if participant is not None:
                return participant
            if asyncio.get_event_loop().time() >= deadline:
                return None
            await asyncio.sleep(0.1)

    async def _handle_text_stream(reader, participant_identity: str) -> None:
        text = (await reader.read_all()).strip()
        if not text:
            return

        participant = await _wait_for_participant(participant_identity)
        if participant is None:
            logger.warning(
                "participant not found after retry, ignoring text input for room %s from %s",
                ctx.room.name,
                participant_identity,
            )
            return

        logger.info(
            "Received text interview input for room %s from %s: %s",
            ctx.room.name,
            participant_identity,
            text,
        )
        await interviewer.record_transcript("candidate", text)
        try:
            await session.interrupt(force=True)
        except Exception as exc:
            logger.info(
                "Skipping interrupt before text reply for room %s: %s",
                ctx.room.name,
                exc,
            )
        # Text-chat turns should stay on the conversational path only.
        # Disabling tool selection here avoids function-call failures from the
        # LLM when a candidate sends a plain text answer.
        session.generate_reply(user_input=text, tools=[], tool_choice="none")

    # 4. Setup Session (Standard 1.5.x Pattern)
    session = AgentSession(
        stt=stt_model,
        llm=llm_model,
        tts=tts_model,
        vad=ctx.proc.userdata["vad"],
        **build_session_kwargs(),
    )
    session_started = False

    # 5. Event Handlers
    @session.on("session_usage_updated")
    def _on_session_usage_updated(ev: SessionUsageUpdatedEvent) -> None:
        logger.info("Session usage updated for room %s: %s", ctx.room.name, ev.usage)

    @session.on("conversation_item_added")
    def _on_conversation_item_added(ev) -> None:
        item = getattr(ev, "item", None)
        if not isinstance(item, ChatMessage):
            return

        content = item.text_content or ""
        content = content.strip()
        if not content:
            return

        role = "candidate" if item.role == "user" else "ai_agent"
        asyncio.create_task(interviewer.record_transcript(role, content))

    @session.on("close")
    def _on_close(ev: CloseEvent) -> None:
        close_reason = getattr(ev.reason, "value", ev.reason)
        logger.info(
            f"Session closed for room: {ctx.room.name}, reason: {close_reason}"
        )
        # Sync remaining transcript from session history
        for item in session.history.items:
            if item.type == "message":
                role = "candidate" if item.role == "user" else "ai_agent"
                content = item.text_content
                if content and content.strip():
                    asyncio.create_task(
                        interviewer.record_transcript(role, content.strip())
                    )

        try:
            get_job_context().shutdown(reason=close_reason)
        except Exception as exc:
            logger.warning(f"Failed to shutdown job context: {exc}")

    # 6. Shutdown callback for final status sync
    async def on_shutdown() -> None:
        if not session_started:
            return
        logger.info(f"Session finished for room: {ctx.room.name}")
        logger.info(f"Usage: {session.usage}")

    ctx.add_shutdown_callback(on_shutdown)

    # Establish the room connection up front so the greeting and first audio turn
    # don't race the agent connection handshake.
    await ctx.connect(auto_subscribe=AutoSubscribe.SUBSCRIBE_ALL)
    ctx.room.register_text_stream_handler("lk.chat", lambda reader, participant_identity: asyncio.create_task(_handle_text_stream(reader, participant_identity)))

    # 7. Start the Session (no ctx.connect() needed - handled by session.start)
    try:
        session_started = True
        # Mark interview as active only after the agent has a live room connection.
        await _update_backend_status(ctx.room.name, "in_progress")
        room_options = room_io.RoomOptions(
            text_input=False,
            text_output=room_io.TextOutputOptions(sync_transcription=False),
            participant_identity=str(agent_context.get("participantIdentity") or "").strip() or None,
            close_on_disconnect=False,
        )
        await session.start(
            agent=interviewer,
            room=ctx.room,
            room_options=room_options,
        )
    except Exception:
        session_started = False
        logger.exception("Failed to start LiveKit session for room %s", ctx.room.name)
        await _update_backend_status(ctx.room.name, "interrupted")
        raise

    # NO busy-wait loop needed - framework manages lifecycle automatically


if __name__ == "__main__":
    cli.run_app(server)
