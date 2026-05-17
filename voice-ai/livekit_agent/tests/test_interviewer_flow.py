import asyncio

from livekit_agent.interview_flow import (
    decide_next_action,
    is_substantive_answer,
    parse_question_payload,
    redact_question_progress_labels,
    strip_punctuation_for_tts,
)
from livekit_agent.interviewer import Interviewer


class DummyUserMessage:
    type = "message"
    role = "user"

    def __init__(self, message_id: str, text: str) -> None:
        self.id = message_id
        self.text_content = text


class DummyChatContext:
    def __init__(self, *items) -> None:
        self.items = list(items)


def test_scripted_llm_node_asks_configured_questions() -> None:
    async def run() -> None:
        agent = Interviewer(
            context={
                "questions": [
                    {"text": "Gioi thieu ban than"},
                    {"text": "Ly do ung tuyen"},
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

        assert "Gioi thieu ban than" in first
        assert "Ly do ung tuyen" in second
        assert "1/2" not in first
        assert "2/2" not in second
        assert "Câu" not in first
        assert "trả lời theo" not in first
        assert "bối cảnh" not in first
        assert "vai trò" not in first
        assert "kết thúc" in closing.lower()
        assert [item[0] for item in recorded] == ["ai_agent", "ai_agent", "ai_agent"]

    asyncio.run(run())

def test_scripted_llm_node_prompts_for_more_detail_before_advancing() -> None:
    async def run() -> None:
        agent = Interviewer(
            context={
                "questions": [
                    {"text": "Gioi thieu ban than"},
                    {"text": "Ly do ung tuyen"},
                ]
            }
        )
        recorded = []

        async def fake_record_transcript(speaker_role, content, speech_duration_ms=None):
            recorded.append((speaker_role, content, speech_duration_ms))

        agent.record_transcript = fake_record_transcript

        first = await agent.llm_node(DummyChatContext(DummyUserMessage("u1", "Xin chao")), [], None)
        nudge = await agent.llm_node(DummyChatContext(DummyUserMessage("u2", "Toi la Linh")), [], None)
        second = await agent.llm_node(
            DummyChatContext(DummyUserMessage("u3", "Toi co hon nam nam kinh nghiem giam sat cong trinh dan dung")),
            [],
            None,
        )

        assert "Gioi thieu ban than" in first
        assert "dữ liệu" not in nudge.lower()
        assert "đánh giá" not in nudge.lower()
        assert "trả lời theo" not in nudge.lower()
        assert "vai trò" not in nudge.lower()
        assert "nói thêm" in nudge.lower() or "case cụ thể" in nudge.lower()
        assert "Ly do ung tuyen" in second
        assert [item[0] for item in recorded] == ["ai_agent", "ai_agent", "ai_agent"]

    asyncio.run(run())

def test_scripted_question_strips_prompt_format_language() -> None:
    async def run() -> None:
        agent = Interviewer(
            context={
                "questions": [
                    {
                        "text": (
                            "Bạn xử lý xung đột với đồng nghiệp như thế nào? "
                            "Bạn hãy trả lời theo bối cảnh, vai trò của bạn và kết quả cụ thể nếu có nhé."
                        )
                    }
                ]
            }
        )

        async def fake_record_transcript(speaker_role, content, speech_duration_ms=None):
            return None

        agent.record_transcript = fake_record_transcript

        first = await agent.llm_node(DummyChatContext(DummyUserMessage("u1", "ok")), [], None)

        assert "Bạn xử lý xung đột với đồng nghiệp như thế nào?" in first
        assert "trả lời theo" not in first
        assert "bối cảnh" not in first
        assert "vai trò" not in first

    asyncio.run(run())

def test_completed_scripted_interview_finalizes_status_and_session() -> None:
    async def run() -> None:
        agent = Interviewer(context={"questions": [{"text": "Cau hoi 1"}]})
        status_calls = []
        shutdown_calls = {"count": 0}

        async def fake_record_transcript(speaker_role, content, speech_duration_ms=None):
            return None

        async def fake_update_backend_status(status: str) -> bool:
            status_calls.append(status)
            return True

        async def fake_shutdown_session() -> None:
            shutdown_calls["count"] += 1

        agent.record_transcript = fake_record_transcript
        agent._update_backend_status = fake_update_backend_status  # type: ignore[assignment]
        agent._shutdown_session = fake_shutdown_session  # type: ignore[assignment]

        first = await agent.llm_node(None, [], None)
        closing = await agent.llm_node(None, [], None)

        assert "Cau hoi 1" in first
        assert "kết thúc" in closing.lower()
        assert agent.completed is True

        await agent.finalize_completed_interview()
        await agent.finalize_completed_interview()

        assert status_calls == ["completed"]
        assert shutdown_calls["count"] == 1

    asyncio.run(run())

def test_scripted_llm_node_ignores_duplicate_user_turn() -> None:
    async def run() -> None:
        agent = Interviewer(context={"questions": [{"text": "Cau hoi 1"}]})

        async def fake_record_transcript(speaker_role, content, speech_duration_ms=None):
            return None

        agent.record_transcript = fake_record_transcript

        ctx = DummyChatContext(DummyUserMessage("u1", "Xin chao"))
        first = await agent.llm_node(ctx, [], None)
        duplicate = await agent.llm_node(ctx, [], None)

        assert "Cau hoi 1" in first
        assert duplicate is None

    asyncio.run(run())

def test_employer_instruction_response_does_not_advance_question_cursor() -> None:
    agent = Interviewer(context={"questions": [{"text": "Cau hoi 1"}]})

    response = agent.build_employer_instruction_response("Hoi sau hon ve kinh nghiem Revit")

    assert "Revit" in response
    assert agent._scripted_question_index == 0

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
    text = "Cảm ơn bạn. Câu hỏi 2/2: Tại sao bạn ứng tuyển vào Square Group?"
    assert strip_punctuation_for_tts(text) == "Cảm ơn bạn. Tại sao bạn ứng tuyển vào Square Group?"

def test_is_substantive_answer() -> None:
    assert is_substantive_answer("Toi la Linh", min_words=8, min_chars=28) is False
    assert (
        is_substantive_answer(
            "Toi co kinh nghiem giam sat cong trinh nha pho va van phong",
            min_words=8,
            min_chars=28,
        )
        is True
    )

def test_redact_question_progress_labels() -> None:
    assert redact_question_progress_labels("Câu hỏi 1/2: Giới thiệu bản thân?") == "Giới thiệu bản thân?"
