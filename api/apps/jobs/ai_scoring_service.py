"""
AI Scoring Service — evaluates resume-job fit using LLM.
Provides a structured score and reasons for matching.
"""
import json
import logging
import hashlib

from django.conf import settings
from django.core.cache import cache

import httpx

logger = logging.getLogger(__name__)

CACHE_TTL = 3600  # 1 hour


def _cache_key(resume_id, job_id):
    """Generate a unique cache key for a resume-job pair."""
    raw = f"ai_score:{resume_id}:{job_id}"
    return hashlib.md5(raw.encode()).hexdigest()


def build_scoring_prompt(resume_data, job_data):
    """Build the LLM prompt for resume-job scoring."""
    return f"""Bạn là chuyên gia tuyển dụng. Hãy đánh giá mức độ phù hợp của ứng viên với vị trí tuyển dụng.

## Thông tin ứng viên:
- Chức danh: {resume_data.get('title', 'N/A')}
- Kỹ năng: {resume_data.get('skills', 'N/A')}
- Kinh nghiệm: {resume_data.get('experience', 'N/A')} năm
- Trình độ: {resume_data.get('academic_level', 'N/A')}
- Mức lương mong muốn: {resume_data.get('salary_min', 0)} - {resume_data.get('salary_max', 0)}

## Vị trí tuyển dụng:
- Tiêu đề: {job_data.get('job_name', 'N/A')}
- Mô tả: {str(job_data.get('description') or 'N/A')[:500]}
- Yêu cầu kinh nghiệm: {job_data.get('experience', 'N/A')} năm
- Mức lương: {job_data.get('salary_min', 0)} - {job_data.get('salary_max', 0)}

Trả về JSON với format:
{{
    "overall_score": <0-100>,
    "skill_match": <0-100>,
    "experience_match": <0-100>,
    "salary_match": <0-100>,
    "strengths": ["điểm mạnh 1", "điểm mạnh 2"],
    "gaps": ["thiếu sót 1", "thiếu sót 2"],
    "recommendation": "ngắn gọn 1-2 câu"
}}
"""


LLM_CIRCUIT_BREAKER_KEY = "ai_scoring_llm_unavailable"


def score_resume_job_fit(resume_data, job_data, resume_id=None, job_id=None):
    """
    Score how well a resume matches a job posting using AI.

    Args:
        resume_data: dict with resume info (title, skills, experience, etc.)
        job_data: dict with job info (job_name, description, experience, etc.)
        resume_id: optional, for caching
        job_id: optional, for caching

    Returns:
        dict with scores and recommendations, or None on error
    """
    # Check cache first
    if resume_id and job_id:
        key = _cache_key(resume_id, job_id)
        cached = cache.get(key)
        if cached:
            logger.debug("AI score cache hit for resume=%s job=%s", resume_id, job_id)
            return cached

    # Fast circuit breaker: If remote LLM is temporarily down or timing out, skip remote call
    if cache.get(LLM_CIRCUIT_BREAKER_KEY):
        return _fallback_scoring(resume_data, job_data)

    prompt = build_scoring_prompt(resume_data, job_data)

    try:
        api_key = (
            getattr(settings, 'AI_LLM_API_KEY', '')
            or getattr(settings, 'LLM_API_KEY', '')
            or getattr(settings, 'OPENAI_API_KEY', '')
            or getattr(settings, 'AI_API_KEY', '')
        )
        base_url = (
            getattr(settings, 'AI_LLM_BASE_URL', '')
            or getattr(settings, 'LLM_BASE_URL', '')
            or getattr(settings, 'OPENAI_API_URL', 'https://api.openai.com/v1')
        ).rstrip('/')
        api_url = f"{base_url}/chat/completions" if not base_url.endswith("/chat/completions") else base_url
        model = (
            getattr(settings, 'AI_LLM_MODEL', '')
            or getattr(settings, 'LLM_MODEL', '')
            or getattr(settings, 'AI_MODEL', 'gpt-5.4-mini')
        )

        if not api_key:
            logger.warning("AI scoring skipped: no API key configured")
            return _fallback_scoring(resume_data, job_data)

        response = httpx.post(
            api_url,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            },
            json={
                "model": model,
                "messages": [{"role": "user", "content": prompt}],
                "response_format": {"type": "json_object"},
                "temperature": 0.3,
            },
            timeout=3.0
        )
        response.raise_for_status()
        result = response.json()
        content = result['choices'][0]['message']['content']
        score_data = json.loads(content)

        # Cache result
        if resume_id and job_id:
            cache.set(_cache_key(resume_id, job_id), score_data, CACHE_TTL)

        return score_data

    except Exception as e:
        logger.warning("AI scoring failed (%s), tripping circuit breaker for 60s", e)
        cache.set(LLM_CIRCUIT_BREAKER_KEY, True, 60)
        return _fallback_scoring(resume_data, job_data)


def _fallback_scoring(resume_data, job_data):
    """
    Rule-based fallback scoring when AI is unavailable.
    Uses simple heuristics to estimate match.
    """
    score = 55  # Base score
    strengths = []

    # Experience match (±20 points)
    try:
        r_exp = int(resume_data.get('experience') or 0)
    except (ValueError, TypeError):
        r_exp = 0
    try:
        j_exp = int(job_data.get('experience') or 0)
    except (ValueError, TypeError):
        j_exp = 0

    if r_exp >= j_exp and j_exp > 0:
        score += 20
        strengths.append(f"Kinh nghiệm làm việc đáp ứng tốt ({r_exp} năm)")
    elif r_exp >= j_exp - 1 and j_exp > 0:
        score += 10
        strengths.append(f"Kinh nghiệm tiệm cận yêu cầu vị trí ({r_exp} năm)")

    # Salary overlap (±15 points)
    try:
        r_min = float(resume_data.get('salary_min') or 0)
    except (ValueError, TypeError):
        r_min = 0.0
    try:
        r_max = float(resume_data.get('salary_max') or 0)
    except (ValueError, TypeError):
        r_max = 0.0
    try:
        j_min = float(job_data.get('salary_min') or 0)
    except (ValueError, TypeError):
        j_min = 0.0
    try:
        j_max = float(job_data.get('salary_max') or 0)
    except (ValueError, TypeError):
        j_max = 0.0

    if j_min <= r_max and r_min <= j_max and (r_max > 0 or j_max > 0):
        score += 15
        strengths.append("Mức lương kỳ vọng phù hợp với dải đãi ngộ")
    elif r_min > j_max and j_max > 0:
        score -= 10

    # Title keyword overlap (±15 points)
    r_title = str(resume_data.get('title') or '').lower()
    j_title = str(job_data.get('job_name') or '').lower()
    common_words = set(r_title.split()) & set(j_title.split())
    stopwords = {'và', 'the', 'a', 'an', '-', 'tại', 'cho', 'của', 'với', 'trong', 'về'}
    meaningful = common_words - stopwords
    if len(meaningful) >= 2:
        score += 15
        strengths.append("Chức danh và chuyên môn khớp chặt chẽ")
    elif len(meaningful) >= 1:
        score += 8
        strengths.append("Chuyên môn phù hợp ngành nghề")

    # Skills overlap (±10 points)
    r_skills = str(resume_data.get('skills') or '').lower()
    if r_skills and j_title:
        skill_matches = [w for w in j_title.split() if len(w) > 2 and w in r_skills]
        if skill_matches:
            score += 10
            strengths.append("Bộ kỹ năng đáp ứng yêu cầu công việc")

    score = max(35, min(95, score))

    return {
        "overall_score": score,
        "skill_match": score,
        "experience_match": min(100, int((r_exp / max(j_exp, 1)) * 100)) if j_exp else 80,
        "salary_match": 85 if (j_min <= r_max and r_min <= j_max) else 60,
        "strengths": strengths,
        "gaps": [],
        "recommendation": "Độ tương thích hồ sơ được tính toán nhanh theo tiêu chuẩn JD và dữ liệu ứng viên."
    }


def score_job_application(activity):
    """Convenience wrapper to score a JobPostActivity instance."""
    resume = getattr(activity, "resume", None)
    manual = getattr(activity, "manual_candidate_profile", None)
    job = getattr(activity, "job_post", None)

    title = ""
    if resume and resume.title:
        title = resume.title
    elif manual and manual.title:
        title = manual.title
    elif getattr(activity, "full_name", None):
        title = activity.full_name

    skills = ""
    if resume and getattr(resume, "skills_summary", None):
        skills = resume.skills_summary
    elif manual and getattr(manual, "skills_summary", None):
        skills = manual.skills_summary

    experience = 0
    if resume and getattr(resume, "experience", None) is not None:
        experience = resume.experience
    elif manual and getattr(manual, "experience", None) is not None:
        experience = manual.experience

    academic_level = 0
    if resume and getattr(resume, "academic_level", None) is not None:
        academic_level = resume.academic_level
    elif manual and getattr(manual, "academic_level", None) is not None:
        academic_level = manual.academic_level

    salary_min = getattr(resume, "salary_min", 0) if resume else 0
    salary_max = getattr(resume, "salary_max", 0) if resume else 0

    resume_data = {
        "title": title,
        "skills": skills,
        "experience": experience,
        "academic_level": academic_level,
        "salary_min": salary_min,
        "salary_max": salary_max,
    }
    job_data = {
        "job_name": getattr(job, "job_name", "") if job else "",
        "description": getattr(job, "job_description", "") if job else "",
        "experience": getattr(job, "experience", 0) if job else 0,
        "salary_min": getattr(job, "salary_min", 0) if job else 0,
        "salary_max": getattr(job, "salary_max", 0) if job else 0,
    }
    resume_id = getattr(resume, "id", None) if resume else None
    job_id = getattr(job, "id", None) if job else None
    res = score_resume_job_fit(resume_data, job_data, resume_id=resume_id, job_id=job_id)
    if isinstance(res, dict) and res.get("overall_score") is not None:
        return {
            "score": res.get("overall_score"),
            "summary": res.get("recommendation", ""),
        }
    return {"score": None, "summary": ""}
