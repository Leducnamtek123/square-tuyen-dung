from django.conf import settings
from django.db import models

from shared.models import CommonBaseModel


class AgentThread(CommonBaseModel):
    PORTAL_EMPLOYER = "employer"
    PORTAL_ADMIN = "admin"
    PORTAL_CHOICES = (
        (PORTAL_EMPLOYER, "Employer"),
        (PORTAL_ADMIN, "Admin"),
    )

    STATUS_ACTIVE = "active"
    STATUS_ARCHIVED = "archived"
    STATUS_CHOICES = (
        (STATUS_ACTIVE, "Active"),
        (STATUS_ARCHIVED, "Archived"),
    )

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="agent_assistant_threads",
    )
    company = models.ForeignKey(
        "info.Company",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="agent_assistant_threads",
    )
    portal = models.CharField(max_length=20, choices=PORTAL_CHOICES, db_index=True)
    title = models.CharField(max_length=180, blank=True, default="New agent chat")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_ACTIVE, db_index=True)
    last_message_at = models.DateTimeField(null=True, blank=True, db_index=True)
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        db_table = "project_agent_assistant_thread"
        ordering = ["-last_message_at", "-create_at"]
        indexes = [
            models.Index(fields=["owner", "portal", "-last_message_at"], name="idx_agent_thread_owner"),
            models.Index(fields=["company", "portal", "-last_message_at"], name="idx_agent_thread_company"),
        ]

    def __str__(self):
        return f"{self.portal}:{self.title}"


class AgentMessage(CommonBaseModel):
    ROLE_USER = "user"
    ROLE_ASSISTANT = "assistant"
    ROLE_SYSTEM = "system"
    ROLE_CHOICES = (
        (ROLE_USER, "User"),
        (ROLE_ASSISTANT, "Assistant"),
        (ROLE_SYSTEM, "System"),
    )

    thread = models.ForeignKey(
        AgentThread,
        on_delete=models.CASCADE,
        related_name="messages",
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, db_index=True)
    content = models.TextField(blank=True, default="")
    parts = models.JSONField(default=list, blank=True)
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        db_table = "project_agent_assistant_message"
        ordering = ["create_at", "id"]
        indexes = [
            models.Index(fields=["thread", "create_at"], name="idx_agent_msg_thread"),
        ]

    def __str__(self):
        return f"{self.role}: {self.content[:80]}"


class AgentToolCall(CommonBaseModel):
    STATUS_PENDING = "pending"
    STATUS_RUNNING = "running"
    STATUS_SUCCEEDED = "succeeded"
    STATUS_FAILED = "failed"
    STATUS_CHOICES = (
        (STATUS_PENDING, "Pending"),
        (STATUS_RUNNING, "Running"),
        (STATUS_SUCCEEDED, "Succeeded"),
        (STATUS_FAILED, "Failed"),
    )

    thread = models.ForeignKey(
        AgentThread,
        on_delete=models.CASCADE,
        related_name="tool_calls",
    )
    message = models.ForeignKey(
        AgentMessage,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="tool_calls",
    )
    tool_name = models.CharField(max_length=120, db_index=True)
    display_name = models.CharField(max_length=180, blank=True, default="")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING, db_index=True)
    input_payload = models.JSONField(default=dict, blank=True)
    output_payload = models.JSONField(default=dict, blank=True)
    error_message = models.TextField(blank=True, default="")
    requires_confirmation = models.BooleanField(default=False)
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        db_table = "project_agent_assistant_tool_call"
        ordering = ["create_at", "id"]
        indexes = [
            models.Index(fields=["thread", "status"], name="idx_agent_tool_thread"),
            models.Index(fields=["tool_name", "status"], name="idx_agent_tool_name"),
        ]

    def __str__(self):
        return f"{self.tool_name}:{self.status}"

