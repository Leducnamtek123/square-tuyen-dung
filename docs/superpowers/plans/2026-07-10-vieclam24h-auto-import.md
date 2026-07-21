# Vieclam24h Auto Import Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move Vieclam24h candidate import to a backend worker job with explicit status/progress so the frontend only submits requests and polls state.

**Architecture:** Create a small import-job model in `profiles` to persist `pending / processing / completed / failed`, progress, counts, and error details. Expose a start endpoint that enqueues a Celery task and returns the job record immediately, plus a retrieve endpoint for polling. Keep the frontend thin: submit the import form, show a progress panel, and poll the backend until the job completes.

**Tech Stack:** Django REST Framework, Celery, PostgreSQL, React, React Query, MUI.

---

### Task 1: Add import job persistence in backend

**Files:**
- Modify: `api/apps/profiles/models.py`
- Create: `api/apps/profiles/migrations/0010_resume_import_job.py`
- Modify: `api/apps/profiles/admin.py` if needed for admin visibility

- [ ] **Step 1: Write the failing test**

```python
def test_resume_import_job_defaults_and_transitions():
    job = ResumeImportJob.objects.create(source_url="https://ntd.vieclam24h.vn/employer/search/seeker", source_account="hr@example.com")
    assert job.status == "pending"
    assert job.progress == 0
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest api/apps/profiles/tests/test_resume_import_job.py -v`
Expected: fail because `ResumeImportJob` does not exist yet.

- [ ] **Step 3: Write minimal implementation**

```python
class ResumeImportJob(CommonBaseModel):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        PROCESSING = "processing", "Processing"
        COMPLETED = "completed", "Completed"
        FAILED = "failed", "Failed"

    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING, db_index=True)
    progress = models.PositiveSmallIntegerField(default=0)
    created_count = models.PositiveIntegerField(default=0)
    updated_count = models.PositiveIntegerField(default=0)
    skipped_count = models.PositiveIntegerField(default=0)
    source_url = models.URLField()
    source_account = models.CharField(max_length=255)
    payload = models.JSONField(blank=True, null=True)
    error_message = models.TextField(blank=True, default="")
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pytest api/apps/profiles/tests/test_resume_import_job.py -v`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add api/apps/profiles/models.py api/apps/profiles/migrations/0010_resume_import_job.py api/apps/profiles/tests/test_resume_import_job.py
git commit -m "feat: persist vieclam24h import jobs"
```

### Task 2: Queue Vieclam24h import in a Celery worker

**Files:**
- Create: `api/apps/profiles/tasks.py`
- Modify: `api/apps/profiles/views/web_admin.py`
- Modify: `api/apps/profiles/services/vieclam24h_import.py` if needed for progress callbacks
- Modify: `api/apps/profiles/tests/test_admin_resume_import.py`

- [ ] **Step 1: Write the failing test**

```python
def test_admin_resume_import_endpoint_queues_job(monkeypatch, admin_user):
    # patch delay() and assert the response returns job id/status immediately
    ...
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest api/apps/profiles/tests/test_admin_resume_import.py -v`
Expected: current endpoint still returns sync counts instead of job metadata.

- [ ] **Step 3: Write minimal implementation**

```python
@shared_task
def run_vieclam24h_import(job_id: int) -> None:
    job = ResumeImportJob.objects.get(id=job_id)
    job.status = "processing"
    job.progress = 5
    job.save(update_fields=["status", "progress", "update_at"])
    ...
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pytest api/apps/profiles/tests/test_admin_resume_import.py -v`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add api/apps/profiles/tasks.py api/apps/profiles/views/web_admin.py api/apps/profiles/tests/test_admin_resume_import.py api/apps/profiles/services/vieclam24h_import.py
git commit -m "feat: queue vieclam24h import as background job"
```

### Task 3: Add polling API and frontend job state UI

**Files:**
- Modify: `api/apps/profiles/views/web_admin.py`
- Modify: `frontend/src/services/adminManagementService.ts`
- Modify: `frontend/src/views/adminPages/ProfilesPage/index.tsx`
- Modify: `frontend/src/views/adminPages/ProfilesPage/hooks/useProfiles.ts` if needed
- Modify: frontend i18n files used by the profiles page if labels are mojibake

- [ ] **Step 1: Write the failing test**

```ts
it('fetches import job status and renders progress', async () => {
  ...
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --runInBand <target>` or the repo’s existing frontend test command.
Expected: no polling API yet.

- [ ] **Step 3: Write minimal implementation**

```ts
adminManagementService.getVieclam24hImportJob(id)
// ProfilesPage stores job state and polls until completed
```

- [ ] **Step 4: Run test to verify it passes**

Run: frontend tests for the touched page and service.
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/services/adminManagementService.ts frontend/src/views/adminPages/ProfilesPage/index.tsx api/apps/profiles/views/web_admin.py
git commit -m "feat: show vieclam24h import job progress"
```

