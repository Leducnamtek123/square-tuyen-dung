from typing import Optional
from django.db import models
from apps.exchange.base import BaseExchangeDefinition, ExportField
from apps.exchange.registry import exchange_registry
from apps.profiles.models import Company
from shared.configs import variable_system as var_sys


@exchange_registry.register
class CompanyExchangeDefinition(BaseExchangeDefinition):
    entity_type = "company"
    label = "Danh sách doanh nghiệp"
    model = Company
    permission_roles = [var_sys.ADMIN]
    supports_export = True
    supports_import = False

    export_fields = {
        "id": ExportField(key="id", label="Mã ID", model_field="id"),
        "companyName": ExportField(key="companyName", label="Tên doanh nghiệp", model_field="company_name"),
        "companyEmail": ExportField(key="companyEmail", label="Email liên hệ", model_field="company_email"),
        "companyPhone": ExportField(key="companyPhone", label="Số điện thoại", model_field="company_phone"),
        "taxCode": ExportField(key="taxCode", label="Mã số thuế", model_field="tax_code"),
        "websiteUrl": ExportField(key="websiteUrl", label="Website", model_field="website_url"),
        "fieldOperation": ExportField(key="fieldOperation", label="Lĩnh vực hoạt động", model_field="field_operation"),
        "employeeSize": ExportField(
            key="employeeSize",
            label="Quy mô nhân sự",
            formatter=lambda obj, k: obj.get_employee_size_display() if hasattr(obj, "get_employee_size_display") else (str(obj.employee_size) if obj.employee_size else ""),
        ),
        "isVerified": ExportField(
            key="isVerified",
            label="Xác thực doanh nghiệp",
            formatter=lambda obj, k: "Đã xác thực" if obj.is_verified else "Chưa xác thực",
        ),
        "since": ExportField(
            key="since",
            label="Năm thành lập",
            formatter=lambda obj, k: obj.since.strftime("%d/%m/%Y") if obj.since else "",
        ),
        "ownerEmail": ExportField(
            key="ownerEmail",
            label="Email tài khoản chủ",
            formatter=lambda obj, k: obj.user.email if obj.user else "",
        ),
        "ownerName": ExportField(
            key="ownerName",
            label="Tên tài khoản chủ",
            formatter=lambda obj, k: obj.user.full_name if obj.user else "",
        ),
        "createdAt": ExportField(
            key="createdAt",
            label="Ngày tham gia",
            formatter=lambda obj, k: obj.create_at.strftime("%d/%m/%Y %H:%M") if obj.create_at else "",
        ),
    }

    import_fields = {}

    def has_permission(self, user, company) -> bool:
        if not user or not user.is_authenticated:
            return False
        return bool(getattr(user, "is_superuser", False) or getattr(user, "is_staff", False) or getattr(user, "role_name", "") == var_sys.ADMIN)

    def get_queryset(self, user, company, filters: Optional[dict] = None):
        qs = Company.objects.select_related("user").all()
        filters = filters or {}
        if filters.get("isVerified") is not None:
            is_ver = str(filters["isVerified"]).lower() in ["true", "1"]
            qs = qs.filter(is_verified=is_ver)
        if filters.get("search"):
            st = str(filters["search"]).strip()
            qs = qs.filter(
                models.Q(company_name__icontains=st)
                | models.Q(tax_code__icontains=st)
                | models.Q(company_email__icontains=st)
            )
        return qs.order_by("-create_at")
