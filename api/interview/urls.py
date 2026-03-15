"""
Interview Module — URL Configuration
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

web_router = DefaultRouter()
web_router.register('questions', views.QuestionViewSet, basename='interview-questions')
web_router.register('question-groups', views.QuestionGroupViewSet, basename='interview-question-groups')
web_router.register('sessions', views.InterviewSessionViewSet, basename='interview-sessions')
web_router.register('evaluations', views.InterviewEvaluationViewSet, basename='interview-evaluations')

urlpatterns = [
    path('web/', include(web_router.urls)),
    path(
        'web/statistics/admin-general-statistics/',
        views.InterviewStatisticViewSet.as_view({'get': 'general_statistics'}),
    ),
]
