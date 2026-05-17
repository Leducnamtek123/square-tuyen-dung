"""
Interview Module — Comprehensive API & Service Tests

Tests cover:
1. InterviewSession CRUD via API (snake_case validation)
2. InterviewEvaluation submission & auto-calculation
3. Serializer field validation (TYPE_CHOICES, required fields)
4. Status transitions (state machine guards)
"""

from unittest.mock import AsyncMock, patch
from decimal import Decimal
from types import SimpleNamespace
import time

from django.test import TestCase, TransactionTestCase
from django.test import RequestFactory, override_settings
from django.core.exceptions import ValidationError
from rest_framework.test import APIClient
from rest_framework import status as drf_status

from apps.accounts.models import User
from apps.interviews.models import (
    InterviewSession, Question, QuestionGroup,
    InterviewTranscript, InterviewEvaluation,
)
from apps.interviews.agent_auth import build_signature
from apps.interviews.serializers import (
    InterviewSessionCreateSerializer,
    InterviewEvaluationSerializer,
    QuestionSerializer,
)
from apps.interviews.services import (
    append_transcript,
    advance_question_cursor,
    build_interview_context,
    create_hr_presence_livekit_token,
    get_next_question_payload,
    update_interview_status,
)
from apps.interviews.livekit_service import LiveKitService
from integrations.livekit.webhook import _handle_livekit_event, livekit_webhook


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
        self.assertIn("interviewSubject", context)

    def test_build_interview_context_includes_topic_details(self):
        group = QuestionGroup.objects.create(name="Backend screening", description="<p>Test the backend stack</p>")
        self.session.question_group = group
        self.session.save(update_fields=["question_group", "update_at"])

        context = build_interview_context(self.session)

        self.assertEqual(context["questionGroupName"], "Backend screening")
        self.assertEqual(context["questionGroupDescription"], "Test the backend stack")
        self.assertEqual(context["interviewSubject"], "Backend screening")

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


class InterviewCompatEndpointTests(TransactionTestCase):
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

    def test_status_endpoint_updates_session(self):
        response = self.client.patch(
            f"/api/v1/interview/compat/{self.session.room_name}/status",
            data={"status": "scheduled"},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.session.refresh_from_db()
        self.assertEqual(self.session.status, "scheduled")
        self.assertEqual(response.json()["status"], "scheduled")

    @override_settings(INTERVIEW_AGENT_SHARED_SECRET="agent-secret", INTERVIEW_AGENT_AUTH_REQUIRED=True)
    def test_agent_auth_required_blocks_unsigned_context_request(self):
        response = self.client.get(f"/api/v1/interview/compat/{self.session.room_name}/context")

        self.assertEqual(response.status_code, 401)

    @override_settings(INTERVIEW_AGENT_SHARED_SECRET="agent-secret", INTERVIEW_AGENT_AUTH_REQUIRED=True)
    def test_agent_auth_accepts_signed_context_request(self):
        path = f"/api/v1/interview/compat/{self.session.room_name}/context"
        timestamp = str(int(time.time()))
        signature = build_signature("agent-secret", "GET", path, timestamp, b"")

        response = self.client.get(
            path,
            HTTP_X_SQUARE_AGENT_TIMESTAMP=timestamp,
            HTTP_X_SQUARE_AGENT_SIGNATURE=signature,
        )

        self.assertEqual(response.status_code, 200)
        self.assertIn("candidateEmail", response.json())


class _FakeFileResult:
    def __init__(self, location: str):
        self.location = location


class _FakeEgressInfo:
    def __init__(self, room_name: str, file_results: list[_FakeFileResult]):
        self.roomName = room_name
        self.fileResults = file_results


class _FakeWebhookEvent:
    def __init__(self, room_name: str, recording_url: str):
        self.event = "egress_ended"
        self.egressInfo = _FakeEgressInfo(room_name, [_FakeFileResult(recording_url)])


class LiveKitWebhookTests(TestCase):
    def setUp(self):
        self.factory = RequestFactory()
        self.candidate = User.objects.create_user(
            email="candidate-webhook@example.com",
            full_name="Candidate Webhook",
            password="password123",
        )
        self.session = InterviewSession.objects.create(
            candidate=self.candidate,
            status="completed",
        )

    def test_handle_livekit_event_updates_recording_url_from_egress_event_object(self):
        _handle_livekit_event(_FakeWebhookEvent(self.session.room_name, "http://localhost:9000/square/interviews/demo/recording.mp4"))

        self.session.refresh_from_db()
        self.assertEqual(
            self.session.recording_url,
            "http://localhost:9000/square/interviews/demo/recording.mp4",
        )

    @override_settings(LIVEKIT_API_KEY="devkey", LIVEKIT_API_SECRET="secret", LIVEKIT_WEBHOOK_STRICT=True)
    @patch("livekit.api.TokenVerifier")
    @patch("livekit.api.WebhookReceiver")
    def test_livekit_webhook_processes_verified_event_object(self, mock_receiver_cls, mock_verifier_cls):
        fake_event = _FakeWebhookEvent(self.session.room_name, "http://localhost:9000/square/interviews/demo/recording.mp4")
        mock_receiver = mock_receiver_cls.return_value
        mock_receiver.receive.return_value = fake_event

        request = self.factory.post(
            "/api/v1/livekit/webhook",
            data="{}",
            content_type="application/webhook+json",
            HTTP_AUTHORIZATION="Bearer signed-token",
        )

        response = livekit_webhook(request)

        self.assertEqual(response.status_code, 200)
        self.session.refresh_from_db()
        self.assertEqual(
            self.session.recording_url,
            "http://localhost:9000/square/interviews/demo/recording.mp4",
        )


class LiveKitServiceTests(TestCase):
    @patch("apps.interviews.livekit_service.api.LiveKitAPI")
    def test_ensure_room_with_agent_dispatches_agent_for_existing_room(self, mock_livekit_api_cls):
        mock_api = mock_livekit_api_cls.return_value
        mock_api.aclose = AsyncMock()
        mock_api.room = SimpleNamespace(
            list_rooms=AsyncMock(return_value=SimpleNamespace(rooms=[object()])),
            create_room=AsyncMock(),
            delete_room=AsyncMock(),
            list_participants=AsyncMock(),
        )
        mock_api.agent_dispatch = SimpleNamespace(
            list_dispatch=AsyncMock(return_value=[]),
            create_dispatch=AsyncMock(),
        )

        LiveKitService.ensure_room_with_agent("interview-existing-room")

        mock_api.room.create_room.assert_not_called()
        mock_api.room.delete_room.assert_not_called()
        mock_api.agent_dispatch.create_dispatch.assert_awaited_once()

    @patch("apps.interviews.livekit_service.api.LiveKitAPI")
    def test_ensure_room_with_agent_does_not_duplicate_existing_dispatch(self, mock_livekit_api_cls):
        mock_api = mock_livekit_api_cls.return_value
        mock_api.aclose = AsyncMock()
        mock_api.room = SimpleNamespace(
            list_rooms=AsyncMock(return_value=SimpleNamespace(rooms=[object()])),
            create_room=AsyncMock(),
            delete_room=AsyncMock(),
            list_participants=AsyncMock(),
        )
        mock_api.agent_dispatch = SimpleNamespace(
            list_dispatch=AsyncMock(
                return_value=[SimpleNamespace(agent_name="square-ai-interviewer")]
            ),
            create_dispatch=AsyncMock(),
        )

        LiveKitService.ensure_room_with_agent("interview-existing-room")

        mock_api.room.create_room.assert_not_called()
        mock_api.agent_dispatch.create_dispatch.assert_not_called()

    @patch("apps.interviews.services.LiveKitService.create_hr_presence_token", return_value="fake-token")
    def test_create_hr_presence_livekit_token_includes_company_name(self, mock_create_hr_presence_token):
        session = SimpleNamespace(room_name="room-123", status="in_progress")
        request = SimpleNamespace(
            user=SimpleNamespace(
                id=7,
                full_name="HR User",
                email="hr@example.com",
                active_company=SimpleNamespace(company_name="Square Tech"),
            )
        )

        data = create_hr_presence_livekit_token(session, request)

        self.assertEqual(data["participant_name"], "HR User")
        self.assertEqual(data["company_name"], "Square Tech")
        mock_create_hr_presence_token.assert_called_once_with(
            room_name="room-123",
            hr_identity="employer-7",
            hr_name="HR User",
            company_name="Square Tech",
        )


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

    @patch(
        "apps.interviews.views.run_django_sync_in_thread",
        side_effect=lambda func, *args, **kwargs: func(*args, **kwargs),
    )
    @patch("apps.interviews.tasks.evaluate_interview_session.delay")
    def test_update_status_by_room_completes_without_async_orm_error(self, mock_delay, mock_thread):
        session = InterviewSession.objects.create(
            candidate=self.candidate,
            status="scheduled",
        )

        response = self.client.patch(
            f"/api/v1/interview/web/sessions/{session.room_name}/status/",
            data={"status": "completed"},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json().get("data", {}).get("status"), "completed")
        session.refresh_from_db()
        self.assertEqual(session.status, "processing")
        mock_delay.assert_called_once_with(session.id)
        mock_thread.assert_called_once()


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
