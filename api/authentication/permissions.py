
from configs import variable_system as var_sys

from rest_framework import permissions
from info.models import CompanyMember

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
            try:
                return CompanyMember.objects.filter(
                    user=user,
                    status=CompanyMember.STATUS_ACTIVE,
                    is_active=True,
                ).exists()
            except Exception:
                return False

        return False

class ResumeOwnerPerms(IsJobSeekerUser):

    def has_object_permission(self, request, view, resume):

        return request.user == resume.user

class JobPostOwnerPerms(IsEmployerUser):

    def has_object_permission(self, request, view, job_post):

        return request.user == job_post.user

class CompanyImageOwnerPerms(IsEmployerUser):

    def has_object_permission(self, request, view, company_image):

        return request.user.company == company_image.company

class IsAdminUser(permissions.IsAuthenticated):

    def has_permission(self, request, view):

        user = request.user

        if user.is_authenticated:

            return user.role_name == var_sys.ADMIN

        return False
