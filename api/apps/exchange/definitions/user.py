from typing import Optional
from django.db import models
from apps.accounts.models import User
from apps.exchange.base import BaseExchangeDefinition, ExportField
from apps.exchange.registry import exchange_registry
from shared.configs import variable_system as var_sys


@exchange_registry.register
class UserExchangeDefinition(BaseExchangeDefinition):
    entity_type = "user"
    label = "Danh sách tài khoản người dùng"
    model = User
    permission_roles = [var_sys.ADMIN]
    supports_export = True
    supports_import = False

    export_fields = {
        "id": ExportField(key="id", label="Mã ID", model_field="id"),
        "email": ExportField(key="email", label="Email", model_field="email"),
        "fullName": ExportField(key="fullName", label="Họ và tên", model_field="full_name"),
        "phoneNumber": ExportField(key="phoneNumber", label="Số điện thoại", model_field="phone_number"),
        "roleName": ExportField(
            key="roleName",
            label="Vai trò",
            formatter=lambda obj, k: obj.get_role_name_display() if hasattr(obj, "get_role_name_display") else obj.role_name,
        ),
        "isActive": ExportField(
            key="isActive",
            label="Trạng thái tài khoản",
            formatter=lambda obj, k: "Đang hoạt động" if obj.is_active else "Bị khóa",
        ),
        "isStaff": ExportField(
            key="isStaff",
            label="Quyền Quản trị viên",
            formatter=lambda obj, k: "Có" if obj.is_staff else "Không",
        ),
        "isVerifyEmail": ExportField(
            key="isVerifyEmail",
            label="Xác thực Email",
            formatter=lambda obj, k: "Đã xác thực" if obj.is_verify_email else "Chưa xác thực",
        ),
        "isVerifyPhone": ExportField(
            key="isVerifyPhone",
            label="Xác thực SĐT",
            formatter=lambda obj, k: "Đã xác thực" if obj.is_verify_phone else "Chưa xác thực",
        ),
        "createdAt": ExportField(
            key="createdAt",
            label="Ngày tạo tài khoản",
            formatter=lambda obj, k: obj.create_at.strftime("%d/%m/%Y %H:%M") if obj.create_at else "",
        ),
        "lastLogin": ExportField(
            key="lastLogin",
            label="Đăng nhập gần nhất",
            formatter=lambda obj, k: obj.last_login.strftime("%d/%m/%Y %H:%M") if obj.last_login else "",
        ),
    }

    import_fields = {}

    def has_permission(self, user, company) -> bool:
        if not user or not user.is_authenticated:
            return False
        return bool(getattr(user, "is_superuser", False) or getattr(user, "is_staff", False) or getattr(user, "role_name", "") == var_sys.ADMIN)

    def get_queryset(self, user, company, filters: Optional[dict] = None):
        qs = User.objects.all()
        filters = filters or {}
        if filters.get("role"):
            qs = qs.filter(role_name=filters["role"])
        if filters.get("isActive") is not None:
            is_act = str(filters["isActive"]).lower() in ["true", "1"]
            qs = qs.filter(is_active=is_act)
        if filters.get("search"):
            st = str(filters["search"]).strip()
            qs = qs.filter(
                models.Q(email__icontains=st)
                | models.Q(full_name__icontains=st)
                | models.Q(phone_number__icontains=st)
            )
        return qs.order_by("-create_at")
