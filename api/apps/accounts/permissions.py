
from shared.configs import variable_system as var_sys

from rest_framework import permissions
from apps.profiles.models import CompanyMember


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
    except Exception:
        cached = False

    request._has_active_company_membership = cached
    return cached

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
            return _has_active_company_membership(request)

        return False

class ResumeOwnerPerms(IsJobSeekerUser):

    def has_object_permission(self, request, view, resume):

        return request.user == resume.user

class JobPostOwnerPerms(IsEmployerUser):

    def has_object_permission(self, request, view, job_post):

        return request.user == job_post.user

class CompanyImageOwnerPerms(IsEmployerUser):

    def has_object_permission(self, request, view, company_image):
        try:
            return request.user.get_active_company() == company_image.company
        except Exception:
            return False

class IsAdminUser(permissions.IsAuthenticated):

    def has_permission(self, request, view):

        user = request.user

        if user.is_authenticated:

            return user.role_name == var_sys.ADMIN

        return False
