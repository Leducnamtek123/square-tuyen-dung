import time
import os
from typing import Dict, Any, Optional
from scripts.audit_agents.personas.base_agent import BaseAgent
from scripts.audit_agents.config import BASE_URL, CREDENTIALS, VIEWPORTS

class JobSeekerAgent(BaseAgent):
    def __init__(self, context, telemetry):
        super().__init__(context, telemetry)
        self.creds = CREDENTIALS["JOB_SEEKER"]

    def login(self) -> bool:
        self.log("Bắt đầu đăng nhập Ứng viên (Job Seeker)...")
        target_url = f"{BASE_URL}/login"
        self.goto(target_url)
        self.wait_network_settle(3000)

        # Fill credentials
        email_selector = "input[name='email']"
        password_selector = "input[name='password']"

        self.safe_fill(email_selector, self.creds["email"], description="Candidate Email")
        self.safe_fill(password_selector, self.creds["password"], description="Candidate Password")
        self.capture_step("01_seeker_login_filled")

        # Submit
        submit_btn = "button[type='submit']"
        self.safe_click(submit_btn, description="Submit Seeker Login")
        time.sleep(3.0)
        self.wait_network_settle(4000)

        current_url = self.page.url
        self.log(f"Current Candidate URL after login: {current_url}")
        self.capture_step("02_seeker_after_login")

        is_logged_in = "login" not in current_url and "dang-nhap" not in current_url
        if is_logged_in:
            self.log("Đăng nhập Ứng viên thành công!")
        else:
            self.log("Ứng viên chưa chuyển hướng khỏi trang login, có thể cần xác thực")
        return is_logged_in

    def search_and_explore_jobs(self):
        self.log("Khám phá trang Tìm việc làm & Bộ lọc...")
        jobs_url = f"{BASE_URL}/viec-lam"
        self.goto(jobs_url)
        self.wait_network_settle(4000)
        self.capture_step("03_seeker_jobs_portal")

        # Check search input
        search_input = "input[placeholder*='tìm' i], input[type='search'], input[name='keyword']"
        if self.check_visible(search_input, timeout=3000):
            self.safe_fill(search_input, "Kiến trúc", description="Search Keyword")
            self.capture_step("04_seeker_jobs_searched")

        # Click on first job card if available
        first_job = self.page.query_selector("a[href*='/viec-lam/'], a[href*='/jobs/'], .job-card a")
        if first_job:
            try:
                href = first_job.get_attribute("href")
                self.log(f"Mở chi tiết tin tuyển dụng: {href}")
                if href and href.startswith("/"):
                    self.goto(f"{BASE_URL}{href}")
                elif href:
                    self.goto(href)
                self.wait_network_settle(4000)
                self.capture_step("05_seeker_job_detail")

                # Check Apply Button
                apply_btn = "button:has-text('Ứng tuyển'), button:has-text('Nộp hồ sơ'), button:has-text('Apply')"
                if self.check_visible(apply_btn, timeout=3000):
                    self.log("Tìm thấy nút Ứng tuyển ngay!")
                    self.safe_click(apply_btn, description="Click Apply Button")
                    time.sleep(1.5)
                    self.capture_step("06_seeker_apply_modal")
            except Exception as e:
                self.log(f"Error clicking job card: {e}")

    def test_ai_interview_room(self):
        self.log("Khám phá phòng Luyện phỏng vấn AI (LiveKit WebRTC)...")
        # Try both routes
        practice_url = f"{BASE_URL}/practice"
        self.goto(practice_url)
        self.wait_network_settle(4000)
        self.capture_step("07_ai_interview_entry")

        # Check for device setup / start buttons
        start_btn = "button:has-text('Bắt đầu'), button:has-text('Vào phòng'), button:has-text('Phỏng vấn')"
        if self.check_visible(start_btn, timeout=4000):
            self.safe_click(start_btn, description="Start AI Interview")
            time.sleep(4.0)
            self.wait_network_settle(4000)
            self.capture_step("08_ai_interview_room_active")
        else:
            self.log("Chưa thấy nút bắt đầu trực tiếp, kiểm tra layout phòng phỏng vấn")

    def deep_dive(self):
        self.log("Bắt đầu khảo sát mở rộng các trang của Ứng viên...")
        pages = [
            ("cv-builder", f"{BASE_URL}/cv-builder"),
            ("salary", f"{BASE_URL}/salary"),
            ("companies", f"{BASE_URL}/companies"),
            ("my-jobs", f"{BASE_URL}/my-jobs"),
            ("profile", f"{BASE_URL}/profile"),
            ("notifications", f"{BASE_URL}/notifications"),
        ]
        for name, url in pages:
            self.log(f"JobSeeker Deep-dive: Khám phá {name} ({url})")
            self.goto(url)
            self.wait_network_settle(3000)
            self.capture_step(f"seeker_deepdive_{name}")
            time.sleep(0.5)

    def test_mobile_responsive(self):
        self.log("Kiểm tra giao diện Responsive trên Mobile (390x844)...")
        self.page.set_viewport_size(VIEWPORTS["mobile"])
        time.sleep(0.5)

        mobile_pages = [
            ("mobile_home", f"{BASE_URL}/"),
            ("mobile_jobs", f"{BASE_URL}/viec-lam"),
            ("mobile_cv_builder", f"{BASE_URL}/cv-builder"),
        ]
        for name, url in mobile_pages:
            self.log(f"Mobile check: {name} ({url})")
            self.goto(url)
            self.wait_network_settle(3000)
            self.capture_step(name)

            # Check horizontal overflow
            has_overflow = self.page.evaluate("""() => {
                return document.documentElement.scrollWidth > window.innerWidth;
            }""")
            if has_overflow:
                self.record_ux(
                    title=f"Vỡ khung nhìn / Tràn ngang trên Mobile tại {name}",
                    category="Mobile Responsiveness",
                    severity="HIGH",
                    description=f"Trang {url} có chiều rộng nội dung vượt quá kích thước màn hình điện thoại (scrollWidth > innerWidth).",
                    recommendation="Kiểm tra các phần tử có width cố định (ví dụ px) hoặc padding quá lớn, chuyển sang max-width: 100%."
                )

        # Restore desktop viewport
        self.page.set_viewport_size(VIEWPORTS["desktop"])
