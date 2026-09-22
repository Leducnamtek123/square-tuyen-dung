"""API Unit tests for FastAPI Talking Head Lip-Sync Service."""

import os
import subprocess
import tempfile
import pytest
from fastapi.testclient import TestClient

from server import app, MEDIA_DIR

client = TestClient(app)


def test_health_check_endpoints():
    # Test GET /health
    res1 = client.get("/health")
    assert res1.status_code == 200
    data1 = res1.json()
    assert data1["status"] == "healthy"
    assert data1["service"] == "talking-head"
    assert "device" in data1
    assert "cuda_available" in data1

    # Test GET /api/v1/avatar/health
    res2 = client.get("/api/v1/avatar/health")
    assert res2.status_code == 200
    data2 = res2.json()
    assert data2["status"] == "healthy"


def test_get_characters():
    res = client.get("/api/v1/avatar/characters")
    assert res.status_code == 200
    data = res.json()
    assert "characters" in data
    assert len(data["characters"]) >= 1

    ng_c_linh = next((c for c in data["characters"] if c["id"] == "ng_c_linh"), None)
    assert ng_c_linh is not None
    assert ng_c_linh["name"] == "Ngọc Linh HR"

    action_names = [a["name"] for a in ng_c_linh["actions"]]
    expected_actions = ["idle", "nod", "thinking", "wave", "thanks_wave"]
    for act in expected_actions:
        assert act in action_names

    # Check actions ready state
    for a in ng_c_linh["actions"]:
        assert "ready" in a
        assert "url" in a
        assert a["ready"] is True


def test_post_lipsync_render():
    with tempfile.TemporaryDirectory() as tmpdir:
        dummy_audio = os.path.join(tmpdir, "test_speech.wav")
        # Sinh file âm thanh mẫu 0.5s bằng ffmpeg
        subprocess.run(
            [
                "ffmpeg", "-y", "-f", "lavfi", "-i", "anullsrc=r=16000:cl=mono",
                "-t", "0.5", "-c:a", "pcm_s16le", dummy_audio
            ],
            check=True,
            capture_output=True,
        )

        payload = {
            "audio_url": dummy_audio,
            "avatar_id": "ng_c_linh",
            "base_action": "idle",
            "sample_rate": 16000,
        }

        res = client.post("/api/v1/avatar/lipsync/render", json=payload)
        assert res.status_code == 200
        data = res.json()

        assert data["status"] == "success"
        assert "video_url" in data
        assert data["duration_sec"] > 0
        assert data["inference_time_ms"] > 0

        # Kiểm tra file video thực tế trên đĩa
        rel_path = data["video_url"].replace("/media/", "")
        disk_path = MEDIA_DIR / rel_path
        assert disk_path.is_file()
        assert disk_path.stat().st_size > 1000

        # Kiểm tra tải video qua endpoint tĩnh /media
        media_res = client.get(data["video_url"])
        assert media_res.status_code == 200
        assert len(media_res.content) == disk_path.stat().st_size


def test_post_lipsync_render_missing_audio():
    payload = {
        "audio_url": "non_existent_audio.wav",
        "avatar_id": "ng_c_linh",
        "base_action": "idle",
    }
    res = client.post("/api/v1/avatar/lipsync/render", json=payload)
    assert res.status_code == 404
