import asyncio
import logging
import httpx
from enum import Enum, auto
from typing import Any

from livekit.agents import Agent, RunContext
from livekit.agents.llm import function_tool
from livekit.agents.job import get_job_context

from .config import config
from .interview_flow import parse_question_payload
from .prompts import INTERVIEWER_INSTRUCTIONS

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
            instructions += (
                f"\n\nThông tin ngữ cảnh:\n"
                f"- Ứng viên: {candidate_name}\n"
                f"- Vị trí: {job_title}\n"
                f"- Mô tả công việc: {job_desc}\n"
            )
            
            questions = context.get("questions", [])
            if questions:
                q_text = ""
                total_q = len(questions)
                for i, q in enumerate(questions, 1):
                    q_text += f"{i}. {q.get('text', '')}\n"
                instructions += (
                    f"\nDANH SÁCH {total_q} CÂU HỎI BẮT BUỘC PHẢI HỎI THEO THỨ TỰ TỪ 1 ĐẾN {total_q}:\n{q_text}\n"
                    f"Khi phần phỏng vấn kỹ thuật bắt đầu, hãy tự động lấy câu hỏi ở đây ra hỏi lần lượt từng câu một, KHÔNG tự chế câu hỏi."
                )

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

    async def on_enter(self) -> None:
        """Called when the agent joins the session. Triggers the initial greeting."""
        logger.info("Interviewer agent entered session. Generating initial greeting...")
        candidate_name = "ứng viên"
        job_title = "vị trí này"
        if self._context:
            candidate_name = self._context.get("candidateName", "ứng viên")
            job_title = self._context.get("jobTitle", "vị trí này")

        self.session.generate_reply(
            instructions=(
                f"Hãy chào đón ứng viên {candidate_name} một cách nồng nhiệt "
                f"và giới thiệu về buổi phỏng vấn vị trí {job_title}."
            )
        )

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
            try:
                job_ctx = get_job_context()
                await job_ctx.room.local_participant.set_metadata(
                    f"STAGE:{new_stage.name}"
                )
            except Exception as e:
                logger.warning("Could not update room metadata: %s", e)

            msg = f"Interview stage updated to {stage_name}."
            if new_stage == InterviewStage.TECHNICAL:
                msg += " System: Start asking the listed questions strictly and chronologically now."

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

    # Tool get_next_question has been removed for low-latency zero-tool architecture

    @function_tool
    async def finish_interview(
        self,
        context: RunContext,
    ) -> str:
        """End the interview session definitely.
        Only call this when the farewell is complete or candidate wants to leave.
        This will trigger the final evaluation on the backend.
        """
        self._completed = True
        logger.info("Finishing interview for room: %s", self._room_name)
        asyncio.create_task(self._update_backend_status("completed"))
        return "The interview session is being finalized. Goodbye."

    async def _update_backend_status(self, status: str) -> None:
        if not self._backend_api_url or not self._room_name:
            return
        try:
            url = f"{self._backend_api_url}/v1/interview/compat/{self._room_name}/status"
            async with httpx.AsyncClient() as client:
                await client.patch(
                    url, json={"status": status}, timeout=5.0
                )
        except Exception as e:
            logger.warning("Failed to update status: %s", e)

    async def _append_transcript(
        self,
        speaker_role: str,
        content: str,
        speech_duration_ms: int | None = None,
    ) -> None:
        if not self._backend_api_url or not self._room_name:
            return
        if not content or not content.strip():
            return
        try:
            payload: dict[str, Any] = {
                "speaker_role": speaker_role,
                "content": content.strip(),
            }
            if speech_duration_ms is not None:
                payload["speech_duration_ms"] = int(speech_duration_ms)
            async with httpx.AsyncClient() as client:
                url = f"{self._backend_api_url}/v1/interview/compat/{self._room_name}/append-transcription"
                resp = await client.post(url, json=payload, timeout=5.0)
                if resp.status_code != 201:
                    logger.debug(
                        "append_transcript returned %d", resp.status_code
                    )
        except Exception as exc:
            logger.warning("append_transcript failed: %s", exc)
