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

from .livekit_service import LiveKitService
from .models import InterviewSession

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
def send_interview_invitation(session_id):
    """Send interview invitation email to candidate."""
    try:
        session = InterviewSession.objects.select_related("candidate", "job_post").get(id=session_id)
        candidate = session.candidate

        web_url = config("WEB_CLIENT_URL", default="http://localhost:3002")
        interview_url = f"{web_url}/phong-van/{session.invite_token}"

        context = {
            "candidate_name": candidate.full_name,
            "job_title": session.job_post.job_name if session.job_post else "Vị trí tuyển dụng",
            "interview_url": interview_url,
            "invite_token": session.invite_token,
        }

        html_message = render_to_string("interview/emails/invitation.html", context)
        plain_message = strip_tags(html_message)

        send_mail(
            subject=f"[TuyenDungSquare] Mời Phỏng vấn trực tuyến - {context['job_title']}",
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
        report_url = f"{web_url}/employer/interview-list/{session.id}"

        context = {
            "candidate_name": session.candidate.full_name,
            "job_title": session.job_post.job_name if session.job_post else "Vị trí tuyển dụng",
            "overall_score": session.ai_overall_score,
            "summary": session.ai_summary,
            "report_url": report_url,
        }

        html_message = render_to_string("interview/emails/report.html", context)
        plain_message = strip_tags(html_message)

        send_mail(
            subject=f"[TuyenDungSquare] Đã có kết quả Phỏng vấn trực tuyến - {session.candidate.full_name}",
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[employer.email],
            html_message=html_message,
            fail_silently=False,
        )
        logger.info("Evaluation report sent to %s for session %s", employer.email, session_id)
    except Exception as e:
        logger.error("Error sending report email for session %s: %s", session_id, e)


@shared_task
def evaluate_interview_session(session_id):
    """Call LLM to evaluate interview transcript and persist validated structured output."""
    try:
        session = InterviewSession.objects.prefetch_related("transcripts").get(id=session_id)
        transcripts = session.transcripts.all().order_by("create_at")

        if not transcripts:
            logger.warning("Session %s has no transcripts to evaluate.", session_id)
            return None

        history_text = ""
        for transcript in transcripts:
            role = "Người phỏng vấn" if transcript.speaker_role == "ai_agent" else "Ứng viên"
            history_text += f"{role}: {transcript.content}\n"

        prompt = f"""
Ban la mot chuyen gia tuyen dung chuyen nghiep. Hay phan tich noi dung buoi phong van sau day va dua ra danh gia khach quan.

NOI DUNG BUOI PHONG VAN:
{history_text}

Hay tra ve ket qua DUOI DANG JSON voi cac truong:
- overall_score: diem tong quat (1-10)
- technical_score: diem kien thuc chuyen mon (1-10)
- communication_score: diem giao tiep (1-10)
- summary: tom tat ngan gon (duoi 100 tu)
- strengths: danh sach 3-5 diem manh (list string)
- weaknesses: danh sach 2-3 diem can cai thien (list string)
- detailed_feedback: object gom:
  - question_performance: list object {{question: string, feedback: string, score: 1-10}}
  - soft_skills: {{confidence: 1-10, clarity: 1-10, tone: string}}
  - cultural_fit: string

Luu y: chi tra ve 1 JSON object hop le, khong them giai thich.
"""

        llama_url = config("LLAMA_BASE_URL", default="http://llama-cpp:11434/v1")
        model_alias = config("LLAMA_MODEL_ALIAS", default="qwen2-7b")

        payload = {
            "model": model_alias,
            "messages": [
                {
                    "role": "system",
                    "content": "Ban la mot AI ho tro danh gia phong van tuyen dung chuyen nghiep.",
                },
                {"role": "user", "content": prompt},
            ],
            "temperature": 0.3,
            "response_format": {"type": "json_object"},
        }

        logger.info("Starting AI evaluation for session %s using %s", session_id, model_alias)

        with httpx.Client(timeout=httpx.Timeout(timeout=45.0, connect=10.0)) as client:
            resp = client.post(f"{llama_url}/chat/completions", json=payload)

        if resp.status_code != 200:
            logger.error("LLM API call failed with status %s: %s", resp.status_code, resp.text)
            return None

        content = resp.json()["choices"][0]["message"]["content"]
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

        logger.info(
            "AI evaluation for session %s completed successfully. Score=%s",
            session_id,
            session.ai_overall_score,
        )
        return session.id

    except InterviewSession.DoesNotExist:
        logger.error("InterviewSession ID %s not found for evaluation.", session_id)
    except ValidationError as e:
        logger.error("AI output schema validation failed for session %s: %s", session_id, e)
    except ValueError as e:
        logger.error("Could not extract JSON payload for session %s: %s", session_id, e)
    except json.JSONDecodeError:
        logger.error("Failed to decode JSON from AI response for session %s", session_id)
    except Exception as e:
        logger.error("Unexpected error in evaluate_interview_session(%s): %s", session_id, e)

    return None
