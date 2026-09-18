import json
import pytest
from unittest.mock import patch, MagicMock
from django.utils import timezone
from apps.jobs.models import JobPost, JobPostActivity
from apps.accounts.models import User
from apps.profiles.models import Company, Resume, JobSeekerProfile
from apps.locations.models import City, Location
from apps.interviews.models import QuestionGroup
from apps.common.models import Career
from apps.jobs.candidate_matching_service import match_and_source_candidates_for_job
from apps.jobs.auto_pipeline_service import run_full_auto_recruitment_pipeline
from apps.jobs.services import JobActivityService
from apps.jobs.tasks import analyze_resume_ai
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
        company = Company.objects.create(
            user=employer,
            company_name="SQ Studio Corp",
            is_verified=True,
        )

        template = QuestionGroup.objects.create(
            name="Interview Template Standard",
            company=company,
            author=employer,
        )

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
            interview_template=template,
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
            "candidate_profile": candidate_profile,
            "resume": resume,
            "template": template,
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

    @patch("apps.interviews.tasks.auto_schedule_screening_interview.delay")
    @patch("apps.jobs.tasks.post_chat_completion_httpx")
    def test_gatekeeper_case_a_score_below_threshold(self, mock_post, mock_schedule, setup_data):
        """Case A: Score < 70 -> NO interview scheduled"""
        job_post = setup_data["job_post"]
        candidate = setup_data["candidate_user"]
        resume = setup_data["resume"]

        activity = JobPostActivity.objects.create(
            job_post=job_post,
            user=candidate,
            resume=resume,
            status=var_sys.ApplicationStatus.PENDING_CONFIRMATION,
        )

        mock_llm_cand = MagicMock(model="qwen2.5:7b", name="ollama")
        mock_post.return_value = (
            {
                "choices": [{
                    "message": {
                        "content": json.dumps({
                            "score": 65,
                            "summary": "Chưa đạt yêu cầu tối thiểu",
                            "skills": ["Xây dựng"],
                            "pros": ["Có kinh nghiệm"],
                            "cons": ["Thiếu chứng chỉ"],
                        })
                    }
                }]
            },
            mock_llm_cand,
        )

        analyze_resume_ai(activity.id)

        activity.refresh_from_db()
        assert activity.ai_analysis_score == 65
        assert activity.ai_analysis_status == 'completed'
        mock_schedule.assert_not_called()

    @patch("apps.interviews.tasks.auto_schedule_screening_interview.delay")
    @patch("apps.jobs.tasks.post_chat_completion_httpx")
    def test_gatekeeper_case_b_score_equal_threshold(self, mock_post, mock_schedule, setup_data):
        """Case B: Score = 70 -> Interview scheduled"""
        job_post = setup_data["job_post"]
        candidate = setup_data["candidate_user"]
        resume = setup_data["resume"]

        activity = JobPostActivity.objects.create(
            job_post=job_post,
            user=candidate,
            resume=resume,
            status=var_sys.ApplicationStatus.PENDING_CONFIRMATION,
        )

        mock_llm_cand = MagicMock(model="qwen2.5:7b", name="ollama")
        mock_post.return_value = (
            {
                "choices": [{
                    "message": {
                        "content": json.dumps({
                            "score": 70,
                            "summary": "Vừa đủ tiêu chuẩn phỏng vấn",
                            "skills": ["Xây dựng"],
                            "pros": ["Đạt chuẩn"],
                            "cons": [],
                        })
                    }
                }]
            },
            mock_llm_cand,
        )

        analyze_resume_ai(activity.id)

        activity.refresh_from_db()
        assert activity.ai_analysis_score == 70
        assert activity.ai_analysis_status == 'completed'
        mock_schedule.assert_called_once_with(activity.id)

    @patch("apps.interviews.tasks.auto_schedule_screening_interview.delay")
    @patch("apps.jobs.tasks.post_chat_completion_httpx")
    def test_gatekeeper_case_c_score_above_threshold(self, mock_post, mock_schedule, setup_data):
        """Case C: Score > 70 -> Interview scheduled"""
        job_post = setup_data["job_post"]
        candidate = setup_data["candidate_user"]
        resume = setup_data["resume"]

        activity = JobPostActivity.objects.create(
            job_post=job_post,
            user=candidate,
            resume=resume,
            status=var_sys.ApplicationStatus.PENDING_CONFIRMATION,
        )

        mock_llm_cand = MagicMock(model="qwen2.5:7b", name="ollama")
        mock_post.return_value = (
            {
                "choices": [{
                    "message": {
                        "content": json.dumps({
                            "score": 92,
                            "summary": "Ứng viên xuất sắc",
                            "skills": ["Xây dựng", "Quản lý dự án"],
                            "pros": ["Kinh nghiệm sâu rộng"],
                            "cons": [],
                        })
                    }
                }]
            },
            mock_llm_cand,
        )

        analyze_resume_ai(activity.id)

        activity.refresh_from_db()
        assert activity.ai_analysis_score == 92
        assert activity.ai_analysis_status == 'completed'
        mock_schedule.assert_called_once_with(activity.id)

    @patch("apps.interviews.tasks.auto_schedule_screening_interview.delay")
    @patch("apps.jobs.tasks.post_chat_completion_httpx")
    def test_gatekeeper_case_d_scoring_fails(self, mock_post, mock_schedule, setup_data):
        """Case D: Resume scoring fails -> NO interview"""
        job_post = setup_data["job_post"]
        candidate = setup_data["candidate_user"]
        resume = setup_data["resume"]

        activity = JobPostActivity.objects.create(
            job_post=job_post,
            user=candidate,
            resume=resume,
            status=var_sys.ApplicationStatus.PENDING_CONFIRMATION,
        )

        mock_post.side_effect = Exception("LLM inference error")

        analyze_resume_ai(activity.id)

        activity.refresh_from_db()
        mock_schedule.assert_not_called()

    @patch("apps.interviews.tasks.auto_schedule_screening_interview.delay")
    @patch("apps.jobs.tasks.analyze_resume_ai.delay")
    def test_direct_application_does_not_schedule_prematurely(self, mock_analyze, mock_schedule, setup_data):
        """Direct application queues AI scoring, NOT interview scheduling prematurely"""
        job_post = setup_data["job_post"]
        candidate = setup_data["candidate_user"]
        resume = setup_data["resume"]

        activity = JobActivityService.apply_to_job(
            user=candidate,
            validated_data={
                "job_post": job_post,
                "resume": resume,
                "full_name": "Ngô Tiến Dũng",
                "email": "candidate1@example.com",
                "phone": "0901234567",
            }
        )

        assert activity is not None
        mock_analyze.assert_called_once_with(activity.id)
        mock_schedule.assert_not_called()
