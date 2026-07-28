import pytest
from unittest.mock import patch, MagicMock
from django.utils import timezone
from apps.jobs.models import JobPost, JobPostActivity
from apps.accounts.models import User
from apps.profiles.models import Company, Resume, JobSeekerProfile
from apps.locations.models import City, Location
from common.models import Career
from apps.jobs.candidate_matching_service import match_and_source_candidates_for_job
from apps.jobs.auto_pipeline_service import run_full_auto_recruitment_pipeline
from shared.configs import variable_system as var_sys


@pytest.mark.django_db
class TestAutoRecruitmentPipeline:

    @pytest.fixture
    def setup_data(self):
        city = City.objects.create(name="Ho Chi Minh City")
        location = Location.objects.create(city=city, address="District 1")
        career = Career.objects.create(name="Xây dựng")
        employer = User.objects.create(
            email="employer@example.com",
            full_name="Employer Test",
            role_name=var_sys.EMPLOYER,
        )
        company = Company.objects.create(user=employer, company_name="SQ Studio Corp")

        job_post = JobPost.objects.create(
            job_name="Giám sát thi công",
            deadline=timezone.localdate() + timezone.timedelta(days=30),
            quantity=5,
            job_description="Mo ta cong viec xaydung",
            job_requirement="Yeu cau kinh nghiem",
            position=1,
            type_of_workplace=1,
            experience=1,
            academic_level=1,
            job_type=1,
            salary_min=10,
            salary_max=20,
            status=var_sys.JobPostStatus.APPROVED,
            user=employer,
            company=company,
            career=career,
            location=location,
            is_auto_sourcing_enabled=True,
            auto_sourcing_limit=5,
            auto_interview_enabled=True,
            min_screening_score=70,
        )

        candidate_user = User.objects.create(
            email="candidate1@example.com",
            full_name="Ngô Tiến Dũng",
            role_name=var_sys.JOB_SEEKER,
        )
        candidate_profile = JobSeekerProfile.objects.create(user=candidate_user, location=location)
        resume = Resume.objects.create(
            user=candidate_user,
            job_seeker_profile=candidate_profile,
            career=career,
            city=city,
            title="Giám sát thi công nội thất",
            description="Kinh nghiem xaydung 2 nam",
            is_active=True,
        )

        return {
            "job_post": job_post,
            "candidate_user": candidate_user,
            "resume": resume,
        }

    def test_candidate_matching_from_data_lake(self, setup_data):
        job_post = setup_data["job_post"]
        candidate_user = setup_data["candidate_user"]

        activities = match_and_source_candidates_for_job(job_post, target_limit=5)
        assert len(activities) >= 1
        assert activities[0].user == candidate_user
        assert activities[0].job_post == job_post
        assert activities[0].status == var_sys.ApplicationStatus.PENDING_CONFIRMATION

    @patch("apps.jobs.auto_pipeline_service.auto_schedule_screening_interview.delay")
    @patch("apps.jobs.auto_pipeline_service.score_job_application")
    def test_run_full_auto_recruitment_pipeline(self, mock_score, mock_auto_schedule, setup_data):
        job_post = setup_data["job_post"]
        mock_score.return_value = {"score": 85, "summary": "Phù hợp với vị trí"}

        result = run_full_auto_recruitment_pipeline(job_post.id)

        assert result["matched"] >= 1
        assert result["screened"] >= 1
        assert result["interviewed"] >= 1

        mock_auto_schedule.assert_called_once()
        activity = JobPostActivity.objects.get(job_post=job_post, user=setup_data["candidate_user"])
        assert activity.ai_analysis_score == 85
        assert activity.status == var_sys.ApplicationStatus.CONTACTED
