from unittest.mock import Mock

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
