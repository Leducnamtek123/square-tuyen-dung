"""
Tests for Company AI Settings:
- Model field Company.ai_settings and helper method get_ai_settings()
- Serializer CompanyAiSettingsSerializer
- API endpoint CompanyAiSettingsAPIView
"""
import pytest
from rest_framework import status
from rest_framework.test import APITestCase

from apps.accounts.models import User
from apps.locations.models import City, Location
from apps.profiles.models import Company
from apps.profiles.serializers_ai_settings import CompanyAiSettingsSerializer
from shared.configs import variable_system as var_sys


class CompanyAiSettingsTestCase(APITestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        try:
            from django_elasticsearch_dsl.registries import registry
            cls._orig_update = getattr(registry, 'update', None)
            cls._orig_delete = getattr(registry, 'delete', None)
            registry.update = lambda *a, **kw: None
            registry.delete = lambda *a, **kw: None
        except ImportError:
            pass

    @classmethod
    def tearDownClass(cls):
        try:
            from django_elasticsearch_dsl.registries import registry
            if hasattr(cls, '_orig_update') and cls._orig_update:
                registry.update = cls._orig_update
            if hasattr(cls, '_orig_delete') and cls._orig_delete:
                registry.delete = cls._orig_delete
        except ImportError:
            pass
        super().tearDownClass()

    def setUp(self):

        self.employer_user = User.objects.create_user_with_role_name(
            email="employer_ai@test.com",
            full_name="Employer AI Tester",
            role_name=var_sys.EMPLOYER,
            password="testpassword123",
            is_active=True,
            is_verify_email=True,
            has_company=True,
        )
        self.other_user = User.objects.create_user_with_role_name(
            email="jobseeker_ai@test.com",
            full_name="Jobseeker AI Tester",
            role_name=var_sys.JOB_SEEKER,
            password="testpassword123",
            is_active=True,
            is_verify_email=True,
            has_company=False,
        )
        self.city = City.objects.create(name="Hồ Chí Minh", code="HCM_AI_TEST")
        self.location = Location.objects.create(city=self.city, address="123 Nguyen Hue")
        self.company = Company.objects.create(
            company_name="AI Test Corp",
            company_email="ai_corp@test.com",
            company_phone="0911222333",
            tax_code="TAX_AI_12345",
            user=self.employer_user,
            location=self.location,
        )
        self.url = "/api/v1/info/company/ai-settings/"

    def test_default_ai_settings_model(self):
        """Test default values returned by company.get_ai_settings()"""
        ai_settings = self.company.get_ai_settings()
        self.assertEqual(ai_settings["interviewer_name"], "Trợ lý AI AILA")
        self.assertEqual(ai_settings["interviewer_title"], "Chuyên viên tuyển dụng thông minh")
        self.assertEqual(ai_settings["background_type"], "preset")
        self.assertEqual(ai_settings["selected_background_id"], "modern_office")
        self.assertIsNone(ai_settings["custom_background_url"])
        self.assertEqual(ai_settings["avatar_type"], "preset")
        self.assertEqual(ai_settings["active_character_id"], "ng_c_linh")
        self.assertEqual(ai_settings["selected_avatar_id"], "aila_recruiter")
        self.assertIsNone(ai_settings["custom_avatar_url"])
        self.assertEqual(ai_settings["tts_voice"], "Trúc Ly")
        self.assertEqual(ai_settings["tts_speed"], 1.0)
        self.assertIsNone(ai_settings["default_script_id"])

    def test_custom_ai_settings_merged(self):
        """Test merging custom settings on company.get_ai_settings()"""
        self.company.ai_settings = {
            "interviewer_name": "AI Recruiter Pro",
            "tts_speed": 1.25,
            "background_type": "custom",
            "custom_background_url": "https://example.com/bg.jpg",
        }
        self.company.save(update_fields=["ai_settings"])
        self.company.refresh_from_db()

        merged = self.company.get_ai_settings()
        self.assertEqual(merged["interviewer_name"], "AI Recruiter Pro")
        self.assertEqual(merged["tts_speed"], 1.25)
        self.assertEqual(merged["background_type"], "custom")
        self.assertEqual(merged["custom_background_url"], "https://example.com/bg.jpg")
        # Defaults remain for unspecified fields
        self.assertEqual(merged["avatar_type"], "preset")
        self.assertEqual(merged["tts_voice"], "Trúc Ly")

    def test_serializer_validation_and_representation(self):
        """Test CompanyAiSettingsSerializer validation and representation"""
        # Representation from model instance
        serializer = CompanyAiSettingsSerializer(self.company)
        self.assertEqual(serializer.data["interviewer_name"], "Trợ lý AI AILA")

        # Valid partial data update
        valid_data = {
            "interviewer_name": "AILA Custom",
            "tts_speed": 1.5,
            "avatar_type": "custom",
            "custom_avatar_url": "https://example.com/avatar.png",
        }
        update_serializer = CompanyAiSettingsSerializer(self.company, data=valid_data, partial=True)
        self.assertTrue(update_serializer.is_valid(), update_serializer.errors)
        updated_company = update_serializer.save()
        self.assertEqual(updated_company.ai_settings["interviewer_name"], "AILA Custom")
        self.assertEqual(updated_company.ai_settings["tts_speed"], 1.5)

        # Invalid choice validation
        invalid_serializer = CompanyAiSettingsSerializer(data={"background_type": "unsupported_type"})
        self.assertFalse(invalid_serializer.is_valid())
        self.assertIn("background_type", invalid_serializer.errors)

        # Invalid tts_speed range
        invalid_speed = CompanyAiSettingsSerializer(data={"tts_speed": 5.0})
        self.assertFalse(invalid_speed.is_valid())
        self.assertIn("tts_speed", invalid_speed.errors)

    def test_unauthenticated_access_rejected(self):
        """Unauthenticated requests must be rejected with 401"""
        res_get = self.client.get(self.url)
        self.assertEqual(res_get.status_code, status.HTTP_401_UNAUTHORIZED)

        res_patch = self.client.patch(self.url, {"interviewer_name": "Test"})
        self.assertEqual(res_patch.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_user_without_company_rejected(self):
        """User without company returns 400 Bad Request"""
        self.client.force_authenticate(user=self.other_user)
        res_get = self.client.get(self.url)
        self.assertEqual(res_get.status_code, status.HTTP_400_BAD_REQUEST)

    def test_get_company_ai_settings_success(self):
        """Authenticated employer user can GET default AI settings"""
        self.client.force_authenticate(user=self.employer_user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data.get("data") if "data" in response.data else response.data
        self.assertEqual(data["interviewer_name"], "Trợ lý AI AILA")
        self.assertEqual(data["tts_voice"], "Trúc Ly")
        self.assertEqual(data["tts_speed"], 1.0)

    def test_patch_company_ai_settings_success(self):
        """Authenticated employer user can PATCH AI settings and persist them"""
        self.client.force_authenticate(user=self.employer_user)
        patch_payload = {
            "interviewer_name": "Cố vấn tuyển dụng InfoHR",
            "interviewer_title": "AI Senior Specialist",
            "tts_voice": "Mai Phương",
            "tts_speed": 1.1,
            "selected_background_id": "cyber_office",
        }
        response = self.client.patch(self.url, patch_payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data.get("data") if "data" in response.data else response.data
        self.assertEqual(data["interviewer_name"], "Cố vấn tuyển dụng InfoHR")
        self.assertEqual(data["interviewer_title"], "AI Senior Specialist")
        self.assertEqual(data["tts_voice"], "Mai Phương")
        self.assertEqual(data["tts_speed"], 1.1)
        self.assertEqual(data["selected_background_id"], "cyber_office")

        # Verify DB persistence
        self.company.refresh_from_db()
        self.assertEqual(self.company.ai_settings["interviewer_name"], "Cố vấn tuyển dụng InfoHR")
        self.assertEqual(self.company.ai_settings["tts_voice"], "Mai Phương")
        self.assertEqual(self.company.ai_settings["tts_speed"], 1.1)

    def test_alternative_urls_supported(self):
        """Endpoint is accessible via /api/v1/info/web/company/ai-settings/ and /api/v1/profiles/company/ai-settings/"""
        self.client.force_authenticate(user=self.employer_user)
        for alt_url in ["/api/v1/info/web/company/ai-settings/", "/api/v1/profiles/company/ai-settings/"]:
            resp = self.client.get(alt_url)
            self.assertEqual(resp.status_code, status.HTTP_200_OK, f"Failed for {alt_url}")
            data = resp.data.get("data") if "data" in resp.data else resp.data
            self.assertIn("interviewer_name", data)

    def test_member_with_manage_interviews_permission(self):
        """Company member with manage_interviews role permission can access and update AI settings"""
        from apps.profiles.models import CompanyMember, CompanyRole

        member_user = User.objects.create_user_with_role_name(
            email="hr_member_ai@test.com",
            full_name="HR Member AI",
            role_name=var_sys.EMPLOYER,
            password="testpassword123",
            is_active=True,
            is_verify_email=True,
            has_company=False,
        )
        hr_role = CompanyRole.objects.create(
            company=self.company,
            code="hr_recruiter",
            name="HR Recruiter",
            permissions=["manage_interviews"],
        )
        CompanyMember.objects.create(
            company=self.company,
            user=member_user,
            role=hr_role,
            status=CompanyMember.STATUS_ACTIVE,
            is_active=True,
        )

        self.client.force_authenticate(user=member_user)
        # GET
        res_get = self.client.get(self.url)
        self.assertEqual(res_get.status_code, status.HTTP_200_OK)

        # PATCH
        res_patch = self.client.patch(self.url, {"tts_voice": "Lan Trinh"}, format="json")
        self.assertEqual(res_patch.status_code, status.HTTP_200_OK)
        data = res_patch.data.get("data") if "data" in res_patch.data else res_patch.data
        self.assertEqual(data["tts_voice"], "Lan Trinh")

