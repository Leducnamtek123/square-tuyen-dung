
from rest_framework.response import Response

from rest_framework import status as res_status
from django.conf import settings


def _normalize_error(errors):
    if not errors:
        return None

    if isinstance(errors, dict):
        code = errors.get("code") or errors.get("errorCode") or "BAD_REQUEST"
        message = errors.get("message") or errors.get("errorMessage") or "Request failed."
        details = errors.get("details", errors)
        return {
            "code": str(code),
            "message": message if isinstance(message, str) else "Request failed.",
            "details": details,
        }

    if isinstance(errors, list):
        return {
            "code": "BAD_REQUEST",
            "message": "Request failed.",
            "details": errors,
        }

    return {
        "code": "BAD_REQUEST",
        "message": str(errors),
        "details": None,
    }


def data_response(errors=None, data=None, status=res_status.HTTP_200_OK):
    if not getattr(settings, "API_RESPONSE_ENVELOPE_V2", True):
        return {
            "errors": errors or {},
            "data": data,
        }

    is_success = 200 <= int(status) < 400
    return {
        "success": is_success,
        "data": data if is_success else None,
        "error": None if is_success else _normalize_error(errors),
    }


def response_data(status=res_status.HTTP_200_OK, errors=None, data=None, headers=None):
    payload = data_response(errors=errors, data=data, status=status)
    return Response(status=status, data=payload, headers=headers)
