import pytest

from livekit_agent import interviewer as interviewer_module
from livekit_agent.interviewer import Interviewer

class DummySession:
    def __init__(self) -> None:
        self.shutdown_calls: list[bool] = []

    def shutdown(self, drain: bool = True) -> None:
        self.shutdown_calls.append(drain)

@pytest.mark.asyncio
async def test_closing_does_not_auto_end_when_disabled(monkeypatch) -> None:
    agent = Interviewer(context={"backendApiUrl": "http://test", "roomName": "room-1"})
    agent.session = DummySession()

    monkeypatch.setattr(interviewer_module.config, "AUTO_END_ON_COMPLETION", False)

    async def fake_fetch_next_question(advance: bool = True):
        return {"done": True, "question": None, "index": 1, "total": 1}

    async def fake_say_and_wait(text: str, *, allow_interruptions: bool = True) -> None:
        return None

    status_updates = {"count": 0}

    async def fake_update_backend_status(status: str) -> None:
        status_updates["count"] += 1

    monkeypatch.setattr(agent, "_fetch_next_question", fake_fetch_next_question)
    monkeypatch.setattr(agent, "_say_and_wait", fake_say_and_wait)
    monkeypatch.setattr(agent, "_update_backend_status", fake_update_backend_status)

    handled = await agent._ask_next_question()

    assert handled is True
    assert status_updates["count"] == 0
    assert agent.session.shutdown_calls == []
    assert agent._completed is True

@pytest.mark.asyncio
async def test_closing_auto_ends_when_enabled(monkeypatch) -> None:
    agent = Interviewer(context={"backendApiUrl": "http://test", "roomName": "room-2"})
    agent.session = DummySession()

    monkeypatch.setattr(interviewer_module.config, "AUTO_END_ON_COMPLETION", True)

    async def fake_fetch_next_question(advance: bool = True):
        return {"done": True, "question": None, "index": 2, "total": 2}

    async def fake_say_and_wait(text: str, *, allow_interruptions: bool = True) -> None:
        return None

    status_updates = {"count": 0}

    async def fake_update_backend_status(status: str) -> None:
        status_updates["count"] += 1

    monkeypatch.setattr(agent, "_fetch_next_question", fake_fetch_next_question)
    monkeypatch.setattr(agent, "_say_and_wait", fake_say_and_wait)
    monkeypatch.setattr(agent, "_update_backend_status", fake_update_backend_status)

    handled = await agent._ask_next_question()

    assert handled is True
    assert status_updates["count"] == 1
    assert agent.session.shutdown_calls == [True]
    assert agent._completed is True
