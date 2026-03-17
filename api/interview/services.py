from __future__ import annotations

from typing import Dict, Iterable, Optional
from urllib.parse import urlparse

from django.conf import settings
from django.utils import timezone

from .livekit_service import LiveKitService
from .models import InterviewSession, InterviewTranscript, Question


def get_session_questions(session: InterviewSession) -> Iterable[Question]:
    questions = session.questions.all()
    if questions.exists():
        return questions
    if session.question_group_id:
        return session.question_group.questions.all()
    return questions


def build_interview_context(session: InterviewSession) -> Dict[str, object]:
    questions = get_session_questions(session)
    return {
        "candidateName": session.candidate.full_name,
        "candidateEmail": session.candidate.email,
        "jobTitle": session.job_post.job_name if session.job_post else None,
        "questions": [{"text": q.text} for q in questions],
        "interviewType": session.type,
    }


def _build_public_livekit_url(request) -> str:
    explicit = getattr(settings, "LIVEKIT_PUBLIC_URL", "") or ""
    if explicit:
        return explicit.rstrip("/")

    forwarded_proto = (request.META.get("HTTP_X_FORWARDED_PROTO") or request.scheme or "http").split(",")[0].strip()
    scheme = "wss" if forwarded_proto == "https" else "ws"
    host = request.get_host()
    return f"{scheme}://{host}/livekit"


def create_livekit_participant_token(session: InterviewSession, request) -> Dict[str, str]:
    # Security: Chỉ cấp token nếu status là 'scheduled', 'calibration' hoặc 'in_progress'
    allowed_statuses = ("scheduled", "calibration", "in_progress")
    if session.status not in allowed_statuses:
        raise ValueError(f"Không thể tham gia buổi phỏng vấn này vì trạng thái hiện tại là: {session.get_status_display()}")

    participant_identity = f"candidate-{session.candidate_id}"
    participant_name = session.candidate.full_name or session.candidate.email or participant_identity
    LiveKitService.ensure_room_with_agent(session.room_name)
    token = LiveKitService.create_token(
        room_name=session.room_name,
        participant_identity=participant_identity,
        participant_name=participant_name,
        is_agent=False,
    )
    server_url = _build_public_livekit_url(request)
    return {
        "token": token,
        "room_name": session.room_name,
        "participant_identity": participant_identity,
        "server_url": server_url,
    }


def update_interview_status(
    session: InterviewSession,
    new_status: str,
    *,
    max_duration_seconds: Optional[int] = None,
) -> str:
    session.status = new_status
    was_started = session.start_time is not None

    if new_status == "in_progress" and not session.start_time:
        session.start_time = timezone.now()
    elif new_status == "completed" and not session.end_time:
        session.end_time = timezone.now()
        if session.start_time:
            session.duration = int((session.end_time - session.start_time).total_seconds())

    session.save()

    if new_status == "completed":
        from .tasks import evaluate_interview_session

        evaluate_interview_session.delay(session.id)

    if new_status == "in_progress" and not was_started:
        from .tasks import end_interview_session

        timeout = int(max_duration_seconds or getattr(settings, "INTERVIEW_MAX_DURATION_SECONDS", 1800))
        end_interview_session.apply_async(args=[session.id, "max_duration"], countdown=timeout)

    return new_status


def append_transcript(session: InterviewSession, payload: Dict[str, object]) -> InterviewTranscript:
    transcript = InterviewTranscript.objects.create(
        interview=session,
        **payload,
    )
    return transcript


def get_next_question_payload(session: InterviewSession, advance: bool) -> Dict[str, object]:
    questions = get_session_questions(session).order_by("sort_order", "create_at", "id")
    total = questions.count()
    cursor = session.question_cursor or 0

    if cursor >= total:
        return {
            "done": True,
            "question": None,
            "index": cursor,
            "total": total,
            "advance": advance,
        }

    question = questions[cursor]

    if advance:
        session.question_cursor = cursor + 1
        session.save(update_fields=["question_cursor", "update_at"])

    return {
        "done": False,
        "question": {"id": question.id, "text": question.text},
        "index": cursor,
        "total": total,
        "advance": advance,
    }
