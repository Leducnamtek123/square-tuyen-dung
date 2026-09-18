import io
import json
from datetime import date
from django.test import TestCase
from apps.accounts.models import User
from apps.profiles.models import (
    Company,
    Resume,
    JobSeekerProfile,
    ExperienceDetail,
    EducationDetail,
)
from apps.jobs.models import JobPost, JobPostActivity
from apps.interviews.models import InterviewSession, Question
from apps.interviews.services import build_interview_context


class CandidateCvContextFlowTestCase(TestCase):
    def setUp(self):
        self.employer_user = User.objects.create_user(
            email="employer_test_cv@infohr.vn",
            full_name="Nhà tuyển dụng Trưởng",
            role_name="EMPLOYER",
        )
        self.company = Company.objects.create(
            company_name="Tập đoàn Xây dựng InfoHR",
            field_operation="Xây dựng và Bất động sản",
            user=self.employer_user,
        )
        self.job_post = JobPost.objects.create(
            job_name="Chỉ huy trưởng công trình",
            deadline=date(2030, 1, 1),
            quantity=1,
            job_description="<p>Giám sát thi công, đọc bản vẽ Autocad Revit, quản lý an toàn công trường.</p>",
            job_requirement="<p>Kinh nghiệm 5 năm, tốt nghiệp đại học chuyên ngành xây dựng.</p>",
            position=4,
            type_of_workplace=1,
            experience=2,
            academic_level=2,
            job_type=1,
            salary_min=10000000,
            salary_max=20000000,
            company=self.company,
            user=self.employer_user,
            status=1,
        )

        self.candidate_user = User.objects.create_user(
            email="candidate_engineer@infohr.vn",
            full_name="Kỹ sư Trần Văn Nam",
            role_name="JOB_SEEKER",
        )
        self.job_seeker = JobSeekerProfile.objects.create(
            user=self.candidate_user,
            phone="0988776655",
            birthday=date(1992, 5, 10),
        )

        self.resume = Resume.objects.create(
            user=self.candidate_user,
            job_seeker_profile=self.job_seeker,
            title="Chỉ huy trưởng công trình xây dựng dân dụng",
            skills_summary="Autocad, Revit, Quản lý tiến độ thi công, Giám sát an toàn",
            description="6 năm kinh nghiệm điều hành hiện trường các dự án cao tầng",
            is_active=True,
        )

        ExperienceDetail.objects.create(
            resume=self.resume,
            job_name="Kỹ sư Giám sát trưởng",
            company_name="Công ty Xây dựng Hòa Bình",
            start_date=date(2018, 1, 1),
            end_date=date(2022, 12, 31),
            description="Điều phối thi công cọc khoan nhồi và kết cấu phần thân",
        )

        EducationDetail.objects.create(
            resume=self.resume,
            training_place_name="Đại học Xây dựng Hà Nội",
            start_date=date(2010, 9, 1),
            completed_date=date(2015, 6, 30),
            grade_or_rank="Khá",
            description="Chuyên ngành Kỹ thuật Xây dựng Công trình Dân dụng",
        )

        self.question = Question.objects.create(
            text="Bạn hãy chia sẻ kinh nghiệm xử lý khi nhà thầu phụ chậm tiến độ thi công?",
            category="situational",
            difficulty=2,
            default_duration_seconds=120,
        )

    def test_context_extracts_candidate_cv_and_semantic_match(self):
        session = InterviewSession.objects.create(
            candidate=self.candidate_user,
            job_post=self.job_post,
            created_by=self.employer_user,
            room_name="test-room-cv-context-01",
            status="scheduled",
        )
        session.questions.add(self.question)

        context = build_interview_context(session)

        self.assertEqual(context["candidateName"], "Kỹ sư Trần Văn Nam")
        self.assertEqual(context["candidateCvTitle"], "Chỉ huy trưởng công trình xây dựng dân dụng")
        self.assertIn("Autocad", context["candidateCvSkills"])
        self.assertIn("Hòa Bình", context["candidateCvExperience"])
        self.assertIn("Đại học Xây dựng Hà Nội", context["candidateCvEducation"])

        self.assertIsNotNone(context["candidateFitLevel"])
        self.assertGreater(context["candidateSemanticScore"], 50)
        self.assertIsInstance(context["candidateMatchedSkills"], list)
        self.assertIsNotNone(context["candidateAiRecommendation"])

    def test_context_fallback_when_candidate_has_no_resume(self):
        empty_candidate = User.objects.create_user(
            email="fresh_candidate@infohr.vn",
            full_name="Ứng viên Mới Chưa Có CV",
            role_name="JOB_SEEKER",
        )
        session = InterviewSession.objects.create(
            candidate=empty_candidate,
            job_post=self.job_post,
            created_by=self.employer_user,
            room_name="test-room-no-cv-02",
            status="scheduled",
        )
        session.questions.add(self.question)

        context = build_interview_context(session)

        self.assertEqual(context["candidateName"], "Ứng viên Mới Chưa Có CV")
        self.assertIsNone(context.get("candidateCvTitle"))
        self.assertIsNone(context.get("candidateFitLevel"))
        self.assertEqual(context["questionCount"], 1)

    def test_context_retrieves_resume_via_job_post_activity(self):
        another_candidate = User.objects.create_user(
            email="applied_candidate@infohr.vn",
            full_name="Kỹ sư Ứng Tuyển Qua Hoạt Động",
            role_name="JOB_SEEKER",
        )
        js_profile = JobSeekerProfile.objects.create(user=another_candidate)
        inactive_resume = Resume.objects.create(
            user=another_candidate,
            job_seeker_profile=js_profile,
            title="Kỹ sư QS Dự toán xây dựng",
            skills_summary="Bóc tách khối lượng, Lập dự toán, Autocad",
            is_active=False,
        )
        JobPostActivity.objects.create(
            job_post=self.job_post,
            user=another_candidate,
            resume=inactive_resume,
        )

        session = InterviewSession.objects.create(
            candidate=another_candidate,
            job_post=self.job_post,
            created_by=self.employer_user,
            room_name="test-room-activity-cv-03",
            status="scheduled",
        )

        context = build_interview_context(session)
        self.assertEqual(context["candidateCvTitle"], "Kỹ sư QS Dự toán xây dựng")
        self.assertIn("dự toán", context["candidateCvSkills"].lower())
