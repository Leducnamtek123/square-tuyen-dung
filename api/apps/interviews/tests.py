"""
Interview Module — Comprehensive API & Service Tests

Tests cover:
1. InterviewSession CRUD via API (snake_case validation)
2. InterviewEvaluation submission & auto-calculation
3. Serializer field validation (TYPE_CHOICES, required fields)
4. Status transitions (state machine guards)
"""

import unittest
from unittest.mock import AsyncMock, MagicMock, patch
from datetime import date
from decimal import Decimal
from types import SimpleNamespace
import time

from django.test import TestCase, TransactionTestCase
from django.test import RequestFactory, override_settings
from django.core.exceptions import ValidationError
from django.core.exceptions import SynchronousOnlyOperation
from rest_framework.test import APIClient
from rest_framework import status as drf_status

from apps.accounts.models import User
from apps.interviews.models import (
    InterviewSession, Question, QuestionGroup,
    InterviewTranscript, InterviewEvaluation,
    VoiceProfile, VoiceProfileGrant,
)
from apps.jobs.models import JobPost
from apps.profiles.models import Company, CompanyMember, CompanyRole
from shared.configs import variable_system as var_sys
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

    def test_room_finished_does_not_interrupt_processing_session(self):
        self.session.status = "processing"
        self.session.save(update_fields=["status", "update_at"])

        _handle_livekit_event({"event": "room_finished", "room": self.session.room_name})

        self.session.refresh_from_db()
        self.assertEqual(self.session.status, "processing")


class LiveKitServiceTests(unittest.TestCase):
    @patch("apps.interviews.livekit_service.api.VideoGrants")
    @patch("apps.interviews.livekit_service.api.AccessToken")
    def test_create_hr_presence_token_allows_media_publish(self, mock_access_token_cls, mock_video_grants):
        token_builder = MagicMock()
        token_builder.with_identity.return_value = token_builder
        token_builder.with_name.return_value = token_builder
        token_builder.with_grants.return_value = token_builder
        token_builder.with_metadata.return_value = token_builder
        token_builder.with_attributes.return_value = token_builder
        token_builder.to_jwt.return_value = "jwt-token"
        mock_access_token_cls.return_value = token_builder

        token = LiveKitService.create_hr_presence_token(
            room_name="room-1",
            hr_identity="employer-7",
            hr_name="HR User",
            company_name="Square Tech",
        )

        self.assertEqual(token, "jwt-token")
        mock_video_grants.assert_called_once_with(
            room_join=True,
            room="room-1",
            room_admin=False,
            can_publish=True,
            can_publish_data=True,
            can_subscribe=True,
            hidden=False,
        )

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

class QuestionBankPermissionTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.owner = User.objects.create_user_with_role_name(
            email="question-owner@example.com",
            full_name="Question Owner",
            role_name=var_sys.EMPLOYER,
            password="password123",
            is_active=True,
            has_company=True,
        )
        self.company = Company.objects.create(
            company_name="Question Company",
            company_email="question-company@example.com",
            company_phone="0911000001",
            tax_code="QB000001",
            user=self.owner,
        )
        self.member = User.objects.create_user_with_role_name(
            email="question-member@example.com",
            full_name="Question Member",
            role_name=var_sys.JOB_SEEKER,
            password="password123",
            is_active=True,
        )
        role = CompanyRole.objects.create(
            company=self.company,
            code="question-bank",
            name="Question Bank",
            permissions=["manage_question_bank"],
        )
        CompanyMember.objects.create(
            company=self.company,
            user=self.member,
            role=role,
            status=CompanyMember.STATUS_ACTIVE,
            is_active=True,
        )
        self.other_owner = User.objects.create_user_with_role_name(
            email="other-question-owner@example.com",
            full_name="Other Question Owner",
            role_name=var_sys.EMPLOYER,
            password="password123",
            is_active=True,
            has_company=True,
        )
        self.other_company = Company.objects.create(
            company_name="Other Question Company",
            company_email="other-question-company@example.com",
            company_phone="0911000002",
            tax_code="QB000002",
            user=self.other_owner,
        )
        self.client.force_authenticate(user=self.member)

    def test_member_with_question_bank_permission_sees_global_and_company_questions(self):
        global_question = Question.objects.create(text="Global question")
        company_question = Question.objects.create(text="Company question", company=self.company)
        other_question = Question.objects.create(text="Other question", company=self.other_company)

        response = self.client.get("/api/v1/interview/web/questions/")

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        data = payload.get("data", payload)
        results = data.get("results", data if isinstance(data, list) else [])
        ids = {item["id"] for item in results}
        self.assertIn(global_question.id, ids)
        self.assertIn(company_question.id, ids)
        self.assertNotIn(other_question.id, ids)

    def test_member_created_question_is_scoped_to_active_company(self):
        response = self.client.post(
            "/api/v1/interview/web/questions/",
            data={"text": "Scoped question"},
            format="json",
        )

        self.assertIn(response.status_code, [200, 201])
        question = Question.objects.get(text="Scoped question")
        self.assertEqual(question.company, self.company)
        self.assertEqual(question.author, self.member)

    def test_member_cannot_attach_other_company_question_to_group(self):
        other_question = Question.objects.create(text="Other company question", company=self.other_company)

        response = self.client.post(
            "/api/v1/interview/web/question-groups/",
            data={"name": "Invalid scoped group", "question_ids": [other_question.id]},
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertFalse(QuestionGroup.objects.filter(name="Invalid scoped group").exists())

    def test_member_cannot_modify_or_delete_global_question_bank_items(self):
        global_question = Question.objects.create(text="Global question")
        global_group = QuestionGroup.objects.create(name="Global group")
        global_group.questions.add(global_question)

        question_update_response = self.client.patch(
            f"/api/v1/interview/web/questions/{global_question.id}/",
            data={"text": "Changed global question"},
            format="json",
        )
        question_delete_response = self.client.delete(
            f"/api/v1/interview/web/questions/{global_question.id}/",
        )
        group_update_response = self.client.patch(
            f"/api/v1/interview/web/question-groups/{global_group.id}/",
            data={"name": "Changed global group"},
            format="json",
        )
        group_delete_response = self.client.delete(
            f"/api/v1/interview/web/question-groups/{global_group.id}/",
        )

        self.assertEqual(question_update_response.status_code, 403)
        self.assertEqual(question_delete_response.status_code, 403)
        self.assertEqual(group_update_response.status_code, 403)
        self.assertEqual(group_delete_response.status_code, 403)
        global_question.refresh_from_db()
        global_group.refresh_from_db()
        self.assertEqual(global_question.text, "Global question")
        self.assertEqual(global_group.name, "Global group")


class VoiceProfileGrantAdminTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_user_with_role_name(
            email="voice-grant-admin@example.com",
            full_name="Voice Grant Admin",
            role_name=var_sys.ADMIN,
            password="password123",
            is_active=True,
            is_staff=True,
        )
        self.company_owner = User.objects.create_user_with_role_name(
            email="voice-company-owner@example.com",
            full_name="Voice Company Owner",
            role_name=var_sys.EMPLOYER,
            password="password123",
            has_company=True,
            is_active=True,
        )
        self.other_owner = User.objects.create_user_with_role_name(
            email="voice-other-owner@example.com",
            full_name="Voice Other Owner",
            role_name=var_sys.EMPLOYER,
            password="password123",
            has_company=True,
            is_active=True,
        )
        self.company = Company.objects.create(
            company_name="Voice Grant Company",
            company_email="voice-grant-company@example.com",
            company_phone="0913000001",
            tax_code="VG000001",
            user=self.company_owner,
        )
        self.other_company = Company.objects.create(
            company_name="Voice Grant Other Company",
            company_email="voice-grant-other-company@example.com",
            company_phone="0913000002",
            tax_code="VG000002",
            user=self.other_owner,
        )
        self.other_job = JobPost.objects.create(
            job_name="Other Company Interview Job",
            deadline=date(2030, 1, 1),
            quantity=1,
            job_description="<p>Interview job</p>",
            position=4,
            type_of_workplace=1,
            experience=2,
            academic_level=2,
            job_type=1,
            salary_min=10000000,
            salary_max=20000000,
            contact_person_name="HR",
            contact_person_phone="0901234567",
            contact_person_email="hr@example.com",
            user=self.other_owner,
            company=self.other_company,
        )
        self.profile = VoiceProfile.objects.create(
            name="Ready Interview Voice",
            voice_type=VoiceProfile.TYPE_PRESET,
            status=VoiceProfile.STATUS_READY,
            preset_voice_id="vi-ready-voice",
            created_by=self.admin,
        )
        self.client.force_authenticate(user=self.admin)

    def test_admin_cannot_grant_voice_profile_to_company_with_other_company_job(self):
        response = self.client.post(
            "/api/v1/interview/admin/voice-profile-grants/",
            data={
                "profile": self.profile.id,
                "company": self.company.id,
                "jobPost": self.other_job.id,
                "isDefault": True,
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertFalse(
            VoiceProfileGrant.objects.filter(
                profile=self.profile,
                company=self.company,
                job_post=self.other_job,
            ).exists()
        )


class InterviewSessionAPITests(TestCase):
    """Tests that the session API accepts snake_case fields and rejects camelCase."""

    def setUp(self):
        self.client = APIClient()
        self.employer = User.objects.create_user_with_role_name(
            email="employer@example.com",
            full_name="Employer HR",
            role_name=var_sys.EMPLOYER,
            password="password123",
            has_company=True,
        )
        self.company = Company.objects.create(
            company_name="Interview API Company",
            company_email="interview-api-company@example.com",
            company_phone="0912000001",
            tax_code="IA000001",
            user=self.employer,
        )
        self.candidate = User.objects.create_user(
            email="candidate3@example.com",
            full_name="Candidate Three",
            password="password123",
        )
        self.client.force_authenticate(user=self.employer)

    def _create_job_post(self, owner, company, name="Interview Job"):
        return JobPost.objects.create(
            job_name=name,
            deadline=date(2030, 1, 1),
            quantity=1,
            job_description="<p>Interview job</p>",
            position=4,
            type_of_workplace=1,
            experience=2,
            academic_level=2,
            job_type=1,
            salary_min=10000000,
            salary_max=20000000,
            contact_person_name="HR",
            contact_person_phone="0901234567",
            contact_person_email="hr@example.com",
            user=owner,
            company=company,
        )

    def test_list_sessions_returns_200(self):
        InterviewSession.objects.create(candidate=self.candidate)
        response = self.client.get("/api/v1/interview/web/sessions/")
        self.assertEqual(response.status_code, 200)

    def test_retrieve_session_detail(self):
        session = InterviewSession.objects.create(candidate=self.candidate, created_by=self.employer)
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

    def test_create_session_rejects_non_job_seeker_candidate(self):
        other_employer = User.objects.create_user_with_role_name(
            email="invalid-candidate-employer@example.com",
            full_name="Invalid Candidate Employer",
            role_name=var_sys.EMPLOYER,
            password="password123",
            has_company=True,
        )

        response = self.client.post(
            "/api/v1/interview/web/sessions/",
            data={
                "candidate": other_employer.pk,
                "type": "mixed",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertFalse(InterviewSession.objects.filter(candidate=other_employer).exists())

    def test_candidate_cannot_request_employer_monitoring_actions(self):
        session = InterviewSession.objects.create(
            candidate=self.candidate,
            created_by=self.employer,
            status="scheduled",
        )
        self.client.force_authenticate(user=self.candidate)

        post_endpoints = [
            f"/api/v1/interview/web/sessions/{session.pk}/evaluate-ai/",
            f"/api/v1/interview/web/sessions/{session.pk}/observer-token/",
            f"/api/v1/interview/web/sessions/{session.pk}/hr-token/",
        ]
        for endpoint in post_endpoints:
            response = self.client.post(endpoint, format="json")
            self.assertEqual(response.status_code, 403)

        response = self.client.get(f"/api/v1/interview/web/sessions/{session.pk}/live-metrics/")
        self.assertEqual(response.status_code, 403)

    def test_evaluation_list_uses_selected_company_header(self):
        member = User.objects.create_user_with_role_name(
            email="evaluation-member@example.com",
            full_name="Evaluation Member",
            role_name=var_sys.JOB_SEEKER,
            password="password123",
            is_active=True,
        )
        first_role = CompanyRole.objects.create(
            company=self.company,
            code="first-interview-manager",
            name="First Interview Manager",
            permissions=["manage_interviews"],
        )
        CompanyMember.objects.create(
            company=self.company,
            user=member,
            role=first_role,
            status=CompanyMember.STATUS_ACTIVE,
            is_active=True,
        )

        other_owner = User.objects.create_user_with_role_name(
            email="evaluation-other-owner@example.com",
            full_name="Evaluation Other Owner",
            role_name=var_sys.EMPLOYER,
            password="password123",
            has_company=True,
            is_active=True,
        )
        other_company = Company.objects.create(
            company_name="Evaluation Other Company",
            company_email="evaluation-other-company@example.com",
            company_phone="0912000099",
            tax_code="EA000099",
            user=other_owner,
        )
        second_role = CompanyRole.objects.create(
            company=other_company,
            code="second-interview-manager",
            name="Second Interview Manager",
            permissions=["manage_interviews"],
        )
        CompanyMember.objects.create(
            company=other_company,
            user=member,
            role=second_role,
            status=CompanyMember.STATUS_ACTIVE,
            is_active=True,
        )

        first_job = self._create_job_post(self.employer, self.company, "First evaluation job")
        second_job = self._create_job_post(other_owner, other_company, "Second evaluation job")
        first_session = InterviewSession.objects.create(
            candidate=self.candidate,
            created_by=self.employer,
            job_post=first_job,
        )
        second_session = InterviewSession.objects.create(
            candidate=self.candidate,
            created_by=other_owner,
            job_post=second_job,
        )
        first_evaluation = InterviewEvaluation.objects.create(
            interview=first_session,
            evaluator=self.employer,
            result="passed",
        )
        second_evaluation = InterviewEvaluation.objects.create(
            interview=second_session,
            evaluator=other_owner,
            result="passed",
        )

        self.client.force_authenticate(user=member)
        response = self.client.get(
            "/api/v1/interview/web/evaluations/",
            HTTP_X_ACTIVE_COMPANY_ID=str(other_company.id),
        )

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        items = payload.get("data", payload)
        if isinstance(items, dict):
            items = items.get("results", [])
        result_ids = {item["id"] for item in items}
        self.assertIn(second_evaluation.id, result_ids)
        self.assertNotIn(first_evaluation.id, result_ids)

    def test_sse_stream_permission_requires_session_scope(self):
        from apps.interviews.sse_views import _user_can_stream_session

        other_employer = User.objects.create_user_with_role_name(
            email="other-sse-employer@example.com",
            full_name="Other SSE Employer",
            role_name=var_sys.EMPLOYER,
            password="password123",
            has_company=True,
        )
        session = InterviewSession.objects.create(
            candidate=self.candidate,
            created_by=self.employer,
            status="scheduled",
        )

        self.assertTrue(_user_can_stream_session(self.employer, session))
        self.assertFalse(_user_can_stream_session(other_employer, session))

    def test_sse_stream_permission_uses_selected_company_query_param(self):
        from apps.interviews.sse_views import _user_can_stream_session

        member = User.objects.create_user_with_role_name(
            email="sse-member@example.com",
            full_name="SSE Member",
            role_name=var_sys.JOB_SEEKER,
            password="password123",
            is_active=True,
        )
        first_role = CompanyRole.objects.create(
            company=self.company,
            code="first-sse-manager",
            name="First SSE Manager",
            permissions=["manage_interviews"],
        )
        CompanyMember.objects.create(
            company=self.company,
            user=member,
            role=first_role,
            status=CompanyMember.STATUS_ACTIVE,
            is_active=True,
        )
        other_owner = User.objects.create_user_with_role_name(
            email="other-sse-owner@example.com",
            full_name="Other SSE Owner",
            role_name=var_sys.EMPLOYER,
            password="password123",
            has_company=True,
            is_active=True,
        )
        other_company = Company.objects.create(
            company_name="Other SSE Company",
            company_email="other-sse-company@example.com",
            company_phone="0912000199",
            tax_code="SSE000199",
            user=other_owner,
        )
        second_role = CompanyRole.objects.create(
            company=other_company,
            code="second-sse-manager",
            name="Second SSE Manager",
            permissions=["manage_interviews"],
        )
        CompanyMember.objects.create(
            company=other_company,
            user=member,
            role=second_role,
            status=CompanyMember.STATUS_ACTIVE,
            is_active=True,
        )
        second_job = self._create_job_post(other_owner, other_company, "Second SSE job")
        session = InterviewSession.objects.create(
            candidate=self.candidate,
            created_by=other_owner,
            job_post=second_job,
        )
        request = RequestFactory().get(
            f"/api/v1/interview/web/sessions/{session.id}/stream/",
            {"activeCompanyId": str(other_company.id)},
        )
        request.user = member

        self.assertTrue(_user_can_stream_session(member, session, request))


# ─── NEW: Evaluation API Tests ─────────────────────────────────────────────

    @patch(
        "apps.interviews.views.run_django_sync_in_thread",
        side_effect=lambda func, *args, **kwargs: func(*args, **kwargs),
    )
    @patch("apps.interviews.tasks.evaluate_interview_session.delay")
    def test_update_status_by_room_completes_without_async_orm_error(self, mock_delay, mock_thread):
        session = InterviewSession.objects.create(
            candidate=self.candidate,
            created_by=self.employer,
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
        self.assertGreaterEqual(mock_thread.call_count, 1)

    @patch(
        "apps.interviews.views.run_django_sync_in_thread",
        side_effect=lambda func, *args, **kwargs: func(*args, **kwargs),
    )
    def test_anonymous_status_update_without_invite_token_is_rejected_when_agent_auth_disabled(self, mock_thread):
        anonymous_client = APIClient()
        session = InterviewSession.objects.create(
            candidate=self.candidate,
            created_by=self.employer,
            status="scheduled",
        )

        response = anonymous_client.patch(
            f"/api/v1/interview/web/sessions/{session.room_name}/status/",
            data={"status": "calibration"},
            format="json",
        )

        self.assertEqual(response.status_code, 401)
        session.refresh_from_db()
        self.assertEqual(session.status, "scheduled")
        mock_thread.assert_not_called()

    @override_settings(INTERVIEW_AGENT_SHARED_SECRET="agent-secret", INTERVIEW_AGENT_AUTH_REQUIRED=True)
    @patch(
        "apps.interviews.views.run_django_sync_in_thread",
        side_effect=lambda func, *args, **kwargs: func(*args, **kwargs),
    )
    def test_authenticated_user_can_update_status_without_agent_signature(self, mock_thread):
        session = InterviewSession.objects.create(
            candidate=self.candidate,
            created_by=self.employer,
            status="scheduled",
        )

        response = self.client.patch(
            f"/api/v1/interview/web/sessions/{session.room_name}/status/",
            data={"status": "calibration"},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        session.refresh_from_db()
        self.assertEqual(session.status, "calibration")
        self.assertGreaterEqual(mock_thread.call_count, 1)

    @override_settings(INTERVIEW_AGENT_SHARED_SECRET="agent-secret", INTERVIEW_AGENT_AUTH_REQUIRED=True)
    @patch(
        "apps.interviews.views.run_django_sync_in_thread",
        side_effect=lambda func, *args, **kwargs: func(*args, **kwargs),
    )
    def test_invite_token_can_update_candidate_session_status_without_agent_signature(self, mock_thread):
        anonymous_client = APIClient()
        session = InterviewSession.objects.create(
            candidate=self.candidate,
            status="scheduled",
        )

        response = anonymous_client.patch(
            f"/api/v1/interview/web/sessions/{session.room_name}/status/",
            data={"status": "calibration", "invite_token": session.invite_token},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        session.refresh_from_db()
        self.assertEqual(session.status, "calibration")
        self.assertGreaterEqual(mock_thread.call_count, 1)

    @override_settings(INTERVIEW_AGENT_SHARED_SECRET="agent-secret", INTERVIEW_AGENT_AUTH_REQUIRED=True)
    @patch(
        "apps.interviews.views.run_django_sync_in_thread",
        side_effect=lambda func, *args, **kwargs: func(*args, **kwargs),
    )
    @patch("apps.interviews.tasks.end_interview_session.apply_async")
    @patch(
        "rest_framework.views.APIView.perform_authentication",
        side_effect=SynchronousOnlyOperation("OAuth auth attempted in async context"),
    )
    def test_invite_token_status_update_skips_drf_authentication(self, mock_auth, mock_end_task, mock_thread):
        anonymous_client = APIClient()
        session = InterviewSession.objects.create(
            candidate=self.candidate,
            status="scheduled",
        )

        response = anonymous_client.patch(
            f"/api/v1/interview/web/sessions/{session.room_name}/status/",
            data={"status": "in_progress", "invite_token": session.invite_token},
            format="json",
            HTTP_AUTHORIZATION="Bearer stale-browser-token",
        )

        self.assertEqual(response.status_code, 200)
        session.refresh_from_db()
        self.assertEqual(session.status, "in_progress")
        mock_auth.assert_not_called()
        mock_end_task.assert_called_once()
        self.assertGreaterEqual(mock_thread.call_count, 1)

    @override_settings(INTERVIEW_AGENT_SHARED_SECRET="agent-secret", INTERVIEW_AGENT_AUTH_REQUIRED=True)
    def test_unsigned_anonymous_status_update_without_invite_token_is_rejected(self):
        anonymous_client = APIClient()
        session = InterviewSession.objects.create(
            candidate=self.candidate,
            status="scheduled",
        )

        response = anonymous_client.patch(
            f"/api/v1/interview/web/sessions/{session.room_name}/status/",
            data={"status": "calibration"},
            format="json",
        )

        self.assertEqual(response.status_code, 401)


    def test_create_session_rejects_question_ids_outside_company(self):
        other_owner = User.objects.create_user_with_role_name(
            email="other-session-owner@example.com",
            full_name="Other Session Owner",
            role_name=var_sys.EMPLOYER,
            password="password123",
            is_active=True,
            has_company=True,
        )
        other_company = Company.objects.create(
            company_name="Other Session Company",
            company_email="other-session-company@example.com",
            company_phone="0912000003",
            tax_code="IS000003",
            user=other_owner,
        )
        other_question = Question.objects.create(text="Other session question", company=other_company)

        response = self.client.post(
            "/api/v1/interview/web/sessions/",
            data={
                "candidate": self.candidate.pk,
                "type": "mixed",
                "question_ids": [other_question.id],
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)

    def test_admin_create_session_rejects_company_group_for_other_company_job(self):
        admin = User.objects.create_user_with_role_name(
            email="session-admin@example.com",
            full_name="Session Admin",
            role_name=var_sys.ADMIN,
            password="password123",
            is_active=True,
            is_staff=True,
        )
        other_owner = User.objects.create_user_with_role_name(
            email="other-admin-session-owner@example.com",
            full_name="Other Admin Session Owner",
            role_name=var_sys.EMPLOYER,
            password="password123",
            is_active=True,
            has_company=True,
        )
        other_company = Company.objects.create(
            company_name="Other Admin Session Company",
            company_email="other-admin-session-company@example.com",
            company_phone="0912000004",
            tax_code="IS000004",
            user=other_owner,
        )
        other_job = self._create_job_post(other_owner, other_company, "Other company job")
        company_group = QuestionGroup.objects.create(
            name="Company scoped group",
            company=self.company,
        )
        self.client.force_authenticate(user=admin)

        response = self.client.post(
            "/api/v1/interview/web/sessions/",
            data={
                "candidate": self.candidate.pk,
                "job_post": other_job.id,
                "question_group": company_group.id,
                "type": "mixed",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertFalse(
            InterviewSession.objects.filter(
                candidate=self.candidate,
                job_post=other_job,
                question_group=company_group,
            ).exists()
        )

    def test_admin_create_session_rejects_company_questions_for_other_company_job(self):
        admin = User.objects.create_user_with_role_name(
            email="session-question-admin@example.com",
            full_name="Session Question Admin",
            role_name=var_sys.ADMIN,
            password="password123",
            is_active=True,
            is_staff=True,
        )
        other_owner = User.objects.create_user_with_role_name(
            email="other-admin-session-question-owner@example.com",
            full_name="Other Admin Session Question Owner",
            role_name=var_sys.EMPLOYER,
            password="password123",
            is_active=True,
            has_company=True,
        )
        other_company = Company.objects.create(
            company_name="Other Admin Session Question Company",
            company_email="other-admin-session-question-company@example.com",
            company_phone="0912000005",
            tax_code="IS000005",
            user=other_owner,
        )
        other_job = self._create_job_post(other_owner, other_company, "Other company question job")
        company_question = Question.objects.create(
            text="Company scoped question",
            company=self.company,
        )
        self.client.force_authenticate(user=admin)

        response = self.client.post(
            "/api/v1/interview/web/sessions/",
            data={
                "candidate": self.candidate.pk,
                "job_post": other_job.id,
                "question_ids": [company_question.id],
                "type": "mixed",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertFalse(
            InterviewSession.objects.filter(
                candidate=self.candidate,
                job_post=other_job,
                questions=company_question,
            ).exists()
        )


class InterviewEvaluationAPITests(TestCase):
    """Tests that evaluation submission uses snake_case and auto-calculates overall_score."""

    def setUp(self):
        self.client = APIClient()
        self.employer = User.objects.create_user_with_role_name(
            email="evaluator@example.com",
            full_name="Evaluator",
            role_name=var_sys.EMPLOYER,
            password="password123",
            has_company=True,
        )
        self.company = Company.objects.create(
            company_name="Evaluation API Company",
            company_email="evaluation-api-company@example.com",
            company_phone="0912000002",
            tax_code="EA000001",
            user=self.employer,
        )
        self.candidate = User.objects.create_user(
            email="candidate4@example.com",
            full_name="Candidate Four",
            password="password123",
        )
        self.session = InterviewSession.objects.create(
            candidate=self.candidate,
            created_by=self.employer,
        )
        self.client.force_authenticate(user=self.employer)

    def _create_job_post(self, owner, company, name):
        return JobPost.objects.create(
            job_name=name,
            deadline=date(2030, 1, 1),
            quantity=1,
            job_description="<p>Interview evaluation job</p>",
            position=4,
            type_of_workplace=1,
            experience=2,
            academic_level=2,
            job_type=1,
            salary_min=10000000,
            salary_max=20000000,
            contact_person_name="HR",
            contact_person_phone="0901234567",
            contact_person_email="hr@example.com",
            user=owner,
            company=company,
        )

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

    def test_submit_evaluation_updates_existing_interview_evaluation(self):
        existing = InterviewEvaluation.objects.create(
            interview=self.session,
            evaluator=self.employer,
            attitude_score=Decimal("3.00"),
            professional_score=Decimal("4.00"),
            overall_score=Decimal("3.50"),
            result="failed",
            comments="Old evaluation",
            proposed_salary=10000000,
        )
        payload = {
            "interview": self.session.pk,
            "attitude_score": 10,
            "professional_score": 5,
            "result": "passed",
            "comments": "Updated evaluation",
            "proposed_salary": 50000000,
        }

        response = self.client.post(
            "/api/v1/interview/web/evaluations/",
            data=payload,
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(self.session.evaluations.count(), 1)
        existing.refresh_from_db()
        self.assertEqual(existing.result, "passed")
        self.assertEqual(existing.comments, "Updated evaluation")
        self.assertEqual(existing.proposed_salary, 50000000)
        self.assertEqual(existing.overall_score, Decimal("7.50"))

    def test_candidate_cannot_submit_evaluation_for_own_interview(self):
        self.client.force_authenticate(user=self.candidate)
        payload = {
            "interview": self.session.pk,
            "attitude_score": 8,
            "professional_score": 7,
            "result": "passed",
        }

        response = self.client.post(
            "/api/v1/interview/web/evaluations/",
            data=payload,
            format="json",
        )

        self.assertEqual(response.status_code, 403)


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

    def test_evaluation_serializer_rejects_scores_outside_ten_point_scale(self):
        session = InterviewSession.objects.create(candidate=self.candidate)

        invalid_score_cases = [
            ("attitude_score", -0.1),
            ("attitude_score", 10.1),
            ("professional_score", -0.1),
            ("professional_score", 10.1),
        ]

        for field_name, value in invalid_score_cases:
            with self.subTest(field_name=field_name, value=value):
                payload = {
                    "interview": session.pk,
                    "attitude_score": 5,
                    "professional_score": 5,
                    field_name: value,
                    "result": "passed",
                }
                serializer = InterviewEvaluationSerializer(data=payload)

                self.assertFalse(serializer.is_valid())
                self.assertIn(field_name, serializer.errors)

    def test_evaluation_serializer_rejects_negative_proposed_salary(self):
        session = InterviewSession.objects.create(candidate=self.candidate)

        serializer = InterviewEvaluationSerializer(data={
            "interview": session.pk,
            "attitude_score": 8,
            "professional_score": 7,
            "result": "passed",
            "proposed_salary": -1,
        })

        self.assertFalse(serializer.is_valid())
        self.assertIn("proposed_salary", serializer.errors)


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
