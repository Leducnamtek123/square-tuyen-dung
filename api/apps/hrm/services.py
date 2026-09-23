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
    EmployeeDocument,
    EmployeeCareerHistory,
    EmployeeOnboardingProcess,
    OnboardingTaskItem,
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

        # Initialize Onboarding Process & Standard Checklist Tasks
        try:
            offer_letter = getattr(activity, 'offer_letter', None) if activity else None
            initialize_onboarding_process(
                employee=employee,
                offer_letter=offer_letter,
                application=activity,
            )
        except Exception as exc:
            logger.warning("Failed to initialize onboarding process for Employee %s: %s", employee.id, exc)

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


# ==============================================================================
# ONBOARDING LIFECYCLE & STATE MACHINE SERVICES
# ==============================================================================

STANDARD_ONBOARDING_TASKS = [
    # Chặng 2: Hồ sơ số Pre-boarding
    {
        'stage': 'PREBOARDING_DOCS',
        'code': 'UPLOAD_ID_CARD',
        'title': 'Tải ảnh Căn cước công dân (CCCD 2 mặt)',
        'description': 'Tải ảnh chụp rõ nét mặt trước và mặt sau CCCD để làm thủ tục nhân sự',
        'assigned_role': 'CANDIDATE',
        'is_required': True,
        'order': 1,
    },
    {
        'stage': 'PREBOARDING_DOCS',
        'code': 'UPLOAD_DEGREE',
        'title': 'Tải ảnh Bằng tốt nghiệp / Chứng chỉ chuyên môn',
        'description': 'Bằng cấp cao nhất hoặc chứng chỉ nghiệp vụ theo yêu cầu công việc',
        'assigned_role': 'CANDIDATE',
        'is_required': False,
        'order': 2,
    },
    {
        'stage': 'PREBOARDING_DOCS',
        'code': 'BANK_ACCOUNT',
        'title': 'Cung cấp Số tài khoản Ngân hàng',
        'description': 'Thông tin tài khoản chính chủ để chi trả lương và các khoản phụ cấp',
        'assigned_role': 'CANDIDATE',
        'is_required': True,
        'order': 3,
    },
    {
        'stage': 'PREBOARDING_DOCS',
        'code': 'TAX_INFO',
        'title': 'Cung cấp Mã số thuế & Giảm trừ gia cảnh',
        'description': 'Mã số thuế thu nhập cá nhân và hồ sơ người phụ thuộc (nếu có)',
        'assigned_role': 'CANDIDATE',
        'is_required': False,
        'order': 4,
    },
    # Chặng 3: Chuẩn bị nội bộ
    {
        'stage': 'INTERNAL_PREP',
        'code': 'PROVISION_EMAIL',
        'title': 'Cấp tài khoản Email Doanh nghiệp',
        'description': 'Khởi tạo hòm thư điện tử @company.com cho nhân sự mới',
        'assigned_role': 'IT',
        'is_required': True,
        'order': 5,
    },
    {
        'stage': 'INTERNAL_PREP',
        'code': 'PROVISION_HARDWARE',
        'title': 'Chuẩn bị Máy tính & Chỗ ngồi làm việc',
        'description': 'Bàn giao laptop/máy bàn, màn hình phụ, bàn ghế và văn phòng phẩm',
        'assigned_role': 'IT',
        'is_required': True,
        'order': 6,
    },
    {
        'stage': 'INTERNAL_PREP',
        'code': 'ENROLL_BIOMETRIC',
        'title': 'Đăng ký Mã chấm công Sinh trắc học',
        'description': 'Lấy dấu vân tay / khuôn mặt và gán mã ID trên máy chấm công chi nhánh',
        'assigned_role': 'HR',
        'is_required': True,
        'order': 7,
    },
    # Chặng 4: Ngày đầu nhận việc (Day 1)
    {
        'stage': 'DAY_ONE_WELCOME',
        'code': 'CONFIRM_ATTENDANCE',
        'title': 'Xác nhận có mặt ngày đầu nhận việc',
        'description': 'Xác nhận nhân viên đã có mặt thực tế tại văn phòng',
        'assigned_role': 'HR',
        'is_required': True,
        'order': 8,
    },
    {
        'stage': 'DAY_ONE_WELCOME',
        'code': 'SIGN_LABOR_CONTRACT',
        'title': 'Ký kết Hợp đồng Lao động Thử việc',
        'description': 'Hoàn tất ký hợp đồng thử việc giữa đại diện công ty và nhân sự mới',
        'assigned_role': 'HR',
        'is_required': True,
        'order': 9,
    },
    {
        'stage': 'DAY_ONE_WELCOME',
        'code': 'HANDOVER_ASSETS',
        'title': 'Ký Biên bản bàn giao tài sản',
        'description': 'Xác nhận ký biên bản tiếp nhận trang thiết bị làm việc',
        'assigned_role': 'HR',
        'is_required': False,
        'order': 10,
    },
    # Chặng 5: Đánh giá thử việc
    {
        'stage': 'PROBATION_EVALUATION',
        'code': 'CHECKIN_30_DAYS',
        'title': 'Trao đổi đánh giá tiến độ sau 30 ngày',
        'description': 'Quản lý trực tiếp gặp gỡ lắng nghe và định hướng sau 1 tháng làm việc',
        'assigned_role': 'MANAGER',
        'is_required': False,
        'order': 11,
    },
    {
        'stage': 'PROBATION_EVALUATION',
        'code': 'FINAL_PROBATION_REVIEW',
        'title': 'Đánh giá tổng kết Thử việc (60 ngày)',
        'description': 'Đánh giá toàn diện năng lực và quyết định ký hợp đồng chính thức',
        'assigned_role': 'HR',
        'is_required': True,
        'order': 12,
    },
]


def initialize_onboarding_process(
    employee: Employee,
    offer_letter=None,
    application=None,
) -> EmployeeOnboardingProcess:
    """
    Idempotent initialization of the Onboarding process and standard tasks
    for an employee.
    """
    target_start = employee.join_date
    if offer_letter and getattr(offer_letter, 'start_date', None):
        target_start = offer_letter.start_date

    probation_end = employee.probation_end_date
    if not probation_end and target_start:
        probation_end = target_start + timedelta(days=60)

    process, created = EmployeeOnboardingProcess.objects.get_or_create(
        employee=employee,
        defaults={
            'company': employee.company,
            'offer_letter': offer_letter,
            'application': application,
            'stage': 'PREBOARDING_DOCS',
            'target_start_date': target_start,
            'probation_end_date': probation_end,
            'progress_percent': 0,
        }
    )

    if not created:
        if offer_letter and not process.offer_letter:
            process.offer_letter = offer_letter
        if application and not process.application:
            process.application = application
        if target_start and not process.target_start_date:
            process.target_start_date = target_start
        if probation_end and not process.probation_end_date:
            process.probation_end_date = probation_end
        process.save()

    # Generate standard tasks if none exist
    existing_codes = set(process.tasks.values_list('code', flat=True))
    new_tasks = []
    for item in STANDARD_ONBOARDING_TASKS:
        if item['code'] not in existing_codes:
            new_tasks.append(
                OnboardingTaskItem(
                    process=process,
                    stage=item['stage'],
                    code=item['code'],
                    title=item['title'],
                    description=item['description'],
                    assigned_role=item['assigned_role'],
                    is_required=item['is_required'],
                    order=item['order'],
                )
            )

    if new_tasks:
        OnboardingTaskItem.objects.bulk_create(new_tasks)

    process.recalculate_progress()
    return process


def approve_preboarding_document(
    task_id: int,
    actor: User,
    file_url: Optional[str] = None,
    document_type: str = 'IDENTITY_CARD',
    name: Optional[str] = None,
) -> OnboardingTaskItem:
    """
    HR approves a preboarding document uploaded by candidate.
    Creates or links an EmployeeDocument and recalculates process progress.
    Advances to INTERNAL_PREP if all required preboarding tasks are done.
    """
    task = OnboardingTaskItem.objects.select_related('process', 'process__employee', 'process__company').filter(id=task_id).first()
    if not task:
        raise ValidationError({'task_id': ['Nhiệm vụ không tồn tại.']})

    process = task.process
    employee = process.employee
    company = process.company

    if file_url:
        doc = EmployeeDocument.objects.create(
            company=company,
            employee=employee,
            document_type=document_type,
            name=name or task.title,
            file_url=file_url,
        )
        task.document = doc

    task.is_completed = True
    task.completed_at = timezone.now()
    task.completed_by = actor
    task.rejection_note = ""
    task.save(update_fields=['is_completed', 'completed_at', 'completed_by', 'document', 'rejection_note', 'update_at'])

    # Check if all required tasks in PREBOARDING_DOCS are completed
    uncompleted_required = process.tasks.filter(
        stage='PREBOARDING_DOCS',
        is_required=True,
        is_completed=False,
    ).exists()

    if not uncompleted_required and process.stage == 'PREBOARDING_DOCS':
        process.stage = 'INTERNAL_PREP'
        process.save(update_fields=['stage', 'update_at'])

    process.recalculate_progress()
    return task


def reject_preboarding_document(
    task_id: int,
    reason: str,
    actor: User,
) -> OnboardingTaskItem:
    """
    HR requests candidate to re-upload a document with a specific rejection note.
    """
    task = OnboardingTaskItem.objects.select_related('process').filter(id=task_id).first()
    if not task:
        raise ValidationError({'task_id': ['Nhiệm vụ không tồn tại.']})

    task.is_completed = False
    task.rejection_note = reason.strip() if reason else "Hồ sơ chưa đạt yêu cầu, vui lòng nộp lại."
    task.save(update_fields=['is_completed', 'rejection_note', 'update_at'])

    process = task.process
    if process.stage == 'INTERNAL_PREP':
        process.stage = 'PREBOARDING_DOCS'
        process.save(update_fields=['stage', 'update_at'])

    process.recalculate_progress()
    return task


def complete_task_item(
    task_id: int,
    actor: User,
    note: Optional[str] = None,
) -> OnboardingTaskItem:
    """
    Marks a generic onboarding task completed.
    """
    task = OnboardingTaskItem.objects.select_related('process').filter(id=task_id).first()
    if not task:
        raise ValidationError({'task_id': ['Nhiệm vụ không tồn tại.']})

    task.is_completed = True
    task.completed_at = timezone.now()
    task.completed_by = actor
    task.save(update_fields=['is_completed', 'completed_at', 'completed_by', 'update_at'])

    task.process.recalculate_progress()
    return task


def confirm_day_one_attendance(
    process_id: int,
    actor: User,
) -> EmployeeOnboardingProcess:
    """
    Confirms candidate's first day at office:
    - Sets actual_start_date = today
    - Activates employment contract
    - Moves stage to PROBATION_EVALUATION
    - Records EmployeeCareerHistory (ONBOARDING)
    """
    process = EmployeeOnboardingProcess.objects.select_related('employee', 'company').filter(id=process_id).first()
    if not process:
        raise ValidationError({'process_id': ['Quy trình Onboarding không tồn tại.']})

    today = timezone.now().date()
    process.actual_start_date = today
    process.stage = 'DAY_ONE_WELCOME'

    # Complete Day 1 attendance task
    day_one_task = process.tasks.filter(code='CONFIRM_ATTENDANCE').first()
    if day_one_task:
        day_one_task.is_completed = True
        day_one_task.completed_at = timezone.now()
        day_one_task.completed_by = actor
        day_one_task.save(update_fields=['is_completed', 'completed_at', 'completed_by', 'update_at'])

    # Activate contract if any
    contract = process.employee.contracts.filter(status__in=['ACTIVE', 'EXPIRED']).first() or process.employee.contracts.first()
    if contract and contract.status != 'ACTIVE':
        contract.status = 'ACTIVE'
        contract.save(update_fields=['status', 'update_at'])

    # Transition to PROBATION_EVALUATION
    process.stage = 'PROBATION_EVALUATION'
    process.save(update_fields=['actual_start_date', 'stage', 'update_at'])
    process.recalculate_progress()

    # Record career history
    EmployeeCareerHistory.objects.create(
        company=process.company,
        employee=process.employee,
        effective_date=today,
        event_type='ONBOARDING',
        new_department=process.employee.department,
        new_designation=process.employee.designation,
        new_salary=contract.base_salary if contract else None,
        note='Nhân viên chính thức có mặt nhận việc và bắt đầu giai đoạn thử việc.',
    )

    return process


def submit_probation_evaluation(
    process_id: int,
    result: str,
    notes: str,
    actor: User,
    extension_days: int = 30,
) -> EmployeeOnboardingProcess:
    """
    Evaluates probation period:
    - PASSED: Employee becomes ACTIVE, stage COMPLETED, career history recorded.
    - EXTENDED: Extends probation end date.
    - FAILED: Employee TERMINATED, stage CANCELLED.
    """
    process = EmployeeOnboardingProcess.objects.select_related('employee', 'company').filter(id=process_id).first()
    if not process:
        raise ValidationError({'process_id': ['Quy trình Onboarding không tồn tại.']})

    employee = process.employee
    today = timezone.now().date()

    if result == 'PASSED':
        employee.status = 'ACTIVE'
        employee.save(update_fields=['status', 'update_at'])

        process.stage = 'COMPLETED'
        process.save(update_fields=['stage', 'update_at'])

        # Mark final review task complete
        review_task = process.tasks.filter(code='FINAL_PROBATION_REVIEW').first()
        if review_task:
            review_task.is_completed = True
            review_task.completed_at = timezone.now()
            review_task.completed_by = actor
            review_task.save(update_fields=['is_completed', 'completed_at', 'completed_by', 'update_at'])

        EmployeeCareerHistory.objects.create(
            company=process.company,
            employee=employee,
            effective_date=today,
            event_type='PROMOTION',
            new_department=employee.department,
            new_designation=employee.designation,
            note=f'Đạt đánh giá thử việc: Trở thành Nhân viên chính thức. Nhận xét: {notes}',
        )

    elif result == 'EXTENDED':
        current_end = process.probation_end_date or today
        new_end = current_end + timedelta(days=extension_days)
        process.probation_end_date = new_end
        process.save(update_fields=['probation_end_date', 'update_at'])

        employee.probation_end_date = new_end
        employee.save(update_fields=['probation_end_date', 'update_at'])

    elif result == 'FAILED':
        employee.status = 'TERMINATED'
        employee.save(update_fields=['status', 'update_at'])

        process.stage = 'CANCELLED'
        process.cancel_reason = f'Không đạt thử việc: {notes}'
        process.cancelled_at = timezone.now()
        process.cancelled_by = actor
        process.save(update_fields=['stage', 'cancel_reason', 'cancelled_at', 'cancelled_by', 'update_at'])

    process.recalculate_progress()
    return process


def cancel_onboarding_process(
    process_id: int,
    reason: str,
    actor: User,
) -> EmployeeOnboardingProcess:
    """
    Cancels an active onboarding process (e.g. ghost offer or early candidate withdrawal).
    """
    process = EmployeeOnboardingProcess.objects.select_related('employee').filter(id=process_id).first()
    if not process:
        raise ValidationError({'process_id': ['Quy trình Onboarding không tồn tại.']})

    process.stage = 'CANCELLED'
    process.cancel_reason = reason
    process.cancelled_at = timezone.now()
    process.cancelled_by = actor
    process.save(update_fields=['stage', 'cancel_reason', 'cancelled_at', 'cancelled_by', 'update_at'])

    employee = process.employee
    employee.status = 'RESIGNED'
    employee.save(update_fields=['status', 'update_at'])

    return process

