from typing import Optional
from django.db import models
from apps.exchange.base import BaseExchangeDefinition, ExportField
from apps.exchange.registry import exchange_registry
from apps.interviews.models import InterviewSession
from shared.configs import variable_system as var_sys


@exchange_registry.register
class InterviewExchangeDefinition(BaseExchangeDefinition):
    entity_type = "interview"
    label = "Danh sách lịch phỏng vấn"
    model = InterviewSession
    permission_roles = [var_sys.ADMIN, var_sys.EMPLOYER]
    supports_export = True
    supports_import = False

    export_fields = {
        "id": ExportField(key="id", label="Mã buổi phỏng vấn", model_field="id"),
        "candidateName": ExportField(
            key="candidateName",
            label="Tên ứng viên",
            formatter=lambda obj, k: obj.candidate.full_name if obj.candidate else "",
        ),
        "candidateEmail": ExportField(
            key="candidateEmail",
            label="Email ứng viên",
            formatter=lambda obj, k: obj.candidate.email if obj.candidate else "",
        ),
        "jobPostTitle": ExportField(
            key="jobPostTitle",
            label="Vị trí tuyển dụng",
            formatter=lambda obj, k: obj.job_post.title if obj.job_post else "",
        ),
        "sessionType": ExportField(
            key="sessionType",
            label="Phân loại",
            formatter=lambda obj, k: obj.get_session_type_display() if hasattr(obj, "get_session_type_display") else obj.session_type,
        ),
        "type": ExportField(
            key="type",
            label="Hình thức",
            formatter=lambda obj, k: obj.get_type_display() if hasattr(obj, "get_type_display") else obj.type,
        ),
        "language": ExportField(
            key="language",
            label="Ngôn ngữ",
            formatter=lambda obj, k: obj.get_interview_language_display() if hasattr(obj, "get_interview_language_display") else obj.interview_language,
        ),
        "status": ExportField(
            key="status",
            label="Trạng thái",
            formatter=lambda obj, k: obj.get_status_display() if hasattr(obj, "get_status_display") else obj.status,
        ),
        "scheduledAt": ExportField(
            key="scheduledAt",
            label="Thời gian dự kiến",
            formatter=lambda obj, k: obj.scheduled_at.strftime("%d/%m/%Y %H:%M") if obj.scheduled_at else "",
        ),
        "startTime": ExportField(
            key="startTime",
            label="Thời gian bắt đầu",
            formatter=lambda obj, k: obj.start_time.strftime("%d/%m/%Y %H:%M") if obj.start_time else "",
        ),
        "endTime": ExportField(
            key="endTime",
            label="Thời gian kết thúc",
            formatter=lambda obj, k: obj.end_time.strftime("%d/%m/%Y %H:%M") if obj.end_time else "",
        ),
        "durationMinutes": ExportField(
            key="durationMinutes",
            label="Thời lượng (phút)",
            formatter=lambda obj, k: round(obj.duration / 60, 1) if obj.duration else "",
        ),
        "aiOverallScore": ExportField(
            key="aiOverallScore",
            label="Điểm tổng AI",
            formatter=lambda obj, k: str(obj.ai_overall_score) if obj.ai_overall_score is not None else "",
        ),
        "aiTechnicalScore": ExportField(
            key="aiTechnicalScore",
            label="Điểm kỹ thuật AI",
            formatter=lambda obj, k: str(obj.ai_technical_score) if obj.ai_technical_score is not None else "",
        ),
        "aiCommunicationScore": ExportField(
            key="aiCommunicationScore",
            label="Điểm giao tiếp AI",
            formatter=lambda obj, k: str(obj.ai_communication_score) if obj.ai_communication_score is not None else "",
        ),
        "aiSummary": ExportField(key="aiSummary", label="Nhận xét AI", model_field="ai_summary"),
        "roomName": ExportField(key="roomName", label="Phòng phỏng vấn AI", model_field="room_name"),
        "notes": ExportField(key="notes", label="Ghi chú", model_field="notes"),
    }

    import_fields = {}

    def has_permission(self, user, company) -> bool:
        if not user or not user.is_authenticated:
            return False
        if bool(getattr(user, "is_superuser", False) or getattr(user, "is_staff", False) or getattr(user, "role_name", "") == var_sys.ADMIN):
            return True
        return bool(company and (user.role_name == var_sys.EMPLOYER or getattr(user, "has_company", False)))

    def get_queryset(self, user, company, filters: Optional[dict] = None):
        qs = InterviewSession.objects.select_related("candidate", "job_post", "job_post__company", "created_by").all()
        if not (getattr(user, "is_superuser", False) or getattr(user, "is_staff", False) or getattr(user, "role_name", "") == var_sys.ADMIN):
            if company:
                qs = qs.filter(models.Q(created_by=user) | models.Q(job_post__company=company)).distinct()
            else:
                qs = qs.filter(created_by=user)

        filters = filters or {}
        if filters.get("status"):
            qs = qs.filter(status=filters["status"])
        if filters.get("job_post_id") or filters.get("jobPost"):
            job_id = filters.get("job_post_id") or filters.get("jobPost")
            qs = qs.filter(job_post_id=job_id)
        if filters.get("search"):
            st = str(filters["search"]).strip()
            qs = qs.filter(
                models.Q(candidate__full_name__icontains=st)
                | models.Q(candidate__email__icontains=st)
                | models.Q(job_post__title__icontains=st)
            )
        return qs.order_by("-create_at")
