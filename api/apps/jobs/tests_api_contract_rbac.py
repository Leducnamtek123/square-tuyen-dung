import pytest
from rest_framework.test import APIClient

from apps.accounts.models import User
from apps.profiles.models import JobSeekerProfile
from shared.configs import variable_system as var_sys


@pytest.mark.django_db
def test_common_configs_returns_standard_success_envelope():
    client = APIClient()

    response = client.get("/api/v1/common/configs/")

    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True
    assert "data" in payload
    assert payload["error"] is None


@pytest.mark.django_db
def test_private_resume_requires_auth_and_returns_error_envelope():
    client = APIClient()

    response = client.get("/api/v1/info/app/private-resumes/1/resume-owner/")

    assert response.status_code in (401, 403)
    payload = response.json()
    assert payload["success"] is False
    assert payload["data"] is None
    assert isinstance(payload["error"], dict)
    assert "code" in payload["error"]


@pytest.mark.django_db
def test_web_save_job_is_forbidden_for_employer_role(employer_user, job_post):
    client = APIClient()
    client.force_authenticate(user=employer_user)

    response = client.post(f"/api/v1/job/web/job-posts/{job_post.slug}/save/")

    assert response.status_code == 403
    payload = response.json()
    assert payload["success"] is False
    assert payload["data"] is None


@pytest.mark.django_db
def test_jobseeker_profile_endpoint_blocks_access_to_other_user_profile(job_seeker_user, location):
    other_user = User.objects.create_user_with_role_name(
        email="jobseeker2@test.com",
        full_name="Other Job Seeker",
        role_name=var_sys.JOB_SEEKER,
        password="testpass123",
        is_active=True,
        is_verify_email=True,
    )
    other_profile = JobSeekerProfile.objects.create(
        user=other_user,
        phone="0911222333",
        location=location,
    )

    client = APIClient()
    client.force_authenticate(user=job_seeker_user)

    response = client.get(f"/api/v1/info/web/job-seeker-profiles/{other_profile.id}/")

    assert response.status_code == 404
    payload = response.json()
    assert payload["success"] is False
    assert payload["data"] is None


@pytest.mark.django_db
def test_employer_send_email_nonexistent_activity_returns_404(employer_user):
    client = APIClient()
    client.force_authenticate(user=employer_user)

    response = client.post(
        "/api/v1/job/web/employer-job-posts-activity/999999/send-email/",
        data={
            "fullName": "Candidate Test",
            "title": "Interview invitation",
            "content": "Please join interview",
            "email": "candidate@example.com",
            "isSendMe": False,
        },
        format="json",
    )

    assert response.status_code == 404
    payload = response.json()
    assert payload["success"] is False
    assert payload["data"] is None
