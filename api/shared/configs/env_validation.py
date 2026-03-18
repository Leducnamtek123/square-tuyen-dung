from django.core.exceptions import ImproperlyConfigured


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


def validate_required_settings(settings_dict):
    missing = []
    for setting_name in REQUIRED_SETTINGS:
        value = settings_dict.get(setting_name)
        if value in (None, "", []):
            missing.append(setting_name)

    if missing:
        joined = ", ".join(missing)
        raise ImproperlyConfigured(f"Missing required settings: {joined}")
