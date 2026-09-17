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
from apps.operations.services import OperationTracker
from apps.operations.models import AsyncOperation
from decimal import Decimal
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
    session.ai_overall_score = 0
    session.ai_technical_score = 0
    session.ai_communication_score = 0
    session.ai_summary = reason
    session.ai_strengths = []
    session.ai_weaknesses = ["Phiên phỏng vấn kết thúc sớm khi chưa ghi nhận câu trả lời từ ứng viên."]
    session.ai_detailed_feedback = {
        "soft_skills": {"confidence": 0, "clarity": 0, "tone": "chưa ghi nhận"},
        "cultural_fit": "Chưa đủ dữ liệu đánh giá do phiên phỏng vấn kết thúc sớm.",
        "question_performance": [],
    }
    session.save(update_fields=[
        "status", "ai_overall_score", "ai_technical_score", "ai_communication_score",
        "ai_summary", "ai_strengths", "ai_weaknesses", "ai_detailed_feedback", "update_at"
    ])

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

        if (session.session_metadata or {}).get("persistent"):
            logger.info("Skip auto-ending persistent session %s.", session_id)
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
            send_interview_report_notification.s(),
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

    if (session.session_metadata or {}).get("persistent"):
        logger.info(
            "Skip finalizing disconnect for persistent session %s.",
            session_id,
        )
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
def send_interview_invitation(session_id, initial_password=None):
    """Send interview invitation email to candidate with onboarding credentials."""
    try:
        session = InterviewSession.objects.select_related("candidate", "job_post").get(id=session_id)
        candidate = session.candidate

        web_url = config("WEB_CLIENT_URL", default="https://infohr.vn").rstrip("/")
        interview_url = f"{web_url}/phong-van/{session.invite_token}"
        login_url = f"{web_url}/login"
        scheduled_at_display = "Ngay khi bạn thuận tiện"
        if session.scheduled_at:
            scheduled_at_display = tz.localtime(session.scheduled_at).strftime("%H:%M - %d/%m/%Y")

        job_title = session.job_post.job_name if session.job_post else "Vị trí tuyển dụng"

        context = {
            "candidate_name": candidate.full_name or "Ứng viên",
            "candidate_email": candidate.email,
            "initial_password": initial_password,
            "login_url": login_url,
            "job_title": job_title,
            "interview_url": interview_url,
            "invite_token": session.invite_token,
            "access_code": session.invite_token,
            "scheduled_at_display": scheduled_at_display,
        }

        html_message = render_to_string("interview/emails/invitation.html", context)
        plain_message = strip_tags(html_message)

        send_mail(
            subject=f"[InfoHR] Thư mời Phỏng vấn trực tuyến AI - {job_title}",
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[candidate.email],
            html_message=html_message,
            fail_silently=False,
        )
        logger.info("Invitation email sent to %s for session %s", candidate.email, session_id)
        return True
    except Exception as e:
        logger.error("Error sending invitation email for session %s: %s", session_id, e)
        return False


@shared_task
def send_interview_report_notification(session_id):
    """Notify employer that interview report & video are ready."""
    try:
        session = InterviewSession.objects.select_related("candidate", "job_post", "company").get(id=session_id)
        employer_email = session.company.email if session.company else None
        if not employer_email:
            return False

        web_url = config("WEB_CLIENT_URL", default="https://infohr.vn").rstrip("/")
        report_url = f"{web_url}/employer/interviews/{session.id}"

        candidate_display_name = session.candidate.full_name or session.candidate.username or "Ứng viên"
        context = {
            "candidate_name": candidate_display_name,
            "job_title": session.job_post.job_name if session.job_post else "Vị trí tuyển dụng",
            "overall_score": session.ai_overall_score,
            "summary": session.ai_summary,
            "report_url": report_url,
        }

        html_message = render_to_string("interview/emails/report.html", context)
        plain_message = strip_tags(html_message)

        send_mail(
            subject=f"[InfoHR] Báo cáo kết quả Phỏng vấn trực tuyến AI - {candidate_display_name}",
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
    tracker = None
    try:
        session = InterviewSession.objects.prefetch_related("transcripts").get(id=session_id)
        company = getattr(session.job_post, "company", None) if getattr(session, "job_post", None) else None
        user = getattr(session, "candidate", None)
        user_id = getattr(user, "id", None) if user else None
        company_id = getattr(company, "id", None) if company else None

        create_kwargs = {
            "type": "interview.evaluate",
            "title": f"Đánh giá phỏng vấn AI #{session.id}",
            "steps": [
                {"key": "sync_recording", "label": "Đồng bộ dữ liệu phòng phỏng vấn"},
                {"key": "transcribe_align", "label": "Tổng hợp hội thoại & phiên âm"},
                {"key": "ai_scoring", "label": "AI đánh giá năng lực & chuyên môn"},
                {"key": "apply_weights", "label": "Áp dụng thang điểm & trọng số"},
                {"key": "publish_report", "label": "Hoàn tất báo cáo & công bố kết quả"},
            ],
            "metadata": {"session_id": session.id, "job_post_id": getattr(session, "job_post_id", None)},
        }
        try:
            tracker = OperationTracker.create(
                **create_kwargs,
                company_id=company_id,
                user_id=user_id,
            )
        except TypeError:
            tracker = OperationTracker.create(
                **create_kwargs,
                company=company,
                user=user,
            )

        meta = session.session_metadata or {}
        if isinstance(meta, dict):
            meta["operation_id"] = tracker.operation.id
            session.session_metadata = meta
            session.save(update_fields=["session_metadata", "update_at"])

        if tracker:
            tracker.start_step("sync_recording", detail="Đang đồng bộ dữ liệu phiên phỏng vấn...")
            tracker.complete_step("sync_recording", detail="Đồng bộ dữ liệu phiên phỏng vấn thành công.")

        if tracker:
            tracker.start_step("transcribe_align", detail="Đang tổng hợp nội dung hội thoại...")

        transcripts = session.transcripts.all().order_by("create_at")

        if not transcripts:
            logger.warning("Session %s has no transcripts to evaluate.", session_id)
            if tracker:
                tracker.fail("Chưa có đủ dữ liệu hội thoại từ ứng viên.", code="INSUFFICIENT_DATA")
            _mark_evaluation_unavailable(
                session,
                "Chưa có dữ liệu hội thoại để thực hiện đánh giá cho buổi phỏng vấn này.",
            )
            return None

        # Check if candidate actually spoke in the interview
        candidate_transcripts = [
            t for t in transcripts if t.speaker_role in ("candidate", "jobseeker", "user")
        ]
        total_candidate_words = sum(len(t.content.strip().split()) for t in candidate_transcripts)

        if not candidate_transcripts or total_candidate_words < 5:
            logger.warning(
                "Session %s has insufficient candidate speech to evaluate (transcripts=%s, words=%s).",
                session_id, len(candidate_transcripts), total_candidate_words
            )
            if tracker:
                tracker.fail("Chưa có đủ dữ liệu hội thoại từ ứng viên.", code="INSUFFICIENT_DATA")
            _mark_evaluation_unavailable(
                session,
                "Phiên phỏng vấn kết thúc sớm khi chưa ghi nhận câu trả lời phỏng vấn từ ứng viên.",
            )
            return None

        if tracker:
            tracker.complete_step(
                "transcribe_align",
                detail=f"Tổng hợp {len(candidate_transcripts)} câu trả lời ({total_candidate_words} từ).",
            )

        history_text = ""
        for transcript in transcripts:
            role = "Người phỏng vấn" if transcript.speaker_role == "ai_agent" else "Ứng viên"
            history_text += f"{role}: {transcript.content}\n"

        prompt = f"""
Bạn là một chuyên gia tuyển dụng chuyên nghiệp. Hãy phân tích nội dung buổi phỏng vấn sau đây và đưa ra đánh giá khách quan, trung thực dựa HOÀN TOÀN vào những gì ứng viên thực tế đã trả lời.

NỘI DUNG BUỔI PHỎNG VẤN:
{history_text}

QUY TẮC ĐÁNH GIÁ VÀ CHẤM ĐIỂM BẮT BUỘC:
1. Chỉ chấm điểm và đánh giá dựa trên những gì ứng viên THỰC TẾ ĐÃ TRẢ LỜI. Tuyệt đối KHÔNG tự suy diễn, KHÔNG khen ngợi những kỹ năng không xuất hiện trong hội thoại.
2. Nếu ứng viên trả lời rất ngắn gọn, sơ sài, không đúng trọng tâm hoặc chỉ nói không biết, điểm số từng phần và tổng quát phải từ 1 đến 4 điểm.
3. Chỉ đưa vào danh sách question_performance những câu hỏi mà ứng viên thực sự đã có câu trả lời.
4. Điểm số (1-10) phải phản ánh đúng năng lực thể hiện thực tế.

Hãy trả về kết quả DƯỚI DẠNG JSON với các trường:
- overall_score: điểm tổng quát (1-10)
- technical_score: điểm kiến thức chuyên môn (1-10)
- communication_score: điểm giao tiếp (1-10)
- summary: tóm tắt ngắn gọn nhận xét thực tế (dưới 100 từ)
- strengths: danh sách điểm mạnh thực tế (list string, nếu ứng viên chưa thể hiện được thì trả về [])
- weaknesses: danh sách điểm cần cải thiện (list string)
- detailed_feedback: object gồm:
  - question_performance: list object {{question: string, feedback: string, score: 1-10}}
  - soft_skills: {{confidence: 1-10, clarity: 1-10, tone: string}}
  - cultural_fit: string

Lưu ý: chỉ trả về 1 JSON object hợp lệ, không thêm giải thích.
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

        if tracker:
            tracker.start_step(
                "ai_scoring",
                detail="Mô hình AI đang phân tích năng lực và dẫn chứng câu trả lời...",
            )

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

        if tracker:
            tracker.complete_step(
                "ai_scoring",
                detail=f"AI hoàn thành đánh giá chuyên môn (Kỹ thuật: {validated.technical_score}, Giao tiếp: {validated.communication_score}).",
            )

        session.ai_technical_score = validated.technical_score
        session.ai_communication_score = validated.communication_score
        session.ai_overall_score = validated.overall_score

        if tracker:
            tracker.start_step("apply_weights", detail="Đang áp dụng trọng số đánh giá doanh nghiệp...")

        try:
            company = getattr(session.job_post, "company", None)
            if company and hasattr(company, "get_evaluation_weights"):
                weights = company.get_evaluation_weights()
                tech = float(validated.technical_score or 0)
                comm = float(validated.communication_score or 0)
                overall = float(validated.overall_score or 75)
                soft_skills = validated.detailed_feedback.soft_skills
                confidence = float(getattr(soft_skills, "confidence", 7.0) or 7.0) * 10
                clarity = float(getattr(soft_skills, "clarity", 7.0) or 7.0) * 10

                total_w = (
                    weights.get("technical", 30) +
                    weights.get("communication", 20) +
                    weights.get("situational", 20) +
                    weights.get("culture_fit", 20) +
                    weights.get("attitude", 10)
                ) or 100

                weighted = (
                    tech * weights.get("technical", 30) +
                    comm * weights.get("communication", 20) +
                    clarity * weights.get("situational", 20) +
                    confidence * weights.get("culture_fit", 20) +
                    overall * weights.get("attitude", 10)
                ) / total_w
                session.ai_overall_score = round(Decimal(str(weighted)), 1)
        except Exception as w_exc:
            logger.warning("Error applying company weights to evaluation score: %s", w_exc)

        if tracker:
            tracker.complete_step(
                "apply_weights",
                detail=f"Điểm số tổng quan sau trọng số: {session.ai_overall_score}/10.",
            )

        if tracker:
            tracker.start_step(
                "publish_report",
                detail="Đang lưu trữ báo cáo và phát sự kiện hoàn tất...",
            )

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

        if tracker:
            tracker.complete_step(
                "publish_report",
                detail="Hoàn tất báo cáo & công bố kết quả.",
            )
            tracker.finish(
                result={
                    "overallScore": float(session.ai_overall_score or 0),
                    "technicalScore": float(session.ai_technical_score or 0),
                    "communicationScore": float(session.ai_communication_score or 0),
                    "summary": session.ai_summary,
                }
            )

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
        if tracker:
            tracker.fail(str(e)[:500], code="EVALUATION_FAILED")
    except ValueError as e:
        logger.error("Could not extract JSON payload for session %s: %s", session_id, e)
        if tracker:
            tracker.fail(str(e)[:500], code="EVALUATION_FAILED")
    except json.JSONDecodeError:
        logger.error("Failed to decode JSON from AI response for session %s", session_id)
        if tracker:
            tracker.fail("Failed to decode JSON from AI response", code="EVALUATION_FAILED")
    except Exception as e:
        logger.error("Unexpected error in evaluate_interview_session(%s): %s", session_id, e)
        if tracker:
            tracker.fail(str(e)[:500], code="EVALUATION_FAILED")

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


@shared_task
def start_room_recording_task(room_name: str) -> None:
    """Start LiveKit room composite egress asynchronously via Celery worker."""
    try:
        LiveKitService.start_recording(room_name)
    except Exception as exc:
        logger.warning("start_room_recording_task failed for room %s: %s", room_name, exc)


