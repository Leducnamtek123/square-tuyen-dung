from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

web_router = DefaultRouter()
web_router.register(r"employees", views.FrappeEmployeeBridgeViewSet, basename="frappe-hr-employee")
web_router.register(r"integration-status", views.FrappeStatusViewSet, basename="frappe-hr-status")

urlpatterns = [
    path("web/", include(web_router.urls)),
]
