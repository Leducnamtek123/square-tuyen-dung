import time

from livekit_agent.decision_engine import (
    DecisionVerdict,
    TurnIntent,
    VoiceDecisionEngine,
    evaluate_candidate_turn,
)


def test_hostile_abuse_classification() -> None:
    test_cases = [
        # Accented
        "Cút đi mày",
        "Đồ ngu ngốc mất dạy",
        "Thằng óc chó này",
        "Đụ má biến đi",
        "Mặt lồn hỏi nhảm",
        # Unaccented
        "dm bien di",
        "fuck you bitch",
        "cut di me may",
        "thang ngu oc cho",
        # Teencode / Acronyms
        "vcl câu hỏi chán thế",
        "vkl bot ngu",
        "dkm biến luôn đi",
        "hãm lol thật sự",
    ]

    engine = VoiceDecisionEngine()
    for text in test_cases:
        verdict = engine.classify_turn(text)
        assert verdict.intent == TurnIntent.HOSTILE_ABUSE, f"Failed for '{text}': got {verdict.intent}"
        assert verdict.confidence >= 0.80, f"Low confidence for '{text}': {verdict.confidence}"
        assert len(verdict.reasoning) > 0
        assert "latency_ms" in verdict.metadata


def test_refusal_or_skip_classification() -> None:
    test_cases = [
        "Em không biết câu này, xin bỏ qua",
        "Cho em đổi câu khác đi ạ",
        "Next câu này đi",
        "Skip đi bạn",
        "Chịu thôi em chưa tìm hiểu phần này",
        "Chưa có kinh nghiệm phần này nên em xin qua câu",
        "Em không muốn trả lời câu này",
        "Chưa chuẩn bị câu này, cho qua nhé",
    ]

    engine = VoiceDecisionEngine()
    for text in test_cases:
        verdict = engine.classify_turn(text)
        assert verdict.intent == TurnIntent.REFUSAL_OR_SKIP, f"Failed for '{text}': got {verdict.intent}"
        assert verdict.confidence >= 0.80, f"Low confidence for '{text}': {verdict.confidence}"
        assert len(verdict.reasoning) > 0


def test_clarification_or_hesitation_classification() -> None:
    test_cases = [
        "Em chưa nghe rõ câu hỏi, chị nói lại được không ạ?",
        "Nhắc lại câu hỏi giúp em với",
        "Đọc lại câu hỏi được không ạ?",
        "Cho em xin phép suy nghĩ một chút",
        "Chờ em một chút để em nhớ lại",
        "Đợi em một tí ạ",
        "Ý bạn là gì ạ?",
        "Câu hỏi là gì vậy ạ?",
        "Câu này hơi khó một chút, cho em suy nghĩ",
    ]

    engine = VoiceDecisionEngine()
    for text in test_cases:
        verdict = engine.classify_turn(text)
        assert verdict.intent == TurnIntent.NEED_CLARIFICATION_OR_HESITATION, f"Failed for '{text}': got {verdict.intent}"
        assert verdict.confidence >= 0.75, f"Low confidence for '{text}': {verdict.confidence}"
        assert len(verdict.reasoning) > 0


def test_question_for_interviewer_classification() -> None:
    test_cases = [
        "Cho em hỏi về chế độ bảo hiểm và đãi ngộ của công ty như thế nào ạ?",
        "Anh cho em hỏi quy trình tuyển dụng các vòng tiếp theo ra sao ạ?",
        "Em muốn hỏi về lộ trình thăng tiến và văn hóa công ty tại Square",
        "Bao giờ thì em nhận được kết quả phỏng vấn ạ?",
        "Cho em hỏi công ty có hỗ trợ làm việc remote hay hybrid không ạ?",
        "Cho mình hỏi tech stack và công nghệ sử dụng trong dự án sắp tới là gì?",
    ]

    engine = VoiceDecisionEngine()
    for text in test_cases:
        verdict = engine.classify_turn(text)
        assert verdict.intent == TurnIntent.QUESTION_FOR_INTERVIEWER, f"Failed for '{text}': got {verdict.intent}"
        assert verdict.confidence >= 0.80, f"Low confidence for '{text}': {verdict.confidence}"
        assert len(verdict.reasoning) > 0


def test_end_interview_classification() -> None:
    test_cases = [
        "Em muốn dừng phỏng vấn tại đây",
        "Thôi mình nghỉ phỏng vấn nhé",
        "Chấm dứt phỏng vấn ở đây",
        "Xin phép dừng buổi phỏng vấn hôm nay",
        "Không muốn phỏng vấn nữa, dừng lại đi",
        "Cho mình dừng nhé",
    ]

    engine = VoiceDecisionEngine()
    for text in test_cases:
        verdict = engine.classify_turn(text)
        assert verdict.intent == TurnIntent.END_INTERVIEW, f"Failed for '{text}': got {verdict.intent}"
        assert verdict.confidence >= 0.80, f"Low confidence for '{text}': {verdict.confidence}"
        assert len(verdict.reasoning) > 0


def test_substantive_vs_shallow_answers() -> None:
    substantive_cases = [
        "Tôi có hơn năm năm kinh nghiệm làm việc với Django, FastAPI và React, từng phụ trách tối ưu hóa cơ sở dữ liệu cho 1 triệu người dùng.",
        "Trong dự án trước, tôi đảm nhận vai trò Tech Lead phối hợp với đội ngũ 8 kỹ sư để triển khai hệ thống microservices phục vụ khách hàng.",
        "Tôi đã từng xử lý sự cố nghẽn mạng phân tán bằng cách áp dụng caching Redis kết hợp Kafka message broker.",
    ]

    shallow_cases = [
        "Dạ có",
        "Tôi biết một ít",
        "Cũng bình thường thôi",
        "Làm rồi",
        "Chưa ạ",
    ]

    engine = VoiceDecisionEngine()

    for text in substantive_cases:
        verdict = engine.classify_turn(text)
        assert verdict.intent == TurnIntent.SUBSTANTIVE_ANSWER, f"Failed for substantive '{text}': got {verdict.intent}"
        assert verdict.confidence >= 0.70, f"Low confidence for substantive '{text}': {verdict.confidence}"

    for text in shallow_cases:
        verdict = engine.classify_turn(text)
        assert verdict.intent == TurnIntent.SHALLOW_ANSWER, f"Failed for shallow '{text}': got {verdict.intent}"
        assert verdict.confidence >= 0.70, f"Low confidence for shallow '{text}': {verdict.confidence}"


def test_greeting_ready_classification() -> None:
    test_cases = [
        "Xin chào, em đã sẵn sàng",
        "Alo, mình nghe rõ rồi",
        "Chào bạn, bắt đầu được rồi",
        "Dạ vâng, ok sẵn sàng ạ",
    ]

    engine = VoiceDecisionEngine()
    for text in test_cases:
        verdict = engine.classify_turn(text)
        assert verdict.intent == TurnIntent.GREETING_READY, f"Failed for '{text}': got {verdict.intent}"
        assert verdict.confidence >= 0.70


def test_confidence_calibration_and_edge_cases() -> None:
    engine = VoiceDecisionEngine(temperature=1.2)

    # Empty inputs
    verdict_empty = engine.classify_turn("")
    assert verdict_empty.intent == TurnIntent.UNKNOWN
    assert 0.0 <= verdict_empty.confidence <= 1.0

    verdict_whitespace = engine.classify_turn("   \t  \n ")
    assert verdict_whitespace.intent == TurnIntent.UNKNOWN
    assert 0.0 <= verdict_whitespace.confidence <= 1.0

    # Module helper check
    helper_verdict = evaluate_candidate_turn("Bỏ qua câu này đi")
    assert isinstance(helper_verdict, DecisionVerdict)
    assert helper_verdict.intent == TurnIntent.REFUSAL_OR_SKIP
    assert 0.0 <= helper_verdict.confidence <= 1.0


def test_proctoring_acknowledgment_classification() -> None:
    test_cases = [
        "Dạ em xin lỗi ạ",
        "Em xin lỗi, em vừa bị lag",
        "Dạ vâng em quay lại rồi",
        "Em bấm nhầm, xin lỗi bạn",
        "Dạ em hiểu rồi ạ",
        "Vâng ạ, em đây rồi",
        "Dạ em sẽ chú ý ạ",
    ]

    engine = VoiceDecisionEngine()
    for text in test_cases:
        verdict = engine.classify_turn(text)
        assert verdict.intent == TurnIntent.PROCTORING_ACKNOWLEDGMENT, f"Failed for '{text}': got {verdict.intent}"
        assert verdict.confidence >= 0.75, f"Low confidence for '{text}': {verdict.confidence}"
        assert len(verdict.reasoning) > 0


def test_execution_latency_under_1ms() -> None:
    engine = VoiceDecisionEngine()
    sample_turns = [
        "Cút đi mày đồ ngu",
        "Cho em xin đổi sang câu hỏi tiếp theo",
        "Cho em hỏi mức lương và chế độ đãi ngộ bên mình thế nào ạ?",
        "Em muốn dừng phỏng vấn ở đây",
        "Tôi có 5 năm kinh nghiệm quản lý dự án công nghệ thông tin",
        "Dạ có",
        "Chào bạn mình đã sẵn sàng",
    ]

    latencies: list[float] = []
    # Warm up
    for text in sample_turns:
        engine.classify_turn(text)

    # Measure 200 iterations
    t0 = time.perf_counter()
    iterations = 200
    for _ in range(iterations):
        for text in sample_turns:
            verdict = engine.classify_turn(text)
            latencies.append(verdict.metadata["latency_ms"])
    total_time = time.perf_counter() - t0

    avg_latency_ms = (total_time / (iterations * len(sample_turns))) * 1000
    assert avg_latency_ms < 1.0, f"Average latency too high: {avg_latency_ms:.3f}ms (target < 1.0ms)"
