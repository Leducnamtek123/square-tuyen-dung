from __future__ import annotations

import logging
from django.db import transaction

from apps.jobs.models import JobPost, JobPostActivity
from apps.jobs.candidate_matching_service import match_and_source_candidates_for_job
from apps.jobs.ai_scoring_service import score_job_application
from apps.interviews.tasks import auto_schedule_screening_interview
from shared.configs import variable_system as var_sys

logger = logging.getLogger(__name__)


def run_full_auto_recruitment_pipeline(job_post_id: int) -> dict[str, int]:
    """
    Executes the end-to-end automated recruitment pipeline for a job post:
    1. Match candidates from Central Data Lake / fetch from Vieclam24h.
    2. Screen and score CVs against job criteria with AI.
    3. Trigger automated AI interview sessions for candidates passing min_screening_score.
    """
    try:
        job_post = JobPost.objects.select_related("career", "location", "interview_template", "company").get(id=job_post_id)
    except JobPost.DoesNotExist:
        logger.error("JobPost %s not found for auto recruitment pipeline", job_post_id)
        return {"matched": 0, "screened": 0, "interviewed": 0}

    if not getattr(job_post, "is_auto_sourcing_enabled", True):
        logger.info("Auto sourcing is disabled for JobPost %s", job_post_id)
        return {"matched": 0, "screened": 0, "interviewed": 0}

    # 1. Match & Source Candidates
    activities = match_and_source_candidates_for_job(job_post)
    matched_count = len(activities)
    screened_count = 0
    interviewed_count = 0

    min_score = getattr(job_post, "min_screening_score", 70)

    # 2. AI Screening & Scoring
    for activity in activities:
        try:
            # Score application using AI scoring service if resume is present
            score = activity.ai_analysis_score
            if score is None:
                if activity.resume or activity.user:
                    try:
                        score_result = score_job_application(activity)
                        if isinstance(score_result, dict):
                            score = score_result.get("score")
                            activity.ai_analysis_score = score
                            activity.ai_analysis_summary = score_result.get("summary", "")
                            activity.save(update_fields=["ai_analysis_score", "ai_analysis_summary", "update_at"])
                    except Exception as score_exc:
                        logger.warning("Failed AI scoring for JobPostActivity %s: %s", activity.id, score_exc)
                        score = None

            screened_count += 1

            # 3. Trigger Auto AI Interview if candidate score meets threshold
            if (score or 0) >= min_score and getattr(job_post, "auto_interview_enabled", True):
                if activity.status in (var_sys.ApplicationStatus.PENDING_CONFIRMATION, var_sys.ApplicationStatus.CONTACTED):
                    activity.status = var_sys.ApplicationStatus.CONTACTED
                    activity.save(update_fields=["status", "update_at"])

                auto_schedule_screening_interview.delay(activity.id)
                interviewed_count += 1
        except Exception as act_exc:
            logger.exception("Error processing auto pipeline for activity %s: %s", activity.id, act_exc)

    logger.info(
        "Auto recruitment pipeline completed for JobPost %s: matched=%d, screened=%d, interviewed=%d",
        job_post_id,
        matched_count,
        screened_count,
        interviewed_count,
    )
    return {
        "matched": matched_count,
        "screened": screened_count,
        "interviewed": interviewed_count,
    }
