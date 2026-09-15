# Multi-Agent System Audit & UI/UX Evaluation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Xây dựng hệ thống Multi-Agent giả lập 3 người dùng thật (`EMPLOYER`, `ADMIN`, `JOB_SEEKER`) chạy trên trình duyệt thực tế kết hợp kiểm tra Backend/DB để phát hiện toàn diện lỗi kỹ thuật và các điểm bất cập UI/UX của nền tảng Square Tuyển Dụng.

**Architecture:** Bộ 3 Persona Agents xây dựng bằng Python Playwright với browser context độc lập, tự động thu thập console logs, network failures (4xx/5xx/latency), chụp ảnh màn hình các điểm mốc/lỗi, đối soát cơ sở dữ liệu MySQL qua Docker backend, thực hiện kịch bản khép kín 5 bước và các nhánh deep-dive, cuối cùng tổng hợp thành Báo cáo Audit toàn diện.

**Tech Stack:** Python 3.11, Playwright (Chromium/Edge), Docker exec (MySQL/Django ORM), Markdown & Screenshots reporter.

**Spec:** [`docs/superpowers/specs/2026-09-16-multi-agent-system-audit-design.md`](file:///c:/Users/WIN10/Documents/square-tuyen-dung/docs/superpowers/specs/2026-09-16-multi-agent-system-audit-design.md)

## Global Constraints
- Target URL Gateway: `http://localhost:8080`
- Account Admin: `admin@project.com` / `Password123!`
- Account Employer: `ceohub.hostmaster@gmail.com` / `Password123!`
- Account Job Seeker: `candidate@project.com` / `Password123!`
- Trình duyệt chạy với cờ cấp quyền media stream giả lập: `--use-fake-ui-for-media-stream`, `--use-fake-device-for-media-stream`
- Báo cáo kết quả lưu tại: `docs/audit_reports/2026-09-16-multi-agent-system-audit.md`
- Ảnh chụp màn hình lưu tại: `docs/audit_reports/screenshots/`

---

### Task 1: Thiết lập Môi trường & Cấu hình Audit (`config.py`)

**Files:**
- Create: `scripts/audit_agents/config.py`
- Test: `scripts/audit_agents/test_env.py`

**Interfaces:**
- Consumes: Thông tin môi trường cổng 8080 và thông tin tài khoản từ spec.
- Produces: `BASE_URL`, `CREDENTIALS`, `BROWSER_ARGS`, `VIEWPORTS`, `PATHS`.

- [ ] **Step 1: Cài đặt thư viện Playwright**
Run: `pip install playwright pytest`
Expected: Successfully installed playwright.

- [ ] **Step 2: Cài đặt Chromium browser cho Playwright (hoặc xác thực Edge channel)**
Run: `python -m playwright install chromium`
Expected: Chromium downloaded or verified.

- [ ] **Step 3: Tạo file cấu hình `scripts/audit_agents/config.py`**
```python
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
REPORTS_DIR = BASE_DIR / "docs" / "audit_reports"
SCREENSHOTS_DIR = REPORTS_DIR / "screenshots"
SCREENSHOTS_DIR.mkdir(parents=True, exist_ok=True)

BASE_URL = "http://localhost:8080"

CREDENTIALS = {
    "ADMIN": {
        "email": "admin@project.com",
        "password": "Password123!",
        "login_url": f"{BASE_URL}/admin/",
    },
    "EMPLOYER": {
        "email": "ceohub.hostmaster@gmail.com",
        "password": "Password123!",
        "login_url": f"{BASE_URL}/employer/dang-nhap",
    },
    "JOB_SEEKER": {
        "email": "candidate@project.com",
        "password": "Password123!",
        "login_url": f"{BASE_URL}/dang-nhap",
    },
}

VIEWPORTS = {
    "desktop": {"width": 1440, "height": 900},
    "mobile": {"width": 390, "height": 844},
}

BROWSER_ARGS = [
    "--use-fake-ui-for-media-stream",
    "--use-fake-device-for-media-stream",
    "--disable-notifications",
]
```

- [ ] **Step 4: Kiểm tra kết nối và cấu hình**
Run: `python -c "from scripts.audit_agents.config import BASE_URL, CREDENTIALS; print(BASE_URL, len(CREDENTIALS))"`
Expected: `http://localhost:8080 3`

- [ ] **Step 5: Commit**
```bash
git add scripts/audit_agents/config.py
git commit -m "feat(audit): add audit configuration and directory setup"
```

---

### Task 2: Bộ phận Thu thập Dữ liệu Telemetry & Bắt lỗi (`telemetry.py`)

**Files:**
- Create: `scripts/audit_agents/telemetry.py`

**Interfaces:**
- Consumes: Playwright `Page` instance.
- Produces: `TelemetryCollector` class với `attach_to_page()`, `capture_screenshot()`, `record_ux_issue()`, `get_summary()`.

- [ ] **Step 1: Viết module TelemetryCollector**
```python
import time
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Dict, List
from playwright.sync_api import Page, Response
from scripts.audit_agents.config import SCREENSHOTS_DIR

@dataclass
class TelemetryCollector:
    role: str
    console_errors: List[Dict[str, Any]] = field(default_factory=list)
    console_warnings: List[Dict[str, Any]] = field(default_factory=list)
    network_errors: List[Dict[str, Any]] = field(default_factory=list)
    slow_requests: List[Dict[str, Any]] = field(default_factory=list)
    ux_issues: List[Dict[str, Any]] = field(default_factory=list)
    screenshots: List[str] = field(default_factory=list)
    actions_log: List[Dict[str, Any]] = field(default_factory=list)

    def attach_to_page(self, page: Page):
        page.on("console", self._handle_console)
        page.on("pageerror", self._handle_page_error)
        page.on("response", self._handle_response)

    def _handle_console(self, msg):
        if msg.type == "error":
            self.console_errors.append({"text": msg.text, "location": msg.location, "time": time.time()})
        elif msg.type == "warning":
            self.console_warnings.append({"text": msg.text, "time": time.time()})

    def _handle_page_error(self, err):
        self.console_errors.append({"text": f"Uncaught: {str(err)}", "time": time.time()})

    def _handle_response(self, response: Response):
        status = response.status
        url = response.url
        if status >= 400:
            self.network_errors.append({
                "status": status,
                "url": url,
                "method": response.request.method,
                "time": time.time()
            })

    def capture_screenshot(self, page: Page, name: str) -> str:
        timestamp = int(time.time() * 1000)
        filename = f"{self.role.lower()}_{name}_{timestamp}.png"
        filepath = SCREENSHOTS_DIR / filename
        page.screenshot(path=str(filepath), full_page=True)
        self.screenshots.append(str(filepath))
        return str(filepath)

    def record_ux_issue(self, title: str, category: str, description: str, screenshot: str = ""):
        self.ux_issues.append({
            "title": title,
            "category": category,
            "description": description,
            "screenshot": screenshot,
            "time": datetime.now().isoformat()
        })
```

- [ ] **Step 2: Viết test kiểm tra TelemetryCollector**
Run: `python -c "from scripts.audit_agents.telemetry import TelemetryCollector; t = TelemetryCollector('EMPLOYER'); print(t.role)"`
Expected: `EMPLOYER`

- [ ] **Step 3: Commit**
```bash
git add scripts/audit_agents/telemetry.py
git commit -m "feat(audit): add telemetry collector for browser errors and UX issues"
```

---

### Task 3: Bộ phận Đối soát Cơ sở Dữ liệu (`db_verifier.py`)

**Files:**
- Create: `scripts/audit_agents/db_verifier.py`

**Interfaces:**
- Consumes: Tên container `tuyendung-studio-backend` qua `docker exec`.
- Produces: `verify_job_post_status(job_id_or_title)`, `verify_application_status(job_id, user_email)`, `verify_interview_record(room_id)`.

- [ ] **Step 1: Viết module DBVerifier qua Docker Backend Shell**
```python
import subprocess
import json
from typing import Optional, Dict, Any

class DBVerifier:
    CONTAINER = "tuyendung-studio-backend"

    @classmethod
    def run_django_code(cls, py_code: str) -> Dict[str, Any]:
        cmd = [
            "docker", "exec", cls.CONTAINER,
            "python", "manage.py", "shell", "-c", py_code
        ]
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=15)
        if result.returncode != 0:
            return {"success": False, "error": result.stderr}
        return {"success": True, "output": result.stdout.strip()}

    @classmethod
    def check_job_exists(cls, job_name: str) -> Dict[str, Any]:
        code = f"""
from apps.jobs.models import JobPost
import json
j = JobPost.objects.filter(job_name__icontains="{job_name}").order_by('-id').first()
if j:
    print(json.dumps({{'found': True, 'id': j.id, 'status': j.status, 'job_name': j.job_name}}))
else:
    print(json.dumps({{'found': False}}))
"""
        res = cls.run_django_code(code)
        if res["success"]:
            try:
                for line in res["output"].splitlines():
                    if line.startswith("{"):
                        return json.loads(line)
            except Exception:
                pass
        return {"found": False, "raw": res}
```

- [ ] **Step 2: Test kiểm tra kết nối với DB qua Django Shell**
Run: `python -c "from scripts.audit_agents.db_verifier import DBVerifier; res = DBVerifier.run_django_code('from apps.accounts.models import User; print(User.objects.count())'); print(res)"`
Expected: `{'success': True, 'output': '...'}` với số lượng User hợp lệ (> 0).

- [ ] **Step 3: Commit**
```bash
git add scripts/audit_agents/db_verifier.py
git commit -m "feat(audit): add database verifier via backend docker container"
```

---

### Task 4: Base Agent & Employer Persona Agent (`employer_agent.py`)

**Files:**
- Create: `scripts/audit_agents/personas/base_agent.py`
- Create: `scripts/audit_agents/personas/employer_agent.py`

**Interfaces:**
- Consumes: Playwright Browser, `TelemetryCollector`.
- Produces: `EmployerAgent.login()`, `EmployerAgent.create_job()`, `EmployerAgent.review_applications()`.

- [ ] **Step 1: Viết `base_agent.py`**
```python
import time
from playwright.sync_api import Page, BrowserContext
from scripts.audit_agents.telemetry import TelemetryCollector

class BaseAgent:
    def __init__(self, context: BrowserContext, telemetry: TelemetryCollector):
        self.context = context
        self.page: Page = context.new_page()
        self.telemetry = telemetry
        self.telemetry.attach_to_page(self.page)

    def log(self, message: str):
        print(f"[{self.telemetry.role}] {message}")
        self.telemetry.actions_log.append({"message": message, "time": time.time()})

    def safe_click(self, selector: str, timeout: int = 5000) -> bool:
        try:
            self.page.wait_for_selector(selector, timeout=timeout)
            self.page.click(selector)
            return True
        except Exception as e:
            self.log(f"Click failed on {selector}: {e}")
            return False

    def wait_network_settle(self, timeout: int = 5000):
        try:
            self.page.wait_for_load_state("networkidle", timeout=timeout)
        except Exception:
            pass
```

- [ ] **Step 2: Viết `employer_agent.py`**
Triển khai các hành động:
1. `login()`: Nhập email `ceohub.hostmaster@gmail.com`, mật khẩu `Password123!`, submit, kiểm tra chuyển hướng vào dashboard.
2. `create_job()`: Vào mục tạo tin tuyển dụng, điền các trường chức danh, lương, mô tả, yêu cầu, hạn nộp, lưu tin.
3. `deep_dive_pages()`: Khám phá `/employer/cai-dat`, `/employer/ngan-hang-cau-hoi`, `/employer/tro-ly-agent`, kiểm tra layout, lỗi console, lỗi hiển thị.

- [ ] **Step 3: Commit**
```bash
git add scripts/audit_agents/personas/base_agent.py scripts/audit_agents/personas/employer_agent.py
git commit -m "feat(audit): implement base agent and employer persona agent"
```

---

### Task 5: Admin Persona Agent (`admin_agent.py`)

**Files:**
- Create: `scripts/audit_agents/personas/admin_agent.py`

**Interfaces:**
- Consumes: Playwright Browser, `TelemetryCollector`.
- Produces: `AdminAgent.login()`, `AdminAgent.approve_job(job_title)`, `AdminAgent.deep_dive_admin_pages()`.

- [ ] **Step 1: Viết `admin_agent.py`**
Triển khai:
1. `login()`: Đăng nhập với `admin@project.com` / `Password123!`.
2. `approve_job(job_title)`: Tìm tin tuyển dụng vừa tạo của Employer, duyệt tin, xác minh trạng thái thay đổi.
3. `deep_dive_admin_pages()`: Duyệt qua các trang quản lý người dùng, quản lý ngành nghề, quản lý tỉnh thành, kho câu hỏi.

- [ ] **Step 2: Commit**
```bash
git add scripts/audit_agents/personas/admin_agent.py
git commit -m "feat(audit): implement admin persona agent"
```

---

### Task 6: Job Seeker Persona Agent (`job_seeker_agent.py`)

**Files:**
- Create: `scripts/audit_agents/personas/job_seeker_agent.py`

**Interfaces:**
- Consumes: Playwright Browser, `TelemetryCollector`.
- Produces: `JobSeekerAgent.login()`, `JobSeekerAgent.find_and_apply_job()`, `JobSeekerAgent.enter_ai_interview_room()`, `JobSeekerAgent.deep_dive_seeker_pages()`.

- [ ] **Step 1: Viết `job_seeker_agent.py`**
Triển khai:
1. `login()`: Đăng nhập `candidate@project.com` / `Password123!`.
2. `find_and_apply_job(job_title)`: Điều hướng `/viec-lam`, tìm kiếm tin, mở trang chi tiết, bấm ứng tuyển CV.
3. `enter_ai_interview_room()`: Vào phòng phỏng vấn AI / luyện phỏng vấn, kiểm tra giao diện kết nối WebRTC, cấp quyền mic giả lập, kiểm tra đếm ngược và trạng thái phòng.
4. `deep_dive_seeker_pages()`: Duyệt `/tao-cv` (CV Builder), `/tra-cuu-luong`, `/cong-ty`, kiểm tra responsive mobile viewport.

- [ ] **Step 2: Commit**
```bash
git add scripts/audit_agents/personas/job_seeker_agent.py
git commit -m "feat(audit): implement job seeker persona agent with WebRTC interview check"
```

---

### Task 7: Multi-Agent Orchestrator (`run_multi_agent_audit.py`)

**Files:**
- Create: `scripts/audit_agents/run_multi_agent_audit.py`

**Interfaces:**
- Consumes: 3 Persona Agents (`EmployerAgent`, `AdminAgent`, `JobSeekerAgent`), `DBVerifier`.
- Produces: Khởi chạy toàn bộ quy trình khép kín và deep-dive, tập hợp telemetry và dữ liệu audit ra JSON.

- [ ] **Step 1: Viết kịch bản điều phối `run_multi_agent_audit.py`**
Chạy tuần tự 5 pha của Closed-loop E2E, theo sau là các pha Deep-dive độc lập của 3 role. Sau đó xuất toàn bộ kết quả telemetry ra file `audit_raw_results.json`.

- [ ] **Step 2: Commit**
```bash
git add scripts/audit_agents/run_multi_agent_audit.py
git commit -m "feat(audit): add multi-agent orchestrator script"
```

---

### Task 8: Thực thi Audit, Thu thập Bằng chứng & Biên soạn Báo cáo Toàn diện

**Files:**
- Output: `docs/audit_reports/2026-09-16-multi-agent-system-audit.md`
- Output: `docs/audit_reports/screenshots/*.png`

- [ ] **Step 1: Chạy kịch bản Multi-Agent Audit Runner**
Run: `python scripts/audit_agents/run_multi_agent_audit.py`
Expected: Hoàn thành đầy đủ các bước, sinh ảnh chụp màn hình và log chi tiết.

- [ ] **Step 2: Tổng hợp và Phân tích chuyên sâu các lỗi phát hiện**
Phân loại lỗi theo thang P0, P1, P2, P3, UX. Đối soát nguyên nhân mã nguồn ở Frontend React và Backend Django.

- [ ] **Step 3: Biên soạn Báo cáo Toàn diện `docs/audit_reports/2026-09-16-multi-agent-system-audit.md`**
Gồm: Tóm tắt tổng thể, Ma trận lỗi kỹ thuật, Đánh giá chi tiết UI/UX 5 khía cạnh, Trích dẫn log/ảnh chụp bằng chứng, và Danh sách đề xuất kế hoạch khắc phục chi tiết (Remediation Plan).

- [ ] **Step 4: Commit tài liệu Báo cáo vào git**
```bash
git add docs/audit_reports/
git commit -m "docs: add comprehensive multi-agent system audit report and UX evaluation"
```
