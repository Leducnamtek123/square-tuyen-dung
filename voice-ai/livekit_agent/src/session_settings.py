from __future__ import annotations

from typing import Any

try:
    from .config import config
except ImportError:  # pragma: no cover - supports direct module execution
    from config import config


def build_session_kwargs() -> dict[str, Any]:
    """Build session settings for LiveKit AgentSession.

    The defaults are tuned to reduce accidental interruptions while keeping the
    agent responsive enough for live interviews.
    """

    return {
        "allow_interruptions": True,
        "discard_audio_if_uninterruptible": True,
        "min_interruption_duration": config.MIN_INTERRUPTION_DURATION,
        "min_interruption_words": config.MIN_INTERRUPTION_WORDS,
        "min_endpointing_delay": config.MIN_ENDPOINTING_DELAY,
        "max_endpointing_delay": config.MAX_ENDPOINTING_DELAY,
        "min_consecutive_speech_delay": config.MIN_CONSECUTIVE_SPEECH_DELAY,
        "preemptive_generation": config.PREEMPTIVE_GENERATION,
    }
