from livekit_agent.agent import _takeover_action_from_text


def test_takeover_action_from_json_text() -> None:
    assert _takeover_action_from_text('{"action":"acquire"}') == "acquire"
    assert _takeover_action_from_text('{"action":"release"}') == "release"


def test_takeover_action_from_plain_text() -> None:
    assert _takeover_action_from_text("hold") == "acquire"
    assert _takeover_action_from_text("resume") == "release"
    assert _takeover_action_from_text("unknown") is None
