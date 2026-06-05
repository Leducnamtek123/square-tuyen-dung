from django.urls import path

from . import views


urlpatterns = [
    path("tools/", views.AgentToolsAPIView.as_view(), name="agent-assistant-tools"),
    path("threads/", views.AgentThreadListCreateAPIView.as_view(), name="agent-assistant-threads"),
    path("threads/<int:thread_id>/", views.AgentThreadDetailAPIView.as_view(), name="agent-assistant-thread-detail"),
    path(
        "threads/<int:thread_id>/messages/",
        views.AgentThreadMessagesAPIView.as_view(),
        name="agent-assistant-thread-messages",
    ),
]
