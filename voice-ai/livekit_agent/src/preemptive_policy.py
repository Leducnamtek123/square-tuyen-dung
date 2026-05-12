from __future__ import annotations


def should_enable_preemptive(
    text: str | None,
    *,
    min_words: int,
    min_chars: int,
) -> bool:
    """Return True when a transcript is long enough for preemptive generation."""

    normalized = " ".join((text or "").split())
    if len(normalized) < min_chars:
        return False

    words = [word for word in normalized.split(" ") if word]
    return len(words) >= min_words
