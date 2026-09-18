import json
from types import SimpleNamespace
import pytest

from apps.interviews.models import InterviewSession, InterviewTranscript
from apps.interviews.tasks import evaluate_interview_session
from apps.operations.models import AsyncOperation, OperationStatus


@pytest.fixture(autouse=True)
def mock_broadcast(monkeypatch):
    monkeypatch.setattr("apps.interviews.services.broadcast_interview_event", lambda *a, **kw: None)
    monkeypatch.setattr("apps.interviews.tasks.broadcast_interview_event", lambda *a, **kw: None)


@pytest.mark.django_db
def test_evaluate_interview_session_creates_operation(monkeypatch, job_seeker_user, job_post):
    session = InterviewSession.objects.create(
        candidate=job_seeker_user,
        job_post=job_post,
        status="processing",
    )
    InterviewTranscript.objects.create(
        interview=session,
        speaker_role="ai_agent",
        content="Chào bạn, bạn có thể giới thiệu về kinh nghiệm lập trình backend không?",
    )
    InterviewTranscript.objects.create(
        interview=session,
        speaker_role="candidate",
        content="Tôi có hơn năm năm kinh nghiệm làm việc với Python, Django và kiến trúc microservices phân tán.",
    )

    fake_response = {
        "choices": [
            {
                "message": {
                    "content": json.dumps(
                        {
                            "overall_score": 8.5,
                            "technical_score": 9.0,
                            "communication_score": 8.0,
                            "summary": "Ứng viên thể hiện năng lực chuyên môn xuất sắc và phản xạ tốt.",
                            "strengths": ["Thành thạo Python", "Hiểu sâu kiến trúc phân tán"],
                            "weaknesses": ["Cần bổ sung thêm ví dụ thực tế"],
                            "detailed_feedback": {
                                "question_performance": [
                                    {
                                        "question": "Giới thiệu kinh nghiệm",
                                        "feedback": "Trả lời đầy đủ, trọng tâm",
                                        "score": 9,
                                    }
                                ],
                                "soft_skills": {
                                    "confidence": 8,
                                    "clarity": 8,
                                    "tone": "Tự tin, chuyên nghiệp",
                                },
                                "cultural_fit": "Phù hợp văn hóa công ty",
                            },
                        }
                    )
                }
            }
        ]
    }

    def fake_post_chat_completion_httpx(*args, **kwargs):
        return fake_response, SimpleNamespace(name="mock-llm")

    monkeypatch.setattr(
        "apps.interviews.tasks.post_chat_completion_httpx",
        fake_post_chat_completion_httpx,
    )

    evaluate_interview_session.run(session.id)

    session.refresh_from_db()
    assert session.status == "completed"
    assert session.session_metadata is not None
    assert "operation_id" in session.session_metadata

    op = AsyncOperation.objects.filter(
        type="interview.evaluate",
        metadata__session_id=session.id,
    ).first()

    assert op is not None, "AsyncOperation should be created for interview.evaluate"
    assert op.id == session.session_metadata["operation_id"]
    assert op.status == OperationStatus.COMPLETED
    assert op.progress == 100
    assert len(op.steps) == 5

    step_keys = [s["key"] for s in op.steps]
    assert step_keys == [
        "sync_recording",
        "transcribe_align",
        "ai_scoring",
        "apply_weights",
        "publish_report",
    ]
    for step in op.steps:
        assert step["status"] == "completed"

    assert op.result is not None
    assert op.result.get("overallScore") == float(session.ai_overall_score or 0)
    assert op.result.get("technicalScore") == float(session.ai_technical_score or 0)
    assert op.result.get("communicationScore") == float(session.ai_communication_score or 0)
    assert op.result.get("summary") == session.ai_summary


@pytest.mark.django_db
def test_evaluate_interview_session_handles_insufficient_transcripts(monkeypatch, job_seeker_user, job_post):
    session = InterviewSession.objects.create(
        candidate=job_seeker_user,
        job_post=job_post,
        status="processing",
    )

    evaluate_interview_session.run(session.id)

    session.refresh_from_db()
    assert session.status == "completed"

    op = AsyncOperation.objects.filter(
        type="interview.evaluate",
        metadata__session_id=session.id,
    ).first()

    assert op is not None, "AsyncOperation should be created even if insufficient transcripts"
    assert op.status == OperationStatus.FAILED
    assert op.error is not None
    assert op.error.get("code") == "INSUFFICIENT_DATA"


@pytest.mark.django_db
def test_evaluate_interview_session_handles_llm_exception(monkeypatch, job_seeker_user, job_post):
    session = InterviewSession.objects.create(
        candidate=job_seeker_user,
        job_post=job_post,
        status="processing",
    )
    InterviewTranscript.objects.create(
        interview=session,
        speaker_role="ai_agent",
        content="Chào bạn, hãy giới thiệu bản thân.",
    )
    InterviewTranscript.objects.create(
        interview=session,
        speaker_role="candidate",
        content="Tôi là lập trình viên có kinh nghiệm với Python và Django fullstack.",
    )

    def fail_post_chat_completion_httpx(*args, **kwargs):
        raise RuntimeError("LLM Service Disconnected")

    monkeypatch.setattr(
        "apps.interviews.tasks.post_chat_completion_httpx",
        fail_post_chat_completion_httpx,
    )

    evaluate_interview_session.run(session.id)

    session.refresh_from_db()
    assert session.status == "completed"

    op = AsyncOperation.objects.filter(
        type="interview.evaluate",
        metadata__session_id=session.id,
    ).first()

    assert op is not None, "AsyncOperation should be created even when LLM raises exception"
    assert op.status == OperationStatus.FAILED
    assert op.error is not None
    assert op.error.get("code") == "EVALUATION_FAILED"
