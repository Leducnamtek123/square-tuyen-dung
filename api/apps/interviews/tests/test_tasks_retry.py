from unittest.mock import patch
import pytest

from apps.interviews.models import InterviewSession
from apps.interviews.tasks import (
    end_interview_session,
    send_interview_invitation,
    send_interview_report_notification,
)


@pytest.fixture(autouse=True)
def mock_broadcast(monkeypatch):
    monkeypatch.setattr("apps.interviews.services.broadcast_interview_event", lambda *a, **kw: None)
    monkeypatch.setattr("apps.interviews.tasks.broadcast_interview_event", lambda *a, **kw: None)


@pytest.mark.django_db
def test_end_interview_session_handles_non_existent():
    # Calling with a non-existent session ID should return cleanly without raising
    result = end_interview_session.run(999999999)
    assert result is None


@pytest.mark.django_db
def test_end_interview_session_raises_on_unexpected_error(monkeypatch, job_seeker_user, job_post):
    session = InterviewSession.objects.create(
        candidate=job_seeker_user,
        job_post=job_post,
        status="in_progress",
    )

    def fake_save(*args, **kwargs):
        raise RuntimeError("Database connection lost during save")

    monkeypatch.setattr(session, "save", fake_save)
    monkeypatch.setattr(InterviewSession.objects, "get", lambda id: session)

    with pytest.raises(RuntimeError, match="Database connection lost"):
        end_interview_session.run(session.id)


@pytest.mark.django_db
def test_send_interview_invitation_handles_non_existent():
    # Calling with non-existent session ID should return False cleanly
    result = send_interview_invitation.run(999999999)
    assert result is False


@pytest.mark.django_db
def test_send_interview_invitation_raises_on_mail_error(job_seeker_user, job_post):
    session = InterviewSession.objects.create(
        candidate=job_seeker_user,
        job_post=job_post,
        status="scheduled",
    )

    with patch("apps.interviews.tasks.send_mail", side_effect=ConnectionError("SMTP connection timed out")):
        with pytest.raises(ConnectionError, match="SMTP connection timed out"):
            send_interview_invitation.run(session.id)


@pytest.mark.django_db
def test_send_interview_report_notification_handles_non_existent():
    result = send_interview_report_notification.run(999999999)
    assert result is False


@pytest.mark.django_db
def test_send_interview_report_notification_raises_on_mail_error(job_seeker_user):
    session = InterviewSession.objects.create(
        candidate=job_seeker_user,
        created_by=job_seeker_user,
        status="completed",
    )

    with patch("apps.interviews.tasks.send_mail", side_effect=ConnectionError("SMTP connection refused")):
        with pytest.raises(ConnectionError, match="SMTP connection refused"):
            send_interview_report_notification.run(session.id)

