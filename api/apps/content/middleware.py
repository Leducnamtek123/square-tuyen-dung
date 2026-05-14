from django.http import JsonResponse
from django.utils import timezone

from shared.configs import variable_response as var_res, variable_system as var_sys


class MaintenanceModeMiddleware:
    """Block non-admin API traffic while admin maintenance mode is enabled."""

    ALWAYS_ALLOWED_PREFIXES = (
        "/health/",
        "/static/",
        "/api/health/",
        "/api/v1/health/",
        "/api/common/health/",
        "/api/v1/common/health/",
        "/api/auth/token/",
        "/api/v1/auth/token/",
        "/api/auth/convert-token/",
        "/api/v1/auth/convert-token/",
        "/api/admin/web/system-settings/",
        "/api/v1/admin/web/system-settings/",
    )

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if self._should_allow_request(request):
            return self.get_response(request)

        return JsonResponse(
            var_res.data_response(
                status=503,
                data=None,
                errors={
                    "code": "MAINTENANCE_MODE",
                    "message": "He thong dang bao tri. Vui long thu lai sau.",
                    "details": None,
                },
            ),
            status=503,
        )

    def _should_allow_request(self, request) -> bool:
        path = request.path_info or request.path or ""
        if request.method == "OPTIONS":
            return True
        if not path.startswith("/api/"):
            return True
        if path.startswith(self.ALWAYS_ALLOWED_PREFIXES):
            return True

        try:
            from apps.content.system_settings import maintenance_mode_enabled

            if not maintenance_mode_enabled():
                return True
        except Exception:
            return True

        return self._is_admin_request(request)

    def _is_admin_request(self, request) -> bool:
        user = getattr(request, "user", None)
        if getattr(user, "is_authenticated", False):
            return getattr(user, "role_name", None) == var_sys.ADMIN or bool(getattr(user, "is_staff", False))

        auth_header = request.META.get("HTTP_AUTHORIZATION", "")
        if not auth_header.lower().startswith("bearer "):
            return False

        token = auth_header.split(" ", 1)[1].strip()
        if not token:
            return False

        try:
            from oauth2_provider.models import AccessToken

            access_token = AccessToken.objects.select_related("user").get(
                token=token,
                expires__gt=timezone.now(),
            )
        except Exception:
            return False

        token_user = access_token.user
        return getattr(token_user, "role_name", None) == var_sys.ADMIN or bool(getattr(token_user, "is_staff", False))
