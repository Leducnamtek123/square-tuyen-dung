
from shared.configs import variable_system as var_sys

from rest_framework import permissions
from apps.profiles.models import CompanyMember


import logging
logger = logging.getLogger(__name__)

def _has_active_company_membership(request):
    cached = getattr(request, "_has_active_company_membership", None)
    if cached is not None:
        return cached

    try:
        cached = CompanyMember.objects.filter(
            user=request.user,
            status=CompanyMember.STATUS_ACTIVE,
            is_active=True,
        ).exists()
    except Exception as e:
        logger.error(f"Error checking company membership for user {request.user.id}: {str(e)}")
        cached = False

    request._has_active_company_membership = cached
    return cached


def get_active_company_membership(user, company=None):
    queryset = CompanyMember.objects.select_related("role").filter(
        user=user,
        status=CompanyMember.STATUS_ACTIVE,
        is_active=True,
    )
    if company is not None:
        queryset = queryset.filter(company=company)
    return queryset.first()


def user_has_company_permission(user, permission_key, company=None):
    if not getattr(user, "is_authenticated", False):
        return False

    if user.role_name == var_sys.ADMIN or getattr(user, "is_staff", False) or getattr(user, "is_superuser", False):
        return True

    if company is None:
        try:
            company = user.get_active_company()
        except Exception:
            company = None

    if not company:
        return False

    if company.user_id == user.id:
        return True

    membership = get_active_company_membership(user, company)
    if not membership or not membership.role:
        return False

    permissions = membership.role.permissions or []
    return "*" in permissions or permission_key in permissions


class IsJobSeekerUser(permissions.IsAuthenticated):

    def has_permission(self, request, view):

        user = request.user

        if user.is_authenticated:

            return user.role_name == var_sys.JOB_SEEKER

        return False

class IsEmployerUser(permissions.IsAuthenticated):

    def has_permission(self, request, view):

        user = request.user

        if user.is_authenticated:
            if user.role_name == var_sys.EMPLOYER:
                return True
            
            has_membership = _has_active_company_membership(request)
            if not has_membership:
                logger.warning(f"User {user.id} (role: {user.role_name}) denied access as Employer (no active membership found).")
            return has_membership

        return False


class CompanyPermissionRequired(IsEmployerUser):
    permission_key = None

    def has_permission(self, request, view):
        user = request.user
        if (
            getattr(user, "is_authenticated", False)
            and (
                user.role_name == var_sys.ADMIN
                or getattr(user, "is_staff", False)
                or getattr(user, "is_superuser", False)
            )
        ):
            return True
        if not super().has_permission(request, view):
            return False
        if not self.permission_key:
            return True
        return user_has_company_permission(request.user, self.permission_key)

    def _resolve_object_company(self, obj):
        company = getattr(obj, "company", None)
        if company is not None:
            return company

        job_post = getattr(obj, "job_post", None)
        if job_post is not None:
            return getattr(job_post, "company", None)

        return None

    def has_object_permission(self, request, view, obj):
        user = request.user
        if (
            getattr(user, "is_authenticated", False)
            and (
                user.role_name == var_sys.ADMIN
                or getattr(user, "is_staff", False)
                or getattr(user, "is_superuser", False)
            )
        ):
            return True
        company = self._resolve_object_company(obj)
        try:
            active_company = user.get_active_company()
        except Exception:
            active_company = None
        if not company:
            company = active_company
        if not company:
            return False
        return active_company == company and user_has_company_permission(
            request.user,
            self.permission_key,
            company,
        )


class ResumeOwnerPerms(IsJobSeekerUser):

    def has_object_permission(self, request, view, resume):

        return request.user == resume.user

class JobPostOwnerPerms(IsEmployerUser):
    def has_permission(self, request, view):
        return super().has_permission(request, view) and user_has_company_permission(
            request.user,
            "manage_job_posts",
        )

    def has_object_permission(self, request, view, job_post):

        return (
            job_post.company == request.user.active_company
            and user_has_company_permission(request.user, "manage_job_posts", job_post.company)
        )

class CompanyImageOwnerPerms(IsEmployerUser):
    def has_permission(self, request, view):
        return super().has_permission(request, view) and user_has_company_permission(
            request.user,
            "manage_company_profile",
        )

    def has_object_permission(self, request, view, company_image):
        try:
            return (
                request.user.get_active_company() == company_image.company
                and user_has_company_permission(request.user, "manage_company_profile", company_image.company)
            )
        except Exception:
            return False

class IsAdminUser(permissions.IsAuthenticated):

    def has_permission(self, request, view):

        user = request.user

        if user.is_authenticated:

            return user.role_name == var_sys.ADMIN

        return False

class IsEmployerOrAdminUser(permissions.IsAuthenticated):
    """Allow both Employer users (with active company membership) and Admin users."""

    def has_permission(self, request, view):
        user = request.user
        if not user.is_authenticated:
            return False

        if user.role_name == var_sys.ADMIN:
            return True

        if user.role_name == var_sys.EMPLOYER:
            return True

        return _has_active_company_membership(request)


class CanManageCompanyProfile(CompanyPermissionRequired):
    permission_key = "manage_company_profile"


class CanManageCandidates(CompanyPermissionRequired):
    permission_key = "manage_candidates"


class CanManageInterviews(CompanyPermissionRequired):
    permission_key = "manage_interviews"


class CanManageQuestionBank(CompanyPermissionRequired):
    permission_key = "manage_question_bank"
