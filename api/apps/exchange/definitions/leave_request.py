from typing import Optional
from django.db import models
from apps.exchange.base import BaseExchangeDefinition, ExportField
from apps.exchange.registry import exchange_registry
from apps.hrm.models import AttendanceRequest
from shared.configs import variable_system as var_sys


@exchange_registry.register
class LeaveRequestExchangeDefinition(BaseExchangeDefinition):
    entity_type = "leave_request"
    label = "Danh sách đơn xin nghỉ & điểm danh (HRM)"
    model = AttendanceRequest
    permission_roles = [var_sys.ADMIN, var_sys.EMPLOYER]
    supports_export = True
    supports_import = False

    export_fields = {
        "id": ExportField(key="id", label="Mã đơn", model_field="id"),
        "employeeCode": ExportField(
            key="employeeCode",
            label="Mã nhân viên",
            formatter=lambda obj, k: obj.employee.employee_code if obj.employee else "",
        ),
        "employeeName": ExportField(
            key="employeeName",
            label="Họ và tên",
            formatter=lambda obj, k: obj.employee.full_name if obj.employee else "",
        ),
        "department": ExportField(
            key="department",
            label="Phòng ban",
            formatter=lambda obj, k: obj.employee.department.name if obj.employee and obj.employee.department else "",
        ),
        "requestType": ExportField(
            key="requestType",
            label="Loại đơn",
            formatter=lambda obj, k: obj.get_request_type_display() if hasattr(obj, "get_request_type_display") else obj.request_type,
        ),
        "leaveType": ExportField(
            key="leaveType",
            label="Loại phép",
            formatter=lambda obj, k: obj.leave_type.name if obj.leave_type else "",
        ),
        "startDate": ExportField(
            key="startDate",
            label="Từ ngày",
            formatter=lambda obj, k: obj.start_date.strftime("%d/%m/%Y") if obj.start_date else "",
        ),
        "endDate": ExportField(
            key="endDate",
            label="Đến ngày",
            formatter=lambda obj, k: obj.end_date.strftime("%d/%m/%Y") if obj.end_date else "",
        ),
        "startTime": ExportField(
            key="startTime",
            label="Từ giờ",
            formatter=lambda obj, k: obj.start_time.strftime("%H:%M") if obj.start_time else "",
        ),
        "endTime": ExportField(
            key="endTime",
            label="Đến giờ",
            formatter=lambda obj, k: obj.end_time.strftime("%H:%M") if obj.end_time else "",
        ),
        "durationHours": ExportField(
            key="durationHours",
            label="Số giờ",
            formatter=lambda obj, k: str(obj.duration_hours) if obj.duration_hours is not None else "",
        ),
        "reason": ExportField(key="reason", label="Lý do", model_field="reason"),
        "status": ExportField(
            key="status",
            label="Trạng thái",
            formatter=lambda obj, k: obj.get_status_display() if hasattr(obj, "get_status_display") else obj.status,
        ),
        "managerReviewer": ExportField(
            key="managerReviewer",
            label="Quản lý duyệt",
            formatter=lambda obj, k: obj.manager_reviewer.full_name if obj.manager_reviewer else "",
        ),
        "managerApprovedAt": ExportField(
            key="managerApprovedAt",
            label="Thời gian QL duyệt",
            formatter=lambda obj, k: obj.manager_approved_at.strftime("%d/%m/%Y %H:%M") if obj.manager_approved_at else "",
        ),
        "hrReviewer": ExportField(
            key="hrReviewer",
            label="HR duyệt",
            formatter=lambda obj, k: obj.hr_reviewer.full_name if obj.hr_reviewer else "",
        ),
        "hrApprovedAt": ExportField(
            key="hrApprovedAt",
            label="Thời gian HR duyệt",
            formatter=lambda obj, k: obj.hr_approved_at.strftime("%d/%m/%Y %H:%M") if obj.hr_approved_at else "",
        ),
        "rejectionReason": ExportField(key="rejectionReason", label="Lý do từ chối", model_field="rejection_reason"),
        "createdAt": ExportField(
            key="createdAt",
            label="Ngày tạo",
            formatter=lambda obj, k: obj.create_at.strftime("%d/%m/%Y %H:%M") if obj.create_at else "",
        ),
    }

    import_fields = {}

    def get_queryset(self, user, company, filters: Optional[dict] = None):
        qs = AttendanceRequest.objects.filter(company=company).select_related(
            "employee", "employee__department", "leave_type", "manager_reviewer", "hr_reviewer"
        )
        filters = filters or {}
        if filters.get("status"):
            qs = qs.filter(status=filters["status"])
        if filters.get("requestType"):
            qs = qs.filter(request_type=filters["requestType"])
        if filters.get("employeeCode"):
            qs = qs.filter(employee__employee_code=filters["employeeCode"])
        if filters.get("departmentId"):
            qs = qs.filter(employee__department_id=filters["departmentId"])
        if filters.get("startDate"):
            qs = qs.filter(start_date__gte=filters["startDate"])
        if filters.get("endDate"):
            qs = qs.filter(end_date__lte=filters["endDate"])
        return qs.order_by("-create_at")
