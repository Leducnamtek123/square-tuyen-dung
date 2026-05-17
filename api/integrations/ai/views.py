import json
import logging
import time
from typing import Optional, List, Dict, Any
from urllib.parse import urlsplit, urlunsplit

import requests
from django.conf import settings
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

from apps.accounts.permissions import IsAdminUser
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
    from apps.jobs.models import JobPost
    from apps.profiles.models import Resume, JobSeekerProfile, Company
    from apps.interviews.models import InterviewSession
    from apps.interviews.tasks import send_interview_invitation
except ImportError:
    JobPost = None
    Resume = None
    JobSeekerProfile = None
    Company = None
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
    permission_classes = [AllowAny]

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
        normalized_action = self.ACTIONS.get(action.lower())
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


def _can_search_candidates(request: DRFRequest) -> bool:
    return (
        request.user.is_authenticated
        and getattr(request.user, 'role_name', None) in ('employer', 'admin')
    )


def _can_create_interview(request: DRFRequest) -> bool:
    return (
        request.user.is_authenticated
        and getattr(request.user, 'role_name', None) in ('employer', 'admin')
    )

def execute_tool_call(tool_call, request):
    """Thực thi một tool call và trả về kết quả."""
    name = tool_call.get("function", {}).get("name")
    args = json.loads(tool_call.get("function", {}).get("arguments", "{}"))
    
    if name == "search_candidates":
        if not _can_search_candidates(request):
            return "Lỗi: Bạn không có quyền tìm kiếm ứng viên."
        query = args.get("query")
        limit = args.get("limit", 5)
        
        if not Resume:
            return "Lỗi: Không thể truy cập dữ liệu ứng viên."
            
        resumes = Resume.objects.filter(
            Q(title__icontains=query) | 
            Q(skills_summary__icontains=query) |
            Q(description__icontains=query)
        ).select_related('user').distinct()[:limit]
        
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
            job_post = JobPost.objects.get(id=job_post_id)
            
            session = InterviewSession.objects.create(
                candidate_id=candidate_id,
                job_post=job_post,
                created_by=request.user if request.user.is_authenticated else job_post.user,
                scheduled_at=scheduled_at,
                status='scheduled'
            )
            
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

        model = body.get("model") or getattr(settings, "AI_LLM_MODEL", "gemma4:e4b")

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
        try:
            upstream_json = {}
            active_model = model
            active_source = None
            current_messages = list(messages)

            for _ in range(max_tool_rounds):
                payload = {
                    **base_payload,
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
