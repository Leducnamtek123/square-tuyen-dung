import asyncio
import logging
import httpx

from livekit import rtc
from livekit.agents import (
    Agent,
    AgentSession,
    JobContext,
    JobProcess,
    WorkerOptions,
    cli,
)
from livekit.plugins import silero, openai
from livekit.plugins.turn_detector.multilingual import MultilingualModel

from .config import config
from .prompts import INTERVIEWER_INSTRUCTIONS, DEFAULT_GREETING

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

class Interviewer(Agent):
    def __init__(self, instructions: str):
        super().__init__(
            instructions=instructions,
        )

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

        # 3. Build Instructions & Greeting
        instructions = INTERVIEWER_INSTRUCTIONS
        greeting = DEFAULT_GREETING
        if interview_context:
            name = interview_context.get("candidateName") or "Ứng viên"
            job_title = interview_context.get("jobTitle") or "vị trí phỏng vấn"
            instructions += f"\n\nTHÔNG TIN BUỔI PHỎNG VẤN:\n- Ứng viên: {name}\n- Vị trí: {job_title}\n"
            questions = interview_context.get("questions", [])
            if questions:
                questions_text = "\n".join(f"- {str(q.get('text') if isinstance(q, dict) else q)}" for q in questions)
                instructions += f"\nDANH SÁCH CÂU HỎI:\n{questions_text}\n"
            greeting = f"Xin chào {name}! Tôi là người phỏng vấn từ Hệ thống Phỏng vấn trực tuyến. Rất vui được gặp bạn trong buổi phỏng vấn cho vị trí {job_title} hôm nay. Bạn có thể bắt đầu bằng cách giới thiệu ngắn gọn về bản thân mình được không?"

        # 4. Initialize Models
        stt_model = openai.STT(
            base_url=config.stt_base_url, 
            api_key=config.STT_API_KEY,
            language="vi"
        )
        llm_model = openai.LLM(
            base_url=config.LLAMA_BASE_URL,
            api_key="no-key-needed",
            model=config.LLAMA_MODEL, 
        )
        tts_model = openai.TTS(
            base_url=config.TTS_BASE_URL, 
            api_key=config.TTS_API_KEY,
            model=config.TTS_MODEL
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
        )
        
        # 6. Start session with the Interviewer agent
        await session.start(
            room=ctx.room,
            agent=Interviewer(instructions=instructions)
        )
        
        # 7. Post-start actions
        await _update_backend_status(ctx.room.name, "in_progress")
        await _set_stage(ctx.room, "INTRODUCTION")
        
        logger.info("Greeting user: %s", greeting)
        # Generate initial response
        await session.say(greeting, allow_interruptions=False)

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
