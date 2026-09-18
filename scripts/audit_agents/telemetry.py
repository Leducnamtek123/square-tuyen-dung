import os
import time
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional
from playwright.sync_api import Page, Response, Request
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
    _request_start_times: Dict[str, float] = field(default_factory=dict)

    def attach_to_page(self, page: Page):
        page.on("console", self._handle_console)
        page.on("pageerror", self._handle_page_error)
        page.on("request", self._handle_request)
        page.on("response", self._handle_response)

    def _handle_console(self, msg):
        try:
            text = msg.text
            msg_type = msg.type
            location = msg.location
            if msg_type == "error":
                # Filter out harmless noise if any
                self.console_errors.append({
                    "text": text,
                    "location": location,
                    "timestamp": datetime.now().isoformat(),
                })
            elif msg_type == "warning":
                self.console_warnings.append({
                    "text": text,
                    "timestamp": datetime.now().isoformat(),
                })
        except Exception:
            pass

    def _handle_page_error(self, err):
        try:
            self.console_errors.append({
                "text": f"Uncaught Runtime Exception: {str(err)}",
                "timestamp": datetime.now().isoformat(),
            })
        except Exception:
            pass

    def _handle_request(self, request: Request):
        try:
            self._request_start_times[request.url] = time.time()
        except Exception:
            pass

    def _handle_response(self, response: Response):
        try:
            url = response.url
            status = response.status
            method = response.request.method

            # Check latency
            start_time = self._request_start_times.pop(url, None)
            duration_ms = int((time.time() - start_time) * 1000) if start_time else 0

            if duration_ms > 1500:
                self.slow_requests.append({
                    "url": url,
                    "method": method,
                    "status": status,
                    "duration_ms": duration_ms,
                    "timestamp": datetime.now().isoformat(),
                })

            # Check network errors
            if status >= 400:
                body_sample = ""
                try:
                    # Non-blocking body text preview
                    if "application/json" in response.headers.get("content-type", ""):
                        body_sample = response.text()[:300]
                except Exception:
                    pass

                self.network_errors.append({
                    "url": url,
                    "method": method,
                    "status": status,
                    "duration_ms": duration_ms,
                    "response_sample": body_sample,
                    "timestamp": datetime.now().isoformat(),
                })
        except Exception:
            pass

    def capture_screenshot(self, page: Page, name: str, is_error: bool = False) -> str:
        try:
            timestamp = int(time.time() * 1000)
            prefix = "ERROR_" if is_error else ""
            clean_name = name.replace(" ", "_").replace("/", "_").replace(":", "_")
            filename = f"{prefix}{self.role.lower()}_{clean_name}_{timestamp}.png"
            filepath = SCREENSHOTS_DIR / filename
            page.screenshot(path=str(filepath), full_page=True)
            rel_path = os.path.relpath(filepath, SCREENSHOTS_DIR.parent.parent.parent)
            self.screenshots.append(str(filepath))
            return str(filepath)
        except Exception as e:
            return f"Failed screenshot: {e}"

    def record_ux_issue(
        self,
        title: str,
        category: str,
        severity: str,
        description: str,
        screenshot: str = "",
        recommendation: str = "",
    ):
        self.ux_issues.append({
            "title": title,
            "category": category,      # e.g., 'Layout', 'Interactivity', 'Microcopy', 'Feedback'
            "severity": severity,      # e.g., 'UX FRICTION', 'MEDIUM', 'HIGH', 'BLOCKER'
            "description": description,
            "screenshot": screenshot,
            "recommendation": recommendation,
            "timestamp": datetime.now().isoformat(),
        })

    def log_action(self, action: str, details: str = ""):
        entry = {
            "action": action,
            "details": details,
            "time": datetime.now().isoformat(),
        }
        self.actions_log.append(entry)
        print(f"[{self.role}] >>> {action} | {details}")

    def get_summary(self) -> Dict[str, Any]:
        return {
            "role": self.role,
            "total_actions": len(self.actions_log),
            "console_errors_count": len(self.console_errors),
            "console_warnings_count": len(self.console_warnings),
            "network_errors_count": len(self.network_errors),
            "slow_requests_count": len(self.slow_requests),
            "ux_issues_count": len(self.ux_issues),
            "screenshots_count": len(self.screenshots),
            "console_errors": self.console_errors,
            "network_errors": self.network_errors,
            "slow_requests": self.slow_requests,
            "ux_issues": self.ux_issues,
            "actions_log": self.actions_log,
        }
