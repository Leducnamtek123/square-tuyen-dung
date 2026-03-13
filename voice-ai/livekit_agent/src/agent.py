import asyncio
import logging
import httpx

from livekit import rtc
from livekit.agents import (
    AgentSession,
    JobContext,
    JobProcess,
    WorkerOptions,
    cli,
)
from livekit.plugins import silero, openai
from livekit.plugins.turn_detector.multilingual import MultilingualModel

from .config import config
from .prompts import DEFAULT_GREETING
from .interviewer import Interviewer
from .session_settings import build_session_kwargs
from .preemptive_policy import should_enable_preemptive

logger = logging.getLogger("agent")

async def _update_backend_status(room_name: str, status: str):
    try:
        async with httpx.AsyncClient() as client:
            url = f"{config.BACKEND_API_URL}/interviews/{room_name}/status"
            resp = await client.patch(url, json={"status": status}, timeout=5.0)
            if resp.status_code == 200:
                logger.info("Successfully updated backend status to '%s'", status)
    except Exception as e:
        logger.error("Error updating backend status: %s", e)

async def _set_stage(room: rtc.Room, stage: str):
    logger.info(">>> STAGE CHANGED: %s", stage)
    try:
        # Note: Set metadata on the room or local participant
        # In newer versions, we might use room.local_participant.set_metadata
        await room.local_participant.set_metadata(f"STAGE:{stage}")
    except Exception as e:
        logger.warning("Could not set stage metadata: %s", e)

def prewarm(proc: JobProcess):
    # We disable prewarm to ensure process stability. 
    # Loading models in prewarm can sometimes cause IPC crashes (DuplexClosed).
    pass

async def entrypoint(ctx: JobContext):
    ctx.log_context_fields = {"room": ctx.room.name}
    logger.info("Starting square-ai-interviewer for room: %s", ctx.room.name)
    session = None

    try:
        # 1. Connect to LiveKit Room
        await ctx.connect()
        logger.info("Connected to room: %s", ctx.room.name)

        # 2. Fetch context from backend
        interview_context = None
        try:
            async with httpx.AsyncClient() as client:
                context_url = f"{config.BACKEND_API_URL}/interviews/{ctx.room.name}/context"
                resp = await client.get(context_url, timeout=10.0)
                if resp.status_code == 200:
                    interview_context = resp.json()
                    logger.info("Fetched context for candidate: %s", interview_context.get("candidateName"))
        except Exception as e:
            logger.warning("Could not fetch interview context: %s", e)

        # 3. Build Greeting + Agent Context
        greeting = DEFAULT_GREETING
        agent_context = {
            "backendApiUrl": config.BACKEND_API_URL,
            "roomName": ctx.room.name,
        }
        if interview_context:
            name = interview_context.get("candidateName") or "Ứng viên"
            job_title = interview_context.get("jobTitle") or "vị trí phỏng vấn"
            agent_context.update(interview_context)
            greeting = (
                f"Xin chào {name}! Tôi là người phỏng vấn từ Hệ thống Phỏng vấn trực "
                f"tuyến. Rất vui được gặp bạn trong buổi phỏng vấn cho vị trí "
                f"{job_title} hôm nay. Bạn có thể bắt đầu bằng cách giới thiệu "
                f"ngắn gọn về bản thân mình được không?"
            )
        # 4. Initialize Models
        stt_model = openai.STT(
            base_url=config.stt_base_url, 
            api_key=config.STT_API_KEY,
            model=config.stt_model,
            language=config.STT_LANGUAGE
        )
        llm_model = openai.LLM(
            base_url=config.LLAMA_BASE_URL,
            api_key="no-key-needed",
            model=config.LLAMA_MODEL, 
        )
        tts_model = openai.TTS(
            base_url=config.TTS_BASE_URL, 
            api_key=config.TTS_API_KEY,
            model=config.TTS_MODEL,
            voice=config.TTS_VOICE,
            instructions="Nói tiếng Việt, giọng rõ ràng, thân thiện."
        )

        # 5. Create AgentSession following 1.4.x / LIVIKIT_AGENTS_DOCS.md style
        # Load VAD here instead of prewarm for better stability
        vad_model = silero.VAD.load()
        
        try:
            device_turn_detector = MultilingualModel()
        except Exception as e:
            logger.warning("MultilingualModel load failed, falling back to default: %s", e)
            device_turn_detector = None # Will fallback to VAD-based

        session = AgentSession(
            stt=stt_model,
            llm=llm_model,
            tts=tts_model,
            vad=vad_model,
            turn_detection=device_turn_detector,
            **build_session_kwargs(),
        )
        
        # 6. Start session with the Interviewer agent
        await session.start(
            room=ctx.room,
            agent=Interviewer(context=agent_context)
        )
        try:
            await ctx.room.local_participant.set_attributes({
                "lk.agent.state": "listening",
            })
        except Exception as e:
            logger.warning("Could not set agent state attribute: %s", e)
        if config.PREEMPTIVE_GATING and config.PREEMPTIVE_GENERATION:
            session.options.preemptive_generation = False

            def _handle_transcript(ev):
                if ev.is_final:
                    session.options.preemptive_generation = False
                    return
                session.options.preemptive_generation = should_enable_preemptive(
                    ev.transcript,
                    min_words=config.PREEMPTIVE_MIN_WORDS,
                    min_chars=config.PREEMPTIVE_MIN_CHARS,
                )

            session.on("user_input_transcribed", _handle_transcript)
        
        # 7. Post-start actions
        await _update_backend_status(ctx.room.name, "in_progress")
        await _set_stage(ctx.room, "INTRODUCTION")
        
        logger.info("Greeting user: %s", greeting)
        try:
            await ctx.room.local_participant.set_attributes({
                "lk.agent.state": "speaking",
            })
        except Exception as e:
            logger.warning("Could not set agent state to speaking: %s", e)
        # Generate initial response
        await session.say(greeting, allow_interruptions=True)
        try:
            await ctx.room.local_participant.set_attributes({
                "lk.agent.state": "listening",
            })
        except Exception as e:
            logger.warning("Could not set agent state to listening: %s", e)

        # 8. Keep alive while room is connected
        while ctx.room.isconnected:
            await asyncio.sleep(1)
        
    except Exception as e:
        logger.error("CRITICAL ERROR in interview_agent: %s", e, exc_info=True)
    finally:
        if session is not None:
            await session.aclose()
        logger.info("Job finished for room: %s", ctx.room.name)

if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint, prewarm_fnc=prewarm, agent_name="square-ai-interviewer"))
