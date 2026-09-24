from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Any, Literal

from .decision_engine import (
    TurnIntent,
    evaluate_candidate_turn,
)


@dataclass(frozen=True)
class QuestionPayload:
    done: bool
    question_text: str | None
    index: int | None
    total: int | None


@dataclass(frozen=True)
class InterviewAction:
    kind: Literal["ask_question", "closing", "noop"]
    text: str | None = None


def parse_question_payload(payload: dict[str, Any]) -> QuestionPayload:
    done = bool(payload.get("done", False))
    question_block = payload.get("question") or {}
    question_text = None if done else question_block.get("text")
    index = payload.get("index")
    total = payload.get("total")
    return QuestionPayload(
        done=done,
        question_text=question_text,
        index=index,
        total=total,
    )


def decide_next_action(payload: QuestionPayload) -> InterviewAction:
    if payload.done:
        return InterviewAction(kind="closing")
    if payload.question_text:
        return InterviewAction(kind="ask_question", text=payload.question_text)
    return InterviewAction(kind="noop")


def is_substantive_answer(text: str | None, *, min_words: int, min_chars: int) -> bool:
    if is_whisper_hallucination(text):
        return False
    normalized = " ".join((text or "").split())
    if len(normalized) >= min_chars:
        return True

    words = [word for word in normalized.split(" ") if word]
    return len(words) >= min_words


def _strip_accents(value: str) -> str:
    import unicodedata

    normalized = unicodedata.normalize("NFD", value)
    return "".join(char for char in normalized if unicodedata.category(char) != "Mn")


WHISPER_HALLUCINATIONS = (
    "ghien mi go",
    "ghiền mì gõ",
    "subscribe",
    "subcribe",
    "dang ky kenh",
    "đăng ký kênh",
    "like va share",
    "like và share",
    "like va sub",
    "like và sub",
    "cam on cac ban da theo doi",
    "cảm ơn các bạn đã theo dõi",
    "cam on cac ban da xem",
    "cảm ơn các bạn đã xem",
    "hen gap lai cac ban",
    "hẹn gặp lại các bạn",
    "chuc cac ban mot ngay",
    "chúc các bạn một ngày",
    "bam chuong thong bao",
    "bấm chuông thông báo",
    "chia se video",
    "chia sẻ video",
    "video hap dan",
    "video hấp dẫn",
    "khong bo lo",
    "không bỏ lỡ",
    "nhung video tiep theo",
    "những video tiếp theo",
)


def is_whisper_hallucination(text: str | None) -> bool:
    if not text:
        return False
    lowered = text.lower().strip()
    unaccented = _strip_accents(lowered)
    for phrase in WHISPER_HALLUCINATIONS:
        if phrase in lowered or phrase in unaccented:
            return True
    return False


_ABUSIVE_ACCENTED_WORDS_REGEX = re.compile(
    r"\b("
    r"đm|đcm|đmm|đcmm|đkm|"
    r"vcl|vkl|đéo|địt|đụ|"
    r"cút|lồn|cặc|buồi"
    r")\b",
    re.IGNORECASE,
)

_ABUSIVE_UNACCENTED_ACRONYMS_REGEX = re.compile(
    r"\b("
    r"dm|dcm|dmm|dcmm|dkm|"
    r"vcl|vkl|"
    r"fuck|fucking|bitch|asshole|shit|bullshit|bastard"
    r")\b",
    re.IGNORECASE,
)

_ABUSIVE_PHRASES = (
    "cút đi",
    "cut di",
    "cút mẹ",
    "cut me",
    "biến đi",
    "bien di",
    "biến mẹ",
    "bien me",
    "biến luôn",
    "bien luon",
    "biến ngay",
    "bien ngay",
    "đụ má",
    "du ma",
    "đụ mẹ",
    "du me",
    "địt mẹ",
    "dit me",
    "má mày",
    "ma may",
    "mẹ mày",
    "me may",
    "bà mẹ mày",
    "ba me may",
    "mẹ kiếp",
    "me kiep",
    "mất dạy",
    "mat day",
    "vô học",
    "vo hoc",
    "vô văn hóa",
    "vo van hoa",
    "đồ ngu",
    "do ngu",
    "thằng ngu",
    "thang ngu",
    "con ngu",
    "con ngu lol",
    "óc chó",
    "oc cho",
    "ngu vãi",
    "ngu vai",
    "ngu vcl",
    "ngu vl",
    "ngu như chó",
    "ngu nhu cho",
    "ngu như bò",
    "ngu nhu bo",
    "thằng chó",
    "thang cho",
    "đồ chó",
    "do cho",
    "chó chết",
    "cho chet",
    "thằng khùng",
    "thang khung",
    "con điên",
    "con dien",
    "đồ điên",
    "do dien",
    "bị điên",
    "bi dien",
    "bị khùng",
    "bi khung",
    "hãm lol",
    "ham lol",
    "hãm l",
    "ham l",
    "rác rưởi",
    "rac ruoi",
    "đồ rác",
    "do rac",
    "con cặc",
    "con cac",
    "ăn cặc",
    "an cac",
    "đầu buồi",
    "dau buoi",
    "con lồn",
    "con lon",
    "mặt lồn",
    "mat lon",
    "nói ngu",
    "noi ngu",
    "hỏi ngu",
    "hoi ngu",
    "hỏi ngáo",
    "hoi ngao",
    "hỏi nhảm",
    "hoi nham",
    "nói nhảm",
    "noi nham",
    "lảm nhảm",
    "lam nham",
    "nhảm nhí",
    "nham nhi",
    "con bot ngu",
    "bot ngu",
    "ai ngu",
    "ai rác",
    "ai rac",
    "bot dở hơi",
    "bot do hoi",
    "kệ mẹ tao",
    "ke me tao",
    "kệ mẹ mày",
    "ke me may",
    "kệ cha mày",
    "ke cha may",
    "bố mày",
    "bo may",
    "fuck you",
    "shut up",
    "get lost",
)


def is_hostile_or_abusive(text: str | None) -> bool:
    if not text:
        return False
    normalized = " ".join(text.split()).strip().lower()
    if not normalized:
        return False

    if _ABUSIVE_ACCENTED_WORDS_REGEX.search(normalized):
        return True

    if _ABUSIVE_UNACCENTED_ACRONYMS_REGEX.search(normalized):
        return True

    stripped = _strip_accents(normalized)
    if _ABUSIVE_UNACCENTED_ACRONYMS_REGEX.search(stripped):
        return True

    if any(phrase in normalized or phrase in stripped for phrase in _ABUSIVE_PHRASES):
        return True

    verdict = evaluate_candidate_turn(text)
    if verdict.intent == TurnIntent.HOSTILE_ABUSE and verdict.confidence >= 0.80:
        return True

    return False


_REFUSAL_OR_SKIP_PHRASES = (
    "bỏ qua",
    "bo qua",
    "bỏ câu",
    "bo cau",
    "chuyển câu",
    "chuyen cau",
    "qua câu",
    "qua cau",
    "câu khác",
    "cau khac",
    "đổi câu",
    "doi cau",
    "next đi",
    "next di",
    "next câu",
    "next cau",
    "next",
    "skip đi",
    "skip di",
    "skip câu",
    "skip",
    "không biết",
    "khong biet",
    "chịu thôi",
    "chiu thoi",
    "không rõ",
    "khong ro",
    "không rành",
    "khong ranh",
    "không trả lời",
    "khong tra loi",
    "không muốn trả lời",
    "khong muon tra loi",
    "không thèm trả lời",
    "khong them tra loi",
    "miễn trả lời",
    "mien tra loi",
    "miễn bình luận",
    "mien binh luan",
    "không có gì để nói",
    "khong co gi de noi",
    "hết rồi",
    "het roi",
    "hết ý rồi",
    "het y roi",
    "chỉ vậy thôi",
    "chi vay thoi",
    "có vậy thôi",
    "co vay thoi",
    "vậy thôi",
    "vay thoi",
)


def is_explicit_refusal_or_skip(text: str | None) -> bool:
    if not text:
        return False
    normalized = " ".join(text.split()).strip().lower()
    if not normalized or len(normalized) > 160:
        return False

    clean_text = re.sub(r"[^\wÀ-ỹ\s]", " ", normalized)
    clean_text = " ".join(clean_text.split())
    stripped = _strip_accents(clean_text)

    words = clean_text.split()
    if len(words) <= 2 and words:
        if words[0] in {"skip", "next", "chịu", "chiu"}:
            return True

    if any(
        phrase in clean_text or phrase in stripped
        for phrase in _REFUSAL_OR_SKIP_PHRASES
    ):
        return True

    verdict = evaluate_candidate_turn(text)
    if verdict.intent == TurnIntent.REFUSAL_OR_SKIP and verdict.confidence >= 0.80:
        return True

    return False


def is_proctoring_acknowledgment(text: str | None) -> bool:
    if not text:
        return False
    verdict = evaluate_candidate_turn(text)
    return verdict.intent == TurnIntent.PROCTORING_ACKNOWLEDGMENT and verdict.confidence >= 0.70



_QUESTION_PROGRESS_PATTERN = re.compile(
    r"\b(?:câu\s*hỏi|cau\s*hoi)\s*(?:số\s*)?\d+\s*/\s*\d+\s*:?\s*",
    re.IGNORECASE,
)
_NEXT_QUESTION_LABEL_PATTERN = re.compile(
    r"\b(?:câu\s*hỏi|cau\s*hoi)\s+ti(?:ế|e)p\s+theo\s*:?\s*",
    re.IGNORECASE,
)
_FRACTION_PATTERN = re.compile(r"\b\d+\s*/\s*\d+\b")
_PUNCTUATION_PATTERN = re.compile(r"[.,;:!?…]+")
_TTS_SYMBOL_PATTERN = re.compile(r"[/\\|_*#`<>{}\[\]()]")
_EXTRA_SPACES_PATTERN = re.compile(r"\s+")
_SPACE_BEFORE_PUNCTUATION_PATTERN = re.compile(r"\s+([,.;:!?…])")
_MISSING_SPACE_AFTER_PUNCTUATION_PATTERN = re.compile(r"([,.;:!?…])(?=\S)")


_EMOTION_CUE_PATTERN = re.compile(
    r"\[(cười|thở dài|hắng giọng|ngập ngừng|cười nhẹ)\]", re.IGNORECASE
)


def redact_question_progress_labels(text: str) -> str:
    cleaned = _QUESTION_PROGRESS_PATTERN.sub(" ", text)
    cleaned = _NEXT_QUESTION_LABEL_PATTERN.sub(" ", cleaned)
    cleaned = _EXTRA_SPACES_PATTERN.sub(" ", cleaned)
    return cleaned.strip()


def strip_punctuation_for_tts(text: str) -> str:
    cleaned = redact_question_progress_labels(text)
    cleaned = _FRACTION_PATTERN.sub(" ", cleaned)

    # Protect VieNeu-TTS v3 Turbo emotion cues like [cười], [thở dài]
    preserved_cues: dict[str, str] = {}

    def _mask_cue(m: re.Match) -> str:
        key = f"__CUE_{len(preserved_cues)}__"
        preserved_cues[key] = m.group(0)
        return key

    cleaned = _EMOTION_CUE_PATTERN.sub(_mask_cue, cleaned)
    cleaned = _TTS_SYMBOL_PATTERN.sub(" ", cleaned)

    for key, val in preserved_cues.items():
        cleaned = cleaned.replace(key, val)

    cleaned = _SPACE_BEFORE_PUNCTUATION_PATTERN.sub(r"\1", cleaned)
    cleaned = _MISSING_SPACE_AFTER_PUNCTUATION_PATTERN.sub(r"\1 ", cleaned)
    cleaned = _EXTRA_SPACES_PATTERN.sub(" ", cleaned)
    return cleaned.strip()
