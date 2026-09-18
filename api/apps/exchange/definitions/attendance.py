import datetime
from typing import List, Optional, Tuple
from django.db import models
from apps.exchange.base import BaseExchangeDefinition, ErrorCodes, ExportField, ImportField, ValidationIssue
from apps.exchange.registry import exchange_registry
from apps.hrm.models import BiometricPunchLog, Employee, WorkLocation
from shared.configs import variable_system as var_sys


@exchange_registry.register
class AttendancePunchExchangeDefinition(BaseExchangeDefinition):
    entity_type = "attendance_punch"
    label = "Dữ liệu quẹt thẻ chấm công (HRM)"
    model = BiometricPunchLog
    permission_roles = [var_sys.ADMIN, var_sys.EMPLOYER]
    matching_keys = ["employeeCode"]
    default_matching_key = "employeeCode"
    supported_modes = ["create"]
    atomic_import = False  # Allows partial import for large timesheet punch datasets

    export_fields = {
        "employeeCode": ExportField(
            key="employeeCode",
            label="Mã nhân viên",
            formatter=lambda obj, k: obj.employee.employee_code if obj.employee else obj.biometric_id,
        ),
        "employeeName": ExportField(
            key="employeeName",
            label="Họ và tên",
            formatter=lambda obj, k: obj.employee.full_name if obj.employee else "",
        ),
        "punchTime": ExportField(
            key="punchTime",
            label="Thời gian quẹt",
            formatter=lambda obj, k: obj.punch_time.strftime("%d/%m/%Y %H:%M:%S") if obj.punch_time else "",
        ),
        "punchType": ExportField(
            key="punchType",
            label="Loại quẹt",
            formatter=lambda obj, k: obj.get_punch_type_display() if hasattr(obj, "get_punch_type_display") else obj.punch_type,
        ),
        "deviceName": ExportField(key="deviceName", label="Tên máy chấm công", model_field="device_name"),
        "source": ExportField(key="source", label="Nguồn", model_field="source"),
    }

    import_fields = {
        "employeeCode": ImportField(
            key="employeeCode",
            label="Mã nhân viên",
            aliases=["Mã NV", "Mã chấm công", "employee_code"],
            field_type="string",
            required=True,
            example="EMP001",
            description="Mã nhân viên trong hệ thống",
        ),
        "punchTime": ImportField(
            key="punchTime",
            label="Thời gian quẹt",
            aliases=["Giờ quẹt", "Thời gian", "punch_time"],
            field_type="string",
            required=True,
            example="2026-09-17 08:02:15",
            description="Thời gian chấm công (YYYY-MM-DD HH:MM:SS)",
        ),
        "punchType": ImportField(
            key="punchType",
            label="Loại quẹt",
            aliases=["Vào/Ra", "punch_type"],
            field_type="enum",
            choices=[
                ("CHECK_IN", "Vào"),
                ("CHECK_OUT", "Ra"),
                ("AUTO", "Tự động"),
            ],
            required=False,
            example="Vào",
        ),
        "biometricId": ImportField(
            key="biometricId",
            label="Mã máy",
            aliases=["Mã thẻ", "biometric_id"],
            field_type="string",
            required=False,
            example="101",
        ),
        "deviceName": ImportField(
            key="deviceName",
            label="Tên máy",
            aliases=["Thiết bị", "device_name"],
            field_type="string",
            required=False,
            example="Máy cửa chính Tầng 1",
        ),
    }

    def get_queryset(self, user, company, filters: Optional[dict] = None):
        qs = BiometricPunchLog.objects.filter(company=company).select_related("employee")
        filters = filters or {}
        if filters.get("employeeCode"):
            qs = qs.filter(employee__employee_code=filters["employeeCode"])
        if filters.get("dateFrom"):
            qs = qs.filter(punch_time__gte=filters["dateFrom"])
        if filters.get("dateTo"):
            qs = qs.filter(punch_time__lte=filters["dateTo"])
        return qs.order_by("-punch_time")

    def resolve_relationships(self, row_dict: dict, company) -> Tuple[dict, List[ValidationIssue]]:
        issues: List[ValidationIssue] = []

        emp_code = row_dict.get("employeeCode")
        if emp_code:
            emp = Employee.objects.filter(company=company, employee_code__iexact=str(emp_code).strip()).first()
            if emp:
                row_dict["_resolved_employee"] = emp
            else:
                issues.append(
                    ValidationIssue(
                        field="Mã nhân viên",
                        code=ErrorCodes.IMPORT_RELATION_NOT_FOUND,
                        message=f"Nhân viên mã '{emp_code}' không tồn tại trong doanh nghiệp.",
                        value=emp_code,
                    )
                )

        # Parse datetime
        raw_punch = str(row_dict.get("punchTime") or "").strip()
        parsed_dt = None
        for fmt in ["%Y-%m-%d %H:%M:%S", "%d/%m/%Y %H:%M:%S", "%Y-%m-%d %H:%M", "%d/%m/%Y %H:%M"]:
            try:
                parsed_dt = datetime.datetime.strptime(raw_punch, fmt)
                break
            except ValueError:
                continue

        if parsed_dt:
            row_dict["_resolved_punch_time"] = parsed_dt
        else:
            issues.append(
                ValidationIssue(
                    field="Thời gian quẹt",
                    code=ErrorCodes.IMPORT_INVALID_DATE,
                    message=f"Thời gian quẹt '{raw_punch}' không đúng định dạng YYYY-MM-DD HH:MM:SS.",
                    value=raw_punch,
                )
            )

        return row_dict, issues

    def create_record(self, validated_data: dict, company, user) -> BiometricPunchLog:
        emp = validated_data.get("_resolved_employee")
        punch_time = validated_data.get("_resolved_punch_time")
        biometric_id = validated_data.get("biometricId") or (emp.employee_code if emp else "")
        punch_type = validated_data.get("punchType") or "AUTO"
        device_name = validated_data.get("deviceName") or "Excel Import"

        return BiometricPunchLog.objects.create(
            company=company,
            employee=emp,
            biometric_id=biometric_id,
            punch_time=punch_time,
            punch_type=punch_type,
            device_name=device_name,
            source="EXCEL_IMPORT",
        )

    def update_record(self, instance: BiometricPunchLog, validated_data: dict, company, user) -> BiometricPunchLog:
        return instance
