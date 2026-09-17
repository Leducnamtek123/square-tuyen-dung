import uuid
from django.conf import settings
from django.db import models


class OperationStatus(models.TextChoices):
    QUEUED = 'queued', 'Đang trong hàng đợi'
    RUNNING = 'running', 'Đang xử lý'
    COMPLETED = 'completed', 'Hoàn tất'
    FAILED = 'failed', 'Thất bại'
    CANCELLED = 'cancelled', 'Đã hủy'


def generate_operation_id() -> str:
    return f"op_{uuid.uuid4().hex[:24]}"


class AsyncOperation(models.Model):
    id = models.CharField(max_length=64, primary_key=True, default=generate_operation_id)
    type = models.CharField(max_length=64, db_index=True)
    title = models.CharField(max_length=255)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='async_operations',
    )
    company = models.ForeignKey(
        'info.Company',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='async_operations',
    )
    status = models.CharField(
        max_length=32,
        choices=OperationStatus.choices,
        default=OperationStatus.QUEUED,
        db_index=True,
    )
    progress = models.PositiveSmallIntegerField(default=0)
    current_step_key = models.CharField(max_length=64, blank=True)
    steps = models.JSONField(default=list)
    result = models.JSONField(null=True, blank=True)
    error = models.JSONField(null=True, blank=True)
    metadata = models.JSONField(default=dict)
    timeout_seconds = models.PositiveIntegerField(default=600)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    finished_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['company', 'status']),
            models.Index(fields=['type', 'status']),
        ]

    def __str__(self) -> str:
        return f"AsyncOperation({self.id}, {self.type}, {self.status})"

    def to_payload(self) -> dict:
        return {
            "id": self.id,
            "type": self.type,
            "title": self.title,
            "status": self.status,
            "progress": self.progress,
            "currentStepKey": self.current_step_key or None,
            "steps": self.steps or [],
            "result": self.result,
            "error": self.error,
            "metadata": self.metadata or {},
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
            "finishedAt": self.finished_at.isoformat() if self.finished_at else None,
        }
