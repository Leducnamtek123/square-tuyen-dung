import json
import logging
import os
import re
import socket
import subprocess
import tempfile
import time
import unicodedata
from pathlib import Path
from typing import Optional, List, Dict, Any
from urllib.parse import urlsplit, urlunsplit

import requests
from django.conf import settings
from django.db import transaction
from django.db.models import Q
from django.http import (
    HttpRequest,
    HttpResponse,
    JsonResponse,
    StreamingHttpResponse,
)
from django.views.decorators.csrf import csrf_exempt
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.request import Request as DRFRequest
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.throttling import AnonRateThrottle

from apps.accounts.models import User
from apps.accounts.active_company import apply_active_company_from_request
from apps.accounts.permissions import IsAdminUser
from shared.configs import variable_system as var_sys
from shared.configs.variable_response import data_response
from integrations.ai.client import (
    AIServiceUnavailable,
    get_llm_candidates,
    get_service_base_urls,
    post_chat_completion_requests,
)

logger = logging.getLogger(__name__)

try:
    from config.throttles import (
        AIChatThrottle, AIChatUserThrottle,
        AIHeavyAnonThrottle, AIHeavyUserThrottle,
    )
except ImportError:
    AIChatThrottle = AnonRateThrottle
    AIChatUserThrottle = None
    AIHeavyAnonThrottle = AnonRateThrottle
    AIHeavyUserThrottle = None

# Import models for tools
try:
    from apps.jobs.models import JobPost, JobPostActivity
    from apps.jobs.manual_candidate_validation import validate_manual_candidate_activity_storage
    from apps.profiles.models import Resume, JobSeekerProfile, Company
    from apps.profiles.serializers import EmployerCandidateProfileSerializer
    from apps.interviews.models import InterviewSession
    from apps.interviews.tasks import send_interview_invitation
except ImportError:
    JobPost = None
    JobPostActivity = None
    validate_manual_candidate_activity_storage = None
    Resume = None
    JobSeekerProfile = None
    Company = None
    EmployerCandidateProfileSerializer = None
    InterviewSession = None
    send_interview_invitation = None

def _get_json_body(request: HttpRequest) -> dict:
    try:
        raw = request.body.decode("utf-8") if request.body else ""
        return json.loads(raw) if raw else {}
    except Exception:
        return {}

@csrf_exempt
def _tts_fn(request: HttpRequest):
    """
    POST /api/ai/tts/
    Body: { "text": "...", "voice"?: "...", "format"?: "mp3"|"wav"|"pcm", "speed"?: number }

    Proxies to an OpenAI-compatible TTS server (default: VieNeu-TTS).
    Returns audio bytes (streaming) with upstream content-type.
    """
    if request.method != "POST":
        return JsonResponse({"detail": "Method not allowed."}, status=405)

    body = _get_json_body(request)
    return _tts_response_from_body(body)


def _tts_response_from_body(body: Dict[str, Any]):
    text = (body.get("text") or "").strip()
    if not text:
        return JsonResponse({"detail": "Missing `text`."}, status=400)

    voice = body.get("voice") or getattr(settings, "AI_TTS_DEFAULT_VOICE", None)
    voice_profile_id = (
        body.get("voiceProfileId")
        or body.get("voice_profile_id")
        or body.get("voiceProfile")
        or body.get("voice_profile")
    )
    if isinstance(voice_profile_id, dict):
        voice_profile_id = voice_profile_id.get("id")
    if voice_profile_id:
        voice = f"profile:{voice_profile_id}"
    response_format = body.get("format") or body.get("response_format") or "mp3"
    payload = {
        "input": text,
        "model": body.get("model") or "tts-1",
        "voice": voice or "Ly",
        "response_format": response_format,
    }
    if body.get("speed") is not None:
        payload["speed"] = body.get("speed")

    last_error: Dict[str, Any] = {}
    for index, base_url in enumerate(get_service_base_urls("tts")):
        url = f"{base_url}/audio/speech"
        try:
            upstream = requests.post(url, json=payload, stream=True, timeout=(10, 300))
        except requests.RequestException as e:
            last_error = {"source": "primary" if index == 0 else f"fallback-{index}", "detail": str(e)}
            logger.warning("TTS candidate %s unavailable: %s", base_url, e)
            continue

        if upstream.status_code >= 400:
            try:
                err = upstream.json()
            except Exception:
                err = {"detail": upstream.text[:500]}
            last_error = {"source": "primary" if index == 0 else f"fallback-{index}", "upstream": err}
            logger.warning("TTS candidate %s returned HTTP %s", base_url, upstream.status_code)
            continue

        content_type = upstream.headers.get("content-type") or "audio/mpeg"

        def gen():
            for chunk in upstream.iter_content(chunk_size=64 * 1024):
                if chunk:
                    yield chunk

        resp = StreamingHttpResponse(gen(), content_type=content_type)
        # Best-effort content length
        if upstream.headers.get("content-length"):
            resp["Content-Length"] = upstream.headers["content-length"]
        return resp

    return JsonResponse({"detail": "TTS upstream unavailable.", "upstream": last_error}, status=502)


class TTSAPIView(APIView):
    """
    Rate-limited wrapper around the TTS proxy.
    10 req/min (anon), 20 req/min (auth).
    """
    permission_classes = [AllowAny]
    throttle_classes = [AIHeavyAnonThrottle, AIHeavyUserThrottle] if AIHeavyUserThrottle else [AIHeavyAnonThrottle]

    def post(self, request: DRFRequest):
        return _tts_response_from_body(dict(request.data))


# Backward-compat alias — urls.py uses ai_views.tts
tts = TTSAPIView.as_view()


@csrf_exempt
def _transcribe_fn(request: HttpRequest):
    """
    POST /api/ai/transcribe/
    multipart/form-data: audio=<file>

    Proxies to an OpenAI-compatible STT server.
    Returns JSON envelope: { errors: {}, data: { transcription: string } }
    """
    if request.method != "POST":
        return JsonResponse({"detail": "Method not allowed."}, status=405)

    audio_file = request.FILES.get("audio")
    if not audio_file:
        return JsonResponse(data_response(errors={"detail": "Missing `audio`."}, data=None), status=400)

    model = request.POST.get("model") or getattr(settings, "AI_STT_MODEL", "openai/whisper-large-v3")
    language = request.POST.get("language") or getattr(settings, "AI_STT_LANGUAGE", "vi")
    audio_bytes = audio_file.read()

    files = {
        "file": (audio_file.name or "audio.webm", audio_bytes, audio_file.content_type or "application/octet-stream")
    }
    data = {
        "model": model,
        "language": language,
    }

    last_error: Dict[str, Any] = {}
    for index, base_url in enumerate(get_service_base_urls("stt")):
        url = f"{base_url}/audio/transcriptions"
        try:
            upstream = requests.post(url, data=data, files=files, timeout=(10, 300))
        except requests.RequestException as e:
            last_error = {"source": "primary" if index == 0 else f"fallback-{index}", "detail": str(e)}
            logger.warning("STT candidate %s unavailable: %s", base_url, e)
            continue

        if upstream.status_code >= 400:
            try:
                err = upstream.json()
            except Exception:
                err = {"detail": upstream.text[:500]}
            last_error = {"source": "primary" if index == 0 else f"fallback-{index}", "upstream": err}
            logger.warning("STT candidate %s returned HTTP %s", base_url, upstream.status_code)
            continue

        try:
            upstream_json = upstream.json()
        except Exception:
            upstream_json = {}

        # OpenAI-compatible STT typically returns { text: "..." }.
        transcription = upstream_json.get("text") or upstream_json.get("transcription") or ""
        return JsonResponse(data_response(errors={}, data={"transcription": transcription}), status=200)

    return JsonResponse(
        data_response(errors={"detail": "STT upstream unavailable.", "upstream": last_error}, data=None),
        status=502,
    )


class TranscribeAPIView(APIView):
    """
    Rate-limited wrapper around the STT proxy.
    10 req/min (anon), 20 req/min (auth).
    """
    permission_classes = [AllowAny]
    throttle_classes = [AIHeavyAnonThrottle, AIHeavyUserThrottle] if AIHeavyUserThrottle else [AIHeavyAnonThrottle]

    def post(self, request: DRFRequest):
        return _transcribe_fn(request._request)


# Backward-compat alias—urls.py uses ai_views.transcribe
transcribe = TranscribeAPIView.as_view()


def _http_probe_url(base_url: str) -> str:
    if not base_url:
        return ""

    try:
        parsed = urlsplit(base_url)
    except ValueError:
        return base_url

    scheme = parsed.scheme.lower()
    if scheme == "wss":
        return urlunsplit(("https", parsed.netloc, parsed.path, parsed.query, parsed.fragment))
    if scheme == "ws":
        return urlunsplit(("http", parsed.netloc, parsed.path, parsed.query, parsed.fragment))
    return base_url


def _probe_http_service(name: str, base_url: str, path: str = "/models", headers: Optional[Dict[str, str]] = None) -> Dict[str, Any]:
    if not base_url:
        return {"status": "not_configured", "latencyMs": None}

    probe_url = _http_probe_url(base_url)
    started_at = time.time()
    try:
        response = requests.get(f"{probe_url.rstrip('/')}{path}", headers=headers or {}, timeout=(2, 4))
        latency_ms = int((time.time() - started_at) * 1000)
        return {
            "status": "online" if response.status_code < 500 else "offline",
            "latencyMs": latency_ms,
            "statusCode": response.status_code,
        }
    except requests.RequestException as exc:
        return {"status": "offline", "latencyMs": None, "error": str(exc)}


def _probe_http_candidates(candidates: List[Dict[str, Any]], path: str = "/models") -> Dict[str, Any]:
    if not candidates:
        return {"status": "not_configured", "latencyMs": None, "candidates": []}

    probe_results = []
    for candidate in candidates:
        result = _probe_http_service(
            candidate.get("name", "candidate"),
            candidate.get("baseUrl", ""),
            path=path,
            headers=candidate.get("headers") or {},
        )
        result["name"] = candidate.get("name")
        result["baseUrl"] = candidate.get("baseUrl")
        probe_results.append(result)

    online = next((item for item in probe_results if item.get("status") == "online"), None)
    if online:
        return {
            "status": "online",
            "latencyMs": online.get("latencyMs"),
            "active": online.get("name"),
            "candidates": probe_results,
        }

    return {
        "status": "offline",
        "latencyMs": None,
        "candidates": probe_results,
    }


def _probe_celery() -> Dict[str, Any]:
    try:
        from config.celery import app as celery_app

        replies = celery_app.control.ping(timeout=1.0)
        return {"status": "online" if replies else "offline", "workers": len(replies)}
    except Exception as exc:
        return {"status": "offline", "workers": 0, "error": str(exc)}


def _ai_service_checks() -> Dict[str, Any]:
    livekit_url = getattr(settings, "LIVEKIT_URL", "") or getattr(settings, "LIVEKIT_PUBLIC_URL", "")
    llm_model = getattr(settings, "AI_LLM_MODEL", "")
    llm_candidates = [
        {
            "name": candidate.name,
            "baseUrl": candidate.normalized_base_url,
            "headers": candidate.headers(),
        }
        for candidate in get_llm_candidates(default_model=llm_model)
    ]
    stt_candidates = [
        {"name": "primary" if index == 0 else f"fallback-{index}", "baseUrl": base_url}
        for index, base_url in enumerate(get_service_base_urls("stt"))
    ]
    tts_candidates = [
        {"name": "primary" if index == 0 else f"fallback-{index}", "baseUrl": base_url}
        for index, base_url in enumerate(get_service_base_urls("tts"))
    ]

    return {
        "llm": _probe_http_candidates(llm_candidates),
        "stt": _probe_http_candidates(stt_candidates),
        "tts": _probe_http_candidates(tts_candidates, path="/voices"),
        "livekit": _probe_http_service("livekit", livekit_url, path="/"),
        "celery": _probe_celery(),
    }


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
    return _fpt_gpu_request("GET", _fpt_gpu_path())


def _infer_container_status(checks: Dict[str, Any]) -> str:
    ai_statuses = [checks.get(key, {}).get("status") for key in ("llm", "stt", "tts")]
    if all(status == "online" for status in ai_statuses):
        return "RUNNING"
    if any(status == "online" for status in ai_statuses):
        return "DEGRADED"
    return "UNKNOWN"


class AIHealthAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request: DRFRequest):
        checks = _ai_service_checks()
        all_ready = all(item.get("status") == "online" for item in checks.values())
        return Response(
            data_response(
                errors={},
                data={
                    "status": "ready" if all_ready else "degraded",
                    "checks": checks,
                },
            ),
            status=200,
        )


health = AIHealthAPIView.as_view()


class FPTGPUControlStatusAPIView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request: DRFRequest):
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
                bootstrap_result = _run_fpt_gpu_bootstrap_ssh()
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
                start_result = _fpt_gpu_request(
                    "POST",
                    _fpt_gpu_path("/actions"),
                    payload={"action": "START"},
                )
                bootstrap_result = _run_fpt_gpu_bootstrap_ssh()
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
            result = _fpt_gpu_request(
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


# ---------------------------------------------------------------------------
# Helper for tool calls (used by ChatAPIView)
# ---------------------------------------------------------------------------

_LLM_FALLBACK_REPLY = (
    "Xin lỗi, hệ thống AI đang bận hoặc chưa sẵn sàng. "
    "Vui lòng thử lại sau ít phút. "
    "Nếu vấn đề tiếp diễn, hãy liên hệ bộ phận hỗ trợ."
)

RECRUITMENT_TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "search_candidates",
            "description": "Tìm kiếm ứng viên dựa trên kỹ năng, vị trí hoặc kinh nghiệm.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Từ khóa tìm kiếm (ví dụ: 'React developer', 'Python', 'Kế toán')."
                    },
                    "limit": {
                        "type": "integer",
                        "description": "Số lượng kết quả tối đa.",
                        "default": 5
                    }
                },
                "required": ["query"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "create_interview_invitation",
            "description": "Tạo lời mời phỏng vấn cho một ứng viên và gửi email thông báo.",
            "parameters": {
                "type": "object",
                "properties": {
                    "candidate_id": {
                        "type": "integer",
                        "description": "ID của ứng viên (user id)."
                    },
                    "job_post_id": {
                        "type": "integer",
                        "description": "ID của tin tuyển dụng."
                    },
                    "scheduled_at": {
                        "type": "string",
                        "description": "Thời gian phỏng vấn định dạng ISO (ví dụ: '2024-03-20T10:00:00')."
                    }
                },
                "required": ["candidate_id", "job_post_id"]
            }
        }
    }
]


def _role_name(user) -> str:
    return str(getattr(user, "role_name", "") or "").upper()


def _can_use_recruitment_tools(request: DRFRequest) -> bool:
    user = getattr(request, "user", None)
    return (
        bool(user and user.is_authenticated)
        and (
            _role_name(user) in {var_sys.EMPLOYER, var_sys.ADMIN}
            or bool(getattr(user, "is_staff", False))
            or bool(getattr(user, "is_superuser", False))
        )
    )


def _can_search_candidates(request: DRFRequest) -> bool:
    return _can_use_recruitment_tools(request)


def _can_create_interview(request: DRFRequest) -> bool:
    return _can_use_recruitment_tools(request)


def _apply_ai_active_company_context(request: DRFRequest):
    return apply_active_company_from_request(request)


def _user_can_use_job_post_for_ai_tool(request: DRFRequest, job_post) -> bool:
    user = getattr(request, "user", None)
    if not user or not getattr(user, "is_authenticated", False):
        return False
    if (
        _role_name(user) == var_sys.ADMIN
        or getattr(user, "is_staff", False)
        or getattr(user, "is_superuser", False)
    ):
        return True
    _apply_ai_active_company_context(request)
    active_company = (
        user.get_active_company()
        if hasattr(user, "get_active_company")
        else getattr(user, "active_company", None)
    )
    return (
        _role_name(user) == var_sys.EMPLOYER
        and active_company is not None
        and getattr(job_post, "company_id", None) == active_company.id
    )


def _parse_tool_arguments(tool_call) -> tuple[dict, Optional[str]]:
    raw_args = tool_call.get("function", {}).get("arguments", "{}")
    if raw_args in (None, ""):
        return {}, None
    if isinstance(raw_args, dict):
        return raw_args, None
    if not isinstance(raw_args, str):
        return {}, "Lỗi: Tham số công cụ không hợp lệ."
    try:
        parsed = json.loads(raw_args)
    except (TypeError, json.JSONDecodeError):
        return {}, "Lỗi: Tham số công cụ không hợp lệ."
    if not isinstance(parsed, dict):
        return {}, "Lỗi: Tham số công cụ không hợp lệ."
    return parsed, None


def _coerce_tool_limit(value, default: int = 5, maximum: int = 20) -> int:
    try:
        limit = int(value)
    except (TypeError, ValueError):
        return default
    return max(1, min(limit, maximum))


def _is_tool_choice_rejection(exc: AIServiceUnavailable) -> bool:
    detail = " ".join(str(attempt) for attempt in getattr(exc, "attempts", [])).lower()
    return "tool" in detail and (
        "http 400" in detail
        or "http 422" in detail
        or "badrequest" in detail
        or "bad request" in detail
    )


def _strip_accents(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value or "")
    return "".join(ch for ch in normalized if not unicodedata.combining(ch))


def _normalize_chat_text(value: str) -> str:
    normalized = _strip_accents(value).lower()
    normalized = re.sub(r"[^a-z0-9]+", " ", normalized)
    return re.sub(r"\s+", " ", normalized).strip()


def _recent_chat_text(messages: List[Dict[str, Any]], *, roles: Optional[set[str]] = None) -> str:
    contents = []
    for message in messages[-8:]:
        role = message.get("role")
        if role == "system":
            continue
        if roles and role not in roles:
            continue
        content = message.get("content")
        if isinstance(content, str) and content.strip():
            contents.append(content.strip())
    return "\n".join(contents)


VIETNAMESE_CHAT_INSTRUCTION = (
    "Luôn trả lời bằng tiếng Việt có dấu, tự nhiên và dễ đọc. "
    "Nếu người dùng viết tiếng Việt không dấu, vẫn trả lời lại bằng tiếng Việt có đầy đủ dấu. "
    "Không dùng emoji trong câu trả lời."
)


def _with_vietnamese_chat_instruction(messages: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    normalized_messages = list(messages)
    if not normalized_messages:
        return [{"role": "system", "content": VIETNAMESE_CHAT_INSTRUCTION}]

    first_message = normalized_messages[0]
    if first_message.get("role") == "system":
        content = str(first_message.get("content") or "").strip()
        if VIETNAMESE_CHAT_INSTRUCTION not in content:
            normalized_messages[0] = {
                **first_message,
                "content": f"{content}\n{VIETNAMESE_CHAT_INSTRUCTION}".strip(),
            }
        return normalized_messages

    return [{"role": "system", "content": VIETNAMESE_CHAT_INSTRUCTION}, *normalized_messages]


def _is_manual_candidate_create_intent(messages: List[Dict[str, Any]]) -> bool:
    user_text = _recent_chat_text(messages, roles={"user"})
    normalized = _normalize_chat_text(user_text)
    if "tao" not in normalized:
        return False
    return (
        ("ho so" in normalized and "ung vien" in normalized)
        or "manual candidate" in normalized
        or "candidate profile" in normalized
    )


def _clean_extracted_name(value: str) -> str:
    name = re.sub(r"\s+", " ", value or "").strip(" ,.;:-")
    name = re.sub(r"^(?:ten|tên|la|là)\s+", "", name, flags=re.IGNORECASE).strip(" ,.;:-")
    return name[:150]


def _extract_manual_candidate_name(text: str) -> str:
    patterns = [
        r"(?:ứng viên|ung vien)\s+(?P<name>.+?)(?=\s+(?:cho|vào|vao|ứng tuyển|ung tuyen|vị trí|vi tri|tin|job|email|sdt|sđt|phone|điện thoại|dien thoai)\b|[,.;]|\n|$)",
        r"(?:tên|ten)\s+(?P<name>.+?)(?=\s+(?:cho|vào|vao|ứng tuyển|ung tuyen|vị trí|vi tri|tin|job|email|sdt|sđt|phone|điện thoại|dien thoai)\b|[,.;]|\n|$)",
    ]
    for pattern in patterns:
        match = re.search(pattern, text, flags=re.IGNORECASE | re.DOTALL)
        if match:
            name = _clean_extracted_name(match.group("name"))
            if len(name.split()) >= 2:
                return name
    return ""


def _extract_email(text: str) -> str:
    match = re.search(r"[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}", text or "")
    return match.group(0)[:254] if match else ""


def _extract_phone(text: str) -> str:
    match = re.search(
        r"(?:sdt|sđt|phone|điện thoại|dien thoai)\s*[:\-]?\s*(?P<phone>\+?\d[\d\s.\-]{7,18})",
        text or "",
        flags=re.IGNORECASE,
    )
    if not match:
        return ""
    phone = re.sub(r"[^\d+]", "", match.group("phone"))
    return phone[:20]


def _select_manual_candidate_job_post(request: DRFRequest, text: str):
    if not JobPost:
        return None, "Không thể truy cập dữ liệu tin tuyển dụng."
    user = getattr(request, "user", None)
    _apply_ai_active_company_context(request)
    company = user.get_active_company() if user and hasattr(user, "get_active_company") else None
    if not company:
        return None, "Bạn cần chọn công ty đang hoạt động trước khi tạo hồ sơ ứng viên."

    queryset = JobPost.objects.filter(company=company)
    id_match = re.search(r"(?:jobpost|job_post|tin|job|#)\s*[:#]?\s*(?P<id>\d+)", _normalize_chat_text(text))
    if id_match:
        job_post = queryset.filter(id=int(id_match.group("id"))).first()
        if job_post:
            return job_post, ""

    normalized_text = _normalize_chat_text(text)
    matches = [
        job_post
        for job_post in queryset
        if _normalize_chat_text(getattr(job_post, "job_name", "")) in normalized_text
    ]
    if matches:
        return sorted(matches, key=lambda item: len(item.job_name), reverse=True)[0], ""

    count = queryset.count()
    if count == 1:
        return queryset.first(), ""
    return None, "Bạn cần cho biết tin tuyển dụng/vị trí muốn thêm hồ sơ ứng viên."


def _create_manual_candidate_from_chat(request: DRFRequest, messages: List[Dict[str, Any]]):
    if not _is_manual_candidate_create_intent(messages):
        return None
    if not _can_use_recruitment_tools(request):
        return Response(
            data_response(errors={}, data={"reply": "Bạn cần đăng nhập bằng tài khoản nhà tuyển dụng để tạo hồ sơ ứng viên."}),
            status=200,
        )
    if not EmployerCandidateProfileSerializer or not JobPostActivity or not validate_manual_candidate_activity_storage:
        return Response(
            data_response(errors={}, data={"reply": "Chức năng tạo hồ sơ ứng viên chưa sẵn sàng."}),
            status=200,
        )

    conversation_text = _recent_chat_text(messages)
    full_name = _extract_manual_candidate_name(conversation_text)
    if not full_name:
        return Response(
            data_response(errors={}, data={"reply": "Bạn vui lòng cung cấp họ tên ứng viên để tôi tạo hồ sơ."}),
            status=200,
        )

    job_post, job_error = _select_manual_candidate_job_post(request, conversation_text)
    if job_error:
        return Response(data_response(errors={}, data={"reply": job_error}), status=200)

    candidate_data = {
        "fullName": full_name,
        "title": job_post.job_name,
        "note": "Tạo từ Square AI chatbot.",
    }
    email = _extract_email(conversation_text)
    phone = _extract_phone(conversation_text)
    if email:
        candidate_data["email"] = email
    if phone:
        candidate_data["phone"] = phone

    activity_storage_errors = validate_manual_candidate_activity_storage(candidate_data)
    if activity_storage_errors:
        logger.warning("Manual candidate from chat exceeds activity storage limits: %s", activity_storage_errors)
        return Response(
            data_response(errors={}, data={"reply": "Không thể tạo hồ sơ ứng viên từ nội dung này. Bạn kiểm tra lại tên, email, số điện thoại và tin tuyển dụng."}),
            status=200,
        )

    candidate_serializer = EmployerCandidateProfileSerializer(
        data=candidate_data,
        context={"request": request},
    )
    try:
        candidate_serializer.is_valid(raise_exception=True)
        with transaction.atomic():
            candidate_profile = candidate_serializer.save()
            job_post_activity = JobPostActivity.objects.create(
                job_post=job_post,
                user=None,
                resume=None,
                manual_candidate_profile=candidate_profile,
                full_name=candidate_profile.full_name,
                email=candidate_profile.email,
                phone=candidate_profile.phone,
            )
    except Exception as exc:
        logger.warning("Could not create manual candidate from chat: %s", exc)
        return Response(
            data_response(errors={}, data={"reply": "Không thể tạo hồ sơ ứng viên từ nội dung này. Bạn kiểm tra lại tên, email, số điện thoại và tin tuyển dụng."}),
            status=200,
        )

    return Response(
        data_response(
            errors={},
            data={
                "reply": f"Đã tạo hồ sơ ứng viên {candidate_profile.full_name} cho tin tuyển dụng {job_post.job_name}.",
                "action": "create_manual_candidate",
                "activityId": job_post_activity.id,
                "manualCandidateProfileId": candidate_profile.id,
            },
        ),
        status=200,
    )


def execute_tool_call(tool_call, request):
    """Thực thi một tool call và trả về kết quả."""
    name = tool_call.get("function", {}).get("name")
    args, parse_error = _parse_tool_arguments(tool_call)
    if parse_error:
        return parse_error
    
    if name == "search_candidates":
        if not _can_search_candidates(request):
            return "Lỗi: Bạn không có quyền tìm kiếm ứng viên."
        query = str(args.get("query") or "").strip()
        if not query:
            return "Lỗi: Từ khóa tìm kiếm không hợp lệ."
        limit = _coerce_tool_limit(args.get("limit", 5))
        
        if not Resume:
            return "Lỗi: Không thể truy cập dữ liệu ứng viên."
            
        resumes = (
            Resume.objects.filter(
                is_active=True,
                user__role_name=var_sys.JOB_SEEKER,
            )
            .filter(
                Q(title__icontains=query) |
                Q(skills_summary__icontains=query) |
                Q(description__icontains=query)
            )
            .select_related('user')
            .distinct()[:limit]
        )
        
        results = []
        for r in resumes:
            results.append({
                "id": r.user.id,
                "name": r.user.full_name,
                "title": r.title,
                "experience": r.get_experience_display() if hasattr(r, 'get_experience_display') else r.experience,
                "skills": r.skills_summary[:200] + "..." if r.skills_summary and len(r.skills_summary) > 200 else r.skills_summary
            })
            
        if not results:
            return f"Không tìm thấy ứng viên nào phù hợp với từ khóa '{query}'."
            
        return json.dumps(results, ensure_ascii=False)
        
    elif name == "create_interview_invitation":
        if not _can_create_interview(request):
            return "Lỗi: Bạn không có quyền tạo lời mời phỏng vấn."
        candidate_id = args.get("candidate_id")
        job_post_id = args.get("job_post_id")
        scheduled_at = args.get("scheduled_at")
        
        if not InterviewSession:
            return "Lỗi: Không thể tạo buổi phỏng vấn."
            
        try:
            job_post = JobPost.objects.select_related("company").get(id=job_post_id)
            if not _user_can_use_job_post_for_ai_tool(request, job_post):
                return "Lỗi: Tin tuyển dụng không thuộc công ty đang hoạt động của bạn."

            if not User.objects.filter(id=candidate_id, role_name=var_sys.JOB_SEEKER).exists():
                return "Lỗi: Ứng viên không hợp lệ."

            from apps.interviews.serializers import InterviewSessionCreateSerializer

            serializer = InterviewSessionCreateSerializer(
                data={
                    "candidate": candidate_id,
                    "job_post": job_post.id,
                    "scheduled_at": scheduled_at,
                },
                context={"request": request},
            )
            if not serializer.is_valid():
                return f"Lỗi khi tạo lời mời: {serializer.errors}"
            session = serializer.save(created_by=request.user)
            
            # Kích hoạt task gửi email
            if send_interview_invitation:
                send_interview_invitation.delay(session.id)
                
            return f"Đã tạo lời mời phỏng vấn thành công cho ứng viên (ID: {candidate_id}) cho vị trí '{job_post.job_name}'. Email mời đã được gửi đi."
        except Exception as e:
            return f"Lỗi khi tạo lời mời: {str(e)}"
            
    return f"Công cụ {name} không được hỗ trợ."

class ChatAPIView(APIView):
    """
    POST /api/ai/chat/
    Body:
      - { "messages": [{role, content}, ...], "model"?: "...", "temperature"?: number, "max_tokens"?: number }
      - or { "message": "...", "system"?: "..." }

    Proxies to an OpenAI-compatible chat completions server, with support for function calling.
    Returns a friendly reply if the LLM service is unavailable.
    """
    permission_classes = [AllowAny]
    throttle_classes = [AIChatThrottle, AIChatUserThrottle] if AIChatUserThrottle else [AIChatThrottle]


    def post(self, request: DRFRequest):
        _apply_ai_active_company_context(request)
        body = request.data if isinstance(request.data, dict) else {}
        messages = body.get("messages")

        if not isinstance(messages, list) or not messages:
            message = (body.get("message") or "").strip()
            if not message:
                return Response({"detail": "Missing `message` or `messages`."}, status=400)
            system_prompt = (body.get("system") or "").strip()
            messages = []
            if system_prompt:
                messages.append({"role": "system", "content": system_prompt})
            messages.append({"role": "user", "content": message})

        messages = _with_vietnamese_chat_instruction(messages)
        model = body.get("model") or getattr(settings, "AI_LLM_MODEL", "gemma4:e4b")

        manual_candidate_response = _create_manual_candidate_from_chat(request, messages)
        if manual_candidate_response is not None:
            return manual_candidate_response

        # Determine which tools to make available.
        # Only authenticated employers/admins can create interview invitations.
        available_tools = list(RECRUITMENT_TOOLS)
        if not _can_search_candidates(request):
            available_tools = [
                t for t in available_tools
                if t.get("function", {}).get("name") != "search_candidates"
            ]
        if not _can_create_interview(request):
            available_tools = [
                t for t in available_tools
                if t.get("function", {}).get("name") != "create_interview_invitation"
            ]

        base_payload = {
            "model": model,
        }
        if available_tools:
            base_payload["tools"] = available_tools
            base_payload["tool_choice"] = "auto"
        if "temperature" in body:
            base_payload["temperature"] = body.get("temperature")
        if "max_tokens" in body:
            base_payload["max_tokens"] = body.get("max_tokens")

        max_tool_rounds = getattr(settings, "AI_CHAT_MAX_TOOL_ROUNDS", 4)
        try:
            max_tool_rounds = int(max_tool_rounds)
        except (TypeError, ValueError):
            max_tool_rounds = 4
        max_tool_rounds = max(1, min(max_tool_rounds, 8))

        def run_completion_rounds(payload_base: Dict[str, Any]):
            upstream_json = {}
            active_model = model
            active_source = None
            current_messages = list(messages)

            for _ in range(max_tool_rounds):
                payload = {
                    **payload_base,
                    "messages": current_messages,
                }
                upstream_json, candidate = post_chat_completion_requests(
                    payload,
                    default_model=model,
                    timeout=(10, 120),
                )
                active_model = candidate.model or model
                active_source = candidate.name
                choices = upstream_json.get("choices") or []
                message_obj = choices[0].get("message", {}) if choices else {}
                tool_calls = message_obj.get("tool_calls") or []

                # No tool call means assistant has final answer for this round.
                if not tool_calls:
                    break

                current_messages.append(message_obj)
                for tool_call in tool_calls:
                    result = execute_tool_call(tool_call, request)
                    current_messages.append(
                        {
                            "role": "tool",
                            "tool_call_id": tool_call.get("id"),
                            "name": tool_call.get("function", {}).get("name"),
                            "content": result,
                        }
                    )

            return upstream_json, active_model, active_source

        try:
            try:
                upstream_json, active_model, active_source = run_completion_rounds(base_payload)
            except AIServiceUnavailable as exc:
                if "tools" not in base_payload or not _is_tool_choice_rejection(exc):
                    raise

                logger.warning(
                    "LLM rejected chat tool payload; retrying without tools: %s",
                    "; ".join(exc.attempts),
                )
                toolless_payload = {
                    key: value
                    for key, value in base_payload.items()
                    if key not in {"tools", "tool_choice"}
                }
                upstream_json, active_model, active_source = run_completion_rounds(toolless_payload)

        except (requests.ConnectionError, requests.Timeout, AIServiceUnavailable):
            # LLM not reachable — return friendly fallback
            return Response(
                data_response(errors={}, data={"reply": _LLM_FALLBACK_REPLY, "model": model}),
                status=200,
            )
        except requests.RequestException:
            return Response(
                data_response(errors={}, data={"reply": _LLM_FALLBACK_REPLY, "model": model}),
                status=200,
            )

        reply = ""
        try:
            if isinstance(upstream_json, dict):
                choices = upstream_json.get("choices") or []
                if choices:
                    msg = choices[0].get("message") or {}
                    reply = msg.get("content") or choices[0].get("text") or ""
        except Exception:
            reply = _LLM_FALLBACK_REPLY

        if not reply:
            reply = _LLM_FALLBACK_REPLY

        return Response(
            data_response(
                errors={},
                data={
                    "reply": reply,
                    "model": active_model,
                    "source": active_source,
                    "usage": upstream_json.get("usage") if isinstance(upstream_json, dict) else None,
                },
            ),
            status=200,
        )


# Keep backward-compat function-based alias (urls.py references ai_views.chat)
chat = ChatAPIView.as_view()
