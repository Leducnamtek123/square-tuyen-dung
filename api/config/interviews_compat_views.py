import json

from django.http import HttpRequest, JsonResponse
from django.views.decorators.csrf import csrf_exempt

from apps.interviews.models import InterviewSession
from apps.interviews.services import (
    append_transcript,
    advance_question_cursor,
    build_interview_context,
    get_next_question_payload,
    update_interview_status,
)

def interview_context(request: HttpRequest, room_name: str):
    """
    GET /api/v1/interview/compat/{room_name}/context

    Compatibility endpoint for `squareai/apps/voice-ai/livekit_agent`.
    Returns *raw* JSON (no {errors,data} envelope).
    """
    if request.method != "GET":
        return JsonResponse({"detail": "Method not allowed."}, status=405)

    try:
        session = (
            InterviewSession.objects.select_related("candidate", "job_post")
            .prefetch_related("questions")
            .get(room_name=room_name)
        )
    except InterviewSession.DoesNotExist:
        return JsonResponse({"detail": "Interview session not found."}, status=404)

    return JsonResponse(build_interview_context(session), status=200)

@csrf_exempt
def interview_next_question(request: HttpRequest, room_name: str):
    """
    POST /api/v1/interview/compat/{room_name}/next-question
    Body: { "advance": true|false }

    Compatibility endpoint for `squareai/apps/voice-ai/livekit_agent`.
    Returns *raw* JSON (no {errors,data} envelope).
    """
    if request.method not in ("POST", "GET"):
        return JsonResponse({"detail": "Method not allowed."}, status=405)

    try:
        session = InterviewSession.objects.prefetch_related("questions").get(room_name=room_name)
    except InterviewSession.DoesNotExist:
        return JsonResponse({"detail": "Interview session not found."}, status=404)

    advance = True
    if request.method == "GET":
        advance = request.GET.get("advance", "1").lower() in ("1", "true", "yes")
    else:
        try:
            payload = json.loads(request.body.decode("utf-8") or "{}")
        except Exception:
            payload = {}
        advance = bool(payload.get("advance", True))

    payload = get_next_question_payload(session)
    if advance and not payload.get("done"):
        advance_question_cursor(session)
        payload["advance"] = True
    else:
        payload["advance"] = False
    return JsonResponse(payload, status=200)

@csrf_exempt
def interview_status(request: HttpRequest, room_name: str):
    """
    PATCH /api/v1/interview/compat/{room_name}/status
    Body: { "status": "in_progress"|"completed"|... }

    Compatibility endpoint for `squareai/apps/voice-ai/livekit_agent`.
    Returns *raw* JSON (no {errors,data} envelope).
    """
    if request.method not in ("PATCH", "POST"):
        return JsonResponse({"detail": "Method not allowed."}, status=405)

    try:
        session = InterviewSession.objects.get(room_name=room_name)
    except InterviewSession.DoesNotExist:
        return JsonResponse({"detail": "Interview session not found."}, status=404)

    try:
        payload = json.loads(request.body.decode("utf-8") or "{}")
    except Exception:
        payload = {}

    new_status = payload.get("status")
    if not new_status:
        return JsonResponse({"detail": "Missing `status`."}, status=400)

    updated_status = update_interview_status(session, new_status)
    return JsonResponse({"status": updated_status}, status=200)

@csrf_exempt
def interview_append_transcription(request: HttpRequest, room_name: str):
    """
    POST /api/v1/interview/compat/{room_name}/append-transcription
    Body: { "speaker_role": "ai_agent"|"candidate", "content": "...", "speech_duration_ms": 123 }

    Compatibility endpoint for `squareai/apps/voice-ai/livekit_agent`.
    Returns *raw* JSON (no {errors,data} envelope).
    """
    if request.method not in ("POST",):
        return JsonResponse({"detail": "Method not allowed."}, status=405)

    try:
        session = InterviewSession.objects.get(room_name=room_name)
    except InterviewSession.DoesNotExist:
        return JsonResponse({"detail": "Interview session not found."}, status=404)

    try:
        payload = json.loads(request.body.decode("utf-8") or "{}")
    except Exception:
        payload = {}

    speaker_role = payload.get("speaker_role")
    content = payload.get("content") or ""
    speech_duration_ms = payload.get("speech_duration_ms")

    if speaker_role not in ("ai_agent", "candidate"):
        return JsonResponse({"detail": "Invalid `speaker_role`."}, status=400)
    if not isinstance(content, str) or not content.strip():
        return JsonResponse({"detail": "Missing `content`."}, status=400)

    transcript = append_transcript(
        session,
        {
            "speaker_role": speaker_role,
            "content": content.strip(),
            "speech_duration_ms": speech_duration_ms if speech_duration_ms is not None else None,
        },
    )
    return JsonResponse(
        {
            "id": transcript.id,
            "speaker_role": transcript.speaker_role,
            "content": transcript.content,
            "speech_duration_ms": transcript.speech_duration_ms,
            "create_at": transcript.create_at.isoformat() if transcript.create_at else None,
        },
        status=201,
    )
