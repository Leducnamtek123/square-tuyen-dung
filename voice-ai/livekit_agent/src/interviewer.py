import asyncio
import logging
import httpx
from enum import Enum, auto
from typing import Any

from livekit.agents import (
    Agent,
    RunContext,
    StopResponse,
    function_tool,
)

from .config import config
from .interview_flow import decide_next_action, parse_question_payload
from .prompts import INTERVIEWER_INSTRUCTIONS, DEFAULT_GREETING

logger = logging.getLogger("interviewer")

class InterviewStage(Enum):
    INTRODUCTION = auto()
    EXPERIENCE = auto()
    TECHNICAL = auto()
    Q_AND_A = auto()
    CLOSING = auto()

class Interviewer(Agent):
    def __init__(self, context: dict[str, Any] | None = None) -> None:
        instructions = INTERVIEWER_INSTRUCTIONS
        if context:
            candidate_name = context.get("candidateName", "Ứng viên")
            job_title = context.get("jobTitle", "Vị trí này")
            job_desc = context.get("jobDescription", "")
            instructions += f"\n\nThông tin ngữ cảnh:\n- Ứng viên: {candidate_name}\n- Vị trí: {job_title}\n- Mô tả công việc: {job_desc}"

        super().__init__(
            instructions=instructions,
        )
        self._context = context
        self._backend_api_url = None
        self._room_name = None
        if context:
            self._backend_api_url = context.get("backendApiUrl")
            self._room_name = context.get("roomName")
        self._current_stage = InterviewStage.INTRODUCTION
        self._history: list[dict[str, str]] = []
        self._completed = False

    @property
    def current_stage(self) -> InterviewStage:
        return self._current_stage

    @function_tool
    async def set_interview_stage(
        self,
        context: RunContext,
        stage_name: str,
    ) -> str:
        """Update the current stage of the interview.
        
        Args:
            stage_name: The name of the stage (introduction, experience, technical, q_and_a, closing).
        """
        try:
            new_stage = InterviewStage[stage_name.upper()]
            self._current_stage = new_stage
            logger.info("Interview stage changed to: %s", self._current_stage)
            
            # Sync to room metadata for frontend UI
            if context.room:
                await context.room.local_participant.set_metadata(new_stage.name)
            
            msg = f"Interview stage updated to {stage_name}."
            if new_stage == InterviewStage.TECHNICAL:
                msg += " You should now call `get_next_question()` immediately to start the technical section."
                
            return msg
        except KeyError:
            return f"Invalid stage name: {stage_name}."

    @function_tool
    async def get_interview_progress(
        self,
        context: RunContext,
    ) -> str:
        """Get the current progress of the interview."""
        return f"Currently in the {self._current_stage.name} stage."

    async def _fetch_next_question(self, advance: bool = True) -> dict:
        if advance is None:
            advance = True
        if not self._backend_api_url or not self._room_name:
            return {"error": "missing_backend_context"}

        url = f"{self._backend_api_url}/interviews/{self._room_name}/next-question"
        try:
            async with httpx.AsyncClient() as client:
                resp = await client.post(url, json={"advance": advance}, timeout=5.0)
            if resp.status_code != 200:
                return {"error": "backend_error", "status": resp.status_code}
            return resp.json()
        except Exception as exc:
            logger.warning("get_next_question failed: %s", exc)
            return {"error": "request_failed", "detail": str(exc)}

    @function_tool
    async def get_next_question(
        self,
        context: RunContext,
    ) -> str:
        """Fetch the next primary interview question from the backend database.
        Use this when you are ready to move to the next technical or structured question.
        """
        logger.info("get_next_question called by LLM")
        payload = await self._fetch_next_question(advance=True)
        if isinstance(payload, dict):
            if payload.get("done"):
                return "Hệ thống báo rằng đã hết câu hỏi trong danh sách. Bạn hãy chuyển sang phần hỏi đáp (Q&A) hoặc kết thúc phỏng vấn."
            question = payload.get("question")
            if question and "text" in question:
                self._current_stage = InterviewStage.TECHNICAL
                # Sync metadata to room for frontend UI
                if context.room:
                    try:
                        await context.room.local_participant.set_metadata(InterviewStage.TECHNICAL.name)
                    except Exception as e:
                        logger.warning("Could not set stage metadata in get_next_question: %s", e)
                
                return f"Câu hỏi tiếp theo từ hệ thống là: {question['text']}"
        return "Không thể lấy câu hỏi lúc này. Hãy thử đặt một câu hỏi của riêng bạn hoặc kết thúc phỏng vấn."

    @function_tool
    async def finish_interview(
        self,
        context: RunContext,
    ) -> str:
        """Finish the interview session. This will trigger the final evaluation and scoring.
        Call this ONLY when you have completed all stages of the interview and said goodbye to the candidate.
        """
        if self._completed:
            return "Interview is already finished."

        self._current_stage = InterviewStage.CLOSING
        self._completed = True
        
        # Update backend status to trigger evaluation
        asyncio.create_task(self._update_backend_status("completed"))
        
        # Shutdown session after a short delay to allow last words to play
        if self.session:
            async def shutdown_after_delay():
                await asyncio.sleep(2)
                if self.session:
                    self.session.shutdown(drain=True)
            asyncio.create_task(shutdown_after_delay())
            
        return "Buổi phỏng vấn đã được đánh dấu là hoàn thành. Hệ thống đang tiến hành chấm điểm."

    async def get_initial_greeting(self) -> str:
        if self._context:
            name = self._context.get("candidateName", "bạn")
            title = self._context.get("jobTitle", "vị trí công việc")
            return f"Chào {name}! Tôi là trợ lý Phỏng vấn trực tuyến. Hôm nay tôi sẽ đồng hành cùng bạn trong buổi phỏng vấn cho {title}. Bạn đã sẵn sàng chưa?"
        return DEFAULT_GREETING

    async def _update_backend_status(self, status: str) -> None:
        if not self._backend_api_url or not self._room_name:
            return
        try:
            async with httpx.AsyncClient() as client:
                url = f"{self._backend_api_url}/interviews/{self._room_name}/status"
                await client.patch(url, json={"status": status}, timeout=5.0)
        except Exception as exc:
            logger.warning("update_backend_status failed: %s", exc)

    async def _append_transcript(
        self,
        speaker_role: str,
        content: str,
        speech_duration_ms: int | None = None,
    ) -> None:
        if not self._backend_api_url or not self._room_name:
            return
        if not content:
            return
        try:
            payload: dict[str, Any] = {
                "speaker_role": speaker_role,
                "content": content,
            }
            if speech_duration_ms is not None:
                payload["speech_duration_ms"] = int(speech_duration_ms)
            async with httpx.AsyncClient() as client:
                url = f"{self._backend_api_url}/interviews/{self._room_name}/append-transcription"
                await client.post(url, json=payload, timeout=5.0)
        except Exception as exc:
            logger.warning("append_transcript failed: %s", exc)

    def _extract_message_text(self, new_message: Any) -> str:
        if new_message is None:
            return ""
        if isinstance(new_message, str):
            return new_message
        if isinstance(new_message, dict):
            for key in ("text", "message", "content"):
                value = new_message.get(key)
                if isinstance(value, str) and value.strip():
                    return value
            return ""
        for attr in ("text", "message", "content"):
            value = getattr(new_message, attr, None)
            if isinstance(value, str) and value.strip():
                return value
        return ""

    async def _say_and_wait(self, text: str, *, allow_interruptions: bool = True) -> None:
        handle = self.session.say(text, allow_interruptions=allow_interruptions)
        await handle.wait_for_playout()
        asyncio.create_task(self._append_transcript("ai_agent", text))

    async def on_user_turn_completed(self, turn_ctx, new_message) -> None:  # type: ignore[override]
        if self._completed:
            if config.AUTO_END_ON_COMPLETION:
                raise StopResponse()
            return
        if not self._backend_api_url or not self._room_name:
            return
        text = self._extract_message_text(new_message)
        if text:
            # Only append transcript, don't force next question.
            # Let the LLM decide what to do next (acknowledge, follow up, or call tool).
            asyncio.create_task(self._append_transcript("candidate", text))

