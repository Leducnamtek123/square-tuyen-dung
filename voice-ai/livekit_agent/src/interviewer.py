from __future__ import annotations

import asyncio
import logging
import re
from enum import Enum, auto
from typing import Any

import httpx
from livekit.agents import Agent, RunContext
from livekit.agents.job import get_job_context
from livekit.agents.llm import function_tool

from .interview_flow import decide_next_action, parse_question_payload
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


def _sanitize_output_text(value: Any) -> str:
    text = _normalize_text(value)
    if not text:
        return ""

    text = (
        text.replace("\u200b", " ")
        .replace("\ufeff", " ")
    )
    text = re.sub(r"<think>[\s\S]*?</think>", " ", text, flags=re.IGNORECASE)
    text = re.sub(r"<think>[\s\S]*", " ", text, flags=re.IGNORECASE)
    text = re.sub(r"</think>", " ", text, flags=re.IGNORECASE)
    text = re.sub(r"\bfinish_interview\b", " ", text, flags=re.IGNORECASE)
    text = re.sub(r"\bset_interview_stage\b", " ", text, flags=re.IGNORECASE)
    text = re.sub(r"\bget_interview_progress\b", " ", text, flags=re.IGNORECASE)
    text = re.sub(r"<function=[^>]+>[\s\S]*?</function>", " ", text, flags=re.IGNORECASE)
    text = re.sub(r"</?function[^>]*>", " ", text, flags=re.IGNORECASE)
    text = re.sub(r"```[\s\S]*?```", " ", text)
    text = re.sub(r"\{\s*\"stage_name\"\s*:\s*\"[^\"]+\"\s*\}", " ", text)
    return " ".join(text.split()).strip()


def _question_text(value: Any) -> str:
    if isinstance(value, dict):
        return _normalize_text(value.get("text"))
    return _normalize_text(value)


class Interviewer(Agent):
    def __init__(self, context: dict[str, Any] | None = None) -> None:
        instructions = INTERVIEWER_INSTRUCTIONS
        self._context = context or {}
        self._backend_api_url = self._context.get("backendApiUrl")
        self._room_name = self._context.get("roomName")
        self._completed = False
        self._finalizing = False
        self._current_stage = InterviewStage.INTRODUCTION
        self._recorded_transcripts: set[tuple[str, str]] = set()
        self._scripted_questions = [
            text for text in (_question_text(q) for q in self._context.get("questions", [])) if text
        ]
        self._scripted_question_index = 0

        candidate_name = _brief_text(self._context.get("candidateName", "Ứng viên"), 80)
        job_title = _brief_text(self._context.get("jobTitle", "đang ứng tuyển"), 120)
        interview_subject = _brief_text(self._context.get("interviewSubject", job_title), 180)
        job_desc = _brief_text(self._context.get("jobDescription", ""), 600)
        job_req = _brief_text(self._context.get("jobRequirement", ""), 400)
        q_group_name = _brief_text(self._context.get("questionGroupName", ""), 120)
        q_group_desc = _brief_text(self._context.get("questionGroupDescription", ""), 400)
        notes = _brief_text(self._context.get("interviewNotes", ""), 240)

        instructions += (
            "\n\nThông tin ngữ cảnh:\n"
            f"- Ứng viên: {candidate_name}\n"
            f"- Vị trí: {job_title}\n"
            f"- Chủ đề phỏng vấn: {interview_subject}\n"
        )
        if job_desc:
            instructions += f"- Mô tả công việc: {job_desc}\n"
        if job_req:
            instructions += f"- Yêu cầu công việc: {job_req}\n"
        if q_group_name:
            instructions += f"- Nhóm câu hỏi: {q_group_name}\n"
        if q_group_desc:
            instructions += f"- Mô tả nhóm câu hỏi: {q_group_desc}\n"
        if notes:
            instructions += f"- Ghi chú phỏng vấn: {notes}\n"

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
                f"\nDANH SÁCH {total_q} CÂU HỎI BẮT BUỘC PHẢI HỎI THEO THỨ TỰ TỪ 1 ĐẾN {total_q}:\n{q_text}"
                "Hãy hỏi từng câu một cách ngắn gọn, không được hỏi dồn nhiều câu."
            )

        instructions += (
            "\nQuy tắc độ dài: mỗi câu nói chỉ 1 đến 2 câu, tối đa khoảng 40 từ."
            "\nKhi đã đến bước kết thúc và đã nói lời cảm ơn, hãy kết thúc buổi phỏng vấn ngay."
            "\nKhông bao giờ nhắc tới tên hàm nội bộ, tên công cụ, JSON, hoặc bất kỳ chuỗi kiểu `finish_interview`, `set_interview_stage`, `get_interview_progress` trong câu nói của bạn."
            "\nBắt buộc: mọi câu trả lời phải là tiếng Việt có dấu đầy đủ, tự nhiên, không được viết không dấu."
        )

        super().__init__(instructions=instructions)

    @property
    def current_stage(self) -> InterviewStage:
        return self._current_stage

    async def on_enter(self) -> None:
        """Called when the agent joins the session."""
        logger.info("Interviewer agent entered session. Generating initial greeting...")
        candidate_name = _brief_text(self._context.get("candidateName", "Ứng viên"), 80)

        # Keep the bootstrap greeting short so CPU TTS can finish quickly in
        # local smoke tests and the agent can start the interview promptly.
        await self.session.say(
            f"{DEFAULT_GREETING} Xin chào {candidate_name}, bắt đầu phỏng vấn nhé.",
            allow_interruptions=False,
        )

    def llm_node(self, chat_ctx, tools, model_settings):
        if self._backend_api_url and self._room_name:
            return self._scripted_llm_response()
        if self._scripted_questions:
            return self._scripted_llm_response()
        return super().llm_node(chat_ctx, tools, model_settings)

    async def _scripted_llm_response(self) -> str:
        response = await self._build_scripted_response()
        await self.record_transcript("ai_agent", response)
        return response

    async def _build_scripted_response(self) -> str:
        backend_payload = await self._fetch_next_question_payload()
        if backend_payload is not None:
            action = decide_next_action(parse_question_payload(backend_payload))
            if action.kind == "ask_question" and action.text:
                index = backend_payload.get("index")
                total = backend_payload.get("total")
                if isinstance(index, int) and isinstance(total, int) and total > 0:
                    return f"Cảm ơn bạn. Câu hỏi {index + 1}/{total}: {action.text}"
                return f"Cảm ơn bạn. Câu hỏi tiếp theo: {action.text}"
            if action.kind == "closing":
                self._completed = True
                return "Cảm ơn bạn. Tôi đã ghi nhận phần trả lời, buổi phỏng vấn kết thúc tại đây."

        if self._scripted_question_index < len(self._scripted_questions):
            question = self._scripted_questions[self._scripted_question_index]
            self._scripted_question_index += 1
            total = len(self._scripted_questions)
            return f"Cảm ơn bạn. Câu hỏi {self._scripted_question_index}/{total}: {question}"

        self._completed = True
        return "Cảm ơn bạn. Tôi đã ghi nhận phần trả lời, buổi phỏng vấn kết thúc tại đây."

    async def _fetch_next_question_payload(self) -> dict[str, Any] | None:
        if not self._backend_api_url or not self._room_name:
            return None
        try:
            url = f"{self._backend_api_url}/v1/interview/compat/{self._room_name}/next-question"
            async with httpx.AsyncClient() as client:
                resp = await client.post(url, json={"advance": True}, timeout=5.0)
            if resp.status_code == 200:
                payload = resp.json()
                if isinstance(payload, dict):
                    return payload
            logger.debug("next-question returned %d for room %s", resp.status_code, self._room_name)
        except Exception as exc:
            logger.warning("next-question failed for room %s: %s", self._room_name, exc)
        return None

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

            msg = f"Đã cập nhật giai đoạn phỏng vấn sang {stage_name}."
            if new_stage == InterviewStage.TECHNICAL:
                msg += " Hãy hỏi các câu trong danh sách theo đúng thứ tự."
            return msg
        except KeyError:
            return f"Tên giai đoạn không hợp lệ: {stage_name}."

    @function_tool
    async def get_interview_progress(self, context: RunContext) -> str:
        """Get the current progress of the interview."""
        return f"Hiện đang ở giai đoạn {self._current_stage.name}."

    @function_tool
    async def finish_interview(self, context: RunContext) -> str:
        """End the interview session after the farewell is spoken."""
        if self._completed:
            return "Buổi phỏng vấn đang trong quá trình kết thúc."

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

        return "Cảm ơn bạn. Chúng ta kết thúc buổi phỏng vấn ở đây."

    async def transcription_node(self, text, model_settings):
        async for delta in super().transcription_node(text, model_settings):
            if isinstance(delta, str):
                sanitized = _sanitize_output_text(delta)
                if sanitized:
                    yield sanitized
            else:
                yield delta

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
            cleaned_content = _sanitize_output_text(content)
            if not cleaned_content:
                return
            fingerprint = (speaker_role, cleaned_content)
            if fingerprint in self._recorded_transcripts:
                return
            self._recorded_transcripts.add(fingerprint)
            payload: dict[str, Any] = {
                "speaker_role": speaker_role,
                "content": cleaned_content,
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

    async def record_transcript(
        self,
        speaker_role: str,
        content: str,
        speech_duration_ms: int | None = None,
    ) -> None:
        await self._append_transcript(
            speaker_role=speaker_role,
            content=content,
            speech_duration_ms=speech_duration_ms,
        )
