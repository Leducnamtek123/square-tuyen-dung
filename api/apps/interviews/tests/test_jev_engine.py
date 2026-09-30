import pytest

from apps.interviews.jev_engine import JevDecisionVerdict, JevGatekeeper, JevRubricScorer
from apps.interviews.tasks import InterviewEvaluationSchema
from apps.jobs.jev_matcher import JevCandidateMatcher, JevMatchVerdict


# ============================================================================
# 1. TESTS FOR JevRubricScorer
# ============================================================================


def test_rubric_scorer_high_competency_candidate():
    """Ứng viên xuất sắc có độ sâu kỹ thuật, trả lời theo phương pháp STAR, giao tiếp lịch sự."""
    transcripts = [
        {
            "speaker_role": "ai_agent",
            "content": "Chào bạn, bạn có thể giới thiệu về kinh nghiệm giải quyết sự cố hiệu năng trong dự án backend gần nhất?",
        },
        {
            "speaker_role": "candidate",
            "content": (
                "Dạ vâng, em xin chào anh chị. Về câu hỏi này, trong bối cảnh dự án hệ thống thanh toán sử dụng Python và Django, "
                "chúng em gặp phải vấn đề nghẽn truy vấn cơ sở dữ liệu PostgreSQL khi lượng truy cập tăng vọt. "
                "Nhiệm vụ và mục tiêu của em là phải giảm độ trễ response time từ 1.2s xuống dưới 200ms. "
                "Để giải quyết, em đã tiến hành profiling, áp dụng indexing tối ưu cho database và triển khai cơ chế caching bằng Redis. "
                "Đồng thời, em cấu hình Celery worker để xử lý tác vụ bất đồng bộ. "
                "Kết quả là hệ thống đã giảm 85% tải trên PostgreSQL, response time trung bình đạt 120ms và ban giám đốc đánh giá rất cao."
            ),
        },
        {
            "speaker_role": "ai_agent",
            "content": "Bạn đã áp dụng kiểm thử và CI/CD như thế nào?",
        },
        {
            "speaker_role": "candidate",
            "content": (
                "Dạ, em luôn chú trọng viết unit test và integration test với pytest đạt độ bao phủ trên 85%. "
                "Ngoài ra, em thiết lập pipeline CI/CD với Docker và Kubernetes trên AWS để tự động hóa việc kiểm thử và triển khai."
            ),
        },
    ]

    verdict = JevRubricScorer.score_transcript(
        transcripts,
        job_context={"skills": ["Python", "Django", "PostgreSQL", "Redis", "Docker"]},
    )

    assert isinstance(verdict, JevDecisionVerdict)
    assert verdict.score >= 7.5
    assert verdict.intent_or_verdict in ("STRONG_PASS", "PASS")
    assert verdict.confidence >= 0.80

    rubrics = verdict.rubrics
    assert rubrics["technical_depth"] >= 7.0
    assert rubrics["communication"] >= 7.0
    assert rubrics["problem_solving"] >= 7.0
    assert rubrics["relevance_and_clarity"] >= 7.0

    # Kiểm tra strengths & weaknesses
    assert len(verdict.metadata["strengths"]) > 0
    assert verdict.metadata["star_count"] >= 3


def test_rubric_scorer_low_competency_or_evasive():
    """Ứng viên né tránh, trả lời cộc lốc hoặc không biết."""
    transcripts = [
        {"speaker_role": "ai_agent", "content": "Bạn có kinh nghiệm gì về Docker và Kubernetes không?"},
        {"speaker_role": "candidate", "content": "Em không biết, em chưa làm cái này bao giờ."},
        {"speaker_role": "ai_agent", "content": "Vậy bạn xử lý cache trong ứng dụng web thế nào?"},
        {"speaker_role": "candidate", "content": "Chưa tìm hiểu, bỏ qua đi ạ."},
        {"speaker_role": "ai_agent", "content": "Bạn có từng làm việc nhóm chưa?"},
        {"speaker_role": "candidate", "content": "Có ạ."},
    ]

    verdict = JevRubricScorer.score_transcript(transcripts)

    assert isinstance(verdict, JevDecisionVerdict)
    assert verdict.score <= 4.5
    assert verdict.intent_or_verdict in ("REJECT", "NEEDS_REVIEW")
    assert verdict.rubrics["technical_depth"] <= 4.5
    assert verdict.rubrics["relevance_and_clarity"] <= 4.5
    assert len(verdict.metadata["weaknesses"]) > 0


def test_rubric_scorer_empty_candidate_transcripts():
    """Không có câu trả lời nào từ ứng viên."""
    transcripts = [
        {"speaker_role": "ai_agent", "content": "Xin chào bạn, bạn đã sẵn sàng chưa?"},
    ]

    verdict = JevRubricScorer.score_transcript(transcripts)

    assert verdict.score == 1.0
    assert verdict.intent_or_verdict == "REJECT"
    assert verdict.rubrics["technical_depth"] == 1.0
    assert verdict.metadata["total_words"] == 0


def test_rubric_scorer_handles_object_attributes():
    """Hỗ trợ cả object instance (như Django ORM model) có speaker_role và content."""

    class DummyTranscript:
        def __init__(self, role, content):
            self.speaker_role = role
            self.content = content

    transcripts = [
        DummyTranscript("ai_agent", "Hãy giải thích kiến trúc Clean Architecture?"),
        DummyTranscript(
            "candidate",
            "Dạ vâng, Clean Architecture chia hệ thống thành các layer độc lập: domain, usecase và infrastructure. "
            "Nhờ đó việc viết unit test và bảo trì mã nguồn Python trở nên linh hoạt hơn rất nhiều.",
        ),
    ]

    verdict = JevRubricScorer.score_transcript(transcripts)
    assert verdict.score >= 5.0
    assert verdict.metadata["total_words"] > 20


# ============================================================================
# 2. TESTS FOR JevGatekeeper
# ============================================================================


def test_gatekeeper_should_invoke_llm_true():
    """Nội dung đầy đủ (> 15 từ, có câu thực chất) -> cho phép gọi LLM."""
    transcripts = [
        {"speaker_role": "ai_agent", "content": "Bạn hãy mô tả một dự án tiêu biểu?"},
        {
            "speaker_role": "candidate",
            "content": "Tôi từng phát triển hệ thống e-commerce với Django, xử lý hàng chục nghìn đơn hàng mỗi ngày bằng Redis và Celery.",
        },
    ]

    should_invoke, reason = JevGatekeeper.should_invoke_llm(transcripts)
    assert should_invoke is True
    assert "đủ điều kiện" in reason


def test_gatekeeper_should_invoke_llm_false_too_short():
    """Nội dung quá ngắn (< 15 từ) -> không gọi LLM để tiết kiệm chi phí."""
    transcripts = [
        {"speaker_role": "ai_agent", "content": "Bạn hãy giới thiệu bản thân?"},
        {"speaker_role": "candidate", "content": "Em là Nam, lập trình viên."},
    ]

    should_invoke, reason = JevGatekeeper.should_invoke_llm(transcripts)
    assert should_invoke is False
    assert "quá ngắn" in reason


def test_gatekeeper_should_invoke_llm_false_only_evasive():
    """Nội dung dù dài nhưng chỉ chứa từ ngữ né tránh không có giá trị đánh giá."""
    transcripts = [
        {"speaker_role": "ai_agent", "content": "Bạn biết gì về AI?"},
        {
            "speaker_role": "candidate",
            "content": "Không biết không biết không biết không rõ chưa từng làm em không nhớ.",
        },
    ]

    should_invoke, reason = JevGatekeeper.should_invoke_llm(transcripts)
    assert should_invoke is False
    assert "không có câu trả lời nào mang nội dung thực chất" in reason or "quá ngắn" in reason


def test_gatekeeper_generate_fast_evaluation_schema_compliance():
    """Fast evaluation payload phải tuân thủ 100% InterviewEvaluationSchema của tasks.py."""
    transcripts = [
        {"speaker_role": "ai_agent", "content": "Chào bạn, hãy kể về kinh nghiệm Python và REST API của bạn?"},
        {
            "speaker_role": "candidate",
            "content": "Dạ em có 4 năm làm việc với Python, Django REST Framework, thiết kế microservices và tối ưu hóa PostgreSQL.",
        },
    ]

    fast_eval = JevGatekeeper.generate_fast_evaluation(
        transcripts,
        job_post_title="Senior Python Backend Developer",
    )

    # Đảm bảo schema validation không bắn ValidationError
    validated = InterviewEvaluationSchema.model_validate(fast_eval)

    assert 1.0 <= validated.overall_score <= 10.0
    assert 1.0 <= validated.technical_score <= 10.0
    assert 1.0 <= validated.communication_score <= 10.0
    assert isinstance(validated.summary, str) and len(validated.summary) > 0
    assert isinstance(validated.strengths, list)
    assert isinstance(validated.weaknesses, list)
    assert len(validated.detailed_feedback.question_performance) >= 1

    qp = validated.detailed_feedback.question_performance[0]
    assert 1 <= qp.score <= 10
    assert len(qp.feedback) > 0

    soft = validated.detailed_feedback.soft_skills
    assert 1 <= soft.confidence <= 10
    assert 1 <= soft.clarity <= 10
    assert isinstance(soft.tone, str)
    assert isinstance(validated.detailed_feedback.cultural_fit, str)


# ============================================================================
# 3. TESTS FOR JevCandidateMatcher
# ============================================================================


def test_candidate_matcher_strong_match_dict():
    """Ứng viên đáp ứng đầy đủ kỹ năng, kinh nghiệm, học vấn và mức lương trong ngân sách."""
    cv_data = {
        "title": "Senior Backend Developer",
        "skills": ["Python", "Django", "PostgreSQL", "Docker", "Redis"],
        "experience": 5,
        "academic_level": "Đại học",
        "salary_min": 30000000,
        "salary_max": 40000000,
        "summary": "5 năm kinh nghiệm lập trình backend với Python và kiến trúc phân tán.",
    }

    job_req = {
        "job_name": "Senior Python Engineer",
        "skills": ["Python", "Django", "Postgres", "Docker"],
        "min_experience_years": 4,
        "education_level": "Đại học",
        "salary_min": 25000000,
        "salary_max": 45000000,
    }

    verdict = JevCandidateMatcher.evaluate_match(cv_data, job_req)

    assert isinstance(verdict, JevMatchVerdict)
    assert verdict.match_score >= 85.0
    assert verdict.pass_hard_requirements is True
    assert len(verdict.missing_skills) == 0
    assert set(verdict.matched_skills) == {"Python", "Django", "Postgres", "Docker"}
    assert verdict.experience_alignment in ("MEETS", "EXCEEDS")
    assert verdict.confidence >= 0.85


def test_candidate_matcher_tech_synonyms():
    """Kiểm tra nhận diện từ đồng nghĩa kỹ thuật (JS/JavaScript, K8s/Kubernetes, DRF/Django, TS/TypeScript)."""
    cv_data = {
        "skills": ["JS", "TS", "K8s", "DRF"],
        "experience": 3,
        "academic_level": "Cao đẳng",
    }

    job_req = {
        "skills": ["JavaScript", "TypeScript", "Kubernetes", "Django"],
        "min_experience_years": 2,
    }

    verdict = JevCandidateMatcher.evaluate_match(cv_data, job_req)

    assert verdict.pass_hard_requirements is True
    assert len(verdict.matched_skills) == 4
    assert len(verdict.missing_skills) == 0


def test_candidate_matcher_missing_hard_requirements():
    """Ứng viên thiếu toàn bộ kỹ năng bắt buộc và kinh nghiệm kém xa yêu cầu."""
    cv_data = {
        "skills": ["Photoshop", "Figma", "Illustrator"],
        "experience": 0.5,
        "academic_level": "THPT",
        "salary_min": 50000000,
    }

    job_req = {
        "skills": ["Python", "Golang", "Kubernetes"],
        "min_experience_years": 5,
        "education_level": "Đại học",
        "salary_max": 30000000,
    }

    verdict = JevCandidateMatcher.evaluate_match(cv_data, job_req)

    assert verdict.pass_hard_requirements is False
    assert verdict.match_score < 50.0
    assert verdict.experience_alignment == "INSUFFICIENT"
    assert "CHƯA ĐẠT TIÊU CHÍ CỨNG" in verdict.reasoning


def test_candidate_matcher_from_raw_cv_string():
    """Kiểm tra phân tích CV từ chuỗi văn bản không định dạng (raw string)."""
    raw_cv_text = """
    HỌ VÀ TÊN: NGUYỄN VĂN AN
    Vị trí: Lập trình viên Python Backend
    Kinh nghiệm: 4 năm kinh nghiệm làm việc với Django, FastAPI, MySQL, Redis, Docker.
    Học vấn: Tốt nghiệp Đại học Bách Khoa Hà Nội chuyên ngành CNTT.
    Mức lương mong muốn: 25 - 35 triệu VND.
    """

    job_req = {
        "skills": ["Python", "FastAPI", "Docker", "MySQL"],
        "min_experience_years": 3,
        "education_level": "Đại học",
        "salary_max": 40000000,
    }

    verdict = JevCandidateMatcher.evaluate_match(raw_cv_text, job_req)

    assert verdict.pass_hard_requirements is True
    assert verdict.match_score >= 80.0
    assert "Python" in verdict.matched_skills
    assert "FastAPI" in verdict.matched_skills
    assert verdict.experience_alignment in ("MEETS", "EXCEEDS")
