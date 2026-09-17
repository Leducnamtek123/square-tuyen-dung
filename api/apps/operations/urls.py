from django.urls import path
from . import views

urlpatterns = [
    path("active/", views.ActiveOperationsView.as_view(), name="operation-active"),
    path("<str:id>/cancel/", views.CancelOperationView.as_view(), name="operation-cancel"),
    path("<str:id>/", views.OperationDetailView.as_view(), name="operation-detail"),
]
