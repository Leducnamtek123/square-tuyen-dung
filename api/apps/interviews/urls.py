"""
Interview Module — URL Configuration
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from . import views_enhancements
from .sse_views import interview_event_stream

web_router = DefaultRouter()
web_router.register('questions', views.QuestionViewSet, basename='interview-questions')
web_router.register('question-groups', views.QuestionGroupViewSet, basename='interview-question-groups')
web_router.register('voice-profiles', views.VoiceProfileViewSet, basename='interview-voice-profiles')
web_router.register('sessions', views.InterviewSessionViewSet, basename='interview-sessions')
web_router.register('evaluations', views.InterviewEvaluationViewSet, basename='interview-evaluations')

admin_router = DefaultRouter()
admin_router.register('sessions', views.AdminInterviewSessionReadOnlyViewSet, basename='admin-interview-sessions')
admin_router.register('voice-profile-grants', views.VoiceProfileGrantViewSet, basename='admin-voice-profile-grants')

urlpatterns = [
    # Question Bank & Hints
    path('questions/bank/', views_enhancements.QuestionBankListView.as_view(), name='question-bank-list'),
    path('web/questions/bank/', views_enhancements.QuestionBankListView.as_view(), name='web-question-bank-list'),
    path('question-groups/public/', views_enhancements.PublicQuestionGroupListView.as_view(), name='public-question-group-list'),
    path('web/question-groups/public/', views_enhancements.PublicQuestionGroupListView.as_view(), name='web-public-question-group-list'),
    path('questions/<int:pk>/hints/', views_enhancements.QuestionHintsDetailView.as_view(), name='question-hints-detail'),
    path('web/questions/<int:pk>/hints/', views_enhancements.QuestionHintsDetailView.as_view(), name='web-question-hints-detail'),

    # Mock Interview Sessions
    path('sessions/create-mock/', views_enhancements.CreateMockSessionView.as_view(), name='create-mock-session'),
    path('web/sessions/create-mock/', views_enhancements.CreateMockSessionView.as_view(), name='web-create-mock-session'),

    # Salary Benchmarks
    path('salary-benchmarks/', views_enhancements.SalaryBenchmarkListView.as_view(), name='salary-benchmark-list'),
    path('web/salary-benchmarks/', views_enhancements.SalaryBenchmarkListView.as_view(), name='web-salary-benchmark-list'),

    path('web/screening-results/<int:session_id>/', views.ScreeningResultAPIView.as_view()),
    path('web/', include(web_router.urls)),
    path('admin/', include(admin_router.urls)),
    path('web/sessions/<int:session_id>/stream/', interview_event_stream, name='interview-sse-stream'),
    path(
        'web/statistics/admin-general-statistics/',
        views.InterviewStatisticViewSet.as_view({'get': 'general_statistics'}),
    ),
]
