import asyncio
import logging
import httpx
import openai as openai_lib
from typing import Any

from livekit import rtc
from livekit.agents import (
    Agent,
    JobContext,
    JobProcess,
    RunContext,
    WorkerOptions,
    cli,
    function_tool,
    AgentSession,
)
from livekit.plugins import silero, openai

from .config import config
from .prompts import INTERVIEWER_INSTRUCTIONS, DEFAULT_GREETING

logger = logging.getLogger("agent")

# Stages match frontend INTERVIEW_STAGES exactly
STAGES = ["INTRODUCTION", "EXPERIENCE", "TECHNICAL", "Q_AND_A", "CLOSING"]


class InterviewerAgent(Agent):
    def __init__(self, room: rtc.Room, context: dict[str, Any] | None = None) -> None:
        self.room = room
        self._context = context
        self.current_stage = "INTRODUCTION"
        self.current_question_index = 0
        self.user_turn_count = 0
        self.total_questions = 0
        
        instructions = INTERVIEWER_INSTRUCTIONS
        if context:
            candidate_name = context.get("candidateName") or "Ứng viên"
            job_title = context.get("jobTitle") or "Vị trí phỏng vấn"
            
            instructions += f"\n\nTHÔNG TIN BUỔI PHỎNG VẤN:\n- Ứng viên: {candidate_name}\n- Vị trí: {job_title}\n"
            
            questions = context.get("questions", [])
            self.total_questions = len(questions)
            if questions:
                instructions += "\nDANH SÁCH CÂU HỎI PHỎNG VẤN (Hỏi lần lượt từng câu):\n"
                for i, q in enumerate(questions, 1):
                    q_text = str(q.get("text") if isinstance(q, dict) else q)
                    instructions += f"{i}. {q_text}\n"
                instructions += f"\nTổng cộng: {len(questions)} câu hỏi. Hỏi theo thứ tự, mỗi lần MỘT câu.\n"
            else:
                instructions += "\nKhông có câu hỏi định sẵn. Hãy tự tạo 3-5 câu hỏi phù hợp với vị trí công việc.\n"
                self.total_questions = 4  # fallback estimate
        
        self._base_instructions = instructions
        super().__init__(instructions=instructions)

    async def _set_stage(self, stage: str):
        """Chuyển giai đoạn phỏng vấn và đồng bộ lên frontend qua metadata."""
        if stage == self.current_stage:
            return
        self.current_stage = stage
        logger.info(">>> STAGE CHANGED: %s (turn=%d, q_index=%d)", 
                     stage, self.user_turn_count, self.current_question_index)
        try:
            await self.room.local_participant.set_metadata(f"STAGE:{stage}")
        except Exception as e:
            logger.warning("Could not set stage metadata: %s", e)

    async def on_user_turn(self):
        """Tự động chuyển stage dựa trên số lượt user trả lời."""
        self.user_turn_count += 1
        logger.info("User turn #%d (total_questions=%d)", self.user_turn_count, self.total_questions)
        
        if self.user_turn_count == 1:
            # User vừa tự giới thiệu xong → chuyển sang hỏi kinh nghiệm
            await self._set_stage("EXPERIENCE")
        elif self.user_turn_count == 2:
            # Đã hỏi kinh nghiệm → chuyển sang kỹ thuật
            await self._set_stage("TECHNICAL")
        elif self.user_turn_count >= self.total_questions + 1:
            # Đã xong hết câu hỏi → Hỏi đáp
            await self._set_stage("Q_AND_A")
        elif self.user_turn_count >= self.total_questions + 2:
            # Q&A xong → Kết thúc
            await self._set_stage("CLOSING")

    async def _update_backend_status(self, status: str):
        """Cập nhật trạng thái buổi phỏng vấn lên backend."""
        try:
            async with httpx.AsyncClient() as client:
                url = f"{config.BACKEND_API_URL}/web/sessions/{self.room.name}/update-status/"
                resp = await client.patch(url, json={"status": status}, timeout=5.0)
                if resp.status_code == 200:
                    logger.info("Đã đồng bộ trạng thái '%s' lên backend.", status)
                else:
                    logger.warning("Backend status update failed: %s (%d)", resp.text, resp.status_code)
        except Exception as e:
            logger.error("Error updating backend status: %s", e)

    async def _append_transcription(self, role: str, content: str):
        """Gửi transcript hội thoại lên backend."""
        try:
            async with httpx.AsyncClient() as client:
                url = f"{config.BACKEND_API_URL}/web/sessions/{self.room.name}/append-transcription/"
                data = {
                    "speaker_role": "ai_agent" if role == "interviewer" else "candidate",
                    "content": content
                }
                resp = await client.post(url, json=data, timeout=5.0)
                if resp.status_code == 201:
                    logger.debug("Đã gửi transcript: %s", content[:50])
                else:
                    logger.warning("Failed to append transcript: %d", resp.status_code)
        except Exception as e:
            logger.error("Error appending transcript: %s", e)

    @function_tool()
    async def set_interview_stage(
        self,
        ctx: RunContext,
        stage_name: str,
    ) -> str:
        """Cập nhật giai đoạn hiện tại của buổi phỏng vấn.
        
        Args:
            stage_name: Tên giai đoạn (introduction, experience, technical, q_and_a, closing).
        """
        await self._set_stage(stage_name.upper())
        return f"Giai đoạn đã được chuyển sang {stage_name}."

    @function_tool()
    async def mark_question_answered(
        self,
        ctx: RunContext,
        question_index: int,
    ) -> str:
        """Đánh dấu một câu hỏi đã được trả lời xong.
        
        Args:
            question_index: Số thứ tự của câu hỏi (1-indexed).
        """
        self.current_question_index = question_index
        logger.info("Question %d marked as answered", question_index)
        return f"Đã ghi nhận hoàn thành câu hỏi số {question_index}."

    @function_tool()
    async def complete_interview(
        self,
        ctx: RunContext,
    ) -> str:
        """Kết thúc buổi phỏng vấn chính thức.
        Chỉ gọi khi bạn đã chào tạm biệt ứng viên.
        """
        await self._set_stage("CLOSING")
        await self._update_backend_status("completed")
        return "Buổi phỏng vấn đã hoàn thành."

    async def greet_candidate(self, session: AgentSession) -> None:
        """Greeting initial and sync status."""
        await self._update_backend_status("in_progress")
        await self._set_stage("INTRODUCTION")
        
        if self._context:
            name = self._context.get("candidateName") or "bạn"
            title = self._context.get("jobTitle") or "vị trí công việc"
            greeting = (
                f"Xin chào {name}! Tôi là người phỏng vấn từ Hệ thống Phỏng vấn trực tuyến. "
                f"Rất vui được gặp bạn trong buổi phỏng vấn cho vị trí {title} hôm nay. "
                f"Bạn có thể bắt đầu bằng cách giới thiệu ngắn gọn về bản thân mình được không?"
            )
        else:
            greeting = DEFAULT_GREETING
            
        logger.info("Greeting user: %s", greeting)
        session.say(greeting, allow_interruptions=False)


def prewarm(proc: JobProcess):
    proc.userdata["vad"] = silero.VAD.load()

async def entrypoint(ctx: JobContext):
    ctx.log_context_fields = {
        "room": ctx.room.name,
    }
    logger.info("Starting interview_agent for room: %s", ctx.room.name)
    
    try:
        await ctx.connect()
        logger.info("Connected to room: %s", ctx.room.name)

        # Fetch interview context from backend
        interview_context = None
        try:
            async with httpx.AsyncClient() as client:
                context_url = f"{config.BACKEND_API_URL}/web/sessions/{ctx.room.name}/context/"
                resp = await client.get(context_url, timeout=5.0)
                if resp.status_code == 200:
                    interview_context = resp.json()
                    logger.info("Fetched context for candidate: %s", 
                                interview_context.get("candidateName", "Unknown"))
                else:
                    logger.warning("Context API returned %d: %s", resp.status_code, resp.text)
        except Exception as e:
            logger.warning("Could not fetch interview context: %s", e)

        # Create interviewer agent
        interviewer = InterviewerAgent(room=ctx.room, context=interview_context)

        # Components with custom timeout to prevent APITimeoutError
        http_client = httpx.AsyncClient(timeout=httpx.Timeout(300.0, connect=10.0))

        stt_model = openai.STT(
            client=openai_lib.AsyncClient(
                api_key=config.STT_API_KEY,
                base_url=config.stt_base_url,
                http_client=http_client
            ),
            model=config.stt_model,
            language=config.STT_LANGUAGE,
        )
        llm_model = openai.LLM(
            api_key="no-key-needed",
            base_url=config.LLAMA_BASE_URL,
            model=config.LLAMA_MODEL,
            temperature=0.7,
            timeout=httpx.Timeout(300.0, connect=10.0)
        )
        tts_model = openai.TTS(
            client=openai_lib.AsyncClient(
                api_key="no-key-needed",
                base_url=config.TTS_BASE_URL,
                http_client=http_client
            ),
            model=config.TTS_MODEL,
            voice=config.TTS_VOICE,
        )

        # Use AgentSession for session management (Standard in 1.3.x)
        session = AgentSession(
            stt=stt_model,
            llm=llm_model,
            tts=tts_model,
            vad=ctx.proc.userdata["vad"],
        )

        @session.on("user_speech_finished")
        def on_user_speech(event: openai.UserSpeechFinished):
            if event.transcript:
                asyncio.create_task(interviewer._append_transcription("candidate", event.transcript))

        @session.on("agent_speech_finished")
        def on_agent_speech(event: openai.AgentSpeechFinished):
            if event.transcript:
                asyncio.create_task(interviewer._append_transcription("interviewer", event.transcript))

        async def start_session_logic():
            await asyncio.sleep(2.0)
            await interviewer.greet_candidate(session)

        # Start the context and keep the session alive
        await session.start(agent=interviewer, room=ctx.room)
        asyncio.ensure_future(start_session_logic())

        # Keep alive
        while ctx.room.is_connected:
            await asyncio.sleep(1)

        logger.info("Room disconnected, closing job.")

    except Exception as e:
        logger.error("CRITICAL ERROR in entrypoint: %s", e, exc_info=True)
    finally:
        logger.info("Agent process for room %s shut down", ctx.room.name)

if __name__ == "__main__":
    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint,
            prewarm_fnc=prewarm,
            agent_name="square-ai-interviewer",
        )
    )
