import logging
import os
from pathlib import Path
import socket
import subprocess
import sys
import tempfile
import time
from typing import Any, Dict, Optional

from django.conf import settings
import requests
from rest_framework import status
from rest_framework.permissions import IsAdminUser
from rest_framework.request import Request as DRFRequest
from rest_framework.response import Response
from rest_framework.views import APIView

from .client import get_llm_candidates, get_service_base_urls

logger = logging.getLogger(__name__)


def _get_bootstrap_runner():
    ai_views = sys.modules.get("integrations.ai.views")
    if ai_views and hasattr(ai_views, "_run_fpt_gpu_bootstrap_ssh"):
        return ai_views._run_fpt_gpu_bootstrap_ssh
    return _run_fpt_gpu_bootstrap_ssh


def _get_fpt_request_runner():
    ai_views = sys.modules.get("integrations.ai.views")
    if ai_views and hasattr(ai_views, "_fpt_gpu_request"):
        return ai_views._fpt_gpu_request
    return _fpt_gpu_request


def _fpt_gpu_config() -> Dict[str, Any]:
    return {
        "tenantId": getattr(settings, "FPT_GPU_TENANT_ID", ""),
        "region": getattr(settings, "FPT_GPU_REGION", "hanoi-2-vn"),
        "containerId": getattr(settings, "FPT_GPU_CONTAINER_ID", ""),
        "name": getattr(settings, "FPT_GPU_CONTAINER_NAME", ""),
        "consoleUrl": getattr(settings, "FPT_GPU_CONSOLE_URL", ""),
        "billing": {
            "runningHourlyVnd": getattr(settings, "FPT_GPU_RUNNING_HOURLY_COST_VND", 0),
            "stoppedHourlyVnd": getattr(settings, "FPT_GPU_STOPPED_HOURLY_COST_VND", 0),
        },
    }


def _fpt_control_credentials_configured() -> bool:
    return bool(
        getattr(settings, "FPT_GPU_BSS_ACCESS_TOKEN", "")
        or getattr(settings, "FPT_GPU_ACCESS_TOKEN", "")
    )


def _fpt_bootstrap_configured() -> bool:
    return bool(
        getattr(settings, "FPT_GPU_SSH_HOST", "")
        and getattr(settings, "FPT_GPU_SSH_PORT", 0)
        and getattr(settings, "FPT_GPU_SSH_USER", "")
        and getattr(settings, "FPT_GPU_SSH_KEY_PATH", "")
        and getattr(settings, "FPT_GPU_BOOTSTRAP_COMMAND", "")
    )


class FPTGPUControlError(Exception):
    def __init__(self, message: str, status_code: int = 502):
        super().__init__(message)
        self.status_code = status_code


class FPTGPUControlNotConfigured(FPTGPUControlError):
    def __init__(self):
        super().__init__(
            "FPT GPU control token is not configured. Set FPT_GPU_BSS_ACCESS_TOKEN or FPT_GPU_ACCESS_TOKEN.",
            status_code=503,
        )


class FPTGPUBootstrapNotConfigured(FPTGPUControlError):
    def __init__(self):
        super().__init__(
            "FPT GPU SSH bootstrap is not configured. Set FPT_GPU_SSH_HOST, FPT_GPU_SSH_PORT, "
            "FPT_GPU_SSH_USER, FPT_GPU_SSH_KEY_PATH, and FPT_GPU_BOOTSTRAP_COMMAND.",
            status_code=503,
        )


def _wait_for_tcp_port(host: str, port: int, timeout_seconds: int) -> None:
    deadline = time.monotonic() + max(timeout_seconds, 1)
    last_error = ""
    while time.monotonic() < deadline:
        try:
            with socket.create_connection((host, port), timeout=5):
                return
        except OSError as exc:
            last_error = str(exc)
            time.sleep(5)

    raise FPTGPUControlError(
        f"Timed out waiting for FPT GPU SSH port {host}:{port}. Last error: {last_error}",
        status_code=504,
    )


def _tail_text(value: str, limit: int = 4000) -> str:
    if not value:
        return ""
    return value[-limit:]


def _copy_ssh_key_for_strict_permissions(source_path: str) -> str:
    expanded = os.path.expandvars(os.path.expanduser(source_path))
    source = Path(expanded)
    if not source.is_file():
        raise FPTGPUControlError(f"FPT GPU SSH key file was not found at {source}.", status_code=503)

    with tempfile.NamedTemporaryFile("w", encoding="utf-8", delete=False) as key_file:
        key_file.write(source.read_text(encoding="utf-8"))
        temp_path = key_file.name

    os.chmod(temp_path, 0o600)
    return temp_path


def _run_fpt_gpu_bootstrap_ssh() -> Dict[str, Any]:
    if not _fpt_bootstrap_configured():
        raise FPTGPUBootstrapNotConfigured()

    host = str(getattr(settings, "FPT_GPU_SSH_HOST", "")).strip()
    port = int(getattr(settings, "FPT_GPU_SSH_PORT", 22))
    user = str(getattr(settings, "FPT_GPU_SSH_USER", "root")).strip()
    command = str(getattr(settings, "FPT_GPU_BOOTSTRAP_COMMAND", "")).strip()
    tcp_wait_seconds = int(getattr(settings, "FPT_GPU_BOOTSTRAP_TCP_WAIT_SECONDS", 240))
    command_timeout_seconds = int(getattr(settings, "FPT_GPU_BOOTSTRAP_TIMEOUT_SECONDS", 900))

    _wait_for_tcp_port(host, port, tcp_wait_seconds)

    temp_key_path = _copy_ssh_key_for_strict_permissions(getattr(settings, "FPT_GPU_SSH_KEY_PATH", ""))
    try:
        completed = subprocess.run(
            [
                "ssh",
                "-o",
                "BatchMode=yes",
                "-o",
                "StrictHostKeyChecking=accept-new",
                "-o",
                "ConnectTimeout=15",
                "-p",
                str(port),
                "-i",
                temp_key_path,
                f"{user}@{host}",
                command,
            ],
            check=False,
            capture_output=True,
            text=True,
            timeout=command_timeout_seconds,
        )
    except FileNotFoundError as exc:
        raise FPTGPUControlError("OpenSSH client is not installed on the backend container.", status_code=503) from exc
    except subprocess.TimeoutExpired as exc:
        raise FPTGPUControlError(f"FPT GPU bootstrap timed out after {command_timeout_seconds}s.", status_code=504) from exc
    finally:
        try:
            os.unlink(temp_key_path)
        except OSError:
            pass

    result = {
        "returnCode": completed.returncode,
        "stdout": _tail_text(completed.stdout),
        "stderr": _tail_text(completed.stderr),
    }
    if completed.returncode != 0:
        raise FPTGPUControlError(
            f"FPT GPU bootstrap failed with exit code {completed.returncode}: {_tail_text(completed.stderr, 1000)}",
            status_code=502,
        )
    return result


def _get_fpt_bss_access_token() -> str:
    token = getattr(settings, "FPT_GPU_BSS_ACCESS_TOKEN", "")
    if token:
        return token

    access_token = getattr(settings, "FPT_GPU_ACCESS_TOKEN", "")
    tenant_id = getattr(settings, "FPT_GPU_TENANT_ID", "")
    if not access_token:
        raise FPTGPUControlNotConfigured()
    if not tenant_id:
        raise FPTGPUControlError("FPT_GPU_TENANT_ID is required to exchange FPT access token.", status_code=503)

    try:
        response = requests.get(
            getattr(settings, "FPT_GPU_BSS_TOKEN_EXCHANGE_URL", ""),
            headers={
                "Authorization": f"Bearer {access_token}",
                "tenant-id": tenant_id,
            },
            timeout=(5, 20),
        )
    except requests.RequestException as exc:
        raise FPTGPUControlError(f"Could not exchange FPT access token: {exc}") from exc

    if response.status_code >= 400:
        raise FPTGPUControlError(
            f"FPT token exchange failed with status {response.status_code}.",
            status_code=502,
        )

    try:
        payload = response.json()
    except ValueError as exc:
        raise FPTGPUControlError("FPT token exchange returned invalid JSON.") from exc

    cloud_token = (
        (payload.get("data") or {}).get("cloud_access_token")
        or payload.get("cloud_access_token")
    )
    if not cloud_token:
        raise FPTGPUControlError("FPT token exchange did not return cloud_access_token.")
    return cloud_token


def _fpt_gpu_request(method: str, path: str, payload: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    token = _get_fpt_bss_access_token()
    base_url = getattr(settings, "FPT_GPU_CONTROL_BASE_URL", "https://console-api.fptcloud.com").rstrip("/")
    url = f"{base_url}{path}"

    try:
        response = requests.request(
            method,
            url,
            json=payload,
            headers={
                "Authorization": f"Bearer {token}",
                "fpt-region": getattr(settings, "FPT_GPU_REGION", "hanoi-2-vn"),
                "Content-Type": "application/json",
            },
            timeout=(5, 30),
        )
    except requests.RequestException as exc:
        raise FPTGPUControlError(f"FPT GPU control request failed: {exc}") from exc

    if response.status_code >= 400:
        try:
            error_payload = response.json()
        except ValueError:
            error_payload = response.text[:300]
        raise FPTGPUControlError(
            f"FPT GPU control returned {response.status_code}: {error_payload}",
            status_code=502,
        )

    if not response.content:
        return {}
    try:
        return response.json()
    except ValueError:
        return {"raw": response.text}


def _fpt_gpu_path(suffix: str = "") -> str:
    tenant_id = getattr(settings, "FPT_GPU_TENANT_ID", "")
    container_id = getattr(settings, "FPT_GPU_CONTAINER_ID", "")
    if not tenant_id or not container_id:
        raise FPTGPUControlError("FPT_GPU_TENANT_ID and FPT_GPU_CONTAINER_ID are required.", status_code=503)
    base = (
        "/api/v1/xplat/gpu-container/common/tenants/"
        f"{tenant_id}/gpu-containers/{container_id}"
    )
    return f"{base}{suffix}"


def _get_fpt_container_detail() -> Optional[Dict[str, Any]]:
    if not _fpt_control_credentials_configured():
        return None
    return _get_fpt_request_runner()("GET", _fpt_gpu_path())


def _infer_container_status(checks: Dict[str, Any]) -> str:
    ai_statuses = [checks.get(key, {}).get("status") for key in ("llm", "stt", "tts")]
    if all(status == "online" for status in ai_statuses):
        return "RUNNING"
    if any(status == "online" for status in ai_statuses):
        return "DEGRADED"
    return "UNKNOWN"


class FPTGPUControlStatusAPIView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request: DRFRequest):
        from .views import _ai_service_checks
        checks = _ai_service_checks()
        container = _fpt_gpu_config()
        control_error = ""
        detail = None

        if _fpt_control_credentials_configured():
            try:
                detail = _get_fpt_container_detail()
            except FPTGPUControlError as exc:
                control_error = str(exc)
                logger.warning("FPT GPU detail check failed: %s", exc)

        fpt_status = (detail or {}).get("status") if isinstance(detail, dict) else None
        container.update(
            {
                "status": fpt_status or _infer_container_status(checks),
                "statusSource": "fpt_api" if fpt_status else "service_probe",
                "detail": detail if isinstance(detail, dict) else None,
            }
        )

        all_ready = all(item.get("status") == "online" for item in checks.values())
        return Response(
            {
                "container": container,
                "control": {
                    "available": _fpt_control_credentials_configured() and not control_error,
                    "configured": _fpt_control_credentials_configured(),
                    "error": control_error,
                },
                "bootstrap": {
                    "configured": _fpt_bootstrap_configured(),
                },
                "ai": {
                    "status": "ready" if all_ready else "degraded",
                    "checks": checks,
                },
            },
            status=200,
        )


class FPTGPUControlActionAPIView(APIView):
    permission_classes = [IsAdminUser]

    ACTIONS = {
        "start": "START",
        "stop": "STOP",
        "restart": "RESTART",
    }

    def post(self, request: DRFRequest, action: str):
        requested_action = action.lower()
        if requested_action == "bootstrap":
            try:
                bootstrap_result = _get_bootstrap_runner()()
            except FPTGPUControlError as exc:
                return Response({"detail": str(exc)}, status=exc.status_code)

            return Response(
                {
                    "action": "BOOTSTRAP",
                    "result": bootstrap_result,
                },
                status=status.HTTP_200_OK,
            )

        if requested_action == "start-bootstrap":
            try:
                start_result = _get_fpt_request_runner()(
                    "POST",
                    _fpt_gpu_path("/actions"),
                    payload={"action": "START"},
                )
                bootstrap_result = _get_bootstrap_runner()()
            except FPTGPUControlError as exc:
                return Response({"detail": str(exc)}, status=exc.status_code)

            return Response(
                {
                    "action": "START_BOOTSTRAP",
                    "result": {
                        "start": start_result,
                        "bootstrap": bootstrap_result,
                    },
                },
                status=status.HTTP_200_OK,
            )

        normalized_action = self.ACTIONS.get(requested_action)
        if not normalized_action:
            return Response({"detail": "Unsupported FPT GPU action."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            result = _get_fpt_request_runner()(
                "POST",
                _fpt_gpu_path("/actions"),
                payload={"action": normalized_action},
            )
        except FPTGPUControlError as exc:
            return Response({"detail": str(exc)}, status=exc.status_code)

        return Response(
            {
                "action": normalized_action,
                "result": result,
            },
            status=status.HTTP_200_OK,
        )


gpu_control_status = FPTGPUControlStatusAPIView.as_view()
gpu_control_action = FPTGPUControlActionAPIView.as_view()
