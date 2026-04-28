from livekit_agent.session_settings import build_session_kwargs
from livekit_agent.config import config


def test_build_session_kwargs() -> None:
    kwargs = build_session_kwargs()
    assert kwargs["preemptive_generation"] == config.PREEMPTIVE_GENERATION
    assert kwargs["min_consecutive_speech_delay"] == config.MIN_CONSECUTIVE_SPEECH_DELAY
    assert kwargs["turn_handling"]["endpointing"]["min_delay"] == config.MIN_ENDPOINTING_DELAY
    assert kwargs["turn_handling"]["endpointing"]["max_delay"] == config.MAX_ENDPOINTING_DELAY
    assert kwargs["turn_handling"]["interruption"]["enabled"] is True
    assert kwargs["turn_handling"]["interruption"]["discard_audio_if_uninterruptible"] is True
    assert kwargs["turn_handling"]["interruption"]["min_duration"] == config.MIN_INTERRUPTION_DURATION
    assert kwargs["turn_handling"]["interruption"]["min_words"] == config.MIN_INTERRUPTION_WORDS
