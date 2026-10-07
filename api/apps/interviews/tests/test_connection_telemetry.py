import json
from unittest.mock import patch, MagicMock
from django.test import TestCase, override_settings
from django.utils import timezone
from rest_framework.test import APIClient
from apps.accounts.models import User
from apps.interviews.models import InterviewSession, InterviewConnectionLog
from integrations.livekit.webhook import _handle_livekit_event
from apps.interviews.tasks import finalize_disconnected_session


class WebRTCConnectionTelemetryModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="candidate_telemetry@test.com",
            full_name="Candidate Telemetry",
            password="password123",
            role_name="job_seeker",
        )
        self.session = InterviewSession.objects.create(
            candidate=self.user,
            status="in_progress",
            room_name="test-room-telemetry",
            invite_token="token-telemetry-123",
        )

    def test_create_connection_log(self):
        log = InterviewConnectionLog.objects.create(
            session=self.session,
            participant_identity="candidate-1",
            participant_role="candidate",
            event_type="reconnecting",
            downtime_seconds=0.0,
            reconnect_attempt=1,
            network_quality="poor",
            metadata={"rtt": 250, "packet_loss": 0.05},
        )
        self.assertEqual(log.session, self.session)
        self.assertEqual(log.event_type, "reconnecting")
        self.assertEqual(self.session.connection_logs.count(), 1)
        self.assertIn("ConnectionLog", str(log))

    def test_reconnected_log_with_downtime(self):
        log = InterviewConnectionLog.objects.create(
            session=self.session,
            participant_identity="candidate-1",
            participant_role="candidate",
            event_type="reconnected",
            downtime_seconds=4.5,
            reconnect_attempt=1,
            network_quality="good",
            metadata={"rtt": 45},
        )
        self.assertEqual(log.downtime_seconds, 4.5)
        self.assertEqual(log.event_type, "reconnected")


class WebRTCConnectionTelemetryAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email="candidate_api@test.com",
            full_name="Candidate API",
            password="password123",
            role_name="job_seeker",
        )
        self.session = InterviewSession.objects.create(
            candidate=self.user,
            status="in_progress",
            room_name="test-room-telemetry-api",
            invite_token="token-telemetry-api-123",
        )

    def test_post_connection_log_via_invite_token(self):
        url = f"/api/v1/interview/web/sessions/{self.session.id}/connection-logs/?token={self.session.invite_token}"
        payload = {
            "eventType": "reconnected",
            "downtimeSeconds": 3.2,
            "reconnectAttempt": 2,
            "networkQuality": "good",
            "participantIdentity": "candidate-99",
            "details": {"packetLoss": 0.01},
        }
        res = self.client.post(url, data=json.dumps(payload), content_type="application/json")
        self.assertEqual(res.status_code, 201)
        data = res.json().get("data", {})
        self.assertEqual(data.get("eventType"), "reconnected")
        self.assertEqual(data.get("downtimeSeconds"), 3.2)
        self.assertEqual(data.get("reconnectAttempt"), 2)
        self.assertEqual(self.session.connection_logs.count(), 1)

    def test_get_connection_logs_via_invite_token(self):
        InterviewConnectionLog.objects.create(
            session=self.session,
            participant_identity="candidate-1",
            event_type="disconnected",
            downtime_seconds=0.0,
        )
        InterviewConnectionLog.objects.create(
            session=self.session,
            participant_identity="candidate-1",
            event_type="reconnected",
            downtime_seconds=2.1,
        )
        url = f"/api/v1/interview/web/sessions/{self.session.id}/connection-logs/?token={self.session.invite_token}"
        res = self.client.get(url)
        self.assertEqual(res.status_code, 200)
        logs = res.json().get("data", [])
        self.assertEqual(len(logs), 2)


class WebRTCAutoLoggingTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="candidate_autolog@test.com",
            full_name="Candidate Autolog",
            password="password123",
            role_name="job_seeker",
        )
        self.session = InterviewSession.objects.create(
            candidate=self.user,
            status="in_progress",
            room_name="room-autolog-test",
            invite_token="token-autolog-123",
        )

    @patch("apps.interviews.tasks.finalize_disconnected_session.apply_async")
    def test_livekit_webhook_auto_logs_disconnection(self, mock_finalize):
        class FakeWebhookPayload:
            event = "room_disconnected"
            room_name = "room-autolog-test"

        _handle_livekit_event(FakeWebhookPayload())
        self.session.refresh_from_db()
        self.assertEqual(self.session.status, "interrupted")
        disconnect_log = self.session.connection_logs.filter(event_type="disconnected").first()
        self.assertIsNotNone(disconnect_log)
        self.assertEqual(disconnect_log.participant_role, "agent")

    @patch("apps.interviews.services.LiveKitService.has_active_participants")
    def test_finalize_disconnected_session_auto_logs_reconnection(self, mock_active):
        mock_active.return_value = True
        self.session.status = "interrupted"
        self.session.save(update_fields=["status"])

        finalize_disconnected_session(self.session.id)
        self.session.refresh_from_db()
        self.assertEqual(self.session.status, "in_progress")
        reconnect_log = self.session.connection_logs.filter(event_type="reconnected").first()
        self.assertIsNotNone(reconnect_log)


from shared.configs import variable_system as var_sys


class WebRTCStatisticsTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_user(
            email="admin_stats@test.com",
            full_name="Admin Stats",
            password="password123",
            role_name=var_sys.ADMIN,
            is_staff=True,
            is_superuser=True,
        )
        self.candidate = User.objects.create_user(
            email="cand_stats@test.com",
            full_name="Cand Stats",
            password="password123",
            role_name="job_seeker",
        )
        self.session = InterviewSession.objects.create(
            candidate=self.candidate,
            status="completed",
            duration=900,
            room_name="room-stats-test",
        )
        InterviewConnectionLog.objects.create(
            session=self.session,
            participant_identity="candidate-1",
            event_type="reconnected",
            downtime_seconds=6.0,
            reconnect_attempt=1,
        )
        InterviewConnectionLog.objects.create(
            session=self.session,
            participant_identity="candidate-1",
            event_type="disconnected",
            downtime_seconds=0.0,
        )

    def test_admin_general_statistics_includes_webrtc_telemetry(self):
        self.client.force_authenticate(user=self.admin)
        res = self.client.get("/api/v1/job/web/statistics/admin/?days=30")
        self.assertEqual(res.status_code, 200)
        data = res.json().get("data", {})
        self.assertIn("reconnectionRate", data)
        self.assertIn("avgDowntimeSeconds", data)
        self.assertIn("totalConnectionIncidents", data)
        self.assertEqual(data["reconnectionRate"], 100)
        self.assertEqual(data["avgDowntimeSeconds"], 6.0)
        self.assertGreaterEqual(data["totalConnectionIncidents"], 1)

