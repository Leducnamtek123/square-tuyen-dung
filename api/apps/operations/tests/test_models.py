import pytest
from django.utils import timezone
from apps.operations.models import AsyncOperation, OperationStatus, generate_operation_id


@pytest.mark.django_db
def test_create_async_operation_and_payload():
    op = AsyncOperation.objects.create(
        id="op_test_123",
        type="candidate.ai_scan",
        title="AI Scan Test",
        status=OperationStatus.RUNNING,
        progress=25,
        current_step_key="extract_text",
        steps=[
            {"key": "extract_text", "label": "Extract", "status": "running", "progress": 50}
        ],
        metadata={"activity_id": 999}
    )
    assert op.id == "op_test_123"
    assert op.status == "running"
    payload = op.to_payload()
    assert payload["id"] == "op_test_123"
    assert payload["type"] == "candidate.ai_scan"
    assert payload["title"] == "AI Scan Test"
    assert payload["status"] == "running"
    assert payload["currentStepKey"] == "extract_text"
    assert payload["progress"] == 25
    assert len(payload["steps"]) == 1
    assert payload["steps"][0]["key"] == "extract_text"
    assert payload["metadata"]["activity_id"] == 999
    assert payload["createdAt"] is not None
    assert payload["updatedAt"] is not None
    assert payload["finishedAt"] is None


@pytest.mark.django_db
def test_default_values_and_id_generation():
    op = AsyncOperation.objects.create(
        type="vieclam24h.import",
        title="Sync Candidates",
    )
    assert op.id.startswith("op_")
    assert len(op.id) == 27  # 'op_' + 24 hex chars
    assert op.status == OperationStatus.QUEUED
    assert op.progress == 0
    assert op.current_step_key == ""
    assert op.steps == []
    assert op.metadata == {}
    assert op.timeout_seconds == 600
    assert op.finished_at is None

    payload = op.to_payload()
    assert payload["currentStepKey"] is None
    assert payload["steps"] == []
    assert payload["metadata"] == {}
    assert payload["finishedAt"] is None


@pytest.mark.django_db
def test_str_and_finished_at_payload():
    now = timezone.now()
    op = AsyncOperation.objects.create(
        id="op_finished_test",
        type="interview.evaluate",
        title="Interview Eval",
        status=OperationStatus.COMPLETED,
        progress=100,
        finished_at=now,
    )
    assert str(op) == "AsyncOperation(op_finished_test, interview.evaluate, completed)"
    payload = op.to_payload()
    assert payload["status"] == "completed"
    assert payload["progress"] == 100
    assert payload["finishedAt"] == now.isoformat()


def test_generate_operation_id_format():
    new_id = generate_operation_id()
    assert new_id.startswith("op_")
    assert len(new_id) == 27
