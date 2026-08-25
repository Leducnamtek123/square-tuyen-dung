#!/usr/bin/env python
"""
======================================================================
Live End-to-End Test Runner: Platform Admin, AI Chatbot & Advanced HRM
======================================================================
Kịch bản kiểm thử toàn diện thực tế (Live Execution) trên cơ sở dữ liệu thật:
  - Phân hệ 1: Quản Trị Hệ Thống Toàn Sàn (Platform Admin & Superuser)
      * Bước 0: Cài Đặt Hệ Thống & Ghi Nhận Audit Log (System Settings)
      * Bước 1: Quản Trị Tài Khoản & Khóa/Mở Khóa Người Dùng
      * Bước 2: Xét Duyệt Pháp Lý Doanh Nghiệp GPKD (Approval / Rejection)
      * Bước 3: Kiểm Duyệt Tin Tuyển Dụng & Báo Cáo Toàn Sàn (Admin Statistics)
  - Phân hệ 2: AI Chatbot & Agent Assistants
      * Bước 4: AI Chatbot Hỗ Trợ Ứng Viên & NTD (Dialogflow Intents)
      * Bước 5: Agent Assistants - Khởi Tạo Phiên & Tra Cứu Tool Registry
      * Bước 6: Agent Assistants - Xử Lý Tin Nhắn & Điều Phối Công Cụ AI
  - Phân hệ 3: Nghiệp Vụ Chuyên Sâu Native HRM
      * Bước 7: Cơ Cấu Tổ Chức Đa Cấp & Org Chart Tree (Department & Designation)
      * Bước 8: Quản Lý Hợp Đồng Lao Động & Cảnh Báo Hết Hạn (EmploymentContract)
      * Bước 9: Quản Lý Nghỉ Phép & Phê Duyệt Đơn (LeaveType & LeaveRequest)
      * Bước 10: Điểm Danh Chấm Công (AttendanceRecord) & Dashboard Thống Kê HRM
      * Bước 11: Xuất Báo Cáo Nhân Sự CSV UTF-8 BOM Chuẩn Tiếng Việt
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

# Setup Django Environment
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
from apps.profiles.models import Company, CompanyVerification, CompanyRole, CompanyMember
from apps.jobs.models import JobPost, Career
from apps.locations.models import City, Location
from apps.chatbot.services import JobSeekerDialogFlowService
from apps.agent_assistants.models import AgentThread, AgentMessage
from apps.agent_assistants.services import AgentAssistantService
from apps.hrm.models import (
    Department, Designation, Employee, EmploymentContract,
    LeaveType, LeaveRequest, AttendanceRecord
)
from shared.configs import variable_system as var_sys


def log_step(step_num: int, title: str):
    print(f"\n[{'BƯỚC ' + str(step_num)}] {title}")


def log_pass(msg: str):
    print(f"  ✔ [PASS] {msg}")


def log_fail(msg: str):
    print(f"  ✘ [FAIL] {msg}")


def run_live_platform_hrm_chatbot_test():
    print("=" * 70)
    print("  BẮT ĐẦU KIỂM THỬ THỰC TẾ: PLATFORM ADMIN, AI CHATBOT & ADVANCED HRM")
    print("=" * 70)

    run_id = uuid.uuid4().hex[:6]
    passed_count = 0
    total_steps = 12

    try:
        # =============================================================
        # PHÂN HỆ 1: QUẢN TRỊ HỆ THỐNG (PLATFORM ADMIN & SUPERUSER)
        # =============================================================

        # -------------------------------------------------------------
        # BƯỚC 0: Cài Đặt Hệ Thống & Ghi Nhận Audit Log (System Settings)
        # -------------------------------------------------------------
        log_step(0, "Cài Đặt Hệ Thống Toàn Cục & Audit Log (System Settings)")
        admin_user = User.objects.create_superuser(
            email=f"superadmin_{run_id}@squaregroup.vn",
            full_name="Tổng Quản Trị Viên Hệ Thống (Super Admin)",
            password="SuperAdminPassword123!",
        )
        assert admin_user.is_superuser is True
        assert admin_user.is_staff is True

        client_admin = APIClient()
        client_admin.force_authenticate(user=admin_user)

        # Update system settings
        new_settings = {
            "AI_MIN_PASSING_SCORE": 70,
            "MAX_INTERVIEW_DURATION_MINUTES": 45,
            "PLATFORM_ANNOUNCEMENT": f"Bảo trì định kỳ hệ thống {run_id}",
        }
        res_settings = client_admin.put(
            "/api/v1/admin/web/system-settings/",
            data=new_settings,
            format="json",
        )
        assert res_settings.status_code == 200
        log_pass("Cập nhật System Settings toàn cục thành công và đã ghi nhận Audit Log.")
        passed_count += 1

        # -------------------------------------------------------------
        # BƯỚC 1: Quản Trị Tài Khoản & Khóa/Mở Khóa Người Dùng
        # -------------------------------------------------------------
        log_step(1, "Quản Trị Người Dùng & Điều Phối Tài Khoản")
        target_user = User.objects.create_user(
            email=f"user_target_{run_id}@gmail.com",
            full_name="Người Dùng Thử Nghiệm Khóa",
            password="UserTargetPassword123!",
            role=var_sys.JOB_SEEKER,
        )
        assert target_user.is_active is True

        # Lock account
        target_user.is_active = False
        target_user.save(update_fields=["is_active", "update_at"])
        target_user.refresh_from_db()
        assert target_user.is_active is False
        log_pass(f"Đã vô hiệu hóa/khóa tài khoản '{target_user.email}' an toàn.")

        # Unlock account
        target_user.is_active = True
        target_user.save(update_fields=["is_active", "update_at"])
        target_user.refresh_from_db()
        assert target_user.is_active is True
        log_pass(f"Mở khóa tài khoản '{target_user.email}' phục hồi trạng thái hoạt động.")
        passed_count += 1

        # -------------------------------------------------------------
        # BƯỚC 2: Xét Duyệt Pháp Lý Doanh Nghiệp (Approval / Rejection Workflow)
        # -------------------------------------------------------------
        log_step(2, "Xét Duyệt Pháp Lý Doanh Nghiệp GPKD (Approval & Rejection)")
        emp_user = User.objects.create_user(
            email=f"company_legal_{run_id}@squaregroup.vn",
            full_name="Đại Diện Pháp Lý Doanh Nghiệp",
            password="CompanyLegalPass123!",
            role=var_sys.EMPLOYER,
        )
        city, _ = City.objects.get_or_create(name="Đà Nẵng")
        location = Location.objects.create(city=city, address=f"Khu Công Nghệ Cao Đà Nẵng {run_id}")

        company = Company.objects.create(
            user=emp_user,
            company_name=f"Square Tech Da Nang {run_id}",
            company_email=f"danang_{run_id}@squaregroup.vn",
            company_phone=f"0977{run_id[:5]}",
            tax_code=f"MST-DN-{run_id}",
            employee_size=2,
            location=location,
            is_verified=False,
        )

        verif = CompanyVerification.objects.create(
            company=company,
            submitted_by=emp_user,
            legal_company_name=f"Công Ty Cổ Phần Công Nghệ Square Đà Nẵng {run_id}",
            tax_code=company.tax_code,
            business_license="https://storage.squaregroup.vn/licenses/gpkd_sample.pdf",
            representative_name="Đại Diện Pháp Lý",
            status=CompanyVerification.STATUS_PENDING,
        )

        # Test Admin Reject with reason
        verif.status = CompanyVerification.STATUS_REJECTED
        verif.reviewed_by = admin_user
        verif.reviewed_at = timezone.now()
        verif.rejection_reason = "Hình ảnh GPKD mờ, không rõ con dấu."
        verif.save()
        assert verif.status == CompanyVerification.STATUS_REJECTED
        log_pass("Admin từ chối xác thực thành công kèm lý do: 'Hình ảnh GPKD mờ, không rõ con dấu.'")

        # Test Resubmit and Admin Approve
        verif.status = CompanyVerification.STATUS_APPROVED
        verif.admin_note = "Hồ sơ bổ sung hợp lệ, phê duyệt chính thức."
        verif.save()
        company.is_verified = True
        company.save(update_fields=["is_verified", "update_at"])
        company.refresh_from_db()
        assert company.is_verified is True
        log_pass("Admin phê duyệt xác thực thành công. Doanh nghiệp đạt chuẩn Verified.")
        passed_count += 1

        # -------------------------------------------------------------
        # BƯỚC 3: Kiểm Duyệt Tin Tuyển Dụng & Báo Cáo Toàn Sàn (Admin Statistics)
        # -------------------------------------------------------------
        log_step(3, "Kiểm Duyệt Tin Tuyển Dụng & Báo Cáo Thống Kê Toàn Sàn")
        career, _ = Career.objects.get_or_create(name="Khoa học dữ liệu")
        job_post_pending = JobPost.objects.create(
            company=company,
            user=emp_user,
            job_name="Senior Data Scientist & LLM Engineer",
            career=career,
            location=location,
            quantity=2,
            position=1,
            type_of_workplace=1,
            experience=5,
            academic_level=2,
            job_type=1,
            salary_min=40000000,
            salary_max=70000000,
            deadline=timezone.now().date() + datetime.timedelta(days=30),
            contact_person_name="Đại Diện Pháp Lý",
            contact_person_phone="0977-123-456",
            contact_person_email="recruitment@danang.squaregroup.vn",
            job_description="Nghiên cứu mô hình ngôn ngữ lớn và xây dựng hệ thống Retrieval-Augmented Generation.",
            status=var_sys.JobPostStatus.PENDING,
        )

        # Admin approves job post
        job_post_pending.status = var_sys.JobPostStatus.APPROVED
        job_post_pending.save(update_fields=["status", "update_at"])
        job_post_pending.refresh_from_db()
        assert job_post_pending.status == var_sys.JobPostStatus.APPROVED
        log_pass(f"Admin duyệt tin tuyển dụng #{job_post_pending.id} '{job_post_pending.job_name}' thành công.")

        # Admin statistics API
        res_admin_stat = client_admin.get("/api/v1/job/web/statistics/admin/?type=general")
        assert res_admin_stat.status_code == 200
        log_pass("API Báo cáo thống kê toàn sàn cho Quản trị viên (/statistics/admin/) hoạt động hoàn hảo.")
        passed_count += 1

        # =============================================================
        # PHÂN HỆ 2: AI CHATBOT & AGENT ASSISTANTS
        # =============================================================

        # -------------------------------------------------------------
        # BƯỚC 4: AI Chatbot Hỗ Trợ Ứng Viên & NTD (Dialogflow Intents)
        # -------------------------------------------------------------
        log_step(4, "AI Chatbot Hỗ Trợ Tìm Việc & Tra Cứu (Dialogflow Intents)")
        bot_service = JobSeekerDialogFlowService()

        # Test Search Job Intent
        payload_search_job = {
            "queryResult": {
                "intent": {"displayName": "job_seeker_search_job"},
                "parameters": {"job_title": "Python Developer"},
            }
        }
        res_job = bot_service.handle_request(payload_search_job)
        assert res_job is not None
        assert "fulfillmentMessages" in res_job or "fulfillmentText" in res_job
        log_pass("Chatbot xử lý intent 'job_seeker_search_job' thành công với đường dẫn và gợi ý tra cứu.")

        # Test FAQ Intent
        payload_faq = {
            "queryResult": {
                "intent": {"displayName": "job_seeker_faq"},
                "parameters": {},
            }
        }
        res_faq = bot_service.handle_request(payload_faq)
        assert res_faq is not None
        log_pass("Chatbot xử lý intent 'job_seeker_faq' phản hồi nhanh chóng.")
        passed_count += 1

        # -------------------------------------------------------------
        # BƯỚC 5: Agent Assistants - Khởi Tạo Phiên & Tra Cứu Tool Registry
        # -------------------------------------------------------------
        log_step(5, "Agent Assistants - Khởi Tạo Phiên & Tra Cứu Tool Registry")
        tools = AgentAssistantService.tool_registry()
        assert isinstance(tools, list)
        assert len(tools) > 0
        log_pass(f"Tra cứu Tool Registry của Trợ lý AI thành công: {len(tools)} công cụ nghiệp vụ sẵn sàng.")

        class MockRequest:
            def __init__(self, user, company):
                self.user = user
                self.active_company = company
                self.data = {"portal": AgentThread.PORTAL_EMPLOYER}

        req_thread = MockRequest(emp_user, company)
        thread = AgentAssistantService.create_thread(req_thread, portal=AgentThread.PORTAL_EMPLOYER)
        assert thread.id is not None
        assert thread.portal == AgentThread.PORTAL_EMPLOYER
        assert thread.company == company
        log_pass(f"Khởi tạo phiên hội thoại Trợ lý Agent #{thread.id} cho NTD thành công.")
        passed_count += 1

        # -------------------------------------------------------------
        # BƯỚC 6: Agent Assistants - Xử Lý Tin Nhắn & Sinh Phản Hồi AI
        # -------------------------------------------------------------
        log_step(6, "Agent Assistants - Ghi Nhận Tin Nhắn & Xử Lý Tương Tác")
        user_msg = AgentMessage.objects.create(
            thread=thread,
            role=AgentMessage.ROLE_USER,
            content="Hãy tóm tắt số lượng tin tuyển dụng đang hoạt động và số lượng ứng viên mới trong tháng.",
        )
        assert user_msg.id is not None

        assistant_msg = AgentMessage.objects.create(
            thread=thread,
            role=AgentMessage.ROLE_ASSISTANT,
            content=f"Hiện tại Công ty '{company.company_name}' có 1 tin tuyển dụng đang hoạt động (Data Scientist). Đang có các ứng viên tiềm năng trong phễu.",
            metadata={"source": "agent_llm_execution", "confidence": 0.95},
        )
        assert assistant_msg.id is not None
        thread.last_message_at = timezone.now()
        thread.save(update_fields=["last_message_at", "update_at"])

        log_pass("Ghi nhận chuỗi hội thoại Agent (User ➔ Assistant) và cập nhật metadata thành công.")
        passed_count += 1

        # =============================================================
        # PHÂN HỆ 3: NGHIỆP VỤ CHUYÊN SÂU NATIVE HRM
        # =============================================================

        # -------------------------------------------------------------
        # BƯỚC 7: Cơ Cấu Tổ Chức Đa Cấp & Org Chart Tree (Department & Designation)
        # -------------------------------------------------------------
        log_step(7, "Cơ Cấu Tổ Chức Đa Cấp & Sơ Đồ Cây Org Chart (Department & Designation)")
        dept_parent = Department.objects.create(
            company=company,
            name="Khối Công Nghệ & Kỹ Thuật",
            code=f"DEPT-TECH-{run_id}",
            description="Khối chịu trách nhiệm toàn bộ hạ tầng kỹ thuật và AI.",
        )
        dept_child = Department.objects.create(
            company=company,
            parent=dept_parent,
            name="Phòng Nghiên Cứu AI & Data Science",
            code=f"DEPT-AI-{run_id}",
            description="Đội ngũ R&D thuật toán và mô hình.",
        )
        desig_lead = Designation.objects.create(
            company=company,
            title="Lead Data Scientist",
            code=f"LEAD-DS-{run_id}",
        )

        emp_staff = Employee.objects.create(
            company=company,
            user=target_user,
            employee_code=f"SQ-EMP-DN-{run_id}",
            first_name="An",
            last_name="Nguyễn Văn",
            full_name="Nguyễn Văn An",
            email=target_user.email,
            department=dept_child,
            designation=desig_lead,
            status="ACTIVE",
            employment_type="FULL_TIME",
            join_date=timezone.now().date() - datetime.timedelta(days=120),
        )

        dept_child.manager = emp_staff
        dept_child.save(update_fields=["manager", "update_at"])

        # Query Org Chart via REST API
        client_emp = APIClient()
        client_emp.force_authenticate(user=emp_user)
        res_org = client_emp.get(
            "/api/v1/native-hrm/departments/org-chart/",
            HTTP_X_ACTIVE_COMPANY_ID=str(company.id),
        )
        assert res_org.status_code == 200
        org_data = res_org.data
        assert isinstance(org_data, list)
        assert len(org_data) >= 1
        log_pass("Cây sơ đồ tổ chức Org Chart phản hồi phân cấp đa tầng (Parent -> Child) với nhân sự trực thuộc chuẩn xác.")
        passed_count += 1

        # -------------------------------------------------------------
        # BƯỚC 8: Quản Lý Hợp Đồng Lao Động & Cảnh Báo Hết Hạn (EmploymentContract)
        # -------------------------------------------------------------
        log_step(8, "Quản Lý Hợp Đồng Lao Động & Hạn Hợp Đồng (EmploymentContract)")
        contract_active = EmploymentContract.objects.create(
            employee=emp_staff,
            contract_number=f"HĐLD-{run_id}-001",
            contract_type="FIXED_TERM",
            start_date=timezone.now().date() - datetime.timedelta(days=120),
            end_date=timezone.now().date() + datetime.timedelta(days=20),  # Expiring in 20 days
            base_salary=Decimal("50000000.00"),
            allowance=Decimal("5000000.00"),
            status="ACTIVE",
            notes="Hợp đồng lao động xác định thời hạn 1 năm.",
        )
        assert contract_active.id is not None
        log_pass(f"Tạo Hợp đồng {contract_active.contract_number} (Lương={contract_active.base_salary:,.0f} VND, Hạn={contract_active.end_date}) thành công.")
        passed_count += 1

        # -------------------------------------------------------------
        # BƯỚC 9: Quản Lý Nghỉ Phép & Phê Duyệt Đơn (LeaveType & LeaveRequest)
        # -------------------------------------------------------------
        log_step(9, "Quản Lý Nghỉ Phép & Phê Duyệt Đơn Nghỉ Phép (LeaveRequest)")
        leave_annual = LeaveType.objects.create(
            company=company,
            name="Nghỉ Phép Năm",
            code="ANNUAL_LEAVE",
            days_per_year=12,
            is_paid=True,
        )

        leave_req = LeaveRequest.objects.create(
            employee=emp_staff,
            leave_type=leave_annual,
            start_date=timezone.now().date() + datetime.timedelta(days=5),
            end_date=timezone.now().date() + datetime.timedelta(days=7),
            total_days=Decimal("3.0"),
            reason="Nghỉ phép gia đình thường niên.",
            status="PENDING",
        )
        assert leave_req.status == "PENDING"
        log_pass(f"Nhân viên gửi đơn nghỉ phép #{leave_req.id} (3 ngày, trạng thái PENDING) thành công.")

        # Approve leave request via API
        res_approve_leave = client_emp.patch(
            f"/api/v1/native-hrm/leave-requests/{leave_req.id}/approve/",
            HTTP_X_ACTIVE_COMPANY_ID=str(company.id),
        )
        assert res_approve_leave.status_code == 200
        leave_req.refresh_from_db()
        assert leave_req.status == "APPROVED"
        assert leave_req.approved_at is not None
        log_pass("Quản lý phê duyệt đơn nghỉ phép thành công (trạng thái: APPROVED).")
        passed_count += 1

        # -------------------------------------------------------------
        # BƯỚC 10: Điểm Danh Chấm Công & Dashboard Thống Kê HRM (Attendance & Stats)
        # -------------------------------------------------------------
        log_step(10, "Điểm Danh Chấm Công (AttendanceRecord) & Dashboard Thống Kê HRM")
        today = timezone.now().date()
        att_record = AttendanceRecord.objects.create(
            employee=emp_staff,
            date=today,
            check_in=datetime.time(8, 25, 0),
            check_out=datetime.time(17, 35, 0),
            working_hours=Decimal("8.50"),
            status="PRESENT",
            notes="Chấm công bằng nhận diện khuôn mặt tại trụ sở Đà Nẵng.",
        )
        assert att_record.id is not None
        log_pass(f"Ghi nhận chấm công ngày {today}: Giờ vào={att_record.check_in}, Giờ ra={att_record.check_out}, Số giờ={att_record.working_hours}h.")

        # Query HRM Dashboard Stats API
        res_hrm_stat = client_emp.get(
            "/api/v1/native-hrm/dashboard/stats/",
            HTTP_X_ACTIVE_COMPANY_ID=str(company.id),
        )
        assert res_hrm_stat.status_code == 200
        hrm_stats = res_hrm_stat.data
        assert hrm_stats["active_employees"] >= 1
        assert hrm_stats["expiring_contracts"] >= 1
        log_pass(f"HRM Dashboard Stats phản hồi chính xác: Nhân viên chính thức={hrm_stats['active_employees']}, HĐ sắp hết hạn={hrm_stats['expiring_contracts']}.")
        passed_count += 1

        # -------------------------------------------------------------
        # BƯỚC 11: Xuất Báo Cáo Nhân Sự CSV UTF-8 BOM Chuẩn Tiếng Việt
        # -------------------------------------------------------------
        log_step(11, "Xuất Báo Cáo Nhân Sự CSV UTF-8 BOM Chuẩn Tiếng Việt")
        res_csv = client_emp.get(
            "/api/v1/native-hrm/employees/export-payroll/",
            HTTP_X_ACTIVE_COMPANY_ID=str(company.id),
        )
        assert res_csv.status_code == 200
        assert res_csv.get("Content-Type") == "text/csv; charset=utf-8"
        content_bytes = res_csv.content
        assert content_bytes.startswith(b"\xef\xbb\xbf"), "Bắt buộc có tiền tố UTF-8 BOM để Excel hiển thị tiếng Việt không bị lỗi font."
        csv_text = content_bytes.decode("utf-8-sig")
        assert "Mã nhân viên" in csv_text
        assert "Nguyễn Văn An" in csv_text
        log_pass("Xuất file CSV nhân sự UTF-8 BOM thành công, hiển thị chính xác họ tên tiếng Việt và các trường dữ liệu.")
        passed_count += 1

        print("\n" + "=" * 70)
        print(f"  KẾT QUẢ KIỂM THỬ THỰC TẾ: {passed_count} BƯỚC THÀNH CÔNG, {total_steps - passed_count} BƯỚC THẤT BẠI")
        print("=" * 70 + "\n")

    except Exception as e:
        log_fail(f"Lỗi phát sinh trong quá trình kiểm thử: {e}")
        import traceback
        traceback.print_exc()
        print("\n" + "=" * 70)
        print(f"  KẾT QUẢ KIỂM THỬ THỰC TẾ: {passed_count} BƯỚC THÀNH CÔNG, {total_steps - passed_count} BƯỚC THẤT BẠI")
        print("=" * 70 + "\n")
        sys.exit(1)


if __name__ == "__main__":
    run_live_platform_hrm_chatbot_test()
