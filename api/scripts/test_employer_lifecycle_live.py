"""
Live End-to-End Test Runner for Employer Lifecycle (Vòng đời Nhà Tuyển Dụng).
Covers 11 comprehensive lifecycle stages:
  0. Employer Registration & Company Profile Creation (Company)
  1. Company Team Management & RBAC Roles (CompanyMember, CompanyRole)
  2. Business Legal Verification & Approval (CompanyVerification)
  3. Job Posting, Skill Tagging & Auto Pipeline (JobPost)
  4. AI Interview Question Bank & Voice Profile Configuration (Question, JobVoiceProfileGrant)
  5. Active Candidate Sourcing, Resume View & Save (ResumeSaved, ResumeViewed)
  6. Application Tracking System (ATS) & AI Resume Deep Fit Scoring (JobPostActivity)
  7. LiveKit Interview Scheduling & HR/Observer Token Issuance (InterviewSession)
  8. HR Interview Evaluation & Hiring Decision (InterviewEvaluation, HIRED status)
  9. Onboarding Hired Candidate into Native HRM (CandidateToEmployeeConverter)
  10. Employer Recruitment Dashboard Statistics (CompanyService.get_company_stats)
  11. Multi-Tenancy Security & Data Isolation Audit (Cross-Tenant Verification)
"""

import os
import sys
import uuid
import datetime
from decimal import Decimal
from unittest.mock import patch

# Setup UTF-8 encoding for Windows console
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except AttributeError:
        pass

# Django Environment Bootstrap
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BASE_DIR)
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings_test")

import django
django.setup()

from django.conf import settings
settings.ALLOWED_HOSTS = ["*", "testserver", "localhost", "127.0.0.1"]

# Bypass Elasticsearch sync during test
try:
    from django_elasticsearch_dsl.registries import registry
    registry.update = lambda *a, **kw: None
    registry.delete = lambda *a, **kw: None
except ImportError:
    pass

from django.core.management import call_command
call_command("migrate", verbosity=0)

from django.db import transaction
from django.utils import timezone
from rest_framework.test import APIClient

from apps.accounts.models import User
from apps.locations.models import City, Location
from common.models import Career
from apps.profiles.models import (
    Company, CompanyMember, CompanyRole, CompanyVerification,
    JobSeekerProfile, Resume, AdvancedSkill, ExperienceDetail,
    EducationDetail, Certificate, LanguageSkill, ResumeSaved, ResumeViewed,
    CompanyFollowed
)
from apps.profiles.services import (
    ResumeService, CompanyService, ensure_company_system_roles
)
from apps.jobs.models import JobPost, JobPostActivity
from apps.jobs.services import JobActivityService
from apps.jobs.ai_scoring_service import score_job_application
from apps.interviews.models import InterviewSession, InterviewEvaluation, Question, VoiceProfile, VoiceProfileGrant
from apps.interviews.services import (
    create_livekit_participant_token,
    create_observer_livekit_token,
    create_hr_presence_livekit_token,
    update_interview_status,
)
from apps.hrm.models import Department, Designation, Employee, EmploymentContract
from apps.hrm.services import CandidateToEmployeeConverter, generate_next_employee_code
from shared.configs import variable_system as var_sys


class Colors:
    GREEN = "\033[92m"
    RED = "\033[91m"
    CYAN = "\033[96m"
    YELLOW = "\033[93m"
    BOLD = "\033[1m"
    RESET = "\033[0m"


def log_step(step_num: int, title: str):
    print(f"\n{Colors.BOLD}{Colors.CYAN}[BƯỚC {step_num}] {title}{Colors.RESET}")


def log_pass(msg: str):
    print(f"  {Colors.GREEN}✔ [PASS]{Colors.RESET} {msg}")


def log_fail(msg: str):
    print(f"  {Colors.RED}✘ [FAIL]{Colors.RESET} {msg}")


def run_live_employer_lifecycle_test():
    print("=" * 70)
    print(f"{Colors.BOLD}{Colors.CYAN}  BẮT ĐẦU CHẠY KIỂM THỬ THỰC TẾ: VÒNG ĐỜI NHÀ TUYỂN DỤNG (EMPLOYER E2E){Colors.RESET}")
    print("=" * 70)

    run_id = uuid.uuid4().hex[:6]
    passed_count = 0
    total_steps = 12

    try:
        # -------------------------------------------------------------
        # GIAI ĐOẠN 0: Đăng Ký NTD & Khởi Tạo Hồ Sơ Công Ty (Company)
        # -------------------------------------------------------------
        log_step(0, "Đăng ký Nhà Tuyển Dụng & Khởi tạo Hồ Sơ Doanh Nghiệp (Company)")
        employer_user = User.objects.create_user(
            email=f"employer_{run_id}@squaregroup.vn",
            full_name="Trần Hoàng Nam (Giám Đốc Tuyển Dụng)",
            password="SecureEmployerPassword123!",
            role=var_sys.EMPLOYER,
        )
        assert employer_user.id is not None
        assert employer_user.role_name == var_sys.EMPLOYER

        city, _ = City.objects.get_or_create(name="Hồ Chí Minh")
        location = Location.objects.create(city=city, address=f"Tòa nhà Square Tower, Quận 1, TP.HCM")

        company = Company.objects.create(
            user=employer_user,
            company_name=f"Square Global Tech Corp {run_id}",
            company_email=f"contact_{run_id}@squaregroup.vn",
            company_phone=f"0988{run_id[:5]}",
            tax_code=f"MST-EMP-{run_id}",
            website_url="https://squaregroup.vn",
            field_operation="Công nghệ thông tin & Trí tuệ nhân tạo",
            employee_size=4,
            location=location,
            is_verified=False,
            description="Tập đoàn phát triển giải pháp AI và phần mềm tuyển dụng thông minh hàng đầu.",
        )
        assert company.id is not None
        assert company.user == employer_user
        assert company.is_verified is False
        log_pass(f"Tạo tài khoản NTD '{employer_user.email}' và Hồ sơ Công ty '{company.company_name}' (ID={company.id}) thành công.")
        passed_count += 1

        # -------------------------------------------------------------
        # GIAI ĐOẠN 1: Phân Quyền Thành Viên & Đội Ngũ Tuyển Dụng (RBAC)
        # -------------------------------------------------------------
        log_step(1, "Khởi tạo Vai trò Hệ thống & Phân quyền Thành viên Tuyển dụng (CompanyRole, CompanyMember)")
        roles_dict = ensure_company_system_roles(company)
        assert "owner" in roles_dict or "admin" in roles_dict or "recruiter" in roles_dict
        log_pass(f"Đã tự động khởi tạo {len(roles_dict)} vai trò hệ thống (Owner, Admin, Recruiter, Interviewer...).")

        # Create custom role
        custom_role = CompanyRole.objects.create(
            company=company,
            code=f"lead_recruiter_{run_id}",
            name="Trưởng Nhóm Tuyển Dụng Kỹ Thuật",
            description="Quản lý tin tuyển dụng và tổ chức phỏng vấn chuyên sâu",
            permissions=["jobs.create", "jobs.edit", "jobs.publish", "interviews.manage", "candidates.view"],
            is_system=False,
            is_active=True,
        )
        assert custom_role.id is not None

        # Add Recruiter Member
        recruiter_user = User.objects.create_user(
            email=f"recruiter_{run_id}@squaregroup.vn",
            full_name="Lê Thị Mai Hương (Tech Recruiter)",
            password="RecruiterPassword123!",
            role=var_sys.EMPLOYER,
        )
        member = CompanyMember.objects.create(
            company=company,
            user=recruiter_user,
            role=custom_role,
            status=CompanyMember.STATUS_ACTIVE,
            is_active=True,
            invited_by=employer_user,
            joined_at=timezone.now(),
        )
        assert member.id is not None
        assert member.company == company
        assert member.user == recruiter_user
        assert member.role == custom_role
        log_pass(f"Thành viên Recruiter '{recruiter_user.email}' đã được thêm vào Công ty với vai trò '{custom_role.name}'.")
        passed_count += 1

        # -------------------------------------------------------------
        # GIAI ĐOẠN 2: Xác Thực Pháp Lý Doanh Nghiệp (CompanyVerification)
        # -------------------------------------------------------------
        log_step(2, "Xác thực Pháp lý Doanh nghiệp (CompanyVerification) & Phê duyệt của Admin")
        verif_req = CompanyVerification.objects.create(
            company=company,
            submitted_by=employer_user,
            legal_company_name=company.company_name,
            tax_code=company.tax_code,
            business_license="GPKD-SQ-2026-08-999.PDF",
            representative_name="Trần Hoàng Nam",
            contact_phone=company.company_phone,
            contact_email=company.company_email,
            status=CompanyVerification.STATUS_PENDING,
        )
        assert verif_req.status == CompanyVerification.STATUS_PENDING
        log_pass(f"Gửi hồ sơ xác thực pháp lý GPKD cho công ty: Mã số thuế={verif_req.tax_code}, Trạng thái='{verif_req.status}'.")

        # Admin reviews and approves
        admin_user = User.objects.create_user(
            email=f"admin_{run_id}@squaregroup.vn",
            full_name="Quản Trị Viên Hệ Thống",
            password="AdminPassword123!",
            role=var_sys.ADMIN,
        )
        verif_req.status = CompanyVerification.STATUS_APPROVED
        verif_req.reviewed_by = admin_user
        verif_req.reviewed_at = timezone.now()
        verif_req.admin_note = "Hồ sơ pháp lý đầy đủ, GPKD hợp lệ."
        verif_req.save()

        company.is_verified = True
        company.save(update_fields=["is_verified", "update_at"])
        company.refresh_from_db()
        assert company.is_verified is True
        log_pass("Admin đã phê duyệt xác thực thành công. Doanh nghiệp đạt huy hiệu 'Đã xác thực' (is_verified=True).")
        passed_count += 1

        # -------------------------------------------------------------
        # GIAI ĐOẠN 3: Đăng Tin Tuyển Dụng & Cấu Hình Auto Pipeline (JobPost)
        # -------------------------------------------------------------
        log_step(3, "Đăng Tin Tuyển Dụng Mới & Cấu Hình Phễu Tự Động (JobPost)")
        career, _ = Career.objects.get_or_create(name="Công nghệ thông tin")
        job_post = JobPost.objects.create(
            company=company,
            user=employer_user,
            job_name="Principal AI Architect & Distributed Systems",
            career=career,
            location=location,
            quantity=3,
            position=1,
            type_of_workplace=1,
            experience=8,
            academic_level=2,
            job_type=1,
            salary_min=60000000,
            salary_max=120000000,
            deadline=timezone.now().date() + datetime.timedelta(days=45),
            contact_person_name="Trần Hoàng Nam",
            contact_person_phone="0988-425-094",
            contact_person_email="recruitment@squaregroup.vn",
            job_description="Thiết kế kiến trúc hệ thống AI Agents phân tán chịu tải cao trên nền tảng LiveKit và Kubernetes.",
            job_requirement="Tối thiểu 5 năm kinh nghiệm Python, Django, WebRTC, High Availability và LLM fine-tuning.",
            benefits_enjoyed="Lương thưởng cạnh tranh từ 60M - 120M, thưởng dự án, bảo hiểm sức khỏe quốc tế cao cấp.",
            status=var_sys.JobPostStatus.APPROVED,
            is_hot=True,
            is_urgent=True,
        )
        assert job_post.id is not None
        assert job_post.status == var_sys.JobPostStatus.APPROVED
        assert job_post.company == company

        # Test deadline extension
        new_deadline = timezone.now().date() + datetime.timedelta(days=60)
        job_post.deadline = new_deadline
        job_post.save(update_fields=["deadline", "update_at"])
        job_post.refresh_from_db()
        assert job_post.deadline == new_deadline
        log_pass(f"Tin tuyển dụng ID={job_post.id} '{job_post.job_name}' đã tạo thành công và gia hạn đến {job_post.deadline}.")
        passed_count += 1

        # -------------------------------------------------------------
        # GIAI ĐOẠN 4: Ngân Hàng Câu Hỏi AI & Gán Voice Profile cho Job
        # -------------------------------------------------------------
        log_step(4, "Cấu hình Ngân hàng Câu hỏi Phỏng vấn AI & Gán Voice Profile cho Job Post")
        q_tech = Question.objects.create(
            company=company,
            text="Hãy phân tích kiến trúc Microservices và cách bạn tối ưu hóa độ trễ cho Live WebRTC Streaming?",
            category="technical",
            difficulty=3,
        )
        q_arch = Question.objects.create(
            company=company,
            text="Bạn giải quyết bài toán Eventual Consistency trong hệ thống phân tán đa vùng như thế nào?",
            category="situational",
            difficulty=3,
        )

        voice_prof = VoiceProfile.objects.create(
            name="Giọng Phỏng Vấn Viên Chuyên Nghiệp (Nam Miền Bắc)",
            voice_type=VoiceProfile.TYPE_PRESET,
            preset_engine="vieneu",
            preset_voice_id="onyx",
            language="vi",
            status=VoiceProfile.STATUS_READY,
            created_by=employer_user,
        )
        grant = VoiceProfileGrant.objects.create(
            company=company,
            job_post=job_post,
            profile=voice_prof,
            is_default=True,
            is_active=True,
            note="Giọng phỏng vấn kỹ thuật mặc định cho vị trí Principal AI Architect",
            granted_by=employer_user,
        )
        assert grant.id is not None
        assert grant.job_post == job_post
        assert grant.profile == voice_prof
        log_pass(f"Đã tạo 2 câu hỏi phỏng vấn chuẩn hóa và gán Voice Profile '{voice_prof.name}' cho JobPost #{job_post.id}.")
        passed_count += 1

        # -------------------------------------------------------------
        # GIAI ĐOẠN 5: Tìm Kiếm Săn Ứng Viên Chủ Động & Lưu/Xem CV
        # -------------------------------------------------------------
        log_step(5, "Tìm kiếm Săn Ứng viên Chủ động, Ghi nhận Xem CV & Lưu Hồ Sơ Quan Tâm")
        cand_user = User.objects.create_user(
            email=f"candidate_pro_{run_id}@gmail.com",
            full_name="Hoàng Đức Minh",
            password="CandidatePassword123!",
            role=var_sys.JOB_SEEKER,
        )
        cand_profile = JobSeekerProfile.objects.create(
            user=cand_user,
            phone="0912-345-678",
            is_seeking_job=True,
        )
        resume_pro = Resume.objects.create(
            user=cand_user,
            job_seeker_profile=cand_profile,
            career=career,
            city=city,
            title="Lead AI Architect & Distributed Systems Engineer",
            salary_min=70000000,
            salary_max=110000000,
            expected_salary=90000000,
            position=1,
            job_type=1,
            type_of_workplace=1,
            experience=8,
            academic_level=2,
            is_active=True,
            type=var_sys.CV_WEBSITE,
            skills_summary="Python, Django, FastAPI, LiveKit, WebSockets, Celery, Redis, Kubernetes, PostgreSQL",
            description="Chuyên gia kiến trúc hệ thống backend quy mô lớn và AI Pipelines.",
        )
        AdvancedSkill.objects.create(resume=resume_pro, name="Distributed Systems", level=5)
        AdvancedSkill.objects.create(resume=resume_pro, name="LiveKit WebRTC", level=5)
        AdvancedSkill.objects.create(resume=resume_pro, name="AI LLM Fine-Tuning", level=4)

        # Record resume view
        viewed_row = ResumeService.increment_resume_view(company, resume_pro)
        assert viewed_row.views >= 1
        log_pass(f"NTD mở xem CV #{resume_pro.id}: Ghi nhận lượt xem thành công (views={viewed_row.views}).")

        # Save resume to talent pool
        saved_status, save_msg = ResumeService.toggle_save_resume(company, resume_pro)
        assert saved_status is True
        assert ResumeSaved.objects.filter(company=company, resume=resume_pro).exists()
        log_pass(f"Lưu CV vào Talent Pool của Công ty thành công: '{save_msg}'.")
        passed_count += 1

        # -------------------------------------------------------------
        # GIAI ĐOẠN 6: Quản Trị Phễu Tuyển Dụng ATS & AI Deep Scoring
        # -------------------------------------------------------------
        log_step(6, "Tiếp nhận Đơn Ứng Tuyển, Chấm điểm AI Fit Score & Quản trị Phễu ATS")
        apply_data = {
            "job_post": job_post,
            "resume": resume_pro,
            "email": cand_user.email,
            "full_name": cand_user.full_name,
            "phone": "0912-345-678",
        }
        activity = JobActivityService.apply_to_job(cand_user, apply_data)
        assert activity.id is not None
        assert activity.job_post == job_post

        # Run AI Deep Scoring
        scoring_res = score_job_application(activity)
        assert "score" in scoring_res
        log_pass(f"Hồ sơ ứng viên nộp đơn đạt điểm tương thích AI: {scoring_res['score']}/100 điểm.")

        # Progress Recruitment Pipeline: PENDING -> CONTACTED -> TESTED -> INTERVIEWED
        activity = JobActivityService.change_application_status(activity, var_sys.ApplicationStatus.CONTACTED, notify=False)
        assert activity.status == var_sys.ApplicationStatus.CONTACTED

        activity = JobActivityService.change_application_status(activity, var_sys.ApplicationStatus.TESTED, notify=False)
        assert activity.status == var_sys.ApplicationStatus.TESTED

        activity = JobActivityService.change_application_status(activity, var_sys.ApplicationStatus.INTERVIEWED, notify=False)
        assert activity.status == var_sys.ApplicationStatus.INTERVIEWED
        log_pass("Quản lý phễu ATS chuyển trạng thái thành công: PENDING -> CONTACTED -> TESTED -> INTERVIEWED.")
        passed_count += 1

        # -------------------------------------------------------------
        # GIAI ĐOẠN 7: Lên Lịch Phỏng Vấn LiveKit & Cấp Token HR/Observer
        # -------------------------------------------------------------
        log_step(7, "Lên lịch phỏng vấn trực tuyến AI LiveKit & Cấp Token cho HR Interviewer / Observer")
        session = InterviewSession.objects.create(
            job_post=job_post,
            candidate=cand_user,
            created_by=employer_user,
            type="mixed",
            status="scheduled",
        )
        session.questions.add(q_tech, q_arch)

        class MockDRFRequest:
            def __init__(self, user):
                self.user = user
            def get_host(self): return "localhost:8000"
            def is_secure(self): return False

        # Generate Candidate Token
        cand_token_info = create_livekit_participant_token(session, MockDRFRequest(cand_user))
        assert "token" in cand_token_info
        log_pass(f"Cấp Token LiveKit cho Ứng viên: Phòng '{cand_token_info['room_name']}'.")

        # Generate HR Presence Token
        hr_token_info = create_hr_presence_livekit_token(session, MockDRFRequest(employer_user))
        assert "token" in hr_token_info
        assert hr_token_info["participant_identity"] == f"employer-{employer_user.id}"
        log_pass(f"Cấp Token LiveKit cho HR Interviewer: Identity='{hr_token_info['participant_identity']}'.")

        # Generate Observer Token
        observer_token_info = create_observer_livekit_token(session, MockDRFRequest(recruiter_user))
        assert "token" in observer_token_info
        assert observer_token_info["participant_identity"] == f"observer-{recruiter_user.id}"
        log_pass(f"Cấp Token LiveKit cho Quan sát viên (Observer): Identity='{observer_token_info['participant_identity']}'.")

        with patch("apps.interviews.tasks.end_interview_session.apply_async"), \
             patch("apps.interviews.tasks.finalize_disconnected_session.apply_async"), \
             patch("apps.interviews.services.broadcast_interview_event"), \
             patch("apps.interviews.livekit_service.LiveKitService.start_recording"):

            update_interview_status(session, "in_progress")
            session.refresh_from_db()
            assert session.status == "in_progress"

            # Test interrupted reconnection
            update_interview_status(session, "interrupted")
            session.refresh_from_db()
            reconnect_hr = create_hr_presence_livekit_token(session, MockDRFRequest(employer_user))
            assert "token" in reconnect_hr
            log_pass("HR phục hồi kết nối thành công vào phòng phỏng vấn khi trạng thái bị 'interrupted'.")
        passed_count += 1

        # -------------------------------------------------------------
        # GIAI ĐOẠN 8: Đánh Giá Phỏng Vấn & Quyết Định Tuyển Dụng (HIRED)
        # -------------------------------------------------------------
        log_step(8, "HR Hoàn tất Phỏng vấn, Nhập Form Đánh giá & Ra Quyết định Tuyển Dụng (HIRED)")
        with patch("apps.interviews.services.broadcast_interview_event"), \
             patch("apps.interviews.services.queue_ai_evaluation"):
            update_interview_status(session, "completed")
            session.refresh_from_db()
            assert session.status == "completed"

        evaluation = InterviewEvaluation.objects.create(
            interview=session,
            evaluator=employer_user,
            attitude_score=Decimal("9.5"),
            professional_score=Decimal("9.8"),
            overall_score=Decimal("9.65"),
            result="passed",
            proposed_salary=85000000,
            comments="Ứng viên có năng lực kiến trúc xuất sắc, tư duy hệ thống phân tán vững vàng, phù hợp tuyệt đối văn hóa công ty.",
        )
        assert evaluation.result == "passed"
        assert evaluation.overall_score == Decimal("9.65")
        log_pass(f"Hoàn thành phiếu đánh giá phỏng vấn: Kết quả '{evaluation.result}', Điểm chuyên môn: {evaluation.professional_score}/10, Mức lương đề xuất: {evaluation.proposed_salary:,.0f} VND.")

        # Update application status to HIRED
        activity = JobActivityService.change_application_status(activity, var_sys.ApplicationStatus.HIRED, notify=False)
        assert activity.status == var_sys.ApplicationStatus.HIRED
        log_pass("Chuyển trạng thái tuyển dụng ứng viên sang chính thức: HIRED.")
        passed_count += 1

        # -------------------------------------------------------------
        # GIAI ĐOẠN 9: Tiếp Nhận Trúng Tuyển Vào Native HRM
        # -------------------------------------------------------------
        log_step(9, "Tiếp nhận Ứng viên Trúng tuyển sang Hệ thống Native HRM (Onboarding)")
        dept = Department.objects.create(
            company=company,
            name="Khối Nghiên Cứu & Phát Triển AI",
            code=f"DEPT-AI-RD-{run_id}",
        )
        desig = Designation.objects.create(
            company=company,
            title="Principal AI Architect",
            code=f"PRIN-AI-{run_id}",
        )

        onboard_payload = {
            "job_application_id": activity.id,
            "department_id": dept.id,
            "designation_id": desig.id,
            "join_date": "2026-09-15",
            "probation_end_date": "2026-11-15",
            "base_salary": 85000000,
            "allowance": 10000000,
            "employment_type": "FULL_TIME",
            "status": "PROBATION",
        }

        employee, emp_created = CandidateToEmployeeConverter.convert(
            company=company,
            actor=employer_user,
            data=onboard_payload,
        )
        assert emp_created is True
        assert employee.company == company
        assert employee.user == cand_user
        assert employee.employee_code.startswith("SQ-EMP-")
        assert employee.first_name == "Minh"
        assert employee.last_name == "Hoàng Đức"
        assert employee.full_name == "Hoàng Đức Minh"

        contract = EmploymentContract.objects.filter(employee=employee).first()
        assert contract is not None
        assert contract.base_salary == 85000000
        assert contract.allowance == 10000000

        member_emp = CompanyMember.objects.filter(company=company, user=cand_user).first()
        assert member_emp is not None
        assert member_emp.role.code == "employee"
        log_pass(f"Chuyển đổi thành công Nhân viên mới: Mã='{employee.employee_code}', Tên='{employee.full_name}', Lương cơ bản={contract.base_salary:,.0f} VND, Phụ cấp={contract.allowance:,.0f} VND.")
        passed_count += 1

        # -------------------------------------------------------------
        # GIAI ĐOẠN 10: Thống Kê Tuyển Dụng & Báo Cáo Dashboard
        # -------------------------------------------------------------
        log_step(10, "Thống Kê Tuyển Dụng & Báo Cáo Dashboard Doanh Nghiệp (Company Statistics)")
        stats = CompanyService.get_company_stats(company)
        assert stats["total_jobs"] >= 1
        assert stats["total_applications"] >= 1
        assert stats["resumes_saved"] >= 1
        assert stats["resumes_viewed"] >= 1

        # Verify through REST API Client
        client = APIClient()
        client.force_authenticate(user=employer_user)
        res_stat = client.get(
            "/api/v1/job/web/statistics/employer/?type=general",
            HTTP_X_ACTIVE_COMPANY_ID=str(company.id),
        )
        assert res_stat.status_code == 200
        log_pass(f"Báo cáo thống kê Dashboard: Tin tuyển dụng={stats['total_jobs']}, Đơn ứng tuyển={stats['total_applications']}, CV đã lưu={stats['resumes_saved']}, CV đã xem={stats['resumes_viewed']}.")
        passed_count += 1

        # -------------------------------------------------------------
        # GIAI ĐOẠN 11: Kiểm Thử Bảo Mật Cô Lập Đa Doanh Nghiệp (Multi-Tenancy)
        # -------------------------------------------------------------
        log_step(11, "Kiểm Thử Bảo Mật Cô Lập Đa Doanh Nghiệp (Multi-Tenancy RBAC Data Isolation)")
        # Rival Company B
        rival_owner = User.objects.create_user(
            email=f"rival_{run_id}@othercompany.vn",
            full_name="Đại Diện Công Ty Đối Thủ",
            password="RivalPassword123!",
            role=var_sys.EMPLOYER,
        )
        rival_company = Company.objects.create(
            user=rival_owner,
            company_name=f"Rival Corp {run_id}",
            tax_code=f"MST-RIVAL-{run_id}",
            is_verified=True,
        )

        client_rival = APIClient()
        client_rival.force_authenticate(user=rival_owner)

        # Rival cannot see Company A's employees
        res_rival_emp = client_rival.get(
            "/api/v1/native-hrm/employees/",
            HTTP_X_ACTIVE_COMPANY_ID=str(rival_company.id),
        )
        assert res_rival_emp.status_code == 200
        rival_emp_list = res_rival_emp.data if isinstance(res_rival_emp.data, list) else res_rival_emp.data.get("results", [])
        assert len(rival_emp_list) == 0, "Công ty đối thủ không được xem danh sách nhân sự của Công ty A"
        log_pass("Công ty đối thủ bị cô lập hoàn toàn khỏi dữ liệu nhân sự nội bộ HRM của Công ty A.")

        # Rival cannot access or delete Company A's job post activities
        res_rival_act = client_rival.get(
            "/api/v1/job/web/employer-job-posts-activity/",
            HTTP_X_ACTIVE_COMPANY_ID=str(rival_company.id),
        )
        assert res_rival_act.status_code == 200
        rival_act_list = res_rival_act.data if isinstance(res_rival_act.data, list) else res_rival_act.data.get("results", [])
        for act_item in rival_act_list:
            assert act_item.get("id") != activity.id, "Công ty đối thủ không được nhìn thấy đơn ứng tuyển của Công ty A"
        log_pass("Công ty đối thủ không thể truy cập các đơn ứng tuyển và hồ sơ phỏng vấn của Công ty A.")

        # Job Seeker candidate cannot access employer management APIs
        client_cand = APIClient()
        client_cand.force_authenticate(user=cand_user)
        res_cand_hrm = client_cand.get("/api/v1/native-hrm/employees/")
        assert res_cand_hrm.status_code == 403
        log_pass("Ứng viên bị chặn 403 Forbidden khi truy cập API quản trị của Nhà Tuyển Dụng.")
        passed_count += 1

    except Exception as e:
        import traceback
        log_fail(f"Lỗi phát sinh trong quá trình kiểm thử: {e}")
        traceback.print_exc()

    print("\n" + "=" * 70)
    print(f"  KẾT QUẢ KIỂM THỬ THỰC TẾ: {passed_count} BƯỚC THÀNH CÔNG, {total_steps - passed_count} BƯỚC THẤT BẠI")
    print("=" * 70 + "\n")

    return passed_count == total_steps


if __name__ == "__main__":
    success = run_live_employer_lifecycle_test()
    sys.exit(0 if success else 1)
