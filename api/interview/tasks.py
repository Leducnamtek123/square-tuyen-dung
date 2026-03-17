import logging
import httpx
import json
from celery import shared_task
from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.utils import timezone as tz
from decouple import config
from .models import InterviewSession
from .livekit_service import LiveKitService

logger = logging.getLogger(__name__)

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

        # Trigger AI Evaluation if completed
        evaluate_interview_session.delay(session.id)

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
    """Gửi email mời phỏng vấn cho ứng viên."""
    try:
        session = InterviewSession.objects.select_related('candidate', 'job_post').get(id=session_id)
        candidate = session.candidate
        
        web_url = config('WEB_CLIENT_URL', default='http://localhost:3002')
        interview_url = f"{web_url}/phong-van/{session.invite_token}"
        
        context = {
            "candidate_name": candidate.full_name,
            "job_title": session.job_post.job_name if session.job_post else "Vị trí tuyển dụng",
            "interview_url": interview_url,
            "invite_token": session.invite_token
        }
        
        html_message = render_to_string('interview/emails/invitation.html', context)
        plain_message = strip_tags(html_message)
        
        send_mail(
            subject=f"[TuyenDungSquare] Mời Phỏng vấn trực tuyến - {context['job_title']}",
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[candidate.email],
            html_message=html_message,
            fail_silently=False,
        )
        logger.info(f"Invitation email sent to {candidate.email} for session {session_id}")
    except Exception as e:
        logger.error(f"Error sending invitation email for session {session_id}: {e}")

@shared_task
def send_evaluation_report(session_id):
    """Gửi báo cáo đánh giá cho nhà tuyển dụng (người tạo)."""
    try:
        session = InterviewSession.objects.select_related('candidate', 'job_post', 'created_by').get(id=session_id)
        employer = session.created_by
        
        web_url = config('WEB_CLIENT_URL', default='http://localhost:3002')
        report_url = f"{web_url}/employer/interview-list/{session.id}"
        
        context = {
            "candidate_name": session.candidate.full_name,
            "job_title": session.job_post.job_name if session.job_post else "Vị trí tuyển dụng",
            "overall_score": session.ai_overall_score,
            "summary": session.ai_summary,
            "report_url": report_url
        }
        
        html_message = render_to_string('interview/emails/report.html', context)
        plain_message = strip_tags(html_message)
        
        send_mail(
            subject=f"[TuyenDungSquare] Đã có kết quả Phỏng vấn trực tuyến - {session.candidate.full_name}",
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[employer.email],
            html_message=html_message,
            fail_silently=False,
        )
        logger.info(f"Evaluation report sent to {employer.email} for session {session_id}")
    except Exception as e:
        logger.error(f"Error sending report email for session {session_id}: {e}")

@shared_task
def evaluate_interview_session(session_id):
    """
    Gọi LLM để đánh giá buổi phỏng vấn dựa trên transcript và lưu kết quả vào session.
    """
    try:
        session = InterviewSession.objects.prefetch_related('transcripts').get(id=session_id)
        transcripts = session.transcripts.all().order_by('create_at')
        
        if not transcripts:
            logger.warning(f"Session {session_id} has no transcripts to evaluate.")
            return
            
        # Format transcript for LLM
        history_text = ""
        for t in transcripts:
            role = "Người phỏng vấn" if t.speaker_role == 'ai_agent' else "Ứng viên"
            history_text += f"{role}: {t.content}\n"
            
        # Prompt for evaluation
        prompt = f"""
        Bạn là một chuyên gia tuyển dụng chuyên nghiệp. Hãy phân tích nội dung buổi phỏng vấn sau đây và đưa ra đánh giá khách quan.

        NỘI DUNG BUỔI PHỎNG VẤN:
        {history_text}
        
        HÃY TRẢ VỀ KẾT QUẢ DƯỚI DẠNG JSON (với các trường sau):
        - overall_score: Điểm tổng quát (từ 1 đến 10)
        - technical_score: Điểm kiến thức chuyên môn (từ 1 đến 10)
        - communication_score: Điểm kỹ năng giao tiếp (từ 1 đến 10)
        - summary: Tóm tắt ngắn gọn nội dung phỏng vấn (Dưới 100 từ)
        - strengths: Danh sách 3-5 điểm mạnh nhất của ứng viên (Dạng list string)
        - weaknesses: Danh sách 2-3 điểm cần cải thiện (Dạng list string)
        - detailed_feedback: Đối tượng JSON chứa:
            - question_performance: List các object {question: string, feedback: string, score: 1-10}
            - soft_skills: {confidence: 1-10, clarity: 1-10, tone: string}
            - cultural_fit: string (Nhận xét về mức độ phù hợp văn hóa)
        
        LƯU Ý: Phản hồi PHẢI là một JSON object hợp lệ, không có văn bản giải thích. Ngôn ngữ phản hồi là tiếng Việt.
        """
        
        llama_url = config('LLAMA_BASE_URL', default="http://llama-cpp:11434/v1")
        model_alias = config('LLAMA_MODEL_ALIAS', default="qwen2-7b")
        
        payload = {
            "model": model_alias,
            "messages": [
                {"role": "system", "content": "Bạn là một AI hỗ trợ đánh giá phỏng vấn tuyển dụng chuyên nghiệp."},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.3,
        }
        
        logger.info(f"Starting AI Evaluation for Session {session_id} using {model_alias}...")
        
        with httpx.Client(timeout=180.0) as client:
            resp = client.post(f"{llama_url}/chat/completions", json=payload)
            if resp.status_code == 200:
                content = resp.json()['choices'][0]['message']['content']
                
                # Regex-based extraction is more robust than simple split
                import re
                json_match = re.search(r'```json\s*(.*?)\s*```', content, re.DOTALL)
                if not json_match:
                    json_match = re.search(r'```\s*(.*?)\s*```', content, re.DOTALL)
                
                clean_json_str = json_match.group(1) if json_match else content.strip()
                
                try:
                    eval_data = json.loads(clean_json_str)
                except json.JSONDecodeError:
                    # Fallback to simple cleanup if regex fails or still invalid
                    content_clean = content.replace("```json", "").replace("```", "").strip()
                    eval_data = json.loads(content_clean)
                
                # Cập nhật kết quả vào database
                session.ai_overall_score = eval_data.get('overall_score', 0)
                session.ai_technical_score = eval_data.get('technical_score', 0)
                session.ai_communication_score = eval_data.get('communication_score', 0)
                session.ai_summary = eval_data.get('summary', '')
                
                # Lưu trực tiếp dạng list vào JSONField thay vì join string
                session.ai_strengths = eval_data.get('strengths', [])
                session.ai_weaknesses = eval_data.get('weaknesses', [])
                session.ai_detailed_feedback = eval_data.get('detailed_feedback', {})
                session.save()
                
                logger.info(f"AI Evaluation for Session {session_id} completed successfully. Score: {session.ai_overall_score}")
                
                # Sau khi evaluate xong, gửi báo cáo cho NTD
                send_evaluation_report.delay(session.id)
            else:
                logger.error(f"LLM API call failed with status {resp.status_code}: {resp.text}")
                
    except InterviewSession.DoesNotExist:
        logger.error(f"InterviewSession ID {session_id} not found for evaluation.")
    except json.JSONDecodeError:
        logger.error(f"Failed to parse JSON from LLM response for session {session_id}")
    except Exception as e:
        logger.error(f"Unexpected error in evaluate_interview_session: {e}")
