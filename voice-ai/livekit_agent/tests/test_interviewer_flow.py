from livekit_agent.interview_flow import (
    decide_next_action,
    parse_question_payload,
    strip_punctuation_for_tts,
)

def test_parse_question_payload_done() -> None:
    payload = {
        "done": True,
        "question": None,
        "index": 2,
        "total": 2,
    }
    result = parse_question_payload(payload)
    assert result.done is True
    assert result.question_text is None
    assert result.index == 2
    assert result.total == 2

def test_decide_next_action_question() -> None:
    payload = {
        "done": False,
        "question": {"text": "Cau hoi 1"},
        "index": 0,
        "total": 2,
    }
    action = decide_next_action(parse_question_payload(payload))
    assert action.kind == "ask_question"
    assert action.text == "Cau hoi 1"

def test_decide_next_action_done() -> None:
    payload = {
        "done": True,
        "question": None,
        "index": 1,
        "total": 1,
    }
    action = decide_next_action(parse_question_payload(payload))
    assert action.kind == "closing"
    assert action.text is None

def test_strip_punctuation_for_tts() -> None:
    text = "Xin chao. Ban co the...? Dung khong!"
    assert strip_punctuation_for_tts(text) == "Xin chao Ban co the Dung khong"
