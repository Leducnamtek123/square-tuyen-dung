import json
from typing import Optional, List, Dict, Any

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

from shared.configs.variable_response import data_response

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
def tts(request: HttpRequest):
    """
    POST /api/ai/tts/
    Body: { "text": "...", "voice"?: "...", "format"?: "mp3"|"wav"|"pcm", "speed"?: number }

    Proxies to an OpenAI-compatible TTS server (default: VieNeu-TTS).
    Returns audio bytes (streaming) with upstream content-type.
    """
    if request.method != "POST":
        return JsonResponse({"detail": "Method not allowed."}, status=405)

    body = _get_json_body(request)
    text = (body.get("text") or "").strip()
    if not text:
        return JsonResponse({"detail": "Missing `text`."}, status=400)

    voice = body.get("voice") or getattr(settings, "AI_TTS_DEFAULT_VOICE", None)
    response_format = body.get("format") or body.get("response_format") or "mp3"
    speed = body.get("speed") or 1.0

    base_url = getattr(settings, "AI_TTS_BASE_URL", "http://localhost:8298/v1").rstrip("/")
    url = f"{base_url}/audio/speech"

    payload = {
        "input": text,
        "model": body.get("model") or "tts-1",
        "voice": voice or "Ly (nữ miền Bắc)",
        "response_format": response_format,
        "speed": speed,
    }

    try:
        upstream = requests.post(url, json=payload, stream=True, timeout=(10, 300))
    except requests.RequestException as e:
        return JsonResponse({"detail": f"TTS upstream unavailable: {str(e)}"}, status=502)

    if upstream.status_code >= 400:
        # Try to surface upstream error body (may be JSON).
        try:
            err = upstream.json()
        except Exception:
            err = {"detail": upstream.text[:500]}
        return JsonResponse({"detail": "TTS upstream error.", "upstream": err}, status=502)

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

@csrf_exempt
def transcribe(request: HttpRequest):
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

    base_url = getattr(settings, "AI_STT_BASE_URL", "http://localhost:11437/v1").rstrip("/")
    url = f"{base_url}/audio/transcriptions"
    model = request.POST.get("model") or getattr(settings, "AI_STT_MODEL", "openai/whisper-large-v3")
    language = request.POST.get("language") or getattr(settings, "AI_STT_LANGUAGE", "vi")

    files = {
        "file": (audio_file.name or "audio.webm", audio_file.read(), audio_file.content_type or "application/octet-stream")
    }
    data = {
        "model": model,
        "language": language,
    }

    try:
        upstream = requests.post(url, data=data, files=files, timeout=(10, 300))
    except requests.RequestException as e:
        return JsonResponse(data_response(errors={"detail": f"STT upstream unavailable: {str(e)}"}, data=None), status=502)

    if upstream.status_code >= 400:
        try:
            err = upstream.json()
        except Exception:
            err = {"detail": upstream.text[:500]}
        return JsonResponse(data_response(errors={"detail": "STT upstream error.", "upstream": err}, data=None), status=502)

    try:
        upstream_json = upstream.json()
    except Exception:
        upstream_json = {}

    # OpenAI-compatible STT typically returns { text: "..." }.
    transcription = upstream_json.get("text") or upstream_json.get("transcription") or ""
    return JsonResponse(data_response(errors={}, data={"transcription": transcription}), status=200)

# TOOLS DEFINITIONS

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

def execute_tool_call(tool_call, request):
    """Thực thi một tool call và trả về kết quả."""
    name = tool_call.get("function", {}).get("name")
    args = json.loads(tool_call.get("function", {}).get("arguments", "{}"))
    
    if name == "search_candidates":
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

@csrf_exempt
def chat(request: HttpRequest):
    """
    POST /api/ai/chat/
    Body:
      - { "messages": [{role, content}, ...], "model"?: "...", "temperature"?: number, "max_tokens"?: number }
      - or { "message": "...", "system"?: "..." }

    Proxies to an OpenAI-compatible chat completions server, with support for function calling.
    """
    if request.method != "POST":
        return JsonResponse({"detail": "Method not allowed."}, status=405)

    body = _get_json_body(request)
    messages = body.get("messages")

    if not isinstance(messages, list) or not messages:
        message = (body.get("message") or "").strip()
        if not message:
            return JsonResponse({"detail": "Missing `message` or `messages`."}, status=400)
        system_prompt = (body.get("system") or "").strip()
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": message})

    base_url = getattr(settings, "AI_LLM_BASE_URL", "http://llama-cpp:11434/v1").rstrip("/")
    model = body.get("model") or getattr(settings, "AI_LLM_MODEL", "qwen2-7b")
    url = f"{base_url}/chat/completions"

    payload = {
        "model": model,
        "messages": messages,
        "tools": RECRUITMENT_TOOLS,
        "tool_choice": "auto"
    }
    if "temperature" in body:
        payload["temperature"] = body.get("temperature")
    if "max_tokens" in body:
        payload["max_tokens"] = body.get("max_tokens")

    try:
        # 1. First call to LLM
        upstream = requests.post(url, json=payload, timeout=(10, 300))
        if upstream.status_code >= 400:
            return JsonResponse({"detail": f"LLM error: {upstream.text}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR if hasattr(status, 'HTTP_500_INTERNAL_SERVER_ERROR') else 500)
            
        upstream_json = upstream.json()
        message = upstream_json.get("choices", [{}])[0].get("message", {})
        
        # 2. Check for tool calls
        tool_calls = message.get("tool_calls")
        if tool_calls:
            # Append assistant message with tool calls to history
            messages.append(message)
            
            # Execute tools and append results to history
            for tool_call in tool_calls:
                result = execute_tool_call(tool_call, request)
                messages.append({
                    "role": "tool",
                    "tool_call_id": tool_call.get("id"),
                    "name": tool_call.get("function", {}).get("name"),
                    "content": result
                })
                
            # 3. Second call to LLM with tool results
            final_payload = {
                "model": model,
                "messages": messages
            }
            final_upstream = requests.post(url, json=final_payload, timeout=(10, 300))
            if final_upstream.status_code == 200:
                upstream_json = final_upstream.json()
    except requests.RequestException as e:
        return JsonResponse({"detail": f"LLM upstream unavailable: {str(e)}"}, status=502)

    if upstream.status_code >= 400:
        try:
            err = upstream.json()
        except Exception:
            err = {"detail": upstream.text[:500]}
        return JsonResponse({"detail": "LLM upstream error.", "upstream": err}, status=502)

    try:
        upstream_json = upstream.json()
    except Exception:
        upstream_json = {}

    reply = ""
    try:
        if isinstance(upstream_json, dict):
            choices = upstream_json.get("choices") or []
            if choices:
                message = choices[0].get("message") or {}
                reply = message.get("content") or choices[0].get("text") or ""
    except Exception:
        reply = ""

    return JsonResponse(
        data_response(
            errors={},
            data={
                "reply": reply,
                "model": model,
                "usage": upstream_json.get("usage") if isinstance(upstream_json, dict) else None,
            },
        ),
        status=200,
    )
