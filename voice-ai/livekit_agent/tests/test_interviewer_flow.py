import asyncio

from livekit_agent.interview_flow import (
    decide_next_action,
    parse_question_payload,
    strip_punctuation_for_tts,
)
from livekit_agent.interviewer import Interviewer


def test_scripted_llm_node_asks_configured_questions() -> None:
    async def run() -> None:
        agent = Interviewer(
            context={
                "questions": [
                    {"text": "Cau hoi 1"},
                    {"text": "Cau hoi 2"},
                ]
            }
        )
        recorded = []

        async def fake_record_transcript(speaker_role, content, speech_duration_ms=None):
            recorded.append((speaker_role, content, speech_duration_ms))

        agent.record_transcript = fake_record_transcript

        first = await agent.llm_node(None, [], None)
        second = await agent.llm_node(None, [], None)
        closing = await agent.llm_node(None, [], None)

        assert "Cau hoi 1" in first
        assert "Cau hoi 2" in second
        assert "kết thúc" in closing.lower()
        assert [item[0] for item in recorded] == ["ai_agent", "ai_agent", "ai_agent"]

    asyncio.run(run())

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
