from django.db.models import Q

from apps.profiles.models import Company, CompanyMember


ACTIVE_COMPANY_HEADER = "X-Active-Company-Id"


def _parse_company_id(value):
    value = str(value or "").strip()
    if not value:
        return None
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


def _get_requested_active_company_value(request):
    if request is None:
        return None

    raw_value = None
    headers = getattr(request, "headers", None)
    if headers is not None:
        raw_value = headers.get(ACTIVE_COMPANY_HEADER)

    if raw_value is None:
        raw_value = getattr(request, "META", {}).get("HTTP_X_ACTIVE_COMPANY_ID")

    if raw_value is None:
        query_params = getattr(request, "query_params", None) or getattr(request, "GET", None)
        if query_params is not None:
            raw_value = query_params.get("activeCompanyId") or query_params.get("active_company_id")

    return raw_value


def get_requested_active_company_id(request):
    raw_value = _get_requested_active_company_value(request)
    return _parse_company_id(raw_value)


def active_company_header_failed(request):
    if request is None:
        return False
    if not getattr(request, "_active_company_header_applied", False):
        apply_active_company_from_request(request)
    return bool(getattr(request, "_active_company_header_invalid", False))


def apply_active_company_from_request(request):
    if getattr(request, "_active_company_header_applied", False):
        return getattr(request, "_active_company_header_company", None)

    request._active_company_header_applied = True
    request._active_company_header_company = None
    request._active_company_header_invalid = False

    user = getattr(request, "user", None)
    if not getattr(user, "is_authenticated", False):
        return None

    raw_value = _get_requested_active_company_value(request)
    has_header = bool(str(raw_value or "").strip())
    company_id = _parse_company_id(raw_value)
    if company_id is None:
        if has_header:
            user.__dict__["_active_company_cache"] = None
            request._active_company_header_invalid = True
        return None

    company = (
        Company.objects.filter(id=company_id)
        .filter(
            Q(user_id=user.id)
            | Q(
                members__user=user,
                members__status=CompanyMember.STATUS_ACTIVE,
                members__is_active=True,
            )
        )
        .distinct()
        .first()
    )

    if company is None:
        request._active_company_header_invalid = True

    user.__dict__["_active_company_cache"] = company
    request._active_company_header_company = company
    return company
