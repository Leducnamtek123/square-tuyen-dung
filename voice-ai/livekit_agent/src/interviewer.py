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

from .backend_auth import auth_event_hook
from .config import config
from .interview_flow import (
    decide_next_action,
    is_substantive_answer,
    parse_question_payload,
    redact_question_progress_labels,
    strip_punctuation_for_tts,
)
from .prompts import INTERVIEWER_INSTRUCTIONS

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
    text = redact_question_progress_labels(text)
    return " ".join(text.split()).strip()


def _question_text(value: Any) -> str:
    if isinstance(value, dict):
        return _normalize_text(value.get("text"))
    return _normalize_text(value)


def _latest_user_turn(chat_ctx: Any) -> tuple[str | None, str]:
    items = getattr(chat_ctx, "items", None)
    if items is None:
        items = getattr(chat_ctx, "messages", None)
    if not items:
        return None, ""

    for item in reversed(list(items)):
        if getattr(item, "type", "message") != "message":
            continue
        if str(getattr(item, "role", "") or "").strip().lower() != "user":
            continue

        text = getattr(item, "text_content", None)
        if callable(text):
            text = text()
        if text is None:
            content = getattr(item, "content", "")
            if isinstance(content, list):
                text = "\n".join(str(part) for part in content if isinstance(part, str))
            else:
                text = str(content or "")

        return getattr(item, "id", None), _normalize_text(text)

    return None, ""


_QUESTION_TRANSITIONS = (
    "Cảm ơn bạn, mình hiểu ý rồi.",
    "Ok, mình ghi nhận phần đó.",
    "Rồi, mình hỏi tiếp một ý khác nhé.",
    "Cảm ơn bạn, mình chuyển sang phần tiếp theo nhé.",
)

_PROMPT_LEAK_PATTERNS = (
    r"\b(?:bạn\s+)?hãy\s+trả\s+lời\s+theo\s+bối\s+cảnh,\s*vai\s+trò\s+của\s+bạn\s+và\s+kết\s+quả\s+cụ\s+thể\s+nếu\s+có\s+nhé\.?",
    r"\bvui\s+lòng\s+trình\s+bày\s+theo\s+mô\s+hình\s+star\.?",
    r"\btheo\s+mô\s+hình\s+star\.?",
)


def _looks_like_greeting_or_ready(text: str) -> bool:
    normalized = _normalize_text(text).lower()
    if not normalized or len(normalized) > 48:
        return False

    words = set(re.findall(r"[\wÀ-ỹ]+", normalized, flags=re.IGNORECASE))
    return bool(
        words
        & {
            "hi",
            "hello",
            "chào",
            "chao",
            "alo",
            "ok",
            "okay",
            "vâng",
            "vang",
            "rồi",
            "roi",
            "sẵn",
            "san",
            "ready",
        }
    )


def _clean_question_for_candidate(question: str) -> str:
    text = redact_question_progress_labels(_normalize_text(question))
    for pattern in _PROMPT_LEAK_PATTERNS:
        text = re.sub(pattern, " ", text, flags=re.IGNORECASE)
    return " ".join(text.split()).strip(" -:;")


def _format_opening_greeting(candidate_name: str, job_title: str) -> str:
    name = candidate_name.strip()
    if not name or name.lower() in {"ứng viên", "ung vien"}:
        greeting = "Chào bạn"
    else:
        greeting = f"Chào {name}"

    title = job_title.strip()
    if title and title.lower() not in {"đang ứng tuyển", "dang ung tuyen"}:
        return (
            f"{greeting}, mình là AI phỏng vấn của Square cho vị trí {title}. "
            "Trước khi bắt đầu, bạn nghe mình rõ không?"
        )
    return f"{greeting}, mình là AI phỏng vấn của Square. Trước khi bắt đầu, bạn nghe mình rõ không?"


def _format_question_prompt(
    question: str,
    *,
    index: int | None = None,
    total: int | None = None,
    user_text: str = "",
) -> str:
    del total
    question_text = _clean_question_for_candidate(question)
    if not question_text:
        return ""

    if index == 0:
        opener = (
            "Hi bạn, mình bắt đầu nhẹ nhé."
            if _looks_like_greeting_or_ready(user_text)
            else "Ok, mình bắt đầu nhé."
        )
    elif index is None:
        opener = "Mình hỏi tiếp nhé."
    else:
        opener = _QUESTION_TRANSITIONS[(index - 1) % len(_QUESTION_TRANSITIONS)]

    return f"{opener} {question_text}"


def _format_detail_nudge(question: str, user_text: str) -> str:
    question_text = _clean_question_for_candidate(question)
    if _looks_like_greeting_or_ready(user_text) and question_text:
        return f"Hi bạn. Mình hỏi lại ngắn gọn nhé. {question_text}"

    lowered_question = question_text.lower()
    if any(
        marker in lowered_question
        for marker in ("tình huống", "xung đột", "bất đồng", "dự án", "khi ", "case")
    ):
        return "Mình muốn nghe một case cụ thể hơn chút. Lúc đó bạn xử lý thế nào và kết quả ra sao?"

    return "Bạn nói thêm một chút được không? Mình muốn hiểu ví dụ hoặc kinh nghiệm thực tế của bạn."


def _closing_response() -> str:
    return "Cảm ơn bạn, mình đã ghi nhận phần trao đổi hôm nay. Buổi phỏng vấn kết thúc tại đây nhé."


def _format_employer_instruction_response(instruction: str) -> str:
    instruction = _brief_text(_sanitize_output_text(instruction), 280).rstrip(" .!?")
    if not instruction:
        return ""

    ask_prompt = re.sub(
        r"^(?:hãy\s+|vui\s+lòng\s+)?(?:hỏi|hoi)(?:\s+(?:ứng\s+viên|ung\s+vien|bạn|ban))?\s*",
        "",
        instruction,
        flags=re.IGNORECASE,
    ).strip(" :,-")
    if ask_prompt and ask_prompt != instruction:
        return f"Mình muốn hỏi thêm: {ask_prompt}."

    remind_prompt = re.sub(
        r"^(?:hãy\s+|vui\s+lòng\s+)?(?:nhắc|nhac)(?:\s+(?:ứng\s+viên|ung\s+vien|bạn|ban))?\s*",
        "",
        instruction,
        flags=re.IGNORECASE,
    ).strip(" :,-")
    if remind_prompt and remind_prompt != instruction:
        return f"Nhà tuyển dụng muốn nhắc bạn: {remind_prompt}."

    return f"Nhà tuyển dụng muốn làm rõ thêm: {instruction}."


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
        self._backend_questions_available = (
            bool(self._backend_api_url and self._room_name)
            and self._context.get("questionCount") != 0
        )
        self._last_handled_user_turn_id: str | None = None
        self._last_asked_question_text: str | None = None
        self._short_answer_prompted_for: str | None = None

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
                "Hãy khai thác từng câu một cách ngắn gọn, có câu chuyển tự nhiên, không được hỏi dồn nhiều câu. "
                "Không đọc số thứ tự câu hỏi và không thêm hướng dẫn kiểu 'trả lời theo bối cảnh, vai trò, kết quả'."
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

    @property
    def completed(self) -> bool:
        return self._completed

    def build_employer_instruction_response(self, instruction: str) -> str:
        return _format_employer_instruction_response(instruction)

    async def handle_employer_instruction(
        self,
        instruction: str,
        *,
        speaker_name: str | None = None,
    ) -> str | None:
        if self._completed:
            return None

        response = self.build_employer_instruction_response(instruction)
        if not response:
            return None

        await self.record_transcript("ai_agent", response)
        session = getattr(self, "session", None)
        if session is not None:
            await session.say(response, allow_interruptions=False)
        return response

    async def on_enter(self) -> None:
        """Called when the agent joins the session."""
        logger.info("Interviewer agent entered session. Generating initial greeting...")
        candidate_name = _brief_text(self._context.get("candidateName", "Ứng viên"), 80)
        job_title = _brief_text(self._context.get("jobTitle", "đang ứng tuyển"), 120)
        greeting = _format_opening_greeting(candidate_name, job_title)

        # Keep the bootstrap greeting short so CPU TTS can finish quickly in
        # local smoke tests and the agent can start the interview promptly.
        await self.session.say(greeting, allow_interruptions=False)
        await self.record_transcript("ai_agent", greeting)

    def llm_node(self, chat_ctx, tools, model_settings):
        if self._backend_questions_available:
            return self._scripted_llm_response(chat_ctx)
        if self._scripted_questions:
            return self._scripted_llm_response(chat_ctx)
        return super().llm_node(chat_ctx, tools, model_settings)

    async def _scripted_llm_response(self, chat_ctx: Any = None) -> str | None:
        user_turn_id, user_text = _latest_user_turn(chat_ctx)
        if user_turn_id and user_turn_id == self._last_handled_user_turn_id:
            logger.info("Skipping duplicate user turn for room %s", self._room_name)
            return None

        response = await self._build_scripted_response(user_text=user_text)
        if user_turn_id:
            self._last_handled_user_turn_id = user_turn_id
        if response:
            await self.record_transcript("ai_agent", response)
        return response

    def _needs_more_answer_detail(self, user_text: str) -> bool:
        if not user_text:
            return False
        if not self._last_asked_question_text:
            return False
        if self._short_answer_prompted_for == self._last_asked_question_text:
            self._short_answer_prompted_for = None
            return False
        if is_substantive_answer(
            user_text,
            min_words=config.ANSWER_MIN_WORDS,
            min_chars=config.ANSWER_MIN_CHARS,
        ):
            self._short_answer_prompted_for = None
            return False

        self._short_answer_prompted_for = self._last_asked_question_text
        return True

    async def _build_scripted_response(self, *, user_text: str = "") -> str:
        if self._needs_more_answer_detail(user_text):
            return _format_detail_nudge(self._last_asked_question_text or "", user_text)

        backend_payload = await self._fetch_next_question_payload()
        if backend_payload is not None:
            parsed_payload = parse_question_payload(backend_payload)
            action = decide_next_action(parsed_payload)
            if action.kind == "ask_question" and action.text:
                self._last_asked_question_text = action.text
                return _format_question_prompt(
                    action.text,
                    index=parsed_payload.index,
                    total=parsed_payload.total,
                    user_text=user_text,
                )
            if action.kind == "closing":
                self._mark_completed()
                return _closing_response()

        if self._scripted_question_index < len(self._scripted_questions):
            question = self._scripted_questions[self._scripted_question_index]
            self._scripted_question_index += 1
            self._last_asked_question_text = question
            return _format_question_prompt(
                question,
                index=self._scripted_question_index - 1,
                total=len(self._scripted_questions),
                user_text=user_text,
            )

        self._mark_completed()
        return _closing_response()

    def _mark_completed(self) -> None:
        self._completed = True
        self._current_stage = InterviewStage.CLOSING

    async def _fetch_next_question_payload(self) -> dict[str, Any] | None:
        if not self._backend_api_url or not self._room_name:
            return None
        try:
            url = f"{self._backend_api_url}/v1/interview/compat/{self._room_name}/next-question"
            async with httpx.AsyncClient(event_hooks={"request": [auth_event_hook()]}) as client:
                resp = await client.post(url, json={"advance": True}, timeout=5.0)
            if resp.status_code == 200:
                payload = resp.json()
                if isinstance(payload, dict):
                    logger.info(
                        "next-question for room %s: done=%s index=%s total=%s advance=%s",
                        self._room_name,
                        payload.get("done"),
                        payload.get("index"),
                        payload.get("total"),
                        payload.get("advance"),
                    )
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
        if self._completed and self._finalizing:
            return "Buổi phỏng vấn đang trong quá trình kết thúc."

        self._mark_completed()
        logger.info("Finishing interview for room: %s", self._room_name)

        def _after_playout(_: Any) -> None:
            asyncio.create_task(self.finalize_completed_interview())

        speech_handle = getattr(context, "speech_handle", None)
        if speech_handle is not None and hasattr(speech_handle, "add_done_callback"):
            speech_handle.add_done_callback(_after_playout)
        else:
            asyncio.create_task(self.finalize_completed_interview())

        return _closing_response()

    async def transcription_node(self, text, model_settings):
        async for delta in super().transcription_node(text, model_settings):
            if isinstance(delta, str):
                sanitized = _sanitize_output_text(delta)
                if sanitized:
                    yield sanitized
            else:
                yield delta

    def tts_node(self, text, model_settings):
        async def cleaned_text():
            async for chunk in text:
                if not isinstance(chunk, str):
                    continue
                cleaned = strip_punctuation_for_tts(_sanitize_output_text(chunk))
                if cleaned:
                    yield cleaned

        return Agent.default.tts_node(self, cleaned_text(), model_settings)

    async def _shutdown_session(self) -> None:
        try:
            if self.session:
                self.session.shutdown()
        except Exception as exc:
            logger.warning("Failed to shutdown LiveKit session: %s", exc)

    async def _update_backend_status(self, status: str) -> bool:
        if not self._backend_api_url or not self._room_name:
            return False
        try:
            url = f"{self._backend_api_url}/v1/interview/compat/{self._room_name}/status"
            async with httpx.AsyncClient(event_hooks={"request": [auth_event_hook()]}) as client:
                resp = await client.patch(url, json={"status": status}, timeout=5.0)
            if resp.status_code >= 400:
                logger.warning(
                    "Failed to update status for room %s: HTTP %s",
                    self._room_name,
                    resp.status_code,
                )
                return False
            return True
        except Exception as exc:
            logger.warning("Failed to update status: %s", exc)
            return False

    async def finalize_completed_interview(self) -> None:
        if not self._completed:
            return
        if self._finalizing:
            return

        self._finalizing = True
        logger.info("Finalizing completed interview for room: %s", self._room_name)
        status_updated = await self._update_backend_status("completed")
        if not status_updated:
            await asyncio.sleep(0.5)
            await self._update_backend_status("completed")
        await self._shutdown_session()

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
            async with httpx.AsyncClient(event_hooks={"request": [auth_event_hook()]}) as client:
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
