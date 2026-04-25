from __future__ import annotations

import json
import logging
import re
from typing import Dict, Iterable, Optional

from django.conf import settings
from django.utils import timezone
from django.utils.html import strip_tags

from .livekit_service import LiveKitService
from .models import InterviewSession, InterviewTranscript, Question

logger = logging.getLogger(__name__)


class SessionNotJoinableError(ValueError):
    """Exception raised when an interview session is not in a joinable state."""


def get_session_questions(session: InterviewSession) -> Iterable[Question]:
    questions = session.questions.all()
    if questions.exists():
        return questions
    if session.question_group_id:
        return session.question_group.questions.all()
    if session.job_post_id and getattr(session.job_post, "interview_template_id", None):
        return session.job_post.interview_template.questions.all()
    return questions


def _clean_text(value: str | None) -> str:
    if not value:
        return ""
    return " ".join(strip_tags(value).split())


def _truncate_text(value: str, limit: int) -> str:
    if len(value) <= limit:
        return value
    return value[: max(0, limit - 1)].rstrip() + "..."


def _sanitize_transcript_text(value: str | None) -> str:
    if not value:
        return ""

    text = strip_tags(value)
    text = re.sub(r"<function=[^>]+>[\s\S]*?</function>", " ", text, flags=re.IGNORECASE)
    text = re.sub(r"</?function[^>]*>", " ", text, flags=re.IGNORECASE)
    text = re.sub(r"\{\s*\"stage_name\"\s*:\s*\"[^\"]+\"\s*\}", " ", text, flags=re.IGNORECASE)
    text = re.sub(r"```[\s\S]*?```", " ", text)
    return " ".join(text.split())


def _build_interview_subject(
    session: InterviewSession,
    job_description: str,
    question_group_description: str,
) -> str:
    parts: list[str] = []

    if session.job_post and session.job_post.job_name:
        parts.append(session.job_post.job_name)
    if session.question_group and session.question_group.name:
        parts.append(session.question_group.name)
    if session.job_post and getattr(session.job_post, "interview_template_id", None):
        template_name = getattr(session.job_post.interview_template, "name", "")
        if template_name:
            parts.append(template_name)

    if parts:
        return " - ".join(parts)

    fallback = job_description or question_group_description
    return fallback[:120] if fallback else "Phong van tuyen dung"


def build_interview_context(session: InterviewSession) -> Dict[str, object]:
    questions = list(get_session_questions(session).order_by("sort_order", "create_at", "id"))
    template = getattr(getattr(session, "job_post", None), "interview_template", None)
    question_group = session.question_group or template
    job_description = _truncate_text(_clean_text(getattr(session.job_post, "job_description", "")), 1200)
    job_requirement = _truncate_text(_clean_text(getattr(session.job_post, "job_requirement", "")), 900)
    question_group_description = _truncate_text(_clean_text(getattr(question_group, "description", "")), 900)
    notes = _truncate_text(_clean_text(session.notes), 500)

    return {
        "candidateName": session.candidate.full_name,
        "candidateEmail": session.candidate.email,
        "jobTitle": session.job_post.job_name if session.job_post else None,
        "jobDescription": job_description or None,
        "jobRequirement": job_requirement or None,
        "questionGroupName": question_group.name if question_group else None,
        "questionGroupDescription": question_group_description or None,
        "interviewNotes": notes or None,
        "interviewSubject": _build_interview_subject(
            session,
            job_description,
            question_group_description,
        ),
        "questionCount": len(questions),
        "questions": [
            {
                "text": q.text,
                "category": q.category,
                "difficulty": q.difficulty,
            }
            for q in questions
        ],
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
    # Security: only allow when the session is joinable.
    allowed_statuses = ("scheduled", "calibration", "in_progress", "interrupted")
    if session.status not in allowed_statuses:
        raise SessionNotJoinableError(
            f"Khong the tham gia buoi phong van nay vi trang thai hien tai la: {session.get_status_display()}"
        )

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
    broadcast_interview_event(
        session.id,
        "status_changed",
        {
            "sessionId": session.id,
            "oldStatus": old_status,
            "newStatus": new_status,
            "startTime": session.start_time.isoformat() if session.start_time else None,
            "endTime": session.end_time.isoformat() if session.end_time else None,
            "duration": session.duration,
        },
    )
    return new_status


def apply_status_transition(session: InterviewSession, new_status: str) -> None:
    if session.status == "draft" and new_status == "in_progress":
        # Keep compatibility with existing flows/tests that start directly.
        session.status = "scheduled"
        session.save(update_fields=["status", "update_at"])

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
        # Start recording as soon as the interview becomes active.
        import threading

        threading.Thread(target=LiveKitService.start_recording, args=(session.room_name,)).start()

    if new_status == "interrupted":
        from .tasks import finalize_disconnected_session

        grace_seconds = int(getattr(settings, "INTERVIEW_DISCONNECT_GRACE_SECONDS", 300))
        finalize_disconnected_session.apply_async(args=[session.id], countdown=grace_seconds)


def append_transcript(session: InterviewSession, payload: Dict[str, object]) -> InterviewTranscript:
    content = _sanitize_transcript_text(payload.get("content") if isinstance(payload, dict) else None)
    transcript = InterviewTranscript.objects.create(
        interview=session,
        speaker_role=str(payload.get("speaker_role", "")),
        content=content,
        speech_duration_ms=payload.get("speech_duration_ms"),
    )
    # Broadcast new transcript to SSE subscribers
    broadcast_interview_event(
        session.id,
        "transcript_added",
        {
            "sessionId": session.id,
            "transcript": {
                "id": transcript.id,
                "speakerRole": transcript.speaker_role,
                "content": transcript.content,
                "speechDurationMs": transcript.speech_duration_ms,
                "createAt": transcript.create_at.isoformat() if transcript.create_at else None,
            },
        },
    )
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

    old_status = session.status
    session.status = "processing"
    session.save(update_fields=["status", "update_at"])

    broadcast_interview_event(
        session.id,
        "status_changed",
        {
            "sessionId": session.id,
            "oldStatus": old_status,
            "newStatus": "processing",
            "startTime": session.start_time.isoformat() if session.start_time else None,
            "endTime": session.end_time.isoformat() if session.end_time else None,
            "duration": session.duration,
        },
    )

    evaluate_interview_session.delay(session.id)


def create_observer_livekit_token(session: InterviewSession, request) -> Dict[str, str]:
    """Create a hidden LiveKit token for employer to observe interview silently."""
    allowed_statuses = ("scheduled", "calibration", "in_progress")
    if session.status not in allowed_statuses:
        raise SessionNotJoinableError(
            f"Khong the quan sat buoi phong van nay vi trang thai hien tai la: {session.get_status_display()}"
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
