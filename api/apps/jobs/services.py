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


class JobPostService:
    """Business logic for Job Posts."""

    @staticmethod
    def get_active_jobs(filters=None, user=None):
        """Get all active, non-expired job posts with optimized queries."""
        queryset = (
            JobPost.objects
            .select_related('company', 'company__logo', 'career', 'location', 'user')
            .filter(
                status=var_sys.JobPostStatus.APPROVED,
                deadline__gte=timezone.now().date()
            )
            .order_by('-update_at', '-id')
        )

        if user and user.is_authenticated:
            queryset = queryset.prefetch_related(
                Prefetch(
                    'savedjobpost_set',
                    queryset=JobPost.saved_job_posts.through.objects.filter(user=user)
                ),
                Prefetch(
                    'jobpostactivity_set',
                    queryset=JobPostActivity.objects.filter(user=user)
                ),
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
    def create_job(user, validated_data):
        """Creates a new job post."""
        # Ensure company is linked
        if not hasattr(user, 'company'):
            raise ValueError("Người dùng chưa có thông tin công ty.")

        job_post = JobPost.objects.create(
            user=user,
            company=user.company,
            **validated_data
        )
        return job_post

    @staticmethod
    @transaction.atomic
    def update_job(user, job_post, validated_data):
        """Updates an existing job post."""
        old_status = job_post.status

        for attr, value in validated_data.items():
            setattr(job_post, attr, value)

        job_post.save()

        # Trigger notifications if status changes from APPROVED to something else that requires re-verification
        if old_status == var_sys.JobPostStatus.APPROVED and job_post.status != var_sys.JobPostStatus.APPROVED:
            from shared.helpers import helper
            helper.add_post_verify_required_notifications(
                company=user.company,
                job_post=job_post,
            )

        return job_post


class JobActivityService:
    """Business logic for Job Applications and Saves."""

    @staticmethod
    @transaction.atomic
    def apply_to_job(user, validated_data):
        """
        Apply to a job post. Returns activity object.
        Business rules:
        - Job must be active and not expired
        - User cannot apply twice to the same job
        - Resume must belong to the user
        """
        job_post = validated_data.get('job_post')
        resume = validated_data.get('resume')

        if job_post.status != var_sys.JobPostStatus.APPROVED:
            raise ValueError("Tin tuyển dụng không còn hoạt động.")

        if hasattr(timezone, 'localdate'):
            current_date = timezone.localdate()
        else:
            current_date = timezone.now().date()

        if job_post.deadline < current_date:
            raise ValueError("Tin tuyển dụng đã hết hạn.")

        if resume and resume.user != user:
            raise ValueError("CV không thuộc về bạn.")

        existing = JobPostActivity.objects.filter(
            user=user, job_post=job_post
        ).exists()
        if existing:
            raise ValueError("Bạn đã ứng tuyển vào vị trí này rồi.")

        activity = JobPostActivity.objects.create(
            user=user,
            **validated_data,
            status=var_sys.ApplicationStatus.PENDING_CONFIRMATION
        )

        logger.info(
            "User %s applied to job %s (company: %s)",
            user.email, job_post.job_name, job_post.company.company_name
        )

        from django.conf import settings
        from shared.helpers import helper
        
        if settings.AI_RESUME_AUTO_ANALYZE:
            try:
                from apps.jobs.tasks import analyze_resume_ai
                activity.ai_analysis_status = 'processing'
                activity.ai_analysis_progress = 5
                activity.save()
                analyze_resume_ai.delay(activity.id)
            except Exception as ex:
                helper.print_log_error("auto analyze resume", ex)

        company = job_post.company
        domain = settings.DOMAIN_CLIENT["job_seeker"]

        subject = f"Xác nhận ứng tuyển: {job_post.job_name}"
        to = [user.email]
        data = {
            "full_name": user.full_name,
            "company_name": company.company_name,
            "job_name": job_post.job_name,
            "find_job_post_link": domain + "viec-lam",
        }

        from console.jobs import queue_mail
        queue_mail.send_email_confirm_application.delay(to=to, subject=subject, data=data)

        helper.add_apply_job_notifications(job_post_activity=activity)

        return activity

    @staticmethod
    @transaction.atomic
    def toggle_save_job(user, job_post):
        """Toggles the 'saved' status of a job post for a user."""
        from apps.jobs.models import SavedJobPost
        saved_job, created = SavedJobPost.objects.get_or_create(
            user=user, job_post=job_post
        )

        if not created:
            saved_job.delete()
            return False  # Not saved anymore

        return True  # Now saved

    @staticmethod
    @transaction.atomic
    def change_application_status(activity, new_status):
        from shared.configs import variable_system as var_sys
        from shared.configs.messages import APPLICATION_STATUS_MESSAGES
        from shared.helpers import helper

        if activity.status > new_status:
            raise ValueError("Cannot revert application status backwards arbitrarily.")

        activity.status = new_status
        activity.save()

        notification_title = activity.job_post.company.company_name
        status_label = ""
        for x in var_sys.APPLICATION_STATUS:
            if x[0] == new_status:
                status_label = x[1]
                break

        notification_content = APPLICATION_STATUS_MESSAGES["STATUS_UPDATED"].format(
            job_name=activity.job_post.job_name,
            status=status_label,
        )

        logo = activity.job_post.company.logo
        company_logo_url = logo.get_full_url() if logo else var_sys.AVATAR_DEFAULT["COMPANY_LOGO"]

        helper.add_apply_status_notifications(
            notification_title,
            notification_content,
            company_logo_url,
            activity.user_id,
        )
        return activity

    @staticmethod
    def send_email_to_job_seeker(activity, user, validated_data):
        from shared.configs import variable_system as var_sys
        from console.jobs import queue_mail

        company = user.company
        to = [validated_data.get("email")]
        is_send_me = validated_data.get("isSendMe", False)

        if is_send_me:
            to.append(user.email)

        email_data = {
            'content': validated_data.get("content"),
            'company_image': company.logo.get_full_url()
            if company.logo
            else var_sys.AVATAR_DEFAULT["COMPANY_LOGO"],
            'company_name': company.company_name,
            'company_phone': company.company_phone,
            'company_email': company.company_email,
            'company_address': getattr(company.location, 'address', "") if company.location else "",
            'company_website_url': company.website_url,
        }

        queue_mail.send_email_reply_job_seeker_task.delay(
            to=to,
            subject=validated_data.get("title"),
            data=email_data,
        )

        activity.is_sent_email = True
        activity.save()

    @staticmethod
    def trigger_ai_analysis(activity):
        from apps.jobs.tasks import analyze_resume_ai
        
        activity.ai_analysis_status = 'processing'
        activity.ai_analysis_progress = 5
        activity.save()
        analyze_resume_ai.delay(activity.id)

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
