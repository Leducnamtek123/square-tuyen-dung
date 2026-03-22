"""
Chatbot views.

The legacy DialogFlow webhook views (JobSeekerDialogFlowWebhookView,
EmployerDialogFlowWebhookView) have been removed — they were never called
by any frontend or external system and relied on an external DialogFlow
dependency that is no longer maintained.

The active AI chat functionality is handled by:
  /api/ai/chat/ → integrations.ai.views.ChatAPIView
"""
# No views currently defined in this module.
