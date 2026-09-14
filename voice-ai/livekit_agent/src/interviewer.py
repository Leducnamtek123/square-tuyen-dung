from __future__ import annotations

import asyncio
import logging
import re
from collections.abc import Awaitable
from enum import Enum, auto
from typing import Any

import httpx
import openai as openai_lib
from livekit.agents import Agent, RunContext
from livekit.agents.job import get_job_context
from livekit.agents.llm import function_tool

from .backend_auth import auth_event_hook
from .config import config
from .interview_flow import (
    decide_next_action,
    is_explicit_refusal_or_skip,
    is_hostile_or_abusive,
    is_substantive_answer,
    parse_question_payload,
    redact_question_progress_labels,
    strip_punctuation_for_tts,
)
from .prompts import (
    INTERVIEWER_INSTRUCTIONS,
    LANGUAGE_GREETINGS,
    LANGUAGE_PROMPT_CONSTRAINTS,
    LANGUAGE_CANDIDATE_QUESTION_PROMPTS,
    LANGUAGE_CLOSINGS,
)

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

    text = text.replace("\u200b", " ").replace("\ufeff", " ")
    text = re.sub(r"<think>[\s\S]*?</think>", " ", text, flags=re.IGNORECASE)
    text = re.sub(r"<think>[\s\S]*", " ", text, flags=re.IGNORECASE)
    text = re.sub(r"</think>", " ", text, flags=re.IGNORECASE)
    text = re.sub(r"\bfinish_interview\b", " ", text, flags=re.IGNORECASE)
    text = re.sub(r"\bset_interview_stage\b", " ", text, flags=re.IGNORECASE)
    text = re.sub(r"\bget_interview_progress\b", " ", text, flags=re.IGNORECASE)
    text = re.sub(
        r"<function=[^>]+>[\s\S]*?</function>", " ", text, flags=re.IGNORECASE
    )
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
    r"\bbạn\s+hãy\s+trả\s+lời\s+theo\s+bối\s+cảnh,\s*vai\s+trò\s+của\s+bạn\s+và\s+kết\s+quả\s+cụ\s+thể\s+nếu\s+có\s+nhé\.?",
    r"\bhãy\s+trả\s+lời\s+theo\s+bối\s+cảnh,\s*vai\s+trò\s+của\s+bạn\s+và\s+kết\s+quả\s+cụ\s+thể\s+nếu\s+có\s+nhé\.?",
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


def _format_opening_greeting(
    candidate_name: str,
    job_title: str,
    language: str = "vi",
    has_cv: bool = False,
) -> str:
    lang = (language or "vi").lower()
    name = candidate_name.strip()
    title = job_title.strip()
    is_placeholder_name = not name or name.lower() in {"ứng viên", "ung vien", "candidate", "applicant"}
    is_placeholder_title = not title or title.lower() in {"đang ứng tuyển", "dang ung tuyen", "applicant"}

    if lang == "en":
        cand = f" {name}" if not is_placeholder_name else ""
        if has_cv:
            if not is_placeholder_title:
                return f"Hello{cand}, I am your interviewer from Square for the {title} position. I have thoroughly reviewed your CV and look forward to our discussion. Before we begin, can you hear me clearly?"
            return f"Hello{cand}, I am your interviewer from Square. I have thoroughly reviewed your CV and look forward to our discussion. Before we begin, can you hear me clearly?"
        if not is_placeholder_title:
            return f"Hello{cand}, I am your interviewer from Square for the {title} position. Before we begin, can you hear me clearly?"
        return f"Hello{cand}, I am your interviewer from Square. Before we begin, can you hear me clearly?"

    if lang == "ja":
        cand = f"{name}様、" if not is_placeholder_name else ""
        if has_cv:
            if not is_placeholder_title:
                return f"こんにちは。{cand}本日は{title}ポジションの面接を担当いたします、Squareの採用担当です。事前に履歴書を拝見いたしました。始める前に、こちらの声がはっきりと聞こえていますでしょうか。"
            return f"こんにちは。{cand}本日の面接を担当いたします、Squareの採用担当です。事前に履歴書を拝見いたしました。始める前に、こちらの声がはっきりと聞こえていますでしょうか。"
        if not is_placeholder_title:
            return f"こんにちは。{cand}本日は{title}ポジションの面接を担当いたします、Squareの採用担当です。始める前に、こちらの声がはっきりと聞こえていますでしょうか。"
        return f"こんにちは。{cand}本日の面接を担当いたします、Squareの採用担当です。始める前に、こちらの声がはっきりと聞こえていますでしょうか。"

    if lang == "ko":
        cand = f"{name}님, " if not is_placeholder_name else ""
        if has_cv:
            if not is_placeholder_title:
                return f"안녕하세요. {cand}오늘 {title} 직무 면접을 진행하게 된 Square 채용 담당자입니다. 이력서를 꼼꼼히 확인하였습니다. 시작하기 전에 제 목소리가 잘 들리시나요?"
            return f"안녕하세요. {cand}오늘 면접을 진행하게 된 Square 채용 담당자입니다. 이력서를 꼼꼼히 확인하였습니다. 시작하기 전에 제 목소리가 잘 들리시나요?"
        if not is_placeholder_title:
            return f"안녕하세요. {cand}오늘 {title} 직무 면접을 진행하게 된 Square 채용 담당자입니다. 시작하기 전에 제 목소리가 잘 들리시나요?"
        return f"안녕하세요. {cand}오늘 면접을 진행하게 된 Square 채용 담당자입니다. 시작하기 전에 제 목소리가 잘 들리시나요?"

    if is_placeholder_name:
        greeting = "Chào bạn"
    else:
        greeting = f"Chào {name}"

    if has_cv:
        if not is_placeholder_title:
            return (
                f"{greeting}, mình là Nhà tuyển dụng của Square cho vị trí {title}. "
                "Mình đã xem kỹ hồ sơ ứng tuyển của bạn và rất vui được trao đổi hôm nay. "
                "Trước khi bắt đầu, bạn nghe mình rõ không?"
            )
        return (
            f"{greeting}, mình là Nhà tuyển dụng của Square. "
            "Mình đã xem kỹ hồ sơ ứng tuyển của bạn và rất vui được trao đổi hôm nay. "
            "Trước khi bắt đầu, bạn nghe mình rõ không?"
        )

    if not is_placeholder_title:
        return (
            f"{greeting}, mình là Nhà tuyển dụng của Square cho vị trí {title}. "
            "Trước khi bắt đầu, bạn nghe mình rõ không?"
        )
    return f"{greeting}, mình là Nhà tuyển dụng của Square. Trước khi bắt đầu, bạn nghe mình rõ không?"


def _format_question_prompt(
    question: str,
    *,
    index: int | None = None,
    total: int | None = None,
    user_text: str = "",
    language: str = "vi",
) -> str:
    del total
    question_text = _clean_question_for_candidate(question)
    if not question_text:
        return ""

    lang = (language or "vi").lower()
    if lang == "en":
        opener = "Let us begin with our first question." if index == 0 else "Moving on to our next question."
    elif lang == "ja":
        opener = "それでは最初の質問に移らせていただきます。" if index == 0 else "続きまして、次の質問に移らせていただきます。"
    elif lang == "ko":
        opener = "그럼 첫 번째 질문부터 시작하겠습니다." if index == 0 else "이어서 다음 질문 드리겠습니다."
    else:
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


def _looks_like_no_candidate_question(text: str) -> bool:
    normalized = _normalize_text(text).lower()
    if not normalized or len(normalized) > 120:
        return False

    normalized = re.sub(r"[^\wÀ-ỹ\s]", " ", normalized, flags=re.IGNORECASE)
    normalized = " ".join(normalized.split())
    no_question_phrases = (
        "không có",
        "khong co",
        "không ạ",
        "khong a",
        "không hỏi",
        "khong hoi",
        "chưa có",
        "chua co",
        "em không",
        "em khong",
        "mình không",
        "minh khong",
        "không cần",
        "khong can",
        "hết rồi",
        "het roi",
        "cảm ơn",
        "cam on",
        "dạ không",
        "da khong",
    )
    return any(phrase in normalized for phrase in no_question_phrases)


def _looks_like_end_interview_intent(text: str) -> bool:
    normalized = _normalize_text(text).lower()
    if not normalized or len(normalized) > 160:
        return False

    normalized = re.sub(r"[^\wÀ-ỹ\s]", " ", normalized, flags=re.IGNORECASE)
    normalized = " ".join(normalized.split())
    words = normalized.split()

    short_end_phrases = (
        "chấm dứt",
        "cham dut",
        "kết thúc",
        "ket thuc",
        "dừng lại",
        "dung lai",
        "xin dừng",
        "xin dung",
    )
    if len(words) <= 4 and any(phrase in normalized for phrase in short_end_phrases):
        return True

    explicit_end_phrases = (
        "dừng phỏng vấn",
        "dung phong van",
        "ngừng phỏng vấn",
        "ngung phong van",
        "kết thúc phỏng vấn",
        "ket thuc phong van",
        "chấm dứt phỏng vấn",
        "cham dut phong van",
        "không muốn phỏng vấn nữa",
        "khong muon phong van nua",
        "không phỏng vấn nữa",
        "khong phong van nua",
        "thôi mình nghỉ",
        "thoi minh nghi",
        "dừng ở đây",
        "dung o day",
        "kết thúc ở đây",
        "ket thuc o day",
        "chấm dứt ở đây",
        "cham dut o day",
        "chấm dứt tại đây",
        "cham dut tai day",
        "dừng tại đây",
        "dung tai day",
        "kết thúc tại đây",
        "ket thuc tai day",
        "chấm dứt cuộc phỏng vấn",
        "cham dut cuoc phong van",
        "kết thúc buổi phỏng vấn",
        "ket thuc buoi phong van",
        "hết câu hỏi rồi",
        "het cau hoi roi",
        "mình muốn dừng",
        "minh muon dung",
        "tôi muốn dừng",
        "toi muon dung",
        "em muốn dừng",
        "em muon dung",
        "mình muốn kết thúc",
        "minh muon ket thuc",
        "em muốn kết thúc",
        "em muon ket thuc",
        "tôi muốn kết thúc",
        "toi muon ket thuc",
        "cho mình dừng",
        "cho minh dung",
        "xin phép dừng",
        "xin phep dung",
        "thôi dẹp",
        "thoi dep",
        "khỏi phỏng vấn",
        "khoi phong van",
    )
    return any(phrase in normalized for phrase in explicit_end_phrases)


def _candidate_question_prompt(language: str = "vi") -> str:
    lang = (language or "vi").lower()
    return LANGUAGE_CANDIDATE_QUESTION_PROMPTS.get(lang, LANGUAGE_CANDIDATE_QUESTION_PROMPTS["vi"])


def _closing_response(language: str = "vi") -> str:
    lang = (language or "vi").lower()
    return LANGUAGE_CLOSINGS.get(lang, LANGUAGE_CLOSINGS["vi"])


def _candidate_question_closing_response(user_text: str, language: str = "vi") -> str:
    lang = (language or "vi").lower()
    if _looks_like_no_candidate_question(user_text):
        return _closing_response(language=lang)

    if lang == "en":
        prefix = "Thank you, I have noted your question for our recruitment team to follow up. "
    elif lang == "ja":
        prefix = "ご質問ありがとうございます。いただいたご質問は採用チームにて共有し、後ほど回答させていただきます。 "
    elif lang == "ko":
        prefix = "질문 감사합니다. 문의하신 내용은 채용팀에 전달하여 추후 상세히 답변드리겠습니다. "
    else:
        prefix = "Cảm ơn bạn, mình đã ghi nhận câu hỏi của bạn để bộ phận tuyển dụng phản hồi chi tiết sau buổi hôm nay nhé. "

    return f"{prefix}{_closing_response(language=lang)}"


def _parse_question_gap_seconds(value: Any, default: float = 2.5) -> float:
    try:
        return max(0.0, float(value))
    except (TypeError, ValueError):
        return default

def _parse_silence_threshold_seconds(value: Any, default: float = 1.0) -> float:
    try:
        return max(0.0, float(value))
    except (TypeError, ValueError):
        return default

def _format_employer_instruction_response(instruction: str) -> str:
    instruction = _brief_text(_sanitize_output_text(instruction), 280).rstrip(" .!?")
    if not instruction:
        return ""

    instruction_lower = instruction.lower()
    ask_prefixes = [
        "hãy hỏi ứng viên", "vui lòng hỏi ứng viên", "hỏi ứng viên",
        "hãy hỏi bạn", "vui lòng hỏi bạn", "hỏi bạn",
        "hãy hỏi", "vui lòng hỏi", "hỏi",
        "hay hoi ung vien", "vui long hoi ung vien", "hoi ung vien",
        "hay hoi ban", "vui long hoi ban", "hoi ban",
        "hay hoi", "vui long hoi", "hoi"
    ]
    for pfx in ask_prefixes:
        if instruction_lower.startswith(pfx):
            ask_prompt = instruction[len(pfx):].strip(" :,-")
            if ask_prompt:
                return f"Mình muốn hỏi thêm: {ask_prompt}."

    remind_prefixes = [
        "hãy nhắc ứng viên", "vui lòng nhắc ứng viên", "nhắc ứng viên",
        "hãy nhắc bạn", "vui lòng nhắc bạn", "nhắc bạn",
        "hãy nhắc", "vui lòng nhắc", "nhắc",
        "hay nhac ung vien", "vui long nhac ung vien", "nhac ung vien",
        "hay nhac ban", "vui long nhac ban", "nhac ban",
        "hay nhac", "vui long nhac", "nhac"
    ]
    for pfx in remind_prefixes:
        if instruction_lower.startswith(pfx):
            remind_prompt = instruction[len(pfx):].strip(" :,-")
            if remind_prompt:
                return f"Nhà tuyển dụng muốn nhắc bạn: {remind_prompt}."

    return f"Nhà tuyển dụng muốn làm rõ thêm: {instruction}."


class Interviewer(Agent):
    def __init__(self, context: dict[str, Any] | None = None) -> None:
        instructions = INTERVIEWER_INSTRUCTIONS
        self._context = context or {}
        self._language = str(self._context.get("interviewLanguage") or "vi").lower()
        self._backend_api_url = self._context.get("backendApiUrl")
        self._room_name = self._context.get("roomName")
        self._completed = False
        self._finalizing = False
        self._background_tasks: set[asyncio.Task[Any]] = set()
        self._current_stage = InterviewStage.INTRODUCTION
        self._recorded_transcripts: set[tuple[str, str]] = set()
        self._scripted_questions = [
            text
            for text in (_question_text(q) for q in self._context.get("questions", []))
            if text
        ]
        self._scripted_question_index = 0
        self._backend_questions_available = (
            bool(self._backend_api_url and self._room_name)
            and self._context.get("questionCount") != 0
        )
        self._last_handled_user_turn_id: str | None = None
        self._last_asked_question_text: str | None = None
        self._short_answer_prompted_for: str | None = None
        self._candidate_question_prompted = False
        self._awaiting_candidate_questions = False
        self._employer_takeover_active = False
        self._pending_employer_followups: list[str] = []
        self._abusive_turn_count = 0
        self._question_gap_seconds = _parse_question_gap_seconds(
            self._context.get("interviewQuestionGapSeconds"),
            default=2.5,
        )
        self._minimum_silence_seconds = _parse_silence_threshold_seconds(
            self._context.get("interviewMinimumSilenceSeconds"),
            default=1.0,
        )
        self._reply_delay_seconds = max(
            self._question_gap_seconds,
            self._minimum_silence_seconds,
        )

        candidate_name = _brief_text(self._context.get("candidateName", "Ứng viên"), 80)
        job_title = _brief_text(self._context.get("jobTitle", "đang ứng tuyển"), 120)
        interview_subject = _brief_text(
            self._context.get("interviewSubject", job_title), 180
        )
        job_desc = _brief_text(self._context.get("jobDescription", ""), 600)
        job_req = _brief_text(self._context.get("jobRequirement", ""), 400)
        q_group_name = _brief_text(self._context.get("questionGroupName", ""), 120)
        q_group_desc = _brief_text(
            self._context.get("questionGroupDescription", ""), 400
        )
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

        cv_title = _brief_text(self._context.get("candidateCvTitle", ""), 120)
        cv_skills = _brief_text(self._context.get("candidateCvSkills", ""), 300)
        cv_experience = _brief_text(self._context.get("candidateCvExperience", ""), 400)
        cv_education = _brief_text(self._context.get("candidateCvEducation", ""), 200)
        semantic_fit = _brief_text(self._context.get("candidateFitLevel", ""), 80)
        matched_skills = self._context.get("candidateMatchedSkills", [])
        missing_skills = self._context.get("candidateMissingSkills", [])
        ai_rec = _brief_text(self._context.get("candidateAiRecommendation", ""), 300)

        if cv_title or cv_experience or cv_skills:
            instructions += (
                "\n\nHồ sơ ứng viên và Đánh giá sơ bộ CV:\n"
                f"- Chức danh trong CV: {cv_title or 'Chưa cung cấp'}\n"
                f"- Kinh nghiệm làm việc: {cv_experience or 'Xem thêm trong quá trình phỏng vấn'}\n"
                f"- Kỹ năng chuyên môn khai báo: {cv_skills or 'N/A'}\n"
            )
            if cv_education:
                instructions += f"- Học vấn: {cv_education}\n"
            if semantic_fit:
                instructions += f"- Kết quả đối sánh sơ bộ CV với JD: {semantic_fit}\n"
            if matched_skills:
                instructions += f"- Kỹ năng ứng viên đáp ứng tốt: {', '.join(matched_skills)}\n"
            if missing_skills:
                instructions += f"- Kỹ năng cần phỏng vấn đào sâu xác minh: {', '.join(missing_skills)}\n"
            if ai_rec:
                instructions += f"- Khuyến nghị trước phỏng vấn: {ai_rec}\n"
            instructions += (
                "\nChỉ dẫn phong cách phỏng vấn cho Nhà tuyển dụng AI AILA:\n"
                "- Bạn đã nghiên cứu kỹ hồ sơ ứng viên trước khi vào phòng.\n"
                "- Hãy công nhận các kinh nghiệm và kỹ năng nổi bật trong CV của ứng viên.\n"
                "- Khi ứng viên trả lời câu hỏi chuyên môn, hãy chủ động liên hệ với hồ sơ CV hoặc đào sâu xác minh các kỹ năng cần kiểm tra thêm.\n"
            )

        questions = self._context.get("questions", [])
        if questions:
            q_text = ""
            total_q = len(questions)
            for i, q in enumerate(questions, 1):
                question_text = q.get("text", "") if isinstance(q, dict) else str(q)
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
        )
        lang_constraint = LANGUAGE_PROMPT_CONSTRAINTS.get(self._language, LANGUAGE_PROMPT_CONSTRAINTS["vi"])
        instructions += f"\n{lang_constraint}"

        self._candidate_name = candidate_name
        self._job_title = job_title
        try:
            self._llm_client = (
                openai_lib.AsyncOpenAI(
                    api_key=config.LLM_API_KEY or "dummy",
                    base_url=config.LLM_BASE_URL,
                    http_client=httpx.AsyncClient(
                        timeout=httpx.Timeout(10.0, connect=3.0)
                    ),
                )
                if config.LLM_BASE_URL
                else None
            )
        except Exception as exc:
            logger.warning("Could not initialize Interviewer LLM client: %s", exc)
            self._llm_client = None

        super().__init__(instructions=instructions)

    def _create_background_task(self, coro: Awaitable[Any]) -> None:
        task = asyncio.create_task(coro)
        self._background_tasks.add(task)
        task.add_done_callback(self._background_tasks.discard)

    async def _finalize_after_speech_or_delay(
        self,
        speech_handle: Any = None,
        delay_seconds: float = 3.5,
    ) -> None:
        if self._finalizing:
            return

        if speech_handle is not None and hasattr(speech_handle, "wait_for_completion"):
            try:
                await speech_handle.wait_for_completion()
            except Exception as exc:
                logger.debug("wait_for_completion exception: %s", exc)

        await asyncio.sleep(delay_seconds)
        await self.finalize_completed_interview()

    async def _generate_intelligent_question_turn(
        self,
        question: str,
        *,
        index: int | None = None,
        total: int | None = None,
        user_text: str = "",
    ) -> str:
        question_text = _clean_question_for_candidate(question)
        if not question_text:
            return ""

        if index == 0:
            if self._language == 'en':
                return f"Hello, very glad to meet you today. Let us begin with our first question: {question_text}"
            elif self._language == 'ja':
                return f"本日はよろしくお願いいたします。それでは最初の質問から始めさせていただきます：{question_text}"
            elif self._language == 'ko':
                return f"반갑습니다. 그럼 첫 번째 질문부터 시작하겠습니다: {question_text}"
            else:
                if _looks_like_greeting_or_ready(user_text):
                    return f"Chào bạn, rất vui được gặp bạn hôm nay. Chúng ta cùng bắt đầu với câu hỏi đầu tiên nhé: {question_text}"
                return f"Tuyệt vời, chúng ta cùng bắt đầu nhé. {question_text}"

        clean_user = _normalize_text(user_text).strip()
        if clean_user and len(clean_user) >= 10 and self._llm_client and config.LLM_BASE_URL:
            try:
                system_prompt = (
                    "Bạn là Nhà tuyển dụng chuyên nghiệp của Square đang phỏng vấn ứng viên trực tiếp. "
                    "Hãy giao tiếp tự nhiên, ấm áp, thông minh, không theo khuôn mẫu."
                )
                user_prompt = (
                    f"Vị trí phỏng vấn: {self._job_title or 'chuyên môn'}\n"
                    f"Ứng viên vừa trả lời câu trước: \"{_brief_text(clean_user, 280)}\"\n"
                    f"Câu hỏi tiếp theo bạn cần hỏi là: \"{question_text}\"\n"
                )
                cv_skills = _brief_text(self._context.get("candidateCvSkills", ""), 150)
                if cv_skills:
                    user_prompt += f"Kỹ năng trong CV của ứng viên: {cv_skills}\n"
                missing_skills = self._context.get("candidateMissingSkills", [])
                if missing_skills:
                    user_prompt += f"Kỹ năng cần kiểm chứng thêm: {', '.join(missing_skills[:3])}\n"
                user_prompt += (
                    "\nHãy đưa ra lời nói tiếp theo của Nhà tuyển dụng:\n"
                    "1. Nếu câu trả lời của ứng viên có ý hay, hãy nhận xét ngắn gọn, chân thành. "
                    "Nếu ứng viên trả lời đơn giản hoặc chưa rõ, chỉ ghi nhận tự nhiên, tuyệt đối không khen ngợi gượng gạo.\n"
                    "2. Dẫn dắt mượt mà và đặt câu hỏi tiếp theo.\n"
                    "3. Độ dài: từ 2 đến 3 câu ngắn, tối đa khoảng 45 từ.\n"
                    "4. Tuyệt đối không dùng dấu ngoặc đơn trong toàn bộ văn bản.\n"
                    "5. Không dùng markdown hay gạch đầu dòng, không đọc số thứ tự câu hỏi."
                )
                res = await asyncio.wait_for(
                    self._llm_client.chat.completions.create(
                        model=config.LLM_MODEL,
                        messages=[
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": user_prompt},
                        ],
                        temperature=0.7,
                        max_tokens=160,
                    ),
                    timeout=3.5,
                )
                reply = res.choices[0].message.content or ""
                cleaned = _sanitize_output_text(reply).replace("(", "").replace(")", "").strip()
                if cleaned and len(cleaned) > 20:
                    logger.info("Generated intelligent question turn for room %s (index %s)", self._room_name, index)
                    return cleaned
            except Exception as exc:
                logger.info("Fallback to standard transition for room %s: %s", self._room_name, exc)

        return _format_question_prompt(
            question_text,
            index=index,
            total=total,
            user_text=user_text,
            language=self._language,
        )

    async def _answer_candidate_question_and_close(self, user_text: str) -> str:
        clean_user = _normalize_text(user_text).strip()
        if _looks_like_no_candidate_question(clean_user) or _looks_like_end_interview_intent(clean_user):
            return _closing_response(language=self._language)

        if clean_user and len(clean_user) >= 6 and self._llm_client and config.LLM_BASE_URL:
            try:
                system_prompt = "Bạn là Nhà tuyển dụng chuyên nghiệp của Square."
                user_prompt = (
                    f"Ứng viên đặt câu hỏi cho bạn: \"{_brief_text(clean_user, 260)}\"\n"
                    "Hãy trả lời câu hỏi của ứng viên một cách thiện chí, súc tích và ấm áp trong 1 đến 2 câu ngắn dưới 35 từ. "
                    "Sau đó cảm ơn họ và thông báo kết thúc buổi phỏng vấn hôm nay. "
                    "Tuyệt đối không dùng dấu ngoặc đơn. Không dùng markdown."
                )
                res = await asyncio.wait_for(
                    self._llm_client.chat.completions.create(
                        model=config.LLM_MODEL,
                        messages=[
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": user_prompt},
                        ],
                        temperature=0.7,
                        max_tokens=160,
                    ),
                    timeout=3.5,
                )
                reply = res.choices[0].message.content or ""
                cleaned = _sanitize_output_text(reply).replace("(", "").replace(")", "").strip()
                if cleaned and len(cleaned) > 20:
                    logger.info("Generated candidate question answer for room %s", self._room_name)
                    return cleaned
            except Exception as exc:
                logger.info("Fallback for candidate question answer in room %s: %s", self._room_name, exc)

        return _candidate_question_closing_response(clean_user, language=self._language)

    @property
    def current_stage(self) -> InterviewStage:
        return self._current_stage

    @property
    def questions(self) -> list[str]:
        return self._scripted_questions

    @property
    def current_question_index(self) -> int:
        return self._scripted_question_index

    @current_question_index.setter
    def current_question_index(self, value: int) -> None:
        self._scripted_question_index = value

    @property
    def completed(self) -> bool:
        return self._completed

    @property
    def employer_takeover_active(self) -> bool:
        return self._employer_takeover_active

    @property
    def _safe_session(self) -> Any | None:
        try:
            return self.session
        except RuntimeError:
            return None

    def pause_for_employer_takeover(self, speaker_name: str | None = None) -> None:
        del speaker_name
        self._employer_takeover_active = True

    def resume_from_employer_takeover(self, speaker_name: str | None = None) -> None:
        del speaker_name
        self._employer_takeover_active = False

    def build_employer_instruction_response(self, instruction: str) -> str:
        return _format_employer_instruction_response(instruction)

    async def handle_employer_instruction(
        self,
        instruction: str,
        *,
        speaker_name: str | None = None,
    ) -> str | None:
        if self._completed or self._employer_takeover_active:
            return None

        response = self.build_employer_instruction_response(instruction)
        if not response:
            return None

        self._pending_employer_followups.append(response)
        logger.info(
            "Queued employer follow-up for room %s from %s: queue_size=%s",
            self._room_name,
            speaker_name or "employer",
            len(self._pending_employer_followups),
        )
        return None

    async def on_enter(self) -> None:
        """Called when the agent joins the session."""
        logger.info("Interviewer agent entered session. Generating initial greeting...")
        candidate_name = _brief_text(self._context.get("candidateName", "Ứng viên"), 80)
        job_title = _brief_text(self._context.get("jobTitle", "đang ứng tuyển"), 120)
        has_cv = bool(
            self._context.get("candidateCvTitle")
            or self._context.get("candidateCvSkills")
            or self._context.get("candidateCvExperience")
        )
        greeting = _format_opening_greeting(
            candidate_name,
            job_title,
            language=self._language,
            has_cv=has_cv,
        )

        # Keep the bootstrap greeting short and resilient with retry loop to withstand cold starts or transient TTS delays
        max_retries = 3
        for attempt in range(1, max_retries + 1):
            try:
                logger.info("Playing initial greeting (attempt %d/%d)...", attempt, max_retries)
                await self.session.say(greeting, allow_interruptions=False)
                logger.info("Initial greeting played successfully.")
                break
            except Exception as exc:
                logger.warning("Greeting attempt %d failed: %s", attempt, exc)
                if attempt < max_retries:
                    await asyncio.sleep(1.0 * attempt)
                else:
                    logger.error("All greeting attempts failed due to cold-start or TTS issue. Proceeding without crashing room.")

        try:
            await self.record_transcript("ai_agent", greeting)
        except Exception as exc:
            logger.warning("Failed to record greeting transcript: %s", exc)

    def llm_node(self, chat_ctx, tools, model_settings):
        if self._backend_questions_available:
            return self._scripted_llm_response(chat_ctx)
        if self._scripted_questions:
            return self._scripted_llm_response(chat_ctx)
        return super().llm_node(chat_ctx, tools, model_settings)

    async def _scripted_llm_response(self, chat_ctx: Any = None) -> str | None:
        if self._employer_takeover_active:
            logger.info("Skipping AI reply while employer takeover is active for room %s", self._room_name)
            return None

        user_turn_id, user_text = _latest_user_turn(chat_ctx)
        if user_turn_id and user_turn_id == self._last_handled_user_turn_id:
            logger.info("Skipping duplicate user turn for room %s", self._room_name)
            return None

        response = await self._build_scripted_response(user_text=user_text)
        if user_turn_id:
            self._last_handled_user_turn_id = user_turn_id
        if response:
            await self.record_transcript("ai_agent", response)
            if self._completed:
                self._create_background_task(self._finalize_after_speech_or_delay(delay_seconds=4.0))
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

    async def _build_scripted_response(self, *, user_text: str = "") -> str | None:
        if _looks_like_end_interview_intent(user_text):
            logger.info(
                "Detected candidate end-interview intent for room %s: %s",
                self._room_name,
                user_text,
            )
            self._awaiting_candidate_questions = False
            self._mark_completed()
            return _closing_response(language=self._language)

        if is_hostile_or_abusive(user_text):
            self._abusive_turn_count += 1
            logger.warning(
                "Detected candidate abusive/hostile language for room %s (strike %s): %s",
                self._room_name,
                self._abusive_turn_count,
                user_text,
            )
            self._short_answer_prompted_for = None
            if self._abusive_turn_count >= 2:
                self._mark_completed()
                self._awaiting_candidate_questions = False
                return (
                    "Vì bạn tiếp tục sử dụng ngôn từ thiếu chuẩn mực và không phù hợp với tiêu chuẩn phỏng vấn, "
                    "mình xin phép kết thúc buổi phỏng vấn tại đây. Cảm ơn bạn."
                )
            return (
                "Square luôn hướng tới môi trường phỏng vấn văn minh và tôn trọng lẫn nhau. "
                "Mong bạn giữ ngôn từ phù hợp để chúng ta có thể tiếp tục buổi trao đổi. "
                "Nếu bạn muốn bỏ qua câu hỏi vừa rồi, bạn có thể nói bỏ qua để sang câu hỏi mới nhé."
            )

        if is_explicit_refusal_or_skip(user_text):
            logger.info(
                "Candidate requested to skip or refused answer for room %s: %s",
                self._room_name,
                user_text,
            )
            self._short_answer_prompted_for = None
            return await self._advance_to_next_question_after_skip(user_text)

        if self._awaiting_candidate_questions:
            if not user_text:
                return None
            return await self._finish_after_candidate_question(user_text)

        if self._needs_more_answer_detail(user_text):
            return _format_detail_nudge(self._last_asked_question_text or "", user_text)

        if user_text and self._reply_delay_seconds > 0:
            await asyncio.sleep(self._reply_delay_seconds)

        backend_payload = await self._fetch_next_question_payload()
        if backend_payload is not None:
            parsed_payload = parse_question_payload(backend_payload)
            action = decide_next_action(parsed_payload)
            if action.kind == "ask_question" and action.text:
                self._last_asked_question_text = action.text
                self._scripted_question_index = parsed_payload.index + 1
                await self._broadcast_question_index(parsed_payload.index)
                return await self._generate_intelligent_question_turn(
                    action.text,
                    index=parsed_payload.index,
                    total=parsed_payload.total,
                    user_text=user_text,
                )
            if action.kind == "closing":
                if self._scripted_question_index < len(self._scripted_questions):
                    question = self._scripted_questions[self._scripted_question_index]
                    self._scripted_question_index += 1
                    self._last_asked_question_text = question
                    await self._broadcast_question_index(self._scripted_question_index - 1)
                    return await self._generate_intelligent_question_turn(
                        question,
                        index=self._scripted_question_index - 1,
                        total=len(self._scripted_questions),
                        user_text=user_text,
                    )
                return self._offer_pending_followup_or_candidate_question()

        if self._scripted_question_index < len(self._scripted_questions):
            question = self._scripted_questions[self._scripted_question_index]
            self._scripted_question_index += 1
            self._last_asked_question_text = question
            return await self._generate_intelligent_question_turn(
                question,
                index=self._scripted_question_index - 1,
                total=len(self._scripted_questions),
                user_text=user_text,
            )

        return self._offer_pending_followup_or_candidate_question()

    async def _advance_to_next_question_after_skip(self, user_text: str = "") -> str:
        del user_text
        if self._reply_delay_seconds > 0:
            await asyncio.sleep(min(self._reply_delay_seconds, 1.0))

        backend_payload = await self._fetch_next_question_payload()
        if backend_payload is not None:
            parsed_payload = parse_question_payload(backend_payload)
            action = decide_next_action(parsed_payload)
            if action.kind == "ask_question" and action.text:
                self._last_asked_question_text = action.text
                self._scripted_question_index = parsed_payload.index + 1
                await self._broadcast_question_index(parsed_payload.index)
                cleaned_q = _clean_question_for_candidate(action.text)
                return f"Không sao cả, mình ghi nhận và chúng ta cùng chuyển sang câu hỏi tiếp theo nhé: {cleaned_q}"
            if action.kind == "closing":
                if self._scripted_question_index < len(self._scripted_questions):
                    question = self._scripted_questions[self._scripted_question_index]
                    self._scripted_question_index += 1
                    self._last_asked_question_text = question
                    await self._broadcast_question_index(self._scripted_question_index - 1)
                    cleaned_q = _clean_question_for_candidate(question)
                    return f"Không sao cả, mình ghi nhận và chúng ta cùng chuyển sang câu hỏi tiếp theo nhé: {cleaned_q}"
                return self._offer_pending_followup_or_candidate_question()

        if self._scripted_question_index < len(self._scripted_questions):
            question = self._scripted_questions[self._scripted_question_index]
            self._scripted_question_index += 1
            self._last_asked_question_text = question
            cleaned_q = _clean_question_for_candidate(question)
            return f"Không sao cả, mình ghi nhận và chúng ta cùng chuyển sang câu hỏi tiếp theo nhé: {cleaned_q}"

        return self._offer_pending_followup_or_candidate_question()

    def _offer_pending_followup_or_candidate_question(self) -> str:
        if self._pending_employer_followups:
            followup = self._pending_employer_followups.pop(0)
            self._last_asked_question_text = followup
            self._short_answer_prompted_for = None
            return followup

        return self._offer_candidate_question_turn()

    def _offer_candidate_question_turn(self) -> str:
        if not self._candidate_question_prompted:
            self._candidate_question_prompted = True
            self._awaiting_candidate_questions = True
            self._current_stage = InterviewStage.Q_AND_A
            self._last_asked_question_text = None
            self._short_answer_prompted_for = None
            return _candidate_question_prompt(language=self._language)

        self._mark_completed()
        return _closing_response(language=self._language)

    async def _finish_after_candidate_question(self, user_text: str) -> str:
        self._awaiting_candidate_questions = False
        self._mark_completed()
        if is_hostile_or_abusive(user_text) or _looks_like_no_candidate_question(user_text):
            return _closing_response(language=self._language)
        return await self._answer_candidate_question_and_close(user_text)

    def _mark_completed(self) -> None:
        self._completed = True
        self._current_stage = InterviewStage.CLOSING

    async def _fetch_next_question_payload(self, target_index: int | None = None) -> dict[str, Any] | None:
        if not self._backend_api_url or not self._room_name:
            return None
        try:
            url = f"{self._backend_api_url}/v1/interview/compat/{self._room_name}/next-question"
            body: dict[str, Any] = {"advance": True}
            if target_index is not None:
                body["target_index"] = target_index
            async with httpx.AsyncClient(
                event_hooks={"request": [auth_event_hook()]}
            ) as client:
                resp = await client.post(url, json=body, timeout=5.0)
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
            logger.debug(
                "next-question returned %d for room %s",
                resp.status_code,
                self._room_name,
            )
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
            self._create_background_task(self.finalize_completed_interview())

        speech_handle = getattr(context, "speech_handle", None)
        if speech_handle is not None and hasattr(speech_handle, "add_done_callback"):
            speech_handle.add_done_callback(_after_playout)
        else:
            self._create_background_task(self.finalize_completed_interview())

        return _closing_response(language=self._language)

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
            url = (
                f"{self._backend_api_url}/v1/interview/compat/{self._room_name}/status"
            )
            async with httpx.AsyncClient(
                event_hooks={"request": [auth_event_hook()]}
            ) as client:
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

    async def _broadcast_question_index(self, index: int) -> None:
        try:
            job_ctx = get_job_context()
        except RuntimeError:
            return
        try:
            if job_ctx and job_ctx.room and job_ctx.room.local_participant:
                import json
                payload = json.dumps({"action": "question_advanced", "question_index": index})
                await job_ctx.room.local_participant.send_text(
                    payload,
                    topic="square.interview.question_control",
                )
        except Exception as exc:
            logger.warning("Could not broadcast question_advanced: %s", exc)

    async def _broadcast_session_completed(self) -> None:
        try:
            job_ctx = get_job_context()
        except RuntimeError:
            return
        try:
            if job_ctx and job_ctx.room and job_ctx.room.local_participant:
                import json
                payload = json.dumps({"action": "session_completed"})
                await job_ctx.room.local_participant.send_text(
                    payload,
                    topic="square.interview.question_control",
                )
                logger.info("Broadcast session_completed event to room %s", self._room_name)
        except Exception as exc:
            logger.warning("Could not broadcast session_completed event: %s", exc)

    async def handle_question_timeout(self, target_index: int | None = None) -> str | None:
        if self._completed or self._employer_takeover_active:
            return None

        logger.info("Handling question timeout for room %s (target_index=%s)", self._room_name, target_index)
        sess = self._safe_session
        if sess:
            try:
                await sess.interrupt(force=True)
            except Exception as exc:
                logger.debug("Could not interrupt session on timeout: %s", exc)

        backend_payload = await self._fetch_next_question_payload(target_index=target_index)
        if backend_payload is not None:
            parsed_payload = parse_question_payload(backend_payload)
            action = decide_next_action(parsed_payload)
            if action.kind == "ask_question" and action.text:
                self._last_asked_question_text = action.text
                self._short_answer_prompted_for = None
                self._scripted_question_index = parsed_payload.index + 1
                response = f"Đã hết thời gian cho câu hỏi này, chúng ta cùng chuyển sang câu tiếp theo nhé. {action.text}"
                if sess:
                    await sess.say(response, allow_interruptions=False)
                await self.record_transcript("ai_agent", response)
                await self._broadcast_question_index(parsed_payload.index)
                return response
            if action.kind == "closing":
                if self._scripted_question_index < len(self._scripted_questions):
                    question = self._scripted_questions[self._scripted_question_index]
                    self._scripted_question_index += 1
                    self._last_asked_question_text = question
                    self._short_answer_prompted_for = None
                    response = f"Đã hết thời gian cho câu hỏi này, chúng ta cùng chuyển sang câu tiếp theo nhé. {question}"
                    if sess:
                        await sess.say(response, allow_interruptions=False)
                    await self.record_transcript("ai_agent", response)
                    await self._broadcast_question_index(self._scripted_question_index - 1)
                    return response
                closing_turn = self._offer_pending_followup_or_candidate_question()
                response = f"Đã hết thời gian cho câu hỏi này. {closing_turn}"
                if sess:
                    speech_handle = await sess.say(response, allow_interruptions=False)
                    if self._completed:
                        self._create_background_task(self._finalize_after_speech_or_delay(speech_handle=speech_handle, delay_seconds=3.5))
                elif self._completed:
                    self._create_background_task(self._finalize_after_speech_or_delay(delay_seconds=3.5))
                await self.record_transcript("ai_agent", response)
                return response

        if target_index is not None and 0 <= target_index < len(self._scripted_questions):
            self._scripted_question_index = target_index

        if self._scripted_question_index < len(self._scripted_questions):
            question = self._scripted_questions[self._scripted_question_index]
            self._scripted_question_index += 1
            self._last_asked_question_text = question
            self._short_answer_prompted_for = None
            response = f"Đã hết thời gian cho câu hỏi này, chúng ta cùng chuyển sang câu tiếp theo nhé. {question}"
            if sess:
                await sess.say(response, allow_interruptions=False)
            await self.record_transcript("ai_agent", response)
            await self._broadcast_question_index(self._scripted_question_index - 1)
            return response

        closing_turn = self._offer_pending_followup_or_candidate_question()
        response = f"Đã hết thời gian cho câu hỏi này. {closing_turn}"
        if sess:
            speech_handle = await sess.say(response, allow_interruptions=False)
            if self._completed:
                self._create_background_task(self._finalize_after_speech_or_delay(speech_handle=speech_handle, delay_seconds=3.5))
        elif self._completed:
            self._create_background_task(self._finalize_after_speech_or_delay(delay_seconds=3.5))
        await self.record_transcript("ai_agent", response)
        return response

    async def handle_candidate_next_question(self, target_index: int | None = None) -> str | None:
        if self._completed or self._employer_takeover_active:
            return None

        logger.info("Handling candidate next-question request for room %s (target_index=%s)", self._room_name, target_index)
        sess = self._safe_session
        if sess:
            try:
                await sess.interrupt(force=True)
            except Exception as exc:
                logger.debug("Could not interrupt session on next_question: %s", exc)

        backend_payload = await self._fetch_next_question_payload(target_index=target_index)
        if backend_payload is not None:
            parsed_payload = parse_question_payload(backend_payload)
            action = decide_next_action(parsed_payload)
            if action.kind == "ask_question" and action.text:
                self._last_asked_question_text = action.text
                self._short_answer_prompted_for = None
                self._scripted_question_index = parsed_payload.index + 1
                response = f"Cảm ơn bạn, mình chuyển sang câu tiếp theo nhé. {action.text}"
                if sess:
                    await sess.say(response, allow_interruptions=False)
                await self.record_transcript("ai_agent", response)
                await self._broadcast_question_index(parsed_payload.index)
                return response
            if action.kind == "closing":
                if self._scripted_question_index < len(self._scripted_questions):
                    question = self._scripted_questions[self._scripted_question_index]
                    self._scripted_question_index += 1
                    self._last_asked_question_text = question
                    self._short_answer_prompted_for = None
                    response = f"Cảm ơn bạn, mình chuyển sang câu tiếp theo nhé. {question}"
                    if sess:
                        await sess.say(response, allow_interruptions=False)
                    await self.record_transcript("ai_agent", response)
                    await self._broadcast_question_index(self._scripted_question_index - 1)
                    return response
                response = self._offer_pending_followup_or_candidate_question()
                if sess:
                    speech_handle = await sess.say(response, allow_interruptions=False)
                    if self._completed:
                        self._create_background_task(self._finalize_after_speech_or_delay(speech_handle=speech_handle, delay_seconds=3.5))
                elif self._completed:
                    self._create_background_task(self._finalize_after_speech_or_delay(delay_seconds=3.5))
                await self.record_transcript("ai_agent", response)
                return response

        if target_index is not None and 0 <= target_index < len(self._scripted_questions):
            self._scripted_question_index = target_index

        if self._scripted_question_index < len(self._scripted_questions):
            question = self._scripted_questions[self._scripted_question_index]
            self._scripted_question_index += 1
            self._last_asked_question_text = question
            self._short_answer_prompted_for = None
            response = f"Cảm ơn bạn, mình chuyển sang câu tiếp theo nhé. {question}"
            if sess:
                await sess.say(response, allow_interruptions=False)
            await self.record_transcript("ai_agent", response)
            await self._broadcast_question_index(self._scripted_question_index - 1)
            return response

        response = self._offer_pending_followup_or_candidate_question()
        if sess:
            speech_handle = await sess.say(response, allow_interruptions=False)
            if self._completed:
                self._create_background_task(self._finalize_after_speech_or_delay(speech_handle=speech_handle, delay_seconds=3.5))
        elif self._completed:
            self._create_background_task(self._finalize_after_speech_or_delay(delay_seconds=3.5))
        await self.record_transcript("ai_agent", response)
        return response

    async def handle_candidate_finish_interview(self) -> str:
        if self._completed and self._finalizing:
            return "Buổi phỏng vấn đang trong quá trình kết thúc."

        logger.info("Handling candidate finish interview request for room %s", self._room_name)
        self._awaiting_candidate_questions = False
        self._mark_completed()
        response = _closing_response()
        sess = self._safe_session
        if sess:
            try:
                await sess.interrupt(force=True)
                speech_handle = await sess.say(response, allow_interruptions=False)
                self._create_background_task(self._finalize_after_speech_or_delay(speech_handle=speech_handle, delay_seconds=3.5))
            except Exception as exc:
                logger.debug("Could not speak farewell: %s", exc)
                self._create_background_task(self._finalize_after_speech_or_delay(delay_seconds=3.5))
        else:
            self._create_background_task(self._finalize_after_speech_or_delay(delay_seconds=3.5))

        await self.record_transcript("ai_agent", response)
        return response

    async def finalize_completed_interview(self) -> None:
        if not self._completed:
            return
        if self._finalizing:
            return

        self._finalizing = True
        logger.info("Finalizing completed interview for room: %s", self._room_name)
        await self._broadcast_session_completed()
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
            async with httpx.AsyncClient(
                event_hooks={"request": [auth_event_hook()]}
            ) as client:
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
