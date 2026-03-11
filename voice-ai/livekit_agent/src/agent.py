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
        await room.local_participant.set_metadata(f"STAGE:{stage}")
    except Exception as e:
        logger.warning("Could not set stage metadata: %s", e)

def prewarm(proc: JobProcess):
    proc.userdata["vad"] = silero.VAD.load()

async def entrypoint(ctx: JobContext):
    ctx.log_context_fields = {"room": ctx.room.name}
    logger.info("Starting interview_agent for room: %s", ctx.room.name)
    session = None

    try:
        await ctx.connect()
        logger.info("Connected to room: %s", ctx.room.name)

        # Fetch context
        interview_context = None
        try:
            async with httpx.AsyncClient() as client:
                context_url = f"{config.BACKEND_API_URL}/interviews/{ctx.room.name}/context"
                resp = await client.get(context_url, timeout=5.0)
                if resp.status_code == 200:
                    interview_context = resp.json()
                    logger.info("Fetched context for candidate: %s", interview_context.get("candidateName"))
        except Exception as e:
            logger.warning("Could not fetch interview context: %s", e)

        # Build Instructions & Greeting
        instructions = INTERVIEWER_INSTRUCTIONS
        greeting = DEFAULT_GREETING
        if interview_context:
            name = interview_context.get("candidateName") or "Ứng viên"
            job_title = interview_context.get("jobTitle") or "vị trí phỏng vấn"
            instructions += f"\n\nTHÔNG TIN BUỔI PHỎNG VẤN:\n- Ứng viên: {name}\n- Vị trí: {job_title}\n"
            questions = interview_context.get("questions", [])
            if questions:
                # Format questions list
                questions_text = "\n".join(f"- {str(q.get('text') if isinstance(q, dict) else q)}" for q in questions)
                instructions += f"\nDANH SÁCH CÂU HỎI:\n{questions_text}\n"
            greeting = f"Xin chào {name}! Tôi là người phỏng vấn từ Hệ thống Phỏng vấn trực tuyến. Rất vui được gặp bạn trong buổi phỏng vấn cho vị trí {job_title} hôm nay. Bạn có thể bắt đầu bằng cách giới thiệu ngắn gọn về bản thân mình được không?"

        # Components
        stt_model = openai.STT(base_url=config.stt_base_url, api_key="no-key-needed")
        llm_model = openai.LLM(
            base_url=config.LLAMA_BASE_URL,
            api_key="no-key-needed",
            model=config.LLAMA_MODEL, 
            temperature=0.7,
        )
        tts_model = openai.TTS(base_url=config.TTS_BASE_URL, api_key=config.TTS_API_KEY)

        # Agent with models
        agent = Agent(
            instructions=instructions,
            vad=ctx.proc.userdata["vad"],
            stt=stt_model,
            llm=llm_model,
            tts=tts_model,
        )

        session = AgentSession()
        await session.start(agent, room=ctx.room)
        
        await _update_backend_status(ctx.room.name, "in_progress")
        await _set_stage(ctx.room, "INTRODUCTION")
        
        logger.info("Greeting user: %s", greeting)
        await session.say(greeting, allow_interruptions=False)

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
