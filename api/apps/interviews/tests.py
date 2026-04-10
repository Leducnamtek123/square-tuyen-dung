"""
Interview Module — Comprehensive API & Service Tests

Tests cover:
1. InterviewSession CRUD via API (snake_case validation)
2. InterviewEvaluation submission & auto-calculation
3. Serializer field validation (TYPE_CHOICES, required fields)
4. Status transitions (state machine guards)
"""

from unittest.mock import patch
from decimal import Decimal

from django.test import TestCase
from django.core.exceptions import ValidationError
from rest_framework.test import APIClient
from rest_framework import status as drf_status

from apps.accounts.models import User
from apps.interviews.models import (
    InterviewSession, Question, QuestionGroup,
    InterviewTranscript, InterviewEvaluation,
)
from apps.interviews.serializers import (
    InterviewSessionCreateSerializer,
    InterviewEvaluationSerializer,
    QuestionSerializer,
)
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

    @patch("apps.interviews.tasks.end_interview_session.apply_async")
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


# ─── NEW: Session CRUD API Tests ───────────────────────────────────────────

class InterviewSessionAPITests(TestCase):
    """Tests that the session API accepts snake_case fields and rejects camelCase."""

    def setUp(self):
        self.client = APIClient()
        self.employer = User.objects.create_user(
            email="employer@example.com",
            full_name="Employer HR",
            password="password123",
            role="employer",
        )
        self.candidate = User.objects.create_user(
            email="candidate3@example.com",
            full_name="Candidate Three",
            password="password123",
        )
        self.client.force_authenticate(user=self.employer)

    def test_list_sessions_returns_200(self):
        InterviewSession.objects.create(candidate=self.candidate)
        response = self.client.get("/api/v1/interview/web/sessions/")
        self.assertEqual(response.status_code, 200)

    def test_retrieve_session_detail(self):
        session = InterviewSession.objects.create(candidate=self.candidate)
        response = self.client.get(f"/api/v1/interview/web/sessions/{session.pk}/")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        # Should have nested fields
        self.assertIn("candidate_name", data.get("data", data))

    def test_create_session_with_snake_case(self):
        """The frontend MUST send snake_case keys. This verifies the serializer accepts them."""
        payload = {
            "candidate": self.candidate.pk,
            "type": "mixed",
            "scheduled_at": "2026-04-15T10:00:00Z",
            "notes": "Test interview",
        }
        response = self.client.post(
            "/api/v1/interview/web/sessions/",
            data=payload,
            format="json",
        )
        self.assertIn(response.status_code, [201, 200])

    def test_create_session_rejects_invalid_type(self):
        """type='live' was a previous bug — it's NOT a valid TYPE_CHOICE."""
        payload = {
            "candidate": self.candidate.pk,
            "type": "live",  # Invalid!
        }
        response = self.client.post(
            "/api/v1/interview/web/sessions/",
            data=payload,
            format="json",
        )
        self.assertEqual(response.status_code, 400)


# ─── NEW: Evaluation API Tests ─────────────────────────────────────────────

class InterviewEvaluationAPITests(TestCase):
    """Tests that evaluation submission uses snake_case and auto-calculates overall_score."""

    def setUp(self):
        self.client = APIClient()
        self.employer = User.objects.create_user(
            email="evaluator@example.com",
            full_name="Evaluator",
            password="password123",
            role="employer",
        )
        self.candidate = User.objects.create_user(
            email="candidate4@example.com",
            full_name="Candidate Four",
            password="password123",
        )
        self.session = InterviewSession.objects.create(candidate=self.candidate)
        self.client.force_authenticate(user=self.employer)

    def test_submit_evaluation_with_snake_case(self):
        """Frontend sends snake_case keys matching Django serializer."""
        payload = {
            "interview": self.session.pk,
            "attitude_score": 8,
            "professional_score": 7,
            "result": "passed",
            "comments": "Good candidate",
            "proposed_salary": 25000000,
        }
        response = self.client.post(
            "/api/v1/interview/web/evaluations/",
            data=payload,
            format="json",
        )
        self.assertIn(response.status_code, [201, 200])

    def test_evaluation_auto_calculates_overall_score(self):
        """overall_score should be (attitude_score + professional_score) / 2"""
        payload = {
            "interview": self.session.pk,
            "attitude_score": 8,
            "professional_score": 6,
            "result": "passed",
        }
        response = self.client.post(
            "/api/v1/interview/web/evaluations/",
            data=payload,
            format="json",
        )
        self.assertIn(response.status_code, [201, 200])
        data = response.json().get("data", response.json())
        # (8 + 6) / 2 = 7.0
        overall = float(data.get("overall_score", 0))
        self.assertEqual(overall, 7.0)


# ─── NEW: Serializer Validation Tests ──────────────────────────────────────

class SerializerValidationTests(TestCase):
    """Tests serializer-level validation without hitting API endpoints."""

    def setUp(self):
        self.candidate = User.objects.create_user(
            email="candidate5@example.com",
            full_name="Candidate Five",
            password="password123",
        )

    def test_create_serializer_requires_candidate(self):
        """candidate is a required field."""
        serializer = InterviewSessionCreateSerializer(data={
            "type": "mixed",
        })
        self.assertFalse(serializer.is_valid())
        self.assertIn("candidate", serializer.errors)

    def test_create_serializer_type_choices(self):
        """Only technical/behavioral/mixed are valid types."""
        for valid_type in ["technical", "behavioral", "mixed"]:
            serializer = InterviewSessionCreateSerializer(data={
                "candidate": self.candidate.pk,
                "type": valid_type,
            })
            self.assertTrue(serializer.is_valid(), f"Type '{valid_type}' should be valid")

        # 'live' is NOT valid
        serializer = InterviewSessionCreateSerializer(data={
            "candidate": self.candidate.pk,
            "type": "live",
        })
        self.assertFalse(serializer.is_valid())

    def test_evaluation_serializer_auto_overall(self):
        """Evaluation serializer auto-calculates overall_score."""
        session = InterviewSession.objects.create(candidate=self.candidate)
        serializer = InterviewEvaluationSerializer(data={
            "interview": session.pk,
            "attitude_score": 9,
            "professional_score": 7,
            "result": "passed",
        })
        self.assertTrue(serializer.is_valid(), serializer.errors)
        self.assertEqual(serializer.validated_data["overall_score"], 8.0)


# ─── NEW: Status Transition Tests ──────────────────────────────────────────

class StatusTransitionTests(TestCase):
    """Tests the state machine for interview status transitions."""

    def setUp(self):
        self.candidate = User.objects.create_user(
            email="candidate6@example.com",
            full_name="Candidate Six",
            password="password123",
        )

    def test_valid_transition_draft_to_scheduled(self):
        session = InterviewSession.objects.create(
            candidate=self.candidate, status="draft"
        )
        session.status = "scheduled"
        session.save()  # Should not raise
        session.refresh_from_db()
        self.assertEqual(session.status, "scheduled")

    def test_invalid_transition_draft_to_completed(self):
        session = InterviewSession.objects.create(
            candidate=self.candidate, status="draft"
        )
        session.status = "completed"
        with self.assertRaises(ValidationError):
            session.save()

    def test_valid_transition_in_progress_to_completed(self):
        session = InterviewSession.objects.create(
            candidate=self.candidate, status="draft"
        )
        # draft -> scheduled -> in_progress -> completed
        session.status = "scheduled"
        session.save()
        session.status = "in_progress"
        session.save()
        session.status = "completed"
        session.save()
        session.refresh_from_db()
        self.assertEqual(session.status, "completed")

    def test_completed_cannot_transition(self):
        session = InterviewSession.objects.create(
            candidate=self.candidate, status="draft"
        )
        session.status = "scheduled"
        session.save()
        session.status = "in_progress"
        session.save()
        session.status = "completed"
        session.save()
        
        session.status = "draft"
        with self.assertRaises(ValidationError):
            session.save()


# ─── NEW: Model Auto-field Tests ───────────────────────────────────────────

class ModelAutoFieldTests(TestCase):
    """Tests that auto-generated fields (room_name, invite_token) work correctly."""

    def setUp(self):
        self.candidate = User.objects.create_user(
            email="candidate7@example.com",
            full_name="Candidate Seven",
            password="password123",
        )

    def test_room_name_auto_generated(self):
        session = InterviewSession.objects.create(candidate=self.candidate)
        self.assertIsNotNone(session.room_name)
        self.assertTrue(session.room_name.startswith("interview-"))

    def test_invite_token_auto_generated(self):
        session = InterviewSession.objects.create(candidate=self.candidate)
        self.assertIsNotNone(session.invite_token)
        self.assertTrue(len(session.invite_token) > 10)

    def test_room_name_is_unique(self):
        s1 = InterviewSession.objects.create(candidate=self.candidate)
        s2 = InterviewSession.objects.create(candidate=self.candidate)
        self.assertNotEqual(s1.room_name, s2.room_name)

    def test_default_status_is_draft(self):
        session = InterviewSession.objects.create(candidate=self.candidate)
        self.assertEqual(session.status, "draft")

    def test_default_type_is_mixed(self):
        session = InterviewSession.objects.create(candidate=self.candidate)
        self.assertEqual(session.type, "mixed")
