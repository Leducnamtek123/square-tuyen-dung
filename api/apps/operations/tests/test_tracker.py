import pytest
from django.utils import timezone
from apps.operations.models import AsyncOperation, OperationStatus
from apps.operations.services import OperationTracker


@pytest.mark.django_db
def test_tracker_create():
    tracker = OperationTracker.create(
        type="test.operation",
        title="Test Op",
        steps=[
            {"key": "step1", "label": "Step 1"},
            {"key": "step2", "label": "Step 2"},
        ],
        metadata={"foo": "bar"},
        timeout_seconds=300,
    )
    assert tracker.op.id.startswith("op_")
    assert tracker.op.status == OperationStatus.RUNNING
    assert tracker.op.type == "test.operation"
    assert tracker.op.title == "Test Op"
    assert tracker.op.progress == 0
    assert tracker.op.timeout_seconds == 300
    assert tracker.op.metadata == {"foo": "bar"}
    assert len(tracker.op.steps) == 2
    s1 = tracker.op.steps[0]
    assert s1["key"] == "step1"
    assert s1["label"] == "Step 1"
    assert s1["status"] == "pending"
    assert s1["progress"] == 0
    assert s1["detail"] == ""
    assert s1["resultSummary"] == ""
    assert s1["errorMessage"] == ""
    assert s1["startedAt"] is None
    assert s1["completedAt"] is None


@pytest.mark.django_db
def test_tracker_get():
    tracker = OperationTracker.create(
        type="test.get",
        title="Test Get",
        steps=[{"key": "s1", "label": "S1"}],
    )
    fetched = OperationTracker.get(tracker.op.id)
    assert fetched is not None
    assert fetched.op.id == tracker.op.id
    assert OperationTracker.get("op_nonexistent") is None


@pytest.mark.django_db
def test_tracker_step_lifecycle_and_progress():
    tracker = OperationTracker.create(
        type="test.lifecycle",
        title="Lifecycle Test",
        steps=[
            {"key": "step1", "label": "Step 1"},
            {"key": "step2", "label": "Step 2"},
        ],
    )
    # Start step 1
    tracker.start_step("step1", detail="Starting step 1")
    tracker.op.refresh_from_db()
    assert tracker.op.current_step_key == "step1"
    assert tracker.op.steps[0]["status"] == "running"
    assert tracker.op.steps[0]["detail"] == "Starting step 1"
    assert tracker.op.steps[0]["startedAt"] is not None
    assert tracker.op.progress == 0

    # Update step 1 progress to 50%
    tracker.update_step("step1", progress=50, detail="Halfway")
    tracker.op.refresh_from_db()
    assert tracker.op.steps[0]["progress"] == 50
    assert tracker.op.steps[0]["detail"] == "Halfway"
    # Progress calculation: ((0 * 100) + 50) / 2 = 25
    assert tracker.op.progress == 25

    # Complete step 1
    tracker.complete_step("step1", result_summary="Step 1 done")
    tracker.op.refresh_from_db()
    assert tracker.op.steps[0]["status"] == "completed"
    assert tracker.op.steps[0]["progress"] == 100
    assert tracker.op.steps[0]["completedAt"] is not None
    assert tracker.op.steps[0]["resultSummary"] == "Step 1 done"
    # Progress calculation: ((1 * 100) + 0) / 2 = 50
    assert tracker.op.progress == 50

    # Start step 2
    tracker.start_step("step2", detail="Starting step 2")
    tracker.update_step("step2", progress=80)
    tracker.op.refresh_from_db()
    # Progress calculation: ((1 * 100) + 80) / 2 = 90
    assert tracker.op.progress == 90

    # Complete step 2
    tracker.complete_step("step2")
    tracker.op.refresh_from_db()
    # Capped at 99 before finish: min(100, 99) = 99
    assert tracker.op.progress == 99

    # Finish operation
    tracker.finish(result={"ok": True})
    tracker.op.refresh_from_db()
    assert tracker.op.status == OperationStatus.COMPLETED
    assert tracker.op.progress == 100
    assert tracker.op.result == {"ok": True}
    assert tracker.op.finished_at is not None


@pytest.mark.django_db
def test_tracker_fail_step():
    tracker = OperationTracker.create(
        type="test.fail_step",
        title="Fail Step Test",
        steps=[{"key": "step1", "label": "Step 1"}],
    )
    tracker.start_step("step1")
    tracker.fail_step("step1", "Failed to process item")
    tracker.op.refresh_from_db()
    assert tracker.op.status == OperationStatus.FAILED
    assert tracker.op.steps[0]["status"] == "failed"
    assert tracker.op.steps[0]["errorMessage"] == "Failed to process item"
    assert tracker.op.steps[0]["completedAt"] is not None
    assert tracker.op.error["code"] == "OPERATION_FAILED"
    assert tracker.op.error["message"] == "Failed to process item"
    assert tracker.op.finished_at is not None


@pytest.mark.django_db
def test_tracker_fail_custom_code():
    tracker = OperationTracker.create(
        type="test.fail",
        title="Fail Test",
        steps=[{"key": "step1", "label": "Step 1"}],
    )
    tracker.fail("Timeout reached", code="TIMEOUT", detail="Took longer than 600s")
    tracker.op.refresh_from_db()
    assert tracker.op.status == OperationStatus.FAILED
    assert tracker.op.error["code"] == "TIMEOUT"
    assert tracker.op.error["message"] == "Timeout reached"
    assert tracker.op.error["detail"] == "Took longer than 600s"
    assert tracker.op.finished_at is not None


@pytest.mark.django_db
def test_tracker_context_manager_success():
    tracker = OperationTracker.create(
        type="test.cm_success",
        title="CM Success",
        steps=[{"key": "step1", "label": "Step 1"}],
    )
    with tracker as t:
        t.start_step("step1")
        t.complete_step("step1")
        t.finish({"success": True})
    tracker.op.refresh_from_db()
    assert tracker.op.status == OperationStatus.COMPLETED
    assert tracker.op.progress == 100


@pytest.mark.django_db
def test_tracker_context_manager_exception():
    tracker = OperationTracker.create(
        type="test.cm_error",
        title="CM Error",
        steps=[{"key": "step1", "label": "Step 1"}],
    )
    with pytest.raises(ValueError, match="Database connection failed"):
        with tracker as t:
            t.start_step("step1")
            raise ValueError("Database connection failed")

    tracker.op.refresh_from_db()
    assert tracker.op.status == OperationStatus.FAILED
    assert tracker.op.error["code"] == "OPERATION_FAILED"
    assert "Database connection failed" in tracker.op.error["message"]
    assert tracker.op.finished_at is not None


@pytest.mark.django_db
def test_tracker_recalculate_progress_empty_steps():
    tracker = OperationTracker.create(
        type="test.empty",
        title="Empty Steps",
        steps=[],
    )
    tracker._recalculate_progress()
    assert tracker.op.progress == 0
