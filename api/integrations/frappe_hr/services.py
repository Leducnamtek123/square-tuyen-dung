import logging
import re
from dataclasses import dataclass
from typing import Any

from django.conf import settings
from django.db import transaction
from django.utils import timezone
from rest_framework import serializers

from apps.accounts.models import User
from apps.jobs.models import JobPostActivity
from apps.profiles.models import CompanyMember, CompanyRole
from shared.configs import variable_system as var_sys

from .client import FrappeHRAPIError, FrappeHRClient

logger = logging.getLogger(__name__)


EMPLOYEE_STATUS_BY_APPLICATION_STATUS = {
    var_sys.ApplicationStatus.HIRED: "Active",
    var_sys.ApplicationStatus.INTERVIEWED: "Active",
}

DEFAULT_EMPLOYEE_MEMBER_ROLE = {
    "code": "employee",
    "name": "Employee",
    "description": "Company employee synced from Frappe HR.",
    "permissions": [],
}


@dataclass
class FrappeSyncResult:
    employee: dict[str, Any]
    user: dict[str, Any] | None
    company: dict[str, Any] | None
    recruiter_user: dict[str, Any] | None
    public_url: str


def _split_name(full_name: str) -> tuple[str, str]:
    cleaned = " ".join((full_name or "").split())
    if not cleaned:
        return "Employee", ""
    parts = cleaned.split(" ", 1)
    return parts[0], parts[1] if len(parts) > 1 else ""


def _abbr(value: str) -> str:
    words = re.findall(r"[A-Za-z0-9]+", value or "")
    if not words:
        return "SQ"
    candidate = "".join(word[0] for word in words[:4]).upper()
    return candidate[:8] or "SQ"


def _clean_payload(payload: dict[str, Any]) -> dict[str, Any]:
    return {key: value for key, value in payload.items() if value not in (None, "")}


def _frappe_gender(value: str | None) -> str:
    normalized = str(value or "").strip().lower()
    if normalized in {"m", "male"}:
        return "Male"
    if normalized in {"f", "female"}:
        return "Female"
    if normalized in {"o", "other"}:
        return "Other"
    return settings.FRAPPE_HR_DEFAULT_GENDER


class FrappeHRSyncService:
    def __init__(self, client: FrappeHRClient | None = None):
        self.client = client or FrappeHRClient()

    def _public_resource_url(self, doctype: str, name: str) -> str:
        public_base = (settings.FRAPPE_HR_PUBLIC_URL or settings.FRAPPE_HR_BASE_URL).rstrip("/")
        return f"{public_base}/app/{doctype.lower().replace(' ', '-')}/{name}"

    def ensure_named_document(self, doctype: str, name: str, payload: dict[str, Any] | None = None) -> dict[str, Any] | None:
        existing = self.client.find_one(doctype, [["name", "=", name]], fields=["name"])
        if existing:
            return existing
        data = {"name": name}
        data.update(payload or {})
        return self.client.create_document(doctype, data)

    def ensure_erpnext_company_prerequisites(self) -> None:
        self.ensure_named_document("Warehouse Type", "Transit")

    def ensure_employee_prerequisites(self, gender: str) -> None:
        self.ensure_named_document("Gender", gender, {"gender": gender})

    def ensure_company(self, square_company) -> dict[str, Any] | None:
        company_name = settings.FRAPPE_HR_DEFAULT_COMPANY or square_company.company_name
        existing = self.client.find_one(
            "Company",
            [["company_name", "=", company_name]],
            fields=["name", "company_name"],
        )
        if existing:
            return existing

        self.ensure_erpnext_company_prerequisites()
        return self.client.create_document(
            "Company",
            _clean_payload(
                {
                    "company_name": company_name,
                    "abbr": _abbr(company_name),
                    "default_currency": settings.FRAPPE_HR_DEFAULT_CURRENCY,
                    "country": settings.FRAPPE_HR_DEFAULT_COUNTRY,
                }
            ),
        )

    def ensure_designation(self, job_title: str | None) -> dict[str, Any] | None:
        if not job_title:
            return None
        existing = self.client.find_one(
            "Designation",
            [["designation_name", "=", job_title]],
            fields=["name", "designation_name"],
        )
        if existing:
            return existing
        return self.client.create_document("Designation", {"designation_name": job_title})

    def ensure_department(self, department: str | None, company_name: str | None) -> dict[str, Any] | None:
        if not department or not company_name:
            return None
        existing = self.client.find_one(
            "Department",
            [["department_name", "=", department], ["company", "=", company_name]],
            fields=["name", "department_name"],
        )
        if existing:
            return existing
        return self.client.create_document(
            "Department",
            {
                "department_name": department,
                "company": company_name,
            },
        )

    def ensure_user(
        self,
        *,
        email: str | None,
        full_name: str,
        roles: list[str],
        send_welcome_email: bool = False,
    ) -> dict[str, Any] | None:
        if not email:
            return None
        first_name, last_name = _split_name(full_name)
        existing = self.client.find_one("User", [["email", "=", email]], fields=["name", "email", "enabled"])
        payload = _clean_payload(
            {
                "email": email,
                "first_name": first_name,
                "last_name": last_name,
                "full_name": full_name,
                "enabled": 1,
                "user_type": "System User",
                "send_welcome_email": 1 if send_welcome_email else 0,
                "roles": [{"role": role} for role in roles if role],
            }
        )
        if existing:
            current = self.client.get_document("User", existing["name"])
            current_roles = {row.get("role") for row in current.get("roles", []) if row.get("role")}
            merged_roles = sorted(current_roles.union(role for role in roles if role))
            update_payload = {
                "enabled": 1,
                "user_type": "System User",
                "roles": [{"role": role} for role in merged_roles],
            }
            return self.client.update_document("User", existing["name"], update_payload)
        return self.client.create_document("User", payload)

    def ensure_user_permission(self, *, user_email: str | None, allow: str, for_value: str | None) -> dict[str, Any] | None:
        if not user_email or not for_value:
            return None
        existing = self.client.find_one(
            "User Permission",
            [["user", "=", user_email], ["allow", "=", allow], ["for_value", "=", for_value]],
            fields=["name"],
        )
        if existing:
            return existing
        return self.client.create_document(
            "User Permission",
            {
                "user": user_email,
                "allow": allow,
                "for_value": for_value,
                "is_default": 1,
            },
        )

    def _recruiter_roles(self, actor) -> list[str]:
        roles = list(settings.FRAPPE_HR_RECRUITER_ROLES)
        company = getattr(actor, "active_company", None)
        if not company:
            return roles

        is_owner = company.user_id == actor.id
        member = CompanyMember.objects.filter(company=company, user=actor, is_active=True).select_related("role").first()
        permissions = set(member.role.permissions or []) if member and member.role else set()
        if is_owner or "manage_employees" in permissions:
            return roles
        return list(settings.FRAPPE_HR_RECRUITER_READONLY_ROLES)

    def provision_recruiter_account(self, actor, company_name: str | None = None) -> dict[str, Any] | None:
        if not settings.FRAPPE_HR_SYNC_RECRUITER_ACCOUNTS:
            return None
        roles = self._recruiter_roles(actor)
        user = self.ensure_user(
            email=actor.email,
            full_name=actor.full_name or actor.email,
            roles=roles,
            send_welcome_email=False,
        )
        if user and company_name:
            self.ensure_user_permission(user_email=actor.email, allow="Company", for_value=company_name)
        return user

    def _employee_roles(self, requested_roles: list[str] | None = None) -> list[str]:
        roles = set(settings.FRAPPE_HR_EMPLOYEE_ROLES)
        for role in requested_roles or []:
            if role:
                roles.add(role)
        return sorted(roles)

    def ensure_square_company_member(self, *, company, email: str | None) -> CompanyMember | None:
        if not company or not email:
            return None

        user = User.objects.filter(email__iexact=email).first()
        if not user:
            return None

        role, _ = CompanyRole.objects.get_or_create(
            company=company,
            code=DEFAULT_EMPLOYEE_MEMBER_ROLE["code"],
            defaults={
                "name": DEFAULT_EMPLOYEE_MEMBER_ROLE["name"],
                "description": DEFAULT_EMPLOYEE_MEMBER_ROLE["description"],
                "permissions": DEFAULT_EMPLOYEE_MEMBER_ROLE["permissions"],
                "is_system": True,
                "is_active": True,
            },
        )
        changed = False
        if role.name != DEFAULT_EMPLOYEE_MEMBER_ROLE["name"]:
            role.name = DEFAULT_EMPLOYEE_MEMBER_ROLE["name"]
            changed = True
        if role.permissions != DEFAULT_EMPLOYEE_MEMBER_ROLE["permissions"]:
            role.permissions = DEFAULT_EMPLOYEE_MEMBER_ROLE["permissions"]
            changed = True
        if not role.is_active:
            role.is_active = True
            changed = True
        if changed:
            role.save(update_fields=["name", "permissions", "is_active", "update_at"])

        member, created = CompanyMember.objects.get_or_create(
            company=company,
            user=user,
            defaults={
                "role": role,
                "status": CompanyMember.STATUS_ACTIVE,
                "joined_at": timezone.now(),
                "invited_email": email,
                "is_active": True,
            },
        )
        if not created and (
            member.role_id != role.id
            or member.status != CompanyMember.STATUS_ACTIVE
            or not member.is_active
            or member.joined_at is None
        ):
            member.role = role
            member.status = CompanyMember.STATUS_ACTIVE
            member.is_active = True
            if member.joined_at is None:
                member.joined_at = timezone.now()
            if not member.invited_email:
                member.invited_email = email
            member.save(update_fields=["role", "status", "is_active", "joined_at", "invited_email", "update_at"])
        return member

    def sync_application_to_frappe(self, activity: JobPostActivity, actor, payload: dict[str, Any]) -> FrappeSyncResult:
        if activity.status == var_sys.ApplicationStatus.NOT_SELECTED:
            raise serializers.ValidationError({"applicationId": ["Rejected applications cannot be sent to Frappe HR."]})

        company = activity.job_post.company
        full_name = payload.get("full_name") or activity.full_name or activity.user.full_name
        email = payload.get("email") or activity.email or activity.user.email
        phone = payload.get("phone") or activity.phone or ""
        profile = getattr(activity.user, "job_seeker_profile", None)
        gender = _frappe_gender(payload.get("gender") or getattr(profile, "gender", None))
        date_of_birth = payload.get("date_of_birth") or getattr(profile, "birthday", None) or settings.FRAPPE_HR_DEFAULT_DATE_OF_BIRTH
        job_title = payload.get("job_title") or activity.job_post.job_name
        department = payload.get("department") or settings.FRAPPE_HR_DEFAULT_DEPARTMENT
        start_date = payload.get("start_date") or timezone.localdate()
        create_user_account = payload.get("create_user_account", True)
        send_welcome_email = payload.get("send_welcome_email", False)

        activity.frappe_sync_status = JobPostActivity.FrappeSyncStatus.SYNCING
        activity.frappe_sync_error = ""
        activity.save(update_fields=["frappe_sync_status", "frappe_sync_error", "update_at"])

        try:
            frappe_company = self.ensure_company(company)
            company_name = frappe_company.get("name") if frappe_company else None
            designation = self.ensure_designation(job_title)
            department_doc = self.ensure_department(department, company_name)
            recruiter_user = self.provision_recruiter_account(actor, company_name)

            employee_user = None
            if create_user_account:
                employee_user = self.ensure_user(
                    email=email,
                    full_name=full_name,
                    roles=self._employee_roles(payload.get("frappe_roles")),
                    send_welcome_email=send_welcome_email,
                )
                if company_name:
                    self.ensure_user_permission(user_email=email, allow="Company", for_value=company_name)

            self.ensure_employee_prerequisites(gender)
            first_name, last_name = _split_name(full_name)
            existing_employee_name = activity.frappe_employee_id
            if not existing_employee_name and email:
                existing = self.client.find_one(
                    "Employee",
                    [["personal_email", "=", email]],
                    fields=["name", "employee_name"],
                )
                existing_employee_name = existing.get("name") if existing else None

            employee_payload = _clean_payload(
                {
                    "first_name": first_name,
                    "last_name": last_name,
                    "employee_name": full_name,
                    "gender": gender,
                    "date_of_birth": str(date_of_birth),
                    "personal_email": email,
                    "cell_number": phone,
                    "company": company_name,
                    "designation": designation.get("name") if designation else None,
                    "department": department_doc.get("name") if department_doc else None,
                    "date_of_joining": str(start_date),
                    "status": EMPLOYEE_STATUS_BY_APPLICATION_STATUS.get(activity.status, "Active"),
                    "user_id": email if create_user_account and email else None,
                }
            )
            if existing_employee_name:
                employee = self.client.update_document("Employee", existing_employee_name, employee_payload)
            else:
                employee = self.client.create_document("Employee", employee_payload)

            employee_name = employee.get("name")
            if create_user_account and employee_name:
                self.ensure_user_permission(user_email=email, allow="Employee", for_value=employee_name)

            with transaction.atomic():
                if create_user_account:
                    self.ensure_square_company_member(company=company, email=email)
                if activity.status != var_sys.ApplicationStatus.HIRED:
                    activity.status = var_sys.ApplicationStatus.HIRED
                activity.frappe_employee_id = employee_name or ""
                activity.frappe_user_id = email if create_user_account and email else ""
                activity.frappe_sync_status = JobPostActivity.FrappeSyncStatus.SYNCED
                activity.frappe_sync_error = ""
                activity.frappe_synced_at = timezone.now()
                activity.save(
                    update_fields=[
                        "status",
                        "frappe_employee_id",
                        "frappe_user_id",
                        "frappe_sync_status",
                        "frappe_sync_error",
                        "frappe_synced_at",
                        "update_at",
                    ]
                )
            return FrappeSyncResult(
                employee=employee,
                user=employee_user,
                company=frappe_company,
                recruiter_user=recruiter_user,
                public_url=self._public_resource_url("Employee", employee_name) if employee_name else "",
            )
        except Exception as exc:
            message = str(exc)
            if isinstance(exc, FrappeHRAPIError) and exc.details:
                logger.warning("Frappe HR sync failed: %s", exc.details)
            activity.frappe_sync_status = JobPostActivity.FrappeSyncStatus.FAILED
            activity.frappe_sync_error = message[:1000]
            activity.save(update_fields=["frappe_sync_status", "frappe_sync_error", "update_at"])
            raise


def sync_application(activity: JobPostActivity, actor, payload: dict[str, Any]) -> FrappeSyncResult:
    current_activity = (
        JobPostActivity.objects.select_related("user", "job_post", "job_post__company")
        .get(pk=activity.pk)
    )
    return FrappeHRSyncService().sync_application_to_frappe(current_activity, actor, payload)
