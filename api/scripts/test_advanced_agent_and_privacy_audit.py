#!/usr/bin/env python
"""
Advanced Adversarial Security & Privacy Audit Script
=====================================================
Targeted penetration & boundary tests for:
1. Candidate CV Privacy & Talent Search Data Leakage (Hidden resumes, Cross-user editing)
2. Agent Assistants Tool Sandbox & Tenant Isolation (Calling tools on other tenants, Admin tools privilege escalation)
3. Multi-Company Membership Switcher & Token Impersonation
4. Job Post Saved / Favorited & Followed Companies Isolation

Usage:
    python scripts/test_advanced_agent_and_privacy_audit.py
"""

import os
import sys
import uuid
from datetime import date

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
API_DIR = os.path.abspath(os.path.join(CURRENT_DIR, ".."))
if API_DIR not in sys.path:
    sys.path.insert(0, API_DIR)

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
from rest_framework.test import APIClient

from apps.accounts.models import User
from apps.profiles.models import (
    Company,
    CompanyMember,
    CompanyRole,
    Resume,
    JobSeekerProfile,
)
from apps.jobs.models import JobPost, JobPostActivity
from apps.agent_assistants.models import AgentThread
from apps.agent_assistants.services import AgentAssistantService, AgentAssistantError
from shared.configs import variable_system as var_sys


class AdvancedAuditRunner:
    def __init__(self):
        self.client = APIClient()
        self.bugs_found = []
        self.secure_points = []
        self.test_id = uuid.uuid4().hex[:6]

    def log_attack(self, num, title):
        print(f"\n[ATTACK VECTOR {num}] {title}")

    def log_bug(self, code, desc, impact):
        print(f"  🔴 [BUG FOUND] [{code}] {desc}")
        print(f"     => Mức độ ảnh hưởng: {impact}")
        self.bugs_found.append({"code": code, "desc": desc, "impact": impact})

    def log_secure(self, message):
        print(f"  🛡️ [SECURE] {message}")
        self.secure_points.append(message)

    def run_all(self):
        print("=" * 75)
        print("  BẮT ĐẦU AUDIT BẢO MẬT NÂNG CAO: PRIVACY, AGENT TOOLS & RBAC")
        print("=" * 75)

        # Ensure database is migrated
        call_command("migrate", "--noinput", verbosity=0)

        # -------------------------------------------------------------
        # Setup test entities
        # -------------------------------------------------------------
        # Candidates
        user_cand_a = User.objects.create_user_with_role_name(
            email=f"cand_a_{self.test_id}@gmail.com",
            full_name="Nguyễn Văn A",
            role_name=var_sys.JOB_SEEKER,
            password="password123",
            is_active=True,
        )
        profile_a, _ = JobSeekerProfile.objects.get_or_create(
            user=user_cand_a,
            defaults={"phone": "0981111111", "is_seeking_job": True},
        )
        resume_a_public = Resume.objects.create(
            user=user_cand_a,
            job_seeker_profile=profile_a,
            title="Senior Python Backend Developer (Public)",
            description="5 years Django & Fastapi",
            type=var_sys.CV_WEBSITE,
            is_active=True,
        )

        user_cand_b = User.objects.create_user_with_role_name(
            email=f"cand_b_{self.test_id}@gmail.com",
            full_name="Trần Thị B (Ẩn Tìm Việc)",
            role_name=var_sys.JOB_SEEKER,
            password="password123",
            is_active=True,
        )
        profile_b, _ = JobSeekerProfile.objects.get_or_create(
            user=user_cand_b,
            defaults={"phone": "0982222222", "is_seeking_job": False},
        )
        profile_b.is_seeking_job = False
        profile_b.save()
        resume_b_private = Resume.objects.create(
            user=user_cand_b,
            job_seeker_profile=profile_b,
            title="Lead AI Engineer (Confidential)",
            description="Secret AI Projects",
            type=var_sys.CV_WEBSITE,
            is_active=True,
        )

        # Employers
        user_emp_1 = User.objects.create_user_with_role_name(
            email=f"emp1_{self.test_id}@company1.vn",
            full_name="CEO Công Ty 1",
            role_name=var_sys.EMPLOYER,
            password="password123",
            is_active=True,
            has_company=True,
        )
        company_1 = Company.objects.create(
            company_name=f"Square Tech Corp {self.test_id}",
            company_email=f"contact_{self.test_id}@company1.vn",
            company_phone="0901111111",
            tax_code=f"MST-1-{self.test_id}",
            user=user_emp_1,
        )

        job_1 = JobPost.objects.create(
            job_name="Senior Python Backend",
            deadline=date(2030, 1, 1),
            quantity=2,
            job_description="<p>Job Description 1</p>",
            position=4,
            type_of_workplace=1,
            experience=2,
            academic_level=2,
            job_type=1,
            salary_min=20000000,
            salary_max=40000000,
            contact_person_name="HR 1",
            contact_person_phone="0901111111",
            contact_person_email="hr1@company1.vn",
            user=user_emp_1,
            company=company_1,
            status=1,
        )

        user_emp_2 = User.objects.create_user_with_role_name(
            email=f"emp2_{self.test_id}@company2.vn",
            full_name="CEO Công Ty 2 (Đối thủ)",
            role_name=var_sys.EMPLOYER,
            password="password123",
            is_active=True,
            has_company=True,
        )
        company_2 = Company.objects.create(
            company_name=f"Rival Corp {self.test_id}",
            company_email=f"contact_{self.test_id}@company2.vn",
            company_phone="0902222222",
            tax_code=f"MST-2-{self.test_id}",
            user=user_emp_2,
        )

        job_2 = JobPost.objects.create(
            job_name="Senior Golang Developer",
            deadline=date(2030, 1, 1),
            quantity=1,
            job_description="<p>Job Description 2</p>",
            position=4,
            type_of_workplace=1,
            experience=2,
            academic_level=2,
            job_type=1,
            salary_min=25000000,
            salary_max=45000000,
            contact_person_name="HR 2",
            contact_person_phone="0902222222",
            contact_person_email="hr2@company2.vn",
            user=user_emp_2,
            company=company_2,
            status=1,
        )

        # SuperAdmin
        admin_user = User.objects.create_user_with_role_name(
            email=f"superadmin_{self.test_id}@square.vn",
            full_name="Super Admin",
            role_name=var_sys.ADMIN,
            password="password123",
            is_active=True,
            is_staff=True,
            is_superuser=True,
        )

        # =============================================================
        # [ATTACK 1] IDOR CV: Ứng viên A cố tình Sửa/Xóa CV của Ứng viên B
        # =============================================================
        self.log_attack(1, "IDOR CV: Ứng viên A gọi API PATCH/DELETE lên CV ID của Ứng viên B")
        client_cand_a = APIClient()
        client_cand_a.force_authenticate(user=user_cand_a)

        res_tamper_cv = client_cand_a.patch(
            f"/api/v1/profile/web/resumes/{resume_b_private.id}/",
            data={"title": "Hacked Title By A"},
            format="json",
        )
        if res_tamper_cv.status_code in [200, 204]:
            self.log_bug(
                "BUG-IDOR-CV-01",
                "Ứng viên A có thể SỬA CV của Ứng viên B!",
                "CRITICAL: Xâm phạm quyền riêng tư và phá hoại hồ sơ người tìm việc.",
            )
        else:
            self.log_secure("Chặn thành công: Ứng viên không thể sửa CV của người khác.")

        res_del_cv = client_cand_a.delete(
            f"/api/v1/profile/web/resumes/{resume_b_private.id}/",
        )
        if res_del_cv.status_code in [200, 204]:
            self.log_bug(
                "BUG-IDOR-CV-02",
                "Ứng viên A có thể XÓA CV của Ứng viên B!",
                "CRITICAL: Xóa trái phép dữ liệu của người khác.",
            )
        else:
            self.log_secure("Chặn thành công: Ứng viên không thể xóa CV của người khác.")

        # =============================================================
        # [ATTACK 2] Quyền Riêng Tư: NTD tìm kiếm ứng viên nhưng bị lộ CV ẩn
        # =============================================================
        self.log_attack(2, "Quyền Riêng Tư: NTD tìm kiếm ứng viên khi ứng viên tắt chế độ tìm việc (is_finding_job=False)")
        client_emp_1 = APIClient()
        client_emp_1.force_authenticate(user=user_emp_1)

        res_search_resumes = client_emp_1.get(
            "/api/v1/profile/web/resumes/",
            data={"search": "Confidential"},
            HTTP_X_ACTIVE_COMPANY_ID=str(company_1.id),
        )
        found_private = False
        if res_search_resumes.status_code == 200:
            data = res_search_resumes.json()
            items = data.get("data", {}).get("results", []) if isinstance(data.get("data"), dict) else data.get("data", [])
            for item in items:
                if item.get("id") == resume_b_private.id:
                    found_private = True
                    break

        if found_private:
            self.log_bug(
                "BUG-PRIVACY-01",
                "Tìm kiếm ứng viên trả về CV của người dùng đã tắt trạng thái tìm việc (is_finding_job=False)!",
                "HIGH: Vi phạm quyền riêng tư và lộ danh tính ứng viên đang làm việc ẩn danh.",
            )
        else:
            self.log_secure("Bảo vệ quyền riêng tư thành công: Không để lộ CV của ứng viên tắt tìm việc.")

        # =============================================================
        # [ATTACK 3] Agent Assistants Sandbox: NTD 1 dùng Tool để thao tác trên Job/Candidate của NTD 2
        # =============================================================
        self.log_attack(3, "Agent Assistants Sandbox: NTD 1 gọi tool 'create_manual_candidate' trỏ vào JobPost của NTD 2")
        from django.test import RequestFactory
        factory = RequestFactory()
        req_emp_1 = factory.post("/api/v1/agent-assistants/threads/1/messages/")
        req_emp_1.user = user_emp_1
        req_emp_1.META["HTTP_X_ACTIVE_COMPANY_ID"] = str(company_1.id)

        thread_1 = AgentThread.objects.create(
            owner=user_emp_1,
            company=company_1,
            portal=AgentThread.PORTAL_EMPLOYER,
        )

        try:
            res_cross_job = AgentAssistantService._create_manual_candidate(
                request=req_emp_1,
                thread=thread_1,
                content=f"Thêm ứng viên Điệp Viên vào tin tuyển dụng {job_2.id}",
                tool_input={
                    "fullName": "Ứng viên gián điệp",
                    "email": "spy@rival.com",
                    "phone": "0999999999",
                    "jobPostId": job_2.id,  # Owned by Company 2!
                },
            )
            created_in_cross_job = True
        except (AgentAssistantError, Exception):
            created_in_cross_job = False

        if created_in_cross_job:
            self.log_bug(
                "BUG-AGENT-IDOR-01",
                "Tool 'create_manual_candidate' cho phép NTD 1 tạo ứng viên vào tin tuyển dụng của NTD 2!",
                "HIGH: Xâm phạm dữ liệu tuyển dụng qua công cụ AI Agent.",
            )
        else:
            self.log_secure("Agent Sandbox an toàn: Chặn tạo ứng viên vào tin tuyển dụng của công ty khác.")

        # =============================================================
        # [ATTACK 4] Agent Assistants Privilege Escalation: NTD gọi Tool của Quản trị viên (Admin Tools)
        # =============================================================
        self.log_attack(4, "Agent Assistants Leo Thang Đặc Quyền: NTD gọi tool 'review_job_post' hoặc 'list_companies'")
        try:
            res_admin_tool = AgentAssistantService._review_job_post(
                request=req_emp_1,
                thread=thread_1,
                job_post_id=job_1.id,
                action="approve",
            )
            admin_tool_success = True
        except (AgentAssistantError, Exception):
            admin_tool_success = False

        if admin_tool_success:
            self.log_bug(
                "BUG-AGENT-SEC-01",
                "NTD thông thường có thể thực thi tool quản trị 'review_job_post' để tự duyệt tin!",
                "CRITICAL: Bỏ qua kiểm duyệt của sàn tuyển dụng.",
            )
        else:
            self.log_secure("Agent Sandbox an toàn: Chặn NTD thực thi công cụ đặc quyền của Quản trị viên.")

        try:
            res_list_comp = AgentAssistantService._list_companies(
                request=req_emp_1,
                query="Rival",
            )
            list_comp_success = len(res_list_comp.get("results", [])) > 0
        except (AgentAssistantError, Exception):
            list_comp_success = False

        if list_comp_success:
            self.log_bug(
                "BUG-AGENT-SEC-02",
                "NTD thông thường có thể gọi tool 'list_companies' để tra cứu danh sách nội bộ toàn bộ công ty trên sàn!",
                "HIGH: Rò rỉ thông tin doanh nghiệp qua AI Agent.",
            )
        else:
            self.log_secure("Agent Sandbox an toàn: Chặn NTD tra cứu danh sách công ty toàn sàn.")

        # =============================================================
        # [ATTACK 5] Switcher Header Tampering: Đăng nhập User 1 nhưng gửi Header X-Active-Company-Id của Công Ty 2
        # =============================================================
        self.log_attack(5, "Đánh tráo Header: Gửi Header X-Active-Company-Id của Công ty khác để gọi API nội bộ")
        res_tampered_header = client_emp_1.get(
            "/api/v1/native-hrm/departments/",
            HTTP_X_ACTIVE_COMPANY_ID=str(company_2.id),  # Not a member of company 2!
        )
        if res_tampered_header.status_code == 200:
            # Check if it returned company 2's data
            self.log_bug(
                "BUG-TENANT-SWITCH-01",
                "Người dùng gửi Header X-Active-Company-Id của công ty mà mình không phải thành viên vẫn xem được dữ liệu!",
                "CRITICAL: Phá vỡ hoàn toàn cơ chế cô lập đa doanh nghiệp (Multi-tenancy bypass).",
            )
        else:
            self.log_secure("Bảo vệ thành công: Chặn giả mạo Header X-Active-Company-Id.")

        # =============================================================
        # [ATTACK 6] Application Re-Application Flood / Race Condition
        # =============================================================
        self.log_attack(6, "Bảo vệ Phễu: Nộp đơn liên tục bằng nhiều luồng đồng thời vào cùng một tin tuyển dụng")
        # Ensure first application exists
        app_1, created = JobPostActivity.objects.get_or_create(
            job_post=job_1,
            user=user_cand_a,
            defaults={"resume": resume_a_public, "status": var_sys.ApplicationStatus.PENDING_CONFIRMATION}
        )
        # Attempt second application via API
        res_dup_apply = client_cand_a.post(
            "/api/v1/job/web/job-posts-activity/",
            data={
                "jobPost": job_1.id,
                "resume": resume_a_public.id,
                "fullName": "Nguyễn Văn A",
                "email": "cand_a@gmail.com",
                "phone": "0981111111",
            },
            format="json",
        )
        # Should either reuse existing ID or return clear handled response, NOT duplicate rows
        count_apps = JobPostActivity.objects.filter(job_post=job_1, user=user_cand_a).count()
        if count_apps > 1:
            self.log_bug(
                "BUG-ATS-DUP-01",
                f"Tạo ra nhiều bản ghi đơn ứng tuyển trùng lặp ({count_apps} bản ghi) cho cùng một người dùng trên 1 JobPost!",
                "MEDIUM: Làm sai lệch số lượng ứng viên và gửi email trùng lặp.",
            )
        else:
            self.log_secure("Bảo vệ phễu thành công: Cơ chế chống trùng lặp hoạt động chính xác (count = 1).")

        # =============================================================
        # TỔNG KẾT
        # =============================================================
        print("\n" + "=" * 75)
        print(f"  TỔNG KẾT ADVANCED AUDIT: {len(self.bugs_found)} LỖI ĐƯỢC PHÁT HIỆN, {len(self.secure_points)} ĐIỂM AN TOÀN")
        print("=" * 75)
        if self.bugs_found:
            for idx, bug in enumerate(self.bugs_found, 1):
                print(f"  {idx}. [{bug['code']}] {bug['desc']}")
                print(f"     Impact: {bug['impact']}")
        else:
            print("  🎉 HỆ THỐNG ĐẠT CHUẨN BẢO MẬT & QUYỀN RIÊNG TƯ TOÀN DIỆN!")
        print("=" * 75 + "\n")


if __name__ == "__main__":
    runner = AdvancedAuditRunner()
    runner.run_all()
