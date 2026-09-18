from typing import Optional
from apps.common.models import AuditLog
from apps.exchange.base import BaseExchangeDefinition, ExportField
from apps.exchange.registry import exchange_registry
from shared.configs import variable_system as var_sys


@exchange_registry.register
class AuditLogExchangeDefinition(BaseExchangeDefinition):
    entity_type = "audit_log"
    label = "Nhật ký hệ thống (Audit Log)"
    model = AuditLog
    permission_roles = [var_sys.ADMIN]
    supports_export = True
    supports_import = False

    export_fields = {
        "id": ExportField(key="id", label="ID", model_field="id"),
        "createdAt": ExportField(
            key="createdAt",
            label="Thời gian",
            formatter=lambda obj, k: obj.create_at.strftime("%d/%m/%Y %H:%M:%S") if obj.create_at else "",
        ),
        "action": ExportField(key="action", label="Hành động", model_field="action"),
        "actorEmail": ExportField(key="actorEmail", label="Tài khoản thực hiện", model_field="actor_email"),
        "resourceType": ExportField(key="resourceType", label="Loại tài nguyên", model_field="resource_type"),
        "resourceId": ExportField(key="resourceId", label="Mã tài nguyên", model_field="resource_id"),
        "resourceRepr": ExportField(key="resourceRepr", label="Mô tả tài nguyên", model_field="resource_repr"),
        "requestMethod": ExportField(key="requestMethod", label="Phương thức HTTP", model_field="request_method"),
        "requestPath": ExportField(key="requestPath", label="Đường dẫn Request", model_field="request_path"),
        "ipAddress": ExportField(key="ipAddress", label="Địa chỉ IP", model_field="ip_address"),
    }

    import_fields = {}

    def has_permission(self, user, company) -> bool:
        if not user or not user.is_authenticated:
            return False
        return bool(getattr(user, "is_superuser", False) or getattr(user, "is_staff", False) or getattr(user, "role_name", "") == var_sys.ADMIN)

    def get_queryset(self, user, company, filters: Optional[dict] = None):
        qs = AuditLog.objects.all()
        filters = filters or {}
        if filters.get("action"):
            qs = qs.filter(action=filters["action"])
        if filters.get("actorEmail"):
            qs = qs.filter(actor_email__icontains=filters["actorEmail"])
        if filters.get("resourceType"):
            qs = qs.filter(resource_type__icontains=filters["resourceType"])
        if filters.get("dateFrom"):
            qs = qs.filter(create_at__gte=filters["dateFrom"])
        if filters.get("dateTo"):
            qs = qs.filter(create_at__lte=filters["dateTo"])
        return qs.order_by("-create_at")
