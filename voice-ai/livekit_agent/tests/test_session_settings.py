from livekit_agent.session_settings import build_session_kwargs
from livekit_agent.config import config

def test_build_session_kwargs() -> None:
    kwargs = build_session_kwargs()
    assert kwargs["preemptive_generation"] == config.PREEMPTIVE_GENERATION
    assert kwargs["min_endpointing_delay"] == config.MIN_ENDPOINTING_DELAY
    assert kwargs["max_endpointing_delay"] == config.MAX_ENDPOINTING_DELAY
    assert kwargs["min_consecutive_speech_delay"] == config.MIN_CONSECUTIVE_SPEECH_DELAY
