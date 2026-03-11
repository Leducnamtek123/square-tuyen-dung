import logging
import httpx
from enum import Enum, auto
from typing import Any

from livekit.agents import (
    Agent,
    RunContext,
    function_tool,
)

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

    @property
    def current_stage(self) -> InterviewStage:
        return self._current_stage

    @function_tool()
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
                # FIX: use set_metadata instead of update_metadata
                await context.room.local_participant.set_metadata(new_stage.name)
                
            return f"Interview stage updated to {stage_name}."
        except KeyError:
            return f"Invalid stage name: {stage_name}."

    @function_tool()
    async def get_interview_progress(
        self,
        context: RunContext,
    ) -> str:
        """Get the current progress of the interview."""
        return f"Currently in the {self._current_stage.name} stage."

    @function_tool()
    async def get_next_question(
        self,
        context: RunContext,
        advance: bool = True,
    ) -> dict:
        """Fetch the next primary interview question from the backend."""
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

    async def get_initial_greeting(self) -> str:
        if self._context:
            name = self._context.get("candidateName", "bạn")
            title = self._context.get("jobTitle", "vị trí công việc")
            return f"Chào {name}! Tôi là trợ lý Phỏng vấn trực tuyến. Hôm nay tôi sẽ đồng hành cùng bạn trong buổi phỏng vấn cho {title}. Bạn đã sẵn sàng chưa?"
        return DEFAULT_GREETING
