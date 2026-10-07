"""
AI Scoring Service — evaluates resume-job fit using LLM.
Provides a structured score and reasons for matching.
"""
import hashlib
import json
import logging

from django.conf import settings
from django.core.cache import cache

import httpx

from apps.common.decision_engine.engine import CvTriageEngine

logger = logging.getLogger(__name__)

CACHE_TTL = 3600  # 1 hour
LLM_CIRCUIT_BREAKER_KEY = "ai_scoring_llm_unavailable"
CIRCUIT_BREAKER_DURATION_SECONDS = 60
LLM_REQUEST_TIMEOUT_SECONDS = 3.0
LLM_TEMPERATURE = 0.3
DEFAULT_LLM_MODEL = "gpt-5.4-mini"
DEFAULT_OPENAI_API_URL = "https://api.openai.com/v1"

# Scoring weights and thresholds
WEIGHT_SKILL = 0.7
WEIGHT_EXP = 0.15
WEIGHT_SALARY = 0.15
MIN_OVERALL_SCORE = 20.0
MAX_OVERALL_SCORE = 98.0
DEFAULT_FALLBACK_SKILL_SCORE = 55.0
DEFAULT_EXP_MATCH_NO_REQUIREMENT = 85
SALARY_MATCH_OPTIMAL = 85
SALARY_MATCH_OVER_BUDGET = 40
SALARY_MATCH_DEFAULT = 70
DEFAULT_NUMERIC_ZERO = 0.0


def _cache_key(resume_id, job_id):
    """Generate a unique cache key for a resume-job pair."""
    raw = f"ai_score:{resume_id}:{job_id}"
    return hashlib.md5(raw.encode(), usedforsecurity=False).hexdigest()


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


def _resolve_llm_config():
    """Resolve API key, endpoint URL, and model name from Django settings."""
    api_key = (
        getattr(settings, "AI_LLM_API_KEY", "")
        or getattr(settings, "LLM_API_KEY", "")
        or getattr(settings, "OPENAI_API_KEY", "")
        or getattr(settings, "AI_API_KEY", "")
    )
    base_url = (
        getattr(settings, "AI_LLM_BASE_URL", "")
        or getattr(settings, "LLM_BASE_URL", "")
        or getattr(settings, "OPENAI_API_URL", DEFAULT_OPENAI_API_URL)
    ).rstrip("/")
    api_url = f"{base_url}/chat/completions" if not base_url.endswith("/chat/completions") else base_url
    model = (
        getattr(settings, "AI_LLM_MODEL", "")
        or getattr(settings, "LLM_MODEL", "")
        or getattr(settings, "AI_MODEL", DEFAULT_LLM_MODEL)
    )
    return api_key, api_url, model


def _parse_llm_response(response_data: dict) -> dict:
    """Parse structured JSON scoring payload from LLM response."""
    content = response_data["choices"][0]["message"]["content"]
    return json.loads(content)


def _call_llm_api(api_url: str, api_key: str, model: str, prompt: str) -> dict:
    """Execute synchronous HTTP request to LLM endpoint and return parsed score data."""
    response = httpx.post(
        api_url,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        json={
            "model": model,
            "messages": [{"role": "user", "content": prompt}],
            "response_format": {"type": "json_object"},
            "temperature": LLM_TEMPERATURE,
        },
        timeout=LLM_REQUEST_TIMEOUT_SECONDS,
    )
    response.raise_for_status()
    return _parse_llm_response(response.json())


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
    if resume_id and job_id:
        cached = cache.get(_cache_key(resume_id, job_id))
        if cached:
            logger.debug("AI score cache hit for resume=%s job=%s", resume_id, job_id)
            return cached

    # Fast circuit breaker: If remote LLM is temporarily down or timing out, skip remote call
    if cache.get(LLM_CIRCUIT_BREAKER_KEY):
        return _fallback_scoring(resume_data, job_data)

    prompt = build_scoring_prompt(resume_data, job_data)

    try:
        api_key, api_url, model = _resolve_llm_config()
        if not api_key:
            logger.warning("AI scoring skipped: no API key configured")
            return _fallback_scoring(resume_data, job_data)

        score_data = _call_llm_api(api_url, api_key, model, prompt)

        if resume_id and job_id:
            cache.set(_cache_key(resume_id, job_id), score_data, CACHE_TTL)

        return score_data

    except Exception as e:
        logger.warning("AI scoring failed (%s), tripping circuit breaker for 60s", e)
        cache.set(LLM_CIRCUIT_BREAKER_KEY, True, CIRCUIT_BREAKER_DURATION_SECONDS)
        return _fallback_scoring(resume_data, job_data)


def _calculate_skill_match(resume_data, job_data):
    """Evaluate multi-criteria skill, education, and title match using CvTriageEngine."""
    cand_summary = {
        "title": resume_data.get("title", ""),
        "skills": resume_data.get("skills", ""),
        "experience_years": resume_data.get("experience", 0),
        "education": str(resume_data.get("academic_level", "")),
        "summary": resume_data.get("summary", ""),
        "raw_text": f"{resume_data.get('title', '')} {resume_data.get('skills', '')}",
    }
    job_req = {
        "job_title": job_data.get("job_name", ""),
        "skills": job_data.get("skills") or job_data.get("required_skills") or job_data.get("description", ""),
        "min_experience_years": job_data.get("experience", 0),
        "education_level": str(job_data.get("academic_level", "")),
    }

    try:
        triage_verdict = CvTriageEngine.triage(cand_summary, job_req)
        return (
            triage_verdict.score,
            list(triage_verdict.matched_criteria),
            list(triage_verdict.missing_criteria),
            triage_verdict.summary,
        )
    except Exception as exc:
        logger.warning("CvTriageEngine triage error in fallback scoring: %s", exc)
        return (
            DEFAULT_FALLBACK_SKILL_SCORE,
            [],
            [],
            "Độ tương thích hồ sơ được ước lượng cơ bản.",
        )


def _calculate_exp_match(resume_data, job_data):
    """Calculate experience match percentage between resume and job."""
    try:
        r_exp = float(resume_data.get("experience") or 0)
    except (ValueError, TypeError):
        r_exp = DEFAULT_NUMERIC_ZERO
    try:
        j_exp = float(job_data.get("experience") or 0)
    except (ValueError, TypeError):
        j_exp = DEFAULT_NUMERIC_ZERO

    if j_exp > 0:
        return min(100, int((r_exp / max(j_exp, 1.0)) * 100))
    return DEFAULT_EXP_MATCH_NO_REQUIREMENT


def _calculate_salary_match(resume_data, job_data):
    """Calculate salary range overlap score and note strengths or gaps."""
    try:
        r_min = float(resume_data.get("salary_min") or 0)
        r_max = float(resume_data.get("salary_max") or 0)
        j_min = float(job_data.get("salary_min") or 0)
        j_max = float(job_data.get("salary_max") or 0)
    except (ValueError, TypeError):
        r_min = r_max = j_min = j_max = DEFAULT_NUMERIC_ZERO

    salary_strengths = []
    salary_gaps = []

    if j_min <= r_max and r_min <= j_max and (r_max > 0 or j_max > 0):
        salary_match = SALARY_MATCH_OPTIMAL
        salary_strengths.append("Mức lương kỳ vọng phù hợp với dải đãi ngộ công ty")
    elif r_min > j_max and j_max > 0:
        salary_match = SALARY_MATCH_OVER_BUDGET
        salary_gaps.append(f"Mức lương mong muốn ({r_min:,.0f}) cao hơn ngân sách vị trí ({j_max:,.0f})")
    else:
        salary_match = SALARY_MATCH_DEFAULT

    return salary_match, salary_strengths, salary_gaps


def _fallback_scoring(resume_data, job_data):
    """
    openJev System 1 calibrated fallback scoring when LLM is unavailable or circuit-broken.
    Uses CvTriageEngine for multi-criteria skill, experience, education matching combined with salary evaluation.
    """
    score, strengths, gaps, recommendation = _calculate_skill_match(resume_data, job_data)
    exp_match = _calculate_exp_match(resume_data, job_data)
    salary_match, salary_strengths, salary_gaps = _calculate_salary_match(resume_data, job_data)

    strengths.extend(salary_strengths)
    gaps.extend(salary_gaps)

    overall_score = round(
        score * WEIGHT_SKILL + exp_match * WEIGHT_EXP + salary_match * WEIGHT_SALARY, 1
    )
    overall_score = max(MIN_OVERALL_SCORE, min(MAX_OVERALL_SCORE, overall_score))

    return {
        "overall_score": overall_score,
        "skill_match": round(score, 1),
        "experience_match": exp_match,
        "salary_match": salary_match,
        "strengths": strengths,
        "gaps": gaps,
        "recommendation": recommendation,
    }


def _extract_candidate_field(resume, manual, field_name, default=None):
    """Extract a candidate attribute prioritizing resume, then manual profile."""
    if resume and getattr(resume, field_name, None) is not None:
        return getattr(resume, field_name)
    if manual and getattr(manual, field_name, None) is not None:
        return getattr(manual, field_name)
    return default


def _extract_application_data(activity):
    """Extract normalized resume_data, job_data, and IDs from a JobPostActivity."""
    resume = getattr(activity, "resume", None)
    manual = getattr(activity, "manual_candidate_profile", None)
    job = getattr(activity, "job_post", None)

    title = (
        getattr(resume, "title", None)
        or getattr(manual, "title", None)
        or getattr(activity, "full_name", "")
        or ""
    )
    skills = _extract_candidate_field(resume, manual, "skills_summary", default="")
    experience = _extract_candidate_field(resume, manual, "experience", default=0)
    academic_level = _extract_candidate_field(resume, manual, "academic_level", default=0)

    resume_data = {
        "title": title,
        "skills": skills,
        "experience": experience,
        "academic_level": academic_level,
        "salary_min": getattr(resume, "salary_min", 0) if resume else 0,
        "salary_max": getattr(resume, "salary_max", 0) if resume else 0,
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

    return resume_data, job_data, resume_id, job_id


def score_job_application(activity):
    """Convenience wrapper to score a JobPostActivity instance."""
    resume_data, job_data, resume_id, job_id = _extract_application_data(activity)
    res = score_resume_job_fit(resume_data, job_data, resume_id=resume_id, job_id=job_id)
    if isinstance(res, dict) and res.get("overall_score") is not None:
        return {
            "score": res.get("overall_score"),
            "summary": res.get("recommendation", ""),
        }
    return {"score": None, "summary": ""}
