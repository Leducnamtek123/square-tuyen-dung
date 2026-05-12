"""
Unit tests for the Jobs app — services, models, and API endpoints.
"""
import pytest
from datetime import timedelta
from unittest.mock import patch, MagicMock

from django.utils import timezone
from django.test import TestCase

from apps.jobs.models import JobPost, JobPostActivity
from apps.jobs.serializers import JobSeekerJobPostActivitySerializer
from apps.jobs.services import JobPostService, JobActivityService
from apps.jobs.ai_scoring_service import _fallback_scoring, build_scoring_prompt
from shared.configs import variable_system as var_sys


# ==================== Model Tests ====================

@pytest.mark.django_db
class TestJobPostModel:
    """Tests for the JobPost model."""

    def test_job_post_creation(self, job_post):
        """Job post should be created with correct fields."""
        assert job_post.job_name == 'Senior Python Developer'
        assert job_post.status == var_sys.JobPostStatus.APPROVED
        assert job_post.quantity == 2

    def test_job_post_str(self, job_post):
        """String representation should return job name."""
        assert str(job_post) is not None

    def test_job_post_deadline_in_future(self, job_post):
        """Deadline should be in the future."""
        assert job_post.deadline > timezone.now().date()


# ==================== Service Tests ====================

@pytest.mark.django_db
class TestJobService:
    """Tests for the JobService business logic."""

    def test_get_active_jobs_returns_active_only(self, job_post):
        """Should only return active, non-expired jobs."""
        jobs = JobPostService.get_active_jobs()
        assert job_post in jobs

    def test_get_active_jobs_excludes_expired(self, job_post):
        """Should exclude expired jobs."""
        job_post.deadline = timezone.now().date() - timedelta(days=1)
        job_post.save()

        jobs = JobPostService.get_active_jobs()
        assert job_post not in jobs

    def test_get_active_jobs_excludes_inactive_status(self, job_post):
        """Should exclude jobs with non-active status."""
        job_post.status = var_sys.JobPostStatus.PENDING
        job_post.save()

        jobs = JobPostService.get_active_jobs()
        assert job_post not in jobs

    def test_get_active_jobs_filter_by_career(self, job_post, career):
        """Should filter by career_id."""
        jobs = JobPostService.get_active_jobs(filters={'career_id': career.id})
        assert job_post in jobs

        jobs = JobPostService.get_active_jobs(filters={'career_id': 99999})
        assert job_post not in jobs

    def test_get_active_jobs_filter_by_keyword(self, job_post):
        """Should filter by keyword in job name or company name."""
        jobs = JobPostService.get_active_jobs(filters={'keyword': 'Python'})
        assert job_post in jobs

        jobs = JobPostService.get_active_jobs(filters={'keyword': 'nonexistent'})
        assert job_post not in jobs

    def test_apply_to_job_success(self, job_seeker_user, job_post, resume):
        """Should successfully create an application."""
        validated_data = {
            'job_post': job_post,
            'resume': resume,
            'fullName': 'Test Name',
            'email': 'test@test.com'
        }
        activity = JobActivityService.apply_to_job(
            user=job_seeker_user,
            validated_data=validated_data,
        )
        assert activity is not None
        assert activity.user == job_seeker_user
        assert activity.job_post == job_post

    def test_apply_serializer_accepts_camel_case_job_post(self, job_post, resume):
        serializer = JobSeekerJobPostActivitySerializer(data={
            'jobPost': job_post.id,
            'resume': resume.id,
            'fullName': 'Test Name',
            'email': 'test@test.com',
            'phone': '0901234567',
        })

        assert serializer.is_valid(), serializer.errors
        assert serializer.validated_data['job_post'] == job_post

    def test_apply_to_job_duplicate_reuses_existing_application(self, job_seeker_user, job_post, resume):
        """Should not create duplicate applications on double submit."""
        validated_data = {
            'job_post': job_post,
            'resume': resume,
            'fullName': 'Test Name',
            'email': 'test@test.com'
        }
        first = JobActivityService.apply_to_job(job_seeker_user, validated_data)
        second = JobActivityService.apply_to_job(job_seeker_user, validated_data)

        assert first.id == second.id
        assert JobPostActivity.objects.filter(user=job_seeker_user, job_post=job_post, is_deleted=False).count() == 1
        return
        
        with pytest.raises(ValueError, match="đã ứng tuyển"):
            JobActivityService.apply_to_job(job_seeker_user, validated_data)

    def test_application_status_state_machine_blocks_skip_and_terminal_changes(self, job_seeker_user, job_post, resume):
        activity = JobPostActivity.objects.create(
            user=job_seeker_user,
            job_post=job_post,
            resume=resume,
            status=var_sys.ApplicationStatus.PENDING_CONFIRMATION,
        )

        with pytest.raises(ValueError):
            JobActivityService.change_application_status(activity, var_sys.ApplicationStatus.HIRED)

        activity = JobActivityService.change_application_status(activity, var_sys.ApplicationStatus.CONTACTED)
        assert activity.status == var_sys.ApplicationStatus.CONTACTED

        activity = JobActivityService.change_application_status(activity, var_sys.ApplicationStatus.NOT_SELECTED)
        assert activity.status == var_sys.ApplicationStatus.NOT_SELECTED

        with pytest.raises(ValueError):
            JobActivityService.change_application_status(activity, var_sys.ApplicationStatus.CONTACTED)

    def test_apply_to_job_expired_rejected(self, job_seeker_user, job_post, resume):
        """Should reject applications to expired jobs."""
        job_post.deadline = timezone.now().date() - timedelta(days=1)
        job_post.save()

        validated_data = {
            'job_post': job_post,
            'resume': resume,
            'fullName': 'Test Name',
            'email': 'test@test.com'
        }
        with pytest.raises(ValueError, match="hết hạn"):
            JobActivityService.apply_to_job(job_seeker_user, validated_data)

    def test_apply_to_job_inactive_rejected(self, job_seeker_user, job_post, resume):
        """Should reject applications to inactive jobs."""
        job_post.status = var_sys.JobPostStatus.PENDING
        job_post.save()

        validated_data = {
            'job_post': job_post,
            'resume': resume,
            'fullName': 'Test Name',
            'email': 'test@test.com'
        }
        with pytest.raises(ValueError, match="không còn hoạt động"):
            JobActivityService.apply_to_job(job_seeker_user, validated_data)

    def test_apply_wrong_resume_owner(self, employer_user, job_post, resume):
        """Should reject if resume doesn't belong to applicant."""
        validated_data = {
            'job_post': job_post,
            'resume': resume,
            'fullName': 'Test Name',
            'email': 'test@test.com'
        }
        with pytest.raises(ValueError, match="không thuộc về bạn"):
            JobActivityService.apply_to_job(employer_user, validated_data)

    def test_get_employer_job_stats(self, company, job_post):
        """Should return correct employer stats."""
        stats = JobActivityService.get_employer_job_stats(company)
        assert stats['total_jobs'] == 1
        assert stats['active_jobs'] == 1
        assert stats['total_applications'] == 0


# ==================== AI Scoring Tests ====================

class TestAIScoringFallback:
    """Tests for the rule-based fallback scoring."""

    def test_fallback_returns_valid_structure(self):
        """Should return a valid scoring structure."""
        resume = {'title': 'Python Dev', 'experience': 3, 'salary_min': 15000000, 'salary_max': 25000000}
        job = {'job_name': 'Python Developer', 'experience': 2, 'salary_min': 20000000, 'salary_max': 35000000}

        result = _fallback_scoring(resume, job)
        assert 'overall_score' in result
        assert 0 <= result['overall_score'] <= 100
        assert 'skill_match' in result
        assert 'experience_match' in result
        assert 'salary_match' in result

    def test_fallback_experience_match_bonus(self):
        """Should give bonus when resume experience >= job requirement."""
        resume = {'title': 'Dev', 'experience': 5, 'salary_min': 0, 'salary_max': 0}
        job = {'job_name': 'Dev', 'experience': 3, 'salary_min': 0, 'salary_max': 0}

        result = _fallback_scoring(resume, job)
        assert result['overall_score'] >= 70  # base 50 + exp 20

    def test_fallback_salary_overlap(self):
        """Should give bonus when salary ranges overlap."""
        resume = {'title': '', 'experience': 0, 'salary_min': 15000000, 'salary_max': 25000000}
        job = {'job_name': '', 'experience': 0, 'salary_min': 20000000, 'salary_max': 35000000}

        result = _fallback_scoring(resume, job)
        assert result['salary_match'] == 80

    def test_fallback_no_salary_overlap(self):
        """Should penalize when salary ranges don't overlap."""
        resume = {'title': '', 'experience': 0, 'salary_min': 50000000, 'salary_max': 60000000}
        job = {'job_name': '', 'experience': 0, 'salary_min': 10000000, 'salary_max': 20000000}

        result = _fallback_scoring(resume, job)
        assert result['salary_match'] == 40

    def test_build_prompt_includes_data(self):
        """Prompt should include resume and job data."""
        resume = {'title': 'Backend Dev', 'skills': 'Python, Django', 'experience': 3}
        job = {'job_name': 'Senior Dev', 'description': 'Need Python expert'}

        prompt = build_scoring_prompt(resume, job)
        assert 'Backend Dev' in prompt
        assert 'Senior Dev' in prompt
        assert 'Python, Django' in prompt
