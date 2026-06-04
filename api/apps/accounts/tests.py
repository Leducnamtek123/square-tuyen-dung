"""
Unit tests for the Accounts app — User model, authentication, permissions.
"""
import datetime

import pytest
from django.test import override_settings
from django.utils import timezone
from rest_framework.test import APIClient

from apps.accounts.models import User, ForgotPasswordToken
from apps.accounts.serializers import CompanyRegisterSerializer, UserSerializer
from apps.profiles.models import CompanyMember, CompanyRole
from shared.configs import variable_system as var_sys
from shared.permissions import (
    IsOwnerOrReadOnly, IsResumeOwner, IsEmployer, IsJobSeeker,
    IsCompanyOwnerOrMember
)


# ==================== User Model Tests ====================

@pytest.mark.django_db
class TestUserModel:
    """Tests for the custom User model."""

    def test_create_job_seeker(self, job_seeker_user):
        assert job_seeker_user.email == 'jobseeker@test.com'
        assert job_seeker_user.full_name == 'Test JobSeeker'
        assert job_seeker_user.role_name == var_sys.JOB_SEEKER
        assert job_seeker_user.is_active is True

    def test_create_employer(self, employer_user):
        assert employer_user.role_name == var_sys.EMPLOYER
        assert employer_user.has_company is True

    def test_create_admin(self, admin_user):
        assert admin_user.role_name == var_sys.ADMIN
        assert admin_user.is_staff is True

    def test_user_str(self, job_seeker_user):
        assert str(job_seeker_user) is not None

    def test_email_is_unique(self, job_seeker_user, db):
        from django.db import IntegrityError
        with pytest.raises(IntegrityError):
            User.objects.create_user(
                email='jobseeker@test.com',  # duplicate
                full_name='Another User',
                password='pass123',
            )

    def test_create_user_without_email_raises(self):
        with pytest.raises(ValueError, match='email'):
            User.objects.create_user(
                email=None,
                full_name='No Email',
                password='pass123',
            )

    def test_create_user_without_fullname_raises(self):
        with pytest.raises(ValueError, match='full name'):
            User.objects.create_user(
                email='test@test.com',
                full_name=None,
                password='pass123',
            )

    def test_create_user_with_role_name(self, db):
        user = User.objects.create_user_with_role_name(
            email='rolename@test.com',
            full_name='Role User',
            role_name=var_sys.EMPLOYER,
            password='pass123',
        )
        assert user.role_name == var_sys.EMPLOYER

    def test_create_user_with_role_name_none_raises(self, db):
        with pytest.raises(ValueError, match='Role name'):
            User.objects.create_user_with_role_name(
                email='norole@test.com',
                full_name='No Role',
                role_name=None,
                password='pass123',
            )

    def test_create_superuser(self, db):
        admin = User.objects.create_superuser(
            email='superadmin@test.com',
            full_name='Super Admin',
            password='admin123',
        )
        assert admin.is_superuser is True
        assert admin.is_staff is True
        assert admin.role_name == var_sys.ADMIN

    def test_create_superuser_without_password_raises(self, db):
        with pytest.raises(ValueError, match='password'):
            User.objects.create_superuser(
                email='nopw@test.com',
                full_name='No PW Admin',
                password=None,
            )

    def test_password_is_hashed(self, job_seeker_user):
        assert job_seeker_user.password != 'testpass123'
        assert job_seeker_user.check_password('testpass123')

    def test_job_seeker_company_member_keeps_member_workspace_role(self, job_seeker_user, company):
        role = CompanyRole.objects.create(
            company=company,
            code="employee",
            name="Employee",
            permissions=[],
            is_system=True,
        )
        CompanyMember.objects.create(
            company=company,
            user=job_seeker_user,
            role=role,
            status=CompanyMember.STATUS_ACTIVE,
            is_active=True,
        )

        data = UserSerializer(job_seeker_user).data

        assert data["canAccessEmployerPortal"] is True
        assert data["employerRoleCode"] == "employee"
        assert data["workspaces"] == [
            {"type": "job_seeker", "label": "Candidate", "isDefault": True},
            {
                "type": "company",
                "label": company.company_name,
                "companyId": company.id,
                "companySlug": company.slug,
                "companyImageUrl": var_sys.AVATAR_DEFAULT["COMPANY_LOGO"],
                "roleCode": "employee",
                "isDefault": False,
            },
        ]


@pytest.mark.django_db
class TestSocialAuthPipeline:
    def test_existing_employer_email_can_link_social_login(self, employer_user):
        from apps.accounts.pipeline import custom_social_user

        result = custom_social_user(strategy=None, details={"email": "EMPLOYER@test.com"})

        assert result["is_new"] is False
        assert result["user"] == employer_user

    def test_existing_job_seeker_email_can_link_social_login(self, job_seeker_user):
        from apps.accounts.pipeline import custom_social_user

        result = custom_social_user(strategy=None, details={"email": "jobseeker@test.com"})

        assert result["is_new"] is False
        assert result["user"] == job_seeker_user

    def test_unknown_social_email_is_marked_new(self, db):
        from apps.accounts.pipeline import custom_social_user

        result = custom_social_user(strategy=None, details={"email": "new@test.com"})

        assert result == {"is_new": True, "user": None}


@pytest.mark.django_db
def test_company_register_serializer_validates_company_contact_fields(city):
    from apps.locations.models import District

    district = District.objects.create(name="Quan 1", code="Q1-REGISTER", city=city)

    def make_payload(**overrides):
        payload = {
            "companyName": "Register Validation Company",
            "companyEmail": "register-validation@test.com",
            "companyPhone": "0901234567",
            "taxCode": "REGISTER-TAX-001",
            "fieldOperation": "IT",
            "since": timezone.localdate(),
            "employeeSize": 1,
            "websiteUrl": "https://example.com",
            "location": {
                "city": city.id,
                "district": district.id,
                "address": "123 Nguyen Hue",
            },
        }
        payload.update(overrides)
        return payload

    future_date = timezone.localdate() + datetime.timedelta(days=1)

    invalid_employee_size = CompanyRegisterSerializer(data=make_payload(employeeSize=999))
    invalid_phone = CompanyRegisterSerializer(data=make_payload(companyPhone="not-a-phone"))
    missing_phone = CompanyRegisterSerializer(data=make_payload(companyPhone=None))
    future_founded_date = CompanyRegisterSerializer(data=make_payload(since=future_date))

    assert invalid_employee_size.is_valid() is False
    assert invalid_phone.is_valid() is False
    assert missing_phone.is_valid() is False
    assert future_founded_date.is_valid() is False

    assert "employeeSize" in invalid_employee_size.errors
    assert "companyPhone" in invalid_phone.errors
    assert "companyPhone" in missing_phone.errors
    assert "since" in future_founded_date.errors


@pytest.mark.django_db
def test_register_serializers_allow_passwords_up_to_frontend_limit(city):
    from apps.accounts.serializers import EmployerRegisterSerializer, JobSeekerRegisterSerializer
    from apps.locations.models import District

    password_128 = "Aa1!" * 32
    password_129 = f"{password_128}A"
    district = District.objects.create(name="Quan 3", code="Q3-REGISTER", city=city)

    job_seeker_data = {
        "fullName": "Password Limit Candidate",
        "email": "password-limit-candidate@test.com",
        "password": password_128,
        "confirmPassword": password_128,
        "platform": "WEB",
    }
    employer_data = {
        "fullName": "Password Limit Employer",
        "email": "password-limit-employer@test.com",
        "password": password_128,
        "confirmPassword": password_128,
        "platform": "WEB",
        "company": {
            "companyName": "Password Limit Company",
            "companyEmail": "password-limit-company@test.com",
            "companyPhone": "0901234568",
            "taxCode": "REGISTER-TAX-002",
            "fieldOperation": "IT",
            "since": timezone.localdate(),
            "employeeSize": 1,
            "websiteUrl": "https://example.com",
            "location": {
                "city": city.id,
                "district": district.id,
                "address": "456 Le Loi",
            },
        },
    }

    assert JobSeekerRegisterSerializer(data=job_seeker_data).is_valid() is True
    assert EmployerRegisterSerializer(data=employer_data).is_valid() is True

    too_long_job_seeker = JobSeekerRegisterSerializer(data={**job_seeker_data, "password": password_129, "confirmPassword": password_129})
    too_long_employer = EmployerRegisterSerializer(data={**employer_data, "password": password_129, "confirmPassword": password_129})

    assert too_long_job_seeker.is_valid() is False
    assert too_long_employer.is_valid() is False
    assert "password" in too_long_job_seeker.errors
    assert "password" in too_long_employer.errors


@pytest.mark.django_db
@pytest.mark.parametrize("email", ["not-an-email", f"{'a' * 93}@test.com"])
def test_email_exists_endpoint_validates_email_contract(email):
    client = APIClient()

    response = client.post("/api/v1/auth/email-exists/", {"email": email}, format="json")

    assert response.status_code == 400
    assert "email" in response.data["error"]["details"]


@pytest.mark.django_db
def test_password_creation_serializers_match_frontend_complexity_rule(city):
    from apps.accounts.serializers import (
        EmployerRegisterSerializer,
        JobSeekerRegisterSerializer,
        ResetPasswordSerializer,
        UpdatePasswordSerializer,
    )
    from apps.locations.models import District

    password_without_special = "SquareHire2026"
    district = District.objects.create(name="Quan 4", code="Q4-REGISTER", city=city)

    job_seeker = JobSeekerRegisterSerializer(data={
        "fullName": "Weak Password Candidate",
        "email": "weak-password-candidate@test.com",
        "password": password_without_special,
        "confirmPassword": password_without_special,
        "platform": "WEB",
    })
    employer = EmployerRegisterSerializer(data={
        "fullName": "Weak Password Employer",
        "email": "weak-password-employer@test.com",
        "password": password_without_special,
        "confirmPassword": password_without_special,
        "platform": "WEB",
        "company": {
            "companyName": "Weak Password Company",
            "companyEmail": "weak-password-company@test.com",
            "companyPhone": "0901234569",
            "taxCode": "REGISTER-TAX-003",
            "fieldOperation": "IT",
            "since": timezone.localdate(),
            "employeeSize": 1,
            "websiteUrl": "https://example.com",
            "location": {
                "city": city.id,
                "district": district.id,
                "address": "789 Tran Hung Dao",
            },
        },
    })
    reset_password = ResetPasswordSerializer(data={
        "platform": "WEB",
        "token": "reset-token",
        "newPassword": password_without_special,
        "confirmPassword": password_without_special,
    })
    update_password = UpdatePasswordSerializer(data={
        "oldPassword": "CurrentPassword1!",
        "newPassword": password_without_special,
        "confirmPassword": password_without_special,
    })

    for serializer in (job_seeker, employer, reset_password, update_password):
        assert serializer.is_valid() is False


@pytest.mark.django_db
class TestFirebasePhoneLoginMapping:
    def test_job_seeker_phone_login_reuses_profile_owner(self, job_seeker_user, job_seeker_profile):
        from apps.accounts.views_oauth import FirebaseLoginView

        job_seeker_user.phone_number = None
        job_seeker_user.save(update_fields=["phone_number"])

        user, error = FirebaseLoginView()._find_existing_user_by_phone(
            "+84909876543",
            var_sys.JOB_SEEKER,
        )

        assert error is None
        assert user == job_seeker_user
        job_seeker_user.refresh_from_db()
        assert job_seeker_user.phone_number == "+84909876543"

    def test_duplicate_profile_phone_is_rejected(self, db, job_seeker_user, job_seeker_profile, location):
        from apps.accounts.views_oauth import FirebaseLoginView
        from apps.profiles.models import JobSeekerProfile

        other_user = User.objects.create_user_with_role_name(
            email="other-phone@test.com",
            full_name="Other Phone",
            role_name=var_sys.JOB_SEEKER,
            password="pass123",
        )
        JobSeekerProfile.objects.create(
            user=other_user,
            phone=job_seeker_profile.phone,
            location=location,
        )

        user, error = FirebaseLoginView()._find_existing_user_by_phone(
            "+84909876543",
            var_sys.JOB_SEEKER,
        )

        assert user is None
        assert "nhiều tài khoản" in error


@pytest.mark.django_db
class TestPasswordResetSecurity:
    def test_web_reset_accepts_stored_random_token(self, job_seeker_user):
        token = ForgotPasswordToken.objects.create(
            user=job_seeker_user,
            token="web-random-token",
            platform="WEB",
            expired_at=timezone.now() + datetime.timedelta(minutes=15),
        )

        response = APIClient().post(
            "/api/v1/auth/reset-password/",
            {
                "platform": "WEB",
                "token": "web-random-token",
                "newPassword": "SquareNewPass123!",
                "confirmPassword": "SquareNewPass123!",
            },
            format="json",
        )

        assert response.status_code == 200
        job_seeker_user.refresh_from_db()
        token.refresh_from_db()
        assert job_seeker_user.check_password("SquareNewPass123!")
        assert token.is_active is False

    def test_app_reset_rejects_ambiguous_active_code(self, db):
        first = User.objects.create_user_with_role_name(
            email="first-reset@test.com",
            full_name="First Reset",
            role_name=var_sys.JOB_SEEKER,
            password="OldPass123!",
        )
        second = User.objects.create_user_with_role_name(
            email="second-reset@test.com",
            full_name="Second Reset",
            role_name=var_sys.JOB_SEEKER,
            password="OldPass123!",
        )
        expires_at = timezone.now() + datetime.timedelta(minutes=15)
        ForgotPasswordToken.objects.create(user=first, code=123456, platform="APP", expired_at=expires_at)
        ForgotPasswordToken.objects.create(user=second, code=123456, platform="APP", expired_at=expires_at)

        response = APIClient().post(
            "/api/v1/auth/reset-password/",
            {
                "platform": "APP",
                "code": "123456",
                "newPassword": "SquareNewPass123!",
                "confirmPassword": "SquareNewPass123!",
            },
            format="json",
        )

        assert response.status_code == 400
        first.refresh_from_db()
        second.refresh_from_db()
        assert first.check_password("OldPass123!")
        assert second.check_password("OldPass123!")

    def test_app_reset_can_disambiguate_code_by_email(self, db):
        first = User.objects.create_user_with_role_name(
            email="first-email-reset@test.com",
            full_name="First Email Reset",
            role_name=var_sys.JOB_SEEKER,
            password="OldPass123!",
        )
        second = User.objects.create_user_with_role_name(
            email="second-email-reset@test.com",
            full_name="Second Email Reset",
            role_name=var_sys.JOB_SEEKER,
            password="OldPass123!",
        )
        expires_at = timezone.now() + datetime.timedelta(minutes=15)
        ForgotPasswordToken.objects.create(user=first, code=654321, platform="APP", expired_at=expires_at)
        token = ForgotPasswordToken.objects.create(user=second, code=654321, platform="APP", expired_at=expires_at)

        response = APIClient().post(
            "/api/v1/auth/reset-password/",
            {
                "platform": "APP",
                "email": second.email,
                "code": "654321",
                "newPassword": "SquareNewPass123!",
                "confirmPassword": "SquareNewPass123!",
            },
            format="json",
        )

        assert response.status_code == 200
        first.refresh_from_db()
        second.refresh_from_db()
        token.refresh_from_db()
        assert first.check_password("OldPass123!")
        assert second.check_password("SquareNewPass123!")
        assert token.is_active is False

    @override_settings(
        AUTH_PASSWORD_VALIDATORS=[
            {
                "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
                "OPTIONS": {"min_length": 8},
            }
        ]
    )
    def test_reset_password_rejects_weak_password(self, job_seeker_user):
        ForgotPasswordToken.objects.create(
            user=job_seeker_user,
            token="weak-token",
            platform="WEB",
            expired_at=timezone.now() + datetime.timedelta(minutes=15),
        )

        response = APIClient().post(
            "/api/v1/auth/reset-password/",
            {
                "platform": "WEB",
                "token": "weak-token",
                "newPassword": "short",
                "confirmPassword": "short",
            },
            format="json",
        )

        assert response.status_code == 400

    @override_settings(
        AUTH_PASSWORD_VALIDATORS=[
            {
                "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
                "OPTIONS": {"min_length": 8},
            }
        ]
    )
    def test_change_password_rejects_weak_password(self, job_seeker_user):
        client = APIClient()
        client.force_authenticate(user=job_seeker_user)

        response = client.put(
            "/api/v1/auth/change-password/",
            {
                "oldPassword": "testpass123",
                "newPassword": "short",
                "confirmPassword": "short",
            },
            format="json",
        )

        assert response.status_code == 400


# ==================== Permission Tests ====================

@pytest.mark.django_db
class TestPermissions:
    """Tests for custom permission classes."""

    def _make_request(self, user, method='GET'):
        """Create a mock request object."""
        from unittest.mock import MagicMock
        request = MagicMock()
        request.user = user
        request.method = method
        return request

    def test_is_employer_allows_employer(self, employer_user):
        perm = IsEmployer()
        request = self._make_request(employer_user)
        assert perm.has_permission(request, None) is True

    def test_is_employer_denies_job_seeker(self, job_seeker_user):
        perm = IsEmployer()
        request = self._make_request(job_seeker_user)
        assert perm.has_permission(request, None) is False

    def test_is_job_seeker_allows_job_seeker(self, job_seeker_user):
        perm = IsJobSeeker()
        request = self._make_request(job_seeker_user)
        assert perm.has_permission(request, None) is True

    def test_is_job_seeker_denies_employer(self, employer_user):
        perm = IsJobSeeker()
        request = self._make_request(employer_user)
        assert perm.has_permission(request, None) is False

    def test_is_resume_owner_allows_owner(self, job_seeker_user, resume):
        perm = IsResumeOwner()
        request = self._make_request(job_seeker_user)
        assert perm.has_object_permission(request, None, resume) is True

    def test_is_resume_owner_denies_other(self, employer_user, resume):
        perm = IsResumeOwner()
        request = self._make_request(employer_user)
        assert perm.has_object_permission(request, None, resume) is False

    def test_is_owner_or_readonly_allows_get(self, employer_user, resume):
        perm = IsOwnerOrReadOnly()
        request = self._make_request(employer_user, method='GET')
        assert perm.has_object_permission(request, None, resume) is True

    def test_is_owner_or_readonly_denies_write_for_nonowner(self, employer_user, resume):
        perm = IsOwnerOrReadOnly()
        request = self._make_request(employer_user, method='PUT')
        assert perm.has_object_permission(request, None, resume) is False

    def test_is_owner_or_readonly_allows_write_for_owner(self, job_seeker_user, resume):
        perm = IsOwnerOrReadOnly()
        request = self._make_request(job_seeker_user, method='PUT')
        assert perm.has_object_permission(request, None, resume) is True

    def test_company_member_without_job_permission_cannot_manage_job_posts(self, company):
        member = User.objects.create_user_with_role_name(
            email="member-no-job@test.com",
            full_name="Member No Job",
            role_name=var_sys.JOB_SEEKER,
            password="pass123",
            is_active=True,
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

        client = APIClient()
        client.force_authenticate(user=member)
        response = client.get("/api/v1/job/web/private-job-posts/")

        assert response.status_code == 403

    def test_company_member_with_job_permission_can_manage_job_posts(self, company):
        member = User.objects.create_user_with_role_name(
            email="member-job@test.com",
            full_name="Member Job",
            role_name=var_sys.JOB_SEEKER,
            password="pass123",
            is_active=True,
        )
        role = CompanyRole.objects.create(
            company=company,
            code="job-manager",
            name="Job Manager",
            permissions=["manage_job_posts"],
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
        response = client.get("/api/v1/job/web/private-job-posts/")

        assert response.status_code == 200


@pytest.mark.django_db
class TestUserAdminAPI:
    def test_bulk_status_disables_selected_users(self, admin_user, employer_user, job_seeker_user):
        client = APIClient()
        client.force_authenticate(user=admin_user)

        response = client.post(
            "/api/v1/auth/users/bulk-status/",
            {"ids": [employer_user.id, job_seeker_user.id], "isActive": False},
            format="json",
        )

        assert response.status_code == 200
        assert response.data["data"]["updated"] == 2

        employer_user.refresh_from_db()
        job_seeker_user.refresh_from_db()
        assert employer_user.is_active is False
        assert job_seeker_user.is_active is False

    def test_bulk_status_blocks_current_user_change(self, admin_user, employer_user):
        client = APIClient()
        client.force_authenticate(user=admin_user)

        response = client.post(
            "/api/v1/auth/users/bulk-status/",
            {"ids": [admin_user.id, employer_user.id], "isActive": False},
            format="json",
        )

        assert response.status_code == 400
        admin_user.refresh_from_db()
        employer_user.refresh_from_db()
        assert admin_user.is_active is True
        assert employer_user.is_active is True

    def test_destroy_blocks_current_user_delete(self, admin_user):
        client = APIClient()
        client.force_authenticate(user=admin_user)

        response = client.delete(f"/api/v1/auth/users/{admin_user.id}/")

        assert response.status_code == 400
        assert User.objects.filter(id=admin_user.id).exists()
