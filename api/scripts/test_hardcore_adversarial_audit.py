#!/usr/bin/env python
"""
======================================================================
Hardcore Adversarial & Edge-Case Security QA/QC Audit Suite
======================================================================
Mục tiêu: Đóng vai trò Hacker / Kiểm thử khó tính (Adversarial QA / Pentester)
để tấn công trực diện vào các góc khuất, lỗ hổng logic, IDOR, phân quyền,
dữ liệu bẩn và các điều kiện biên của hệ thống để tìm ra các lỗi thực tế.

Danh mục 10 bài kiểm thử tấn công (Hardcore Attack Vectors):
  [TEST 1] IDOR & Quyền Sửa/Xóa Ngân Hàng Câu Hỏi Toàn Sàn (Global Questions/Groups)
  [TEST 2] IDOR Phòng Ban Đa Doanh Nghiệp (Cross-Company Department Parent Injection)
  [TEST 3] IDOR Nhân Sự & Cấp Trên Đa Doanh Nghiệp (Cross-Company Reports-To / Department)
  [TEST 4] Tự Duyệt Đơn Nghỉ Phép (Self-Approval Privilege Escalation)
  [TEST 5] Dữ Liệu Rác & Logic Thời Gian Nghỉ Phép (end_date < start_date, total_days <= 0)
  [TEST 6] Hợp Đồng Lao Động Dữ Liệu Âm & Hạn Hợp Đồng Ngược (Negative Salary & Reversed Dates)
  [TEST 7] Chấm Công Thời Gian Bất Hợp Lý (check_out < check_in, working_hours < 0)
  [TEST 8] Cướp Quyền Token LiveKit Phỏng Vấn (Candidate generating HR Token / Cross-Tenant)
  [TEST 9] Bất Biến Luồng Trạng Thái Tuyển Dụng (State Machine Invariants: HIRED -> PENDING)
  [TEST 10] Nộp Đơn Bằng CV Của Người Khác Hoặc Dữ Liệu Bẩn (Resume IDOR & Negative Salary)
======================================================================
"""

import os
import sys
import uuid
import datetime
from decimal import Decimal

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

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

from django.utils import timezone
from rest_framework.test import APIClient

from apps.accounts.models import User
from apps.profiles.models import (
    Company, CompanyVerification, CompanyRole, CompanyMember,
    JobSeekerProfile, Resume
)
from apps.jobs.models import JobPost, JobPostActivity, Career
from apps.locations.models import City, Location
from apps.interviews.models import (
    Question, QuestionGroup, InterviewSession, VoiceProfile, VoiceProfileGrant
)
from apps.hrm.models import (
    Department, Designation, Employee, EmploymentContract,
    LeaveType, LeaveRequest, AttendanceRecord
)
from shared.configs import variable_system as var_sys


class AdversarialAuditRunner:
    def __init__(self):
        self.run_id = uuid.uuid4().hex[:6]
        self.bugs_found = []
        self.passed_checks = []

    def log_attack(self, num: int, title: str):
        print(f"\n[ATTACK VECTOR {num}] {title}")

    def log_bug(self, bug_code: str, description: str, impact: str):
        self.bugs_found.append({"code": bug_code, "desc": description, "impact": impact})
        print(f"  🔴 [BUG FOUND] [{bug_code}] {description}")
        print(f"     => Mức độ ảnh hưởng: {impact}")

    def log_secure(self, msg: str):
        self.passed_checks.append(msg)
        print(f"  🛡️ [SECURE] {msg}")

    def run_all_attacks(self):
        print("=" * 75)
        print("  BẮT ĐẦU KIỂM THỬ KHÓ TÍNH & TẤN CÔNG BẢO MẬT BIÊN (ADVERSARIAL QA AUDIT)")
        print("=" * 75)

        # -------------------------------------------------------------
        # KHỞI TẠO DỮ LIỆU ĐA DOANH NGHIỆP ĐỂ TẤN CÔNG
        # -------------------------------------------------------------
        city, _ = City.objects.get_or_create(name="Hồ Chí Minh")
        loc_a = Location.objects.create(city=city, address=f"Công ty A {self.run_id}")
        loc_b = Location.objects.create(city=city, address=f"Công ty B {self.run_id}")

        # Superadmin
        admin_user = User.objects.create_superuser(
            email=f"root_admin_{self.run_id}@square.vn",
            full_name="Super Admin",
            password="AdminPass123!",
        )

        # Company A (Attacker / Normal Employer)
        user_a = User.objects.create_user(
            email=f"attacker_{self.run_id}@companya.vn",
            full_name="Attacker Employer A",
            password="Password123!",
            role=var_sys.EMPLOYER,
        )
        company_a = Company.objects.create(
            user=user_a,
            company_name=f"Company A (Attacker) {self.run_id}",
            company_email=user_a.email,
            company_phone="0911000001",
            tax_code=f"MST-A-{self.run_id}",
            employee_size=1,
            location=loc_a,
            is_verified=True,
        )
        # Ensure company roles
        role_owner_a, _ = CompanyRole.objects.get_or_create(
            company=company_a,
            code="owner",
            defaults={"name": "Chủ sở hữu", "is_system": True, "permissions": ["all"]},
        )
        CompanyMember.objects.get_or_create(
            company=company_a,
            user=user_a,
            defaults={"role": role_owner_a, "status": "active"},
        )

        # Company B (Victim)
        user_b = User.objects.create_user(
            email=f"victim_{self.run_id}@companyb.vn",
            full_name="Victim Employer B",
            password="Password123!",
            role=var_sys.EMPLOYER,
        )
        company_b = Company.objects.create(
            user=user_b,
            company_name=f"Company B (Victim) {self.run_id}",
            company_email=user_b.email,
            company_phone="0911000002",
            tax_code=f"MST-B-{self.run_id}",
            employee_size=1,
            location=loc_b,
            is_verified=True,
        )
        role_owner_b, _ = CompanyRole.objects.get_or_create(
            company=company_b,
            code="owner",
            defaults={"name": "Chủ sở hữu", "is_system": True, "permissions": ["all"]},
        )
        CompanyMember.objects.get_or_create(
            company=company_b,
            user=user_b,
            defaults={"role": role_owner_b, "status": "active"},
        )

        # Candidate
        user_cand = User.objects.create_user(
            email=f"candidate_{self.run_id}@gmail.com",
            full_name="Nguyễn Văn Ứng Viên",
            password="Password123!",
            role=var_sys.JOB_SEEKER,
        )
        profile_cand = JobSeekerProfile.objects.create(
            user=user_cand,
            phone="0988000001",
        )
        resume_cand = Resume.objects.create(
            user=user_cand,
            job_seeker_profile=profile_cand,
            title="Senior Developer CV",
            is_active=True,
        )

        client_a = APIClient()
        client_a.force_authenticate(user=user_a)

        client_b = APIClient()
        client_b.force_authenticate(user=user_b)

        client_cand = APIClient()
        client_cand.force_authenticate(user=user_cand)

        # =============================================================
        # [ATTACK 1] Sửa / Xóa Ngân Hàng Câu Hỏi Toàn Sàn của Superadmin
        # =============================================================
        self.log_attack(1, "IDOR: Regular Employer Sửa/Xóa Ngân Hàng Câu Hỏi Toàn Sàn (company=None)")
        global_group = QuestionGroup.objects.create(
            name=f"Bộ Câu Hỏi Chuẩn Hệ Thống Toàn Quốc {self.run_id}",
            description="Bộ câu hỏi do Superadmin tạo cho toàn sàn dùng chung.",
            author=admin_user,
            company=None,  # Global
        )
        global_q = Question.objects.create(
            text=f"Hãy giải thích kiến trúc vi dịch vụ (Microservices)? {self.run_id}",
            author=admin_user,
            company=None,  # Global
            difficulty=2,
        )

        # Employer A tries to delete Superadmin's global group & question
        res_del_group = client_a.delete(
            f"/api/v1/interview/web/question-groups/{global_group.id}/",
            HTTP_X_ACTIVE_COMPANY_ID=str(company_a.id),
        )
        if res_del_group.status_code in [200, 204]:
            self.log_bug(
                "BUG-SEC-01",
                f"LỖ HỔNG BẢO MẬT: Nhà tuyển dụng A có thể XÓA bộ câu hỏi toàn sàn của SuperAdmin (#{global_group.id})!",
                "CRITICAL: Xâm phạm và phá hoại tài nguyên toàn hệ thống.",
            )
        else:
            self.log_secure("Bảo vệ thành công: Không cho phép NTD xóa bộ câu hỏi toàn sàn.")

        res_del_q = client_a.delete(
            f"/api/v1/interview/web/questions/{global_q.id}/",
            HTTP_X_ACTIVE_COMPANY_ID=str(company_a.id),
        )
        if res_del_q.status_code in [200, 204]:
            self.log_bug(
                "BUG-SEC-02",
                f"LỖ HỔNG BẢO MẬT: Nhà tuyển dụng A có thể XÓA câu hỏi toàn sàn của SuperAdmin (#{global_q.id})!",
                "CRITICAL: Xâm phạm và phá hoại tài nguyên câu hỏi toàn hệ thống.",
            )
        else:
            self.log_secure("Bảo vệ thành công: Không cho phép NTD xóa câu hỏi toàn sàn.")

        # =============================================================
        # [ATTACK 2] IDOR Phòng Ban Đa Doanh Nghiệp (Cross-Company Department Parent)
        # =============================================================
        self.log_attack(2, "IDOR: Cài đặt phòng ban cha (parent) hoặc trưởng phòng (manager) từ Công ty khác")
        dept_b = Department.objects.create(
            company=company_b,
            name=f"Khối Kỹ Thuật Bảo Mật Công Ty B {self.run_id}",
            code=f"DEPT-B-{self.run_id}",
        )
        emp_b = Employee.objects.create(
            company=company_b,
            employee_code=f"SQ-EMP-B-{self.run_id}",
            first_name="Bảo",
            last_name="Trần",
            full_name="Trần Bảo",
            email=f"bao_{self.run_id}@companyb.vn",
            status="ACTIVE",
        )

        # Employer A tries to create department pointing parent=dept_b or manager=emp_b
        res_cross_dept = client_a.post(
            "/api/v1/native-hrm/departments/",
            data={
                "name": f"Phòng R&D Của Công Ty A {self.run_id}",
                "code": f"DEPT-A-RND-{self.run_id}",
                "parent": dept_b.id,
                "manager": emp_b.id,
            },
            format="json",
            HTTP_X_ACTIVE_COMPANY_ID=str(company_a.id),
        )
        if res_cross_dept.status_code == 201:
            created_dept_id = res_cross_dept.data.get("id")
            created_dept = Department.objects.get(id=created_dept_id)
            if created_dept.parent_id == dept_b.id or created_dept.manager_id == emp_b.id:
                self.log_bug(
                    "BUG-HRM-01",
                    f"LỖ HỔNG IDOR HRM: Công ty A gán được phòng ban cha ({dept_b.id}) hoặc trưởng phòng ({emp_b.id}) thuộc Công ty B!",
                    "HIGH: Ô nhiễm cơ cấu tổ chức và rò rỉ danh tính nhân sự chéo giữa các doanh nghiệp.",
                )
        else:
            self.log_secure("Bảo vệ thành công: Chặn gán phòng ban cha hoặc trưởng phòng trái phép từ công ty khác.")

        # =============================================================
        # [ATTACK 3] IDOR Nhân Sự & Cấp Trên Đa Doanh Nghiệp (Cross-Company Employee Links)
        # =============================================================
        self.log_attack(3, "IDOR: Tạo/Sửa nhân viên với phòng ban hoặc người quản lý (reports_to) từ Công ty khác")
        desig_b = Designation.objects.create(
            company=company_b,
            title=f"Chuyên Gia Mật Mã Công Ty B {self.run_id}",
            code=f"DESIG-B-{self.run_id}",
        )
        res_cross_emp = client_a.post(
            "/api/v1/native-hrm/employees/",
            data={
                "first_name": "Tấn Công",
                "last_name": "Nguyễn",
                "email": f"attacker_emp_{self.run_id}@companya.vn",
                "department": dept_b.id,
                "designation": desig_b.id,
                "reports_to": emp_b.id,
            },
            format="json",
            HTTP_X_ACTIVE_COMPANY_ID=str(company_a.id),
        )
        if res_cross_emp.status_code == 201:
            emp_created_id = res_cross_emp.data.get("id")
            emp_obj = Employee.objects.get(id=emp_created_id)
            if emp_obj.department_id == dept_b.id or emp_obj.reports_to_id == emp_b.id:
                self.log_bug(
                    "BUG-HRM-02",
                    f"LỖ HỔNG IDOR HRM: Nhân viên của Công ty A liên kết được tới Phòng ban/Cấp trên ({emp_b.id}) của Công ty B!",
                    "HIGH: Phá vỡ tính toàn vẹn và cô lập dữ liệu đa doanh nghiệp.",
                )
        else:
            self.log_secure("Bảo vệ thành công: Chặn liên kết nhân viên với phòng ban/cấp trên của công ty khác.")

        # =============================================================
        # [ATTACK 4] Tự Duyệt Đơn Nghỉ Phép (Self-Approval Privilege Escalation)
        # =============================================================
        self.log_attack(4, "Leo thang đặc quyền: Nhân viên tự duyệt đơn nghỉ phép của chính mình")
        emp_staff_a = Employee.objects.create(
            company=company_a,
            user=user_cand,
            employee_code=f"SQ-EMP-A-{self.run_id}",
            first_name="Ứng Viên",
            last_name="Nguyễn Văn",
            full_name="Nguyễn Văn Ứng Viên",
            email=user_cand.email,
            status="ACTIVE",
        )
        leave_type_a = LeaveType.objects.create(
            company=company_a,
            name="Nghỉ Phép Năm",
            code="ANNUAL",
            days_per_year=12,
            is_paid=True,
        )
        leave_req_staff = LeaveRequest.objects.create(
            employee=emp_staff_a,
            leave_type=leave_type_a,
            start_date=timezone.now().date() + datetime.timedelta(days=1),
            end_date=timezone.now().date() + datetime.timedelta(days=2),
            total_days=Decimal("2.0"),
            status="PENDING",
        )

        # Candidate user tries to call approve endpoint
        res_self_approve = client_cand.patch(
            f"/api/v1/native-hrm/leave-requests/{leave_req_staff.id}/approve/",
            HTTP_X_ACTIVE_COMPANY_ID=str(company_a.id),
        )
        if res_self_approve.status_code == 200:
            self.log_bug(
                "BUG-HRM-03",
                f"LỖ HỔNG PHÂN QUYỀN: Nhân viên thường có thể tự duyệt đơn nghỉ phép (#{leave_req_staff.id}) của chính mình!",
                "HIGH: Phá vỡ quy trình kiểm soát nhân sự.",
            )
        else:
            self.log_secure("Bảo vệ thành công: Nhân viên không thể tự duyệt đơn nghỉ phép.")

        # =============================================================
        # [ATTACK 5] Dữ Liệu Rác & Logic Thời Gian Nghỉ Phép (Invalid Dates & Negative Days)
        # =============================================================
        self.log_attack(5, "Dữ liệu biên: Ngày kết thúc trước ngày bắt đầu (end_date < start_date) hoặc total_days <= 0")
        res_invalid_leave = client_a.post(
            "/api/v1/native-hrm/leave-requests/",
            data={
                "employee": emp_staff_a.id,
                "leave_type": leave_type_a.id,
                "start_date": "2026-12-30",
                "end_date": "2026-01-01",  # Reversed dates
                "total_days": "-5.0",      # Negative days
                "reason": "Nghỉ xuyên không gian thời gian",
            },
            format="json",
            HTTP_X_ACTIVE_COMPANY_ID=str(company_a.id),
        )
        if res_invalid_leave.status_code == 201:
            self.log_bug(
                "BUG-DATA-01",
                "THIẾU VALIDATION DỮ LIỆU: API cho phép tạo đơn nghỉ phép có ngày kết thúc trước ngày bắt đầu hoặc số ngày nghỉ âm!",
                "MEDIUM: Làm sai lệch dữ liệu bảng chấm công và quỹ phép năm.",
            )
        else:
            self.log_secure("Bảo vệ thành công: Chặn đơn nghỉ phép có ngày không hợp lệ hoặc số ngày âm.")

        # =============================================================
        # [ATTACK 6] Hợp Đồng Lao Động Dữ Liệu Âm & Hạn Hợp Đồng Ngược
        # =============================================================
        self.log_attack(6, "Dữ liệu biên: Hợp đồng có lương âm (base_salary < 0) hoặc ngày kết thúc < ngày bắt đầu")
        res_invalid_contract = client_a.post(
            "/api/v1/native-hrm/contracts/",
            data={
                "employee": emp_staff_a.id,
                "contract_number": f"HĐ-MALFORMED-{self.run_id}",
                "contract_type": "FIXED_TERM",
                "start_date": "2026-10-01",
                "end_date": "2025-01-01",  # Reversed
                "base_salary": "-10000000", # Negative salary
                "allowance": "-500000",
            },
            format="json",
            HTTP_X_ACTIVE_COMPANY_ID=str(company_a.id),
        )
        if res_invalid_contract.status_code == 201:
            self.log_bug(
                "BUG-DATA-02",
                "THIẾU VALIDATION DỮ LIỆU: Hợp đồng lao động chấp nhận mức lương âm và ngày kết thúc trước ngày bắt đầu!",
                "MEDIUM: Làm sai lệch báo cáo tài chính và xuất bảng lương CSV.",
            )
        else:
            self.log_secure("Bảo vệ thành công: Chặn hợp đồng lao động có lương âm hoặc ngày hết hạn ngược.")

        # =============================================================
        # [ATTACK 7] Chấm Công Thời Gian Bất Hợp Lý (check_out < check_in)
        # =============================================================
        self.log_attack(7, "Dữ liệu biên: Chấm công có giờ về trước giờ vào (check_out < check_in) hoặc working_hours âm")
        res_invalid_att = client_a.post(
            "/api/v1/native-hrm/attendances/",
            data={
                "employee": emp_staff_a.id,
                "date": "2026-08-20",
                "check_in": "18:00:00",
                "check_out": "08:00:00",  # Check out before check in on same day
                "working_hours": "-8.00",
                "status": "PRESENT",
            },
            format="json",
            HTTP_X_ACTIVE_COMPANY_ID=str(company_a.id),
        )
        if res_invalid_att.status_code == 201:
            self.log_bug(
                "BUG-DATA-03",
                "THIẾU VALIDATION DỮ LIỆU: Chấm công chấp nhận giờ về trước giờ vào hoặc số giờ làm việc âm!",
                "MEDIUM: Dữ liệu chấm công bị corrupt khi tính lương.",
            )
        else:
            self.log_secure("Bảo vệ thành công: Chặn chấm công giờ ngược hoặc số giờ âm.")

        # =============================================================
        # [ATTACK 8] Token LiveKit Phỏng Vấn (Candidate / Outsider Privilege Escalation)
        # =============================================================
        self.log_attack(8, "Bảo mật LiveKit: Ứng viên hoặc người ngoài cố lấy Token HR Presence / Observer của Công ty khác")
        career, _ = Career.objects.get_or_create(name="AI Engineering")
        job_b = JobPost.objects.create(
            company=company_b,
            user=user_b,
            job_name="Senior Security Engineer",
            career=career,
            location=loc_b,
            quantity=1,
            position=1,
            type_of_workplace=1,
            experience=3,
            academic_level=2,
            job_type=1,
            salary_min=30000000,
            salary_max=50000000,
            deadline=timezone.now().date() + datetime.timedelta(days=30),
            contact_person_name="HR B",
            contact_person_phone="0911222333",
            contact_person_email="hr@b.vn",
            job_description="Security analyst",
            status=var_sys.JobPostStatus.APPROVED,
        )
        session_b = InterviewSession.objects.create(
            job_post=job_b,
            candidate=user_cand,
            created_by=user_b,
            status="scheduled",
            room_name=f"interview-secret-b-{self.run_id}",
            invite_token=f"token-secret-b-{self.run_id}",
        )

        # Attacker A tries to get HR Presence Token for Session B
        res_hr_token = client_a.post(
            f"/api/v1/interview/web/interview-sessions/{session_b.id}/hr-token/",
            HTTP_X_ACTIVE_COMPANY_ID=str(company_a.id),
        )
        if res_hr_token.status_code == 200:
            self.log_bug(
                "BUG-SEC-03",
                f"LỖ HỔNG BẢO MẬT: NTD A lấy được Token HR Presence để đột nhập vào phòng phỏng vấn của Công ty B (#{session_b.id})!",
                "CRITICAL: Vi phạm nghiêm trọng quyền riêng tư và bí mật kinh doanh.",
            )
        else:
            self.log_secure("Bảo vệ thành công: Chặn NTD khác công ty truy cập Token phỏng vấn.")

        # =============================================================
        # [ATTACK 9] Bất Biến Luồng Trạng Thái Tuyển Dụng (State Machine Invariants)
        # =============================================================
        self.log_attack(9, "Luồng logic ATS: Chuyển trạng thái tuyển dụng ngược từ HIRED -> PENDING")
        activity_b = JobPostActivity.objects.create(
            job_post=job_b,
            user=user_cand,
            resume=resume_cand,
            status=var_sys.ApplicationStatus.HIRED,
        )

        res_illegal_trans = client_b.patch(
            f"/api/v1/job/web/employer-job-posts-activity/{activity_b.id}/",
            data={"status": var_sys.ApplicationStatus.PENDING_CONFIRMATION},
            format="json",
            HTTP_X_ACTIVE_COMPANY_ID=str(company_b.id),
        )
        if res_illegal_trans.status_code == 200 and res_illegal_trans.data.get("status") == var_sys.ApplicationStatus.PENDING_CONFIRMATION:
            self.log_bug(
                "BUG-ATS-01",
                "LỖI LOGIC PHỄU ATS: Cho phép đảo ngược trạng thái từ Đã Tuyển (HIRED) về Chờ Duyệt (PENDING) mà không qua kiểm soát.",
                "LOW: Bất nhất trạng thái lịch sử tuyển dụng.",
            )
        else:
            self.log_secure("Bảo vệ thành công: Quản lý chuyển trạng thái phễu an toàn.")

        # =============================================================
        # [ATTACK 10] Nộp Đơn Bằng CV Của Người Khác (Resume IDOR)
        # =============================================================
        self.log_attack(10, "IDOR: Ứng viên X nộp đơn bằng CV của Ứng viên Y")
        user_victim_cand = User.objects.create_user(
            email=f"victim_cand_{self.run_id}@gmail.com",
            full_name="Nạn Nhân CV",
            password="Password123!",
            role=var_sys.JOB_SEEKER,
        )
        prof_victim = JobSeekerProfile.objects.create(user=user_victim_cand, phone="0988000002")
        resume_victim = Resume.objects.create(user=user_victim_cand, job_seeker_profile=prof_victim, title="CV Nạn Nhân")

        # Candidate user tries to apply using resume_victim
        res_steal_apply = client_cand.post(
            "/api/v1/job/web/job-posts-activity/",
            data={
                "job_post": job_b.id,
                "resume": resume_victim.id,
                "full_name": "Kẻ Đánh Cắp",
                "email": user_cand.email,
                "phone": "0988999888",
            },
            format="json",
        )
        if res_steal_apply.status_code in [200, 201]:
            self.log_bug(
                "BUG-ATS-02",
                f"LỖ HỔNG IDOR: Ứng viên có thể nộp đơn bằng CV của người dùng khác (#{resume_victim.id})!",
                "HIGH: Rò rỉ thông tin cá nhân và mạo danh hồ sơ ứng viên.",
            )
        else:
            self.log_secure("Bảo vệ thành công: Chặn nộp đơn bằng CV thuộc sở hữu của người khác.")

        # -------------------------------------------------------------
        # TỔNG KẾT BÁO CÁO AUDIT
        # -------------------------------------------------------------
        print("\n" + "=" * 75)
        print(f"  TỔNG KẾT AUDIT: ĐÃ PHÁT HIỆN {len(self.bugs_found)} LỖI/LỖ HỔNG THỰC TẾ, {len(self.passed_checks)} ĐIỂM AN TOÀN")
        print("=" * 75)
        for i, bug in enumerate(self.bugs_found, 1):
            print(f"  {i}. [{bug['code']}] {bug['desc']}")
            print(f"     Impact: {bug['impact']}")
        print("=" * 75 + "\n")


if __name__ == "__main__":
    runner = AdversarialAuditRunner()
    runner.run_all_attacks()
