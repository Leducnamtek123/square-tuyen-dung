#!/usr/bin/env python
"""
Live End-to-End Test Suite for Candidate Full Lifecycle.
Runs against real Django ORM, real DB transactions, real API client, real services.
"""
import os
import sys
import uuid
from datetime import date, timedelta
from decimal import Decimal

# Configure UTF-8 encoding for Windows terminals
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

# Setup Django environment
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BASE_DIR)
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings_test")

import django
django.setup()

from django.conf import settings
settings.ALLOWED_HOSTS = ["*", "testserver", "localhost", "127.0.0.1"]

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
from apps.common.models import Career
from apps.profiles.models import (
    Company, CompanyMember, CompanyRole,
    JobSeekerProfile, Resume, AdvancedSkill, ExperienceDetail,
    EducationDetail, Certificate, LanguageSkill
)
from apps.jobs.models import JobPost, JobPostActivity
from apps.jobs.services import JobActivityService
from apps.jobs.ai_scoring_service import score_job_application
from apps.interviews.models import InterviewSession, InterviewEvaluation, Question
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
    print(f"\n{Colors.CYAN}{Colors.BOLD}[BƯỚC {step_num}] {title}{Colors.RESET}")


def log_pass(msg: str):
    print(f"  {Colors.GREEN}✔ [PASS]{Colors.RESET} {msg}")


def log_fail(msg: str):
    print(f"  {Colors.RED}✘ [FAIL]{Colors.RESET} {msg}")


def run_live_candidate_lifecycle_test():
    print(f"{Colors.BOLD}{Colors.YELLOW}{'='*70}")
    print(f"  BẮT ĐẦU CHẠY KIỂM THỬ THỰC TẾ: VÒNG ĐỜI ỨNG VIÊN (E2E LIVE TEST)")
    print(f"{'='*70}{Colors.RESET}")

    passed_count = 0
    failed_count = 0

    run_id = uuid.uuid4().hex[:6]

    try:
        # -------------------------------------------------------------
        # GIAI ĐOẠN 0: Khởi tạo Doanh nghiệp & Tin tuyển dụng thực
        # -------------------------------------------------------------
        log_step(0, "Khởi tạo Nhà tuyển dụng & Công ty tuyển dụng")
        employer_user = User.objects.create_user(
            email=f"employer_{run_id}@techcorp.vn",
            full_name="Trần Văn Tuyển Dụng",
            password="Password123!",
            role=var_sys.EMPLOYER,
        )
        city, _ = City.objects.get_or_create(name="Hồ Chí Minh")
        career, _ = Career.objects.get_or_create(name="Công nghệ thông tin")

        company = Company.objects.create(
            user=employer_user,
            company_name=f"TechCorp Solutions {run_id}",
            company_email=f"hr@{run_id}.techcorp.vn",
            company_phone="0901234567",
            tax_code=f"TAX-{run_id}",
            is_verified=True,
        )

        location = Location.objects.create(city=city, address="Số 10 Nguyễn Huệ, Quận 1, TP.HCM")
        job_post = JobPost.objects.create(
            user=employer_user,
            company=company,
            job_name="Senior Fullstack AI Engineer",
            deadline=timezone.now().date() + timedelta(days=30),
            quantity=3,
            position=5,  # Senior
            type_of_workplace=1,  # Office
            experience=4,  # 3-5 years
            academic_level=2,  # Đại học
            job_type=1,  # Full-time
            salary_min=30000000,
            salary_max=55000000,
            career=career,
            location=location,
            status=var_sys.JobPostStatus.APPROVED,
        )
        log_pass(f"Đã tạo Công ty: {company.company_name} và Tin tuyển dụng ID={job_post.id} ({job_post.job_name})")
        passed_count += 1

        # -------------------------------------------------------------
        # GIAI ĐOẠN 1: Tạo Tài Khoản Ứng Viên & Hồ Sơ Cá Nhân
        # -------------------------------------------------------------
        log_step(1, "Ứng viên đăng ký tài khoản & tạo hồ sơ cá nhân (JobSeekerProfile)")
        candidate_user = User.objects.create_user(
            email=f"candidate_{run_id}@gmail.com",
            full_name="Nguyễn Văn Bảo An",
            password="CandidatePassword123!",
            role=var_sys.JOB_SEEKER,
            phone_number="0987654321",
        )
        profile = JobSeekerProfile.objects.create(
            user=candidate_user,
            phone="0987654321",
            gender="M",
            birthday=date(1997, 8, 15),
            permanent_address="Số 45 Lê Lợi, Bến Nghé, Quận 1, TP.HCM",
            tax_code=f"CAND-TAX-{run_id}",
        )
        assert candidate_user.role_name == var_sys.JOB_SEEKER
        assert profile.user == candidate_user
        log_pass(f"Ứng viên '{candidate_user.full_name}' ({candidate_user.email}) đã tạo tài khoản và hồ sơ thành công.")
        passed_count += 1

        # -------------------------------------------------------------
        # GIAI ĐOẠN 2: Tạo CV Trực Tuyến & Kỹ Năng (Online Resume)
        # -------------------------------------------------------------
        log_step(2, "Ứng viên tạo CV Trực Tuyến & khai báo chi tiết kinh nghiệm, kỹ năng")
        resume = Resume.objects.create(
            user=candidate_user,
            job_seeker_profile=profile,
            career=career,
            city=city,
            title="Senior Fullstack Python / React Developer",
            description="5 năm kinh nghiệm lập trình backend Django & frontend Next.js/React, tích hợp hệ thống AI.",
            skills_summary="Python, Django, FastAPI, React, Next.js, Docker, Redis, Postgres, AI Integration",
            position=5,
            experience=4,
            academic_level=2,
            type_of_workplace=1,
            job_type=1,
            salary_min=35000000,
            salary_max=50000000,
            type=var_sys.CV_WEBSITE,
            is_active=True,
        )
        # Add sub details
        AdvancedSkill.objects.create(resume=resume, name="Python / Django", level=5)
        AdvancedSkill.objects.create(resume=resume, name="React / TypeScript", level=5)
        ExperienceDetail.objects.create(
            resume=resume,
            job_name="Senior Backend Engineer",
            company_name="Tech Global Corp",
            start_date=date(2021, 1, 1),
            end_date=date(2025, 12, 31),
            description="Phát triển hệ thống microservices và tích hợp LLM",
        )
        EducationDetail.objects.create(
            resume=resume,
            degree_name="Kỹ sư Công nghệ thông tin",
            major="Khoa học máy tính",
            training_place_name="Đại học Bách Khoa TP.HCM",
            start_date=date(2015, 9, 1),
            completed_date=date(2019, 6, 30),
        )
        LanguageSkill.objects.create(resume=resume, language=1, level=4)
        
        assert resume.advanced_skills.count() == 2
        assert resume.experience_details.count() == 1
        log_pass(f"CV Trực Tuyến ID={resume.id} '{resume.title}' đã tạo với đầy đủ kỹ năng và kinh nghiệm.")
        passed_count += 1

        # -------------------------------------------------------------
        # GIAI ĐOẠN 3: Nộp Đơn Ứng Tuyển & Kiểm Tra Chống Trùng Lặp
        # -------------------------------------------------------------
        log_step(3, "Ứng viên nộp hồ sơ vào tin tuyển dụng & kiểm tra tính toàn vẹn")
        apply_data = {
            "job_post": job_post,
            "resume": resume,
            "fullName": candidate_user.full_name,
            "email": candidate_user.email,
            "phone": "0987654321",
        }
        activity = JobActivityService.apply_to_job(candidate_user, apply_data)
        assert activity is not None
        assert activity.job_post == job_post
        assert activity.resume == resume
        assert activity.status == var_sys.ApplicationStatus.PENDING_CONFIRMATION
        log_pass(f"Đơn ứng tuyển ID={activity.id} được tạo thành công với trạng thái PENDING_CONFIRMATION.")

        # Test duplicate application
        duplicate_activity = JobActivityService.apply_to_job(candidate_user, apply_data)
        assert duplicate_activity.id == activity.id, "Nộp trùng phải tái sử dụng lại đơn đang hoạt động"
        log_pass("Cơ chế chống nộp đơn trùng lặp hoạt động chính xác (re-use active application).")
        passed_count += 1

        # -------------------------------------------------------------
        # GIAI ĐOẠN 4: AI Resume Screening & Scoring
        # -------------------------------------------------------------
        log_step(4, "Chạy AI Resume Fit Scoring đánh giá độ phù hợp của CV với Job Post")
        scoring_result = score_job_application(activity)
        assert scoring_result is not None
        assert scoring_result["score"] is not None
        assert scoring_result["score"] >= 70, f"Điểm dự kiến phải cao với CV khớp kỹ năng, thực tế={scoring_result['score']}"
        activity.score = scoring_result["score"]
        activity.ai_analysis_summary = scoring_result.get("summary", "")
        activity.save()
        log_pass(f"AI chấm điểm ứng viên đạt: {activity.score}/100 điểm. Tóm tắt: '{activity.ai_analysis_summary}'")
        passed_count += 1

        # -------------------------------------------------------------
        # GIAI ĐOẠN 5: Lên Lịch Phỏng Vấn & Cấp LiveKit Token
        # -------------------------------------------------------------
        log_step(5, "Lên lịch phỏng vấn AI LiveKit & Cấp token cho Ứng viên / HR")
        q1 = Question.objects.create(
            company=company,
            text="Hãy giới thiệu kinh nghiệm xây dựng hệ thống phân tán của bạn?",
            category="technical",
            difficulty=2,
        )
        interview_session = InterviewSession.objects.create(
            job_post=job_post,
            candidate=candidate_user,
            created_by=employer_user,
            type="mixed",
            status="scheduled",
        )
        interview_session.questions.add(q1)

        class MockRequest:
            user = candidate_user
            def get_host(self): return "localhost:8000"
            def is_secure(self): return False

        candidate_token_res = create_livekit_participant_token(interview_session, MockRequest())
        assert "token" in candidate_token_res
        assert candidate_token_res["room_name"] == interview_session.room_name
        from unittest.mock import patch

        with patch("apps.interviews.tasks.end_interview_session.apply_async"), \
             patch("apps.interviews.tasks.finalize_disconnected_session.apply_async"), \
             patch("apps.interviews.services.broadcast_interview_event"), \
             patch("apps.interviews.livekit_service.LiveKitService.start_recording"):

            # Transition scheduled -> in_progress
            update_interview_status(interview_session, "in_progress")
            interview_session.refresh_from_db()
            assert interview_session.status == "in_progress"

            # Test reconnect on interrupted
            update_interview_status(interview_session, "interrupted")
            interview_session.refresh_from_db()
            assert interview_session.status == "interrupted"

            reconnect_res = create_livekit_participant_token(interview_session, MockRequest())
            assert "token" in reconnect_res
            log_pass("Ứng viên phục hồi kết nối thành công khi session ở trạng thái 'interrupted'.")
            passed_count += 1

        # -------------------------------------------------------------
        # GIAI ĐOẠN 6: Đánh Giá Kết Quả Phỏng Vấn (HR Evaluation)
        # -------------------------------------------------------------
        log_step(6, "HR hoàn tất phỏng vấn & nhập form đánh giá (InterviewEvaluation)")
        with patch("apps.interviews.services.broadcast_interview_event"), \
             patch("apps.interviews.services.queue_ai_evaluation"):
            update_interview_status(interview_session, "completed")
            interview_session.refresh_from_db()

        evaluation = InterviewEvaluation.objects.create(
            interview=interview_session,
            evaluator=employer_user,
            attitude_score=Decimal("9.0"),
            professional_score=Decimal("9.5"),
            overall_score=Decimal("9.25"),
            result="passed",
            proposed_salary=45000000,
            comments="Ứng viên giao tiếp xuất sắc, chuyên môn sâu về Python/Django và AI architecture.",
        )
        assert evaluation.result == "passed"
        assert evaluation.overall_score == Decimal("9.25")
        log_pass(f"Đánh giá phỏng vấn hoàn tất: Kết quả '{evaluation.result}', Điểm TB: {evaluation.overall_score}/10")
        passed_count += 1

        # -------------------------------------------------------------
        # GIAI ĐOẠN 7: Chuyển Trạng Thái Tuyển Dụng (Recruitment Pipeline)
        # -------------------------------------------------------------
        log_step(7, "Chuyển trạng thái tuyển dụng: PENDING -> CONTACTED -> INTERVIEWED -> HIRED")
        activity = JobActivityService.change_application_status(
            activity, var_sys.ApplicationStatus.CONTACTED, notify=False
        )
        assert activity.status == var_sys.ApplicationStatus.CONTACTED

        activity = JobActivityService.change_application_status(
            activity, var_sys.ApplicationStatus.INTERVIEWED, notify=False
        )
        assert activity.status == var_sys.ApplicationStatus.INTERVIEWED

        activity = JobActivityService.change_application_status(
            activity, var_sys.ApplicationStatus.HIRED, notify=False
        )
        assert activity.status == var_sys.ApplicationStatus.HIRED
        log_pass("Luồng chuyển trạng thái Pipeline thành công hoàn hảo đến trạng thái cuối cùng: HIRED.")
        passed_count += 1

        # -------------------------------------------------------------
        # GIAI ĐOẠN 8: Tiếp Nhận Nhân Viên Sang HRM (Onboard Candidate)
        # -------------------------------------------------------------
        log_step(8, "Chuyển đổi Ứng viên Trúng Tuyển sang Nhân Viên Native HRM")
        dept = Department.objects.create(company=company, name="Khối Công Nghệ", code=f"DEPT-TECH-{run_id}")
        desig = Designation.objects.create(company=company, title="Senior AI Engineer", code=f"SR-AI-{run_id}")

        onboard_payload = {
            "job_application_id": activity.id,
            "department_id": dept.id,
            "designation_id": desig.id,
            "join_date": "2026-09-01",
            "probation_end_date": "2026-11-01",
            "base_salary": 45000000,
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
        assert employee.user == candidate_user
        assert employee.employee_code.startswith("SQ-EMP-")
        assert employee.first_name == "An", f"Expected 'An', got '{employee.first_name}'"
        assert employee.last_name == "Nguyễn Văn Bảo", f"Expected 'Nguyễn Văn Bảo', got '{employee.last_name}'"
        assert employee.full_name == "Nguyễn Văn Bảo An"

        # Check contract created
        contract = EmploymentContract.objects.filter(employee=employee).first()
        assert contract is not None
        assert contract.base_salary == 45000000

        # Check CompanyMember role
        member = CompanyMember.objects.filter(company=company, user=candidate_user).first()
        assert member is not None
        assert member.role.code == "employee"

        log_pass(f"Nhân viên mới đã tạo thành công: Mã={employee.employee_code}, Tên='{employee.first_name}', Họ='{employee.last_name}', Lương={contract.base_salary:,.0f} VND.")
        log_pass("Tài khoản người dùng đã được cấp quyền thành viên công ty với vai trò 'employee'.")
        passed_count += 1

        # -------------------------------------------------------------
        # GIAI ĐOẠN 9: Kiểm Tra Bảo Toàn Dữ Liệu Khi Xóa CV (Cascade Protection)
        # -------------------------------------------------------------
        log_step(9, "Kiểm tra bảo toàn dữ liệu đơn ứng tuyển khi ứng viên xóa CV (SET_NULL)")
        act_id = activity.id
        resume.delete()  # Candidate deletes their CV

        activity.refresh_from_db()
        assert activity.id == act_id
        assert activity.resume is None
        assert activity.status == var_sys.ApplicationStatus.HIRED
        assert activity.full_name == "Nguyễn Văn Bảo An"
        log_pass("Xóa CV không làm mất đơn ứng tuyển: JobPostActivity vẫn tồn tại 100%, resume được gán NULL an toàn.")
        passed_count += 1

        # -------------------------------------------------------------
        # GIAI ĐOẠN 10: Kiểm Tra Bảo Mật Phân Quyền & Cô Lập Doanh Nghiệp
        # -------------------------------------------------------------
        log_step(10, "Kiểm tra Bảo mật Phân quyền & Cô lập Đa Doanh nghiệp (Multi-Tenancy RBAC)")
        # Company B trying to see Company A's employee
        company_b_owner = User.objects.create_user(
            email=f"comp_b_{run_id}@other.vn",
            full_name="Giám Đốc Công Ty Khác",
            password="Password123!",
            role=var_sys.EMPLOYER,
        )
        company_b = Company.objects.create(
            user=company_b_owner,
            company_name=f"Other Corp {run_id}",
            tax_code=f"TAX-B-{run_id}",
            is_verified=True,
        )

        client_b = APIClient()
        client_b.force_authenticate(user=company_b_owner)
        res_b = client_b.get("/api/v1/native-hrm/employees/")
        assert res_b.status_code == 200
        emp_list = res_b.data if isinstance(res_b.data, list) else res_b.data.get("results", [])
        assert len(emp_list) == 0, "Công ty B không được nhìn thấy nhân viên của Công ty A"
        log_pass("Công ty B bị cô lập dữ liệu 100%, không thể truy cập danh sách nhân viên của Công ty A.")

        # Candidate trying to access HRM API
        client_cand = APIClient()
        client_cand.force_authenticate(user=candidate_user)
        res_cand = client_cand.get("/api/v1/native-hrm/employees/")
        assert res_cand.status_code == 403, "Ứng viên phải nhận 403 Forbidden khi truy cập API HRM"
        log_pass("Ứng viên bị chặn 403 Forbidden khi gọi các API quản trị nội bộ HRM.")
        passed_count += 1

    except Exception as e:
        import traceback
        log_fail(f"Lỗi phát sinh trong quá trình kiểm thử: {str(e)}")
        traceback.print_exc()
        failed_count += 1

    print(f"\n{Colors.BOLD}{Colors.YELLOW}{'='*70}")
    print(f"  KẾT QUẢ KIỂM THỬ THỰC TẾ: {passed_count} BƯỚC THÀNH CÔNG, {failed_count} BƯỚC THẤT BẠI")
    print(f"{'='*70}{Colors.RESET}\n")

    return failed_count == 0


if __name__ == "__main__":
    success = run_live_candidate_lifecycle_test()
    sys.exit(0 if success else 1)
