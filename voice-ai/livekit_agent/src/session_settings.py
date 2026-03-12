from __future__ import annotations

from typing import Any

from .config import config


def build_session_kwargs() -> dict[str, Any]:
    return {
        "preemptive_generation": config.PREEMPTIVE_GENERATION,
        "min_endpointing_delay": config.MIN_ENDPOINTING_DELAY,
        "max_endpointing_delay": config.MAX_ENDPOINTING_DELAY,
        "min_consecutive_speech_delay": config.MIN_CONSECUTIVE_SPEECH_DELAY,
    }
