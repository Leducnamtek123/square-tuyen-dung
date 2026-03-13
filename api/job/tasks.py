import logging
import httpx
import json
import fitz  # PyMuPDF
import docx
from celery import shared_task
from django.conf import settings
from decouple import config
from .models import JobPostActivity

logger = logging.getLogger(__name__)

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

@shared_task
def analyze_resume_ai(activity_id):
    """
    Task phân tích CV bằng AI.
    """
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
        with httpx.Client() as client:
            response = client.get(resume_url)
            if response.status_code == 200:
                temp_file = f"/tmp/resume_{activity_id}.{file_format}"
                with open(temp_file, "wb") as f:
                    f.write(response.content)
                
                if file_format == 'pdf':
                    resume_text = extract_text_from_pdf(temp_file)
                elif file_format in ['docx', 'doc']:
                    resume_text = extract_text_from_docx(temp_file)
                else:
                    # Thử extract như text nếu là định dạng khác
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
        {resume_text[:4000]}  # Giới hạn text để tránh quá tải token

        Nhiệm vụ của bạn:
        1. Chấm điểm độ phù hợp (0-100) dựa trên kỹ năng, kinh nghiệm và học vấn.
        2. Tóm tắt ngắn gọn lý do tại sao ứng viên này phù hợp hoặc không phù hợp.
        3. Liệt kê các kỹ năng chính mà ứng viên có.

        HÃY TRẢ VỀ JSON HỢP LỆ VỚI CÁC TRƯỜNG:
        - score: (số nguyên 0-100)
        - summary: (chuỗi văn bản tiếng Việt)
        - skills: (mảng các chuỗi kỹ năng)

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
        }

        with httpx.Client(timeout=120.0) as client:
            resp = client.post(f"{llama_url}/chat/completions", json=payload)
            if resp.status_code == 200:
                content = resp.json()['choices'][0]['message']['content']
                
                if "```json" in content:
                    content = content.split("```json")[1].split("```")[0].strip()
                elif "```" in content:
                    content = content.split("```")[1].split("```")[0].strip()
                
                result = json.loads(content)
                
                activity.ai_analysis_score = result.get('score', 0)
                activity.ai_analysis_summary = result.get('summary', '')
                activity.ai_analysis_skills = ", ".join(result.get('skills', []))
                activity.ai_analysis_status = 'completed'
                activity.save()
                
                logger.info(f"AI Analysis completed for Activity {activity_id}. Score: {activity.ai_analysis_score}")
            else:
                raise Exception(f"LLM API failed with status {resp.status_code}")

    except Exception as e:
        logger.error(f"Error in analyze_resume_ai for activity {activity_id}: {e}")
        try:
            activity = JobPostActivity.objects.get(id=activity_id)
            activity.ai_analysis_status = 'failed'
            activity.ai_analysis_summary = str(e)
            activity.save()
        except:
            pass
