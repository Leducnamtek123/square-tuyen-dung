from dataclasses import dataclass, field
from typing import Any, Callable, Dict, List, Optional, Tuple, Type
from django.db import models


class ErrorCodes:
    IMPORT_INVALID_FILE = "IMPORT_INVALID_FILE"
    IMPORT_EMPTY_FILE = "IMPORT_EMPTY_FILE"
    IMPORT_MISSING_COLUMN = "IMPORT_MISSING_COLUMN"
    IMPORT_UNKNOWN_COLUMN = "IMPORT_UNKNOWN_COLUMN"
    IMPORT_REQUIRED_FIELD = "IMPORT_REQUIRED_FIELD"
    IMPORT_INVALID_EMAIL = "IMPORT_INVALID_EMAIL"
    IMPORT_INVALID_PHONE = "IMPORT_INVALID_PHONE"
    IMPORT_INVALID_DATE = "IMPORT_INVALID_DATE"
    IMPORT_INVALID_NUMBER = "IMPORT_INVALID_NUMBER"
    IMPORT_INVALID_ENUM = "IMPORT_INVALID_ENUM"
    IMPORT_DUPLICATE_KEY = "IMPORT_DUPLICATE_KEY"
    IMPORT_RECORD_NOT_FOUND = "IMPORT_RECORD_NOT_FOUND"
    IMPORT_RELATION_NOT_FOUND = "IMPORT_RELATION_NOT_FOUND"
    IMPORT_PERMISSION_DENIED = "IMPORT_PERMISSION_DENIED"
    IMPORT_TENANT_MISMATCH = "IMPORT_TENANT_MISMATCH"
    IMPORT_BUSINESS_RULE_VIOLATION = "IMPORT_BUSINESS_RULE_VIOLATION"


@dataclass
class ValidationIssue:
    field: str
    code: str
    message: str
    severity: str = "error"  # "error" | "warning"
    value: Any = None

    def to_dict(self) -> dict:
        return {
            "field": self.field,
            "code": self.code,
            "message": self.message,
            "severity": self.severity,
            "value": str(self.value) if self.value is not None else None,
        }


@dataclass
class ExportField:
    key: str
    label: str
    model_field: Optional[str] = None
    formatter: Optional[Callable[[Any, Any], Any]] = None
    default_checked: bool = True
    sensitive: bool = False
    description: str = ""


@dataclass
class ImportField:
    key: str
    label: str
    aliases: List[str] = field(default_factory=list)
    model_field: Optional[str] = None
    field_type: str = "string"  # "string" | "email" | "phone" | "date" | "number" | "enum" | "boolean" | "relation"
    required: bool = False
    choices: Optional[List[Tuple[Any, str]]] = None  # [(canonical_val, human_label)]
    example: str = ""
    description: str = ""
    validator: Optional[Callable[[Any, dict, Any], List[ValidationIssue]]] = None


class BaseExchangeDefinition:
    entity_type: str = ""
    label: str = ""
    model: Optional[Type[models.Model]] = None
    permission_roles: List[str] = []
    export_fields: Dict[str, ExportField] = {}
    import_fields: Dict[str, ImportField] = {}
    matching_keys: List[str] = []
    default_matching_key: str = ""
    supported_modes: List[str] = ["create", "update", "upsert"]
    atomic_import: bool = True
    supports_export: bool = True
    supports_import: bool = True

    def has_permission(self, user, company) -> bool:
        """Verify object-level permission for user and tenant."""
        if not user or not user.is_authenticated:
            return False
        if getattr(user, "is_superuser", False) or getattr(user, "is_staff", False):
            return True
        if self.permission_roles:
            user_role = getattr(user, "role_name", None)
            return user_role in self.permission_roles
        return True

    def get_queryset(self, user, company, filters: Optional[dict] = None):
        """Must return filtered, tenant-isolated queryset."""
        raise NotImplementedError("Subclasses must implement get_queryset")

    def transform_for_export(self, instance, selected_keys: Optional[List[str]] = None) -> dict:
        """Map model instance to exportable dictionary."""
        active_keys = selected_keys or list(self.export_fields.keys())
        result = {}
        for key in active_keys:
            field_def = self.export_fields.get(key)
            if not field_def:
                continue
            if field_def.sensitive and not getattr(instance, "_can_view_sensitive", False):
                continue
            if field_def.formatter:
                val = field_def.formatter(instance, key)
            elif field_def.model_field:
                val = getattr(instance, field_def.model_field, None)
            else:
                val = getattr(instance, key, None)
            result[field_def.label] = val if val is not None else ""
        return result

    def resolve_relationships(self, row_dict: dict, company) -> Tuple[dict, List[ValidationIssue]]:
        """
        Resolve foreign keys (e.g. department code -> Department instance).
        Strict integrity: return ValidationIssue on missing relationship, NEVER silently fallback.
        """
        return row_dict, []

    def validate_business_rules(
        self, row_dict: dict, existing_instance: Optional[models.Model], mode: str, company
    ) -> List[ValidationIssue]:
        """Validate domain-specific invariants."""
        return []

    def create_record(self, validated_data: dict, company, user) -> models.Model:
        """Create new record."""
        raise NotImplementedError("Subclasses must implement create_record")

    def update_record(self, instance: models.Model, validated_data: dict, company, user) -> models.Model:
        """Update existing record."""
        raise NotImplementedError("Subclasses must implement update_record")
