import os
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent.parent
REPORTS_DIR = BASE_DIR / "docs" / "audit_reports"
SCREENSHOTS_DIR = REPORTS_DIR / "screenshots"
SCREENSHOTS_DIR.mkdir(parents=True, exist_ok=True)

# Gateway Endpoint
BASE_URL = "http://localhost:8080"

# User Credentials for 3 Core Roles
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
    "--no-sandbox",
    "--disable-setuid-sandbox",
]

DEFAULT_TIMEOUT = 10000  # 10s
SLOW_MO = 50             # 50ms per operation to simulate human interaction
