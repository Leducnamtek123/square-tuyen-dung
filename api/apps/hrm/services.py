import logging
import re
from datetime import date, datetime, time, timedelta
from decimal import Decimal
from typing import Any, Dict, Optional, Tuple

from django.db import transaction
from django.db.models import Q
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

        # Resolve user from data if not already bound via application or candidate profile
        if not user:
            u_id = data.get("user_id") or data.get("userId")
            if u_id:
                user = User.objects.filter(id=u_id).first()
            elif data.get("email"):
                user = User.objects.filter(email__iexact=data["email"].strip()).first()

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

            # Safe unlinking / verification:
            # If this User was already linked to an Employee anywhere else in the system (e.g. another company or older record),
            # safely unlink it to avoid MySQL 1062 IntegrityError on Employee.user OneToOneField.
            other_employees = Employee.objects.filter(user=user)
            if other_employees.exists():
                for old_emp in other_employees:
                    logger.warning(
                        "Unlinking User %s from Employee %s (company %s) before assigning to Employee in company %s.",
                        user.id, old_emp.id, old_emp.company_id, company.id
                    )
                    old_emp.user = None
                    old_emp.save(update_fields=["user", "update_at"])

        # Extract names, contact & demographic details
        first_name = data.get("first_name", "").strip()
        last_name = data.get("last_name", "").strip()
        source_name = ""
        if user and user.full_name:
            source_name = user.full_name.strip()
        elif activity and activity.full_name:
            source_name = activity.full_name.strip()

        if not first_name and source_name:
            # Standard Vietnamese naming: last word is first_name (Tên), preceding words are last_name (Họ & Đệm)
            parts = source_name.rsplit(" ", 1)
            if len(parts) == 2:
                last_name = last_name or parts[0]
                first_name = parts[1]
            else:
                first_name = parts[0]

        full_name = f"{last_name} {first_name}".strip() if (last_name and first_name) else (first_name or last_name or source_name)

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


def deduplicate_punch_logs(
    company: Company,
    target_date: Optional[date] = None,
    window_seconds: int = 120,
) -> int:
    """
    Deduplication Engine (Giai đoạn 2):
    Iterates through BiometricPunchLog records for a given company and date (or all records),
    identifies punch events within the window (default: 120 seconds / 2 minutes) from the same employee
    or biometric_id, and marks duplicate records with is_duplicate=True.
    Returns the total count of duplicate punches identified.
    """
    from apps.hrm.models import BiometricPunchLog

    q_filter = Q(company=company)
    if target_date:
        day_start = timezone.make_aware(datetime.combine(target_date, time.min))
        day_end = timezone.make_aware(datetime.combine(target_date, time.max))
        q_filter &= Q(punch_time__range=(day_start, day_end))

    all_logs = BiometricPunchLog.objects.filter(q_filter).order_by('punch_time')

    # Group by key: employee_id if present, else biometric_id
    grouped_logs: Dict[str, list] = {}
    for punch in all_logs:
        group_key = f"emp_{punch.employee_id}" if punch.employee_id else f"bio_{punch.biometric_id}"
        if group_key not in grouped_logs:
            grouped_logs[group_key] = []
        grouped_logs[group_key].append(punch)

    duplicate_count = 0

    with transaction.atomic():
        for group_key, logs in grouped_logs.items():
            last_valid_time: Optional[datetime] = None
            for p in logs:
                pt = p.punch_time
                if timezone.is_naive(pt):
                    pt = timezone.make_aware(pt)
                if last_valid_time is not None:
                    diff_seconds = abs((pt - last_valid_time).total_seconds())
                    if diff_seconds < window_seconds:
                        # Mark as duplicate
                        if not p.is_duplicate:
                            p.is_duplicate = True
                            p.save(update_fields=['is_duplicate', 'update_at'])
                        duplicate_count += 1
                        continue

                # Valid distinct punch event
                if p.is_duplicate:
                    p.is_duplicate = False
                    p.save(update_fields=['is_duplicate', 'update_at'])
                last_valid_time = pt

    logger.info(
        "Company %s punch log deduplication complete: %s duplicates flagged.",
        company.id,
        duplicate_count,
    )
    return duplicate_count


def mark_if_duplicate_on_punch(punch_log, window_seconds: int = 120) -> bool:
    """
    Real-time Deduplication Check:
    Checks if an existing valid punch exists within the deduplication window
    for the same employee or biometric ID. If found, flags the new punch as is_duplicate=True.
    """
    from apps.hrm.models import BiometricPunchLog

    punch_time = punch_log.punch_time
    if timezone.is_naive(punch_time):
        punch_time = timezone.make_aware(punch_time)
        punch_log.punch_time = punch_time

    time_start = punch_time - timedelta(seconds=window_seconds)
    time_end = punch_time + timedelta(seconds=window_seconds)

    q_filter = Q(company_id=punch_log.company_id, is_duplicate=False, punch_time__range=(time_start, time_end))
    if punch_log.id:
        q_filter &= ~Q(id=punch_log.id)

    if punch_log.employee_id:
        q_filter &= (Q(employee_id=punch_log.employee_id) | Q(biometric_id=punch_log.biometric_id))
    else:
        q_filter &= Q(biometric_id=punch_log.biometric_id)

    exists = BiometricPunchLog.objects.filter(q_filter).exists()
    if exists:
        punch_log.is_duplicate = True
        if punch_log.id:
            punch_log.save(update_fields=['is_duplicate', 'update_at'])
        return True

    return False


def process_punch_logs_for_date(company: Company, target_date: date) -> int:
    """
    Core Timecard Calculation Engine (Enhanced for Overnight Shifts & Anomalies):
    Processes valid (non-duplicate) biometric punch logs for a given company and date,
    matches with work shifts (including overnight shifts across midnight), applies grace periods,
    calculates late/early minutes, effective work hours, identifies anomalies (MISSED_IN, MISSED_OUT),
    and updates/creates AttendanceRecord records.
    """
    from apps.hrm.models import Employee, ShiftAssignment, WorkShift, BiometricPunchLog, AttendanceRecord

    active_employees = Employee.objects.filter(
        company=company,
        status__in=['ACTIVE', 'PROBATION']
    )

    updated_count = 0

    for emp in active_employees:
        # Check if record is locked or manually adjusted
        existing_record = AttendanceRecord.objects.filter(employee=emp, date=target_date).first()
        if existing_record and (existing_record.is_locked or existing_record.is_manually_adjusted):
            continue

        # Get shift assignment
        assignment = ShiftAssignment.objects.filter(employee=emp, date=target_date).first()
        if assignment and assignment.is_off_day:
            continue
        shift = assignment.shift if assignment else None

        # Build query for valid (non-duplicate) punch logs
        bio_id = getattr(emp, 'biometric_id', None) or getattr(emp, 'employee_code', None)
        emp_bio_q = (Q(employee=emp) | Q(biometric_id=bio_id)) if bio_id else Q(employee=emp)

        # Handle overnight shift vs standard day shift
        is_overnight = shift.is_overnight if shift else False
        if is_overnight:
            # For overnight shift starting on target_date (e.g. 22:00 to 06:00 next day):
            # Window starts at target_date 18:00 and ends at (target_date + 1) 12:00
            next_date = target_date + timedelta(days=1)
            window_start = timezone.make_aware(datetime.combine(target_date, time(18, 0, 0)))
            window_end = timezone.make_aware(datetime.combine(next_date, time(12, 0, 0)))
            q_filter = Q(company=company, is_duplicate=False, punch_time__range=(window_start, window_end)) & emp_bio_q
        else:
            day_start = timezone.make_aware(datetime.combine(target_date, time.min))
            day_end = timezone.make_aware(datetime.combine(target_date, time.max))
            q_filter = Q(company=company, is_duplicate=False, punch_time__range=(day_start, day_end)) & emp_bio_q

        punches = BiometricPunchLog.objects.filter(q_filter).order_by('punch_time')

        if not punches.exists():
            continue

        first_punch = punches.first()
        last_punch = punches.last()

        # Handle local timezone time conversion cleanly and safely
        fp_time = first_punch.punch_time
        if timezone.is_naive(fp_time):
            fp_time = timezone.make_aware(fp_time)
        local_first_dt = timezone.localtime(fp_time)

        lp_time = last_punch.punch_time
        if timezone.is_naive(lp_time):
            lp_time = timezone.make_aware(lp_time)
        local_last_dt = timezone.localtime(lp_time)

        check_in_time = local_first_dt.time()
        check_out_time = local_last_dt.time() if punches.count() > 1 else None

        late_minutes = 0
        early_minutes = 0
        working_hours = Decimal("0.00")
        record_status = 'PRESENT'
        anomaly_note = ""

        scheduled_in = shift.start_time if shift else None
        scheduled_out = shift.end_time if shift else None

        # Detect Anomaly: Single punch
        if punches.count() == 1:
            if shift:
                if is_overnight:
                    # Ca đêm: Nếu quẹt buổi tối (>= 18h hoặc >= giờ bắt đầu ca) là quẹt vào (MISSED_OUT)
                    # Nếu quẹt buổi sáng (< 12h) là quẹt ra (MISSED_IN)
                    if check_in_time >= time(18, 0) or check_in_time >= shift.start_time:
                        anomaly_note = "[Ngoại lệ] Thiếu quẹt ra (MISSED_OUT)"
                    else:
                        check_out_time = check_in_time
                        check_in_time = None
                        anomaly_note = "[Ngoại lệ] Thiếu quẹt vào (MISSED_IN)"
                else:
                    # Ca ngày: Nếu quẹt sau giờ nghỉ trưa thì là quẹt ra (MISSED_IN), ngược lại là quẹt vào (MISSED_OUT)
                    midpoint = shift.break_start or time(12, 0)
                    if check_in_time > midpoint:
                        check_out_time = check_in_time
                        check_in_time = None
                        anomaly_note = "[Ngoại lệ] Thiếu quẹt vào (MISSED_IN)"
                    else:
                        anomaly_note = "[Ngoại lệ] Thiếu quẹt ra (MISSED_OUT)"
            else:
                anomaly_note = "[Ngoại lệ] Chỉ có 1 lần quẹt trong ngày"

        if shift:
            # Late calculation (consider overnight boundary)
            if check_in_time and check_in_time > shift.start_time:
                diff_sec = (datetime.combine(target_date, check_in_time) - datetime.combine(target_date, shift.start_time)).total_seconds()
                diff_min = int(diff_sec // 60)
                if diff_min > shift.grace_period_late_minutes:
                    late_minutes = diff_min

            # Early leave calculation
            if check_out_time:
                out_date = target_date + timedelta(days=1) if (is_overnight and check_out_time < shift.start_time) else target_date
                sched_out_date = target_date + timedelta(days=1) if is_overnight else target_date
                out_dt = datetime.combine(out_date, check_out_time)
                sched_out_dt = datetime.combine(sched_out_date, shift.end_time)

                if out_dt < sched_out_dt:
                    diff_sec = (sched_out_dt - out_dt).total_seconds()
                    diff_min = int(diff_sec // 60)
                    if diff_min > shift.grace_period_early_minutes:
                        early_minutes = diff_min

            # Effective working hours calculation using grace period logic
            if check_in_time and check_out_time:
                effective_start_time = shift.start_time if late_minutes == 0 else check_in_time
                effective_end_time = shift.end_time if (early_minutes == 0 and check_out_time >= shift.end_time) else check_out_time

                start_date = target_date
                end_date = target_date + timedelta(days=1) if (is_overnight and effective_end_time < shift.start_time) else target_date

                start_dt = datetime.combine(start_date, effective_start_time)
                end_dt = datetime.combine(end_date, effective_end_time)
                raw_seconds = (end_dt - start_dt).total_seconds()

                # Deduct break time if worked spans break period
                if shift.break_start and shift.break_end and not is_overnight:
                    if effective_start_time <= shift.break_start and effective_end_time >= shift.break_end:
                        break_seconds = (datetime.combine(target_date, shift.break_end) - datetime.combine(target_date, shift.break_start)).total_seconds()
                        raw_seconds -= max(0.0, break_seconds)

                earned_hours = max(0.0, raw_seconds / 3600.0)
                working_hours = min(Decimal(f"{earned_hours:.2f}"), shift.working_hours)
            else:
                working_hours = Decimal("0.00")

            if late_minutes > 0 and early_minutes > 0:
                record_status = 'LATE'
            elif late_minutes > 0:
                record_status = 'LATE'
            elif early_minutes > 0:
                record_status = 'EARLY_LEAVE'
            elif working_hours > 0:
                record_status = 'PRESENT'
            elif check_in_time or check_out_time:
                record_status = 'PRESENT'
            else:
                record_status = 'ABSENT'

        notes_content = existing_record.notes if (existing_record and existing_record.notes) else ""
        if anomaly_note and anomaly_note not in notes_content:
            notes_content = f"{notes_content}; {anomaly_note}".strip("; ")

        AttendanceRecord.objects.update_or_create(
            employee=emp,
            date=target_date,
            defaults={
                'shift': shift,
                'check_in': check_in_time,
                'check_out': check_out_time,
                'scheduled_in': scheduled_in,
                'scheduled_out': scheduled_out,
                'late_minutes': late_minutes,
                'early_minutes': early_minutes,
                'working_hours': working_hours,
                'effective_work_hours': working_hours,
                'status': record_status,
                'notes': notes_content,
            }
        )
        updated_count += 1

    return updated_count
