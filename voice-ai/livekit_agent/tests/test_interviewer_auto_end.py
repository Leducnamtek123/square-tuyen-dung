import asyncio
import importlib.util
import sys
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "src"
if "livekit_agent" not in sys.modules:
    spec = importlib.util.spec_from_file_location(
        "livekit_agent",
        ROOT / "__init__.py",
        submodule_search_locations=[str(ROOT)],
    )
    module = importlib.util.module_from_spec(spec)
    assert spec and spec.loader
    sys.modules["livekit_agent"] = module
    spec.loader.exec_module(module)

from livekit_agent.interviewer import Interviewer


def _strip_accents(value: str) -> str:
    normalized = unicodedata.normalize("NFD", value)
    return "".join(char for char in normalized if unicodedata.category(char) != "Mn")


class DummySpeechHandle:
    def __init__(self) -> None:
        self._callbacks = []

    def add_done_callback(self, callback) -> None:
        self._callbacks.append(callback)

    def resolve(self) -> None:
        for callback in list(self._callbacks):
            callback(self)


def test_finish_interview_waits_for_playout_before_shutdown() -> None:
    async def run() -> None:
        agent = Interviewer(context={"backendApiUrl": "http://test", "roomName": "room-1"})
        shutdown_calls = {"count": 0}
        status_calls = []

        async def fake_shutdown_session() -> None:
            shutdown_calls["count"] += 1

        async def fake_update_backend_status(status: str) -> bool:
            status_calls.append(status)
            return True

        agent._shutdown_session = fake_shutdown_session  # type: ignore[assignment]
        agent._update_backend_status = fake_update_backend_status  # type: ignore[assignment]

        speech_handle = DummySpeechHandle()
        context = type("Ctx", (), {"speech_handle": speech_handle})()

        result = await agent.finish_interview(context)

        assert "ket thuc" in _strip_accents(result).lower()
        assert shutdown_calls["count"] == 0

        speech_handle.resolve()
        await asyncio.sleep(0)

        assert shutdown_calls["count"] == 1
        assert status_calls == ["completed"]

    asyncio.run(run())


def test_finish_interview_falls_back_when_no_speech_handle() -> None:
    async def run() -> None:
        agent = Interviewer(context={"backendApiUrl": "http://test", "roomName": "room-2"})
        shutdown_calls = {"count": 0}
        status_calls = []

        async def fake_shutdown_session() -> None:
            shutdown_calls["count"] += 1

        async def fake_update_backend_status(status: str) -> bool:
            status_calls.append(status)
            return True

        agent._shutdown_session = fake_shutdown_session  # type: ignore[assignment]
        agent._update_backend_status = fake_update_backend_status  # type: ignore[assignment]

        context = type("Ctx", (), {})()

        result = await agent.finish_interview(context)
        assert "ket thuc" in _strip_accents(result).lower()

        await asyncio.sleep(0)

        assert shutdown_calls["count"] == 1
        assert status_calls == ["completed"]

    asyncio.run(run())
