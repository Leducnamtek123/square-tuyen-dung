from unittest.mock import patch

from django.test import TestCase
from rest_framework.test import APIClient

from apps.accounts.models import User
from apps.interviews.models import InterviewSession, Question
from apps.interviews.services import (
    append_transcript,
    advance_question_cursor,
    build_interview_context,
    get_next_question_payload,
    update_interview_status,
)


class InterviewServiceTests(TestCase):
    def setUp(self):
        self.candidate = User.objects.create_user(
            email="candidate@example.com",
            full_name="Candidate",
            password="password123",
        )
        self.session = InterviewSession.objects.create(candidate=self.candidate)

    def test_build_interview_context_includes_questions(self):
        q1 = Question.objects.create(text="Question 1")
        q2 = Question.objects.create(text="Question 2")
        self.session.questions.add(q1, q2)

        context = build_interview_context(self.session)

        self.assertEqual(context["candidateEmail"], self.candidate.email)
        self.assertEqual(len(context["questions"]), 2)

    def test_get_next_question_payload_no_side_effect(self):
        q1 = Question.objects.create(text="Question 1")
        q2 = Question.objects.create(text="Question 2")
        self.session.questions.add(q1, q2)

        payload = get_next_question_payload(self.session)

        self.assertFalse(payload["done"])
        self.session.refresh_from_db()
        self.assertEqual(self.session.question_cursor, 0)

    def test_advance_question_cursor(self):
        q1 = Question.objects.create(text="Question 1")
        self.session.questions.add(q1)

        advance_question_cursor(self.session)
        self.session.refresh_from_db()
        self.assertEqual(self.session.question_cursor, 1)

    def test_append_transcript_creates_record(self):
        transcript = append_transcript(
            self.session,
            {"speaker_role": "candidate", "content": "Hello", "speech_duration_ms": 123},
        )
        self.assertEqual(transcript.content, "Hello")
        self.assertEqual(transcript.speaker_role, "candidate")

    @patch("interview.tasks.end_interview_session.apply_async")
    def test_update_status_sets_start_time(self, mock_apply_async):
        update_interview_status(self.session, "in_progress", max_duration_seconds=10)
        self.session.refresh_from_db()
        self.assertIsNotNone(self.session.start_time)


class InterviewCompatEndpointTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.candidate = User.objects.create_user(
            email="candidate2@example.com",
            full_name="Candidate Two",
            password="password123",
        )
        self.session = InterviewSession.objects.create(candidate=self.candidate)

    def test_context_endpoint_returns_payload(self):
        response = self.client.get(f"/api/v1/interview/compat/{self.session.room_name}/context")
        self.assertEqual(response.status_code, 200)
        self.assertIn("candidateEmail", response.json())

    def test_next_question_endpoint(self):
        q1 = Question.objects.create(text="Question 1")
        self.session.questions.add(q1)

        response = self.client.post(
            f"/api/v1/interview/compat/{self.session.room_name}/next-question",
            data={"advance": True},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("question", response.json())
