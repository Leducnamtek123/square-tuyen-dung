from unittest.mock import patch

import pytest
from django.utils import timezone
from rest_framework.test import APIClient

from apps.jobs.models import JobPostActivity
from apps.profiles.models import CompanyMember, CompanyRole
from shared.configs import variable_system as var_sys


class FakeFrappeService:
    def sync_application_to_frappe(self, activity, actor, payload):
        activity.status = var_sys.ApplicationStatus.HIRED
        activity.frappe_employee_id = "HR-EMP-0001"
        activity.frappe_user_id = payload.get("email") or activity.email or ""
        activity.frappe_sync_status = JobPostActivity.FrappeSyncStatus.SYNCED
        activity.frappe_sync_error = ""
        activity.frappe_synced_at = timezone.now()
        activity.save(
            update_fields=[
                "status",
                "frappe_employee_id",
                "frappe_user_id",
                "frappe_sync_status",
                "frappe_sync_error",
                "frappe_synced_at",
                "update_at",
            ]
        )
        return type(
            "Result",
            (),
            {
                "public_url": "https://hrm.example.test/app/employee/HR-EMP-0001",
                "recruiter_user": {"name": actor.email},
            },
        )()


@pytest.mark.django_db
def test_from_application_syncs_to_frappe(employer_user, job_post, job_seeker_user, resume):
    activity = JobPostActivity.objects.create(
        job_post=job_post,
        user=job_seeker_user,
        resume=resume,
        full_name="Candidate Hired",
        email="candidate@example.com",
        phone="0900000002",
        status=var_sys.ApplicationStatus.INTERVIEWED,
    )
    client = APIClient()
    client.force_authenticate(user=employer_user)

    with patch("integrations.frappe_hr.services.FrappeHRSyncService", return_value=FakeFrappeService()):
        response = client.post(
            "/api/v1/hrm/web/employees/from-application/",
            data={
                "applicationId": activity.id,
                "startDate": str(timezone.localdate()),
                "createFrappeAccount": True,
                "sendWelcomeEmail": False,
            },
            format="json",
        )

    assert response.status_code == 200
    payload = response.json()["data"]
    assert payload["hrmEmployeeId"] == "HR-EMP-0001"
    assert payload["hrmSyncStatus"] == JobPostActivity.FrappeSyncStatus.SYNCED
    activity.refresh_from_db()
    assert activity.status == var_sys.ApplicationStatus.HIRED
    assert activity.frappe_employee_id == "HR-EMP-0001"


@pytest.mark.django_db
def test_sync_service_creates_square_company_member(company, job_seeker_user):
    from integrations.frappe_hr.services import FrappeHRSyncService

    service = FrappeHRSyncService(client=object())

    member = service.ensure_square_company_member(company=company, email=job_seeker_user.email)

    assert member is not None
    assert member.company == company
    assert member.user == job_seeker_user
    assert member.status == CompanyMember.STATUS_ACTIVE
    assert member.is_active is True
    assert member.joined_at is not None

    role = CompanyRole.objects.get(company=company, code="employee")
    assert role.is_system is True
    assert role.permissions == []
