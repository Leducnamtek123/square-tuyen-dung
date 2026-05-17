from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Literal
import re

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
    normalized = " ".join((text or "").split())
    if len(normalized) >= min_chars:
        return True

    words = [word for word in normalized.split(" ") if word]
    return len(words) >= min_words

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

def redact_question_progress_labels(text: str) -> str:
    cleaned = _QUESTION_PROGRESS_PATTERN.sub(" ", text)
    cleaned = _NEXT_QUESTION_LABEL_PATTERN.sub(" ", cleaned)
    cleaned = _EXTRA_SPACES_PATTERN.sub(" ", cleaned)
    return cleaned.strip()

def strip_punctuation_for_tts(text: str) -> str:
    cleaned = redact_question_progress_labels(text)
    cleaned = _FRACTION_PATTERN.sub(" ", cleaned)
    cleaned = _TTS_SYMBOL_PATTERN.sub(" ", cleaned)
    cleaned = _SPACE_BEFORE_PUNCTUATION_PATTERN.sub(r"\1", cleaned)
    cleaned = _MISSING_SPACE_AFTER_PUNCTUATION_PATTERN.sub(r"\1 ", cleaned)
    cleaned = _EXTRA_SPACES_PATTERN.sub(" ", cleaned)
    return cleaned.strip()
