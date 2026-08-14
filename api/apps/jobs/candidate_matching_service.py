from __future__ import annotations

import logging
from typing import List
from django.db.models import Q

from apps.jobs.models import JobPost, JobPostActivity
from apps.profiles.models import Resume
from apps.profiles.services.vieclam24h_import import persist_vieclam24h_candidates
from apps.profiles.services.vieclam24h_import_browser import collect_vieclam24h_candidates
from apps.content.system_settings import get_system_setting
from shared.configs import variable_system as var_sys

logger = logging.getLogger(__name__)


def match_and_source_candidates_for_job(job_post: JobPost, target_limit: int | None = None) -> List[JobPostActivity]:
    """
    Find matching candidates in Candidate Data Lake (Resume DB).
    If lake has fewer candidates than target_limit, automatically search and purchase CVs
    from Vieclam24h using the shared system account.
    Returns the created/associated JobPostActivity records for this job_post.
    """
    limit = target_limit if target_limit is not None else getattr(job_post, "auto_sourcing_limit", 10)
    existing_activities = JobPostActivity.objects.filter(job_post=job_post, is_deleted=False)
    existing_user_ids = set(existing_activities.values_list("user_id", flat=True))

    activities: List[JobPostActivity] = list(existing_activities)

    # 1. Query existing Data Lake (Resume DB)
    data_lake_resumes = Resume.objects.filter(is_active=True).exclude(user_id__in=existing_user_ids)
    if job_post.career_id:
        data_lake_resumes = data_lake_resumes.filter(career_id=job_post.career_id)
    if job_post.location and job_post.location.city_id:
        data_lake_resumes = data_lake_resumes.filter(
            Q(city_id=job_post.location.city_id) | Q(job_seeker_profile__location__city_id=job_post.location.city_id)
        )

    lake_matches = list(data_lake_resumes.select_related("user", "job_seeker_profile")[:limit])

    for resume in lake_matches:
        if len(activities) >= limit:
            break
        user = resume.user
        if not user or user.id in existing_user_ids:
            continue

        activity, created = JobPostActivity.objects.get_or_create(
            job_post=job_post,
            user=user,
            defaults={
                "resume": resume,
                "full_name": user.full_name,
                "email": user.email,
                "phone": getattr(resume.job_seeker_profile, "phone", None) or getattr(user, "phone", None),
                "status": var_sys.ApplicationStatus.PENDING_CONFIRMATION,
            },
        )
        if created:
            existing_user_ids.add(user.id)
            activities.append(activity)

    # 2. If Data Lake does not have enough candidates, directly fetch & purchase from Vieclam24h
    needed = limit - len(activities)
    if needed > 0 and getattr(job_post, "is_auto_sourcing_enabled", True):
        username = str(get_system_setting("vieclam24hSharedUsername", "") or "").strip()
        password = str(get_system_setting("vieclam24hSharedPassword", "") or "").strip()

        if username and password:
            try:
                logger.info("Auto-sourcing %d candidates from Vieclam24h for JobPost %s (%s)", needed, job_post.id, job_post.job_name)
                source_url = "https://ntd.vieclam24h.vn/tim-kiem-ung-vien-nhanh"
                keyword = (job_post.job_name or "").strip()
                cands = collect_vieclam24h_candidates(
                    source_url=source_url,
                    username=username,
                    password=password,
                    keyword=keyword,
                )
                if cands:
                    target_city = job_post.location.city if job_post.location else None
                    target_district = job_post.location.district if job_post.location else None
                    import_res = persist_vieclam24h_candidates(
                        candidates=cands[:needed],
                        source_url=source_url,
                        source_account=username,
                        target_career=job_post.career,
                        target_city=target_city,
                        target_district=target_district,
                    )
                    logger.info("Imported %d new candidates from Vieclam24h for job %s", import_res.created_count, job_post.id)

                    # Re-query recently imported candidates for this job
                    fresh_resumes = Resume.objects.filter(
                        source_platform="vieclam24h"
                    ).exclude(user_id__in=existing_user_ids).order_by("-create_at")[:needed]

                    for r in fresh_resumes:
                        if len(activities) >= limit:
                            break
                        act, created = JobPostActivity.objects.get_or_create(
                            job_post=job_post,
                            user=r.user,
                            defaults={
                                "resume": r,
                                "full_name": r.user.full_name,
                                "email": r.user.email,
                                "phone": getattr(r.job_seeker_profile, "phone", None),
                                "status": var_sys.ApplicationStatus.PENDING_CONFIRMATION,
                            },
                        )
                        if created:
                            existing_user_ids.add(r.user.id)
                            activities.append(act)
            except Exception as exc:
                logger.warning("Failed direct auto-sourcing from Vieclam24h for job %s: %s", job_post.id, exc, exc_info=True)

    return activities
