import json
from typing import Any
from urllib.parse import quote, urljoin

import requests
from django.conf import settings


class FrappeHRConfigurationError(RuntimeError):
    pass


class FrappeHRAPIError(RuntimeError):
    def __init__(self, message: str, *, status_code: int | None = None, details: Any = None):
        super().__init__(message)
        self.status_code = status_code
        self.details = details


class FrappeHRClient:
    def __init__(self):
        self.base_url = (settings.FRAPPE_HR_BASE_URL or "").rstrip("/")
        self.site_name = settings.FRAPPE_HR_SITE_NAME
        self.api_key = settings.FRAPPE_HR_API_KEY
        self.api_secret = settings.FRAPPE_HR_API_SECRET
        self.timeout = settings.FRAPPE_HR_TIMEOUT_SECONDS

        if not self.base_url:
            raise FrappeHRConfigurationError("FRAPPE_HR_BASE_URL is not configured.")
        if not self.api_key or not self.api_secret:
            raise FrappeHRConfigurationError("FRAPPE_HR_API_KEY and FRAPPE_HR_API_SECRET are required.")

    def _headers(self) -> dict[str, str]:
        headers = {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": f"token {self.api_key}:{self.api_secret}",
        }
        if self.site_name:
            headers["Host"] = self.site_name
            headers["X-Frappe-Site-Name"] = self.site_name
        return headers

    def _url(self, path: str) -> str:
        return urljoin(f"{self.base_url}/", path.lstrip("/"))

    @staticmethod
    def _doctype_path(doctype: str, name: str | None = None) -> str:
        base = f"/api/resource/{quote(doctype, safe='')}"
        if name:
            return f"{base}/{quote(name, safe='')}"
        return base

    def request(self, method: str, path: str, **kwargs) -> dict[str, Any]:
        try:
            response = requests.request(
                method,
                self._url(path),
                headers=self._headers(),
                timeout=self.timeout,
                **kwargs,
            )
        except requests.RequestException as exc:
            raise FrappeHRAPIError(f"Could not reach Frappe HR: {exc}") from exc

        payload: dict[str, Any] = {}
        if response.content:
            try:
                payload = response.json()
            except ValueError:
                payload = {"raw": response.text}

        if response.status_code >= 400:
            message = (
                payload.get("message")
                or payload.get("exception")
                or payload.get("exc_type")
                or payload.get("_server_messages")
                or f"Frappe HR request failed with HTTP {response.status_code}."
            )
            if isinstance(message, str) and message.startswith("["):
                try:
                    parsed = json.loads(message)
                    message = " ".join(item.get("message", str(item)) if isinstance(item, dict) else str(item) for item in parsed)
                except ValueError:
                    pass
            raise FrappeHRAPIError(str(message), status_code=response.status_code, details=payload)

        return payload

    def list_documents(
        self,
        doctype: str,
        *,
        filters: list[list[Any]] | None = None,
        fields: list[str] | None = None,
        limit: int = 20,
    ) -> list[dict[str, Any]]:
        params: dict[str, str | int] = {"limit_page_length": limit}
        if filters is not None:
            params["filters"] = json.dumps(filters)
        if fields is not None:
            params["fields"] = json.dumps(fields)
        payload = self.request("GET", self._doctype_path(doctype), params=params)
        return payload.get("data") or []

    def get_document(self, doctype: str, name: str) -> dict[str, Any]:
        payload = self.request("GET", self._doctype_path(doctype, name))
        return payload.get("data") or {}

    def create_document(self, doctype: str, data: dict[str, Any]) -> dict[str, Any]:
        payload = self.request("POST", self._doctype_path(doctype), json=data)
        return payload.get("data") or {}

    def update_document(self, doctype: str, name: str, data: dict[str, Any]) -> dict[str, Any]:
        payload = self.request("PUT", self._doctype_path(doctype, name), json=data)
        return payload.get("data") or {}

    def find_one(
        self,
        doctype: str,
        filters: list[list[Any]],
        *,
        fields: list[str] | None = None,
    ) -> dict[str, Any] | None:
        documents = self.list_documents(doctype, filters=filters, fields=fields or ["name"], limit=1)
        return documents[0] if documents else None

    def call_method(self, method_path: str, data: dict[str, Any] | None = None) -> Any:
        payload = self.request("POST", f"/api/method/{method_path}", json=data or {})
        return payload.get("message")
