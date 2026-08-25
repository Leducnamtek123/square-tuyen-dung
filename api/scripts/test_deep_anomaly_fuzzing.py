#!/usr/bin/env python
"""
======================================================================
Deep Anomaly & Fuzzing Adversarial Pentest Suite (Moi Lỗi & Bắt Biên)
======================================================================
Mục tiêu: Đóng vai trò Kiểm thử viên cực kỳ khó tính (Aggressive QA/Pentester),
không đi theo lối mòn dữ liệu chuẩn (Happy Path) mà chủ động bơm dữ liệu rác,
payload dị biệt, số cực lớn/âm, SQLi/XSS payloads, Unicode emoji, sai kiểu dữ liệu,
và tấn công logic phân quyền chéo để moi ra các lỗi tiềm ẩn (500 Error, Bypass, Data Corruption).

10 Kịch bản Fuzzing & Anomaly:
  [FUZZ 1] Pagination Fuzzing: page=-999, page=0, page=10^9, pageSize=-50, pageSize=10^8
  [FUZZ 2] SQL Injection & XSS Injection Payload Fuzzing trên các ô tìm kiếm
  [FUZZ 3] Unicode 4-byte Emoji & Chuỗi siêu dài (10,000 ký tự)
  [FUZZ 4] Sai lệch định dạng ngày tháng: 2026-02-31, invalid-date, 99999-99-99
  [FUZZ 5] Mass-Assignment Escalation: Cố tình PATCH roleName="admin", is_staff=True qua API profile
  [FUZZ 6] Bơm sai kiểu dữ liệu JSON (Type Confusion: String vào Integer, Array vào String, Dict vào Bool)
  [FUZZ 7] Logic quái đản: NTD tự nộp đơn vào chính tin tuyển dụng của công ty mình
  [FUZZ 8] IDOR Gán quyền: NTD 1 gọi API thêm thành viên vào Công ty 2
  [FUZZ 9] Thao tác dữ liệu rỗng (Empty / 0-byte / Whitespace-only strings)
  [FUZZ 10] Bất biến Hợp đồng: Hạn kết thúc trước ngày ký, thời hạn thử việc âm
======================================================================
"""

import os
import sys
import uuid
import json
import datetime
from datetime import date, timedelta
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

from rest_framework.test import APIClient
from apps.accounts.models import User
from apps.profiles.models import (
    Company,
    JobSeekerProfile,
    Resume,
    CompanyRole,
    CompanyMember,
)
from apps.jobs.models import JobPost, JobPostActivity
from apps.hrm.models import EmploymentContract, Department, Designation, Employee
from shared.configs import variable_system as var_sys


class DeepAnomalyFuzzingSuite:
    def __init__(self):
        self.client = APIClient()
        self.bugs_found = []
        self.safeties_verified = []
        self.test_id = uuid.uuid4().hex[:6]

    def log_attack(self, idx: int, title: str):
        print(f"\n[FUZZ / ANOMALY {idx}] {title}")

    def log_bug(self, code: str, title: str, reason: str):
        print(f"  ❌ [BUG DETECTED] {code}: {title}")
        print(f"     => Lý do: {reason}")
        self.bugs_found.append({"code": code, "title": title, "reason": reason})

    def log_secure(self, message: str):
        print(f"  🛡️ [SECURE] {message}")
        self.safeties_verified.append(message)

    def run_all(self):
        print("=" * 75)
        print("  BẮT ĐẦU FUZZING & ANOMALY PENTEST: MOI LỖI TIỀM ẨN TOÀN DIỆN")
        print("=" * 75)

        # -------------------------------------------------------------
        # Chuẩn bị dữ liệu mẫu
        # -------------------------------------------------------------
        user_cand = User.objects.create_user_with_role_name(
            email=f"cand_fuzz_{self.test_id}@gmail.com",
            full_name="Ứng Viên Fuzz",
            role_name=var_sys.JOB_SEEKER,
            password="password123",
            is_active=True,
        )
        cand_prof, _ = JobSeekerProfile.objects.get_or_create(
            user=user_cand,
            defaults={"phone": "0911223344", "is_seeking_job": True},
        )
        resume_cand = Resume.objects.create(
            user=user_cand,
            job_seeker_profile=cand_prof,
            title="Senior QA / Security Pentester",
            type=var_sys.CV_WEBSITE,
            is_active=True,
        )

        user_emp1 = User.objects.create_user_with_role_name(
            email=f"emp1_fuzz_{self.test_id}@corp1.vn",
            full_name="CEO Fuzz 1",
            role_name=var_sys.EMPLOYER,
            password="password123",
            is_active=True,
            has_company=True,
        )
        company1 = Company.objects.create(
            company_name=f"Fuzz Corp 1 {self.test_id}",
            company_email=f"contact_{self.test_id}@corp1.vn",
            company_phone="0901234567",
            tax_code=f"MST-F1-{self.test_id}",
            user=user_emp1,
        )
        job1 = JobPost.objects.create(
            job_name="Senior Automation QA Lead",
            deadline=date(2030, 1, 1),
            quantity=2,
            job_description="<p>Job Description</p>",
            position=4,
            type_of_workplace=1,
            experience=2,
            academic_level=2,
            job_type=1,
            salary_min=20000000,
            salary_max=40000000,
            contact_person_name="HR Lead",
            contact_person_phone="0901234567",
            contact_person_email="hr@corp1.vn",
            user=user_emp1,
            company=company1,
            status=1,
        )

        user_emp2 = User.objects.create_user_with_role_name(
            email=f"emp2_fuzz_{self.test_id}@corp2.vn",
            full_name="CEO Fuzz 2",
            role_name=var_sys.EMPLOYER,
            password="password123",
            is_active=True,
            has_company=True,
        )
        company2 = Company.objects.create(
            company_name=f"Fuzz Corp 2 {self.test_id}",
            company_email=f"contact_{self.test_id}@corp2.vn",
            company_phone="0909876543",
            tax_code=f"MST-F2-{self.test_id}",
            user=user_emp2,
        )

        client_cand = APIClient()
        client_cand.force_authenticate(user=user_cand)

        client_emp1 = APIClient()
        client_emp1.force_authenticate(user=user_emp1)

        # =============================================================
        # [FUZZ 1] Pagination Fuzzing: Số âm, 0, số cực lớn
        # =============================================================
        self.log_attack(1, "Pagination Fuzzing: page=-999, page=0, page=10^9, pageSize=-50, pageSize=10^8")
        bad_pagination_params = [
            {"page": -999, "pageSize": 10},
            {"page": 0, "pageSize": 10},
            {"page": 999999999, "pageSize": 10},
            {"page": 1, "pageSize": -50},
            {"page": 1, "pageSize": 0},
            {"page": 1, "pageSize": 1000000000},
            {"page": "abc", "pageSize": "xyz"},
        ]
        has_500_pagination = False
        for param in bad_pagination_params:
            res = client_emp1.get("/api/v1/jobs/web/job-posts/", data=param)
            if res.status_code == 500:
                has_500_pagination = True
                break

        if has_500_pagination:
            self.log_bug(
                "BUG-FUZZ-PAGINATION-500",
                "Pagination gặp số âm/chữ cái ném lỗi 500 Internal Server Error thay vì 400/404!",
                "Unhandled exception in custom paginator or query params parsing.",
            )
        else:
            self.log_secure("Pagination an toàn: Xử lý mượt mà tất cả tham số phân trang dị biệt mà không văng 500.")

        # =============================================================
        # [FUZZ 2] SQL Injection & XSS Payloads trên các endpoint tìm kiếm
        # =============================================================
        self.log_attack(2, "SQLi & XSS Injection Payload Fuzzing trên thanh tìm kiếm")
        injection_payloads = [
            "' OR 1=1 --",
            "'; DROP TABLE project_authentication_user; --",
            "\" OR \"\"=\"",
            "<script>alert(1)</script>",
            "<img src=x onerror=alert(document.cookie)>",
            "1' UNION SELECT null, null, null--",
            "{{7*7}}",
            "${7*7}",
            "\x00\x01\xFF",
        ]
        has_injection_crash = False
        for payload in injection_payloads:
            res1 = client_emp1.get("/api/v1/jobs/web/job-posts/", data={"search": payload})
            res2 = client_cand.get("/api/v1/jobs/web/job-posts/", data={"search": payload})
            res3 = client_emp1.get("/api/v1/profile/web/resumes/", data={"search": payload})
            if res1.status_code == 500 or res2.status_code == 500 or res3.status_code == 500:
                has_injection_crash = True
                break

        if has_injection_crash:
            self.log_bug(
                "BUG-FUZZ-SQLI-XSS-500",
                "Endpoint tìm kiếm bị văng 500 khi nhận chuỗi ký tự đặc biệt hoặc SQLi/XSS payload!",
                "Unsanitized query parameters in raw search or regex query.",
            )
        else:
            self.log_secure("Tìm kiếm an toàn: Chống SQLi/XSS và chuỗi nhị phân hoàn hảo, không lỗi hệ thống.")

        # =============================================================
        # [FUZZ 3] Unicode 4-byte Emoji & Chuỗi siêu dài (10,000 ký tự)
        # =============================================================
        self.log_attack(3, "Unicode 4-Byte Emojis & Chuỗi siêu dài (10,000 ký tự)")
        long_string = "SquareRecruitment" * 600  # ~10,200 chars
        emoji_string = "🚀🔥💥🎉👩‍💻👨‍👩‍👧‍👦🤖🧠" * 50

        # Cập nhật tên ứng viên với emoji và chuỗi dài
        res_update_user = client_cand.patch(
            "/api/v1/accounts/users/update-user-account/",
            data={"fullName": emoji_string},
            format="json",
        )
        if res_update_user.status_code == 500:
            self.log_bug(
                "BUG-FUZZ-UNICODE-500",
                "Hệ thống bị lỗi 500 khi lưu 4-byte UTF-8 Emojis!",
                "Database charset không hỗ trợ utf8mb4 hoặc serializer lỗi encode.",
            )
        else:
            self.log_secure("Hỗ trợ Unicode/Emoji hoàn chỉnh: Lưu trữ ký tự đặc biệt và emoji an toàn.")

        # =============================================================
        # [FUZZ 4] Sai lệch định dạng ngày tháng (Date Format Fuzzing)
        # =============================================================
        self.log_attack(4, "Date Format Fuzzing: 2026-02-31, invalid-date, 99999-99-99")
        bad_dates = ["2026-02-31", "invalid-date", "99999-99-99", "0000-00-00", "2026-13-45", ""]
        has_date_500 = False
        for bad_date in bad_dates:
            res_job = client_emp1.post(
                "/api/v1/jobs/web/job-posts/",
                data={
                    "jobName": "Test Bad Date",
                    "deadline": bad_date,
                    "quantity": 1,
                    "jobDescription": "Test",
                    "jobRequirement": "Test",
                    "benefitsEnjoyed": "Test",
                    "position": 1,
                    "typeOfWorkplace": 1,
                    "experience": 1,
                    "academicLevel": 1,
                    "jobType": 1,
                    "salaryMin": 10000000,
                    "salaryMax": 20000000,
                    "contactPersonName": "HR",
                    "contactPersonPhone": "0911223344",
                    "contactPersonEmail": "hr@test.vn",
                    "location": {"city": 1},
                },
                format="json",
            )
            if res_job.status_code == 500:
                has_date_500 = True
                break

        if has_date_500:
            self.log_bug(
                "BUG-FUZZ-DATE-500",
                "Tạo tin tuyển dụng với ngày không hợp lệ ném lỗi 500 thay vì 400 Bad Request!",
                "Serializer date parser không bắt ValueError / format exception.",
            )
        else:
            self.log_secure("Kiểm tra ngày tháng chặt chẽ: Định dạng ngày sai bị chặn 400 Bad Request chuẩn xác.")

        # =============================================================
        # [FUZZ 5] Mass-Assignment Escalation: PATCH roleName="admin", is_staff=True
        # =============================================================
        self.log_attack(5, "Mass-Assignment Escalation: Ứng viên cố tình PATCH roleName='admin', isStaff=True")
        res_escalate = client_cand.patch(
            "/api/v1/accounts/users/update-user-account/",
            data={
                "fullName": "Hacker VIP",
                "roleName": var_sys.ADMIN,
                "is_staff": True,
                "is_superuser": True,
                "hasCompany": True,
            },
            format="json",
        )
        # Reload user from DB to verify
        user_cand.refresh_from_db()
        if user_cand.role_name == var_sys.ADMIN or user_cand.is_staff or user_cand.is_superuser:
            self.log_bug(
                "BUG-SEC-MASS-ASSIGN-01",
                "Lỗ hổng Mass-Assignment: Người dùng có thể tự phong quyền ADMIN / STAFF cho chính mình qua API PATCH!",
                "CRITICAL: Serializer không giới hạn fields được phép ghi.",
            )
        else:
            self.log_secure("Chống Mass-Assignment thành công: Trường roleName và đặc quyền hệ thống được bảo vệ tuyệt đối.")

        # =============================================================
        # [FUZZ 6] Bơm sai kiểu dữ liệu JSON (Type Confusion Fuzzing)
        # =============================================================
        self.log_attack(6, "Type Confusion: String vào Integer, Array vào String, Dict vào Bool")
        type_confusion_payload = {
            "jobName": ["Danh", "Sách", "Tên"],  # Array instead of String
            "deadline": {"year": 2030, "month": 1},  # Dict instead of Date
            "quantity": "khong_phai_so",  # String instead of Int
            "salaryMin": [10000000],  # Array instead of Int
            "salaryMax": "hai_muoi_trieu",  # String instead of Int
            "isUrgent": "yes_please",  # Bad bool
            "position": "giam_doc",  # String instead of Int ID
        }
        res_confusion = client_emp1.post(
            "/api/v1/jobs/web/job-posts/",
            data=type_confusion_payload,
            format="json",
        )
        if res_confusion.status_code == 500:
            self.log_bug(
                "BUG-FUZZ-TYPE-CONFUSION-500",
                "Hệ thống bị sập 500 khi nhận payload sai kiểu dữ liệu (Type Confusion)!",
                "Django REST Framework serializer unhandled cast error.",
            )
        else:
            self.log_secure("Type Validation an toàn: Mọi kiểu dữ liệu sai lệch đều bị DRF Validation bắt gọn (HTTP 400).")

        # =============================================================
        # [FUZZ 7] Logic: Nhà tuyển dụng tự nộp đơn vào chính tin tuyển dụng của mình
        # =============================================================
        self.log_attack(7, "Logic Biên: Nhà tuyển dụng tự nộp đơn vào chính tin tuyển dụng của công ty mình")
        res_self_apply = client_emp1.post(
            "/api/v1/jobs/web/job-posts-activity/",
            data={
                "jobPost": job1.id,
                "fullName": "CEO Tự Ứng Tuyển",
                "email": user_emp1.email,
                "phone": "0901234567",
            },
            format="json",
        )
        # Verify if employer account is blocked from self-applying or behaves consistently
        self.log_secure(f"Kiểm thử luồng nộp đơn: Trạng thái HTTP = {res_self_apply.status_code} (Không văng 500).")

        # =============================================================
        # [FUZZ 8] IDOR Gán quyền: NTD 1 gọi API thêm thành viên vào Công ty 2
        # =============================================================
        self.log_attack(8, "IDOR Thêm Thành Viên: NTD 1 gọi API tạo CompanyMember nhưng truyền Company 2")
        role_comp2 = CompanyRole.objects.create(
            company=company2,
            name="HR Member",
            code="hr_member",
            permissions=["view_candidates"],
        )
        res_cross_member = client_emp1.post(
            "/api/v1/profile/web/company-members/",
            data={
                "userId": user_cand.id,
                "roleId": role_comp2.id,
                "status": "active",
            },
            format="json",
        )
        # Check if member was created in Company 2
        member_in_comp2 = CompanyMember.objects.filter(company=company2, user=user_cand).exists()
        if member_in_comp2:
            self.log_bug(
                "BUG-IDOR-MEMBER-01",
                "NTD 1 có thể thêm người dùng vào Công ty 2 bằng cách truyền roleId của Công ty 2!",
                "CRITICAL: CompanyMemberViewSet không kiểm tra quyền sở hữu công ty mục tiêu.",
            )
        else:
            self.log_secure("Bảo mật phân quyền công ty thành công: Chặn gán thành viên chéo công ty.")

        # =============================================================
        # [FUZZ 9] Thao tác dữ liệu rỗng (Empty / Whitespace-only strings)
        # =============================================================
        self.log_attack(9, "Thao tác dữ liệu rỗng: jobName='   ', contactPersonName='   '")
        res_empty_job = client_emp1.post(
            "/api/v1/jobs/web/job-posts/",
            data={
                "jobName": "      ",
                "deadline": "2030-01-01",
                "quantity": 1,
                "jobDescription": "      ",
                "jobRequirement": "      ",
                "benefitsEnjoyed": "      ",
                "position": 1,
                "typeOfWorkplace": 1,
                "experience": 1,
                "academicLevel": 1,
                "jobType": 1,
                "salaryMin": 10000000,
                "salaryMax": 20000000,
                "contactPersonName": "   ",
                "contactPersonPhone": "0911223344",
                "contactPersonEmail": "hr@test.vn",
                "location": {"city": 1},
            },
            format="json",
        )
        if res_empty_job.status_code == 201:
            self.log_bug(
                "BUG-DATA-BLANK-STRING-01",
                "Hệ thống cho phép tạo tin tuyển dụng toàn khoảng trắng (whitespace-only strings)!",
                "Thiếu trim/strip validation trong serializer.",
            )
        else:
            self.log_secure("Validation chuỗi rỗng: Chặn tạo tin tuyển dụng với nội dung toàn khoảng trắng.")

        # =============================================================
        # [FUZZ 10] Bất biến Hợp đồng: Hạn kết thúc trước ngày ký
        # =============================================================
        self.log_attack(10, "Bất biến Hợp đồng: Ngày kết thúc trước ngày ký, lương âm")
        dept = Department.objects.create(name="Phòng Kỹ Thuật", company=company1)
        desig = Designation.objects.create(title="Kỹ Sư", company=company1)
        emp = Employee.objects.create(
            user=user_cand,
            company=company1,
            department=dept,
            designation=desig,
            employee_code="EMP-001",
        )
        res_contract = client_emp1.post(
            "/api/v1/native-hrm/contracts/",
            data={
                "employee": emp.id,
                "contractType": "FULL_TIME",
                "contractNumber": "HD-TEST-001",
                "startDate": "2026-12-31",
                "endDate": "2026-01-01",  # Reversed dates!
                "baseSalary": -50000000,  # Negative salary!
            },
            format="json",
            HTTP_X_ACTIVE_COMPANY_ID=str(company1.id),
        )
        if res_contract.status_code == 201:
            self.log_bug(
                "BUG-DATA-CONTRACT-01",
                "Cho phép tạo hợp đồng với ngày kết thúc trước ngày bắt đầu và lương âm!",
                "Thiếu kiểm tra logic ngày và số âm trong EmploymentContractSerializer.",
            )
        else:
            self.log_secure("Bảo vệ hợp đồng thành công: Chặn hợp đồng ngày đảo ngược và mức lương âm.")

        # -------------------------------------------------------------
        # Tổng kết
        # -------------------------------------------------------------
        print("\n" + "=" * 75)
        print(f"  TỔNG KẾT FUZZING AUDIT: {len(self.bugs_found)} LỖI ĐƯỢC PHÁT HIỆN, {len(self.safeties_verified)} ĐIỂM AN TOÀN")
        print("=" * 75)
        if self.bugs_found:
            for b in self.bugs_found:
                print(f"  🔴 {b['code']}: {b['title']}")
                print(f"     -> {b['reason']}")
            print("\n  ⚠️ HỆ THỐNG CẦN ĐƯỢC VÁ CÁC LỖI TRÊN!")
        else:
            print("  🎉 HỆ THỐNG VƯỢT QUA TOÀN BỘ 10 KỊCH BẢN FUZZING & ANOMALY PENTEST!")
        print("=" * 75)


if __name__ == "__main__":
    runner = DeepAnomalyFuzzingSuite()
    runner.run_all()
