from __future__ import annotations

from typing import Any

def _client_ip(request) -> str | None:
    if request is None:
        return None
    forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
    if forwarded_for:
        return forwarded_for.split(",", 1)[0].strip() or None
    return request.META.get("REMOTE_ADDR") or None


def _resource_type(instance: Any) -> str:
    meta = getattr(instance, "_meta", None)
    if meta is None:
        return instance.__class__.__name__
    return meta.label


def _resource_id(instance: Any) -> str:
    pk = getattr(instance, "pk", None)
    return "" if pk is None else str(pk)


def _resource_repr(instance: Any) -> str:
    try:
        value = str(instance)
    except Exception:
        value = ""
    return value[:255]


def record_audit_log(
    *,
    request=None,
    actor=None,
    action: str,
    resource_type: str = "",
    resource_id: str = "",
    resource_repr: str = "",
    instance=None,
    metadata: dict[str, Any] | None = None,
) -> None:
    """Best-effort audit logging. Audit failures must never break user flows."""
    try:
        from common.models import AuditLog

        if actor is None and request is not None:
            request_user = getattr(request, "user", None)
            if getattr(request_user, "is_authenticated", False):
                actor = request_user

        if instance is not None:
            resource_type = resource_type or _resource_type(instance)
            resource_id = resource_id or _resource_id(instance)
            resource_repr = resource_repr or _resource_repr(instance)

        AuditLog.objects.create(
            actor=actor if getattr(actor, "is_authenticated", True) else None,
            actor_email=getattr(actor, "email", "") or "",
            action=action,
            resource_type=resource_type or "unknown",
            resource_id=str(resource_id or ""),
            resource_repr=str(resource_repr or "")[:255],
            ip_address=_client_ip(request),
            user_agent=(request.META.get("HTTP_USER_AGENT", "") if request is not None else "")[:2000],
            request_method=(request.method if request is not None else "")[:12],
            request_path=(request.get_full_path() if request is not None else "")[:500],
            metadata=metadata or {},
        )
    except Exception:
        return


class AuditLogViewSetMixin:
    audit_resource_type: str | None = None

    def _audit_instance(self, action: str, instance, metadata: dict[str, Any] | None = None) -> None:
        record_audit_log(
            request=getattr(self, "request", None),
            action=action,
            resource_type=self.audit_resource_type or _resource_type(instance),
            instance=instance,
            metadata=metadata,
        )

    def perform_create(self, serializer):
        instance = serializer.save()
        self._audit_instance("create", instance)

    def perform_update(self, serializer):
        instance = serializer.save()
        self._audit_instance("update", instance)

    def perform_destroy(self, instance):
        self._audit_instance("delete", instance)
        instance.delete()
