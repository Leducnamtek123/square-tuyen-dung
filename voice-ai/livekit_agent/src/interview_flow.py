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


_PUNCTUATION_PATTERN = re.compile(r"[.,;:!?]+")
_EXTRA_SPACES_PATTERN = re.compile(r"\s+")


def strip_punctuation_for_tts(text: str) -> str:
    cleaned = _PUNCTUATION_PATTERN.sub(" ", text)
    cleaned = _EXTRA_SPACES_PATTERN.sub(" ", cleaned)
    return cleaned.strip()
