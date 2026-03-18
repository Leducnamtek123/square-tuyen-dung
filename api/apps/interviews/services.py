from __future__ import annotations

from typing import Dict, Iterable, Optional
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
    if not explicit:
        raise ValueError("LIVEKIT_PUBLIC_URL is required.")
    return explicit.rstrip("/")


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
    was_started = session.start_time is not None
    apply_status_transition(session, new_status)
    run_status_side_effects(
        session,
        new_status,
        was_started=was_started,
        max_duration_seconds=max_duration_seconds,
    )
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
