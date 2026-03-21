"""
Job Recommendation Service — Scoring-based job matching for job seekers.

Uses a multi-factor scoring algorithm combining:
- Career match
- City/Location match
- Skills overlap (via AdvancedSkill model)
- Salary range compatibility
- Experience level match

Results are cached per-user in Redis (TTL 30 minutes).
"""

import logging
from datetime import date

from django.core.cache import cache
from django.db.models import Q, Case, When, IntegerField, Value

from apps.jobs.models import JobPost
from apps.profiles.models import Resume, AdvancedSkill
from shared.configs import variable_system as var_sys

logger = logging.getLogger(__name__)

CACHE_TTL = 1800  # 30 minutes


def get_recommended_jobs(user, limit=20):
    """
    Return a queryset of recommended JobPosts for a given job seeker user,
    ordered by relevance score.

    Algorithm:
    1. Fetch user's active resume(s) to extract career, city, skills, salary, experience
    2. Build a weighted query combining multiple match factors
    3. Cache per-user for CACHE_TTL seconds
    """
    cache_key = f"job_recommendations_{user.id}"
    cached_ids = cache.get(cache_key)

    if cached_ids is not None:
        # Preserve ordering from cached list
        preserved = Case(
            *[When(pk=pk, then=pos) for pos, pk in enumerate(cached_ids)],
            output_field=IntegerField(),
        )
        return (
            JobPost.objects.filter(pk__in=cached_ids)
            .select_related(
                'company', 'company__logo', 'company__cover_image',
                'location', 'location__city', 'career',
            )
            .order_by(preserved)
        )

    # 1. Gather user profile data from resumes
    resumes = Resume.objects.filter(user=user).select_related('city', 'career')
    if not resumes.exists():
        return JobPost.objects.none()

    career_ids = set()
    city_ids = set()
    experience_levels = set()
    salary_ranges = []
    user_skills = set()

    for resume in resumes:
        if resume.career_id:
            career_ids.add(resume.career_id)
        if resume.city_id:
            city_ids.add(resume.city_id)
        if resume.experience is not None:
            experience_levels.add(resume.experience)
        if resume.salary_min and resume.salary_max:
            salary_ranges.append((int(resume.salary_min), int(resume.salary_max)))

    # Get user's advanced skills
    skill_names = list(
        AdvancedSkill.objects.filter(resume__user=user)
        .values_list('name', flat=True)
        .distinct()
    )
    user_skills = set(s.lower().strip() for s in skill_names)

    # 2. Base queryset — only approved, non-expired jobs
    base_qs = (
        JobPost.objects.filter(
            status=var_sys.JobPostStatus.APPROVED,
            deadline__gte=date.today(),
        )
        .select_related(
            'company', 'company__logo', 'company__cover_image',
            'location', 'location__city', 'career',
        )
    )

    # 3. Multi-factor scoring via annotation
    # Weight: career=40, city=25, experience=20, salary=15
    annotations = {}

    # Career match (40 points)
    if career_ids:
        annotations['career_score'] = Case(
            When(career_id__in=career_ids, then=Value(40)),
            default=Value(0),
            output_field=IntegerField(),
        )
    else:
        annotations['career_score'] = Value(0, output_field=IntegerField())

    # City match (25 points)
    if city_ids:
        annotations['city_score'] = Case(
            When(location__city_id__in=city_ids, then=Value(25)),
            default=Value(0),
            output_field=IntegerField(),
        )
    else:
        annotations['city_score'] = Value(0, output_field=IntegerField())

    # Experience match (20 points)
    if experience_levels:
        annotations['exp_score'] = Case(
            When(experience__in=experience_levels, then=Value(20)),
            default=Value(0),
            output_field=IntegerField(),
        )
    else:
        annotations['exp_score'] = Value(0, output_field=IntegerField())

    # Salary overlap (15 points) — at least partial overlap
    salary_q = Q()
    for sal_min, sal_max in salary_ranges:
        salary_q |= Q(salary_min__lte=sal_max, salary_max__gte=sal_min)

    if salary_ranges:
        annotations['salary_score'] = Case(
            When(salary_q, then=Value(15)),
            default=Value(0),
            output_field=IntegerField(),
        )
    else:
        annotations['salary_score'] = Value(0, output_field=IntegerField())

    queryset = (
        base_qs
        .annotate(**annotations)
        .annotate(
            relevance_score=(
                annotations.get('career_score', Value(0))
            ),
        )
        .order_by('-relevance_score', '-is_hot', '-is_urgent', '-create_at')
    )

    # Filter to only jobs with at least some relevance
    if career_ids or city_ids:
        filter_q = Q()
        if career_ids:
            filter_q |= Q(career_id__in=career_ids)
        if city_ids:
            filter_q |= Q(location__city_id__in=city_ids)
        queryset = queryset.filter(filter_q)

    result_ids = list(queryset.values_list('id', flat=True)[:limit])

    # Cache the result IDs
    cache.set(cache_key, result_ids, CACHE_TTL)

    return queryset[:limit]


def invalidate_recommendations(user_id):
    """Call this when user updates resume or applies to a job."""
    cache.delete(f"job_recommendations_{user_id}")
