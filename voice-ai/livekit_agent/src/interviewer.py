from __future__ import annotations

import asyncio
import logging
from enum import Enum, auto
from typing import Any

import httpx
from livekit.agents import Agent, RunContext
from livekit.agents.job import get_job_context
from livekit.agents.llm import function_tool

from .prompts import DEFAULT_GREETING, INTERVIEWER_INSTRUCTIONS

logger = logging.getLogger("interviewer")


class InterviewStage(Enum):
    INTRODUCTION = auto()
    EXPERIENCE = auto()
    TECHNICAL = auto()
    Q_AND_A = auto()
    CLOSING = auto()


def _normalize_text(value: Any) -> str:
    if not value:
        return ""
    if not isinstance(value, str):
        value = str(value)
    return " ".join(value.split())


def _brief_text(value: Any, limit: int = 240) -> str:
    text = _normalize_text(value)
    if len(text) <= limit:
        return text
    return text[: max(0, limit - 3)].rstrip() + "..."


class Interviewer(Agent):
    def __init__(self, context: dict[str, Any] | None = None) -> None:
        instructions = INTERVIEWER_INSTRUCTIONS
        self._context = context or {}
        self._backend_api_url = self._context.get("backendApiUrl")
        self._room_name = self._context.get("roomName")
        self._completed = False
        self._finalizing = False
        self._current_stage = InterviewStage.INTRODUCTION

        candidate_name = _brief_text(self._context.get("candidateName", "ung vien"), 80)
        job_title = _brief_text(self._context.get("jobTitle", "dang ung tuyen"), 120)
        interview_subject = _brief_text(self._context.get("interviewSubject", job_title), 180)
        job_desc = _brief_text(self._context.get("jobDescription", ""), 600)
        job_req = _brief_text(self._context.get("jobRequirement", ""), 400)
        q_group_name = _brief_text(self._context.get("questionGroupName", ""), 120)
        q_group_desc = _brief_text(self._context.get("questionGroupDescription", ""), 400)
        notes = _brief_text(self._context.get("interviewNotes", ""), 240)

        instructions += (
            "\n\nThong tin ngu canh:\n"
            f"- Ung vien: {candidate_name}\n"
            f"- Vi tri: {job_title}\n"
            f"- Chu de phong van: {interview_subject}\n"
        )
        if job_desc:
            instructions += f"- Mo ta cong viec: {job_desc}\n"
        if job_req:
            instructions += f"- Yeu cau cong viec: {job_req}\n"
        if q_group_name:
            instructions += f"- Nhom cau hoi: {q_group_name}\n"
        if q_group_desc:
            instructions += f"- Mo ta nhom cau hoi: {q_group_desc}\n"
        if notes:
            instructions += f"- Ghi chu phong van: {notes}\n"

        questions = self._context.get("questions", [])
        if questions:
            q_text = ""
            total_q = len(questions)
            for i, q in enumerate(questions, 1):
                if isinstance(q, dict):
                    question_text = q.get("text", "")
                else:
                    question_text = str(q)
                q_text += f"{i}. {_brief_text(question_text, 300)}\n"
            instructions += (
                f"\nDANH SACH {total_q} CAU HOI BAT BUOC PHAI HOI THEO THU TU TU 1 DEN {total_q}:\n{q_text}"
                "Hay hoi tung cau mot cach ngan gon, khong duoc hoi don nhieu cau."
            )

        instructions += (
            "\nQuy tac do dai: moi cau noi chi 1 den 2 cau, toi da khoang 40 tu."
            "\nKhi da den buoc ket thuc va da noi loi cam on, phai goi finish_interview ngay."
        )

        super().__init__(instructions=instructions)

    @property
    def current_stage(self) -> InterviewStage:
        return self._current_stage

    async def on_enter(self) -> None:
        """Called when the agent joins the session."""
        logger.info("Interviewer agent entered session. Generating initial greeting...")
        candidate_name = _brief_text(self._context.get("candidateName", "ung vien"), 80)
        job_title = _brief_text(self._context.get("jobTitle", "dang ung tuyen"), 120)

        self.session.generate_reply(
            instructions=(
                f"{DEFAULT_GREETING} "
                f"Hay chao don ung vien {candidate_name} ngan gon, "
                f"tu nhien va gioi thieu buoi phong van vi tri {job_title}. "
                "Khong noi dai, chi 1-2 cau."
            )
        )

    @function_tool
    async def set_interview_stage(self, context: RunContext, stage_name: str) -> str:
        """Update the current stage of the interview."""
        try:
            new_stage = InterviewStage[stage_name.upper()]
            self._current_stage = new_stage
            logger.info("Interview stage changed to: %s", self._current_stage)

            try:
                job_ctx = get_job_context()
                job_ctx.room.local_participant.set_metadata(f"STAGE:{new_stage.name}")
            except Exception as exc:
                logger.warning("Could not update room metadata: %s", exc)

            msg = f"Interview stage updated to {stage_name}."
            if new_stage == InterviewStage.TECHNICAL:
                msg += " Ask the listed questions strictly and in order."
            return msg
        except KeyError:
            return f"Invalid stage name: {stage_name}."

    @function_tool
    async def get_interview_progress(self, context: RunContext) -> str:
        """Get the current progress of the interview."""
        return f"Currently in the {self._current_stage.name} stage."

    @function_tool
    async def finish_interview(self, context: RunContext) -> str:
        """End the interview session after the farewell is spoken."""
        if self._completed:
            return "The interview session is already ending."

        self._completed = True
        logger.info("Finishing interview for room: %s", self._room_name)

        def _after_playout(_: Any) -> None:
            if self._finalizing:
                return
            self._finalizing = True
            asyncio.create_task(self._shutdown_session())

        speech_handle = getattr(context, "speech_handle", None)
        if speech_handle is not None and hasattr(speech_handle, "add_done_callback"):
            speech_handle.add_done_callback(_after_playout)
        else:
            asyncio.create_task(self._shutdown_session())

        return "Cam on ban. Chung ta ket thuc buoi phong van o day."

    async def _shutdown_session(self) -> None:
        try:
            if self.session:
                self.session.shutdown()
        except Exception as exc:
            logger.warning("Failed to shutdown LiveKit session: %s", exc)

    async def _update_backend_status(self, status: str) -> None:
        if not self._backend_api_url or not self._room_name:
            return
        try:
            url = f"{self._backend_api_url}/v1/interview/compat/{self._room_name}/status"
            async with httpx.AsyncClient() as client:
                await client.patch(url, json={"status": status}, timeout=5.0)
        except Exception as exc:
            logger.warning("Failed to update status: %s", exc)

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
                    logger.debug("append_transcript returned %d", resp.status_code)
        except Exception as exc:
            logger.warning("append_transcript failed: %s", exc)
