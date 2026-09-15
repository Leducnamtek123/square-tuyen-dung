import json
import time
import sys
import os
from pathlib import Path

# Ensure project root is in sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from playwright.sync_api import sync_playwright

from scripts.audit_agents.config import (
    BASE_URL,
    BROWSER_ARGS,
    REPORTS_DIR,
    VIEWPORTS,
)
from scripts.audit_agents.telemetry import TelemetryCollector
from scripts.audit_agents.db_verifier import DBVerifier
from scripts.audit_agents.personas.employer_agent import EmployerAgent
from scripts.audit_agents.personas.admin_agent import AdminAgent
from scripts.audit_agents.personas.job_seeker_agent import JobSeekerAgent

def run_audit():
    print("=" * 80)
    print(" KHỞI ĐỘNG HỆ THỐNG MULTI-AGENT KIỂM THỬ TOÀN DIỆN (SQUARE TUYỂN DỤNG)")
    print(f" Target Gateway: {BASE_URL}")
    print(" Roles: EMPLOYER | ADMIN | JOB_SEEKER")
    print("=" * 80)

    raw_results = {
        "start_time": time.strftime("%Y-%m-%d %H:%M:%S"),
        "gateway": BASE_URL,
        "database_checks": {},
        "agents": {},
    }

    # Step 0: Pre-flight Database Sanity Check
    print("\n[PRE-FLIGHT] Kiểm tra tính sẵn sàng của Database & Backend qua Docker...")
    db_job = DBVerifier.verify_job_post("Kiến trúc")
    raw_results["database_checks"]["preflight_job_sample"] = db_job
    print(f"  Sample Job in DB: {db_job.get('job_name', 'Not found')} (Status: {db_job.get('status')})")

    with sync_playwright() as p:
        print("\n[BROWSER] Khởi tạo Chromium với WebRTC Mock & Fake Media Streams...")
        browser = p.chromium.launch(
            headless=True,
            args=BROWSER_ARGS,
        )

        # 3 Isolated Browser Contexts
        ctx_employer = browser.new_context(
            viewport=VIEWPORTS["desktop"],
            permissions=["microphone", "camera"],
        )
        ctx_admin = browser.new_context(
            viewport=VIEWPORTS["desktop"],
        )
        ctx_seeker = browser.new_context(
            viewport=VIEWPORTS["desktop"],
            permissions=["microphone", "camera"],
        )

        # 3 Telemetry Collectors
        tel_employer = TelemetryCollector("EMPLOYER")
        tel_admin = TelemetryCollector("ADMIN")
        tel_seeker = TelemetryCollector("JOB_SEEKER")

        # 3 Persona Agents
        employer = EmployerAgent(ctx_employer, tel_employer)
        admin = AdminAgent(ctx_admin, tel_admin)
        seeker = JobSeekerAgent(ctx_seeker, tel_seeker)

        # =========================================================================
        # PHASE 1: VÒNG ĐỜI KHÉP KÍN (CLOSED-LOOP E2E LIFECYCLE)
        # =========================================================================
        print("\n" + "#" * 60)
        print(" PHASE 1: VÒNG ĐỜI NGHIỆP VỤ KHÉP KÍN (CORE CLOSED-LOOP)")
        print("#" * 60)

        # 1. Employer Login & Job Post Flow
        print("\n--- BƯỚC 1: NHÀ TUYỂN DỤNG (EMPLOYER) THAO TÁC ---")
        emp_logged = employer.login()
        employer.check_dashboard()
        employer.create_job("Chỉ Huy Trưởng Công Trình (Multi-Agent Test)")

        # 2. Admin Login & Jobs Inspection
        print("\n--- BƯỚC 2: QUẢN TRỊ VIÊN (ADMIN) THAO TÁC ---")
        admin_logged = admin.login()
        admin.inspect_jobs_management()

        # 3. Job Seeker Login, Search & AI Interview
        print("\n--- BƯỚC 3: ỨNG VIÊN (JOB SEEKER) THAO TÁC ---")
        seeker_logged = seeker.login()
        seeker.search_and_explore_jobs()
        seeker.test_ai_interview_room()

        # 4. Employer Review Applications
        print("\n--- BƯỚC 4: NHÀ TUYỂN DỤNG ĐÁNH GIÁ ỨNG VIÊN ---")
        employer.review_applications()

        # =========================================================================
        # PHASE 2: KHẢO SÁT MỞ RỘNG (FEATURE DEEP-DIVE PER ROLE)
        # =========================================================================
        print("\n" + "#" * 60)
        print(" PHASE 2: KHẢO SÁT CHUYÊN SÂU MỞ RỘNG TỪNG ROLE (DEEP-DIVE)")
        print("#" * 60)

        print("\n--- DEEP DIVE: NHÀ TUYỂN DỤNG ---")
        employer.deep_dive()

        print("\n--- DEEP DIVE: QUẢN TRỊ VIÊN ---")
        admin.deep_dive()

        print("\n--- DEEP DIVE: ỨNG VIÊN & KIỂM TRA MOBILE RESPONSIVE ---")
        seeker.deep_dive()
        seeker.test_mobile_responsive()

        # Close contexts
        ctx_employer.close()
        ctx_admin.close()
        ctx_seeker.close()
        browser.close()

        # Collect Telemetry
        raw_results["agents"]["EMPLOYER"] = tel_employer.get_summary()
        raw_results["agents"]["ADMIN"] = tel_admin.get_summary()
        raw_results["agents"]["JOB_SEEKER"] = tel_seeker.get_summary()

    raw_results["end_time"] = time.strftime("%Y-%m-%d %H:%M:%S")

    # Save raw audit results JSON
    json_path = REPORTS_DIR / "audit_raw_results.json"
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(raw_results, f, ensure_ascii=False, indent=2)

    print("\n" + "=" * 80)
    print(f" HOÀN TẤT KIỂM THỬ MULTI-AGENT! Dữ liệu đã lưu tại: {json_path}")
    print("=" * 80)

    # Print summary statistics
    for role, summary in raw_results["agents"].items():
        print(f"\n[ROLE: {role}]")
        print(f"  Actions Logged     : {summary['total_actions']}")
        print(f"  Console Errors     : {summary['console_errors_count']}")
        print(f"  Console Warnings   : {summary['console_warnings_count']}")
        print(f"  Network Errors 4xx+: {summary['network_errors_count']}")
        print(f"  Slow Requests >1.5s: {summary['slow_requests_count']}")
        print(f"  UX Issues Flagged  : {summary['ux_issues_count']}")
        print(f"  Screenshots Saved  : {summary['screenshots_count']}")

    return raw_results

if __name__ == "__main__":
    run_audit()
