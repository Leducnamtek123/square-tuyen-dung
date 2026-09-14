import io
import json
from datetime import date
from rest_framework.test import APITestCase
from rest_framework import status
from apps.accounts.models import User
from apps.profiles.models import Company, CompanyMember, CompanyRole, Resume, JobSeekerProfile
from apps.jobs.models import JobPost
from apps.interviews.models import InterviewSession, QuestionGroup, Question
from apps.profiles.services.semantic_matching import evaluate_cv_jd_semantic_match

class StrategicFeaturesTestCase(APITestCase):
    def setUp(self):
        self.employer_user = User.objects.create_user(
            email="employer_strategic@infohr.vn",
            full_name="Nhà tuyển dụng Trưởng",
            role_name="EMPLOYER"
        )
        self.company = Company.objects.create(
            company_name="Tập đoàn Xây dựng và Bất động sản InfoHR",
            field_operation="Xây dựng và Bất động sản",
            user=self.employer_user,
            evaluation_weights={
                "technical": 35,
                "communication": 20,
                "situational": 20,
                "culture_fit": 15,
                "attitude": 10,
            }
        )
        self.employer_user.company = self.company
        self.employer_user.save()

        role, _ = CompanyRole.objects.get_or_create(
            code="owner",
            defaults={"name": "Chủ doanh nghiệp", "company": self.company, "is_system": True}
        )
        CompanyMember.objects.create(
            company=self.company,
            user=self.employer_user,
            role=role,
            status=CompanyMember.STATUS_ACTIVE,
            is_active=True
        )

        self.candidate_user = User.objects.create_user(
            email="candidate_fdi@infohr.vn",
            full_name="Kỹ sư Nguyễn Văn A",
            role_name="JOB_SEEKER"
        )
        self.job_seeker = JobSeekerProfile.objects.create(
            user=self.candidate_user,
            phone="0912345678"
        )

        self.job_post = JobPost.objects.create(
            job_name="Chỉ huy trưởng công trình xây dựng",
            deadline=date(2030, 1, 1),
            quantity=1,
            job_description="<p>Tuyển dụng chỉ huy trưởng kinh nghiệm giám sát thi công, đọc bản vẽ Autocad Revit, quản lý nhà thầu phụ.</p>",
            position=4,
            type_of_workplace=1,
            experience=2,
            academic_level=2,
            job_type=1,
            salary_min=10000000,
            salary_max=20000000,
            contact_person_name="HR Manager",
            contact_person_phone="0901234567",
            contact_person_email="hr@infohr.vn",
            company=self.company,
            user=self.employer_user,
            status=1
        )

        self.resume = Resume.objects.create(
            user=self.candidate_user,
            job_seeker_profile=self.job_seeker,
            title="Chỉ huy trưởng công trình 5 năm kinh nghiệm",
            skills_summary="Autocad, Revit, Giám sát thi công, Quản lý an toàn lao động, Lập dự toán công trình",
            description="5 năm kinh nghiệm điều phối công trường dân dụng và công nghiệp",
            is_active=True
        )

    def test_feature1_export_pdf_evaluation_report(self):
        session = InterviewSession.objects.create(
            candidate=self.candidate_user,
            job_post=self.job_post,
            created_by=self.employer_user,
            status='completed',
            ai_overall_score=88.5,
            ai_technical_score=90.0,
            ai_communication_score=85.0,
            ai_summary="Ứng viên thể hiện năng lực chuyên môn vững vàng, khả năng ứng biến thực tế xuất sắc.",
            ai_strengths=["Kỹ năng quản lý công trường", "Nắm vững tiêu chuẩn an toàn"],
            ai_weaknesses=["Tiếng Anh giao tiếp cần trau dồi thêm"]
        )

        self.client.force_authenticate(user=self.employer_user)
        response = self.client.get(f'/api/v1/interview/web/sessions/{session.id}/export-pdf/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response['Content-Type'], 'application/pdf')
        self.assertTrue(response.content.startswith(b'%PDF'))

    def test_feature2_industry_standard_question_groups(self):
        from django.core.management import call_command
        call_command('seed_industry_standard_questions')

        groups = QuestionGroup.objects.filter(is_public=True)
        self.assertGreaterEqual(groups.count(), 9)

        construction_group = groups.filter(name__icontains="Xây dựng").first()
        self.assertIsNotNone(construction_group)
        self.assertGreater(construction_group.questions.count(), 0)

        sample_q = construction_group.questions.first()
        self.assertIsNotNone(sample_q)
        self.assertIn("situation", sample_q.answer_structure)
        self.assertIn("action", sample_q.answer_structure)
        self.assertIn("result", sample_q.answer_structure)

    def test_feature3_company_evaluation_weights_config(self):
        self.client.force_authenticate(user=self.employer_user)
        response = self.client.get('/api/v1/info/web/private-companies/evaluation-weights/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = response.data.get('data', response.data)
        weights_dict = data.get('evaluationWeights') or data.get('evaluation_weights')
        self.assertIsNotNone(weights_dict)
        self.assertEqual(weights_dict['technical'], 35)

        new_weights = {
            "technical": 40,
            "communication": 15,
            "situational": 20,
            "culture_fit": 15,
            "attitude": 10,
        }
        put_response = self.client.put(
            '/api/v1/info/web/private-companies/evaluation-weights/',
            {"evaluation_weights": new_weights},
            format='json'
        )
        self.assertEqual(put_response.status_code, status.HTTP_200_OK)

        self.company.refresh_from_db()
        self.assertEqual(self.company.evaluation_weights['technical'], 40)

    def test_feature4_semantic_matching_engine_and_endpoint(self):
        result = evaluate_cv_jd_semantic_match(
            resume=self.resume,
            job_post=self.job_post
        )
        self.assertIn('semantic_score', result)
        self.assertIn('fit_level', result)
        self.assertIn('dimension_scores', result)
        self.assertIn('matched_skills', result)
        self.assertIn('ai_recommendation', result)
        self.assertGreater(result['semantic_score'], 50)

        self.client.force_authenticate(user=self.employer_user)
        res_api = self.client.post(
            f'/api/v1/info/web/resumes/{self.resume.slug}/semantic-match/',
            {"job_post_id": self.job_post.id},
            format='json'
        )
        self.assertEqual(res_api.status_code, status.HTTP_200_OK)
        api_data = res_api.data.get('data', res_api.data)
        self.assertIn('semantic_score', api_data)
        self.assertEqual(api_data['job_post_id'], self.job_post.id)

    def test_feature5_multilingual_interview_sessions(self):
        languages = ['vi', 'en', 'ja', 'ko']
        for lang in languages:
            session = InterviewSession.objects.create(
                candidate=self.candidate_user,
                job_post=self.job_post,
                created_by=self.employer_user,
                interview_language=lang
            )
            self.assertEqual(session.interview_language, lang)
            self.assertTrue(len(session.get_interview_language_display()) > 0)

        self.client.force_authenticate(user=self.employer_user)
        schedule_res = self.client.post(
            '/api/v1/interview/web/sessions/',
            {
                "candidate": self.candidate_user.id,
                "job_post": self.job_post.id,
                "interview_language": "ja",
                "scheduled_at": "2026-10-15T09:00:00Z",
                "type": "mixed"
            },
            format='json'
        )
        self.assertEqual(schedule_res.status_code, status.HTTP_201_CREATED, schedule_res.data)
        session_data = schedule_res.data.get('data', schedule_res.data)
        self.assertEqual(session_data.get('interview_language'), 'ja')
