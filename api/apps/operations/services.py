from __future__ import annotations
import logging
from typing import Any
from django.utils import timezone
from .models import AsyncOperation, OperationStatus

logger = logging.getLogger(__name__)


class OperationCancelledError(Exception):
    """Raised when an operation has been cancelled while execution is in progress."""
    pass


class OperationTracker:
    def __init__(self, operation: AsyncOperation):
        self.op = operation
        self.operation = operation
        self.operation_id = operation.id

    @classmethod
    def create(
        cls,
        type: str,
        title: str,
        steps: list[dict[str, Any]],
        user_id: int | None = None,
        company_id: int | None = None,
        metadata: dict[str, Any] | None = None,
        timeout_seconds: int = 600,
    ) -> OperationTracker:
        initial_steps = []
        for s in steps:
            initial_steps.append({
                "key": s["key"],
                "label": s.get("label", s["key"]),
                "status": "pending",
                "progress": 0,
                "detail": "",
                "resultSummary": "",
                "errorMessage": "",
                "startedAt": None,
                "completedAt": None,
            })

        op = AsyncOperation.objects.create(
            type=type,
            title=title,
            steps=initial_steps,
            user_id=user_id,
            company_id=company_id,
            metadata=metadata or {},
            status=OperationStatus.RUNNING,
            timeout_seconds=timeout_seconds,
        )
        return cls(op)

    @classmethod
    def get(cls, operation_id: str) -> OperationTracker | None:
        op = AsyncOperation.objects.filter(id=operation_id).first()
        if op is None:
            return None
        return cls(op)

    def __enter__(self) -> OperationTracker:
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type is not None:
            if issubclass(exc_type, OperationCancelledError):
                return False
            self.fail(str(exc_val))
            return False

    def _check_cancellation(self):
        if self.op.pk:
            self.op.refresh_from_db(fields=["status"])
            if self.op.status == OperationStatus.CANCELLED:
                raise OperationCancelledError(f"Operation '{self.op.id}' was cancelled.")

    def _save(self, update_fields: list[str]):
        fields = set(update_fields)
        fields.add("updated_at")
        self.op.save(update_fields=list(fields))

    def _recalculate_progress(self):
        total_steps = len(self.op.steps)
        if total_steps == 0:
            return
        completed = sum(1 for s in self.op.steps if s.get("status") == "completed")
        current_prog = 0
        for s in self.op.steps:
            if s.get("status") == "running":
                current_prog = s.get("progress", 0)
                break
        overall = int(((completed * 100) + current_prog) / total_steps)
        self.op.progress = min(overall, 99)

    def start_step(self, key: str, detail: str | None = None):
        self._check_cancellation()
        now_str = timezone.now().isoformat()
        self.op.current_step_key = key
        for s in self.op.steps:
            if s.get("key") == key:
                s["status"] = "running"
                s["startedAt"] = now_str
                if detail is not None:
                    s["detail"] = detail
                break
        self._recalculate_progress()
        self._save(["current_step_key", "steps", "progress"])

    def update_step(self, key: str, progress: int | None = None, detail: str | None = None):
        self._check_cancellation()
        for s in self.op.steps:
            if s.get("key") == key:
                if progress is not None:
                    s["progress"] = min(max(int(progress), 0), 100)
                if detail is not None:
                    s["detail"] = detail
                break
        self._recalculate_progress()
        self._save(["steps", "progress"])

    def complete_step(self, key: str, result_summary: str = "", detail: str | None = None):
        self._check_cancellation()
        now_str = timezone.now().isoformat()
        for s in self.op.steps:
            if s.get("key") == key:
                s["status"] = "completed"
                s["progress"] = 100
                s["completedAt"] = now_str
                if result_summary:
                    s["resultSummary"] = result_summary
                if detail is not None:
                    s["detail"] = detail
                break
        self._recalculate_progress()
        self._save(["steps", "progress"])

    def fail_step(self, key: str, error_message: str):
        self._check_cancellation()
        now_str = timezone.now().isoformat()
        for s in self.op.steps:
            if s.get("key") == key:
                s["status"] = "failed"
                s["completedAt"] = now_str
                s["errorMessage"] = str(error_message)
                break
        self._save(["steps"])
        self.fail(error_message)

    def finish(self, result: dict[str, Any] | None = None):
        self._check_cancellation()
        self.op.status = OperationStatus.COMPLETED
        self.op.progress = 100
        self.op.result = result or {}
        self.op.finished_at = timezone.now()
        self._save(["status", "progress", "result", "finished_at"])

    def fail(self, error_message: str, code: str = "OPERATION_FAILED", detail: str = ""):
        if self.op.pk:
            self.op.refresh_from_db(fields=["status"])
            if self.op.status == OperationStatus.CANCELLED:
                return
        self.op.status = OperationStatus.FAILED
        self.op.error = {
            "code": code,
            "message": str(error_message)[:500],
            "detail": detail or str(error_message),
        }
        self.op.finished_at = timezone.now()
        self._save(["status", "error", "finished_at"])
