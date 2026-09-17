import asyncio
import unicodedata

from livekit_agent import interviewer as interviewer_module
from livekit_agent.interview_flow import (
    decide_next_action,
    is_explicit_refusal_or_skip,
    is_hostile_or_abusive,
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


def _strip_accents(value: str) -> str:
    normalized = unicodedata.normalize("NFD", value)
    return "".join(char for char in normalized if unicodedata.category(char) != "Mn")


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

        async def fake_record_transcript(
            speaker_role, content, speech_duration_ms=None
        ):
            recorded.append((speaker_role, content, speech_duration_ms))

        agent.record_transcript = fake_record_transcript

        first = await agent.llm_node(None, [], None)
        second = await agent.llm_node(None, [], None)
        qna_prompt = await agent.llm_node(None, [], None)
        closing = await agent.llm_node(
            DummyChatContext(DummyUserMessage("u1", "Khong co cau hoi them")),
            [],
            None,
        )

        assert "Gioi thieu ban than" in first
        assert "Ly do ung tuyen" in second
        assert "1/2" not in first
        assert "2/2" not in second
        assert "Câu" not in first
        assert "trả lời theo" not in first
        assert "bối cảnh" not in first
        assert "vai trò" not in first
        assert "kết thúc" in closing.lower()
        normalized_qna = _strip_accents(qna_prompt).lower()
        assert "cau hoi" in normalized_qna
        assert "cong ty" in normalized_qna
        assert "ket thuc" in _strip_accents(closing).lower()
        assert [item[0] for item in recorded] == [
            "ai_agent",
            "ai_agent",
            "ai_agent",
            "ai_agent",
        ]

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
        agent._llm_client = None
        recorded = []

        async def fake_record_transcript(
            speaker_role, content, speech_duration_ms=None
        ):
            recorded.append((speaker_role, content, speech_duration_ms))

        agent.record_transcript = fake_record_transcript

        first = await agent.llm_node(
            DummyChatContext(DummyUserMessage("u1", "Xin chao")), [], None
        )
        nudge = await agent.llm_node(
            DummyChatContext(DummyUserMessage("u2", "Toi la Linh")), [], None
        )
        second = await agent.llm_node(
            DummyChatContext(
                DummyUserMessage(
                    "u3", "Toi co hon nam nam kinh nghiem giam sat cong trinh dan dung"
                )
            ),
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


def test_scripted_llm_node_waits_before_next_question(monkeypatch) -> None:
    async def run() -> None:
        agent = Interviewer(
            context={
                "questions": [
                    {"text": "Gioi thieu ban than"},
                ],
                "interviewQuestionGapSeconds": "1.75",
            }
        )
        sleep_calls: list[float] = []

        async def fake_sleep(seconds: float) -> None:
            sleep_calls.append(seconds)

        async def fake_record_transcript(
            speaker_role, content, speech_duration_ms=None
        ):
            return None

        agent.record_transcript = fake_record_transcript
        monkeypatch.setattr(interviewer_module.asyncio, "sleep", fake_sleep)

        first = await agent.llm_node(
            DummyChatContext(DummyUserMessage("u1", "Xin chao")),
            [],
            None,
        )

        assert "Gioi thieu ban than" in first
        assert sleep_calls == [1.75]

    asyncio.run(run())

def test_scripted_llm_node_uses_larger_silence_threshold(monkeypatch) -> None:
    async def run() -> None:
        agent = Interviewer(
            context={
                "questions": [
                    {"text": "Gioi thieu ban than"},
                ],
                "interviewQuestionGapSeconds": "0.75",
                "interviewMinimumSilenceSeconds": "1.5",
            }
        )
        sleep_calls: list[float] = []

        async def fake_sleep(seconds: float) -> None:
            sleep_calls.append(seconds)

        async def fake_record_transcript(
            speaker_role, content, speech_duration_ms=None
        ):
            return None

        agent.record_transcript = fake_record_transcript
        monkeypatch.setattr(interviewer_module.asyncio, "sleep", fake_sleep)

        first = await agent.llm_node(
            DummyChatContext(DummyUserMessage("u1", "Xin chao")),
            [],
            None,
        )

        assert "Gioi thieu ban than" in first
        assert sleep_calls == [1.5]

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

        async def fake_record_transcript(
            speaker_role, content, speech_duration_ms=None
        ):
            return None

        agent.record_transcript = fake_record_transcript

        first = await agent.llm_node(
            DummyChatContext(DummyUserMessage("u1", "ok")), [], None
        )

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

        async def fake_record_transcript(
            speaker_role, content, speech_duration_ms=None
        ):
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
        qna_prompt = await agent.llm_node(None, [], None)
        closing = await agent.llm_node(
            DummyChatContext(DummyUserMessage("u1", "Khong co cau hoi them")),
            [],
            None,
        )

        assert "Cau hoi 1" in first
        assert "kết thúc" in closing.lower()
        assert "cong ty" in _strip_accents(qna_prompt).lower()
        assert "ket thuc" in _strip_accents(closing).lower()
        assert agent.completed is True

        await agent.finalize_completed_interview()
        await agent.finalize_completed_interview()

        assert status_calls == ["completed"]
        assert shutdown_calls["count"] == 1

    asyncio.run(run())


def test_scripted_llm_node_acknowledges_candidate_question_before_closing() -> None:
    async def run() -> None:
        agent = Interviewer(context={"questions": [{"text": "Cau hoi 1"}]})
        agent._llm_client = None

        async def fake_record_transcript(
            speaker_role, content, speech_duration_ms=None
        ):
            return None

        agent.record_transcript = fake_record_transcript

        first = await agent.llm_node(
            DummyChatContext(DummyUserMessage("u1", "Xin chao")), [], None
        )
        qna_prompt = await agent.llm_node(
            DummyChatContext(
                DummyUserMessage(
                    "u2",
                    "Toi co hon nam nam kinh nghiem giam sat cong trinh dan dung",
                )
            ),
            [],
            None,
        )
        closing = await agent.llm_node(
            DummyChatContext(
                DummyUserMessage(
                    "u3",
                    "Cho em hoi sau buoi phong van thi cong ty se phan hoi trong bao lau?",
                )
            ),
            [],
            None,
        )

        assert "Cau hoi 1" in first
        assert "cong ty" in _strip_accents(qna_prompt).lower()
        normalized_closing = _strip_accents(closing).lower()
        assert "ghi nhan cau hoi" in normalized_closing
        assert "bo phan tuyen dung" in normalized_closing
        assert "ket thuc" in normalized_closing
        assert agent.completed is True

    asyncio.run(run())


def test_scripted_llm_node_ignores_duplicate_user_turn() -> None:
    async def run() -> None:
        agent = Interviewer(context={"questions": [{"text": "Cau hoi 1"}]})

        async def fake_record_transcript(
            speaker_role, content, speech_duration_ms=None
        ):
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

    response = agent.build_employer_instruction_response(
        "Hoi sau hon ve kinh nghiem Revit"
    )

    assert "Revit" in response
    assert agent._scripted_question_index == 0


def test_employer_takeover_pauses_scripted_replies_until_released() -> None:
    async def run() -> None:
        agent = Interviewer(context={"questions": [{"text": "Cau hoi 1"}]})
        recorded = []

        async def fake_record_transcript(
            speaker_role, content, speech_duration_ms=None
        ):
            recorded.append((speaker_role, content, speech_duration_ms))

        agent.record_transcript = fake_record_transcript

        agent.pause_for_employer_takeover("HR User")
        paused = await agent.llm_node(
            DummyChatContext(DummyUserMessage("u1", "Xin chao")), [], None
        )

        assert paused is None
        assert agent.employer_takeover_active is True
        assert recorded == []

        agent.resume_from_employer_takeover("HR User")
        resumed = await agent.llm_node(
            DummyChatContext(DummyUserMessage("u1", "Xin chao")), [], None
        )

        assert "Cau hoi 1" in resumed
        assert agent.employer_takeover_active is False
        assert recorded == [("ai_agent", resumed, None)]

    asyncio.run(run())


def test_employer_instruction_speaks_immediately_and_records_transcript() -> None:
    class DummySession:
        def __init__(self):
            self.interrupted = False
            self.spoken = []

        async def interrupt(self, force=True):
            self.interrupted = True

        async def say(self, text, allow_interruptions=False):
            self.spoken.append((text, allow_interruptions))

    async def run() -> None:
        agent = Interviewer(context={"questions": [{"text": "Cau hoi 1"}]})
        session = DummySession()
        agent._session_override = session
        recorded = []

        async def fake_record_transcript(
            speaker_role, content, speech_duration_ms=None
        ):
            recorded.append((speaker_role, content, speech_duration_ms))

        agent.record_transcript = fake_record_transcript

        result = await agent.handle_employer_instruction(
            "Hoi sau hon ve kinh nghiem Revit"
        )

        assert result == "Hoi sau hon ve kinh nghiem Revit"
        assert session.interrupted is True
        assert session.spoken == [("Hoi sau hon ve kinh nghiem Revit", False)]
        assert recorded == [
            ("ai_agent", "Hoi sau hon ve kinh nghiem Revit", None),
        ]
        assert agent._last_asked_question_text == "Hoi sau hon ve kinh nghiem Revit"

    asyncio.run(run())


def test_employer_instruction_speaks_during_takeover() -> None:
    class DummySession:
        def __init__(self):
            self.interrupted = False
            self.spoken = []

        async def interrupt(self, force=True):
            self.interrupted = True

        async def say(self, text, allow_interruptions=False):
            self.spoken.append((text, allow_interruptions))

    async def run() -> None:
        agent = Interviewer(context={"questions": [{"text": "Cau hoi 1"}]})
        session = DummySession()
        agent._session_override = session
        recorded = []

        async def fake_record_transcript(
            speaker_role, content, speech_duration_ms=None
        ):
            recorded.append((speaker_role, content, speech_duration_ms))

        agent.record_transcript = fake_record_transcript

        # Employer activates takeover
        agent.pause_for_employer_takeover("HR User")
        assert agent.employer_takeover_active is True

        # Employer sends instruction - should NOT be dropped despite takeover
        result = await agent.handle_employer_instruction(
            "Ban da tung su dung Docker va Kubernetes chua?"
        )

        assert result == "Ban da tung su dung Docker va Kubernetes chua?"
        assert session.interrupted is True
        assert session.spoken == [("Ban da tung su dung Docker va Kubernetes chua?", False)]
        assert recorded == [
            ("ai_agent", "Ban da tung su dung Docker va Kubernetes chua?", None),
        ]

        # Completed session should drop instruction
        agent._completed = True
        completed_result = await agent.handle_employer_instruction("Cau hoi sau khi ket thuc")
        assert completed_result is None
        assert len(session.spoken) == 1

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
    text = "Cảm ơn bạn. Câu hỏi 2/2: Tại sao bạn ứng tuyển vào Square Group?"
    assert (
        strip_punctuation_for_tts(text)
        == "Cảm ơn bạn. Tại sao bạn ứng tuyển vào Square Group?"
    )


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
    assert (
        redact_question_progress_labels("Câu hỏi 1/2: Giới thiệu bản thân?")
        == "Giới thiệu bản thân?"
    )


def test_end_interview_intent_detection() -> None:
    from livekit_agent.interviewer import _looks_like_end_interview_intent

    assert _looks_like_end_interview_intent("Chấm dứt") is True
    assert _looks_like_end_interview_intent("kết thúc phỏng vấn") is True
    assert _looks_like_end_interview_intent("dừng phỏng vấn ở đây") is True
    assert _looks_like_end_interview_intent("thôi mình nghỉ") is True
    assert _looks_like_end_interview_intent("cho mình dừng nhé") is True
    assert _looks_like_end_interview_intent("hết câu hỏi rồi") is True
    assert _looks_like_end_interview_intent("Tôi có 5 năm kinh nghiệm") is False


def test_scripted_llm_node_handles_candidate_end_interview_verbally() -> None:
    async def run() -> None:
        agent = Interviewer(
            context={
                "questions": [
                    {"text": "Gioi thieu ban than"},
                    {"text": "Ly do ung tuyen"},
                ]
            }
        )
        reply1 = await agent.llm_node(
            DummyChatContext(DummyUserMessage("u1", "San sang")), [], None
        )
        assert "Gioi thieu ban than" in reply1
        assert agent.completed is False

        reply2 = await agent.llm_node(
            DummyChatContext(DummyUserMessage("u2", "Mình muốn chấm dứt phỏng vấn ở đây")),
            [],
            None,
        )
        assert agent.completed is True
        assert "ket thuc" in _strip_accents(reply2).lower()

    asyncio.run(run())


def test_handle_question_timeout_advances_to_next_question() -> None:
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
        async def fake_record(role, content, speech_duration_ms=None):
            recorded.append((role, content))
        agent.record_transcript = fake_record

        reply = await agent.handle_question_timeout()
        assert "het thoi gian" in _strip_accents(reply).lower()
        assert "Gioi thieu ban than" in reply

        reply2 = await agent.handle_question_timeout()
        assert "het thoi gian" in _strip_accents(reply2).lower()
        assert "Ly do ung tuyen" in reply2

    asyncio.run(run())


def test_handle_candidate_next_question_advances() -> None:
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
        async def fake_record(role, content, speech_duration_ms=None):
            recorded.append((role, content))
        agent.record_transcript = fake_record

        reply = await agent.handle_candidate_next_question()
        assert "chuyen sang" in _strip_accents(reply).lower()
        assert "Gioi thieu ban than" in reply

    asyncio.run(run())


def test_handle_candidate_finish_interview_marks_completed() -> None:
    async def run() -> None:
        agent = Interviewer(
            context={
                "questions": [
                    {"text": "Gioi thieu ban than"},
                ]
            }
        )
        recorded = []
        async def fake_record(role, content, speech_duration_ms=None):
            recorded.append((role, content))
        agent.record_transcript = fake_record

        reply = await agent.handle_candidate_finish_interview()
        assert agent.completed is True
        assert "ket thuc" in _strip_accents(reply).lower()

    asyncio.run(run())


def test_is_hostile_or_abusive_detection() -> None:
    assert is_hostile_or_abusive("Cút đi mày") is True
    assert is_hostile_or_abusive("dm cút") is True
    assert is_hostile_or_abusive("fuck you") is True
    assert is_hostile_or_abusive("con điên này") is True
    assert is_hostile_or_abusive("thằng ngu") is True
    assert is_hostile_or_abusive("mất dạy thật sự") is True

    # Normal conversation phrases must NOT be flagged
    assert is_hostile_or_abusive("Toi da tung lam giam sat du an lon") is False
    assert is_hostile_or_abusive("Buoi phong van rat thu vi") is False
    assert is_hostile_or_abusive("Cac ban co the cho toi biet them") is False
    assert is_hostile_or_abusive("Toi la Linh") is False


def test_is_explicit_refusal_or_skip_detection() -> None:
    assert is_explicit_refusal_or_skip("Em khong biet cau nay") is True
    assert is_explicit_refusal_or_skip("Bỏ qua đi") is True
    assert is_explicit_refusal_or_skip("Next câu khác đi ạ") is True
    assert is_explicit_refusal_or_skip("Chuyển câu khác đi") is True
    assert is_explicit_refusal_or_skip("Chịu thôi") is True

    assert is_explicit_refusal_or_skip("Tôi biết rất rõ về quy trình này") is False
    assert is_explicit_refusal_or_skip("Kinh nghiệm của tôi là năm năm") is False


def test_scripted_llm_node_handles_abusive_language_with_warning_and_termination() -> None:
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
        async def fake_record(role, content, speech_duration_ms=None):
            recorded.append((role, content))
        agent.record_transcript = fake_record

        first = await agent.llm_node(
            DummyChatContext(DummyUserMessage("u1", "Xin chào")), [], None
        )
        assert "Gioi thieu ban than" in first
        assert agent.completed is False

        # Strike 1: Candidate swears
        strike1_reply = await agent.llm_node(
            DummyChatContext(DummyUserMessage("u2", "Cút đi mày")), [], None
        )
        assert agent.completed is False
        assert "nói thêm" not in strike1_reply.lower()
        assert "case cụ thể" not in strike1_reply.lower()
        normalized_strike1 = _strip_accents(strike1_reply).lower()
        assert "van minh" in normalized_strike1 or "phu hop" in normalized_strike1

        # Strike 2: Candidate swears again
        strike2_reply = await agent.llm_node(
            DummyChatContext(DummyUserMessage("u3", "dm biến đi con điên")), [], None
        )
        assert agent.completed is True
        normalized_strike2 = _strip_accents(strike2_reply).lower()
        assert "ket thuc" in normalized_strike2

    asyncio.run(run())


def test_scripted_llm_node_advances_on_explicit_refusal_or_skip() -> None:
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
        async def fake_record(role, content, speech_duration_ms=None):
            recorded.append((role, content))
        agent.record_transcript = fake_record

        first = await agent.llm_node(
            DummyChatContext(DummyUserMessage("u1", "Xin chào")), [], None
        )
        assert "Gioi thieu ban than" in first

        # Candidate asks to skip
        skip_reply = await agent.llm_node(
            DummyChatContext(DummyUserMessage("u2", "Em không biết câu này, cho em bỏ qua")), [], None
        )
        assert "nói thêm" not in skip_reply.lower()
        assert "case cụ thể" not in skip_reply.lower()
        assert "Ly do ung tuyen" in skip_reply
        assert "chuyen sang" in _strip_accents(skip_reply).lower()

    asyncio.run(run())

