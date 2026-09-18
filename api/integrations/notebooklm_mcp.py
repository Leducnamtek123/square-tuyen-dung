from __future__ import annotations

import logging
from typing import Any
import requests
from django.conf import settings

logger = logging.getLogger(__name__)


class NotebookLMMCPError(Exception):
    pass


class NotebookLMMCPClient:
    """
    Client interface for NotebookLM MCP (Model Context Protocol) Server.
    Provides methods to query grounded knowledge and evaluate candidates against JDs/KPIs.
    """

    def __init__(self, endpoint_url: str | None = None):
        self.endpoint_url = endpoint_url or getattr(
            settings, "NOTEBOOKLM_MCP_URL", ""
        ) or "http://notebooklm-mcp:8000/mcp"
        self.default_notebook_id = getattr(
            settings, "DEFAULT_NOTEBOOKLM_NOTEBOOK_ID", ""
        ) or "0a469926-b901-426d-afe5-843096613137"
        self.session = requests.Session()
        self.session.headers.update({
            "Accept": "application/json, text/event-stream",
            "Content-Type": "application/json",
        })
        self.session_id: str | None = None

    def _ensure_session(self):
        if self.session_id:
            return

        init_payload = {
            "jsonrpc": "2.0",
            "method": "initialize",
            "params": {
                "protocolVersion": "2024-11-05",
                "capabilities": {},
                "clientInfo": {"name": "square-tuyen-dung", "version": "1.0.0"},
            },
            "id": 1,
        }
        res = self.session.post(self.endpoint_url, json=init_payload, timeout=30)
        res.raise_for_status()

        self.session_id = res.headers.get("Mcp-Session-Id") or res.headers.get("mcp-session-id")
        if self.session_id:
            self.session.headers.update({"Mcp-Session-Id": self.session_id})

        notify_payload = {
            "jsonrpc": "2.0",
            "method": "notifications/initialized",
        }
        try:
            self.session.post(self.endpoint_url, json=notify_payload, timeout=10)
        except requests.RequestException:
            pass

    def _call_mcp_tool(self, tool_name: str, arguments: dict[str, Any]) -> dict[str, Any]:
        try:
            self._ensure_session()
        except requests.RequestException as exc:
            self.session_id = None
            raise NotebookLMMCPError(f"Không thể khởi tạo phiên kết nối MCP tới {self.endpoint_url}: {exc}") from exc

        payload = {
            "jsonrpc": "2.0",
            "method": "tools/call",
            "params": {
                "name": tool_name,
                "arguments": arguments,
            },
            "id": 2,
        }
        try:
            response = self.session.post(
                self.endpoint_url,
                json=payload,
                timeout=180,
            )
            if response.status_code == 400:
                self.session_id = None
                self.session.headers.pop("Mcp-Session-Id", None)
                self.session.headers.pop("mcp-session-id", None)
                self._ensure_session()
                response = self.session.post(self.endpoint_url, json=payload, timeout=180)

            response.raise_for_status()
            if response.text and response.text.strip():
                try:
                    data = response.json()
                except Exception:
                    return {"content": [{"type": "text", "text": response.text}]}
            else:
                return {"content": [{"type": "text", "text": f"HTTP {response.status_code} Success"}]}

            if isinstance(data, dict) and "error" in data:
                error_msg = data["error"].get("message", "Unknown MCP error")
                logger.error("NotebookLM MCP Error: %s", error_msg)
                raise NotebookLMMCPError(f"MCP Server Error: {error_msg}")
            return data.get("result", data) if isinstance(data, dict) else {"content": [{"type": "text", "text": str(data)}]}
        except requests.RequestException as exc:
            self.session_id = None
            logger.warning("NotebookLM MCP Service error at %s: %s", self.endpoint_url, exc)
            raise NotebookLMMCPError(
                f"Không thể gửi câu hỏi tới dịch vụ NotebookLM MCP tại {self.endpoint_url}: {exc}"
            ) from exc

    def query_notebook(self, notebook_id: str | None, query: str) -> dict[str, Any]:
        target_notebook_id = notebook_id or self.default_notebook_id
        if not target_notebook_id:
            raise NotebookLMMCPError("Thiếu ID của Google NotebookLM để tra cứu.")

        return self._call_mcp_tool(
            "ask_question",
            {
                "notebook_id": target_notebook_id,
                "question": query,
            },
        )

    def evaluate_cv(
        self,
        cv_content: str,
        notebook_id: str | None = None,
        job_title: str | None = None,
    ) -> dict[str, Any]:
        target_notebook_id = notebook_id or self.default_notebook_id
        prompt = (
            f"Dựa trên tiêu chuẩn và mô tả công việc {job_title or ''} trong Notebook này, "
            f"hãy phân tích chi tiết hồ sơ ứng viên sau đây:\n\n{cv_content}\n\n"
            "Trả về đánh giá chi tiết theo định dạng:\n"
            "- Tỷ lệ đáp ứng (Score %)\n"
            "- Tiêu chí ĐẠT\n"
            "- Tiêu chí KHÔNG ĐẠT / CẦN LÀM RÕ\n"
            "- Đề xuất câu hỏi phỏng vấn"
        )
        return self.query_notebook(target_notebook_id, prompt)


mcp_client = NotebookLMMCPClient()
