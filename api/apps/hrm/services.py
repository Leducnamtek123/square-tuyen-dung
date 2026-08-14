import logging
import re
from typing import Any, Dict, Optional, Tuple

from django.db import transaction
from django.utils import timezone
from rest_framework.exceptions import ValidationError, PermissionDenied

from apps.accounts.models import User
from apps.jobs.models import JobPostActivity
from apps.profiles.models import Company, CompanyMember, CompanyRole, JobSeekerProfile
from apps.hrm.models import (
    Department,
    Designation,
    Employee,
    EmploymentContract,
)
from shared.configs import variable_system as var_sys

logger = logging.getLogger(__name__)


def generate_next_employee_code(company: Company) -> str:
    """
    Safely generates the next sequential employee code for the given company.
    Uses select_for_update() inside a transaction to prevent race conditions.
    """
    prefix = "SQ-EMP-"
    # Lock company's employees to find the maximum existing sequence number
    existing_codes = (
        Employee.objects.select_for_update()
        .filter(company=company, employee_code__startswith=prefix)
        .values_list("employee_code", flat=True)
    )

    max_num = 0
    for code in existing_codes:
        match = re.search(r"SQ-EMP-(\d+)", code)
        if match:
            try:
                num = int(match.group(1))
                if num > max_num:
                    max_num = num
            except ValueError:
                pass

    next_num = max_num + 1
    return f"{prefix}{next_num:03d}"


class CandidateToEmployeeConverter:
    """
    Domain service for converting a hired recruitment candidate (JobPostActivity)
    into a Native HRM Employee record safely, preserving User identity,
    linking candidate profiles, granting company membership, and maintaining idempotency.
    """

    @classmethod
    @transaction.atomic
    def convert(
        cls,
        company: Company,
        actor: User,
        data: Dict[str, Any],
    ) -> Tuple[Employee, bool]:
        """
        Executes the conversion within an atomic transaction.
        Returns (Employee, created_boolean).
        """
        if not company:
            raise ValidationError({"detail": "Công ty không hợp lệ hoặc chưa được xác thực."})

        job_application_id = data.get("job_application_id")
        candidate_profile_id = data.get("candidate_profile_id")

        activity: Optional[JobPostActivity] = None
        candidate_profile: Optional[JobSeekerProfile] = None
        user: Optional[User] = None

        if job_application_id:
            activity = (
                JobPostActivity.objects.select_for_update()
                .select_related(
                    "job_post",
                    "job_post__company",
                    "user",
                    "resume",
                    "resume__job_seeker_profile",
                    "manual_candidate_profile",
                )
                .filter(id=job_application_id, is_deleted=False)
                .first()
            )

            if not activity:
                raise ValidationError({"job_application_id": ["Đơn ứng tuyển không tồn tại."]})

            if activity.job_post.company_id != company.id:
                raise PermissionDenied("Đơn ứng tuyển không thuộc quyền quản lý của công ty này.")

            # Idempotency Check 1: Has this application already been converted?
            existing_emp = Employee.objects.filter(
                company=company,
                onboarded_from_activity=activity,
            ).first()
            if existing_emp:
                logger.info(
                    "Application %s already converted to Employee %s. Returning existing.",
                    activity.id,
                    existing_emp.id,
                )
                return existing_emp, False

            # Extract User & Candidate Profile from Application
            user = activity.user
            if activity.resume and getattr(activity.resume, "job_seeker_profile", None):
                candidate_profile = activity.resume.job_seeker_profile

        elif candidate_profile_id:
            candidate_profile = (
                JobSeekerProfile.objects.select_related("user")
                .filter(id=candidate_profile_id)
                .first()
            )
            if not candidate_profile:
                raise ValidationError({"candidate_profile_id": ["Hồ sơ ứng viên không tồn tại."]})
            user = candidate_profile.user

        # Idempotency Check 2: Does an active Employee already exist for this user in this company?
        if user:
            existing_user_emp = Employee.objects.filter(
                company=company,
                user=user,
            ).first()
            if existing_user_emp:
                if activity and not existing_user_emp.onboarded_from_activity:
                    existing_user_emp.onboarded_from_activity = activity
                    existing_user_emp.save(update_fields=["onboarded_from_activity", "update_at"])
                logger.info(
                    "User %s already has Employee profile %s in company %s. Reusing existing.",
                    user.email,
                    existing_user_emp.id,
                    company.id,
                )
                return existing_user_emp, False

        # Extract names, contact & demographic details
        first_name = data.get("first_name", "").strip()
        last_name = data.get("last_name", "").strip()
        if not first_name and user:
            # Fallback parsing from full_name if not directly provided
            parts = user.full_name.strip().split(" ", 1)
            last_name = parts[0] if len(parts) > 1 else ""
            first_name = parts[1] if len(parts) > 1 else parts[0]
        elif not first_name and activity and activity.full_name:
            parts = activity.full_name.strip().split(" ", 1)
            last_name = parts[0] if len(parts) > 1 else ""
            first_name = parts[1] if len(parts) > 1 else parts[0]

        full_name = f"{last_name} {first_name}".strip()
        if not full_name and user:
            full_name = user.full_name

        email = (data.get("email") or (user.email if user else "") or (activity.email if activity else "")).strip().lower()
        if not email:
            raise ValidationError({"email": ["Email của nhân viên không được để trống."]})

        phone = data.get("phone") or (user.phone_number if user else "") or (activity.phone if activity else "") or ""

        # Demographics from JobSeekerProfile if available
        gender = "OTHER"
        date_of_birth = None
        address = ""
        tax_id = ""
        social_insurance_id = ""

        if candidate_profile:
            gender_raw = getattr(candidate_profile, "gender", None)
            if gender_raw == "M":
                gender = "MALE"
            elif gender_raw == "F":
                gender = "FEMALE"

            date_of_birth = getattr(candidate_profile, "birthday", None)
            address = getattr(candidate_profile, "contact_address", "") or getattr(candidate_profile, "permanent_address", "") or ""
            tax_id = getattr(candidate_profile, "tax_code", "") or ""
            social_insurance_id = getattr(candidate_profile, "social_insurance_no", "") or ""

        # Resolve Department & Designation
        department = None
        if data.get("department_id"):
            department = Department.objects.filter(company=company, id=data["department_id"]).first()

        designation = None
        if data.get("designation_id"):
            designation = Designation.objects.filter(company=company, id=data["designation_id"]).first()

        reports_to = None
        if data.get("reports_to_id"):
            reports_to = Employee.objects.filter(company=company, id=data["reports_to_id"]).first()

        join_date = data.get("join_date") or timezone.now().date()
        probation_end_date = data.get("probation_end_date")
        employment_type = data.get("employment_type", "FULL_TIME")
        initial_status = data.get("status", "PROBATION")

        # Generate unique employee code
        employee_code = generate_next_employee_code(company)

        # Create Native Employee record
        employee = Employee.objects.create(
            company=company,
            user=user,
            candidate_profile=candidate_profile,
            onboarded_from_activity=activity,
            employee_code=employee_code,
            first_name=first_name or "Nhân viên",
            last_name=last_name,
            full_name=full_name or "Nhân viên mới",
            email=email,
            phone=phone,
            gender=gender,
            date_of_birth=date_of_birth,
            address=address,
            tax_id=tax_id,
            social_insurance_id=social_insurance_id,
            department=department,
            designation=designation,
            reports_to=reports_to,
            status=initial_status,
            employment_type=employment_type,
            join_date=join_date,
            probation_end_date=probation_end_date,
        )

        # Ensure CompanyMember exists for the User without downgrading existing roles
        if user:
            existing_member = CompanyMember.objects.filter(company=company, user=user).first()
            if not existing_member:
                # Find or create default Employee company role
                employee_role = CompanyRole.objects.filter(company=company, code="employee").first()
                if not employee_role:
                    employee_role = CompanyRole.objects.create(
                        company=company,
                        code="employee",
                        name="Nhân viên (Employee)",
                        description="Nhân viên chính thức của công ty",
                        permissions=[],
                        is_system=True,
                        is_active=True,
                    )
                CompanyMember.objects.create(
                    company=company,
                    user=user,
                    role=employee_role,
                    status=CompanyMember.STATUS_ACTIVE,
                    is_active=True,
                    joined_at=timezone.now(),
                )
            elif not existing_member.is_active or existing_member.status != CompanyMember.STATUS_ACTIVE:
                existing_member.is_active = True
                existing_member.status = CompanyMember.STATUS_ACTIVE
                existing_member.save(update_fields=["is_active", "status", "update_at"])

        # Create Initial Employment Contract if base salary is specified
        base_salary = data.get("base_salary")
        if base_salary and float(base_salary) > 0:
            contract_number = f"HD-{employee_code}-01"
            contract_type = "PROBATION" if initial_status == "PROBATION" else "FIXED_TERM"
            EmploymentContract.objects.create(
                employee=employee,
                contract_number=contract_number,
                contract_type=contract_type,
                start_date=join_date,
                end_date=probation_end_date,
                base_salary=base_salary,
                allowance=data.get("allowance", 0),
                status="ACTIVE",
                notes=f"Hợp đồng khởi tạo từ tiếp nhận ứng viên tuyển dụng #{activity.id if activity else 'direct'}",
            )

        # Update Recruitment Application Status to HIRED
        if activity:
            activity.status = var_sys.ApplicationStatus.HIRED
            activity.save(update_fields=["status", "update_at"])

        logger.info(
            "Successfully onboarded candidate %s as Employee %s (%s) for company %s",
            email,
            employee.id,
            employee_code,
            company.company_name,
        )

        return employee, True
