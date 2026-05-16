"""
Interview Module — URL Configuration
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .sse_views import interview_event_stream

web_router = DefaultRouter()
web_router.register('questions', views.QuestionViewSet, basename='interview-questions')
web_router.register('question-groups', views.QuestionGroupViewSet, basename='interview-question-groups')
web_router.register('sessions', views.InterviewSessionViewSet, basename='interview-sessions')
web_router.register('evaluations', views.InterviewEvaluationViewSet, basename='interview-evaluations')

admin_router = DefaultRouter()
admin_router.register('sessions', views.AdminInterviewSessionReadOnlyViewSet, basename='admin-interview-sessions')

urlpatterns = [
    path('web/screening-results/<int:session_id>/', views.ScreeningResultAPIView.as_view()),
    path('web/', include(web_router.urls)),
    path('admin/', include(admin_router.urls)),
    path('web/sessions/<int:session_id>/stream/', interview_event_stream, name='interview-sse-stream'),
    path(
        'web/statistics/admin-general-statistics/',
        views.InterviewStatisticViewSet.as_view({'get': 'general_statistics'}),
    ),
]
