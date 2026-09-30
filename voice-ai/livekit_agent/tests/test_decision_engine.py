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
        "Pass câu này nhé",
        "Cho em pass qua câu tiếp theo ạ",
        "Chịu thôi em chưa tìm hiểu phần này",
        "Chưa có kinh nghiệm phần này nên em xin qua câu",
        "Em không muốn trả lời câu này",
        "Chưa chuẩn bị câu này, cho qua nhé",
        "Em chưa có câu trả lời cho câu này, bỏ qua giúp em",
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
        "Chị nhắc lại giúp em câu vừa rồi được không ạ?",
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
        "Em xin dừng cuộc phỏng vấn tại đây ạ",
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
        "Biết sơ sơ",
        "Tạm được thôi",
        "Có làm qua rồi",
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
        assert "shallow" in verdict.reasoning.lower() or "brief" in verdict.reasoning.lower()


def test_star_method_substantive_answer_boost() -> None:
    """Kiểm tra nhận diện phương pháp STAR (Tình huống, Nhiệm vụ, Giải pháp, Kết quả, Bài học, Số liệu %, Dự án)

    được tăng cường độ tin cậy và có siêu dữ liệu star_analysis đầy đủ.
    """
    star_cases = [
        # Full STAR with Situation, Task, Action, Result/Metrics, Lessons
        (
            "Trong dự án fintech trước đây, tình huống là hệ thống xử lý giao dịch bị nghẽn cổ chai. "
            "Nhiệm vụ của tôi là tối ưu hóa kiến trúc cơ sở dữ liệu. "
            "Tôi đã triển khai giải pháp phân vùng database kết hợp Redis cache. "
            "Kết quả là thông lượng hệ thống tăng 40%, xử lý được 10000 req/s và giảm độ trễ 50%. "
            "Bài học kinh nghiệm rút ra là cần thiết kế sharding từ giai đoạn đầu.",
            ["Situation", "Task", "Action", "Result/Lesson"],
        ),
        # Situation, Action, Result with metric multiplier & project
        (
            "Khi gặp sự cố quá tải server tại dự án thương mại điện tử, "
            "tôi đã chủ động đề xuất giải pháp áp dụng microservices và message queue Kafka. "
            "Kết quả là hệ thống vận hành ổn định 99.9% uptime và phục vụ 2 triệu người dùng.",
            ["Situation", "Action", "Result/Lesson"],
        ),
        # Task, Action, Metric growth
        (
            "Tôi được giao nhiệm vụ cải thiện tốc độ tải trang frontend. "
            "Tôi đã tiến hành tối ưu hóa bundle size, lazy loading hình ảnh và refactor code React. "
            "Nhờ đó tốc độ tải trang đã cải thiện gấp đôi, đạt điểm Core Web Vitals trên 90%.",
            ["Task", "Action", "Result/Lesson"],
        ),
        # Action, Result with percentage reduction
        (
            "Tôi đã áp dụng giải pháp tối ưu hóa câu lệnh SQL và đánh index lại database. "
            "Kết quả là thời gian phản hồi của API giảm 60% và tiết kiệm tài nguyên CPU.",
            ["Action", "Result/Lesson"],
        ),
    ]

    engine = VoiceDecisionEngine()
    for text, expected_dims in star_cases:
        verdict = engine.classify_turn(text)
        assert verdict.intent == TurnIntent.SUBSTANTIVE_ANSWER, f"Failed for '{text}': got {verdict.intent}"
        assert verdict.confidence >= 0.80, f"Expected high confidence for STAR answer: {verdict.confidence}"

        star_analysis = verdict.metadata.get("star_analysis")
        assert star_analysis is not None, f"Missing star_analysis in metadata for '{text}'"
        assert star_analysis["star_count"] >= len(expected_dims) - 1, (
            f"Expected at least {len(expected_dims) - 1} dimensions, got {star_analysis['star_count']}"
        )
        assert "STAR" in verdict.reasoning


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


def test_proctoring_acknowledgment_classification() -> None:
    """Kiểm tra xác nhận cảnh báo proctoring, mở camera, mic, tuân thủ quy định."""
    test_cases = [
        # Yêu cầu đề bài chỉ định rõ
        "Vâng em hiểu, em đã sẵn sàng theo quy định, em đã mở camera rồi ạ",
        "vâng em hiểu",
        "em đã sẵn sàng theo quy định",
        "em đã mở camera",
        "Dạ em hiểu rồi, em đã mở camera và bật mic rồi ạ",
        "Em đã bật camera rồi ạ",
        "Em mở cam rồi, xin lỗi bạn",
        "Dạ em đã sẵn sàng theo đúng quy định phỏng vấn",
        "Vâng em hiểu quy định, phòng em chỉ có một mình em thôi",
        "Em đã chia sẻ màn hình theo quy định rồi ạ",
        "Dạ em xin lỗi, em chỉnh lại camera ngay đây",
        "Em đã tắt các tab khác và tập trung vào màn hình rồi ạ",
        "Em nhìn thẳng vào camera rồi ạ",
        # Các trường hợp lỗi kỹ thuật / lời xin lỗi
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
        assert verdict.intent == TurnIntent.PROCTORING_ACKNOWLEDGMENT, (
            f"Failed for '{text}': got {verdict.intent} (reasoning: {verdict.reasoning})"
        )
        assert verdict.confidence >= 0.75, f"Low confidence for '{text}': {verdict.confidence}"
        assert len(verdict.reasoning) > 0


def test_whisper_hallucination_classification() -> None:
    """Kiểm tra nhận diện ảo giác Whisper (YouTube outro, silence artifacts, âm thanh ngoặc vuông)."""
    test_cases = [
        "Cảm ơn các bạn đã theo dõi video, hãy like và subscribe kênh nhé",
        "Đăng ký kênh và bấm chuông thông báo",
        "Ghiền Mì Gõ",
        "Hẹn gặp lại các bạn trong những video tiếp theo",
        "Like và share video hấp dẫn này nhé",
        "Chúc các bạn một ngày tốt lành",
        "[âm nhạc]",
        "[tiếng cười]",
        "[tiếng vỗ tay]",
        "[music]",
        "(âm nhạc)",
        "[silence]",
    ]

    engine = VoiceDecisionEngine()
    for text in test_cases:
        verdict = engine.classify_turn(text)
        assert verdict.intent == TurnIntent.WHISPER_HALLUCINATION, f"Failed for '{text}': got {verdict.intent}"
        assert verdict.confidence == 1.0
        assert "Whisper" in verdict.reasoning or "hallucination" in verdict.reasoning.lower()


def test_confidence_calibration_and_edge_cases() -> None:
    engine = VoiceDecisionEngine(temperature=1.2)

    # Empty inputs
    verdict_empty = engine.classify_turn("")
    assert verdict_empty.intent == TurnIntent.UNKNOWN
    assert 0.0 <= verdict_empty.confidence <= 1.0

    verdict_none = engine.classify_turn(None)
    assert verdict_none.intent == TurnIntent.UNKNOWN
    assert 0.0 <= verdict_none.confidence <= 1.0

    verdict_whitespace = engine.classify_turn("   \t  \n ")
    assert verdict_whitespace.intent == TurnIntent.UNKNOWN
    assert 0.0 <= verdict_whitespace.confidence <= 1.0

    # Non-linguistic punctuation / symbols
    verdict_symbols = engine.classify_turn("...???!!! --- ...")
    assert verdict_symbols.intent == TurnIntent.UNKNOWN
    assert 0.0 <= verdict_symbols.confidence <= 1.0

    # Module helper check
    helper_verdict = evaluate_candidate_turn("Bỏ qua câu này đi")
    assert isinstance(helper_verdict, DecisionVerdict)
    assert helper_verdict.intent == TurnIntent.REFUSAL_OR_SKIP
    assert 0.0 <= helper_verdict.confidence <= 1.0


def test_execution_latency_under_1ms() -> None:
    """Xác thực cam kết hiệu năng: Độ trễ xử lý trung bình nghiêm ngặt < 1ms trên CPU."""
    engine = VoiceDecisionEngine()
    sample_turns = [
        "Cút đi mày đồ ngu",
        "Cho em xin đổi sang câu hỏi tiếp theo",
        "Cho em hỏi mức lương và chế độ đãi ngộ bên mình thế nào ạ?",
        "Em muốn dừng phỏng vấn ở đây",
        "Trong dự án fintech trước đây, tình huống là hệ thống xử lý giao dịch bị nghẽn cổ chai. "
        "Nhiệm vụ của tôi là tối ưu hóa kiến trúc cơ sở dữ liệu. Tôi đã triển khai giải pháp Redis cache kết quả là giảm độ trễ 50%.",
        "Dạ có",
        "Chào bạn mình đã sẵn sàng",
        "Vâng em hiểu, em đã sẵn sàng theo quy định, em đã mở camera rồi ạ",
        "Cảm ơn các bạn đã theo dõi video hãy like và subscribe",
        "[âm nhạc]",
        "Tôi có 5 năm kinh nghiệm quản lý dự án công nghệ thông tin",
    ]

    latencies: list[float] = []
    # Warm up
    for text in sample_turns:
        engine.classify_turn(text)

    # Đo lường 500 iterations (5500 lần phân loại liên tục)
    iterations = 500
    t0 = time.perf_counter()
    for _ in range(iterations):
        for text in sample_turns:
            verdict = engine.classify_turn(text)
            latencies.append(verdict.metadata["latency_ms"])
    total_time = time.perf_counter() - t0

    avg_latency_ms = (total_time / (iterations * len(sample_turns))) * 1000
    assert avg_latency_ms < 1.0, f"Average latency too high: {avg_latency_ms:.3f}ms (target < 1.0ms)"

    # Kiểm tra thêm percentile 99th
    latencies.sort()
    p99_latency_ms = latencies[int(len(latencies) * 0.99)]
    assert p99_latency_ms < 1.0, f"P99 latency too high: {p99_latency_ms:.3f}ms (target < 1.0ms)"
