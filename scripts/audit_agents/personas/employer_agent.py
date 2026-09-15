import time
import os
from typing import Dict, Any, Optional
from scripts.audit_agents.personas.base_agent import BaseAgent
from scripts.audit_agents.config import BASE_URL, CREDENTIALS

class EmployerAgent(BaseAgent):
    def __init__(self, context, telemetry):
        super().__init__(context, telemetry)
        self.creds = CREDENTIALS["EMPLOYER"]

    def login(self) -> bool:
        self.log("Bắt đầu đăng nhập Employer...")
        # Try both English and Vietnamese routes
        target_url = f"{BASE_URL}/employer/login"
        self.goto(target_url)
        self.wait_network_settle(3000)

        # Fill credentials
        email_selector = "input[name='email']"
        password_selector = "input[name='password']"

        if not self.check_visible(email_selector, timeout=5000):
            # Try alternate selector
            email_selector = "input[type='email'], input[placeholder*='email' i]"
            password_selector = "input[type='password']"

        self.safe_fill(email_selector, self.creds["email"], description="Employer Email")
        self.safe_fill(password_selector, self.creds["password"], description="Employer Password")
        self.capture_step("01_login_filled")

        # Submit
        submit_btn = "button[type='submit']"
        self.safe_click(submit_btn, description="Submit Login")
        time.sleep(3.0)
        self.wait_network_settle(4000)

        current_url = self.page.url
        self.log(f"Current URL after login submit: {current_url}")
        self.capture_step("02_dashboard_after_login")

        # Check if error message displayed
        error_box = self.page.query_selector(".MuiAlert-standardError, .MuiAlert-message, [role='alert']")
        if error_box:
            err_text = error_box.text_content()
            self.log(f"Login alert: {err_text}")
            if "thành công" not in err_text.lower():
                self.record_ux(
                    title="Employer Login Error",
                    category="Authentication",
                    severity="BLOCKER",
                    description=f"Login failed or showed error: {err_text}",
                    recommendation="Ensure test employer credentials and OAuth backend are operational."
                )

        is_logged_in = "login" not in current_url and "dang-nhap" not in current_url
        if is_logged_in:
            self.log("Đăng nhập Employer thành công!")
        else:
            self.log("Chưa chuyển hướng khỏi trang login, có thể cần xác thực hoặc kiểm tra form")
        return is_logged_in

    def check_dashboard(self):
        self.log("Kiểm tra giao diện Dashboard của Nhà tuyển dụng...")
        self.goto(f"{BASE_URL}/employer/dashboard")
        self.wait_network_settle(4000)
        self.capture_step("03_employer_dashboard_full")

        # Evaluate UI/UX on dashboard
        page_content = self.page.content()
        if "NaN" in page_content or "undefined" in page_content:
            self.record_ux(
                title="Dữ liệu hiển thị NaN hoặc undefined trên Dashboard",
                category="Data Presentation",
                severity="HIGH",
                description="Phát hiện chuỗi NaN hoặc undefined hiển thị trong giao diện dashboard employer.",
                recommendation="Thêm fallback default value (0 hoặc '-') khi dữ liệu API chưa tải hoặc null."
            )

    def create_job(self, job_title: str) -> bool:
        self.log(f"Bắt đầu tạo tin tuyển dụng mới: '{job_title}'...")
        create_url = f"{BASE_URL}/employer/job-posts/create"
        self.goto(create_url)
        self.wait_network_settle(4000)
        self.capture_step("04_create_job_form_initial")

        # Check form inputs
        title_selector = "input[name='jobName'], input[name='job_name'], input[name='title']"
        if not self.check_visible(title_selector, timeout=4000):
            # Search for any text input
            title_selector = "form input[type='text']:first-of-type"

        filled = self.safe_fill(title_selector, job_title, description="Job Title Field")
        if not filled:
            self.record_ux(
                title="Không tìm thấy ô nhập Tiêu đề tin tuyển dụng",
                category="Form Usability",
                severity="HIGH",
                description="Trang tạo tin tuyển dụng không hiển thị rõ ràng ô nhập tiêu đề hoặc bị crash.",
                recommendation="Kiểm tra routing và state của form tạo tin."
            )
            return False

        # Fill other fields if present
        self.capture_step("05_create_job_form_filled")
        return True

    def review_applications(self):
        self.log("Kiểm tra trang Quản lý Ứng viên / Hồ sơ ứng tuyển...")
        applied_url = f"{BASE_URL}/employer/applied-profiles"
        self.goto(applied_url)
        self.wait_network_settle(4000)
        self.capture_step("06_applied_candidates_list")

        # Check candidate cards/tables
        candidates_empty = self.page.query_selector("[data-testid='empty-state'], .empty-state")
        if candidates_empty:
            self.log("Danh sách ứng viên hiện đang rỗng.")

    def deep_dive(self):
        self.log("Bắt đầu khảo sát mở rộng các trang phụ của Employer...")
        sub_pages = [
            ("question-bank", f"{BASE_URL}/employer/question-bank"),
            ("question-groups", f"{BASE_URL}/employer/question-groups"),
            ("ai-settings", f"{BASE_URL}/employer/ai-settings"),
            ("agent-assistants", f"{BASE_URL}/employer/agent-assistants"),
            ("settings", f"{BASE_URL}/employer/settings"),
            ("pricing", f"{BASE_URL}/employer/pricing"),
        ]
        for name, url in sub_pages:
            self.log(f"Deep-dive: Khám phá trang {name} ({url})")
            self.goto(url)
            self.wait_network_settle(3000)
            self.capture_step(f"deepdive_{name}")
            time.sleep(0.5)
