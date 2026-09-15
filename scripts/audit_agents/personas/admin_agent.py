import time
import os
from typing import Dict, Any, Optional
from scripts.audit_agents.personas.base_agent import BaseAgent
from scripts.audit_agents.config import BASE_URL, CREDENTIALS

class AdminAgent(BaseAgent):
    def __init__(self, context, telemetry):
        super().__init__(context, telemetry)
        self.creds = CREDENTIALS["ADMIN"]

    def login(self) -> bool:
        self.log("Bắt đầu đăng nhập Quản trị viên (Admin)...")
        target_url = f"{BASE_URL}/admin/login"
        self.goto(target_url)
        self.wait_network_settle(3000)

        # Fill credentials
        email_selector = "input[placeholder*='email' i], input[type='email'], input[name='username']"
        password_selector = "input[type='password']"

        self.page.wait_for_selector(email_selector, timeout=8000)
        self.safe_fill(email_selector, self.creds["email"], description="Admin Email/Username")
        self.safe_fill(password_selector, self.creds["password"], description="Admin Password")
        self.capture_step("01_admin_login_filled")

        # Submit
        submit_btn = "button[type='submit'], input[type='submit']"
        self.safe_click(submit_btn, description="Submit Admin Login")
        time.sleep(3.0)
        self.wait_network_settle(4000)

        current_url = self.page.url
        self.log(f"Current Admin URL after login: {current_url}")
        self.capture_step("02_admin_dashboard_after_login")

        is_logged_in = "login" not in current_url
        if is_logged_in:
            self.log("Đăng nhập Admin thành công!")
        else:
            self.log("Admin chưa chuyển hướng khỏi trang login, kiểm tra quyền hoặc mật khẩu")
        return is_logged_in

    def inspect_jobs_management(self):
        self.log("Kiểm tra trang Quản lý tin tuyển dụng của Admin...")
        jobs_url = f"{BASE_URL}/admin/jobs"
        self.goto(jobs_url)
        self.wait_network_settle(4000)
        self.capture_step("03_admin_jobs_management")

        # Check if table loaded
        has_table = self.check_visible("table, .MuiDataGrid-root, [role='grid']", timeout=4000)
        if not has_table:
            self.record_ux(
                title="Bảng dữ liệu tin tuyển dụng không hiển thị",
                category="Admin DataGrid",
                severity="MEDIUM",
                description="Không tìm thấy cấu trúc bảng (table/DataGrid) trong trang quản trị tin tuyển dụng.",
                recommendation="Đảm bảo DataGrid tải dữ liệu thành công hoặc có thông báo rõ khi danh sách rỗng."
            )

    def deep_dive(self):
        self.log("Bắt đầu khảo sát mở rộng các trang quản trị hệ thống...")
        admin_pages = [
            ("users", f"{BASE_URL}/admin/users"),
            ("questions", f"{BASE_URL}/admin/questions"),
            ("question-groups", f"{BASE_URL}/admin/question-groups"),
            ("voice-profiles", f"{BASE_URL}/admin/voice-profiles"),
            ("careers", f"{BASE_URL}/admin/careers"),
            ("cities", f"{BASE_URL}/admin/cities"),
            ("settings", f"{BASE_URL}/admin/settings"),
        ]
        for name, url in admin_pages:
            self.log(f"Admin Deep-dive: Khám phá trang {name} ({url})")
            self.goto(url)
            self.wait_network_settle(3000)
            self.capture_step(f"admin_deepdive_{name}")
            time.sleep(0.5)
