from typing import List, Optional, Tuple
from django.db import models
from apps.exchange.base import BaseExchangeDefinition, ErrorCodes, ExportField, ImportField, ValidationIssue
from apps.exchange.registry import exchange_registry
from apps.hrm.models import Department, Employee
from shared.configs import variable_system as var_sys


@exchange_registry.register
class DepartmentExchangeDefinition(BaseExchangeDefinition):
    entity_type = "department"
    label = "Phòng ban (HRM)"
    model = Department
    permission_roles = [var_sys.ADMIN, var_sys.EMPLOYER]
    matching_keys = ["code"]
    default_matching_key = "code"
    supported_modes = ["create", "update", "upsert"]
    atomic_import = True

    export_fields = {
        "code": ExportField(key="code", label="Mã phòng ban", model_field="code"),
        "name": ExportField(key="name", label="Tên phòng ban", model_field="name"),
        "parentCode": ExportField(
            key="parentCode",
            label="Mã phòng ban cha",
            formatter=lambda obj, k: obj.parent.code if obj.parent else "",
        ),
        "managerName": ExportField(
            key="managerName",
            label="Trưởng phòng",
            formatter=lambda obj, k: obj.manager.full_name if obj.manager else "",
        ),
        "description": ExportField(key="description", label="Mô tả", model_field="description"),
        "isActive": ExportField(
            key="isActive",
            label="Đang hoạt động",
            formatter=lambda obj, k: "Có" if obj.is_active else "Không",
        ),
    }

    import_fields = {
        "code": ImportField(
            key="code",
            label="Mã phòng ban",
            aliases=["Mã PB", "department_code"],
            model_field="code",
            field_type="string",
            required=True,
            example="TECH",
            description="Mã viết tắt phòng ban",
        ),
        "name": ImportField(
            key="name",
            label="Tên phòng ban",
            aliases=["Tên PB", "department_name"],
            model_field="name",
            field_type="string",
            required=True,
            example="Phòng Kỹ thuật Công nghệ",
            description="Tên đầy đủ của phòng ban",
        ),
        "parentCode": ImportField(
            key="parentCode",
            label="Mã phòng ban cha",
            aliases=["Phòng ban cấp trên", "parent_code"],
            field_type="string",
            required=False,
            example="BOD",
            description="Mã phòng ban cấp trên trực tiếp",
        ),
        "managerCode": ImportField(
            key="managerCode",
            label="Mã trưởng phòng",
            aliases=["Mã quản lý", "manager_code"],
            field_type="string",
            required=False,
            example="EMP001",
            description="Mã nhân viên của trưởng bộ phận",
        ),
        "description": ImportField(
            key="description",
            label="Mô tả",
            aliases=["Ghi chú", "description"],
            model_field="description",
            field_type="string",
            required=False,
            example="Chịu trách nhiệm nghiên cứu và phát triển sản phẩm",
        ),
        "isActive": ImportField(
            key="isActive",
            label="Trạng thái hoạt động",
            aliases=["Kích hoạt", "is_active"],
            model_field="is_active",
            field_type="boolean",
            required=False,
            example="Có",
        ),
    }

    def get_queryset(self, user, company, filters: Optional[dict] = None):
        return Department.objects.filter(company=company).select_related("parent", "manager").order_by("name")

    def resolve_relationships(self, row_dict: dict, company) -> Tuple[dict, List[ValidationIssue]]:
        issues: List[ValidationIssue] = []

        parent_code = row_dict.get("parentCode")
        if parent_code:
            parent_dept = Department.objects.filter(company=company, code__iexact=str(parent_code).strip()).first()
            if parent_dept:
                row_dict["_resolved_parent"] = parent_dept
            else:
                issues.append(
                    ValidationIssue(
                        field="Mã phòng ban cha",
                        code=ErrorCodes.IMPORT_RELATION_NOT_FOUND,
                        message=f"Phòng ban cha mã '{parent_code}' không tồn tại trong doanh nghiệp.",
                        value=parent_code,
                    )
                )

        manager_code = row_dict.get("managerCode")
        if manager_code:
            mgr = Employee.objects.filter(company=company, employee_code__iexact=str(manager_code).strip()).first()
            if mgr:
                row_dict["_resolved_manager"] = mgr
            else:
                issues.append(
                    ValidationIssue(
                        field="Mã trưởng phòng",
                        code=ErrorCodes.IMPORT_RELATION_NOT_FOUND,
                        message=f"Nhân viên mã '{manager_code}' không tồn tại trong doanh nghiệp.",
                        value=manager_code,
                    )
                )

        return row_dict, issues

    def create_record(self, validated_data: dict, company, user) -> Department:
        data = {
            "company": company,
            "code": validated_data.get("code"),
            "name": validated_data.get("name"),
            "parent": validated_data.get("_resolved_parent"),
            "manager": validated_data.get("_resolved_manager"),
            "description": validated_data.get("description") or "",
            "is_active": validated_data.get("isActive", True) if validated_data.get("isActive") is not None else True,
        }
        return Department.objects.create(**data)

    def update_record(self, instance: Department, validated_data: dict, company, user) -> Department:
        if "name" in validated_data and validated_data["name"]:
            instance.name = validated_data["name"]
        if "_resolved_parent" in validated_data:
            instance.parent = validated_data["_resolved_parent"]
        if "_resolved_manager" in validated_data:
            instance.manager = validated_data["_resolved_manager"]
        if "description" in validated_data:
            instance.description = validated_data["description"]
        if "isActive" in validated_data and validated_data["isActive"] is not None:
            instance.is_active = validated_data["isActive"]
        instance.save()
        return instance
