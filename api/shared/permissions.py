"""
Custom permission classes for object-level access control (IDOR protection).
"""
from rest_framework.permissions import BasePermission

from shared.configs import variable_system as var_sys


class IsOwnerOrReadOnly(BasePermission):
    """
    Object-level permission: only the owner can modify.
    Expects the object to have a `user` attribute.
    """

    def has_object_permission(self, request, view, obj):
        if request.method in ('GET', 'HEAD', 'OPTIONS'):
            return True
        owner = getattr(obj, 'user', None)
        if owner is None:
            return False
        return obj.user == request.user


class IsResumeOwner(BasePermission):
    """
    Ensures only the resume owner can view/edit their resume.
    """

    def has_object_permission(self, request, view, obj):
        return obj.user == request.user


class IsCompanyOwnerOrMember(BasePermission):
    """
    Ensures the user is the owner or a member of the company
    before allowing modification.
    """

    def has_object_permission(self, request, view, obj):
        user = request.user
        company = getattr(obj, 'company', obj)

        # Use active_company which handles both owner and member lookup
        user_company = getattr(user, 'active_company', None)
        if user_company and user_company == company:
            return True

        return False


class IsJobPostCompanyOwner(BasePermission):
    """
    Ensures only the company that created the job post can modify it.
    """

    def has_object_permission(self, request, view, obj):
        if request.method in ('GET', 'HEAD', 'OPTIONS'):
            return True
        user = request.user
        if user.role_name != var_sys.EMPLOYER:
            return False
        return obj.company == getattr(user, 'active_company', None)


class IsEmployer(BasePermission):
    """Check that the user has employer role."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role_name == var_sys.EMPLOYER
        )


class IsJobSeeker(BasePermission):
    """Check that the user has job seeker role."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role_name == var_sys.JOB_SEEKER
        )
