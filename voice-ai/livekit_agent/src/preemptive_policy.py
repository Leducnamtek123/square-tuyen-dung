from __future__ import annotations

def should_enable_preemptive(transcript: str, *, min_words: int, min_chars: int) -> bool:
    text = transcript.strip()
    if len(text) < min_chars:
        return False
    words = [w for w in text.split() if w]
    return len(words) >= min_words
