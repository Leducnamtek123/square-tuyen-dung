import pytest
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
