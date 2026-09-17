import datetime
import decimal
import re
from typing import Dict, List, Optional, Set, Tuple
from django.db import models
from django.core.validators import validate_email
from django.core.exceptions import ValidationError

from apps.exchange.base import BaseExchangeDefinition, ErrorCodes, ImportField, ValidationIssue


class ValidatedRow:
    def __init__(
        self,
        row_number: int,
        raw_data: dict,
        cleaned_data: dict,
        action: str,  # "create" | "update" | "skip"
        existing_instance=None,
        issues: Optional[List[ValidationIssue]] = None,
    ):
        self.row_number = row_number
        self.raw_data = raw_data
        self.cleaned_data = cleaned_data
        self.action = action
        self.existing_instance = existing_instance
        self.issues = issues or []

    @property
    def has_errors(self) -> bool:
        return any(i.severity == "error" for i in self.issues)

    @property
    def has_warnings(self) -> bool:
        return any(i.severity == "warning" for i in self.issues)

    def to_dict(self) -> dict:
        serializable_data = {}
        for k, v in self.cleaned_data.items():
            if k.startswith("_"):
                continue
            if isinstance(v, (datetime.date, datetime.datetime)):
                serializable_data[k] = v.isoformat()
            elif isinstance(v, decimal.Decimal):
                serializable_data[k] = float(v)
            elif isinstance(v, models.Model):
                serializable_data[k] = str(v)
            else:
                serializable_data[k] = v

        return {
            "rowNumber": self.row_number,
            "data": serializable_data,
            "action": self.action,
            "errors": [i.to_dict() for i in self.issues],
        }


class ImportValidator:
    @staticmethod
    def map_headers(
        headers: List[str], definition: BaseExchangeDefinition
    ) -> Tuple[Dict[str, ImportField], List[ValidationIssue]]:
        """
        Layer A: Structural mapping of file headers to defined ImportFields.
        Returns header_to_field mapping and structural issues.
        """
        issues: List[ValidationIssue] = []
        header_map: Dict[str, ImportField] = {}
        matched_field_keys: Set[str] = set()

        # Build lookup table from label/key/aliases to ImportField
        lookup: Dict[str, ImportField] = {}
        for key, field_def in definition.import_fields.items():
            lookup[key.lower()] = field_def
            lookup[field_def.label.lower()] = field_def
            for alias in field_def.aliases:
                lookup[alias.lower()] = field_def

        seen_headers = set()
        for h in headers:
            clean_h = h.strip()
            lower_h = clean_h.lower()

            if lower_h in seen_headers:
                issues.append(
                    ValidationIssue(
                        field=clean_h,
                        code=ErrorCodes.IMPORT_INVALID_FILE,
                        message=f"Cột '{clean_h}' bị trùng lặp trong file.",
                        severity="error",
                    )
                )
                continue
            seen_headers.add(lower_h)

            matched_field = lookup.get(lower_h)
            if matched_field:
                header_map[clean_h] = matched_field
                matched_field_keys.add(matched_field.key)
            else:
                issues.append(
                    ValidationIssue(
                        field=clean_h,
                        code=ErrorCodes.IMPORT_UNKNOWN_COLUMN,
                        message=f"Cột '{clean_h}' không thuộc danh sách trường được phép nhập liệu.",
                        severity="warning",
                    )
                )

        # Check for missing required columns
        for key, field_def in definition.import_fields.items():
            if field_def.required and key not in matched_field_keys:
                issues.append(
                    ValidationIssue(
                        field=field_def.label,
                        code=ErrorCodes.IMPORT_MISSING_COLUMN,
                        message=f"Thiếu cột bắt buộc: '{field_def.label}' ({key}).",
                        severity="error",
                    )
                )

        return header_map, issues

    @staticmethod
    def validate_rows(
        raw_rows: List[dict],
        header_map: Dict[str, ImportField],
        definition: BaseExchangeDefinition,
        company,
        mode: str = "create",
        match_by: Optional[str] = None,
    ) -> List[ValidatedRow]:
        """
        Layers B (Field Validation) & C (Business Validation).
        Processes every row cleanly without stopping on first failure.
        """
        match_key = match_by or definition.default_matching_key
        match_field_def = definition.import_fields.get(match_key)
        seen_business_keys: Set[str] = set()

        validated_rows: List[ValidatedRow] = []

        for row_dict in raw_rows:
            row_number = row_dict.get("_row_number", 0)
            cleaned_row: dict = {}
            row_issues: List[ValidationIssue] = []

            # --- Layer B: Field Validation ---
            for h, field_def in header_map.items():
                raw_val = row_dict.get(h)
                cleaned_val, field_issues = ImportValidator._clean_field_value(
                    raw_val, field_def
                )
                cleaned_row[field_def.key] = cleaned_val
                row_issues.extend(field_issues)

            # Check required fields not present in header_map
            for key, field_def in definition.import_fields.items():
                if field_def.required and key not in cleaned_row:
                    row_issues.append(
                        ValidationIssue(
                            field=field_def.label,
                            code=ErrorCodes.IMPORT_REQUIRED_FIELD,
                            message=f"Trường bắt buộc '{field_def.label}' không có giá trị.",
                        )
                    )

            # --- Layer C: Business Validation & Conflict Detection ---
            business_key_val = str(cleaned_row.get(match_key, "") or "").strip()

            # 1. In-file duplicate detection
            if business_key_val:
                if business_key_val in seen_business_keys:
                    row_issues.append(
                        ValidationIssue(
                            field=match_field_def.label if match_field_def else match_key,
                            code=ErrorCodes.IMPORT_DUPLICATE_KEY,
                            message=f"Giá trị khóa '{business_key_val}' bị trùng lặp với dòng khác trong cùng file.",
                            value=business_key_val,
                        )
                    )
                else:
                    seen_business_keys.add(business_key_val)

            # 2. Database existence & mode rules
            existing_instance = None
            action = "create"
            if business_key_val and definition.model:
                try:
                    # Tenant-isolated lookup
                    filter_kwargs = {match_field_def.model_field or match_key: business_key_val}
                    if hasattr(definition.model, "company"):
                        filter_kwargs["company"] = company
                    elif hasattr(definition.model, "job_post"):
                        filter_kwargs["job_post__company"] = company

                    existing_instance = definition.model.objects.filter(**filter_kwargs).first()
                except Exception:
                    existing_instance = None

            if mode == "create":
                if existing_instance:
                    row_issues.append(
                        ValidationIssue(
                            field=match_field_def.label if match_field_def else match_key,
                            code=ErrorCodes.IMPORT_DUPLICATE_KEY,
                            message=f"Bản ghi với khóa '{business_key_val}' đã tồn tại trong hệ thống (Chế độ: Chỉ tạo mới).",
                            value=business_key_val,
                        )
                    )
                action = "create"
            elif mode == "update":
                if not existing_instance:
                    row_issues.append(
                        ValidationIssue(
                            field=match_field_def.label if match_field_def else match_key,
                            code=ErrorCodes.IMPORT_RECORD_NOT_FOUND,
                            message=f"Không tìm thấy bản ghi với khóa '{business_key_val}' để cập nhật (Chế độ: Chỉ cập nhật).",
                            value=business_key_val,
                        )
                    )
                action = "update"
            elif mode == "upsert":
                action = "update" if existing_instance else "create"

            # 3. Relationships resolution
            cleaned_row, rel_issues = definition.resolve_relationships(cleaned_row, company)
            row_issues.extend(rel_issues)

            # 4. Domain business rules
            biz_issues = definition.validate_business_rules(
                cleaned_row, existing_instance, action, company
            )
            row_issues.extend(biz_issues)

            validated_rows.append(
                ValidatedRow(
                    row_number=row_number,
                    raw_data=row_dict,
                    cleaned_data=cleaned_row,
                    action=action,
                    existing_instance=existing_instance,
                    issues=row_issues,
                )
            )

        return validated_rows

    @staticmethod
    def _clean_field_value(
        raw_val, field_def: ImportField
    ) -> Tuple[object, List[ValidationIssue]]:
        issues: List[ValidationIssue] = []
        if raw_val is None or (isinstance(raw_val, str) and not raw_val.strip()):
            if field_def.required:
                issues.append(
                    ValidationIssue(
                        field=field_def.label,
                        code=ErrorCodes.IMPORT_REQUIRED_FIELD,
                        message=f"Trường '{field_def.label}' là bắt buộc.",
                    )
                )
            return None, issues

        val_str = str(raw_val).strip()

        # String
        if field_def.field_type == "string":
            return val_str, issues

        # Email
        if field_def.field_type == "email":
            try:
                validate_email(val_str)
                return val_str.lower(), issues
            except ValidationError:
                issues.append(
                    ValidationIssue(
                        field=field_def.label,
                        code=ErrorCodes.IMPORT_INVALID_EMAIL,
                        message=f"Định dạng email không hợp lệ: '{val_str}'",
                        value=val_str,
                    )
                )
                return val_str, issues

        # Phone
        if field_def.field_type == "phone":
            cleaned_phone = re.sub(r"[\s\-\.]", "", val_str)
            if not re.match(r"^\+?[0-9]{8,15}$", cleaned_phone):
                issues.append(
                    ValidationIssue(
                        field=field_def.label,
                        code=ErrorCodes.IMPORT_INVALID_PHONE,
                        message=f"Số điện thoại không hợp lệ: '{val_str}'",
                        value=val_str,
                    )
                )
            return cleaned_phone, issues

        # Number / Decimal
        if field_def.field_type == "number":
            cleaned_num = val_str.replace(",", "").replace(".", "").strip() if ("," in val_str and "." in val_str) else val_str.replace(",", "")
            try:
                if "." in cleaned_num:
                    return decimal.Decimal(cleaned_num), issues
                return int(cleaned_num), issues
            except Exception:
                issues.append(
                    ValidationIssue(
                        field=field_def.label,
                        code=ErrorCodes.IMPORT_INVALID_NUMBER,
                        message=f"Giá trị số không hợp lệ: '{val_str}'",
                        value=val_str,
                    )
                )
                return None, issues

        # Date
        if field_def.field_type == "date":
            if isinstance(raw_val, (datetime.date, datetime.datetime)):
                return (raw_val.date() if isinstance(raw_val, datetime.datetime) else raw_val), issues
            parsed_date = ImportValidator._parse_date_string(val_str)
            if not parsed_date:
                issues.append(
                    ValidationIssue(
                        field=field_def.label,
                        code=ErrorCodes.IMPORT_INVALID_DATE,
                        message=f"Định dạng ngày không hợp lệ: '{val_str}'. Hỗ trợ YYYY-MM-DD hoặc DD/MM/YYYY.",
                        value=val_str,
                    )
                )
            return parsed_date, issues

        # Enum
        if field_def.field_type == "enum" and field_def.choices:
            for canonical_val, label in field_def.choices:
                if str(canonical_val).lower() == val_str.lower() or str(label).lower() == val_str.lower():
                    return canonical_val, issues

            allowed = ", ".join([f"'{c[1]}'" for c in field_def.choices[:5]])
            issues.append(
                ValidationIssue(
                    field=field_def.label,
                    code=ErrorCodes.IMPORT_INVALID_ENUM,
                    message=f"Giá trị '{val_str}' không hợp lệ. Các giá trị cho phép: {allowed}...",
                    value=val_str,
                )
            )
            return None, issues

        # Boolean
        if field_def.field_type == "boolean":
            true_vals = {"true", "1", "yes", "có", "đúng", "y", "t"}
            false_vals = {"false", "0", "no", "không", "sai", "n", "f"}
            low = val_str.lower()
            if low in true_vals:
                return True, issues
            elif low in false_vals:
                return False, issues
            else:
                issues.append(
                    ValidationIssue(
                        field=field_def.label,
                        code=ErrorCodes.IMPORT_INVALID_ENUM,
                        message=f"Giá trị boolean không hợp lệ: '{val_str}'",
                        value=val_str,
                    )
                )
                return None, issues

        return val_str, issues

    @staticmethod
    def _parse_date_string(date_str: str) -> Optional[datetime.date]:
        date_str = date_str.strip()
        formats = [
            "%Y-%m-%d",
            "%d/%m/%Y",
            "%d-%m-%Y",
            "%Y/%m/%d",
            "%d.%m.%Y",
        ]
        for fmt in formats:
            try:
                return datetime.datetime.strptime(date_str, fmt).date()
            except ValueError:
                continue
        return None
