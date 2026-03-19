from django.conf import settings
from django.urls import include, path, re_path
from drf_yasg import openapi
from drf_yasg.views import get_schema_view
from rest_framework import permissions

from config.admin import custom_admin_site
from config import interviews_compat_views, views
from integrations.ai import views as ai_views
from integrations.livekit import webhook as livekit_webhook

schema_view = get_schema_view(
    openapi.Info(
        title="Project API",
        default_version="v1",
        description="API he thong gioi thieu viec lam.",
        terms_of_service="",
        contact=openapi.Contact(email=settings.SUPPORT_CONTACT_EMAIL),
    ),
    public=True,
    permission_classes=[permissions.AllowAny],
)

api_v1_patterns = [
    path("common/", include("common.urls")),
    path("auth/", include("apps.accounts.urls")),
    path("info/", include("apps.profiles.urls")),
    path("job/", include("apps.jobs.urls")),
    path("Project/", include("apps.content.urls")),
    path("chatbot/", include("apps.chatbot.urls")),
    path("interview/", include("apps.interviews.urls")),
    path("admin/web/system-settings/", views.SystemSettingsAPIView.as_view()),
    path("ai/tts/", ai_views.tts),
    path("ai/transcribe/", ai_views.transcribe),
    path("ai/chat/", ai_views.chat),
    path("interview/livekit/webhook", livekit_webhook.livekit_webhook),
    # Compatibility endpoints for voice-agent integration.
    path("interview/compat/<str:room_name>/context", interviews_compat_views.interview_context),
    path("interview/compat/<str:room_name>/next-question", interviews_compat_views.interview_next_question),
    path("interview/compat/<str:room_name>/status", interviews_compat_views.interview_status),
    path("interview/compat/<str:room_name>/append-transcription", interviews_compat_views.interview_append_transcription),
]

urlpatterns = [
    re_path(r"^swagger(?P<format>\.json|\.yaml)$", schema_view.without_ui(cache_timeout=0), name="schema-json"),
    re_path(r"^swagger/$", schema_view.with_ui("swagger", cache_timeout=0), name="schema-swagger-ui"),
    re_path(r"^redoc/$", schema_view.with_ui("redoc", cache_timeout=0), name="schema-redoc"),
    path("ckeditor/", include("ckeditor_uploader.urls")),
    path("o/", include("oauth2_provider.urls", namespace="oauth2_provider")),
    path("auth/", include("drf_social_oauth2.urls", namespace="drf")),
    path("api/v1/", include((api_v1_patterns, "api-v1"))),
    # Backward compatibility during migration. Remove after clients move to /api/v1/.
    path("api/", include((api_v1_patterns, "api-legacy"))),
    path("", custom_admin_site.urls),
]

