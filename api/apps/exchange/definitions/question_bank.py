from typing import Any, List, Optional, Tuple
from django.db import models
from apps.exchange.base import (
    BaseExchangeDefinition,
    ErrorCodes,
    ExportField,
    ImportField,
    ValidationIssue,
)
from apps.exchange.registry import exchange_registry
from apps.interviews.models import Question


@exchange_registry.register
class QuestionBankExchangeDefinition(BaseExchangeDefinition):
    entity_type = "question_bank"
    label = "Ngân hàng câu hỏi phỏng vấn"
    model = Question
    permission_roles = ["EMPLOYER", "ADMIN"]
    matching_keys = ["text", "title"]
    default_matching_key = "text"
    supported_modes = ["create", "update", "upsert"]
    atomic_import = True
    supports_export = True
    supports_import = True

    DIFFICULTY_CHOICES = [
        ("1", "Dễ"),
        ("2", "Trung bình"),
        ("3", "Khó"),
    ]

    export_fields = {
        "title": ExportField(key="title", label="Tiêu đề / Chủ đề", model_field="title"),
        "text": ExportField(key="text", label="Nội dung câu hỏi", model_field="text"),
        "category": ExportField(
            key="category",
            label="Danh mục",
            formatter=lambda obj, k: obj.get_category_display() if hasattr(obj, "get_category_display") else obj.category,
        ),
        "difficulty": ExportField(
            key="difficulty",
            label="Mức độ",
            formatter=lambda obj, k: obj.get_difficulty_display() if hasattr(obj, "get_difficulty_display") else str(obj.difficulty),
        ),
        "defaultDurationSeconds": ExportField(
            key="defaultDurationSeconds",
            label="Thời gian trả lời (giây)",
            model_field="default_duration_seconds",
        ),
        "createdAt": ExportField(
            key="createdAt",
            label="Ngày tạo",
            formatter=lambda obj, k: obj.create_at.strftime("%d/%m/%Y") if getattr(obj, "create_at", None) else "",
        ),
    }

    import_fields = {
        "title": ImportField(
            key="title",
            label="Tiêu đề",
            aliases=["Chủ đề", "Tiêu đề ngắn", "title"],
            model_field="title",
            field_type="string",
            required=False,
            example="Giới thiệu bản thân",
            description="Tiêu đề ngắn của câu hỏi",
        ),
        "text": ImportField(
            key="text",
            label="Nội dung câu hỏi",
            aliases=["Câu hỏi", "Nội dung", "text", "Question"],
            model_field="text",
            field_type="string",
            required=True,
            example="Bạn hãy giới thiệu về bản thân và dự án nổi bật nhất đã từng tham gia?",
            description="Nội dung chi tiết của câu hỏi",
        ),
        "category": ImportField(
            key="category",
            label="Danh mục",
            aliases=["Phân loại", "category", "Nhóm"],
            model_field="category",
            field_type="enum",
            required=False,
            choices=Question.CATEGORY_CHOICES,
            example="Kỹ năng chuyên môn",
            description="Phân loại câu hỏi",
        ),
        "difficulty": ImportField(
            key="difficulty",
            label="Mức độ",
            aliases=["Độ khó", "difficulty", "Mức độ khó"],
            model_field="difficulty",
            field_type="enum",
            required=False,
            choices=DIFFICULTY_CHOICES,
            example="Trung bình",
            description="Độ khó câu hỏi: Dễ, Trung bình, Khó",
        ),
        "defaultDurationSeconds": ImportField(
            key="defaultDurationSeconds",
            label="Thời gian trả lời (giây)",
            aliases=["Thời lượng (giây)", "Thời gian", "duration"],
            model_field="default_duration_seconds",
            field_type="number",
            required=False,
            example="120",
            description="Thời gian tối đa ứng viên trả lời tính bằng giây",
        ),
    }

    def has_permission(self, user, company) -> bool:
        return bool(user.is_authenticated and (company or user.is_staff))

    def get_queryset(self, user, company, filters: Optional[dict] = None):
        if user.is_staff and not company:
            qs = Question.objects.all()
        else:
            qs = Question.objects.filter(models.Q(company=company) | models.Q(company__isnull=True))

        filters = filters or {}
        if filters.get("category"):
            qs = qs.filter(category=filters["category"])
        if filters.get("difficulty"):
            qs = qs.filter(difficulty=filters["difficulty"])
        if filters.get("search"):
            search_term = str(filters["search"]).strip()
            qs = qs.filter(
                models.Q(title__icontains=search_term) | models.Q(text__icontains=search_term)
            )
        return qs.order_by("-create_at")

    def create_record(self, validated_data: dict, company, user) -> Question:
        diff = validated_data.get("difficulty")
        try:
            diff_int = int(diff) if diff is not None else 1
        except (ValueError, TypeError):
            diff_int = 1

        dur = validated_data.get("defaultDurationSeconds")
        try:
            dur_int = int(dur) if dur is not None else 120
        except (ValueError, TypeError):
            dur_int = 120

        return Question.objects.create(
            company=company,
            author=user,
            title=validated_data.get("title") or "",
            text=validated_data["text"],
            category=validated_data.get("category") or "general",
            difficulty=diff_int,
            default_duration_seconds=dur_int,
        )

    def update_record(self, instance: Question, validated_data: dict, company, user) -> Question:
        if "title" in validated_data:
            instance.title = validated_data["title"] or ""
        if "text" in validated_data:
            instance.text = validated_data["text"]
        if "category" in validated_data and validated_data["category"]:
            instance.category = validated_data["category"]
        if "difficulty" in validated_data and validated_data["difficulty"]:
            try:
                instance.difficulty = int(validated_data["difficulty"])
            except (ValueError, TypeError):
                pass
        if "defaultDurationSeconds" in validated_data and validated_data["defaultDurationSeconds"] is not None:
            try:
                instance.default_duration_seconds = int(validated_data["defaultDurationSeconds"])
            except (ValueError, TypeError):
                pass
        instance.save()
        return instance
