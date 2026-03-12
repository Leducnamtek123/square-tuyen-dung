from django.urls import path, re_path, include
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from myjob_api.admin import custom_admin_site
from . import views
from . import ai_views, interviews_compat_views, livekit_webhook

schema_view = get_schema_view(
    openapi.Info(
        title="MyJob API",
        default_version='v1',
        description="API hệ thống giới thiêu việc làm.",
        terms_of_service="",
        contact=openapi.Contact(email="huybk2@gmail.com"),
    ),
    public=True,
    permission_classes=[permissions.AllowAny],
)
urlpatterns = [
    re_path(r'^swagger(?P<format>\.json|\.yaml)$', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    re_path(r'^swagger/$', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    re_path(r'^redoc/$', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    re_path(r'^ckeditor/', include('ckeditor_uploader.urls')),
    path('o/', include('oauth2_provider.urls', namespace='oauth2_provider')),
    path('api/', include(
        [
            path('common/', include('common.urls')),            
            path('auth/', include('authentication.urls')),
            path('info/', include('info.urls')),
            path('job/', include('job.urls')),
            path('myjob/', include('myjob.urls')),
            path('chatbot/', include('chatbot.urls')),
            path('interview/', include('interview.urls')),
            path('admin/web/system-settings/', views.SystemSettingsAPIView.as_view()),
            path('ai/tts/', ai_views.tts),
            path('ai/transcribe/', ai_views.transcribe),
            path('ai/chat/', ai_views.chat),
            path('livekit/webhook', livekit_webhook.livekit_webhook),
            path('interviews/<str:room_name>/context', interviews_compat_views.interview_context),
            path('interviews/<str:room_name>/next-question', interviews_compat_views.interview_next_question),
            path('interviews/<str:room_name>/status', interviews_compat_views.interview_status),
        ]
    )),
    path('', custom_admin_site.urls),
]
