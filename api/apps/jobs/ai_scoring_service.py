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
- Mô tả: {job_data.get('description', 'N/A')[:500]}
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

    prompt = build_scoring_prompt(resume_data, job_data)

    try:
        api_key = getattr(settings, 'OPENAI_API_KEY', '') or \
                  getattr(settings, 'AI_API_KEY', '')
        api_url = getattr(settings, 'OPENAI_API_URL', 'https://api.openai.com/v1/chat/completions')
        model = getattr(settings, 'AI_MODEL', 'gpt-4o-mini')

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
            timeout=30.0
        )
        response.raise_for_status()
        result = response.json()
        content = result['choices'][0]['message']['content']
        score_data = json.loads(content)

        # Cache result
        if resume_id and job_id:
            cache.set(_cache_key(resume_id, job_id), score_data, CACHE_TTL)

        return score_data

    except (httpx.HTTPError, json.JSONDecodeError, KeyError) as e:
        logger.error("AI scoring failed: %s", e)
        return _fallback_scoring(resume_data, job_data)


def _fallback_scoring(resume_data, job_data):
    """
    Rule-based fallback scoring when AI is unavailable.
    Uses simple heuristics to estimate match.
    """
    score = 50  # Base score

    # Experience match (±20 points)
    r_exp = resume_data.get('experience', 0) or 0
    j_exp = job_data.get('experience', 0) or 0
    if r_exp >= j_exp:
        score += 20
    elif r_exp >= j_exp - 1:
        score += 10

    # Salary overlap (±15 points)
    r_min = float(resume_data.get('salary_min', 0) or 0)
    r_max = float(resume_data.get('salary_max', 0) or 0)
    j_min = float(job_data.get('salary_min', 0) or 0)
    j_max = float(job_data.get('salary_max', 0) or 0)
    if j_min <= r_max and r_min <= j_max:
        score += 15
    elif r_min > j_max:
        score -= 10

    # Title keyword overlap (±15 points)
    r_title = (resume_data.get('title', '') or '').lower()
    j_title = (job_data.get('job_name', '') or '').lower()
    common_words = set(r_title.split()) & set(j_title.split())
    stopwords = {'và', 'the', 'a', 'an', '-', 'tại', 'cho'}
    meaningful = common_words - stopwords
    if len(meaningful) >= 2:
        score += 15
    elif len(meaningful) >= 1:
        score += 8

    score = max(0, min(100, score))

    return {
        "overall_score": score,
        "skill_match": score,
        "experience_match": min(100, int((r_exp / max(j_exp, 1)) * 100)),
        "salary_match": 80 if (j_min <= r_max and r_min <= j_max) else 40,
        "strengths": [],
        "gaps": [],
        "recommendation": "Điểm được tính bằng thuật toán cơ bản (AI không khả dụng)."
    }
