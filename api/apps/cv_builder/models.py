from django.db import models
from django.utils.text import slugify
from autoslug import AutoSlugField

from shared.models import CommonBaseModel
from apps.accounts.models import User
from apps.files.models import File


class CVTemplate(CommonBaseModel):
    """
    Template catalog stored in Database so Admins can configure, activate,
    and add new CV templates dynamically without altering frontend code.
    """
    code = models.SlugField(max_length=50, unique=True, db_index=True)
    name = models.CharField(max_length=150)
    description = models.TextField(blank=True, default="")
    category = models.CharField(max_length=50, default="modern", db_index=True)
    category_name = models.CharField(max_length=100, default="Hiện đại")
    thumbnail_url = models.URLField(max_length=500, blank=True, null=True)
    color_palettes = models.JSONField(default=list, blank=True)
    default_theme = models.JSONField(default=dict, blank=True)
    sample_data = models.JSONField(default=dict, blank=True)
    is_active = models.BooleanField(default=True, db_index=True)
    is_premium = models.BooleanField(default=False)
    is_popular = models.BooleanField(default=False)
    sort_order = models.IntegerField(default=0)
    use_count = models.PositiveIntegerField(default=0)
    view_count = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = "project_info_cv_template"
        ordering = ["sort_order", "-use_count", "-create_at"]
        verbose_name = "CV Template"
        verbose_name_plural = "CV Templates"

    def __str__(self):
        return f"{self.name} ({self.code})"


class CandidateCV(CommonBaseModel):
    """
    Candidate's saved CV instance with real-time auto-saved JSON content,
    customized themes, and shareable public links.
    """
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="candidate_cvs",
        db_index=True
    )
    template = models.ForeignKey(
        CVTemplate,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="candidate_cvs"
    )
    template_code = models.CharField(max_length=50, default="modern-navy")
    title = models.CharField(max_length=200, default="CV Chưa Đặt Tên")
    slug = AutoSlugField(
        populate_from="title",
        unique=True,
        unique_with=["id"],
        slugify=slugify,
        max_length=255
    )
    theme_config = models.JSONField(default=dict, blank=True)
    cv_data = models.JSONField(default=dict, blank=True)
    thumbnail_url = models.URLField(max_length=500, blank=True, null=True)
    pdf_file = models.ForeignKey(
        File,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="candidate_cv_files"
    )
    pdf_url = models.URLField(max_length=500, blank=True, null=True)
    is_main_cv = models.BooleanField(default=False, db_index=True)
    is_public = models.BooleanField(default=True, db_index=True)
    views_count = models.PositiveIntegerField(default=0)
    download_count = models.PositiveIntegerField(default=0)
    ai_score = models.PositiveIntegerField(null=True, blank=True, help_text="Điểm đánh giá ATS từ 0-100")
    ai_review_data = models.JSONField(default=dict, blank=True, help_text="Chi tiết phân tích & gợi ý cải thiện từ AI")

    class Meta:
        db_table = "project_info_candidate_cv"
        ordering = ["-is_main_cv", "-update_at"]
        verbose_name = "Candidate CV"
        verbose_name_plural = "Candidate CVs"
        indexes = [
            models.Index(fields=["user", "-update_at"], name="idx_cand_cv_user_upd"),
            models.Index(fields=["slug"], name="idx_cand_cv_slug"),
            models.Index(fields=["is_public", "slug"], name="idx_cand_cv_pub_slug"),
        ]

    def __str__(self):
        return f"{self.title} - {self.user.email}"


class CVSuggestion(CommonBaseModel):
    """
    Industry-specific sample bullet points, career objectives, and job description
    suggestions to empower candidates with professional copy in 1-click.
    """
    industry = models.CharField(max_length=100, db_index=True)
    industry_name = models.CharField(max_length=150)
    suggestion_type = models.CharField(max_length=50, default="summary", db_index=True)
    title = models.CharField(max_length=200)
    content = models.TextField()
    skills_list = models.JSONField(default=list, blank=True)
    sort_order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True, db_index=True)

    class Meta:
        db_table = "project_info_cv_suggestion"
        ordering = ["sort_order", "industry", "-create_at"]
        verbose_name = "CV Suggestion"
        verbose_name_plural = "CV Suggestions"

    def __str__(self):
        return f"[{self.industry_name}] {self.title}"
