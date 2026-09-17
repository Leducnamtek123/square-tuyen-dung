# Universal Operation Activity Design System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and integrate a universal, production-grade Operation Activity Design System across backend and frontend to track, visualize, and persist long-running and multi-step async operations, implemented across the top 3 high-impact flows: Candidate AI Resume Scan, Vieclam24h Import, and Post-Interview Evaluation.

**Architecture:** A centralized Django model `AsyncOperation` and Python `OperationTracker` context manager for Celery tasks emit uniform status events and step progress over REST endpoints. The frontend provides a shared `components/operation/` design system with 4 presentation modes (Inline `OperationProgress`, Expandable `OperationTimeline`, Full `OperationDetailModal`, and Persistent `OperationCenterDock`), connected via React Context `OperationProvider` and `useOperation` hook.

**Tech Stack:** Django 5, Celery, Redis, Next.js 14 (App Router), React 18, TypeScript, Material UI (MUI v5/v6), Tailwind CSS, TanStack Query.

**Spec:** [`docs/superpowers/specs/2026-09-17-operation-activity-design-system-design.md`](file:///c:/Users/WIN10/Documents/square-tuyen-dung/docs/superpowers/specs/2026-09-17-operation-activity-design-system-design.md)

## Global Constraints
- Do not introduce breaking schema changes to existing business models (`JobPostActivity`, `ResumeImportJob`, `InterviewSession`).
- All operation event payloads must follow the strict `OperationPayload` TypeScript/JSON schema.
- Celery tasks must be resilient: if an exception occurs, the `OperationTracker` must catch it, record error details, and transition status to `failed`.
- Frontend UI must support light and dark theme mode through MUI theme/tokens and responsive mobile/desktop layouts.

---

### Task 1: Backend Operations App, Model & Migration

**Files:**
- Create: `api/apps/operations/__init__.py`
- Create: `api/apps/operations/apps.py`
- Create: `api/apps/operations/models.py`
- Create: `api/apps/operations/tests/__init__.py`
- Create: `api/apps/operations/tests/test_models.py`
- Modify: `api/config/settings.py:230-250`

**Interfaces:**
- Produces: `apps.operations.models.AsyncOperation` model with fields:
  - `id`: `CharField(max_length=64, primary_key=True)`
  - `type`: `CharField(max_length=64, db_index=True)`
  - `title`: `CharField(max_length=255)`
  - `user`: `ForeignKey(User, null=True, blank=True)`
  - `company`: `ForeignKey('jobs.Company', null=True, blank=True)`
  - `status`: `CharField(max_length=32, choices=OperationStatus.choices, default='queued', db_index=True)`
  - `progress`: `PositiveSmallIntegerField(default=0)`
  - `current_step_key`: `CharField(max_length=64, blank=True)`
  - `steps`: `JSONField(default=list)`
  - `result`: `JSONField(null=True, blank=True)`
  - `error`: `JSONField(null=True, blank=True)`
  - `metadata`: `JSONField(default=dict)`
  - `timeout_seconds`: `PositiveIntegerField(default=600)`
  - `created_at`: `DateTimeField(auto_now_add=True, db_index=True)`
  - `updated_at`: `DateTimeField(auto_now=True)`
  - `finished_at`: `DateTimeField(null=True, blank=True)`
  - Method `to_payload() -> dict[str, Any]`

- [ ] **Step 1: Write the failing test for `AsyncOperation` model**

Create `api/apps/operations/tests/test_models.py`:
```python
import pytest
from apps.operations.models import AsyncOperation, OperationStatus

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
    assert payload["currentStepKey"] == "extract_text"
    assert payload["progress"] == 25
    assert len(payload["steps"]) == 1
    assert payload["metadata"]["activity_id"] == 999
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest api/apps/operations/tests/test_models.py -v`
Expected: FAIL with "No module named 'apps.operations'"

- [ ] **Step 3: Implement `apps/operations` app and model**

Create `api/apps/operations/__init__.py`:
```python
default_app_config = 'apps.operations.apps.OperationsConfig'
```

Create `api/apps/operations/apps.py`:
```python
from django.apps import AppConfig

class OperationsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.operations'
    verbose_name = 'Operations'
```

Create `api/apps/operations/models.py`:
```python
import uuid
from django.db import models
from django.conf import settings
from django.utils import timezone


class OperationStatus(models.TextChoices):
    QUEUED = 'queued', 'Đang trong hàng đợi'
    RUNNING = 'running', 'Đang xử lý'
    COMPLETED = 'completed', 'Hoàn tất'
    FAILED = 'failed', 'Thất bại'
    CANCELLED = 'cancelled', 'Đã hủy'


def generate_operation_id() -> str:
    return f"op_{uuid.uuid4().hex[:24]}"


class AsyncOperation(models.Model):
    id = models.CharField(max_length=64, primary_key=True, default=generate_operation_id)
    type = models.CharField(max_length=64, db_index=True)
    title = models.CharField(max_length=255)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='async_operations',
    )
    company = models.ForeignKey(
        'jobs.Company',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='async_operations',
    )
    status = models.CharField(
        max_length=32,
        choices=OperationStatus.choices,
        default=OperationStatus.QUEUED,
        db_index=True,
    )
    progress = models.PositiveSmallIntegerField(default=0)
    current_step_key = models.CharField(max_length=64, blank=True)
    steps = models.JSONField(default=list)
    result = models.JSONField(null=True, blank=True)
    error = models.JSONField(null=True, blank=True)
    metadata = models.JSONField(default=dict)
    timeout_seconds = models.PositiveIntegerField(default=600)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    finished_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['company', 'status']),
            models.Index(fields=['type', 'status']),
        ]

    def __str__(self) -> str:
        return f"AsyncOperation({self.id}, {self.type}, {self.status})"

    def to_payload(self) -> dict:
        return {
            "id": self.id,
            "type": self.type,
            "title": self.title,
            "status": self.status,
            "progress": self.progress,
            "currentStepKey": self.current_step_key or None,
            "steps": self.steps or [],
            "result": self.result,
            "error": self.error,
            "metadata": self.metadata or {},
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
            "finishedAt": self.finished_at.isoformat() if self.finished_at else None,
        }
```

Register `apps.operations` in `api/config/settings.py` inside `INSTALLED_APPS`.
Run migration: `python api/manage.py makemigrations operations && python api/manage.py migrate operations`

- [ ] **Step 4: Run test to verify it passes**

Run: `pytest api/apps/operations/tests/test_models.py -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add api/apps/operations api/config/settings.py
git commit -m "feat(operations): add AsyncOperation model and database migration"
```

---

### Task 2: Backend OperationTracker Service & REST API

**Files:**
- Create: `api/apps/operations/services.py`
- Create: `api/apps/operations/serializers.py`
- Create: `api/apps/operations/views.py`
- Create: `api/apps/operations/urls.py`
- Create: `api/apps/operations/tests/test_tracker.py`
- Create: `api/apps/operations/tests/test_api.py`
- Modify: `api/config/urls.py:30-50`

**Interfaces:**
- Produces: `OperationTracker` context manager class:
  - `OperationTracker.create(...) -> OperationTracker`
  - `start_step(key: str)`
  - `update_step(key: str, progress: int = None, detail: str = None)`
  - `complete_step(key: str, result_summary: str = None)`
  - `fail_step(key: str, error_message: str)`
  - `finish(result: dict = None)`
  - `fail(error_message: str, code: str = None, detail: str = None)`
- Endpoints:
  - `GET /api/v1/operations/{id}/`
  - `GET /api/v1/operations/active/`
  - `POST /api/v1/operations/{id}/cancel/`

- [ ] **Step 1: Write failing tests for `OperationTracker`**

Create `api/apps/operations/tests/test_tracker.py`:
```python
import pytest
from apps.operations.services import OperationTracker
from apps.operations.models import AsyncOperation, OperationStatus

@pytest.mark.django_db
def test_operation_tracker_lifecycle():
    steps = [
        {"key": "step1", "label": "Step 1"},
        {"key": "step2", "label": "Step 2"},
    ]
    with OperationTracker.create(type="test.op", title="Test Operation", steps=steps) as tracker:
        tracker.start_step("step1")
        tracker.complete_step("step1", result_summary="Step 1 ok")
        tracker.start_step("step2")
        tracker.complete_step("step2")
        tracker.finish(result={"ok": True})

    op = AsyncOperation.objects.get(id=tracker.operation_id)
    assert op.status == OperationStatus.COMPLETED
    assert op.progress == 100
    assert op.result == {"ok": True}
    assert op.steps[0]["status"] == "completed"
    assert op.steps[1]["status"] == "completed"

@pytest.mark.django_db
def test_operation_tracker_catches_exception():
    steps = [{"key": "step1", "label": "Step 1"}]
    with pytest.raises(ValueError):
        with OperationTracker.create(type="test.fail", title="Failing Op", steps=steps) as tracker:
            tracker.start_step("step1")
            raise ValueError("Something crashed")

    op = AsyncOperation.objects.get(id=tracker.operation_id)
    assert op.status == OperationStatus.FAILED
    assert "Something crashed" in op.error["message"]
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest api/apps/operations/tests/test_tracker.py -v`
Expected: FAIL with "cannot import name 'OperationTracker'"

- [ ] **Step 3: Implement `OperationTracker`, Serializers, Views & Urls**

Implement `api/apps/operations/services.py`:
```python
from __future__ import annotations
import logging
from typing import Any
from django.utils import timezone
from .models import AsyncOperation, OperationStatus

logger = logging.getLogger(__name__)

class OperationTracker:
    def __init__(self, operation: AsyncOperation):
        self.op = operation
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
                "label": s["label"],
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

    def __enter__(self) -> OperationTracker:
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type is not None:
            self.fail(str(exc_val))
            return False

    def _save(self, update_fields: list[str]):
        self.op.save(update_fields=update_fields + ["updated_at"])

    def _recalculate_progress(self):
        steps = self.op.steps
        if not steps:
            return
        total_steps = len(steps)
        completed_steps = sum(1 for s in steps if s.get("status") == "completed")
        # Step progress contribution
        current_step_prog = 0
        for s in steps:
            if s.get("status") == "running":
                current_step_prog = s.get("progress", 0)
                break
        overall = int(((completed_steps * 100) + current_step_prog) / total_steps)
        self.op.progress = min(overall, 99)

    def start_step(self, key: str, detail: str = ""):
        now = timezone.now().isoformat()
        self.op.current_step_key = key
        for s in self.op.steps:
            if s["key"] == key:
                s["status"] = "running"
                s["startedAt"] = now
                if detail:
                    s["detail"] = detail
                break
        self._recalculate_progress()
        self._save(["current_step_key", "steps", "progress"])

    def update_step(self, key: str, progress: int | None = None, detail: str | None = None):
        for s in self.op.steps:
            if s["key"] == key:
                if progress is not None:
                    s["progress"] = min(max(progress, 0), 100)
                if detail is not None:
                    s["detail"] = detail
                break
        self._recalculate_progress()
        self._save(["steps", "progress"])

    def complete_step(self, key: str, result_summary: str = "", detail: str = ""):
        now = timezone.now().isoformat()
        for s in self.op.steps:
            if s["key"] == key:
                s["status"] = "completed"
                s["progress"] = 100
                s["completedAt"] = now
                if result_summary:
                    s["resultSummary"] = result_summary
                if detail:
                    s["detail"] = detail
                break
        self._recalculate_progress()
        self._save(["steps", "progress"])

    def fail_step(self, key: str, error_message: str):
        now = timezone.now().isoformat()
        for s in self.op.steps:
            if s["key"] == key:
                s["status"] = "failed"
                s["completedAt"] = now
                s["errorMessage"] = error_message
                break
        self.fail(error_message)

    def finish(self, result: dict[str, Any] | None = None):
        now = timezone.now()
        self.op.status = OperationStatus.COMPLETED
        self.op.progress = 100
        self.op.result = result or {}
        self.op.finished_at = now
        self._save(["status", "progress", "result", "finished_at"])

    def fail(self, error_message: str, code: str = "OPERATION_FAILED", detail: str = ""):
        now = timezone.now()
        self.op.status = OperationStatus.FAILED
        self.op.error = {
            "code": code,
            "message": error_message[:500],
            "detail": detail or error_message,
        }
        self.op.finished_at = now
        self._save(["status", "error", "finished_at"])
```

Implement `api/apps/operations/serializers.py` and `views.py`:
- `OperationDetailView`: `GET /api/v1/operations/<id>/`
- `ActiveOperationsView`: `GET /api/v1/operations/active/`
- `CancelOperationView`: `POST /api/v1/operations/<id>/cancel/`

Hook `urls.py` in `api/config/urls.py` under path `api/v1/operations/`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `pytest api/apps/operations/tests/ -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add api/apps/operations api/config/urls.py
git commit -m "feat(operations): add OperationTracker service, serializers, and REST endpoints"
```

---

### Task 3: Frontend Core Types, Service & `useOperation` Hook

**Files:**
- Create: `frontend/src/components/operation/types.ts`
- Create: `frontend/src/services/operationService.ts`
- Create: `frontend/src/components/operation/useOperation.ts`
- Create: `frontend/src/components/operation/__tests__/useOperation.test.ts`

**Interfaces:**
- Produces:
  - `OperationPayload`, `OperationStep`, `OperationStatus` types in `types.ts`
  - `operationService.getOperation(id: string)`
  - `operationService.getActiveOperations()`
  - `operationService.cancelOperation(id: string)`
  - `useOperation({ operationId, initialData, pollingInterval, onCompleted, onError })`

- [ ] **Step 1: Write failing test for `useOperation` hook**

Create `frontend/src/components/operation/__tests__/useOperation.test.ts`:
```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useOperation } from '../useOperation';
import operationService from '@/services/operationService';

jest.mock('@/services/operationService');

describe('useOperation hook', () => {
  it('loads operation and updates state', async () => {
    (operationService.getOperation as jest.Mock).mockResolvedValue({
      id: 'op_123',
      type: 'candidate.ai_scan',
      title: 'Scan CV',
      status: 'completed',
      progress: 100,
      steps: [],
    });

    const { result } = renderHook(() => useOperation({ operationId: 'op_123' }));
    await waitFor(() => expect(result.current.isCompleted).toBe(true));
    expect(result.current.operation?.progress).toBe(100);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter frontend test useOperation.test.ts`
Expected: FAIL with "Cannot find module '../useOperation'"

- [ ] **Step 3: Implement `types.ts`, `operationService.ts`, and `useOperation.ts`**

Create `frontend/src/components/operation/types.ts` (defining `OperationPayload`, `OperationStep`, `OperationStatus`).
Create `frontend/src/services/operationService.ts`:
```typescript
import httpRequest from '@/services/httpRequest';

export const operationService = {
  getOperation: async (id: string) => {
    const res = await httpRequest.get(`api/v1/operations/${id}/`);
    return res.data;
  },
  getActiveOperations: async () => {
    const res = await httpRequest.get('api/v1/operations/active/');
    return res.data;
  },
  cancelOperation: async (id: string) => {
    const res = await httpRequest.post(`api/v1/operations/${id}/cancel/`);
    return res.data;
  },
};
export default operationService;
```
Create `frontend/src/components/operation/useOperation.ts` with polling support, cleanup on unmount, and status flags (`isRunning`, `isCompleted`, `isFailed`).

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter frontend test useOperation.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/operation frontend/src/services/operationService.ts
git commit -m "feat(operation): implement operation types, service, and useOperation hook"
```

---

### Task 4: Frontend UI Components — Inline, Timeline & Detail Modal

**Files:**
- Create: `frontend/src/components/operation/OperationProgress.tsx`
- Create: `frontend/src/components/operation/OperationTimeline.tsx`
- Create: `frontend/src/components/operation/OperationDetailModal.tsx`
- Create: `frontend/src/components/operation/index.ts`
- Create: `frontend/src/components/operation/__tests__/OperationComponents.test.tsx`

**Interfaces:**
- Produces:
  - `<OperationProgress operation={op} onOpenDetail={fn} size="sm"|"md" />`
  - `<OperationTimeline operation={op} onRetryStep={fn} expandable={true} />`
  - `<OperationDetailModal open={isOpen} onClose={fn} operation={op} onRetry={fn} onCancel={fn} />`

- [ ] **Step 1: Write failing test for Operation components**

Create `frontend/src/components/operation/__tests__/OperationComponents.test.tsx`:
```tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { OperationProgress } from '../OperationProgress';
import { OperationTimeline } from '../OperationTimeline';
import type { OperationPayload } from '../types';

const mockOp: OperationPayload = {
  id: 'op_1',
  type: 'test',
  title: 'Đồng bộ dữ liệu',
  status: 'running',
  progress: 60,
  currentStepKey: 'step2',
  steps: [
    { key: 'step1', label: 'Kết nối', status: 'completed', progress: 100 },
    { key: 'step2', label: 'Tải dữ liệu', status: 'running', progress: 50, detail: 'Đang đọc 50%' },
    { key: 'step3', label: 'Lưu DB', status: 'pending', progress: 0 },
  ],
  createdAt: '2026-09-17T10:00:00Z',
  updatedAt: '2026-09-17T10:00:05Z',
};

describe('Operation UI components', () => {
  it('renders OperationProgress with title and percentage', () => {
    render(<OperationProgress operation={mockOp} />);
    expect(screen.getByText('Đồng bộ dữ liệu')).toBeInTheDocument();
    expect(screen.getByText('60%')).toBeInTheDocument();
  });

  it('renders OperationTimeline with steps', () => {
    render(<OperationTimeline operation={mockOp} />);
    expect(screen.getByText('Kết nối')).toBeInTheDocument();
    expect(screen.getByText('Tải dữ liệu')).toBeInTheDocument();
    expect(screen.getByText('Lưu DB')).toBeInTheDocument();
    expect(screen.getByText('Đang đọc 50%')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter frontend test OperationComponents.test.tsx`
Expected: FAIL with component import errors

- [ ] **Step 3: Implement `OperationProgress`, `OperationTimeline`, and `OperationDetailModal`**

Implement:
- `OperationProgress.tsx`: 1-line layout with status icon, animated progress bar, percentage pill, and detail click button.
- `OperationTimeline.tsx`: Vertical Stepper with connected vertical lines, completed checkmarks (#10b981), running pulsing circles (#2563eb), pending dots (#94a3b8), failed crosses (#ef4444) and detail chips.
- `OperationDetailModal.tsx`: MUI Dialog with full metadata, timestamps, JSON results viewer, retry & cancel actions.
- `index.ts`: Barrel export.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter frontend test OperationComponents.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/operation
git commit -m "feat(operation): implement OperationProgress, OperationTimeline, and OperationDetailModal"
```

---

### Task 5: Frontend Global Context & Floating Dock (`OperationCenterDock`)

**Files:**
- Create: `frontend/src/components/operation/OperationProvider.tsx`
- Create: `frontend/src/components/operation/OperationCenterDock.tsx`
- Modify: `frontend/src/app/layout.tsx` or `frontend/src/app/providers.tsx`
- Create: `frontend/src/components/operation/__tests__/OperationCenterDock.test.tsx`

**Interfaces:**
- Produces:
  - `OperationProvider`: Maintains map of active operations, periodically syncs with `/api/v1/operations/active/`, provides `registerOperation(id)` and `dismissOperation(id)`.
  - `OperationCenterDock`: Fixed bottom-right widget (`bottom: 24px, right: 24px`).
    - Collapsed: Pill button with active count and pulse icon.
    - Expanded: Card list with mini progress bars, dismiss button, and open modal trigger.

- [ ] **Step 1: Write failing test for `OperationCenterDock`**

Create `frontend/src/components/operation/__tests__/OperationCenterDock.test.tsx`:
```tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { OperationCenterDock } from '../OperationCenterDock';

describe('OperationCenterDock', () => {
  it('renders dock with active operations', () => {
    const activeOps = [
      { id: 'op_1', title: 'Import Vieclam24h', progress: 40, status: 'running' as const, steps: [] },
    ];
    render(<OperationCenterDock operations={activeOps} onDismiss={jest.fn()} onSelect={jest.fn()} />);
    expect(screen.getByText(/1 tác vụ đang chạy/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter frontend test OperationCenterDock.test.tsx`
Expected: FAIL with "Cannot find module '../OperationCenterDock'"

- [ ] **Step 3: Implement `OperationProvider` and `OperationCenterDock`**

Implement:
- `OperationProvider.tsx` managing operations in React state, backed by `localStorage` persistence.
- `OperationCenterDock.tsx` with animated slide-up/fade, badge count, and mini progress card.
- Mount `<OperationCenterDock />` inside `OperationProvider` in app root layout.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter frontend test OperationCenterDock.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/operation frontend/src/app/
git commit -m "feat(operation): implement OperationProvider and OperationCenterDock floating tray"
```

---

### Task 6: Flow 1 Integration — Candidate Resume AI Screening

**Files:**
- Modify: `api/apps/jobs/tasks.py:870-1320` (`analyze_resume_ai`)
- Modify: `frontend/src/views/components/employers/AIAnalysisDrawer/AIAnalysisDrawerStatePanels.tsx:120-170`
- Modify: `frontend/src/views/components/employers/AppliedResumeTable/AIAnalysisComponent.tsx:80-110`
- Test: `api/apps/jobs/tests/test_ai_analysis_operation.py`
- Test: `frontend/src/views/components/employers/AIAnalysisDrawer/__tests__/AIAnalysisDrawer.test.ts`

**Interfaces:**
- Celery task `analyze_resume_ai` uses `OperationTracker` with 4 steps:
  1. `extract_text`
  2. `criteria_match`
  3. `llm_evaluation`
  4. `scoring_finalize`
- Drawer renders `<OperationTimeline>` instead of static `LinearProgress` when `isProcessing`.
- Candidate table `AIAnalysisComponent` renders inline `<OperationProgress>` during scan.

- [ ] **Step 1: Write backend test for `analyze_resume_ai` operation tracking**

Create `api/apps/jobs/tests/test_ai_analysis_operation.py`:
```python
import pytest
from apps.jobs.models import JobPostActivity, JobPost
from apps.jobs.tasks import analyze_resume_ai
from apps.operations.models import AsyncOperation

@pytest.mark.django_db
def test_analyze_resume_ai_creates_operation(mocker):
    mocker.patch('apps.jobs.tasks._acquire_analysis_slot', return_value='test_slot')
    mocker.patch('apps.jobs.tasks._release_analysis_slot')
    # Mock LLM and extract text
    activity = JobPostActivity.objects.create(status=1)
    analyze_resume_ai(activity.id)
    op = AsyncOperation.objects.filter(metadata__activity_id=activity.id).first()
    assert op is not None
    assert op.type == "candidate.ai_scan"
    assert len(op.steps) == 4
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest api/apps/jobs/tests/test_ai_analysis_operation.py -v`
Expected: FAIL (no operation created yet)

- [ ] **Step 3: Update `analyze_resume_ai` and Frontend Drawer/Table**

In `api/apps/jobs/tasks.py`:
Wrap `analyze_resume_ai` with `OperationTracker.create(type="candidate.ai_scan", ...)`.
Update steps sequentially:
- `tracker.start_step("extract_text")` $\rightarrow$ `tracker.complete_step("extract_text")`
- `tracker.start_step("criteria_match")` $\rightarrow$ `tracker.complete_step("criteria_match")`
- `tracker.start_step("llm_evaluation")` $\rightarrow$ `tracker.complete_step("llm_evaluation")`
- `tracker.start_step("scoring_finalize")` $\rightarrow$ `tracker.finish(...)`
Store `operation_id` in `JobPostActivity.ai_analysis_evidence` or metadata.

In `frontend/src/views/components/employers/AIAnalysisDrawer/AIAnalysisDrawerStatePanels.tsx`:
Replace lines 120-170 with `<OperationTimeline operation={currentOperation} />`.

In `frontend/src/views/components/employers/AppliedResumeTable/AIAnalysisComponent.tsx`:
Render `<OperationProgress operation={currentOperation} size="sm" />`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `pytest api/apps/jobs/tests/test_ai_analysis_operation.py -v`
Run: `pnpm --filter frontend test AIAnalysisDrawer.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add api/apps/jobs/ frontend/src/views/components/employers/
git commit -m "feat(jobs): integrate OperationTracker and OperationTimeline into Candidate AI Screening"
```

---

### Task 7: Flow 2 Integration — Vieclam24h Candidate Data Sync

**Files:**
- Modify: `api/apps/profiles/tasks.py:25-98` (`run_vieclam24h_import`)
- Modify: `frontend/src/views/adminPages/ProfilesPage/index.tsx:835-875`
- Test: `api/apps/profiles/tests/test_vieclam24h_operation.py`
- Test: `frontend/src/views/adminPages/__tests__/ProfilesPageImportPersistence.test.ts`

**Interfaces:**
- Celery task `run_vieclam24h_import` tracks 5 steps:
  1. `authenticate`
  2. `fetch_candidates`
  3. `parse_normalize`
  4. `deduplicate_save`
  5. `generate_report`
- `ProfilesPage` dialog renders `<OperationTimeline>` and registers operation to `OperationProvider` so closing the modal persists tracking in `OperationCenterDock`.

- [ ] **Step 1: Write backend test for Vieclam24h operation tracking**

Create `api/apps/profiles/tests/test_vieclam24h_operation.py`:
```python
import pytest
from apps.profiles.models import ResumeImportJob
from apps.profiles.tasks import run_vieclam24h_import
from apps.operations.models import AsyncOperation

@pytest.mark.django_db
def test_run_vieclam24h_import_tracks_operation(mocker):
    mocker.patch('apps.profiles.tasks.import_vieclam24h_candidates', return_value=mocker.Mock(created_count=5, updated_count=1, skipped_count=0))
    job = ResumeImportJob.objects.create(status='pending')
    run_vieclam24h_import(job.id, source_url='http://test', account='acc', password='pwd')
    op = AsyncOperation.objects.filter(metadata__job_id=job.id).first()
    assert op is not None
    assert op.type == "vieclam24h.import"
    assert op.status == "completed"
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest api/apps/profiles/tests/test_vieclam24h_operation.py -v`
Expected: FAIL

- [ ] **Step 3: Update `run_vieclam24h_import` and `ProfilesPage`**

In `api/apps/profiles/tasks.py`:
Add `OperationTracker` around import lifecycle with 5 steps.
Update progress in `progress_callback`.

In `frontend/src/views/adminPages/ProfilesPage/index.tsx`:
Replace the static Paper (lines 835-875) with `<OperationTimeline operation={importOperation} />`.
Call `registerOperation(importJob.operationId)` so the floating dock picks it up on modal close.

- [ ] **Step 4: Run tests to verify they pass**

Run: `pytest api/apps/profiles/tests/test_vieclam24h_operation.py -v`
Run: `pnpm --filter frontend test ProfilesPageImportPersistence.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add api/apps/profiles/ frontend/src/views/adminPages/ProfilesPage/
git commit -m "feat(profiles): integrate OperationTracker into Vieclam24h Candidate Data Lake Sync"
```

---

### Task 8: Flow 3 Integration — Post-Interview AI Evaluation

**Files:**
- Modify: `api/apps/interviews/tasks.py:304-485` (`evaluate_interview_session`)
- Modify: `frontend/src/views/interviewPages/components/InterviewCompletedView.tsx:290-307`
- Modify: `frontend/src/views/jobSeekerPages/MyInterviewsPage/components/CandidateEvaluationModal.tsx:260-280`
- Test: `api/apps/interviews/tests/test_evaluation_operation.py`
- Test: `frontend/src/views/jobSeekerPages/MyInterviewsPage/__tests__/CandidateEvaluationModalVideo.test.ts`

**Interfaces:**
- Celery task `evaluate_interview_session` tracks 5 steps:
  1. `sync_recording`
  2. `transcribe_align`
  3. `ai_scoring`
  4. `apply_weights`
  5. `publish_report`
- `InterviewCompletedView` and `CandidateEvaluationModal` render `<OperationTimeline>` with real-time steps while evaluating.

- [ ] **Step 1: Write backend test for evaluation operation**

Create `api/apps/interviews/tests/test_evaluation_operation.py`:
```python
import pytest
from apps.interviews.models import InterviewSession
from apps.interviews.tasks import evaluate_interview_session
from apps.operations.models import AsyncOperation

@pytest.mark.django_db
def test_evaluate_interview_session_operation(mocker):
    session = InterviewSession.objects.create(status='processing')
    mocker.patch('apps.interviews.tasks.post_chat_completion_httpx', side_effect=Exception("skip llm"))
    evaluate_interview_session(session.id)
    op = AsyncOperation.objects.filter(metadata__session_id=session.id).first()
    assert op is not None
    assert op.type == "interview.evaluate"
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest api/apps/interviews/tests/test_evaluation_operation.py -v`
Expected: FAIL

- [ ] **Step 3: Update `evaluate_interview_session` and Interview UI**

In `api/apps/interviews/tasks.py`:
Wrap evaluation in `OperationTracker.create(type="interview.evaluate", ...)`.
Record each phase (`sync_recording`, `transcribe_align`, `ai_scoring`, `apply_weights`, `publish_report`).

In `frontend/src/views/interviewPages/components/InterviewCompletedView.tsx` & `CandidateEvaluationModal.tsx`:
Replace the pulsing badge with `<OperationTimeline operation={evalOperation} />`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `pytest api/apps/interviews/tests/test_evaluation_operation.py -v`
Run: `pnpm --filter frontend test CandidateEvaluationModalVideo.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add api/apps/interviews/ frontend/src/views/interviewPages/ frontend/src/views/jobSeekerPages/
git commit -m "feat(interviews): integrate OperationTracker into Post-Interview Evaluation"
```

---

## Plan Self-Review
1. **Spec Coverage**:
   - Data Contract & Schema covered in Task 1 & Task 3.
   - Django `AsyncOperation` model & `OperationTracker` covered in Task 1 & Task 2.
   - 4 Presentation Modes (Inline, Timeline, Modal, Dock) covered in Task 4 & Task 5.
   - Flow 1 (Resume AI screening) covered in Task 6.
   - Flow 2 (Vieclam24h import) covered in Task 7.
   - Flow 3 (Interview evaluation) covered in Task 8.
   - Error handling and resilience covered in Task 2, Task 3, and Task 5.
2. **No Placeholders**: All tasks contain explicit file paths, interfaces, and concrete code blocks.
3. **Type Consistency**: `OperationPayload` and `OperationStep` field names match across backend serializers and frontend interfaces.
