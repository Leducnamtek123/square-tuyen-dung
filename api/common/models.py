from django.conf import settings
from django.db import models

from apps.files.models import File
from shared.models import CommonBaseModel


class Career(CommonBaseModel):
    name = models.CharField(max_length=150)
    app_icon_name = models.CharField(max_length=50, null=True)
    is_hot = models.BooleanField(default=False)
    icon = models.OneToOneField(File, on_delete=models.SET_NULL, null=True)

    class Meta:
        db_table = "project_common_career"

    def __str__(self):
        return self.name


class AuditLog(CommonBaseModel):
    ACTION_CREATE = "create"
    ACTION_UPDATE = "update"
    ACTION_DELETE = "delete"
    ACTION_APPROVE = "approve"
    ACTION_REJECT = "reject"
    ACTION_STATUS_CHANGE = "status_change"
    ACTION_BULK_STATUS = "bulk_status"
    ACTION_AGENT_ACCESS = "agent_access"
    ACTION_EXPORT = "export"

    ACTION_CHOICES = [
        (ACTION_CREATE, "Create"),
        (ACTION_UPDATE, "Update"),
        (ACTION_DELETE, "Delete"),
        (ACTION_APPROVE, "Approve"),
        (ACTION_REJECT, "Reject"),
        (ACTION_STATUS_CHANGE, "Status change"),
        (ACTION_BULK_STATUS, "Bulk status"),
        (ACTION_AGENT_ACCESS, "Agent access"),
        (ACTION_EXPORT, "Export"),
    ]

    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="audit_logs",
    )
    actor_email = models.EmailField(blank=True, default="")
    action = models.CharField(max_length=40, choices=ACTION_CHOICES, db_index=True)
    resource_type = models.CharField(max_length=120, db_index=True)
    resource_id = models.CharField(max_length=80, blank=True, default="", db_index=True)
    resource_repr = models.CharField(max_length=255, blank=True, default="")
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True, default="")
    request_method = models.CharField(max_length=12, blank=True, default="")
    request_path = models.CharField(max_length=500, blank=True, default="")
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        db_table = "project_common_audit_log"
        ordering = ["-create_at"]
        indexes = [
            models.Index(fields=["resource_type", "resource_id"], name="project_com_resourc_bdcf28_idx"),
            models.Index(fields=["actor", "create_at"], name="project_com_actor_i_3c30e8_idx"),
            models.Index(fields=["action", "create_at"], name="project_com_action_ddc99e_idx"),
        ]

    def __str__(self):
        return f"{self.actor_email or 'system'} {self.action} {self.resource_type}:{self.resource_id}"


