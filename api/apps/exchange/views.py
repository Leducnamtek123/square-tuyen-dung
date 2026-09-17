import logging
from django.conf import settings
from django.http import FileResponse, HttpResponse, HttpResponseRedirect
from django.shortcuts import get_object_or_404
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response

from apps.exchange.base import ErrorCodes
from apps.exchange.models import ExportJob, ImportJob
from apps.exchange.registry import exchange_registry
from apps.exchange.serializers import (
    ExportJobResponseSerializer,
    ExportRequestSerializer,
    ImportJobResponseSerializer,
    ImportValidateRequestSerializer,
)
from apps.exchange.services.export_service import ExportService
from apps.exchange.services.import_service import ImportService
from apps.exchange.services.template_service import TemplateService
from apps.exchange.tasks import process_export_job_task, process_import_commit_task
from shared.configs import variable_response as var_res

logger = logging.getLogger(__name__)


def _get_active_company(request):
    user = request.user
    if not user or not user.is_authenticated:
        return None
    if hasattr(user, "get_active_company"):
        return user.get_active_company()
    return getattr(user, "active_company", None)


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def list_exchange_definitions(request):
    """List all importable/exportable entity schemas available to current user."""
    company = _get_active_company(request)
    definitions = exchange_registry.list_accessible_definitions(request.user, company)
    return var_res.response_data(data=definitions)


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def download_template(request, entity_type: str):
    """Download official Excel (.xlsx) template directly from backend schema."""
    definition = exchange_registry.get(entity_type)
    if not definition or not definition.supports_import:
        return var_res.response_data(
            status=status.HTTP_404_NOT_FOUND,
            errors={"detail": f"Không tìm thấy mẫu nhập liệu cho đối tượng '{entity_type}'."},
        )

    company = _get_active_company(request)
    if not definition.has_permission(request.user, company):
        return var_res.response_data(
            status=status.HTTP_403_FORBIDDEN,
            errors={"detail": "Bạn không có quyền truy cập mẫu nhập liệu này."},
        )

    template_bytes = TemplateService.generate_template(definition)
    filename = f"{entity_type}_import_template.xlsx"

    response = HttpResponse(
        template_bytes,
        content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )
    response["Content-Disposition"] = f'attachment; filename="{filename}"'
    return response


class ExportViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request):
        serializer = ExportRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return var_res.response_data(
                status=status.HTTP_400_BAD_REQUEST, errors=serializer.errors
            )

        data = serializer.validated_data
        entity_type = data["entity"]
        definition = exchange_registry.get(entity_type)
        if not definition or not definition.supports_export:
            return var_res.response_data(
                status=status.HTTP_404_NOT_FOUND,
                errors={"detail": f"Đối tượng '{entity_type}' không hỗ trợ xuất dữ liệu."},
            )

        company = _get_active_company(request)
        if not definition.has_permission(request.user, company):
            return var_res.response_data(
                status=status.HTTP_403_FORBIDDEN,
                errors={"detail": "Bạn không có quyền xuất dữ liệu này."},
            )

        # Validate selected fields
        selected_fields = data.get("fields") or []
        for f in selected_fields:
            if f not in definition.export_fields:
                return var_res.response_data(
                    status=status.HTTP_400_BAD_REQUEST,
                    errors={"detail": f"Trường '{f}' không nằm trong danh sách xuất dữ liệu."},
                )

        job = ExportJob.objects.create(
            company=company,
            created_by=request.user,
            entity_type=entity_type,
            format=data.get("format", "xlsx"),
            selected_fields=selected_fields,
            filters=data.get("filters", {}),
            status=ExportJob.Status.PENDING,
            current_step="Pending queue...",
        )

        use_async = data.get("async_job", True)
        # Always run background via Celery in production or if requested
        if use_async and not getattr(settings, "CELERY_TASK_ALWAYS_EAGER", False):
            process_export_job_task.delay(job.id)
            return var_res.response_data(
                status=status.HTTP_202_ACCEPTED,
                data=ExportJobResponseSerializer(job).data,
            )
        else:
            ExportService.run_export_job(job)
            return var_res.response_data(
                status=status.HTTP_200_OK,
                data=ExportJobResponseSerializer(job).data,
            )

    def retrieve(self, request, pk=None):
        job = get_object_or_404(ExportJob, public_id=pk)
        company = _get_active_company(request)
        if not (job.company == company or job.created_by == request.user or request.user.is_staff):
            return var_res.response_data(
                status=status.HTTP_403_FORBIDDEN,
                errors={"detail": "Không có quyền truy cập job xuất dữ liệu này."},
            )

        return var_res.response_data(data=ExportJobResponseSerializer(job).data)

    @action(detail=True, methods=["get"], url_path="download")
    def download(self, request, pk=None):
        job = get_object_or_404(ExportJob, public_id=pk)
        company = _get_active_company(request)
        if not (job.company == company or job.created_by == request.user or request.user.is_staff):
            return var_res.response_data(
                status=status.HTTP_403_FORBIDDEN,
                errors={"detail": "Không có quyền tải xuống file này."},
            )

        if job.status != ExportJob.Status.COMPLETED:
            return var_res.response_data(
                status=status.HTTP_400_BAD_REQUEST,
                errors={"detail": f"File chưa sẵn sàng (Trạng thái: {job.status})."},
            )

        if job.file_url and (job.file_url.startswith("http://") or job.file_url.startswith("https://")):
            return HttpResponseRedirect(job.file_url)

        from django.core.cache import cache
        cached = cache.get(f"exchange:export_file:{job.public_id}")
        if cached:
            content, c_type, fname = cached
            resp = HttpResponse(content, content_type=c_type)
            resp["Content-Disposition"] = f'attachment; filename="{fname}"'
            return resp

        if job.file:
            return HttpResponseRedirect(job.file.get_full_url())
        else:
            return var_res.response_data(
                status=status.HTTP_404_NOT_FOUND,
                errors={"detail": "Không tìm thấy đường dẫn file xuất."},
            )


class ImportViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=["post"], url_path="validate")
    def validate_upload(self, request):
        serializer = ImportValidateRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return var_res.response_data(
                status=status.HTTP_400_BAD_REQUEST, errors=serializer.errors
            )

        data = serializer.validated_data
        entity_type = data["entity"]
        definition = exchange_registry.get(entity_type)
        if not definition or not definition.supports_import:
            return var_res.response_data(
                status=status.HTTP_404_NOT_FOUND,
                errors={"detail": f"Đối tượng '{entity_type}' không hỗ trợ nhập dữ liệu."},
            )

        company = _get_active_company(request)
        if not definition.has_permission(request.user, company):
            return var_res.response_data(
                status=status.HTTP_403_FORBIDDEN,
                errors={"detail": "Bạn không có quyền nhập dữ liệu cho đối tượng này."},
            )

        file_obj = data["file"]
        mode = data.get("mode", "create")
        match_by = data.get("match_by") or definition.default_matching_key

        job = ImportJob.objects.create(
            company=company,
            created_by=request.user,
            entity_type=entity_type,
            mode=mode,
            match_by=match_by,
            file_name=file_obj.name,
            status=ImportJob.Status.UPLOADED,
        )

        preview_data = ImportService.validate_and_preview(job, file_obj, file_obj.name)
        return var_res.response_data(data=preview_data)

    def retrieve(self, request, pk=None):
        job = get_object_or_404(ImportJob, public_id=pk)
        company = _get_active_company(request)
        if not (job.company == company or job.created_by == request.user or request.user.is_staff):
            return var_res.response_data(
                status=status.HTTP_403_FORBIDDEN,
                errors={"detail": "Không có quyền truy cập job nhập dữ liệu này."},
            )

        return var_res.response_data(data=ImportJobResponseSerializer(job).data)

    @action(detail=True, methods=["post"], url_path="confirm")
    def confirm(self, request, pk=None):
        job = get_object_or_404(ImportJob, public_id=pk)
        company = _get_active_company(request)
        if not (job.company == company or job.created_by == request.user or request.user.is_staff):
            return var_res.response_data(
                status=status.HTTP_403_FORBIDDEN,
                errors={"detail": "Không có quyền xác nhận job nhập này."},
            )

        if job.status != ImportJob.Status.AWAITING_CONFIRMATION:
            return var_res.response_data(
                status=status.HTTP_400_BAD_REQUEST,
                errors={"detail": f"Không thể xác nhận job ở trạng thái '{job.status}'."},
            )

        # Large jobs (> 200 rows) commit asynchronously in background
        if job.total_rows > 200 and not getattr(settings, "CELERY_TASK_ALWAYS_EAGER", False):
            job.status = ImportJob.Status.COMMITTING
            job.current_step = "Queued commit task..."
            job.save()
            process_import_commit_task.delay(job.id)
            return var_res.response_data(
                status=status.HTTP_202_ACCEPTED,
                data=ImportJobResponseSerializer(job).data,
            )
        else:
            ImportService.commit_import_job(job)
            return var_res.response_data(
                status=status.HTTP_200_OK,
                data=ImportJobResponseSerializer(job).data,
            )

    @action(detail=True, methods=["get"], url_path="error-report")
    def error_report(self, request, pk=None):
        job = get_object_or_404(ImportJob, public_id=pk)
        company = _get_active_company(request)
        if not (job.company == company or job.created_by == request.user or request.user.is_staff):
            return var_res.response_data(
                status=status.HTTP_403_FORBIDDEN,
                errors={"detail": "Không có quyền tải báo cáo lỗi này."},
            )

        if job.error_report_url and (job.error_report_url.startswith("http://") or job.error_report_url.startswith("https://")):
            return HttpResponseRedirect(job.error_report_url)

        from django.core.cache import cache
        cached = cache.get(f"exchange:import_error_file:{job.public_id}")
        if cached:
            content, c_type, fname = cached
            resp = HttpResponse(content, content_type=c_type)
            resp["Content-Disposition"] = f'attachment; filename="{fname}"'
            return resp

        if job.error_report_file:
            return HttpResponseRedirect(job.error_report_file.get_full_url())
        else:
            return var_res.response_data(
                status=status.HTTP_404_NOT_FOUND,
                errors={"detail": "Job này không có báo cáo lỗi."},
            )
