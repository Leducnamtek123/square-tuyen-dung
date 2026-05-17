import os

from django.core.exceptions import ImproperlyConfigured


PLACEHOLDER_VALUES = {
    "CHANGE_ME",
    "CHANGE_ME_shared_agent_secret",
    "CHANGE_ME_livekit_secret",
    "CHANGE_ME_same_value_as_api",
    "changeme",
    "password",
    "secret",
    "devkey",
    "no-key-needed",
    "project_secret_client_key_2024",
}

REQUIRED_SETTINGS = (
    "SECRET_KEY",
    "DB_ENGINE",
    "DB_NAME",
    "DB_USER",
    "DB_PASSWORD",
    "DB_HOST",
    "DB_PORT",
    "EMAIL_HOST",
    "EMAIL_PORT",
    "EMAIL_HOST_USER",
    "EMAIL_HOST_PASSWORD",
    "LIVEKIT_PUBLIC_URL",
)

PRODUCTION_SECRET_SETTINGS = (
    "SECRET_KEY",
    "DB_PASSWORD",
    "EMAIL_HOST_PASSWORD",
    "MINIO_ACCESS_KEY",
    "MINIO_SECRET_KEY",
    "CLIENT_SECRET",
    "LIVEKIT_API_KEY",
    "LIVEKIT_API_SECRET",
)

OPTIONAL_PRODUCTION_SECRET_SETTINGS = (
    "FRAPPE_HR_API_KEY",
    "FRAPPE_HR_API_SECRET",
    "FRAPPE_HR_ADMIN_PASSWORD",
    "FRAPPE_HR_DB_ROOT_PASSWORD",
)


DB_SETTING_FIELDS = {
    "DB_ENGINE": "ENGINE",
    "DB_NAME": "NAME",
    "DB_USER": "USER",
    "DB_PASSWORD": "PASSWORD",
    "DB_HOST": "HOST",
    "DB_PORT": "PORT",
}


def _get_setting(settings_source, setting_name):
    if isinstance(settings_source, dict):
        value = settings_source.get(setting_name)
        databases = settings_source.get("DATABASES")
    else:
        value = getattr(settings_source, setting_name, None)
        databases = getattr(settings_source, "DATABASES", None)

    if value not in (None, "", []):
        return value

    env_value = os.environ.get(setting_name)
    if env_value not in (None, "", []):
        return env_value

    db_field = DB_SETTING_FIELDS.get(setting_name)
    if db_field and isinstance(databases, dict):
        return (databases.get("default") or {}).get(db_field)

    return value


def _is_truthy(value) -> bool:
    return str(value).strip().lower() in {"1", "true", "yes", "on", "y", "t"}


def _is_production(settings_source) -> bool:
    app_env = _get_setting(settings_source, "APP_ENV") or _get_setting(settings_source, "APP_ENVIRONMENT")
    debug = _get_setting(settings_source, "DEBUG")
    return str(app_env).strip().lower() == "production" or debug is False or str(debug).strip().lower() == "false"


def _is_placeholder(value) -> bool:
    normalized = str(value or "").strip()
    if normalized in PLACEHOLDER_VALUES:
        return True
    return normalized.upper().startswith("CHANGE_ME")


def validate_required_settings(settings_dict):
    missing = []
    for setting_name in REQUIRED_SETTINGS:
        value = _get_setting(settings_dict, setting_name)
        if value in (None, "", []):
            missing.append(setting_name)

    if missing:
        joined = ", ".join(missing)
        raise ImproperlyConfigured(f"Missing required settings: {joined}")

    if not _is_production(settings_dict):
        return

    invalid = []
    for setting_name in PRODUCTION_SECRET_SETTINGS:
        value = _get_setting(settings_dict, setting_name)
        if value in (None, "", []) or _is_placeholder(value):
            invalid.append(setting_name)

    for setting_name in OPTIONAL_PRODUCTION_SECRET_SETTINGS:
        value = _get_setting(settings_dict, setting_name)
        if value not in (None, "", []) and _is_placeholder(value):
            invalid.append(setting_name)

    secret_key = str(_get_setting(settings_dict, "SECRET_KEY") or "")
    if len(secret_key) < 32:
        invalid.append("SECRET_KEY")

    agent_secret = _get_setting(settings_dict, "INTERVIEW_AGENT_SHARED_SECRET")
    agent_auth_required = _is_truthy(_get_setting(settings_dict, "INTERVIEW_AGENT_AUTH_REQUIRED"))
    if agent_auth_required and (not agent_secret or _is_placeholder(agent_secret) or len(str(agent_secret)) < 32):
        invalid.append("INTERVIEW_AGENT_SHARED_SECRET")

    if invalid:
        joined = ", ".join(dict.fromkeys(invalid))
        raise ImproperlyConfigured(f"Invalid production secret settings: {joined}")
