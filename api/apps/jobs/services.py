"""
Service Layer for the Jobs app.
Encapsulates business logic separate from views/serializers.
"""
import logging

from django.db import transaction
from django.db.models import Q
from django.utils import timezone

from apps.jobs.models import JobPost, JobPostActivity
from shared.configs import variable_system as var_sys

logger = logging.getLogger(__name__)


class JobService:
    """Business logic for Job Posts."""

    @staticmethod
    def get_active_jobs(filters=None):
        """Get all active, non-expired job posts with optimized queries."""
        queryset = (
            JobPost.objects
            .select_related('company', 'company__logo', 'career', 'location', 'user')
            .filter(
                status=var_sys.JobPostStatus.APPROVED,
                deadline__gte=timezone.now().date()
            )
            .order_by('-update_at')
        )
        if filters:
            if filters.get('career_id'):
                queryset = queryset.filter(career_id=filters['career_id'])
            if filters.get('city_id'):
                queryset = queryset.filter(location__city_id=filters['city_id'])
            if filters.get('experience'):
                queryset = queryset.filter(experience=filters['experience'])
            if filters.get('salary_min'):
                queryset = queryset.filter(salary_max__gte=filters['salary_min'])
            if filters.get('keyword'):
                keyword = filters['keyword']
                queryset = queryset.filter(
                    Q(job_name__icontains=keyword) |
                    Q(company__company_name__icontains=keyword)
                )
        return queryset

    @staticmethod
    @transaction.atomic
    def apply_to_job(user, job_post, resume):
        """
        Apply to a job post. Returns (activity, error_message).
        Business rules:
        - Job must be active and not expired
        - User cannot apply twice to the same job
        - Resume must belong to the user
        """
        if job_post.status != var_sys.JobPostStatus.APPROVED:
            return None, "Tin tuyển dụng không còn hoạt động."

        if job_post.deadline < timezone.now().date():
            return None, "Tin tuyển dụng đã hết hạn."

        if resume.user != user:
            return None, "CV không thuộc về bạn."

        existing = JobPostActivity.objects.filter(
            user=user, job_post=job_post
        ).exists()
        if existing:
            return None, "Bạn đã ứng tuyển vào vị trí này rồi."

        activity = JobPostActivity.objects.create(
            user=user,
            job_post=job_post,
            resume=resume,
            full_name=user.full_name,
            email=user.email,
            status=var_sys.ApplicationStatus.PENDING_CONFIRMATION
        )

        logger.info(
            "User %s applied to job %s (company: %s)",
            user.email, job_post.job_name, job_post.company.company_name
        )
        return activity, None

    @staticmethod
    def get_employer_job_stats(company):
        """Get statistics for an employer's jobs."""
        jobs = JobPost.objects.filter(company=company)
        today = timezone.now().date()

        return {
            'total_jobs': jobs.count(),
            'active_jobs': jobs.filter(
                status=var_sys.JobPostStatus.APPROVED,
                deadline__gte=today
            ).count(),
            'expired_jobs': jobs.filter(deadline__lt=today).count(),
            'total_applications': JobPostActivity.objects.filter(
                job_post__company=company
            ).count(),
            'pending_applications': JobPostActivity.objects.filter(
                job_post__company=company,
                status=var_sys.ApplicationStatus.PENDING_CONFIRMATION
            ).count(),
        }
