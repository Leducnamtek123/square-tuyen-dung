import pytest
from datetime import timedelta
from django.utils import timezone
from oauth2_provider.models import AccessToken
from rest_framework.test import APIClient

from apps.content.models import SystemSetting


@pytest.mark.django_db
class TestSystemSettingsAPI:
    def test_admin_can_persist_and_reload_system_settings(self, admin_user):
        client = APIClient()
        client.force_authenticate(user=admin_user)

        response = client.put(
            "/api/v1/admin/web/system-settings/",
            {
                "maintenanceMode": True,
                "autoApproveJobs": True,
                "emailNotifications": False,
                "googleApiKey": "test-google-key",
                "supportEmail": "support@example.com",
            },
            format="json",
        )

        assert response.status_code == 200
        assert response.data["maintenanceMode"] is True
        assert response.data["autoApproveJobs"] is True
        assert response.data["emailNotifications"] is False
        assert response.data["supportEmail"] == "support@example.com"

        assert SystemSetting.objects.filter(key="maintenanceMode").exists()
        assert SystemSetting.objects.get(key="supportEmail").value == '"support@example.com"'

        reload_response = client.get("/api/v1/admin/web/system-settings/")
        assert reload_response.status_code == 200
        assert reload_response.data["maintenanceMode"] is True
        assert reload_response.data["supportEmail"] == "support@example.com"

    def test_non_admin_cannot_update_system_settings(self, job_seeker_user):
        client = APIClient()
        client.force_authenticate(user=job_seeker_user)

        response = client.put(
            "/api/v1/admin/web/system-settings/",
            {"maintenanceMode": True},
            format="json",
        )

        assert response.status_code == 403

    def test_maintenance_mode_blocks_non_admin_api_requests(self):
        SystemSetting.objects.create(key="maintenanceMode", value="true")

        response = APIClient().get("/api/v1/content/web/banner/")

        assert response.status_code == 503
        assert response.json()["error"]["code"] == "MAINTENANCE_MODE"

    def test_maintenance_mode_allows_admin_bearer_requests(self, admin_user):
        SystemSetting.objects.create(key="maintenanceMode", value="true")
        AccessToken.objects.create(
            user=admin_user,
            token="admin-maintenance-token",
            expires=timezone.now() + timedelta(hours=1),
            scope="read write",
        )

        client = APIClient()
        response = client.get(
            "/api/v1/content/web/banner/",
            HTTP_AUTHORIZATION="Bearer admin-maintenance-token",
        )

        assert response.status_code == 200
