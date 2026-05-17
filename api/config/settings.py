import os
from datetime import datetime
from pathlib import Path
from decouple import config

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


def _load_env_file(path: Path) -> None:
    if not path.exists():
        return

    try:
        for raw_line in path.read_text(encoding="utf-8", errors="ignore").splitlines():
            line = raw_line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue

            key, value = line.split("=", 1)
            key = key.strip()
            value = value.strip()
            if not key:
                continue

            if len(value) >= 2 and value[0] == value[-1] and value[0] in {"'", '"'}:
                value = value[1:-1]

            os.environ.setdefault(key, value)
    except OSError:
        return


_load_env_file(BASE_DIR.parent / ".env")


def _to_bool(value) -> bool:
    if isinstance(value, bool):
        return value

    normalized = str(value).strip().lower()
    return normalized in {"1", "true", "yes", "on", "y", "t"}


def _mysql_driver_available() -> bool:
    try:
        import MySQLdb  # noqa: F401

        return True
    except Exception:
        return False

COMPANY_NAME = "Project"
COMPANY_CONTACT_EMAIL = config("COMPANY_CONTACT_EMAIL", default=config("SUPPORT_CONTACT_EMAIL", default="support@squaregroup.vn"))
COMPANY_CONTACT_PHONE = config("COMPANY_CONTACT_PHONE", default="0888-425-094")
COMPANY_CONTACT_ADDRESS = config(
    "COMPANY_CONTACT_ADDRESS",
    default="",
)
COMPANY_WORK_TIME = config("COMPANY_WORK_TIME", default="8:00 - 17:30 (Monday - Friday)")

WEB_JOB_SEEKER_CLIENT_URL = config("WEB_JOB_SEEKER_CLIENT_URL", default="http://localhost:3000/")
WEB_EMPLOYER_CLIENT_URL = config("WEB_EMPLOYER_CLIENT_URL", default="http://localhost:3000/")

DOMAIN_CLIENT = {
    "job_seeker": WEB_JOB_SEEKER_CLIENT_URL if WEB_JOB_SEEKER_CLIENT_URL else "http://127.0.0.1:3000/",
    "employer": WEB_EMPLOYER_CLIENT_URL if WEB_EMPLOYER_CLIENT_URL else "http://localhost:3000/",
}

# Local AI (Voice) services
AI_TTS_BASE_URL = config("AI_TTS_BASE_URL", default=config("TTS_BASE_URL", default="http://localhost:8298/v1"))
AI_TTS_DEFAULT_VOICE = config("AI_TTS_DEFAULT_VOICE", default=config("TTS_VOICE", default="Ly"))
AI_STT_BASE_URL = config("AI_STT_BASE_URL", default=config("STT_BASE_URL", default="http://localhost:11437/v1"))
AI_STT_MODEL = config("AI_STT_MODEL", default=config("STT_MODEL", default="openai/whisper-large-v3"))
AI_STT_LANGUAGE = config("AI_STT_LANGUAGE", default=config("STT_LANGUAGE", default="vi"))
AI_LLM_BASE_URL = config(
    "AI_LLM_BASE_URL",
    default=config("LLM_BASE_URL", default=config("OLLAMA_BASE_URL", default="http://ollama:11434/v1")),
)
AI_LLM_MODEL = config("AI_LLM_MODEL", default=config("LLM_MODEL", default=config("OLLAMA_MODEL", default="gemma4:e4b")))
AI_LLM_API_KEY = config("AI_LLM_API_KEY", default=config("LLM_API_KEY", default=config("GROQ_API_KEY", default="")))
AI_LLM_LOCAL_BASE_URL = config("AI_LLM_LOCAL_BASE_URL", default="")
AI_LLM_LOCAL_MODEL = config("AI_LLM_LOCAL_MODEL", default=AI_LLM_MODEL)
AI_LLM_LOCAL_API_KEY = config("AI_LLM_LOCAL_API_KEY", default="")
AI_LLM_FALLBACK_BASE_URLS = config("AI_LLM_FALLBACK_BASE_URLS", default=AI_LLM_LOCAL_BASE_URL)
AI_LLM_FALLBACK_MODELS = config("AI_LLM_FALLBACK_MODELS", default=AI_LLM_LOCAL_MODEL if AI_LLM_LOCAL_BASE_URL else "")
AI_LLM_FALLBACK_API_KEYS = config("AI_LLM_FALLBACK_API_KEYS", default=AI_LLM_LOCAL_API_KEY if AI_LLM_LOCAL_BASE_URL else "")
AI_LLM_TEMPERATURE = config("AI_LLM_TEMPERATURE", default=0.7, cast=float)
AI_LLM_TOP_P = config("AI_LLM_TOP_P", default=0.8, cast=float)
AI_LLM_TOP_K = config("AI_LLM_TOP_K", default=20, cast=int)
AI_LLM_MIN_P = config("AI_LLM_MIN_P", default=0.0, cast=float)
AI_LLM_PRESENCE_PENALTY = config("AI_LLM_PRESENCE_PENALTY", default=1.5, cast=float)
AI_LLM_REPETITION_PENALTY = config("AI_LLM_REPETITION_PENALTY", default=1.0, cast=float)
AI_LLM_ENABLE_THINKING = config("AI_LLM_ENABLE_THINKING", default=False, cast=_to_bool)
AI_LLM_MAX_TOKENS = config("AI_LLM_MAX_TOKENS", default=2048, cast=int)
AI_LLM_USE_VLLM_PARAMS = config("AI_LLM_USE_VLLM_PARAMS", default=False, cast=_to_bool)
AI_STT_FALLBACK_BASE_URLS = config("AI_STT_FALLBACK_BASE_URLS", default="")
AI_TTS_FALLBACK_BASE_URLS = config("AI_TTS_FALLBACK_BASE_URLS", default="")
AI_RESUME_AUTO_ANALYZE = config("AI_RESUME_AUTO_ANALYZE", default=True, cast=bool)
LIVEKIT_PUBLIC_URL = config("LIVEKIT_PUBLIC_URL", default="")
LIVEKIT_URL = config("LIVEKIT_URL", default="http://livekit:7880")
LIVEKIT_API_KEY = config("LIVEKIT_API_KEY", default="")
LIVEKIT_API_SECRET = config("LIVEKIT_API_SECRET", default="")

# FPT GPU Container control-plane settings. These are intentionally backend-only
# because the FPT BSS token can start/stop billable infrastructure.
FPT_GPU_CONTROL_BASE_URL = config("FPT_GPU_CONTROL_BASE_URL", default="https://console-api.fptcloud.com")
FPT_GPU_BSS_TOKEN_EXCHANGE_URL = config(
    "FPT_GPU_BSS_TOKEN_EXCHANGE_URL",
    default="https://ai-api.fptcloud.com/v1/login-callback/cloud_access_token",
)
FPT_GPU_TENANT_ID = config("FPT_GPU_TENANT_ID", default="")
FPT_GPU_REGION = config("FPT_GPU_REGION", default="hanoi-2-vn")
FPT_GPU_CONTAINER_ID = config("FPT_GPU_CONTAINER_ID", default="")
FPT_GPU_CONTAINER_NAME = config("FPT_GPU_CONTAINER_NAME", default="")
FPT_GPU_CONSOLE_URL = config("FPT_GPU_CONSOLE_URL", default="")
FPT_GPU_BSS_ACCESS_TOKEN = config("FPT_GPU_BSS_ACCESS_TOKEN", default="")
FPT_GPU_ACCESS_TOKEN = config("FPT_GPU_ACCESS_TOKEN", default="")
FPT_GPU_RUNNING_HOURLY_COST_VND = config("FPT_GPU_RUNNING_HOURLY_COST_VND", default=0, cast=int)
FPT_GPU_STOPPED_HOURLY_COST_VND = config("FPT_GPU_STOPPED_HOURLY_COST_VND", default=0, cast=int)
API_VERSION = config("API_VERSION", default="v1")
SUPPORT_CONTACT_EMAIL = config("SUPPORT_CONTACT_EMAIL", default="support@squaregroup.vn")
LIVEKIT_WEBHOOK_TOKEN = config("LIVEKIT_WEBHOOK_TOKEN", default="")
LIVEKIT_WEBHOOK_STRICT = config("LIVEKIT_WEBHOOK_STRICT", default=True, cast=_to_bool)
INTERVIEW_AGENT_SHARED_SECRET = config("INTERVIEW_AGENT_SHARED_SECRET", default="")
INTERVIEW_AGENT_AUTH_REQUIRED = config(
    "INTERVIEW_AGENT_AUTH_REQUIRED",
    default=bool(INTERVIEW_AGENT_SHARED_SECRET),
    cast=_to_bool,
)
INTERVIEW_AGENT_AUTH_MAX_SKEW_SECONDS = config("INTERVIEW_AGENT_AUTH_MAX_SKEW_SECONDS", default=300, cast=int)
INTERVIEW_DISCONNECT_GRACE_SECONDS = config("INTERVIEW_DISCONNECT_GRACE_SECONDS", default=300, cast=int)
APP_ENV = config("APP_ENV", default=config("APP_ENVIRONMENT", default="development"))
APP_ENVIRONMENT = config("APP_ENVIRONMENT", default=APP_ENV)
IS_PRODUCTION = str(APP_ENVIRONMENT).strip().lower() == "production"
STRICT_ENV_VALIDATION = config("STRICT_ENV_VALIDATION", default=False, cast=_to_bool)
API_RESPONSE_ENVELOPE_V2 = config("API_RESPONSE_ENVELOPE_V2", default=True, cast=_to_bool)
FRAPPE_HR_BASE_URL = config("FRAPPE_HR_BASE_URL", default="")
FRAPPE_HR_PUBLIC_URL = config("FRAPPE_HR_PUBLIC_URL", default=FRAPPE_HR_BASE_URL)
FRAPPE_HR_SITE_NAME = config("FRAPPE_HR_SITE_NAME", default="")
FRAPPE_HR_API_KEY = config("FRAPPE_HR_API_KEY", default="")
FRAPPE_HR_API_SECRET = config("FRAPPE_HR_API_SECRET", default="")
FRAPPE_HR_TIMEOUT_SECONDS = config("FRAPPE_HR_TIMEOUT_SECONDS", default=20, cast=int)
FRAPPE_HR_DEFAULT_COMPANY = config("FRAPPE_HR_DEFAULT_COMPANY", default="")
FRAPPE_HR_DEFAULT_DEPARTMENT = config("FRAPPE_HR_DEFAULT_DEPARTMENT", default="")
FRAPPE_HR_DEFAULT_CURRENCY = config("FRAPPE_HR_DEFAULT_CURRENCY", default="VND")
FRAPPE_HR_DEFAULT_COUNTRY = config("FRAPPE_HR_DEFAULT_COUNTRY", default="Vietnam")
FRAPPE_HR_DEFAULT_GENDER = config("FRAPPE_HR_DEFAULT_GENDER", default="Other")
FRAPPE_HR_DEFAULT_DATE_OF_BIRTH = config("FRAPPE_HR_DEFAULT_DATE_OF_BIRTH", default="1990-01-01")
FRAPPE_HR_EMPLOYEE_ROLES = config(
    "FRAPPE_HR_EMPLOYEE_ROLES",
    default="Employee",
    cast=lambda v: [s.strip() for s in v.split(",") if s.strip()],
)
FRAPPE_HR_RECRUITER_ROLES = config(
    "FRAPPE_HR_RECRUITER_ROLES",
    default="HR Manager,HR User",
    cast=lambda v: [s.strip() for s in v.split(",") if s.strip()],
)
FRAPPE_HR_RECRUITER_READONLY_ROLES = config(
    "FRAPPE_HR_RECRUITER_READONLY_ROLES",
    default="HR User",
    cast=lambda v: [s.strip() for s in v.split(",") if s.strip()],
)
FRAPPE_HR_SYNC_RECRUITER_ACCOUNTS = config("FRAPPE_HR_SYNC_RECRUITER_ACCOUNTS", default=True, cast=_to_bool)

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = config("SECRET_KEY", default="django-insecure-square-tuyen-dung-local-only")

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = config("DEBUG", default=False, cast=_to_bool)
APPEND_SLASH = config("APPEND_SLASH", default=True, cast=_to_bool)

ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost,127.0.0.1', cast=lambda v: [s.strip() for s in v.split(',') if s.strip()])
CSRF_TRUSTED_ORIGINS = config('CSRF_TRUSTED_ORIGINS', default='http://localhost', cast=lambda v: [s.strip() for s in v.split(',') if s.strip()])

CORS_ALLOW_ALL_ORIGINS = DEBUG  # Only allow all origins in Debug mode
CORS_ALLOWED_ORIGINS = config('CORS_ALLOWED_ORIGINS', default=','.join(CSRF_TRUSTED_ORIGINS), cast=lambda v: [s.strip() for s in v.split(',') if s.strip()])
INTERNAL_IPS = ('127.0.0.1')

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django_admin_listfilter_dropdown',
    'ckeditor',
    'django_otp',
    'rest_framework',
    'django_filters',
    'django_extensions',
    'drf_yasg',
    'oauth2_provider',
    'social_django',
    'drf_social_oauth2',
    'celery',
    'django_celery_beat',
    'import_export',
    # internal apps
    'common',
    'apps.locations',
    'apps.files',
    'apps.accounts',
    'apps.profiles',
    'apps.jobs',
    'apps.content',
    'apps.chatbot',
    'apps.interviews',
    'corsheaders',
    'django_celery_results',
    'timezone_field',
    'django_elasticsearch_dsl',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'apps.content.middleware.MaintenanceModeMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'django.middleware.locale.LocaleMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'config/templates',
                 BASE_DIR / 'config/templates/emails/'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                'social_django.context_processors.backends',
                'social_django.context_processors.login_redirect',
                'apps.content.context_processors.get_current_user'
            ],
        }
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

CKEDITOR_CONFIGS = {
    'default': {
        'toolbar_Basic': [
            ['Source', '-', 'Bold', 'Italic']
        ],
        'toolbar_YourCustomToolbarConfig': [
            {'name': 'basicstyles',
             'items': ['Bold', 'Italic', 'Underline', 'Strike', 'Subscript', 'Superscript']},
            {'name': 'paragraph',
             'items': ['NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-',
                       'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock']},
            {'name': 'insert',
             'items': ['Table', 'HorizontalRule']},
            '/',  # put this to force next toolbar on new line
        ],
        'toolbar': 'YourCustomToolbarConfig',  # put selected toolbar config here
        'height': 280,
        'width': '100%',
        'tabSpaces': 4,
    }
}

# https://docs.djangoproject.com/en/4.1/ref/settings/#databases
# Bo khi su dung sqlclient: mysqlclient==2.1.1

DB_ENGINE = config("DB_ENGINE", default="django.db.backends.sqlite3")
if DB_ENGINE == "django.db.backends.mysql" and not _mysql_driver_available() and APP_ENVIRONMENT != "production":
    DB_ENGINE = "django.db.backends.sqlite3"

if DB_ENGINE == "django.db.backends.sqlite3":
    DATABASES = {
        "default": {
            "ENGINE": DB_ENGINE,
            "NAME": config("DB_NAME", default=str(BASE_DIR / "db.sqlite3")),
        }
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": DB_ENGINE,
            "NAME": config("DB_NAME", default=""),
            "USER": config("DB_USER", default=""),
            "PASSWORD": config("DB_PASSWORD", default=""),
            "HOST": config("DB_HOST", default=""),
            "PORT": config("DB_PORT", default=""),
            "OPTIONS": {
                "charset": "utf8mb4",
                "init_command": "SET sql_mode='STRICT_TRANS_TABLES', NAMES 'utf8mb4' COLLATE 'utf8mb4_unicode_ci'",
            },
        }
    }

# Password validation
# https://docs.djangoproject.com/en/4.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

AUTH_USER_MODEL = 'authentication.User'

REST_FRAMEWORK = {
    'DEFAULT_PAGINATION_CLASS': 'shared.pagination.CustomPagination',
    'DEFAULT_RENDERER_CLASSES': (
        'shared.renderers.MyJSONRenderer',
    ),
    'EXCEPTION_HANDLER': 'shared.exceptions.api_exception_handler',
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_PARSER_CLASSES': [
        'rest_framework.parsers.JSONParser',
        'rest_framework.parsers.FormParser',
        'rest_framework.parsers.MultiPartParser',
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'oauth2_provider.contrib.rest_framework.OAuth2Authentication',
        'drf_social_oauth2.authentication.SocialAuthentication',
    ),
    'DEFAULT_FILTER_BACKENDS': ['django_filters.rest_framework.DjangoFilterBackend'],
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '300/minute',
        'user': '600/minute',
    },
}

OAUTH2_PROVIDER = {
    'SCOPES': {
        'read': 'Read scope',
        'write': 'Write scope',
    },
    'CLIENT_ID_GENERATOR_CLASS': 'oauth2_provider.generators.ClientIdGenerator',
    'ACCESS_TOKEN_EXPIRE_SECONDS': 3600,  # 1 hour
    'REFRESH_TOKEN_EXPIRE_SECONDS': 604800,  # 7 days
}

AUTHENTICATION_BACKENDS = (
    'social_core.backends.facebook.FacebookAppOAuth2',
    'social_core.backends.facebook.FacebookOAuth2',

    'social_core.backends.google.GoogleOAuth2',

    'drf_social_oauth2.backends.DjangoOAuth2',
    'django.contrib.auth.backends.ModelBackend',
)

# Internationalization
# https://docs.djangoproject.com/en/4.1/topics/i18n/

LANGUAGE_CODE = 'vi-vn'

TIME_ZONE = 'Asia/Ho_Chi_Minh'

USE_I18N = True

USE_TZ = True

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/4.1/howto/static-files/

STATIC_URL = 'static/'
STATICFILES_DIRS = [os.path.join(BASE_DIR, "config", "static")]
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
CKEDITOR_UPLOAD_PATH = "uploads/"
# Default primary key field type
# https://docs.djangoproject.com/en/4.1/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

LOGIN_REDIRECT_URL = '/'

SERVICE_REDIS_HOST = config('SERVICE_REDIS_HOST', default='redis')
SERVICE_REDIS_PORT = config('SERVICE_REDIS_PORT', default=6379, cast=int)
SERVICE_REDIS_USERNAME = config('SERVICE_REDIS_USERNAME', default='')
SERVICE_REDIS_PASSWORD = config('SERVICE_REDIS_PASSWORD', default='')
SERVICE_REDIS_DB = config('SERVICE_REDIS_DB', default=0, cast=int)

# --- Cache Framework (Redis-backed) ---
_REDIS_URL_BASE = f"redis://{SERVICE_REDIS_USERNAME}:{SERVICE_REDIS_PASSWORD}@{SERVICE_REDIS_HOST}:{SERVICE_REDIS_PORT}" if SERVICE_REDIS_PASSWORD else f"redis://{SERVICE_REDIS_HOST}:{SERVICE_REDIS_PORT}"

CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.redis.RedisCache",
        "LOCATION": f"{_REDIS_URL_BASE}/1",
        "TIMEOUT": 900,  # 15 minutes default TTL
        "OPTIONS": {
            "db": 1,
        },
        "KEY_PREFIX": "sq",
    },
    "sessions": {
        "BACKEND": "django.core.cache.backends.redis.RedisCache",
        "LOCATION": f"{_REDIS_URL_BASE}/2",
        "TIMEOUT": 86400,  # 1 day
        "KEY_PREFIX": "sq_sess",
    },
    "api_responses": {
        "BACKEND": "django.core.cache.backends.redis.RedisCache",
        "LOCATION": f"{_REDIS_URL_BASE}/3",
        "TIMEOUT": 300,  # 5 minutes — for cacheable API responses
        "KEY_PREFIX": "sq_api",
    },
}

# Facebook configuration
SOCIAL_AUTH_FACEBOOK_DIALOG_URL = 'https://www.facebook.com/v15.0/dialog/oauth/'
SOCIAL_AUTH_FACEBOOK_OAUTH2_REVOKE_TOKEN_URL = 'https://graph.facebook.com/v15.0/me/permissions'
SOCIAL_AUTH_FACEBOOK_KEY = config('SOCIAL_AUTH_FACEBOOK_KEY', default='')
SOCIAL_AUTH_FACEBOOK_SECRET = config('SOCIAL_AUTH_FACEBOOK_SECRET', default='')
# Define SOCIAL_AUTH_FACEBOOK_SCOPE to get extra permissions from Facebook.
# Email is not sent by default, to get it, you must request the email permission.
SOCIAL_AUTH_FACEBOOK_SCOPE = ['email']
SOCIAL_AUTH_FACEBOOK_PROFILE_EXTRA_PARAMS = {
    'fields': 'id,name,email,first_name,last_name'
}

# Google configuration
SOCIAL_AUTH_GOOGLE_OAUTH2_REDIRECT_URI = DOMAIN_CLIENT['job_seeker'].rstrip('/')
SOCIAL_AUTH_GOOGLE_OAUTH2_TOKEN_URL = 'https://accounts.google.com/o/oauth2/token'
SOCIAL_AUTH_GOOGLE_OAUTH2_URL = 'https://accounts.google.com/o/oauth2/auth'
SOCIAL_AUTH_GOOGLE_OAUTH2_KEY = config('SOCIAL_AUTH_GOOGLE_OAUTH2_KEY', default='')
SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET = config('SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET', default='')
# Define SOCIAL_AUTH_GOOGLE_OAUTH2_SCOPE to get extra permissions from Google.
SOCIAL_AUTH_GOOGLE_OAUTH2_SCOPE = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
]

SOCIAL_AUTH_PIPELINE = (
    'social_core.pipeline.social_auth.social_details',
    'social_core.pipeline.social_auth.social_uid',
    'social_core.pipeline.social_auth.auth_allowed',
    'apps.accounts.pipeline.custom_social_user',
    'apps.accounts.pipeline.custom_create_user',
    'apps.profiles.pipeline.save_profile',
    'social_core.pipeline.social_auth.associate_user',
    'social_core.pipeline.social_auth.load_extra_data',
    'social_core.pipeline.user.user_details'
)

EMAIL_HOST = config('EMAIL_HOST')
EMAIL_PORT = config('EMAIL_PORT', cast=int)
EMAIL_HOST_USER = config('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD')
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_USE_TLS = True
DEFAULT_FROM_EMAIL = EMAIL_HOST_USER

CELERY_BROKER_URL = f"redis://{SERVICE_REDIS_USERNAME}:{SERVICE_REDIS_PASSWORD}@{SERVICE_REDIS_HOST}:{SERVICE_REDIS_PORT}/{SERVICE_REDIS_DB}"
CELERY_RESULT_BACKEND = f"redis://{SERVICE_REDIS_USERNAME}:{SERVICE_REDIS_PASSWORD}@{SERVICE_REDIS_HOST}:{SERVICE_REDIS_PORT}/{SERVICE_REDIS_DB}"
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TIMEZONE = 'Asia/Ho_Chi_Minh'
DJANGO_CELERY_BEAT_TZ_AWARE = True
CELERY_WORKER_PREFETCH_MULTIPLIER = config('CELERY_WORKER_PREFETCH_MULTIPLIER', default=1, cast=int)
CELERY_TASK_ACKS_LATE = config('CELERY_TASK_ACKS_LATE', default=True, cast=bool)
CELERY_TASK_REJECT_ON_WORKER_LOST = config('CELERY_TASK_REJECT_ON_WORKER_LOST', default=True, cast=bool)
CELERY_WORKER_MAX_TASKS_PER_CHILD = config('CELERY_WORKER_MAX_TASKS_PER_CHILD', default=20, cast=int)

CELERY_BEAT_SCHEDULER = 'django_celery_beat.schedulers:DatabaseScheduler'

MINIO_ENDPOINT = config('MINIO_ENDPOINT', default='minio:9000')
MINIO_ACCESS_KEY = config('MINIO_ACCESS_KEY', default='admin')
MINIO_SECRET_KEY = config('MINIO_SECRET_KEY', default='password')
MINIO_BUCKET = config('MINIO_BUCKET', default='Project-bucket')
MINIO_SECURE = config('MINIO_SECURE', default=False, cast=bool)
MINIO_PUBLIC_URL = config('MINIO_PUBLIC_URL', default='http://localhost:9000')
MINIO_PRESIGN_EXPIRES = config('MINIO_PRESIGN_EXPIRES', default=3600, cast=int)
MINIO_USE_PRESIGNED = config('MINIO_USE_PRESIGNED', default=False, cast=bool)
MINIO_PRESIGN_PUBLIC = config('MINIO_PRESIGN_PUBLIC', default=False, cast=bool)
FILE_STORAGE_BACKEND = config("FILE_STORAGE_BACKEND", default="minio")
FILE_STORAGE_PUBLIC_URL = config("FILE_STORAGE_PUBLIC_URL", default="")

# Legacy naming kept for backward compatibility.
# New code should use STORAGE_BASE_URL / STORAGE_DIRECTORIES.
CLOUDINARY_PATH = f"{MINIO_PUBLIC_URL.rstrip('/')}/{MINIO_BUCKET}/"

CLOUDINARY_DIRECTORY = {
    "avatar": "avatar/",
    "cv": "cv/",
    "logo": "logo/",
    "cover_image": "cover_image/",
    "company_image": "company_image/",
    "career_image": "career_image/",
    "web_banner": "banners/web_banners/",
    "mobile_banner": "banners/mobile_banners/",
    "system": "system/",
    "icons": "icons/",
    "about_us": "about_us/"
}

# Modern aliases — prefer these in new code
STORAGE_BASE_URL = CLOUDINARY_PATH
STORAGE_DIRECTORIES = CLOUDINARY_DIRECTORY

REDIRECT_LOGIN_CLIENT = "dang-nhap"

PROJECT_AUTH = {
    "VERIFY_EMAIL_LINK_EXPIRE_SECONDS": 7200,
    "RESET_PASSWORD_EXPIRE_SECONDS": 7200,
    "TIME_REQUIRED_FORGOT_PASSWORD": 120
}

# Interview settings
INTERVIEW_MAX_DURATION_SECONDS = int(os.getenv("INTERVIEW_MAX_DURATION_SECONDS", "1800"))

REDIS_JOB_TITLE_EXPIRE_SECONDS = 14400

SMS_BASE_URL = "https://qy1kdr.api.infobip.com"
SMS_API_KEY = config('SMS_API_KEY', default='')

FIREBASE_CONFIG = {
    "apiKey": config('FIREBASE_API_KEY', default=''),
    "authDomain": config('FIREBASE_AUTH_DOMAIN', default=''),
    "projectId": config('FIREBASE_PROJECT_ID', default=''),
    "storageBucket": config('FIREBASE_STORAGE_BUCKET', default=''),
    "messagingSenderId": config('FIREBASE_MESSAGING_SENDER_ID', default=''),
    "appId": config('FIREBASE_APP_ID', default=''),
    "measurementId": config('FIREBASE_MEASUREMENT_ID', default='')
}
FIREBASE_CREDENTIALS_PATH = config('FIREBASE_CREDENTIALS_PATH', default='')
FIREBASE_CREDENTIALS_JSON = config('FIREBASE_CREDENTIALS_JSON', default='')
FIREBASE_CREDENTIALS_JSON_BASE64 = config('FIREBASE_CREDENTIALS_JSON_BASE64', default='')

JSON_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'config', '')

def _select_log_dir() -> Path:
    explicit = config("LOG_DIR", default="")
    candidates = []
    if explicit:
        candidates.append(Path(explicit))
    candidates.append(BASE_DIR / "logs")
    candidates.append(Path("/tmp/api-logs"))

    for candidate in candidates:
        try:
            candidate.mkdir(parents=True, exist_ok=True)
            test_file = candidate / ".write_test"
            with open(test_file, "w", encoding="utf-8") as handle:
                handle.write("ok")
            try:
                test_file.unlink()
            except FileNotFoundError:
                pass
            return candidate
        except Exception:
            continue

    return BASE_DIR


LOG_DIR = _select_log_dir()

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "standard": {
            "format": "%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "standard",
            "level": "INFO",
        },
        "file": {
            "class": "logging.handlers.RotatingFileHandler",
            "filename": str(LOG_DIR / "app.log"),
            "maxBytes": 10 * 1024 * 1024,
            "backupCount": 5,
            "formatter": "standard",
            "level": "INFO",
        },
        "error_file": {
            "class": "logging.handlers.RotatingFileHandler",
            "filename": str(LOG_DIR / "error.log"),
            "maxBytes": 10 * 1024 * 1024,
            "backupCount": 10,
            "formatter": "standard",
            "level": "ERROR",
        },
    },
    "root": {
        "handlers": ["console", "file", "error_file"],
        "level": "INFO",
    },
}

if STRICT_ENV_VALIDATION:
    from shared.configs.env_validation import validate_required_settings

    validate_required_settings(globals())


ELASTICSEARCH_DSL = {
    'default': {
        'hosts': config('ELASTICSEARCH_HOST', default='elasticsearch:9200')
    },
}



# === Sentry Error Tracking ===
SENTRY_DSN = config('SENTRY_DSN', default='')
if SENTRY_DSN:
    import sentry_sdk
    sentry_sdk.init(
        dsn=SENTRY_DSN,
        traces_sample_rate=0.1,
        environment=APP_ENVIRONMENT,
    )

# === Security Headers ===
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
USE_X_FORWARDED_HOST = config("USE_X_FORWARDED_HOST", default=IS_PRODUCTION, cast=_to_bool)
SECURE_SSL_REDIRECT = config("SECURE_SSL_REDIRECT", default=IS_PRODUCTION, cast=_to_bool)
SESSION_COOKIE_SECURE = config("SESSION_COOKIE_SECURE", default=IS_PRODUCTION, cast=_to_bool)
CSRF_COOKIE_SECURE = config("CSRF_COOKIE_SECURE", default=IS_PRODUCTION, cast=_to_bool)
SECURE_HSTS_SECONDS = config("SECURE_HSTS_SECONDS", default=31536000 if IS_PRODUCTION else 0, cast=int)
SECURE_HSTS_INCLUDE_SUBDOMAINS = config(
    "SECURE_HSTS_INCLUDE_SUBDOMAINS",
    default=IS_PRODUCTION,
    cast=_to_bool,
)
SECURE_HSTS_PRELOAD = config("SECURE_HSTS_PRELOAD", default=IS_PRODUCTION, cast=_to_bool)

# === Database Connection Persistence ===
CONN_MAX_AGE = 600  # Keep DB connections alive for 10 minutes
CONN_HEALTH_CHECKS = True  # Verify connections before reuse (Django 4.1+)
