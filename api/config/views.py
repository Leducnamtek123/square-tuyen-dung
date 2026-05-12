from django.conf import settings
import json

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from apps.accounts.permissions import IsAdminUser
from apps.content.models import SystemSetting


SYSTEM_SETTING_DEFAULTS = {
    "maintenanceMode": getattr(settings, "MAINTENANCE_MODE", False),
    "autoApproveJobs": getattr(settings, "AUTO_APPROVE_JOBS", False),
    "emailNotifications": getattr(settings, "EMAIL_NOTIFICATIONS", True),
    "googleApiKey": getattr(settings, "GOOGLE_API_KEY", ""),
    "supportEmail": getattr(settings, "SUPPORT_CONTACT_EMAIL", ""),
}


def _coerce_setting_value(key, value):
    default = SYSTEM_SETTING_DEFAULTS[key]
    if isinstance(default, bool):
        if isinstance(value, bool):
            return value
        if isinstance(value, str):
            return value.strip().lower() in {"1", "true", "yes", "on"}
        return bool(value)
    if value is None:
        return ""
    return str(value)


def _decode_setting_value(key, raw_value):
    try:
        decoded = json.loads(raw_value)
    except (TypeError, json.JSONDecodeError):
        decoded = raw_value
    return _coerce_setting_value(key, decoded)


def _load_system_settings():
    data = dict(SYSTEM_SETTING_DEFAULTS)
    rows = SystemSetting.objects.filter(key__in=SYSTEM_SETTING_DEFAULTS.keys())
    for row in rows:
        data[row.key] = _decode_setting_value(row.key, row.value)
    return data


class SystemSettingsAPIView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        return Response(_load_system_settings())

    def put(self, request):
        for key in SYSTEM_SETTING_DEFAULTS:
            if key not in request.data:
                continue
            value = _coerce_setting_value(key, request.data.get(key))
            SystemSetting.objects.update_or_create(
                key=key,
                defaults={"value": json.dumps(value), "description": "Admin system setting"},
            )

        return Response(_load_system_settings(), status=status.HTTP_200_OK)
