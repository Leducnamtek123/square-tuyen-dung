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
import openai as openai_lib # Base library for AsyncOpenAI client config
from livekit.plugins.turn_detector.multilingual import MultilingualModel

from .config import config
from .prompts import DEFAULT_GREETING
from .interviewer import Interviewer
from .session_settings import build_session_kwargs
from .preemptive_policy import should_enable_preemptive

logger = logging.getLogger("agent")

# Global HTTP client for connection pooling
# This avoids the overhead of creating/closing connections for every API call.
HTTP_CLIENT = httpx.AsyncClient(timeout=httpx.Timeout(60.0, connect=5.0))

async def _update_backend_status(room_name: str, status: str):
    try:
        url = f"{config.BACKEND_API_URL}/v1/interview/compat/{room_name}/status"
        resp = await HTTP_CLIENT.patch(url, json={"status": status})
        resp.raise_for_status()
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

        # 2. Fetch context from backend (using compatibility endpoint)
        interview_context = None
        try:
            context_url = f"{config.BACKEND_API_URL}/v1/interview/compat/{ctx.room.name}/context"
            resp = await HTTP_CLIENT.get(context_url)
            resp.raise_for_status()
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
            client=openai_lib.AsyncOpenAI(
                api_key=config.STT_API_KEY,
                base_url=config.stt_base_url,
                http_client=httpx.AsyncClient(timeout=httpx.Timeout(120.0, connect=10.0))
            ),
            model=config.stt_model,
            language=config.STT_LANGUAGE
        )
        llm_model = openai.LLM(
            # Using client parameter to customize timeout for llama-cpp 14B
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

        # 5. Create AgentSession following 1.4.x / LIVIKIT_AGENTS_DOCS.md style
        # Load VAD here via asyncio.to_thread to prevent blocking the event loop
        vad_model = await asyncio.to_thread(silero.VAD.load)
        
        # Using a simpler VAD-based turn detector for better reliability in single-language mode
        # This fixes the ImportError: cannot import name 'turn_detector' from 'livekit.agents'
        # In newer versions, it's located in livekit.plugins.turn_detector
        try:
            from livekit.plugins.turn_detector import VADBasedTurnDetector
        except ImportError:
            from livekit.agents.turn_detector import VADBasedTurnDetector
            
        device_turn_detector = VADBasedTurnDetector(
            vad=vad_model,
            min_endpointing_delay=config.MIN_ENDPOINTING_DELAY,
            max_endpointing_delay=config.MAX_ENDPOINTING_DELAY,
        )

        session = AgentSession(
            stt=stt_model,
            llm=llm_model,
            tts=tts_model,
            vad=vad_model,
            turn_detection=device_turn_detector,
            **build_session_kwargs(),
        )
        
        # 6. Start session with the Interviewer agent
        interviewer_agent = Interviewer(context=agent_context)
        await session.start(
            room=ctx.room,
            agent=interviewer_agent
        )

        # 6.2 Debugging: Update agent metadata when we hear something to see it in the UI
        def _on_debug_transcript(ev):
            if ev.transcript:
                asyncio.create_task(ctx.room.local_participant.set_attributes({
                    "lk.agent.last_heard": ev.transcript[:60] + ("..." if len(ev.transcript) > 60 else "")
                }))
        session.on("user_input_transcribed", _on_debug_transcript)

        # 6.5. Attach transcript listeners for history persistence
        # This ensures every turn is saved to the backend database.
        def _on_history_added(ev):
            # ev is a ConversationItemAddedEvent which contains the 'item'
            item = ev.item
            role = "candidate" if item.role == "user" else "ai_agent"
            
            # item.content can be str or List[ContentPart] in livekit-agents 1.4+
            content = ""
            if isinstance(item.content, str):
                content = item.content
            elif isinstance(item.content, list):
                # Join text from all content parts that have a 'text' attribute
                content = "".join([getattr(c, 'text', '') for c in item.content])
            
            if content and content.strip():
                # We use the interviewer instance's method to append transcript
                asyncio.create_task(interviewer_agent._append_transcript(role, content.strip()))

        session.on("conversation_item_added", _on_history_added)

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
        # The 'conversation_item_added' event will handle saving this to the backend.
        await session.say(greeting, allow_interruptions=True)
        
        try:
            await ctx.room.local_participant.set_attributes({
                "lk.agent.state": "listening",
            })
        except Exception as e:
            logger.warning("Could not set agent state to listening: %s", e)

        # 8. Keep alive while room is connected without polling
        disconnect_event = asyncio.Event()
        ctx.room.on("disconnected", disconnect_event.set)
        await disconnect_event.wait()
        
    except Exception as e:
        logger.error("CRITICAL ERROR in interview_agent: %s", e, exc_info=True)
    finally:
        if session is not None:
            await session.aclose()
        # Ensure status is 'completed' if job finishes normally
        await _update_backend_status(ctx.room.name, "completed")
        logger.info("Job finished for room: %s", ctx.room.name)

if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint, prewarm_fnc=prewarm, agent_name="square-ai-interviewer"))
