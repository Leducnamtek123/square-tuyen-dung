from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CVTemplateViewSet,
    CandidateCVViewSet,
    PublicCVView,
    CVSuggestionViewSet,
)

router = DefaultRouter()
router.register(r"templates", CVTemplateViewSet, basename="cv-template")
router.register(r"candidate-cvs", CandidateCVViewSet, basename="candidate-cv")
router.register(r"suggestions", CVSuggestionViewSet, basename="cv-suggestion")

urlpatterns = [
    path("public/<slug:slug>/", PublicCVView.as_view(), name="public-cv-detail"),
    path("", include(router.urls)),
]
