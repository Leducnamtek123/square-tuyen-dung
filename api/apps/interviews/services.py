from __future__ import annotations

import json
import logging
from typing import Dict, Iterable, Optional
from django.conf import settings
from django.utils import timezone

from .livekit_service import LiveKitService
from .models import InterviewSession, InterviewTranscript, Question

logger = logging.getLogger(__name__)


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

    # Fallback: construct from request host (standard Nginx proxy /livekit -> LiveKit)
    host = request.get_host()
    scheme = "https" if request.is_secure() else "http"
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


def broadcast_interview_event(session_id: int, event_type: str, data: dict) -> None:
    """Publish an event to Redis Pub/Sub for SSE streaming to employer."""
    try:
        import redis as _redis
        r = _redis.Redis(
            host=settings.SERVICE_REDIS_HOST,
            port=settings.SERVICE_REDIS_PORT,
            password=settings.SERVICE_REDIS_PASSWORD or None,
            db=settings.SERVICE_REDIS_DB,
            decode_responses=True,
            socket_connect_timeout=3,
        )
        channel = f"interview:{session_id}:events"
        payload = {"_event_type": event_type, **data}
        r.publish(channel, json.dumps(payload, ensure_ascii=False, default=str))
        r.close()
    except Exception as exc:
        logger.warning("broadcast_interview_event failed: %s", exc)


def update_interview_status(
    session: InterviewSession,
    new_status: str,
    *,
    max_duration_seconds: Optional[int] = None,
) -> str:
    old_status = session.status
    was_started = session.start_time is not None
    apply_status_transition(session, new_status)
    run_status_side_effects(
        session,
        new_status,
        was_started=was_started,
        max_duration_seconds=max_duration_seconds,
    )
    # Broadcast status change to SSE subscribers
    broadcast_interview_event(session.id, "status_changed", {
        "sessionId": session.id,
        "oldStatus": old_status,
        "newStatus": new_status,
        "startTime": session.start_time.isoformat() if session.start_time else None,
        "endTime": session.end_time.isoformat() if session.end_time else None,
        "duration": session.duration,
    })
    return new_status


def apply_status_transition(session: InterviewSession, new_status: str) -> None:
    session.status = new_status

    if new_status == "in_progress" and not session.start_time:
        session.start_time = timezone.now()
    elif new_status == "completed" and not session.end_time:
        session.end_time = timezone.now()
        if session.start_time:
            session.duration = int((session.end_time - session.start_time).total_seconds())

    session.save()

def run_status_side_effects(
    session: InterviewSession,
    new_status: str,
    *,
    was_started: bool,
    max_duration_seconds: Optional[int] = None,
) -> None:
    if new_status == "completed":
        queue_ai_evaluation(session)

    if new_status == "in_progress" and not was_started:
        from .tasks import end_interview_session

        timeout = int(max_duration_seconds or getattr(settings, "INTERVIEW_MAX_DURATION_SECONDS", 1800))
        end_interview_session.apply_async(args=[session.id, "max_duration"], countdown=timeout)


def append_transcript(session: InterviewSession, payload: Dict[str, object]) -> InterviewTranscript:
    transcript = InterviewTranscript.objects.create(
        interview=session,
        **payload,
    )
    # Broadcast new transcript to SSE subscribers
    broadcast_interview_event(session.id, "transcript_added", {
        "sessionId": session.id,
        "transcript": {
            "id": transcript.id,
            "speakerRole": transcript.speaker_role,
            "content": transcript.content,
            "speechDurationMs": transcript.speech_duration_ms,
            "createAt": transcript.create_at.isoformat() if transcript.create_at else None,
        },
    })
    return transcript


def get_next_question_payload(session: InterviewSession, cursor: Optional[int] = None) -> Dict[str, object]:
    questions = get_session_questions(session).order_by("sort_order", "create_at", "id")
    total = questions.count()
    current_cursor = session.question_cursor if cursor is None else cursor
    current_cursor = current_cursor or 0

    if current_cursor >= total:
        return {
            "done": True,
            "question": None,
            "index": current_cursor,
            "total": total,
        }

    question = questions[current_cursor]

    return {
        "done": False,
        "question": {"id": question.id, "text": question.text},
        "index": current_cursor,
        "total": total,
    }


def advance_question_cursor(session: InterviewSession) -> int:
    session.question_cursor = (session.question_cursor or 0) + 1
    session.save(update_fields=["question_cursor", "update_at"])
    return session.question_cursor


def queue_invitation_email(session_id: int) -> None:
    from .tasks import send_interview_invitation

    send_interview_invitation.delay(session_id)


def queue_ai_evaluation(session: InterviewSession) -> None:
    from .tasks import evaluate_interview_session

    session.status = "processing"
    session.save(update_fields=["status", "update_at"])
    evaluate_interview_session.delay(session.id)


def create_observer_livekit_token(session: InterviewSession, request) -> Dict[str, str]:
    """Create a hidden LiveKit token for employer to observe interview silently."""
    allowed_statuses = ("scheduled", "calibration", "in_progress")
    if session.status not in allowed_statuses:
        raise ValueError(
            f"Không thể quan sát buổi phỏng vấn này vì trạng thái hiện tại là: {session.get_status_display()}"
        )

    user = request.user
    observer_identity = f"observer-{user.id}"
    observer_name = f"[Observer] {user.full_name or user.email}"

    token = LiveKitService.create_observer_token(
        room_name=session.room_name,
        observer_identity=observer_identity,
        observer_name=observer_name,
    )

    server_url = _build_public_livekit_url(request)

    return {
        "token": token,
        "room_name": session.room_name,
        "participant_identity": observer_identity,
        "server_url": server_url,
        "mode": "observer",
    }
