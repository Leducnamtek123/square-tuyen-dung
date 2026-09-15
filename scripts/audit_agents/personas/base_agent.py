import time
import os
from typing import Optional, List, Dict, Any
from playwright.sync_api import Page, BrowserContext, ElementHandle
from scripts.audit_agents.telemetry import TelemetryCollector

class BaseAgent:
    def __init__(self, context: BrowserContext, telemetry: TelemetryCollector):
        self.context = context
        self.page: Page = context.new_page()
        self.telemetry = telemetry
        self.telemetry.attach_to_page(self.page)
        self.role = telemetry.role

    def log(self, message: str, details: str = ""):
        self.telemetry.log_action(message, details)

    def goto(self, url: str, wait_until: str = "load", timeout: int = 15000) -> bool:
        self.log(f"Navigate to {url}")
        try:
            self.page.goto(url, wait_until=wait_until, timeout=timeout)
            time.sleep(1.0)  # Allow client hydration
            return True
        except Exception as e:
            self.log(f"Navigation error to {url}: {e}")
            self.capture_step("NAV_FAIL", is_error=True)
            return False

    def wait_network_settle(self, timeout: int = 5000):
        try:
            self.page.wait_for_load_state("networkidle", timeout=timeout)
        except Exception:
            pass

    def capture_step(self, step_name: str, is_error: bool = False) -> str:
        path = self.telemetry.capture_screenshot(self.page, step_name, is_error=is_error)
        self.log(f"Captured screenshot: {step_name} -> {os.path.basename(path)}")
        return path

    def record_ux(self, title: str, category: str, severity: str, description: str, recommendation: str = ""):
        screenshot = self.capture_step(f"UX_{title[:20]}")
        self.telemetry.record_ux_issue(
            title=title,
            category=category,
            severity=severity,
            description=description,
            screenshot=screenshot,
            recommendation=recommendation,
        )

    def safe_click(self, selector: str, timeout: int = 5000, description: str = "") -> bool:
        try:
            self.page.wait_for_selector(selector, timeout=timeout, state="visible")
            # Scroll into view
            self.page.eval_on_selector(selector, "el => el.scrollIntoView({behavior: 'smooth', block: 'center'})")
            time.sleep(0.3)
            self.page.click(selector, timeout=timeout)
            self.log(f"Clicked {selector} ({description})")
            time.sleep(0.5)
            return True
        except Exception as e:
            self.log(f"Safe click failed on {selector} ({description}): {e}")
            self.capture_step(f"CLICK_FAIL_{description[:15]}", is_error=True)
            return False

    def safe_fill(self, selector: str, text: str, timeout: int = 5000, description: str = "") -> bool:
        try:
            self.page.wait_for_selector(selector, timeout=timeout, state="visible")
            self.page.fill(selector, text, timeout=timeout)
            self.log(f"Filled {selector} with text ({description})")
            return True
        except Exception as e:
            self.log(f"Safe fill failed on {selector} ({description}): {e}")
            self.capture_step(f"FILL_FAIL_{description[:15]}", is_error=True)
            return False

    def check_visible(self, selector: str, timeout: int = 3000) -> bool:
        try:
            self.page.wait_for_selector(selector, timeout=timeout, state="visible")
            return True
        except Exception:
            return False

    def get_text_content(self, selector: str, timeout: int = 3000) -> Optional[str]:
        try:
            self.page.wait_for_selector(selector, timeout=timeout)
            return self.page.text_content(selector)
        except Exception:
            return None
