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

    async def on_enter(self) -> None:
        """Called when the agent joins the session. Triggers the initial greeting."""
        logger.info("Interviewer agent entered session. Generating initial greeting...")
        # Instruct the LLM to greet the user based on the provided character instructions
        if hasattr(self, "session") and self.session:
            self.session.generate_reply(
                instructions="Hãy chào đón ứng viên một cách lịch sự, giới thiệu bản thân là người phỏng vấn từ Square AI và bắt đầu phần giới thiệu (Introduction)."
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
            if context.room:
                await context.room.local_participant.set_metadata(f"STAGE:{new_stage.name}")
            
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
                resp = await client.post(url, json={"advance": advance}, timeout=10.0)
            if resp.status_code != 200:
                return {"error": "backend_error", "status": resp.status_code}
            return resp.json()
        except Exception as e:
            logger.error("Error fetching next question: %s", e)
            return {"error": str(e)}

    @function_tool
    async def get_next_question(
        self,
        context: RunContext,
        advance: bool = True,
    ) -> str:
        """Get the next technical question from the interview question bank.
        
        Args:
            advance: Whether to move to the next question. Default is True.
        """
        payload = await self._fetch_next_question(advance)
        if "error" in payload:
            return f"Error: Could not retrieve questions at this time. Please proceed with personal background questions instead."
        
        res = parse_question_payload(payload)
        if res.get("done"):
            return "All predefined technical questions have been asked. You can move to the Q&A section now by calling `set_interview_stage('q_and_a')`."
        
        return f"The next question to ask is: {res.get('question_text')}"

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
            url = f"{self._backend_api_url}/interviews/{self._room_name}/status"
            async with httpx.AsyncClient() as client:
                # Compatibility: Some endpoints use PATCH, some POST. 
                # Interviews compat view handles PATCH/POST.
                await client.patch(url, json={"status": status}, timeout=5.0)
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
                url = f"{self._backend_api_url}/interviews/{self._room_name}/append-transcription"
                resp = await client.post(url, json=payload, timeout=5.0)
                if resp.status_code != 201:
                    logger.debug("append_transcript returned %d", resp.status_code)
        except Exception as exc:
            logger.warning("append_transcript failed: %s", exc)

    async def _say_and_wait(self, text: str, *, allow_interruptions: bool = True) -> None:
        # Note: In AgentSession, self.session is available after start()
        if hasattr(self, "session") and self.session:
            handle = self.session.say(text, allow_interruptions=allow_interruptions)
            await handle.wait_for_playout()
            # Transcript is handled by agent.py listener
        else:
            logger.warning("Interviewer has no session attached yet.")

    # We don't override on_user_turn_completed anymore as it's unreliable 
    # and we handle it via session events in agent.py for better coverage.
