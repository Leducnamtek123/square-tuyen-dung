import json
import logging

import httpx
from celery import chain, shared_task
from decouple import config
from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils import timezone as tz
from django.utils.html import strip_tags
from pydantic import BaseModel, Field, ValidationError

from integrations.ai.client import post_chat_completion_httpx
from .livekit_service import LiveKitService
from .models import InterviewSession
from .services import broadcast_interview_event

logger = logging.getLogger(__name__)


class QuestionPerformanceItem(BaseModel):
    question: str
    feedback: str
    score: int = Field(ge=1, le=10)


class SoftSkillsFeedback(BaseModel):
    confidence: int = Field(ge=1, le=10)
    clarity: int = Field(ge=1, le=10)
    tone: str


class DetailedFeedback(BaseModel):
    question_performance: list[QuestionPerformanceItem] = Field(default_factory=list)
    soft_skills: SoftSkillsFeedback
    cultural_fit: str


class InterviewEvaluationSchema(BaseModel):
    overall_score: float = Field(ge=1, le=10)
    technical_score: float = Field(ge=1, le=10)
    communication_score: float = Field(ge=1, le=10)
    summary: str
    strengths: list[str] = Field(default_factory=list)
    weaknesses: list[str] = Field(default_factory=list)
    detailed_feedback: DetailedFeedback


def _extract_json_object(raw_content: str) -> str:
    content = (raw_content or "").strip()
    if not content:
        raise ValueError("Empty AI response.")

    if content.startswith("```"):
        lines = content.splitlines()
        if lines and lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].strip().startswith("```"):
            lines = lines[:-1]
        content = "\n".join(lines).strip()

    start = content.find("{")
    end = content.rfind("}")
    if start == -1 or end == -1 or end < start:
        raise ValueError("No JSON object found in AI response.")

    return content[start : end + 1]


def _mark_evaluation_unavailable(session: InterviewSession, reason: str):
    old_status = session.status
    session.status = "completed"
    session.ai_summary = reason
    session.save(update_fields=["status", "ai_summary", "update_at"])

    if old_status == "processing":
        broadcast_interview_event(session.id, "status_changed", {
            "sessionId": session.id,
            "oldStatus": "processing",
            "newStatus": "completed",
            "startTime": session.start_time.isoformat() if session.start_time else None,
            "endTime": session.end_time.isoformat() if session.end_time else None,
            "duration": session.duration,
        })


@shared_task
def end_interview_session(session_id, reason="max_duration"):
    """Force-end an interview session and delete the LiveKit room."""
    session = None
    try:
        session = InterviewSession.objects.get(id=session_id)

        if session.status in ("completed", "cancelled"):
            return

        now = tz.now()
        if not session.start_time:
            session.start_time = now
        session.end_time = now
        session.duration = int((session.end_time - session.start_time).total_seconds())
        session.status = "completed"
        session.save()

        # Update Candidate Pipeline to INTERVIEWED if applicable
        try:
            from apps.jobs.models import JobPostActivity
            from apps.jobs.services import JobActivityService
            from shared.configs.variable_system import ApplicationStatus
            activity = JobPostActivity.objects.filter(
                user=session.candidate, 
                job_post=session.job_post, 
                is_deleted=False
            ).first()
            if activity and activity.status not in (ApplicationStatus.HIRED, ApplicationStatus.NOT_SELECTED):
                JobActivityService.advance_application_to_interviewed(activity)
        except Exception as err:
            logger.error("Could not update JobPostActivity pipeline for session %s: %s", session_id, err)

        logger.info("Interview session %s ended by task (%s).", session_id, reason)

        chain(
            evaluate_interview_session.s(session.id),
            send_evaluation_report.s(),
        ).delay()

    except InterviewSession.DoesNotExist:
        logger.warning("Interview session %s not found when ending.", session_id)
        return
    except Exception as e:
        logger.error("Error ending interview session %s: %s", session_id, e)
        return
    finally:
        try:
            if session is not None and session.room_name:
                LiveKitService.delete_room(session.room_name)
        except Exception as e:
            logger.warning("Failed to delete LiveKit room for session %s: %s", session_id, e)


@shared_task
def finalize_disconnected_session(session_id):
    """Cancel a session if the room has stayed disconnected past the grace period."""
    try:
        session = InterviewSession.objects.get(id=session_id)
    except InterviewSession.DoesNotExist:
        logger.warning("Interview session %s not found when finalizing disconnect.", session_id)
        return

    if session.status != "interrupted":
        logger.info(
            "Skip finalizing disconnect for session %s because status is %s.",
            session_id,
            session.status,
        )
        return

    try:
        if LiveKitService.has_active_participants(session.room_name):
            update_status = "in_progress"
            session.status = update_status
            session.save(update_fields=["status", "update_at"])
            broadcast_interview_event(session.id, "status_changed", {
                "sessionId": session.id,
                "oldStatus": "interrupted",
                "newStatus": update_status,
                "startTime": session.start_time.isoformat() if session.start_time else None,
                "endTime": session.end_time.isoformat() if session.end_time else None,
                "duration": session.duration,
            })
            logger.info("Session %s resumed before grace timeout.", session_id)
            return
    except Exception as exc:
        logger.warning("Could not verify LiveKit participants for session %s: %s", session_id, exc)
        return

    try:
        session.status = "cancelled"
        if session.start_time and not session.end_time:
            session.end_time = tz.now()
            session.duration = int((session.end_time - session.start_time).total_seconds())
        session.save()
        broadcast_interview_event(session.id, "status_changed", {
            "sessionId": session.id,
            "oldStatus": "interrupted",
            "newStatus": "cancelled",
            "startTime": session.start_time.isoformat() if session.start_time else None,
            "endTime": session.end_time.isoformat() if session.end_time else None,
            "duration": session.duration,
        })
        logger.info("Session %s cancelled after disconnect grace elapsed.", session_id)
    except Exception as exc:
        logger.error("Failed to finalize disconnected session %s: %s", session_id, exc)


@shared_task
def send_interview_invitation(session_id):
    """Send interview invitation email to candidate."""
    try:
        session = InterviewSession.objects.select_related("candidate", "job_post").get(id=session_id)
        candidate = session.candidate

        web_url = config("WEB_CLIENT_URL", default="http://localhost:3002")
        interview_url = f"{web_url}/phong-van/{session.invite_token}"
        scheduled_at_display = "ChÃÂ°a cÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t"
        if session.scheduled_at:
            scheduled_at_display = tz.localtime(session.scheduled_at).strftime("%H:%M - %d/%m/%Y")

        context = {
            "candidate_name": candidate.full_name,
            "job_title": session.job_post.job_name if session.job_post else "VÃ¡Â»â¹ trÃÂ­ tuyÃ¡Â»Æn dÃ¡Â»Â¥ng",
            "interview_url": interview_url,
            "invite_token": session.invite_token,
            "scheduled_at_display": scheduled_at_display,
        }

        html_message = render_to_string("interview/emails/invitation.html", context)
        plain_message = strip_tags(html_message)

        send_mail(
            subject=f"[TuyenDungSquare] MÃ¡Â»Âi PhÃ¡Â»Âng vÃ¡ÂºÂ¥n trÃ¡Â»Â±c tuyÃ¡ÂºÂ¿n - {context['job_title']}",
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[candidate.email],
            html_message=html_message,
            fail_silently=False,
        )
        logger.info("Invitation email sent to %s for session %s", candidate.email, session_id)
    except Exception as e:
        logger.error("Error sending invitation email for session %s: %s", session_id, e)

@shared_task
def send_evaluation_report(session_id):
    """Send AI interview evaluation report to employer."""
    if not session_id:
        return

    try:
        session = InterviewSession.objects.select_related("candidate", "job_post", "created_by").get(id=session_id)
        employer = session.created_by
        if not employer or not employer.email:
            logger.warning("Skip report email for session %s because employer email is missing.", session_id)
            return

        web_url = config("WEB_CLIENT_URL", default="http://localhost:3002")
        report_url = f"{web_url}/employer/interviews/{session.id}"

        context = {
            "candidate_name": session.candidate.full_name,
            "job_title": session.job_post.job_name if session.job_post else "VÃ¡Â»â¹ trÃÂ­ tuyÃ¡Â»Æn dÃ¡Â»Â¥ng",
            "overall_score": session.ai_overall_score,
            "summary": session.ai_summary,
            "report_url": report_url,
        }

        html_message = render_to_string("interview/emails/report.html", context)
        plain_message = strip_tags(html_message)

        send_mail(
            subject=f"[TuyenDungSquare] ÃÂÃÂ£ cÃÂ³ kÃ¡ÂºÂ¿t quÃ¡ÂºÂ£ PhÃ¡Â»Âng vÃ¡ÂºÂ¥n trÃ¡Â»Â±c tuyÃ¡ÂºÂ¿n - {session.candidate.full_name}",
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[employer.email],
            html_message=html_message,
            fail_silently=False,
        )
        logger.info("Evaluation report sent to %s for session %s", employer.email, session_id)
    except Exception as e:
        logger.error("Error sending report email for session %s: %s", session_id, e)


@shared_task(bind=True, autoretry_for=(httpx.TimeoutException, httpx.ConnectError),
             retry_backoff=True, retry_kwargs={'max_retries': 3})
def evaluate_interview_session(self, session_id):
    """Call LLM to evaluate interview transcript and persist validated structured output."""
    try:
        session = InterviewSession.objects.prefetch_related("transcripts").get(id=session_id)
        transcripts = session.transcripts.all().order_by("create_at")

        if not transcripts:
            logger.warning("Session %s has no transcripts to evaluate.", session_id)
            _mark_evaluation_unavailable(
                session,
                "AI evaluation could not run because this interview has no transcript.",
            )
            return None

        history_text = ""
        for transcript in transcripts:
            role = "NgÃÂ°Ã¡Â»Âi phÃ¡Â»Âng vÃ¡ÂºÂ¥n" if transcript.speaker_role == "ai_agent" else "Ã¡Â»Â¨ng viÃÂªn"
            history_text += f"{role}: {transcript.content}\n"

        prompt = f"""
BÃ¡ÂºÂ¡n lÃÂ  mÃ¡Â»â¢t chuyÃÂªn gia tuyÃ¡Â»Æn dÃ¡Â»Â¥ng chuyÃÂªn nghiÃ¡Â»â¡p. HÃÂ£y phÃÂ¢n tÃÂ­ch nÃ¡Â»â¢i dung buÃ¡Â»â¢i phÃ¡Â»Âng vÃ¡ÂºÂ¥n sau ÃâÃÂ¢y vÃÂ  ÃâÃÂ°a ra ÃâÃÂ¡nh giÃÂ¡ khÃÂ¡ch quan.

NÃ¡Â»ËI DUNG BUÃ¡Â»âI PHÃ¡Â»Å½NG VÃ¡ÂºÂ¤N:
{history_text}

HÃÂ£y trÃ¡ÂºÂ£ vÃ¡Â»Â kÃ¡ÂºÂ¿t quÃ¡ÂºÂ£ DÃÂ¯Ã¡Â»Å¡I DÃ¡ÂºÂ NG JSON vÃ¡Â»âºi cÃÂ¡c trÃÂ°Ã¡Â»Âng:
- overall_score: ÃâiÃ¡Â»Æm tÃ¡Â»â¢ng quÃÂ¡t (1-10)
- technical_score: ÃâiÃ¡Â»Æm kiÃ¡ÂºÂ¿n thÃ¡Â»Â©c chuyÃÂªn mÃÂ´n (1-10)
- communication_score: ÃâiÃ¡Â»Æm giao tiÃ¡ÂºÂ¿p (1-10)
- summary: tÃÂ³m tÃ¡ÂºÂ¯t ngÃ¡ÂºÂ¯n gÃ¡Â»Ân (dÃÂ°Ã¡Â»âºi 100 tÃ¡Â»Â«)
- strengths: danh sÃÂ¡ch 3-5 ÃâiÃ¡Â»Æm mÃ¡ÂºÂ¡nh (list string)
- weaknesses: danh sÃÂ¡ch 2-3 ÃâiÃ¡Â»Æm cÃ¡ÂºÂ§n cÃ¡ÂºÂ£i thiÃ¡Â»â¡n (list string)
- detailed_feedback: object gÃ¡Â»âm:
  - question_performance: list object {{question: string, feedback: string, score: 1-10}}
  - soft_skills: {{confidence: 1-10, clarity: 1-10, tone: string}}
  - cultural_fit: string

LÃÂ°u ÃÂ½: chÃ¡Â»â° trÃ¡ÂºÂ£ vÃ¡Â»Â 1 JSON object hÃ¡Â»Â£p lÃ¡Â»â¡, khÃÂ´ng thÃÂªm giÃ¡ÂºÂ£i thÃÂ­ch.
"""

        model_alias = config(
            "AI_LLM_MODEL",
            default=config("LLM_MODEL", default=config("OLLAMA_MODEL", default="gpt-5.4-mini")),
        )

        payload = {
            "model": model_alias,
            "messages": [
                {
                    "role": "system",
                    "content": "You are a professional recruitment interview evaluation AI. Return only valid JSON.",
                },
                {"role": "user", "content": prompt},
            ],
            "temperature": 0.3,
            "response_format": {"type": "json_object"},
        }

        logger.info("Starting AI evaluation for session %s using %s", session_id, model_alias)

        response_json, llm_candidate = post_chat_completion_httpx(
            payload,
            default_model=model_alias,
            timeout_seconds=120.0,
            connect_timeout_seconds=15.0,
        )
        logger.info(
            "AI evaluation for session %s using LLM source %s",
            session_id,
            llm_candidate.name,
        )

        content = response_json["choices"][0]["message"]["content"]
        raw_json = _extract_json_object(content)
        validated = InterviewEvaluationSchema.model_validate_json(raw_json)

        session.ai_overall_score = validated.overall_score
        session.ai_technical_score = validated.technical_score
        session.ai_communication_score = validated.communication_score
        session.ai_summary = validated.summary
        session.ai_strengths = validated.strengths
        session.ai_weaknesses = validated.weaknesses
        session.ai_detailed_feedback = validated.detailed_feedback.model_dump()
        session.status = "completed"
        session.save()

        broadcast_interview_event(session.id, "status_changed", {
            "sessionId": session.id,
            "oldStatus": "processing",
            "newStatus": "completed",
            "startTime": session.start_time.isoformat() if session.start_time else None,
            "endTime": session.end_time.isoformat() if session.end_time else None,
            "duration": session.duration,
        })

        logger.info(
            "AI evaluation for session %s completed successfully. Score=%s",
            session_id,
            session.ai_overall_score,
        )
        return session.id

    except InterviewSession.DoesNotExist:
        logger.error("InterviewSession ID %s not found for evaluation.", session_id)
        return None
    except ValidationError as e:
        logger.error("AI output schema validation failed for session %s: %s", session_id, e)
    except ValueError as e:
        logger.error("Could not extract JSON payload for session %s: %s", session_id, e)
    except json.JSONDecodeError:
        logger.error("Failed to decode JSON from AI response for session %s", session_id)
    except Exception as e:
        logger.error("Unexpected error in evaluate_interview_session(%s): %s", session_id, e)

    # If we caught an error (other than DoesNotExist), revert to completed so frontend doesn't hang
    try:
        session = InterviewSession.objects.get(id=session_id)
        if session.status == "processing":
            _mark_evaluation_unavailable(
                session,
                "AI evaluation failed before producing a valid report. Please check AI service logs.",
            )
    except Exception as e2:
        logger.error("Failed to revert session %s status to completed: %s", session_id, e2)

    return None

@shared_task
def auto_schedule_screening_interview(activity_id: int):
    """Automatically schedules an AI interview if the job post has a template."""
    from apps.jobs.models import JobPostActivity
    from apps.interviews.models import InterviewSession
    
    try:
        activity = JobPostActivity.objects.select_related('user', 'job_post', 'job_post__interview_template').get(id=activity_id)
        job_post = activity.job_post
        candidate = activity.user
        
        # Check if template exists
        if not job_post.interview_template:
            return
            
        # Check if session already exists
        if InterviewSession.objects.filter(candidate=candidate, job_post=job_post).exists():
            return
            
        # Create Session
        from django.utils import timezone
        # Schedule it loosely starting now
        session = InterviewSession.objects.create(
            candidate=candidate,
            job_post=job_post,
            type='mixed', # Mixed AI screening
            status='scheduled',
            scheduled_at=timezone.now(),
            question_group=job_post.interview_template,
            created_by=job_post.user, # The actual Employer
        )
        
        # Add questions from group
        session.questions.set(job_post.interview_template.questions.all())
        
        # Move pipeline to "Tested" to indicate an assessment was sent? Or leave in Pending
        # Let's move it to "Contacted" (2) since we contacted them with an assessment
        from shared.configs.variable_system import ApplicationStatus
        if activity.status == ApplicationStatus.PENDING_CONFIRMATION:
            activity.status = ApplicationStatus.CONTACTED
            activity.save(update_fields=['status', 'update_at'])
        
        # Send Email
        send_interview_invitation.delay(session.id)
        logger.info(f"Auto-scheduled screening AI interview for candidate {candidate.id} on job {job_post.id}")
    except Exception as e:
        logger.error(f"Failed to auto-schedule screening interview: {e}")

