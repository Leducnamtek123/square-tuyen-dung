import os
from datetime import datetime
from pathlib import Path
from decouple import config

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

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
AI_TTS_BASE_URL = config("AI_TTS_BASE_URL", default="http://localhost:8298/v1")
AI_TTS_DEFAULT_VOICE = config("AI_TTS_DEFAULT_VOICE", default="Ly (nữ miền Bắc)")
AI_STT_BASE_URL = config("AI_STT_BASE_URL", default="http://localhost:11437/v1")
AI_STT_MODEL = config("AI_STT_MODEL", default="openai/whisper-large-v3")
AI_STT_LANGUAGE = config("AI_STT_LANGUAGE", default="vi")
AI_LLM_BASE_URL = config(
    "AI_LLM_BASE_URL",
    default=config("LLAMA_BASE_URL", default="http://llama-cpp:11434/v1"),
)
AI_LLM_MODEL = config("AI_LLM_MODEL", default=config("LLAMA_MODEL", default="qwen2-7b"))
AI_RESUME_AUTO_ANALYZE = config("AI_RESUME_AUTO_ANALYZE", default=True, cast=bool)
LIVEKIT_PUBLIC_URL = config("LIVEKIT_PUBLIC_URL", default="")
LIVEKIT_API_KEY = config("LIVEKIT_API_KEY", default="")
LIVEKIT_API_SECRET = config("LIVEKIT_API_SECRET", default="")
API_VERSION = config("API_VERSION", default="v1")
SUPPORT_CONTACT_EMAIL = config("SUPPORT_CONTACT_EMAIL", default="support@squaregroup.vn")
LIVEKIT_WEBHOOK_TOKEN = config("LIVEKIT_WEBHOOK_TOKEN", default="")
LIVEKIT_WEBHOOK_STRICT = config("LIVEKIT_WEBHOOK_STRICT", default=True, cast=bool)
APP_ENVIRONMENT = config("APP_ENVIRONMENT", default="development")
STRICT_ENV_VALIDATION = config("STRICT_ENV_VALIDATION", default=False, cast=bool)

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = config('SECRET_KEY')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = config('DEBUG', default=False, cast=bool)
APPEND_SLASH = config('APPEND_SLASH', default=True, cast=bool)

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

DATABASES = {
    'default': {
        'ENGINE': config('DB_ENGINE'),
        'NAME': config('DB_NAME'),
        'USER': config('DB_USER'),
        'PASSWORD': config('DB_PASSWORD'),
        'HOST': config('DB_HOST'),
        'PORT': config('DB_PORT'),
        'OPTIONS': {
            'charset': 'utf8mb4',
            'init_command': "SET sql_mode='STRICT_TRANS_TABLES', NAMES 'utf8mb4' COLLATE 'utf8mb4_unicode_ci'",
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
if APP_ENVIRONMENT == 'production':
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_HSTS_SECONDS = 31536000  # 1 year
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True

# === Database Connection Persistence ===
CONN_MAX_AGE = 600  # Keep DB connections alive for 10 minutes
CONN_HEALTH_CHECKS = True  # Verify connections before reuse (Django 4.1+)
