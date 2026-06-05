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
def test_from_application_rejects_unconfigured_frappe_roles(
    settings,
    employer_user,
    job_post,
    job_seeker_user,
    resume,
):
    settings.FRAPPE_HR_EMPLOYEE_ROLES = ["Employee"]
    activity = JobPostActivity.objects.create(
        job_post=job_post,
        user=job_seeker_user,
        resume=resume,
        full_name="Candidate Role Escalation",
        email="candidate-role@test.com",
        phone="0900000003",
        status=var_sys.ApplicationStatus.INTERVIEWED,
    )
    client = APIClient()
    client.force_authenticate(user=employer_user)

    with patch("integrations.frappe_hr.services.FrappeHRSyncService", return_value=FakeFrappeService()) as service_mock:
        response = client.post(
            "/api/v1/hrm/web/employees/from-application/",
            data={
                "applicationId": activity.id,
                "createFrappeAccount": True,
                "frappeRoles": ["System Manager"],
            },
            format="json",
    )

    assert response.status_code == 400
    assert "frappeRoles" in response.json()["error"]["details"]
    assert not service_mock.called


@pytest.mark.django_db
def test_from_application_requires_manage_employees_permission(
    company,
    job_post,
    job_seeker_user,
    resume,
):
    member = company.user.__class__.objects.create_user_with_role_name(
        email="frappe-candidate-only@test.com",
        full_name="Frappe Candidate Only",
        role_name=var_sys.JOB_SEEKER,
        password="pass123",
        is_active=True,
        is_verify_email=True,
    )
    role = CompanyRole.objects.create(
        company=company,
        code="candidate-only",
        name="Candidate Only",
        permissions=["manage_candidates"],
    )
    CompanyMember.objects.create(
        company=company,
        user=member,
        role=role,
        status=CompanyMember.STATUS_ACTIVE,
        is_active=True,
    )
    activity = JobPostActivity.objects.create(
        job_post=job_post,
        user=job_seeker_user,
        resume=resume,
        full_name="Candidate Not HRM",
        email="candidate-not-hrm@example.com",
        phone="0900000006",
        status=var_sys.ApplicationStatus.INTERVIEWED,
    )
    client = APIClient()
    client.force_authenticate(user=member)

    with patch("integrations.frappe_hr.services.FrappeHRSyncService", return_value=FakeFrappeService()) as service_mock:
        response = client.post(
            "/api/v1/hrm/web/employees/from-application/",
            data={
                "applicationId": activity.id,
                "startDate": str(timezone.localdate()),
            },
            format="json",
        )

    assert response.status_code == 403
    assert not service_mock.called
    activity.refresh_from_db()
    assert activity.status == var_sys.ApplicationStatus.INTERVIEWED
    assert activity.frappe_sync_status == JobPostActivity.FrappeSyncStatus.NOT_SYNCED


def test_sync_service_ignores_unconfigured_employee_roles(settings):
    from integrations.frappe_hr.services import FrappeHRSyncService

    settings.FRAPPE_HR_EMPLOYEE_ROLES = ["Employee"]
    service = FrappeHRSyncService(client=object())

    assert service._employee_roles(["Employee", "System Manager"]) == ["Employee"]


@pytest.mark.django_db
def test_sync_service_handles_manual_candidate_without_user_or_email(monkeypatch, employer_user, job_post):
    from integrations.frappe_hr.services import FrappeHRSyncService

    class FakeClient:
        def find_one(self, *args, **kwargs):
            return None

        def create_document(self, doctype, data):
            return {"name": "HR-EMP-MANUAL", **data}

        def update_document(self, doctype, name, data):
            return {"name": name, **data}

    activity = JobPostActivity.objects.create(
        job_post=job_post,
        user=None,
        resume=None,
        full_name="Manual Candidate",
        email=None,
        phone="0900000004",
        status=var_sys.ApplicationStatus.INTERVIEWED,
    )
    service = FrappeHRSyncService(client=FakeClient())
    monkeypatch.setattr(service, "ensure_company", lambda company: {"name": "Frappe Company"})
    monkeypatch.setattr(service, "ensure_designation", lambda job_title: {"name": job_title or "Designation"})
    monkeypatch.setattr(service, "ensure_department", lambda department, company_name: None)
    monkeypatch.setattr(service, "provision_recruiter_account", lambda actor, company_name: None)
    monkeypatch.setattr(service, "ensure_employee_prerequisites", lambda gender: None)
    monkeypatch.setattr(service, "ensure_user_permission", lambda **kwargs: None)
    monkeypatch.setattr(service, "ensure_square_company_member", lambda **kwargs: None)

    result = service.sync_application_to_frappe(
        activity,
        employer_user,
        {"create_user_account": False},
    )

    activity.refresh_from_db()
    assert result.employee["name"] == "HR-EMP-MANUAL"
    assert activity.frappe_sync_status == JobPostActivity.FrappeSyncStatus.SYNCED
    assert activity.frappe_user_id == ""


@pytest.mark.django_db
def test_sync_service_skips_user_account_when_email_missing(monkeypatch, employer_user, job_post):
    from integrations.frappe_hr.services import FrappeHRSyncService

    class FakeClient:
        def find_one(self, *args, **kwargs):
            return None

        def create_document(self, doctype, data):
            return {"name": "HR-EMP-NO-EMAIL", **data}

        def update_document(self, doctype, name, data):
            return {"name": name, **data}

    calls = {
        "ensure_user": 0,
        "ensure_user_permission": 0,
        "ensure_square_company_member": 0,
    }
    activity = JobPostActivity.objects.create(
        job_post=job_post,
        user=None,
        resume=None,
        full_name="Manual Candidate No Email",
        email=None,
        phone="0900000005",
        status=var_sys.ApplicationStatus.INTERVIEWED,
    )
    service = FrappeHRSyncService(client=FakeClient())
    monkeypatch.setattr(service, "ensure_company", lambda company: {"name": "Frappe Company"})
    monkeypatch.setattr(service, "ensure_designation", lambda job_title: {"name": job_title or "Designation"})
    monkeypatch.setattr(service, "ensure_department", lambda department, company_name: None)
    monkeypatch.setattr(service, "provision_recruiter_account", lambda actor, company_name: None)
    monkeypatch.setattr(service, "ensure_employee_prerequisites", lambda gender: None)

    def ensure_user(**kwargs):
        calls["ensure_user"] += 1
        return {"name": kwargs.get("email") or "blank-user"}

    def ensure_user_permission(**kwargs):
        calls["ensure_user_permission"] += 1

    def ensure_square_company_member(**kwargs):
        calls["ensure_square_company_member"] += 1

    monkeypatch.setattr(service, "ensure_user", ensure_user)
    monkeypatch.setattr(service, "ensure_user_permission", ensure_user_permission)
    monkeypatch.setattr(service, "ensure_square_company_member", ensure_square_company_member)

    service.sync_application_to_frappe(
        activity,
        employer_user,
        {"create_user_account": True, "send_welcome_email": True},
    )

    activity.refresh_from_db()
    assert activity.frappe_sync_status == JobPostActivity.FrappeSyncStatus.SYNCED
    assert activity.frappe_user_id == ""
    assert calls == {
        "ensure_user": 0,
        "ensure_user_permission": 0,
        "ensure_square_company_member": 0,
    }


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
