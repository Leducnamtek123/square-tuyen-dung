from django.test import TestCase
from apps.interviews.models import Question, InterviewSession, SalaryBenchmark
from apps.accounts.models import User

class ModelEnhancementTestCase(TestCase):
    def test_question_hint_fields(self):
        q = Question.objects.create(
            text="Mục tiêu nghề nghiệp 1-2 năm tới của bạn là gì?",
            default_duration_seconds=120,
            answer_structure={
                "start": "Nêu mục tiêu ngắn hạn",
                "steps": [
                    {"step": 1, "title": "Phát triển kỹ năng"},
                    {"step": 2, "title": "Đóng góp cho công ty"}
                ],
                "end": "Cam kết gắn bó"
            },
            interviewer_intent="Đánh giá định hướng và mức độ phù hợp",
            important_tips=[
                {"priority": "HIGH", "text": "Cụ thể hóa kế hoạch"},
                {"priority": "MEDIUM", "text": "Liên kết với giá trị công ty"}
            ],
            follow_up_questions=[
                "Bạn sẽ làm gì nếu kế hoạch gặp trở ngại?"
            ]
        )
        self.assertEqual(q.default_duration_seconds, 120)
        self.assertIn("start", q.answer_structure)
        self.assertEqual(len(q.important_tips), 2)
        self.assertEqual(len(q.follow_up_questions), 1)

    def test_interview_session_type(self):
        user = User.objects.create_user(
            email="candidate_test_mock@example.com",
            full_name="Candidate Mock Test",
            role_name="job_seeker"
        )
        session = InterviewSession.objects.create(
            candidate=user,
            session_type='mock',
            time_limit_per_question=90,
            session_metadata={"generated_tips_count": 3}
        )
        self.assertEqual(session.session_type, 'mock')
        self.assertEqual(session.time_limit_per_question, 90)
        self.assertEqual(session.session_metadata.get("generated_tips_count"), 3)

    def test_salary_benchmark_model(self):
        sb = SalaryBenchmark.objects.create(
            position_title="Kỹ sư xây dựng",
            experience_level="junior",
            salary_min=12000000,
            salary_max=18000000,
            salary_avg=15000000,
            year=2026,
            sample_count=120,
            is_hot=True
        )
        self.assertEqual(sb.position_title, "Kỹ sư xây dựng")
        self.assertEqual(sb.salary_min, 12000000)
        self.assertTrue(sb.is_hot)
