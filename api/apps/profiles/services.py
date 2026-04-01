"""
Service Layer for the Profiles app.
Encapsulates business logic for resumes, companies, and profiles.
"""
import logging

from django.db import transaction
from django.db.models import Count, Q, QuerySet
from typing import Optional, Tuple, Dict, Any, Union

from apps.profiles.models import (
    Resume, Company, CompanyFollowed,
    ResumeViewed, ResumeSaved
)

logger = logging.getLogger(__name__)


class ResumeService:
    """Business logic for Resume operations."""

    @staticmethod
    def get_optimized_resume_queryset() -> QuerySet[Resume]:
        """Return a fully optimized Resume queryset with all related data."""
        return (
            Resume.objects
            .select_related(
                'user', 'user__avatar', 'city', 'career',
                'file', 'job_seeker_profile'
            )
            .prefetch_related(
                'education_details',
                'experience_details',
                'certificates',
                'language_skills',
                'advanced_skills',
            )
        )

    @staticmethod
    def get_active_resumes(career_id: Optional[int] = None, city_id: Optional[int] = None) -> QuerySet[Resume]:
        """Get active resumes with optional filters."""
        queryset = ResumeService.get_optimized_resume_queryset().filter(
            is_active=True
        )
        if career_id:
            queryset = queryset.filter(career_id=career_id)
        if city_id:
            queryset = queryset.filter(city_id=city_id)
        return queryset.order_by('-update_at')

    @staticmethod
    @transaction.atomic
    def toggle_save_resume(company: Company, resume: Resume) -> Tuple[bool, str]:
        """
        Toggle save/unsave a resume for a company.
        Returns (saved: bool, message: str).
        """
        existing = ResumeSaved.objects.filter(
            company=company, resume=resume
        ).first()

        if existing:
            existing.delete()
            return False, "Đã bỏ lưu hồ sơ."

        ResumeSaved.objects.create(company=company, resume=resume)
        return True, "Đã lưu hồ sơ."

    @staticmethod
    def record_resume_view(company: Company, resume: Resume) -> bool:
        """Record that a company viewed a resume (idempotent)."""
        _, created = ResumeViewed.objects.get_or_create(
            company=company, resume=resume
        )
        return created


class CompanyService:
    """Business logic for Company operations."""

    @staticmethod
    def get_optimized_company_queryset() -> QuerySet[Company]:
        """Return a fully optimized Company queryset."""
        return (
            Company.objects
            .select_related('user', 'logo', 'cover_image', 'location', 'location__city')
            .annotate(
                follower_count=Count('companyfollowed', distinct=True),
                job_count=Count('job_posts', filter=Q(job_posts__status=1), distinct=True),
            )
        )

    @staticmethod
    @transaction.atomic
    def toggle_follow(user: Any, company: Company) -> Tuple[bool, str]:
        """
        Toggle follow/unfollow a company.
        Returns (is_following: bool, message: str).
        """
        existing = CompanyFollowed.objects.filter(
            user=user, company=company
        ).first()

        if existing:
            existing.delete()
            return False, "Đã bỏ theo dõi công ty."

        CompanyFollowed.objects.create(user=user, company=company)
        return True, "Đã theo dõi công ty."

    @staticmethod
    def get_company_stats(company: Company) -> Dict[str, int]:
        """Get company profile statistics."""
        from apps.jobs.models import JobPost, JobPostActivity

        return {
            'total_followers': CompanyFollowed.objects.filter(company=company).count(),
            'total_jobs': JobPost.objects.filter(company=company).count(),
            'total_applications': JobPostActivity.objects.filter(
                job_post__company=company
            ).count(),
            'resumes_saved': ResumeSaved.objects.filter(company=company).count(),
            'resumes_viewed': ResumeViewed.objects.filter(company=company).count(),
        }
