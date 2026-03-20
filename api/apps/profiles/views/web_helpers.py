from ..models import CompanyMember


def _get_user_company(user):
    try:
        return user.get_active_company()
    except Exception:
        return None


def _get_company_membership(user, company):
    return CompanyMember.objects.select_related("role").filter(
        user=user,
        company=company,
        is_active=True,
        status=CompanyMember.STATUS_ACTIVE,
    ).first()


def _has_company_permission(user, company, permission_key):
    if company.user_id == user.id:
        return True

    membership = _get_company_membership(user, company)
    if not membership or not membership.role:
        return False

    permissions = membership.role.permissions or []
    if "*" in permissions:
        return True
    return permission_key in permissions
