from livekit_agent.session_settings import build_session_kwargs
from livekit_agent.config import config

def test_build_session_kwargs() -> None:
    kwargs = build_session_kwargs()
    assert kwargs["allow_interruptions"] is True
    assert kwargs["discard_audio_if_uninterruptible"] is True
    assert kwargs["preemptive_generation"] == config.PREEMPTIVE_GENERATION
    assert kwargs["min_interruption_duration"] == config.MIN_INTERRUPTION_DURATION
    assert kwargs["min_interruption_words"] == config.MIN_INTERRUPTION_WORDS
    assert kwargs["min_endpointing_delay"] == config.MIN_ENDPOINTING_DELAY
    assert kwargs["max_endpointing_delay"] == config.MAX_ENDPOINTING_DELAY
    assert kwargs["min_consecutive_speech_delay"] == config.MIN_CONSECUTIVE_SPEECH_DELAY
