from rest_framework.test import APITestCase
from rest_framework import status
from apps.interviews.models import Question, InterviewSession, SalaryBenchmark
from apps.accounts.models import User

class InterviewEnhancementsAPITestCase(APITestCase):
    def setUp(self):
        self.candidate = User.objects.create_user(
            email="candidate_api_test@square.vn",
            full_name="Candidate API Tester",
            role_name="job_seeker"
        )
        self.question = Question.objects.create(
            text="Tại sao bạn ứng tuyển vị trí này?",
            difficulty=2,
            category="behavioral",
            default_duration_seconds=120,
            answer_structure={
                "start": "Bày tỏ niềm đam mê với công việc",
                "steps": [
                    {"step": 1, "title": "Nêu kinh nghiệm liên quan"},
                    {"step": 2, "title": "Mục tiêu đóng góp cho doanh nghiệp"}
                ],
                "end": "Cam kết và khẳng định phù hợp"
            },
            interviewer_intent="Đánh giá động lực và sự chuẩn bị của ứng viên",
            important_tips=[
                {"priority": "HIGH", "text": "Tìm hiểu kỹ về sản phẩm và văn hóa công ty"}
            ],
            follow_up_questions=["Nếu nhận được mức lương thấp hơn kỳ vọng thì sao?"]
        )
        self.salary = SalaryBenchmark.objects.create(
            position_title="Kiến trúc sư công trình",
            experience_level="mid",
            salary_min=15000000,
            salary_max=30000000,
            salary_avg=22000000,
            year=2026,
            is_hot=True
        )

    def test_question_bank_list_api(self):
        response = self.client.get('/api/v1/interview/questions/bank/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get('results', response.data)
        self.assertGreaterEqual(len(results), 1)
        item = results[0]
        self.assertIn('answer_structure', item)
        self.assertIn('interviewer_intent', item)

    def test_question_hints_detail_api(self):
        response = self.client.get(f'/api/v1/interview/questions/{self.question.id}/hints/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], self.question.id)
        self.assertIn('start', response.data['answer_structure'])

    def test_create_mock_session_api(self):
        self.client.force_authenticate(user=self.candidate)
        response = self.client.post('/api/v1/interview/sessions/create-mock/', {
            "position_title": "Kiến trúc sư thử việc",
            "question_count": 5
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['session_type'], 'mock')
        self.assertTrue(response.data['room_name'].startswith('interview-'))

    def test_salary_benchmark_list_api(self):
        response = self.client.get('/api/v1/interview/salary-benchmarks/?search=Kiến trúc sư')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get('results', response.data)
        self.assertGreaterEqual(len(results), 1)
        self.assertEqual(results[0]['position_title'], "Kiến trúc sư công trình")

    def test_create_mock_session_with_specific_questions(self):
        self.client.force_authenticate(user=self.candidate)
        q2 = Question.objects.create(text="Câu hỏi thử nghiệm 2", difficulty=1)
        response = self.client.post('/api/v1/interview/sessions/create-mock/', {
            "job_title": "Frontend Engineer Preview",
            "question_ids": [self.question.id, q2.id]
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['session_type'], 'mock')
        session_id = response.data['id']
        session = InterviewSession.objects.get(id=session_id)
        self.assertEqual(session.questions.count(), 2)
        self.assertIn(self.question, session.questions.all())
        self.assertIn(q2, session.questions.all())
