from livekit_agent.preemptive_policy import should_enable_preemptive

def test_should_enable_preemptive_min_chars() -> None:
    assert (
        should_enable_preemptive("Xin chao", min_words=1, min_chars=20) is False
    )

def test_should_enable_preemptive_min_words() -> None:
    assert (
        should_enable_preemptive("Xin chao ban", min_words=4, min_chars=5) is False
    )

def test_should_enable_preemptive_enabled() -> None:
    assert (
        should_enable_preemptive(
            "Toi da lam viec tai cong ty A", min_words=4, min_chars=10
        )
        is True
    )
