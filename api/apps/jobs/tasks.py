import logging
import httpx
import json
import os
import tempfile
import fitz  # PyMuPDF
import docx
from celery import shared_task
from django.conf import settings
from decouple import config
from .models import JobPostActivity

logger = logging.getLogger(__name__)


@shared_task(
    bind=True,
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_kwargs={"max_retries": 3},
    ignore_result=True,
)
def es_index_job_post(self, job_post_id: int):
    """
    Asynchronously index (create or update) a single JobPost document in Elasticsearch.
    Called by the post_save signal in signals.py.
    """
    try:
        from .models import JobPost
        from django_elasticsearch_dsl.registries import registry

        instance = JobPost.objects.get(pk=job_post_id)
        registry.update(instance)
        logger.debug("ES: indexed JobPost id=%s", job_post_id)
    except JobPost.DoesNotExist:
        logger.warning("ES index skipped: JobPost id=%s not found (deleted?)", job_post_id)
    except Exception as exc:
        logger.error("ES index failed for JobPost id=%s: %s", job_post_id, exc)
        raise  # let Celery retry


@shared_task(
    bind=True,
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_kwargs={"max_retries": 3},
    ignore_result=True,
)
def es_delete_job_post(self, job_post_id: int):
    """
    Asynchronously remove a JobPost document from Elasticsearch.
    Called by the post_delete signal in signals.py.
    """
    try:
        from django_elasticsearch_dsl.registries import registry
        from .documents import JobPostDocument

        # Build a fake object with just the pk so the registry can remove it
        class _Stub:
            pk = job_post_id

        JobPostDocument().delete(doc_id=job_post_id, ignore=404)
        logger.debug("ES: deleted JobPost id=%s", job_post_id)
    except Exception as exc:
        logger.error("ES delete failed for JobPost id=%s: %s", job_post_id, exc)
        raise


def extract_text_from_pdf(file_path):
    """Trích xuất văn bản từ file PDF."""
    text = ""
    try:
        doc = fitz.open(file_path)
        for page in doc:
            text += page.get_text()
        doc.close()
    except Exception as e:
        logger.error(f"Error extracting PDF: {e}")
    return text

def extract_text_from_docx(file_path):
    """Trích xuất văn bản từ file DOCX."""
    text = ""
    try:
        doc = docx.Document(file_path)
        for para in doc.paragraphs:
            text += para.text + "\n"
    except Exception as e:
        logger.error(f"Error extracting DOCX: {e}")
    return text

@shared_task(bind=True, autoretry_for=(httpx.TimeoutException, httpx.ConnectError),
             retry_backoff=True, retry_kwargs={'max_retries': 3})
def analyze_resume_ai(self, activity_id):
    """
    Task phân tích CV bằng AI.
    Tự động retry lên đến 3 lần với exponential backoff khi LLM timeout.
    """
    temp_file = None
    try:
        activity = JobPostActivity.objects.select_related('job_post', 'resume', 'resume__file').get(id=activity_id)
        
        if not activity.resume or not activity.resume.file:
            activity.ai_analysis_status = 'failed'
            activity.ai_analysis_summary = "Không tìm thấy file CV để phân tích."
            activity.save()
            return

        activity.ai_analysis_status = 'processing'
        activity.save()

        resume_url = activity.resume.file.get_full_url()
        file_format = activity.resume.file.format.lower()
        
        resume_text = ""
        with httpx.Client(timeout=30.0) as client:
            response = client.get(resume_url)
            if response.status_code == 200:
                with tempfile.NamedTemporaryFile(delete=False, suffix=f".{file_format}") as tf:
                    tf.write(response.content)
                    temp_file = tf.name
                
                if file_format == 'pdf':
                    resume_text = extract_text_from_pdf(temp_file)
                elif file_format in ['docx', 'doc']:
                    resume_text = extract_text_from_docx(temp_file)
                else:
                    resume_text = response.text
            else:
                raise Exception(f"Failed to download resume file from {resume_url}")

        if not resume_text or len(resume_text.strip()) < 50:
            activity.ai_analysis_status = 'failed'
            activity.ai_analysis_summary = "Không thể đọc được nội dung CV (File có thể là ảnh hoặc bị lỗi)."
            activity.save()
            return

        # 2. Chuẩn bị prompt
        job_description = activity.job_post.job_description
        job_requirement = activity.job_post.job_requirement or ""
        
        prompt = f"""
        Bạn là một chuyên gia tuyển dụng AI cấp cao. Hãy phân tích CV của ứng viên so với yêu cầu công việc.

        THÔNG TIN CÔNG VIỆC:
        - Tên vị trí: {activity.job_post.job_name}
        - Mô tả: {job_description}
        - Yêu cầu: {job_requirement}

        NỘI DUNG CV ỨNG VIÊN:
        {resume_text[:4000]}

        Nhiệm vụ của bạn:
        1. Chấm điểm độ phù hợp (0-100) dựa trên kỹ năng, kinh nghiệm và học vấn.
        2. Tóm tắt ngắn gọn lý do tại sao ứng viên này phù hợp hoặc không phù hợp (headhunter style).
        3. Liệt kê các kỹ năng chính mà ứng viên có.
        4. Liệt kê các điểm mạnh vượt trội (pros).
        5. Liệt kê các điểm yếu hoặc điểm cần lưu ý (cons).
        6. Xác định các kỹ năng khớp với JD (matching_skills).
        7. Xác định các kỹ năng còn thiếu so với JD (missing_skills).

        HÃY TRẢ VỀ JSON HỢP LỆ VỚI CÁC TRƯỜNG:
        - score: (số nguyên 0-100)
        - summary: (chuỗi văn bản tiếng Việt)
        - skills: (mảng các chuỗi kỹ năng)
        - pros: (mảng các chuỗi điểm mạnh)
        - cons: (mảng các chuỗi điểm yếu)
        - matching_skills: (mảng các kỹ năng khớp JD)
        - missing_skills: (mảng các kỹ năng thiếu so với JD)

        LƯU Ý: Không giải thích gì thêm, chỉ trả về JSON.
        """

        # 3. Gọi LLM
        llama_url = config('LLAMA_BASE_URL', default="http://llama-cpp:11434/v1")
        model_alias = config('LLAMA_MODEL_ALIAS', default="qwen2-7b")

        payload = {
            "model": model_alias,
            "messages": [
                {"role": "system", "content": "Bạn là AI phân tích hồ sơ chuyên nghiệp, luôn trả về JSON."},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.2,
            "response_format": {"type": "json_object"},
        }

        with httpx.Client(timeout=httpx.Timeout(timeout=120.0, connect=10.0)) as client:
            resp = client.post(f"{llama_url}/chat/completions", json=payload)
            if resp.status_code == 200:
                content = resp.json()['choices'][0]['message']['content']
                
                # Extract JSON from possible markdown fences
                if "```json" in content:
                    content = content.split("```json")[1].split("```")[0].strip()
                elif "```" in content:
                    content = content.split("```")[1].split("```")[0].strip()
                
                result = json.loads(content)
                
                activity.ai_analysis_score = result.get('score', 0)
                activity.ai_analysis_summary = result.get('summary', '')
                activity.ai_analysis_skills = ", ".join(result.get('skills', []))
                
                activity.ai_analysis_pros = ", ".join(result.get('pros', []))
                activity.ai_analysis_cons = ", ".join(result.get('cons', []))
                activity.ai_analysis_matching_skills = result.get('matching_skills', [])
                activity.ai_analysis_missing_skills = result.get('missing_skills', [])
                
                activity.ai_analysis_status = 'completed'
                activity.save()
                
                logger.info(f"AI Analysis completed for Activity {activity_id}. Score: {activity.ai_analysis_score}")
            else:
                raise Exception(f"LLM API failed with status {resp.status_code}")

    except (httpx.TimeoutException, httpx.ConnectError):
        # Let Celery autoretry handle these
        raise
    except Exception as e:
        logger.error(f"Error in analyze_resume_ai for activity {activity_id}: {e}")
        try:
            activity = JobPostActivity.objects.get(id=activity_id)
            activity.ai_analysis_status = 'failed'
            activity.ai_analysis_summary = str(e)[:500]
            activity.save()
        except Exception:
            logger.error(f"Failed to update activity {activity_id} status after error")
    finally:
        # Always cleanup temp files
        if temp_file and os.path.exists(temp_file):
            try:
                os.unlink(temp_file)
            except OSError:
                pass
