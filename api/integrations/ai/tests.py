from unittest.mock import Mock

import pytest
from rest_framework.test import APIClient

from integrations.ai.views import _http_probe_url, _probe_http_service


def test_http_probe_url_converts_websocket_schemes():
    assert _http_probe_url("wss://tuyendung.square.vn/livekit") == "https://tuyendung.square.vn/livekit"
    assert _http_probe_url("ws://livekit:7880") == "http://livekit:7880"


def test_probe_http_service_uses_http_url_for_wss(monkeypatch):
    fake_response = Mock(status_code=200)
    mock_get = Mock(return_value=fake_response)
    monkeypatch.setattr("integrations.ai.views.requests.get", mock_get)

    result = _probe_http_service("livekit", "wss://tuyendung.square.vn/livekit", path="/")

    assert result["status"] == "online"
    mock_get.assert_called_once()
    assert mock_get.call_args.args[0] == "https://tuyendung.square.vn/livekit/"


@pytest.mark.django_db
def test_fpt_gpu_control_action_requires_admin(admin_user, job_seeker_user, settings):
    settings.FPT_GPU_BSS_ACCESS_TOKEN = "test-bss-token"
    settings.FPT_GPU_TENANT_ID = "tenant-1"
    settings.FPT_GPU_CONTAINER_ID = "container-1"

    client = APIClient()
    client.force_authenticate(user=job_seeker_user)

    response = client.post("/api/v1/ai/gpu-control/stop/")

    assert response.status_code == 403


@pytest.mark.django_db
def test_fpt_gpu_control_action_posts_to_fpt(admin_user, settings, monkeypatch):
    settings.FPT_GPU_CONTROL_BASE_URL = "https://console-api.fptcloud.com"
    settings.FPT_GPU_BSS_ACCESS_TOKEN = "test-bss-token"
    settings.FPT_GPU_REGION = "hanoi-2-vn"
    settings.FPT_GPU_TENANT_ID = "tenant-1"
    settings.FPT_GPU_CONTAINER_ID = "container-1"

    fake_response = Mock(status_code=200, content=b"{}")
    fake_response.json.return_value = {}
    mock_request = Mock(return_value=fake_response)
    monkeypatch.setattr("integrations.ai.views.requests.request", mock_request)

    client = APIClient()
    client.force_authenticate(user=admin_user)

    response = client.post("/api/v1/ai/gpu-control/start/")

    assert response.status_code == 200
    mock_request.assert_called_once()
    assert mock_request.call_args.kwargs["json"] == {"action": "START"}
    assert mock_request.call_args.kwargs["headers"]["Authorization"] == "Bearer test-bss-token"
