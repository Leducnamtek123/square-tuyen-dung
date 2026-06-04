"""
Unit tests for the Profiles app — models, services, and serializers.
"""
import pytest
from datetime import timedelta
from django.utils import timezone
from rest_framework.test import APIClient

from apps.profiles.models import (
    Resume, Company, CompanyFollowed,
    JobSeekerProfile, ResumeViewed, ResumeSaved,
    EducationDetail, ExperienceDetail, Certificate, LanguageSkill, AdvancedSkill,
    CompanyVerification, TrustReport, CompanyRole, CompanyMember
)
from apps.profiles.services import ResumeService, CompanyService, ensure_company_system_roles
from shared.configs import variable_system as var_sys


# ==================== Model Tests ====================

@pytest.mark.django_db
class TestResumeModel:
    """Tests for Resume model."""

    def test_resume_creation(self, resume):
        assert resume.title == 'Backend Developer'
        assert resume.is_active is True
        assert resume.salary_min == 15000000

    def test_resume_str(self, resume):
        result = str(resume)
        assert 'Backend Developer' in result

    def test_resume_belongs_to_user(self, resume, job_seeker_user):
        assert resume.user == job_seeker_user

    def test_resume_has_career(self, resume, career):
        assert resume.career == career


@pytest.mark.django_db
class TestCompanyModel:
    """Tests for Company model."""

    def test_company_creation(self, company):
        assert company.company_name == 'Test Company'
        assert company.tax_code == '1234567890'

    def test_company_str(self, company):
        assert str(company) is not None

    def test_company_belongs_to_employer(self, company, employer_user):
        assert company.user == employer_user

    def test_company_unique_tax_code(self, company, db):
        from django.db import IntegrityError
        with pytest.raises(IntegrityError):
            Company.objects.create(
                company_name='Another Company',
                company_email='other@test.com',
                company_phone='0912345678',
                tax_code='1234567890',  # duplicate
                user=company.user,
            )


@pytest.mark.django_db
class TestCompanyFollowed:
    """Tests for CompanyFollowed model."""

    def test_follow_company(self, job_seeker_user, company):
        follow = CompanyFollowed.objects.create(
            user=job_seeker_user, company=company
        )
        assert follow.user == job_seeker_user
        assert follow.company == company

    def test_follow_str(self, job_seeker_user, company):
        follow = CompanyFollowed.objects.create(
            user=job_seeker_user, company=company
        )
        assert str(follow) is not None


@pytest.mark.django_db
class TestSocialProfilePipeline:
    def test_save_profile_creates_job_seeker_profile(self, job_seeker_user):
        from apps.profiles.pipeline import save_profile

        save_profile(backend=None, user=job_seeker_user, response={})

        assert JobSeekerProfile.objects.filter(user=job_seeker_user).exists()
        assert Resume.objects.filter(user=job_seeker_user).exists()

    def test_save_profile_skips_employer_user(self, employer_user):
        from apps.profiles.pipeline import save_profile

        save_profile(backend=None, user=employer_user, response={})

        assert not JobSeekerProfile.objects.filter(user=employer_user).exists()
        assert not Resume.objects.filter(user=employer_user).exists()


# ==================== Service Tests ====================

@pytest.mark.django_db
class TestResumeService:
    """Tests for ResumeService."""

    def test_get_optimized_queryset(self, resume):
        qs = ResumeService.get_optimized_resume_queryset()
        assert resume in qs

    def test_get_active_resumes(self, resume):
        resumes = ResumeService.get_active_resumes()
        assert resume in resumes

    def test_get_active_resumes_excludes_inactive(self, resume):
        resume.is_active = False
        resume.save()
        resumes = ResumeService.get_active_resumes()
        assert resume not in resumes

    def test_get_active_resumes_filter_career(self, resume, career):
        resumes = ResumeService.get_active_resumes(career_id=career.id)
        assert resume in resumes

        resumes = ResumeService.get_active_resumes(career_id=99999)
        assert resume not in resumes

    def test_toggle_save_resume(self, company, resume):
        # Save
        saved, msg = ResumeService.toggle_save_resume(company, resume)
        assert saved is True
        assert ResumeSaved.objects.filter(company=company, resume=resume).exists()

        # Unsave
        saved, msg = ResumeService.toggle_save_resume(company, resume)
        assert saved is False
        assert not ResumeSaved.objects.filter(company=company, resume=resume).exists()

    def test_record_resume_view(self, company, resume):
        created = ResumeService.record_resume_view(company, resume)
        assert created is True
        assert ResumeViewed.objects.filter(company=company, resume=resume).exists()

        # Second view — idempotent
        created = ResumeService.record_resume_view(company, resume)
        assert created is False
        assert ResumeViewed.objects.filter(company=company, resume=resume).count() == 1

    def test_saved_resume_export_handles_missing_profile_location(self, employer_user, company, resume):
        resume.job_seeker_profile.location = None
        resume.job_seeker_profile.save(update_fields=["location", "update_at"])
        ResumeSaved.objects.create(company=company, resume=resume)

        client = APIClient()
        client.force_authenticate(user=employer_user)

        response = client.get("/api/v1/info/web/resumes-saved/export/")

        assert response.status_code == 200
        assert response.data["data"]


@pytest.mark.django_db
class TestCompanyService:
    """Tests for CompanyService."""

    def test_get_optimized_queryset(self, company):
        qs = CompanyService.get_optimized_company_queryset()
        assert company in qs

    def test_toggle_follow(self, job_seeker_user, company):
        # Follow
        following, msg = CompanyService.toggle_follow(job_seeker_user, company)
        assert following is True
        assert CompanyFollowed.objects.filter(
            user=job_seeker_user, company=company
        ).exists()

        # Unfollow
        following, msg = CompanyService.toggle_follow(job_seeker_user, company)
        assert following is False
        assert not CompanyFollowed.objects.filter(
            user=job_seeker_user, company=company
        ).exists()

    def test_get_company_stats(self, company):
        stats = CompanyService.get_company_stats(company)
        assert stats['total_followers'] == 0
        assert stats['total_jobs'] >= 0
        assert 'resumes_saved' in stats
        assert 'resumes_viewed' in stats

    def test_ensure_company_system_roles_creates_reserved_roles(self, company):
        roles = ensure_company_system_roles(company)

        owner = roles["owner"]
        hr = roles["hr"]
        assert owner.is_system is True
        assert owner.permissions == ["*"]
        assert hr.is_system is True
        assert "manage_question_bank" in hr.permissions


@pytest.mark.django_db
def test_public_company_list_excludes_unverified_company(company):
    client = APIClient()
    response = client.get("/api/v1/info/web/companies/", {"cacheBust": company.id})

    assert response.status_code == 200
    payload = response.json()
    data = payload.get("data", payload)
    results = data.get("results", data if isinstance(data, list) else [])
    assert company.id not in [item["id"] for item in results]


@pytest.mark.django_db
def test_company_owner_member_me_returns_owner_system_role(employer_user, company):
    ensure_company_system_roles(company)
    client = APIClient()
    client.force_authenticate(user=employer_user)

    response = client.get("/api/v1/info/web/company-members/me/")

    assert response.status_code == 200
    data = response.data["data"]
    assert data["isOwner"] is True
    assert data["role"]["code"] == "owner"


@pytest.mark.django_db
def test_employer_can_create_and_list_manual_candidate(employer_user, company, career, city):
    client = APIClient()
    client.force_authenticate(user=employer_user)

    response = client.post(
        "/api/v1/info/web/employer-candidates/",
        {
            "fullName": "Nguyen Van A",
            "email": "candidate-a@example.com",
            "phone": "0901000001",
            "title": "Frontend Developer",
            "salaryMin": 12000000,
            "salaryMax": 22000000,
            "experience": 2,
            "position": 3,
            "academicLevel": 2,
            "typeOfWorkplace": 1,
            "jobType": 1,
            "career": career.id,
            "city": city.id,
            "description": "Candidate added by HR.",
            "skillsSummary": "React, TypeScript",
            "note": "Met at career fair.",
        },
        format="json",
    )

    assert response.status_code == 201
    created = response.data["data"]
    assert created["fullName"] == "Nguyen Van A"
    assert created["company"] == company.id
    assert created["slug"]

    list_response = client.get("/api/v1/info/web/employer-candidates/")

    assert list_response.status_code == 200
    results = list_response.data["results"]
    assert [item["fullName"] for item in results] == ["Nguyen Van A"]


@pytest.mark.django_db
def test_employer_manual_candidates_are_scoped_to_active_company(
    employer_user,
    company,
    location,
):
    from apps.accounts.models import User

    client = APIClient()
    client.force_authenticate(user=employer_user)
    create_response = client.post(
        "/api/v1/info/web/employer-candidates/",
        {
            "fullName": "Private Candidate",
            "title": "Backend Developer",
        },
        format="json",
    )
    assert create_response.status_code == 201

    other_user = User.objects.create_user_with_role_name(
        email="other-employer@test.com",
        full_name="Other Employer",
        role_name=var_sys.EMPLOYER,
        password="pass123",
        is_active=True,
        has_company=True,
    )
    Company.objects.create(
        company_name="Other Company",
        company_email="other-company@test.com",
        company_phone="0902000000",
        tax_code="9999999999",
        user=other_user,
        location=location,
    )

    client.force_authenticate(user=other_user)
    list_response = client.get("/api/v1/info/web/employer-candidates/")

    assert list_response.status_code == 200
    assert list_response.data["results"] == []


@pytest.mark.django_db
def test_employer_can_delete_own_manual_candidate(employer_user, company):
    client = APIClient()
    client.force_authenticate(user=employer_user)
    create_response = client.post(
        "/api/v1/info/web/employer-candidates/",
        {
            "fullName": "Delete Me",
            "title": "QA Engineer",
        },
        format="json",
    )
    slug = create_response.data["data"]["slug"]

    delete_response = client.delete(f"/api/v1/info/web/employer-candidates/{slug}/")
    list_response = client.get("/api/v1/info/web/employer-candidates/")

    assert delete_response.status_code == 204
    assert list_response.data["results"] == []


@pytest.mark.django_db
def test_job_seeker_cannot_create_manual_candidate(job_seeker_user):
    client = APIClient()
    client.force_authenticate(user=job_seeker_user)

    response = client.post(
        "/api/v1/info/web/employer-candidates/",
        {
            "fullName": "Blocked Candidate",
            "title": "Designer",
        },
        format="json",
    )

    assert response.status_code == 403


@pytest.mark.django_db
def test_job_seeker_cannot_create_resume_details_for_other_user_resume(
    job_seeker_user,
    location,
    career,
    city,
):
    other_user = job_seeker_user.__class__.objects.create_user_with_role_name(
        email="other-resume-owner@test.com",
        full_name="Other Resume Owner",
        role_name=var_sys.JOB_SEEKER,
        password="pass123",
        is_active=True,
    )
    other_profile = JobSeekerProfile.objects.create(
        user=other_user,
        phone="0903000000",
        location=location,
    )
    other_resume = Resume.objects.create(
        title="Other Owner Resume",
        description="Private resume",
        salary_min=10000000,
        salary_max=20000000,
        experience=2,
        is_active=True,
        user=other_user,
        job_seeker_profile=other_profile,
        career=career,
        city=city,
    )

    client = APIClient()
    client.force_authenticate(user=job_seeker_user)

    cases = [
        (
            "/api/v1/info/web/educations-detail/",
            {
                "degreeName": "Bachelor",
                "major": "Software Engineering",
                "trainingPlaceName": "University",
                "startDate": "2020-01-01",
                "resumeId": other_resume.id,
            },
            EducationDetail,
        ),
        (
            "/api/v1/info/web/experiences-detail/",
            {
                "jobName": "Developer",
                "companyName": "Private Company",
                "startDate": "2020-01-01",
                "endDate": "2021-01-01",
                "resumeId": other_resume.id,
            },
            ExperienceDetail,
        ),
        (
            "/api/v1/info/web/certificates-detail/",
            {
                "name": "Private Certificate",
                "trainingPlace": "Private Center",
                "startDate": "2020-01-01",
                "resumeId": other_resume.id,
            },
            Certificate,
        ),
        (
            "/api/v1/info/web/language-skills/",
            {
                "language": 2,
                "level": 3,
                "resumeId": other_resume.id,
            },
            LanguageSkill,
        ),
        (
            "/api/v1/info/web/advanced-skills/",
            {
                "name": "Private Skill",
                "level": 4,
                "resumeId": other_resume.id,
            },
            AdvancedSkill,
        ),
    ]

    for endpoint, payload, model in cases:
        response = client.post(endpoint, payload, format="json")
        assert response.status_code == 400, endpoint
        assert not model.objects.filter(resume=other_resume).exists(), endpoint

    assert not EducationDetail.objects.filter(resume=other_resume).exists()


@pytest.mark.django_db
def test_company_member_without_profile_permission_can_read_company_info(company):
    member = company.user.__class__.objects.create_user_with_role_name(
        email="company-reader@test.com",
        full_name="Company Reader",
        role_name=var_sys.JOB_SEEKER,
        password="pass123",
        is_active=True,
    )
    role = CompanyRole.objects.create(
        company=company,
        code="reader",
        name="Reader",
        permissions=["manage_candidates"],
    )
    CompanyMember.objects.create(
        company=company,
        user=member,
        role=role,
        status=CompanyMember.STATUS_ACTIVE,
        is_active=True,
    )
    client = APIClient()
    client.force_authenticate(user=member)

    response = client.get("/api/v1/info/web/company/")

    assert response.status_code == 200
    assert response.data["data"]["id"] == company.id


@pytest.mark.django_db
def test_company_member_update_cannot_change_user(employer_user, company):
    member_user = company.user.__class__.objects.create_user_with_role_name(
        email="member-original@test.com",
        full_name="Original Member",
        role_name=var_sys.JOB_SEEKER,
        password="pass123",
        is_active=True,
    )
    other_user = company.user.__class__.objects.create_user_with_role_name(
        email="member-other@test.com",
        full_name="Other Member",
        role_name=var_sys.JOB_SEEKER,
        password="pass123",
        is_active=True,
    )
    role = CompanyRole.objects.create(
        company=company,
        code="member-update-role",
        name="Member Update Role",
        permissions=["manage_candidates"],
    )
    member = CompanyMember.objects.create(
        company=company,
        user=member_user,
        role=role,
        status=CompanyMember.STATUS_ACTIVE,
        is_active=True,
    )
    client = APIClient()
    client.force_authenticate(user=employer_user)

    response = client.patch(
        f"/api/v1/info/web/company-members/{member.id}/",
        {"userId": other_user.id},
        format="json",
    )

    assert response.status_code == 400
    member.refresh_from_db()
    assert member.user_id == member_user.id


@pytest.mark.django_db
def test_company_member_and_role_actions_are_scoped_to_active_company(employer_user, company):
    other_owner = company.user.__class__.objects.create_user_with_role_name(
        email="other-scope-owner@test.com",
        full_name="Other Scope Owner",
        role_name=var_sys.EMPLOYER,
        password="pass123",
        is_active=True,
        has_company=True,
    )
    other_member_user = company.user.__class__.objects.create_user_with_role_name(
        email="other-scope-member@test.com",
        full_name="Other Scope Member",
        role_name=var_sys.JOB_SEEKER,
        password="pass123",
        is_active=True,
    )
    other_company = Company.objects.create(
        company_name="Other Scope Company",
        company_email="other-scope-company@test.com",
        company_phone="0907000000",
        tax_code="SCOPE0001",
        user=other_owner,
    )
    other_role = CompanyRole.objects.create(
        company=other_company,
        code="other-hr",
        name="Other HR",
        permissions=["manage_members"],
    )
    other_member = CompanyMember.objects.create(
        company=other_company,
        user=other_member_user,
        role=other_role,
        status=CompanyMember.STATUS_ACTIVE,
        is_active=True,
    )

    client = APIClient()
    client.force_authenticate(user=employer_user)

    list_response = client.get("/api/v1/info/web/company-members/")
    assert list_response.status_code == 200
    assert other_member.id not in [item["id"] for item in list_response.data["results"]]

    member_update_response = client.patch(
        f"/api/v1/info/web/company-members/{other_member.id}/",
        {"status": CompanyMember.STATUS_DISABLED},
        format="json",
    )
    member_delete_response = client.delete(f"/api/v1/info/web/company-members/{other_member.id}/")
    role_update_response = client.patch(
        f"/api/v1/info/web/company-roles/{other_role.id}/",
        {"name": "Changed Other HR"},
        format="json",
    )
    role_delete_response = client.delete(f"/api/v1/info/web/company-roles/{other_role.id}/")

    assert member_update_response.status_code == 404
    assert member_delete_response.status_code == 404
    assert role_update_response.status_code == 404
    assert role_delete_response.status_code == 404

    other_member.refresh_from_db()
    other_role.refresh_from_db()
    assert other_member.status == CompanyMember.STATUS_ACTIVE
    assert other_role.name == "Other HR"


@pytest.mark.django_db
def test_company_role_manager_cannot_grant_permissions_they_do_not_have(company):
    role_manager_user = company.user.__class__.objects.create_user_with_role_name(
        email="role-manager@test.com",
        full_name="Role Manager",
        role_name=var_sys.JOB_SEEKER,
        password="pass123",
        is_active=True,
    )
    role_manager = CompanyRole.objects.create(
        company=company,
        code="role-manager",
        name="Role Manager",
        permissions=["manage_roles"],
    )
    CompanyMember.objects.create(
        company=company,
        user=role_manager_user,
        role=role_manager,
        status=CompanyMember.STATUS_ACTIVE,
        is_active=True,
    )

    client = APIClient()
    client.force_authenticate(user=role_manager_user)

    create_response = client.post(
        "/api/v1/info/web/company-roles/",
        {
            "code": "escalated-role",
            "name": "Escalated Role",
            "permissions": ["manage_roles", "manage_members"],
        },
        format="json",
    )
    update_response = client.patch(
        f"/api/v1/info/web/company-roles/{role_manager.id}/",
        {"permissions": ["*"]},
        format="json",
    )

    assert create_response.status_code == 403
    assert update_response.status_code == 403
    role_manager.refresh_from_db()
    assert role_manager.permissions == ["manage_roles"]
    assert not CompanyRole.objects.filter(company=company, code="escalated-role").exists()


@pytest.mark.django_db
def test_company_role_rejects_unknown_permission_key(employer_user, company):
    client = APIClient()
    client.force_authenticate(user=employer_user)

    response = client.post(
        "/api/v1/info/web/company-roles/",
        {
            "code": "invalid-permission-role",
            "name": "Invalid Permission Role",
            "permissions": ["manage_members", "not_a_real_permission"],
        },
        format="json",
    )

    assert response.status_code == 400
    assert not CompanyRole.objects.filter(company=company, code="invalid-permission-role").exists()


@pytest.mark.django_db
def test_company_system_role_permissions_cannot_be_changed(employer_user, company):
    roles = ensure_company_system_roles(company)
    owner_role = roles["owner"]

    client = APIClient()
    client.force_authenticate(user=employer_user)

    response = client.patch(
        f"/api/v1/info/web/company-roles/{owner_role.id}/",
        {"permissions": ["manage_members"]},
        format="json",
    )

    assert response.status_code == 400
    owner_role.refresh_from_db()
    assert owner_role.permissions == ["*"]


@pytest.mark.django_db
def test_company_member_manager_cannot_assign_role_with_permissions_they_do_not_have(company):
    roles = ensure_company_system_roles(company)
    hr_user = company.user.__class__.objects.create_user_with_role_name(
        email="hr-member-manager@test.com",
        full_name="HR Member Manager",
        role_name=var_sys.JOB_SEEKER,
        password="pass123",
        is_active=True,
    )
    target_user = company.user.__class__.objects.create_user_with_role_name(
        email="target-owner-role@test.com",
        full_name="Target Owner Role",
        role_name=var_sys.JOB_SEEKER,
        password="pass123",
        is_active=True,
    )
    hr_member = CompanyMember.objects.create(
        company=company,
        user=hr_user,
        role=roles["hr"],
        status=CompanyMember.STATUS_ACTIVE,
        is_active=True,
    )

    client = APIClient()
    client.force_authenticate(user=hr_user)

    create_response = client.post(
        "/api/v1/info/web/company-members/",
        {
            "userId": target_user.id,
            "roleId": roles["owner"].id,
            "status": CompanyMember.STATUS_ACTIVE,
        },
        format="json",
    )
    update_response = client.patch(
        f"/api/v1/info/web/company-members/{hr_member.id}/",
        {"roleId": roles["owner"].id},
        format="json",
    )

    assert create_response.status_code == 403
    assert update_response.status_code == 403
    hr_member.refresh_from_db()
    assert hr_member.role_id == roles["hr"].id
    assert not CompanyMember.objects.filter(company=company, user=target_user).exists()


@pytest.mark.django_db
class TestCompanyVerificationAPI:
    def test_employer_can_submit_verification(self, employer_user, company):
        client = APIClient()
        client.force_authenticate(user=employer_user)

        scheduled_at = timezone.now() + timedelta(days=2)
        response = client.put(
            "/api/v1/info/web/company-verification/",
            {
                "companyName": "Verified Test Company",
                "taxCode": "1234567890",
                "businessLicense": "BL-001",
                "representative": "HR Lead",
                "phone": "0901000000",
                "email": "verify@test.com",
                "website": "https://example.com",
                "scheduledAt": scheduled_at.isoformat(),
                "contactName": "HR Lead",
                "contactPhone": "0901000000",
                "notes": "Please review.",
            },
            format="json",
        )

        assert response.status_code == 200
        data = response.data["data"]
        assert data["status"] == CompanyVerification.STATUS_PENDING
        assert data["businessLicense"] == "BL-001"
        assert CompanyVerification.objects.filter(company=company).exists()

    def test_admin_approval_marks_company_verified(self, admin_user, company):
        verification = CompanyVerification.objects.create(
            company=company,
            legal_company_name=company.company_name,
            tax_code=company.tax_code,
            status=CompanyVerification.STATUS_PENDING,
        )
        client = APIClient()
        client.force_authenticate(user=admin_user)

        response = client.patch(
            f"/api/v1/info/web/admin/company-verifications/{verification.id}/",
            {"status": CompanyVerification.STATUS_APPROVED, "adminNote": "Approved"},
            format="json",
        )

        assert response.status_code == 200
        verification.refresh_from_db()
        company.refresh_from_db()
        assert verification.status == CompanyVerification.STATUS_APPROVED
        assert verification.admin_note == "Approved"
        assert company.is_verified is True

    def test_admin_reviewing_unmarks_company_verified(self, admin_user, company, job_post):
        company.is_verified = True
        company.save(update_fields=["is_verified"])
        job_post.status = var_sys.JobPostStatus.APPROVED
        job_post.save(update_fields=["status", "update_at"])
        verification = CompanyVerification.objects.create(
            company=company,
            legal_company_name=company.company_name,
            tax_code=company.tax_code,
            status=CompanyVerification.STATUS_APPROVED,
        )
        client = APIClient()
        client.force_authenticate(user=admin_user)

        response = client.patch(
            f"/api/v1/info/web/admin/company-verifications/{verification.id}/",
            {"status": CompanyVerification.STATUS_REVIEWING, "adminNote": "Needs more review"},
            format="json",
        )

        assert response.status_code == 200
        company.refresh_from_db()
        job_post.refresh_from_db()
        assert company.is_verified is False
        assert job_post.status == var_sys.JobPostStatus.PENDING

    def test_employer_resubmission_unmarks_company_verified(self, employer_user, company, job_post):
        company.is_verified = True
        company.save(update_fields=["is_verified"])
        job_post.status = var_sys.JobPostStatus.APPROVED
        job_post.save(update_fields=["status", "update_at"])
        CompanyVerification.objects.create(
            company=company,
            legal_company_name=company.company_name,
            tax_code=company.tax_code,
            business_license="BL-OLD",
            representative_name="Old Rep",
            contact_phone=company.company_phone,
            contact_email=company.company_email,
            status=CompanyVerification.STATUS_APPROVED,
        )
        client = APIClient()
        client.force_authenticate(user=employer_user)

        response = client.put(
            "/api/v1/info/web/company-verification/",
            {
                "companyName": company.company_name,
                "taxCode": company.tax_code,
                "businessLicense": "BL-NEW",
                "representative": "New Rep",
                "phone": company.company_phone,
                "email": company.company_email,
            },
            format="json",
        )

        assert response.status_code == 200
        company.refresh_from_db()
        job_post.refresh_from_db()
        assert response.data["data"]["status"] == CompanyVerification.STATUS_PENDING
        assert company.is_verified is False
        assert job_post.status == var_sys.JobPostStatus.PENDING

    def test_employer_verification_requires_legal_profile(self, employer_user, company):
        client = APIClient()
        client.force_authenticate(user=employer_user)

        response = client.put(
            "/api/v1/info/web/company-verification/",
            {"companyName": "", "taxCode": "", "businessLicense": ""},
            format="json",
        )

        assert response.status_code == 400


@pytest.mark.django_db
class TestAdminCompanyAPI:
    def test_admin_can_delete_company_with_members_and_roles(self, admin_user, employer_user, company):
        role = CompanyRole.objects.create(
            company=company,
            code="owner",
            name="Owner",
            is_system=True,
        )
        CompanyMember.objects.create(
            company=company,
            user=employer_user,
            role=role,
            status=CompanyMember.STATUS_ACTIVE,
        )
        client = APIClient()
        client.force_authenticate(user=admin_user)

        response = client.delete(f"/api/v1/info/web/admin/companies/{company.id}/")

        assert response.status_code == 204
        assert not Company.objects.filter(id=company.id).exists()
        assert not CompanyRole.objects.filter(id=role.id).exists()
        assert not CompanyMember.objects.filter(company_id=company.id).exists()
        assert employer_user.__class__.objects.filter(id=employer_user.id).exists()


@pytest.mark.django_db
class TestAdminTrustReportAPI:
    def test_admin_can_update_trust_report_status(self, admin_user, job_seeker_user, company):
        report = TrustReport.objects.create(
            target_type=TrustReport.TARGET_COMPANY,
            reason=TrustReport.REASON_SCAM,
            message="Suspicious company profile",
            status=TrustReport.STATUS_OPEN,
            company=company,
            reporter=job_seeker_user,
        )
        client = APIClient()
        client.force_authenticate(user=admin_user)

        response = client.patch(
            f"/api/v1/info/web/admin/trust-reports/{report.id}/",
            {"status": TrustReport.STATUS_REVIEWING},
            format="json",
        )

        assert response.status_code == 200
        report.refresh_from_db()
        assert report.status == TrustReport.STATUS_REVIEWING
