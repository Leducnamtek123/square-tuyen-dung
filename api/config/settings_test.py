import os

# Provide safe defaults so pytest can boot without production secrets.
os.environ["DEBUG"] = "False"
os.environ["APPEND_SLASH"] = "True"
os.environ.setdefault("SECRET_KEY", "test-secret-key")
os.environ.setdefault("DB_ENGINE", "django.db.backends.sqlite3")
os.environ.setdefault("DB_NAME", ":memory:")
os.environ.setdefault("DB_USER", "")
os.environ.setdefault("DB_PASSWORD", "")
os.environ.setdefault("DB_HOST", "")
os.environ.setdefault("DB_PORT", "")
os.environ.setdefault("EMAIL_HOST", "localhost")
os.environ.setdefault("EMAIL_HOST_USER", "test@example.com")
os.environ.setdefault("EMAIL_HOST_PASSWORD", "test")

from .settings import *  # noqa: F401,F403

# Fast and deterministic test database config.
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": ":memory:",
    }
}

PASSWORD_HASHERS = [
    "django.contrib.auth.hashers.MD5PasswordHasher",
]

CELERY_TASK_ALWAYS_EAGER = True
CELERY_TASK_EAGER_PROPAGATES = True

# Keep envelope v2 enabled in tests.
API_RESPONSE_ENVELOPE_V2 = True

# Do not depend on external Redis in tests.
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        "LOCATION": "test-default",
    },
    "sessions": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        "LOCATION": "test-sessions",
    },
    "api_responses": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        "LOCATION": "test-api-responses",
    },
}

REST_FRAMEWORK["DEFAULT_THROTTLE_CLASSES"] = []
REST_FRAMEWORK["DEFAULT_THROTTLE_RATES"] = {}
