# -*- coding: utf-8 -*-
"""
Tests for JobPost ↔ InterviewScript API contract and Auto-Schedule AI Interview integration.
"""

from unittest.mock import patch
from django.test import TestCase, RequestFactory
from django.utils import timezone
from rest_framework import serializers

from apps.accounts.models import User
from apps.profiles.models import Company
from apps.locations.models import City, District, Location
from apps.interviews.models import InterviewScript, InterviewSession, Question
from apps.jobs.models import JobPost, JobPostActivity
from apps.jobs.serializers import JobPostSerializer
from apps.interviews.tasks import auto_schedule_screening_interview
from shared.configs import variable_system as var_sys


class JobPostInterviewScriptContractTests(TestCase):
    def setUp(self):
        self.factory = RequestFactory()
        self.city = City.objects.create(name="Hồ Chí Minh")
        self.district = District.objects.create(name="Quận 1", city=self.city)
        self.location = Location.objects.create(city=self.city, district=self.district, address="Quận 1")

        # Recruiter A & Company A
        self.employer_a = User.objects.create_user_with_role_name(
            email="recruiter-a@company-a.com",
            full_name="Recruiter A",
            role_name=var_sys.EMPLOYER,
            password="password123",
            is_active=True,
            has_company=True,
        )
        self.company_a = Company.objects.create(
            company_name="Công ty Công nghệ A",
            company_email="contact@comp-a.vn",
            company_phone="0911000111",
            tax_code="TAXCOMPA",
            user=self.employer_a,
        )

        # Recruiter B & Company B
        self.employer_b = User.objects.create_user_with_role_name(
            email="recruiter-b@company-b.com",
            full_name="Recruiter B",
            role_name=var_sys.EMPLOYER,
            password="password123",
            is_active=True,
            has_company=True,
        )
        self.company_b = Company.objects.create(
            company_name="Công ty Công nghệ B",
            company_email="contact@comp-b.vn",
            company_phone="0911000222",
            tax_code="TAXCOMPB",
            user=self.employer_b,
        )

        # Candidate
        self.candidate = User.objects.create_user_with_role_name(
            email="candidate-applicant@example.com",
            full_name="Nguyễn Văn Ứng Viên",
            role_name=var_sys.JOB_SEEKER,
            password="password123",
        )

        # Question & Scripts
        self.q1 = Question.objects.create(text="Câu hỏi chuyên môn 1", category="technical", difficulty=2)
        self.script_a = InterviewScript.objects.create(
            name="Kịch bản Phỏng vấn Backend A",
            scenario_type="technical",
            hr_persona="challenger",
            company=self.company_a,
            author=self.employer_a,
            is_active=True,
        )
        self.script_a.questions.add(self.q1)

        self.script_b = InterviewScript.objects.create(
            name="Kịch bản Phỏng vấn B",
            scenario_type="sales",
            hr_persona="friendly",
            company=self.company_b,
            author=self.employer_b,
            is_active=True,
        )

        self.preset_script = InterviewScript.objects.create(
            name="Mẫu chuẩn STAR Toàn hệ thống",
            scenario_type="behavioral",
            hr_persona="professional",
            is_system_preset=True,
            company=None,
            author=None,
            is_active=True,
        )

        # JobPost for Company A
        self.job_post = JobPost.objects.create(
            job_name="Senior Python Engineer",
            company=self.company_a,
            user=self.employer_a,
            deadline=timezone.now().date() + timezone.timedelta(days=30),
            quantity=2,
            position=1,
            type_of_workplace=1,
            experience=2,
            academic_level=1,
            job_type=1,
            salary_min=20000000,
            salary_max=40000000,
            contact_person_name="Recruiter A",
            contact_person_phone="0911000111",
            contact_person_email="recruiter-a@company-a.com",
            job_description="Mô tả công việc chi tiết",
            job_requirement="Yêu cầu công việc chi tiết",
            benefits_enjoyed="Phúc lợi hấp dẫn",
            location=self.location,
            interview_script=self.script_a,
            auto_interview_enabled=True,
        )

    def test_job_post_serializer_includes_interview_script_and_detail(self):
        request = self.factory.get("/")
        request.user = self.employer_a

        serializer = JobPostSerializer(self.job_post, context={"request": request})
        data = serializer.data

        self.assertEqual(data["interviewScript"], self.script_a.id)
        self.assertIsNotNone(data["interviewScriptDetail"])
        self.assertEqual(data["interviewScriptDetail"]["id"], self.script_a.id)
        self.assertEqual(data["interviewScriptDetail"]["name"], self.script_a.name)
        self.assertEqual(data["interviewScriptDetail"]["scenario_type"], "technical")

    def test_job_post_serializer_scoping_accepts_preset_script(self):
        request = self.factory.get("/")
        request.user = self.employer_a

        payload = {
            "jobName": "Python Fresher",
            "deadline": str(timezone.now().date() + timezone.timedelta(days=30)),
            "quantity": 1,
            "position": 1,
            "typeOfWorkplace": 1,
            "experience": 1,
            "academicLevel": 1,
            "jobType": 1,
            "salaryMin": 10000000,
            "salaryMax": 15000000,
            "contactPersonName": "Recruiter A",
            "contactPersonPhone": "0911000111",
            "contactPersonEmail": "recruiter-a@company-a.com",
            "jobDescription": "Mô tả công việc",
            "jobRequirement": "Yêu cầu",
            "benefitsEnjoyed": "Phúc lợi",
            "location": {"city": self.city.id, "district": self.district.id, "address": "Quận 1"},
            "interviewScript": self.preset_script.id,
        }
        serializer = JobPostSerializer(data=payload, context={"request": request})
        self.assertTrue(serializer.is_valid(), serializer.errors)
        self.assertEqual(serializer.validated_data["interview_script"].id, self.preset_script.id)

    def test_job_post_serializer_scoping_rejects_foreign_company_script(self):
        request = self.factory.get("/")
        request.user = self.employer_a

        payload = {
            "jobName": "Hacked Script Job",
            "deadline": str(timezone.now().date() + timezone.timedelta(days=30)),
            "quantity": 1,
            "position": 1,
            "typeOfWorkplace": 1,
            "experience": 1,
            "academicLevel": 1,
            "jobType": 1,
            "salaryMin": 10000000,
            "salaryMax": 15000000,
            "contactPersonName": "Recruiter A",
            "contactPersonPhone": "0911000111",
            "contactPersonEmail": "recruiter-a@company-a.com",
            "jobDescription": "Mô tả",
            "jobRequirement": "Yêu cầu",
            "benefitsEnjoyed": "Phúc lợi",
            "location": {"city": self.city.id, "district": self.district.id, "address": "Quận 1"},
            "interviewScript": self.script_b.id, # Foreign company script
        }
        serializer = JobPostSerializer(data=payload, context={"request": request})
        self.assertFalse(serializer.is_valid())
        self.assertIn("interviewScript", serializer.errors)

    @patch("apps.interviews.tasks.send_interview_invitation.delay")
    def test_auto_schedule_screening_interview_links_script_and_populates_questions(self, mock_invitation):
        activity = JobPostActivity.objects.create(
            job_post=self.job_post,
            user=self.candidate,
            full_name=self.candidate.full_name,
            email=self.candidate.email,
            phone="0909123456",
            status=var_sys.ApplicationStatus.PENDING_CONFIRMATION,
        )

        auto_schedule_screening_interview(activity.id)

        session = InterviewSession.objects.filter(candidate=self.candidate, job_post=self.job_post).first()
        self.assertIsNotNone(session, "Phiên phỏng vấn phải được tự động tạo")
        self.assertEqual(session.interview_script, self.script_a)
        self.assertIn(self.q1, session.questions.all())

        activity.refresh_from_db()
        self.assertEqual(activity.status, var_sys.ApplicationStatus.CONTACTED)
        mock_invitation.assert_called_once_with(session.id)
