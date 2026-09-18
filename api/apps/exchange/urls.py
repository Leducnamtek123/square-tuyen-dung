from django.urls import path
from rest_framework.routers import DefaultRouter
from apps.exchange import views

router = DefaultRouter()
router.register(r"exports", views.ExportViewSet, basename="exchange-exports")
router.register(r"imports", views.ImportViewSet, basename="exchange-imports")

urlpatterns = [
    path("definitions/", views.list_exchange_definitions, name="exchange-definitions"),
    path("templates/<str:entity_type>/", views.download_template, name="exchange-template-download"),
] + router.urls
