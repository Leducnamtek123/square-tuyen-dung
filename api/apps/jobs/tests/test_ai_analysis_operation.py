import json
from types import SimpleNamespace
import pytest

from apps.jobs.models import JobPostActivity
from apps.jobs.tasks import analyze_resume_ai
from apps.operations.models import AsyncOperation, OperationStatus
from apps.profiles.models import EmployerCandidateProfile
from shared.configs import variable_system as var_sys


@pytest.mark.django_db
def test_analyze_resume_ai_creates_operation(monkeypatch, employer_user, job_post):
    profile = EmployerCandidateProfile.objects.create(
        company=job_post.company,
        created_by=employer_user,
        full_name="AI Test Candidate",
        title="Python Engineer",
        description="Experienced Python and Django developer with async Celery background.",
        skills_summary="Python, Django, Celery, PostgreSQL, Docker",
    )
    activity = JobPostActivity.objects.create(
        job_post=job_post,
        manual_candidate_profile=profile,
        full_name=profile.full_name,
        email=profile.email,
        phone=profile.phone,
        status=var_sys.ApplicationStatus.INTERVIEWED,
    )

    def fake_acquire_slot(*args, **kwargs):
        return "slot:test:123"

    def fake_release_slot(*args, **kwargs):
        return True

    def fake_post_chat_completion_httpx(*args, **kwargs):
        return (
            {
                "choices": [
                    {
                        "message": {
                            "content": json.dumps(
                                {
                                    "score": 88,
                                    "summary": "Ứng viên phù hợp vị trí Backend Python.",
                                    "skills": ["Python", "Django", "Celery"],
                                    "pros": ["Có kinh nghiệm vững chắc"],
                                    "cons": [],
                                    "matching_skills": ["Python", "Django"],
                                    "missing_skills": [],
                                    "criteria_results": [
                                        {
                                            "key": "python_exp",
                                            "score": 90,
                                            "matched": True,
                                            "evidence": "Python and Django developer",
                                            "reason": "Phù hợp kỹ năng",
                                        }
                                    ],
                                    "evidence": [],
                                }
                            )
                        }
                    }
                ]
            },
            SimpleNamespace(model="mock-model", name="mock-llm"),
        )

    monkeypatch.setattr("apps.jobs.tasks._acquire_analysis_slot", fake_acquire_slot)
    monkeypatch.setattr("apps.jobs.tasks._release_analysis_slot", fake_release_slot)
    monkeypatch.setattr("apps.jobs.tasks.post_chat_completion_httpx", fake_post_chat_completion_httpx)

    analyze_resume_ai.run(activity.id)

    activity.refresh_from_db()
    assert activity.ai_analysis_status == "completed"

    op = AsyncOperation.objects.filter(
        type="candidate.ai_scan",
        metadata__activity_id=activity.id,
    ).first()

    assert op is not None, "AsyncOperation should be created for candidate.ai_scan"
    assert op.status == OperationStatus.COMPLETED
    assert op.progress == 100
    assert len(op.steps) == 4
    step_keys = [s["key"] for s in op.steps]
    assert step_keys == ["extract_text", "criteria_match", "llm_evaluation", "scoring_finalize"]
    for step in op.steps:
        assert step["status"] == "completed"
    assert op.result.get("score") == 88
    assert activity.ai_analysis_evidence.get("operation_id") == op.id


@pytest.mark.django_db
def test_analyze_resume_ai_handles_failure(monkeypatch, job_post):
    activity = JobPostActivity.objects.create(
        job_post=job_post,
        full_name="No Resume Candidate",
        status=var_sys.ApplicationStatus.INTERVIEWED,
    )

    def fake_acquire_slot(*args, **kwargs):
        return "slot:test:123"

    def fake_release_slot(*args, **kwargs):
        return True

    monkeypatch.setattr("apps.jobs.tasks._acquire_analysis_slot", fake_acquire_slot)
    monkeypatch.setattr("apps.jobs.tasks._release_analysis_slot", fake_release_slot)

    analyze_resume_ai.run(activity.id)

    activity.refresh_from_db()
    assert activity.ai_analysis_status == "failed"

    op = AsyncOperation.objects.filter(
        type="candidate.ai_scan",
        metadata__activity_id=activity.id,
    ).first()

    assert op is not None, "AsyncOperation should be created even if scan fails"
    assert op.status == OperationStatus.FAILED


@pytest.mark.django_db
def test_analyze_resume_ai_handles_exception(monkeypatch, employer_user, job_post):
    profile = EmployerCandidateProfile.objects.create(
        company=job_post.company,
        created_by=employer_user,
        full_name="Exception Candidate",
        title="Python Engineer",
        description="Experienced Python developer.",
    )
    activity = JobPostActivity.objects.create(
        job_post=job_post,
        manual_candidate_profile=profile,
        full_name=profile.full_name,
        status=var_sys.ApplicationStatus.INTERVIEWED,
    )

    def fake_acquire_slot(*args, **kwargs):
        return "slot:test:123"

    def fake_release_slot(*args, **kwargs):
        return True

    def fail_post_chat_completion_httpx(*args, **kwargs):
        raise RuntimeError("LLM Service Disconnected")

    monkeypatch.setattr("apps.jobs.tasks._acquire_analysis_slot", fake_acquire_slot)
    monkeypatch.setattr("apps.jobs.tasks._release_analysis_slot", fake_release_slot)
    monkeypatch.setattr("apps.jobs.tasks.post_chat_completion_httpx", fail_post_chat_completion_httpx)

    analyze_resume_ai.run(activity.id)

    activity.refresh_from_db()
    assert activity.ai_analysis_status == "failed"

    op = AsyncOperation.objects.filter(
        type="candidate.ai_scan",
        metadata__activity_id=activity.id,
    ).first()

    assert op is not None
    assert op.status == OperationStatus.FAILED
    assert "LLM Service Disconnected" in str(op.error)

