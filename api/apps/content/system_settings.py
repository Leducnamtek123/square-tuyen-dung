import json
from typing import Any, Dict, Mapping

from django.conf import settings
from django.core.cache import cache
from django.db.utils import DatabaseError, OperationalError, ProgrammingError

from .models import SystemSetting


SYSTEM_SETTING_DEFAULTS: Dict[str, Any] = {
    "maintenanceMode": getattr(settings, "MAINTENANCE_MODE", False),
    "autoApproveJobs": getattr(settings, "AUTO_APPROVE_JOBS", False),
    "emailNotifications": getattr(settings, "EMAIL_NOTIFICATIONS", True),
    "googleApiKey": getattr(settings, "GOOGLE_API_KEY", ""),
    "supportEmail": getattr(settings, "SUPPORT_CONTACT_EMAIL", ""),
}

BOOLEAN_SYSTEM_SETTINGS = {
    key for key, value in SYSTEM_SETTING_DEFAULTS.items() if isinstance(value, bool)
}


def coerce_setting_value(key: str, value: Any) -> Any:
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


def decode_setting_value(key: str, raw_value: Any) -> Any:
    try:
        decoded = json.loads(raw_value)
    except (TypeError, json.JSONDecodeError):
        decoded = raw_value
    return coerce_setting_value(key, decoded)


def load_system_settings() -> Dict[str, Any]:
    data = dict(SYSTEM_SETTING_DEFAULTS)
    try:
        rows = SystemSetting.objects.filter(key__in=SYSTEM_SETTING_DEFAULTS.keys())
        for row in rows:
            data[row.key] = decode_setting_value(row.key, row.value)
    except (DatabaseError, OperationalError, ProgrammingError):
        return data
    return data


def update_system_settings(payload: Mapping[str, Any]) -> Dict[str, Any]:
    for key in SYSTEM_SETTING_DEFAULTS:
        if key not in payload:
            continue
        value = coerce_setting_value(key, payload.get(key))
        SystemSetting.objects.update_or_create(
            key=key,
            defaults={
                "value": json.dumps(value),
                "description": "Admin system setting",
            },
        )

    cache.delete("common_all_config")
    return load_system_settings()


def get_system_setting(key: str, default: Any = None) -> Any:
    if key not in SYSTEM_SETTING_DEFAULTS:
        return default
    return load_system_settings().get(key, default)


def maintenance_mode_enabled() -> bool:
    return bool(get_system_setting("maintenanceMode", False))


def auto_approve_jobs_enabled() -> bool:
    return bool(get_system_setting("autoApproveJobs", False))


def email_notifications_enabled() -> bool:
    return bool(get_system_setting("emailNotifications", True))


def get_support_email() -> str:
    return str(get_system_setting("supportEmail", getattr(settings, "SUPPORT_CONTACT_EMAIL", "")))
