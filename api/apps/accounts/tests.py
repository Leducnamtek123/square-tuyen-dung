"""
Unit tests for the Accounts app — User model, authentication, permissions.
"""
import pytest

from apps.accounts.models import User, ForgotPasswordToken
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
