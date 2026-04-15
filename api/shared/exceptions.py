from rest_framework import status
from rest_framework.exceptions import (
    APIException,
    AuthenticationFailed,
    NotAuthenticated,
    NotFound,
    PermissionDenied,
    ValidationError,
)
from rest_framework.views import exception_handler
from django.conf import settings


def _build_error(code: str, message: str, details=None):
    return {
        "code": code,
        "message": message,
        "details": details,
    }


def api_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is None:
        return response

    details = response.data
    status_code = int(response.status_code)

    if isinstance(exc, ValidationError):
        error = _build_error(
            code="VALIDATION_ERROR",
            message="Dữ liệu không hợp lệ.",
            details=details,
        )
    elif isinstance(exc, (NotAuthenticated, AuthenticationFailed)):
        error = _build_error(
            code="AUTHENTICATION_ERROR",
            message="Bạn cần đăng nhập để thực hiện thao tác này.",
            details=details,
        )
    elif isinstance(exc, PermissionDenied):
        error = _build_error(
            code="PERMISSION_DENIED",
            message="Bạn không có quyền thực hiện thao tác này.",
            details=details,
        )
    elif isinstance(exc, NotFound):
        error = _build_error(
            code="NOT_FOUND",
            message="Không tìm thấy tài nguyên yêu cầu.",
            details=details,
        )
    elif isinstance(exc, APIException):
        default_code = getattr(exc, "default_code", "api_error")
        error = _build_error(
            code=str(default_code).upper(),
            message=str(getattr(exc, "detail", "Yêu cầu không hợp lệ.")),
            details=details,
        )
    else:
        error = _build_error(
            code="UNHANDLED_ERROR",
            message="Đã xảy ra lỗi hệ thống.",
            details=details,
        )

    response.status_code = status_code if status_code >= 400 else status.HTTP_400_BAD_REQUEST
    if getattr(settings, "API_RESPONSE_ENVELOPE_V2", True):
        response.data = {
            "success": False,
            "data": None,
            "error": error,
        }
    else:
        response.data = {
            "errors": error,
            "data": None,
        }
    return response
