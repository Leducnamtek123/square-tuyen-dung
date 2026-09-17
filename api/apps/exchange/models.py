import secrets
from django.conf import settings
from django.db import models
from django.utils import timezone
from shared.models import CommonBaseModel


def generate_public_id(prefix: str) -> str:
    date_str = timezone.now().strftime("%Y%m%d")
    random_str = secrets.token_hex(4).upper()
    return f"{prefix}-{date_str}-{random_str}"


class ExportJob(CommonBaseModel):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        PROCESSING = "processing", "Processing"
        COMPLETED = "completed", "Completed"
        FAILED = "failed", "Failed"
        CANCELLED = "cancelled", "Cancelled"
        EXPIRED = "expired", "Expired"

    public_id = models.CharField(max_length=64, unique=True, db_index=True)
    company = models.ForeignKey(
        "info.Company",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="exchange_export_jobs",
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="exchange_export_jobs",
    )
    entity_type = models.CharField(max_length=64, db_index=True)
    format = models.CharField(max_length=10, default="xlsx")
    status = models.CharField(
        max_length=30,
        choices=Status.choices,
        default=Status.PENDING,
        db_index=True,
    )
    selected_fields = models.JSONField(default=list, blank=True)
    filters = models.JSONField(default=dict, blank=True)

    total_rows = models.PositiveIntegerField(default=0)
    processed_rows = models.PositiveIntegerField(default=0)
    progress = models.PositiveSmallIntegerField(default=0)
    current_step = models.CharField(max_length=150, blank=True, default="")

    file = models.ForeignKey(
        "files.File",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="exchange_export_jobs",
    )
    file_url = models.URLField(max_length=500, blank=True, null=True)
    error_message = models.TextField(blank=True, default="")

    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "project_exchange_export_job"
        ordering = ["-create_at"]
        indexes = [
            models.Index(fields=["company", "-create_at"], name="idx_ex_exp_comp_created"),
            models.Index(fields=["public_id"], name="idx_ex_exp_public_id"),
        ]

    def __str__(self):
        return f"{self.public_id} [{self.entity_type}] - {self.status}"

    def save(self, *args, **kwargs):
        if not self.public_id:
            self.public_id = generate_public_id("EXP")
        super().save(*args, **kwargs)


class ImportJob(CommonBaseModel):
    class Status(models.TextChoices):
        UPLOADED = "uploaded", "Uploaded"
        PARSING = "parsing", "Parsing"
        VALIDATING = "validating", "Validating"
        AWAITING_CONFIRMATION = "awaiting_confirmation", "Awaiting Confirmation"
        COMMITTING = "committing", "Committing"
        COMPLETED = "completed", "Completed"
        FAILED = "failed", "Failed"
        CANCELLED = "cancelled", "Cancelled"

    class Mode(models.TextChoices):
        CREATE = "create", "Create Only"
        UPDATE = "update", "Update Only"
        UPSERT = "upsert", "Upsert"

    public_id = models.CharField(max_length=64, unique=True, db_index=True)
    company = models.ForeignKey(
        "info.Company",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="exchange_import_jobs",
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="exchange_import_jobs",
    )
    entity_type = models.CharField(max_length=64, db_index=True)
    mode = models.CharField(
        max_length=20,
        choices=Mode.choices,
        default=Mode.CREATE,
    )
    match_by = models.CharField(max_length=64, default="default")
    status = models.CharField(
        max_length=30,
        choices=Status.choices,
        default=Status.UPLOADED,
        db_index=True,
    )

    file = models.ForeignKey(
        "files.File",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="exchange_import_jobs",
    )
    file_name = models.CharField(max_length=255, blank=True, default="")

    total_rows = models.PositiveIntegerField(default=0)
    processed_rows = models.PositiveIntegerField(default=0)
    valid_rows = models.PositiveIntegerField(default=0)
    invalid_rows = models.PositiveIntegerField(default=0)
    warning_rows = models.PositiveIntegerField(default=0)

    created_rows = models.PositiveIntegerField(default=0)
    updated_rows = models.PositiveIntegerField(default=0)
    failed_rows = models.PositiveIntegerField(default=0)

    progress = models.PositiveSmallIntegerField(default=0)
    current_step = models.CharField(max_length=150, blank=True, default="")

    error_summary = models.JSONField(default=list, blank=True)
    error_report_file = models.ForeignKey(
        "files.File",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="exchange_import_error_reports",
    )
    error_report_url = models.URLField(max_length=500, blank=True, null=True)
    payload_cache_key = models.CharField(max_length=255, blank=True, default="")

    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "project_exchange_import_job"
        ordering = ["-create_at"]
        indexes = [
            models.Index(fields=["company", "-create_at"], name="idx_ex_imp_comp_created"),
            models.Index(fields=["public_id"], name="idx_ex_imp_public_id"),
        ]

    def __str__(self):
        return f"{self.public_id} [{self.entity_type} / {self.mode}] - {self.status}"

    def save(self, *args, **kwargs):
        if not self.public_id:
            self.public_id = generate_public_id("IMP")
        super().save(*args, **kwargs)
