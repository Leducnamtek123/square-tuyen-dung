import json
from typing import Optional

import requests
from django.conf import settings
from django.http import (
    HttpRequest,
    HttpResponse,
    JsonResponse,
    StreamingHttpResponse,
)
from django.views.decorators.csrf import csrf_exempt

from configs.variable_response import data_response


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
