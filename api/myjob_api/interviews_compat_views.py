import json

from django.http import HttpRequest, JsonResponse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt

from interview.models import InterviewSession


def _get_session_questions(session: InterviewSession):
    questions = session.questions.all()
    if questions.exists():
        return questions
    if session.question_group_id:
        return session.question_group.questions.all()
    return questions


def interview_context(request: HttpRequest, room_name: str):
    """
    GET /api/interviews/{room_name}/context

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

    candidate = session.candidate
    job_post = session.job_post

    questions = _get_session_questions(session)
    context_data = {
        "candidateName": candidate.full_name,
        "candidateEmail": candidate.email,
        "jobTitle": job_post.job_name if job_post else None,
        "questions": [{"text": q.text} for q in questions],
        "interviewType": session.type,
    }
    return JsonResponse(context_data, status=200)


@csrf_exempt
def interview_next_question(request: HttpRequest, room_name: str):
    """
    POST /api/interviews/{room_name}/next-question
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

    questions = _get_session_questions(session).order_by("sort_order", "create_at", "id")
    total = questions.count()
    cursor = session.question_cursor or 0

    if cursor >= total:
        return JsonResponse(
            {
                "done": True,
                "question": None,
                "index": cursor,
                "total": total,
                "advance": advance,
            },
            status=200,
        )

    question = questions[cursor]

    if advance:
        session.question_cursor = cursor + 1
        session.save(update_fields=["question_cursor", "update_at"])

    return JsonResponse(
        {
            "done": False,
            "question": {
                "id": question.id,
                "text": question.text,
            },
            "index": cursor,
            "total": total,
            "advance": advance,
        },
        status=200,
    )


@csrf_exempt
def interview_status(request: HttpRequest, room_name: str):
    """
    PATCH /api/interviews/{room_name}/status
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

    session.status = new_status

    if new_status == "in_progress" and not session.start_time:
        session.start_time = timezone.now()
    elif new_status == "completed" and not session.end_time:
        session.end_time = timezone.now()
        if session.start_time:
            session.duration = int((session.end_time - session.start_time).total_seconds())

    session.save(update_fields=["status", "start_time", "end_time", "duration", "update_at"])
    return JsonResponse({"status": new_status}, status=200)

