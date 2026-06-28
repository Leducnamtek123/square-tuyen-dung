from unittest.mock import patch

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient

from apps.files.models import File
from apps.accounts.models import User
from apps.interviews.models import VoiceProfile, VoiceProfileSample
from apps.interviews.services import resolve_voice_profile_for_session


class VoiceProfileCloningFlowTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_user_with_role_name(
            email="voice-admin@example.com",
            full_name="Voice Admin",
            role_name="ADMIN",
            password="password123",
            is_staff=True,
            is_active=True,
        )
        self.client.force_authenticate(user=self.admin)

    def test_prepare_requires_at_least_one_sample(self):
        profile = VoiceProfile.objects.create(
            name="Clone Voice",
            voice_type=VoiceProfile.TYPE_CLONED,
            status=VoiceProfile.STATUS_DRAFT,
            consent_confirmed=True,
        )

        response = self.client.post(f"/api/v1/interview/web/voice-profiles/{profile.id}/prepare/", format="json")

        self.assertEqual(response.status_code, 400)
        payload = response.json()
        self.assertIn("samples", payload["error"]["details"])
        profile.refresh_from_db()
        self.assertEqual(profile.status, VoiceProfile.STATUS_DRAFT)

    def test_sample_upload_keeps_profile_draft_until_explicit_prepare(self):
        profile = VoiceProfile.objects.create(
            name="Clone Voice",
            voice_type=VoiceProfile.TYPE_CLONED,
            status=VoiceProfile.STATUS_DRAFT,
            consent_confirmed=True,
        )
        sample_file = SimpleUploadedFile("sample.wav", b"fake wav bytes", content_type="audio/wav")

        with patch("shared.helpers.cloudinary_service.CloudinaryService.upload_file", return_value={"url": "https://cdn.test/sample.wav"}), \
             patch("apps.files.models.File.update_or_create_file_with_cloudinary") as mock_create_file:
            mock_create_file.return_value = File.objects.create(
                public_id="sample.wav",
                version="1",
                format="wav",
                resource_type="raw",
                file_type=File.OTHER_TYPE,
                uploaded_at=timezone.now(),
                metadata={"url": "https://cdn.test/sample.wav"},
            )
            response = self.client.post(
                f"/api/v1/interview/web/voice-profiles/{profile.id}/samples/",
                data={"audio": sample_file, "referenceText": "Xin chao, day la mau ghi am."},
                format="multipart",
            )

        self.assertEqual(response.status_code, 201)
        profile.refresh_from_db()
        self.assertEqual(profile.status, VoiceProfile.STATUS_DRAFT)
        self.assertEqual(VoiceProfileSample.objects.filter(profile=profile).count(), 1)

    def test_prepare_marks_profile_ready_and_stores_summary_metadata(self):
        profile = VoiceProfile.objects.create(
            name="Clone Voice",
            voice_type=VoiceProfile.TYPE_CLONED,
            status=VoiceProfile.STATUS_DRAFT,
            consent_confirmed=True,
        )
        VoiceProfileSample.objects.create(
            profile=profile,
            reference_text="Xin chao, day la mau ghi am dau tien.",
            sort_order=0,
            duration_seconds=3.5,
        )
        VoiceProfileSample.objects.create(
            profile=profile,
            reference_text="Toi se noi them mot doan ngan de mo ta giong.",
            sort_order=1,
            duration_seconds=4.25,
        )

        response = self.client.post(f"/api/v1/interview/web/voice-profiles/{profile.id}/prepare/", format="json")

        self.assertEqual(response.status_code, 200)
        payload = response.json()["data"]
        profile.refresh_from_db()
        self.assertEqual(profile.status, VoiceProfile.STATUS_READY)
        self.assertEqual(payload["status"], VoiceProfile.STATUS_READY)
        self.assertEqual(payload["sampleCount"], 2)
        self.assertEqual(payload["isReadyForTts"], True)
        self.assertEqual(payload["totalDurationSeconds"], 7.75)
        self.assertEqual(profile.metadata["sampleCount"], 2)
        self.assertEqual(profile.metadata["isReadyForTts"], True)

    def test_runtime_voice_resolution_ignores_draft_profiles(self):
        ready_profile = VoiceProfile.objects.create(
            name="Ready Voice",
            voice_type=VoiceProfile.TYPE_CLONED,
            status=VoiceProfile.STATUS_READY,
            consent_confirmed=True,
        )
        draft_profile = VoiceProfile.objects.create(
            name="Draft Voice",
            voice_type=VoiceProfile.TYPE_CLONED,
            status=VoiceProfile.STATUS_DRAFT,
            consent_confirmed=True,
        )

        self.assertEqual(
            resolve_voice_profile_for_session(type("SessionStub", (), {"voice_profile": ready_profile, "job_post": None})()),
            ready_profile,
        )
        self.assertIsNone(
            resolve_voice_profile_for_session(type("SessionStub", (), {"voice_profile": draft_profile, "job_post": None})()),
        )
