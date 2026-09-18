import pytest
from apps.operations.models import AsyncOperation, OperationStatus
from apps.profiles.models import ResumeImportJob
from apps.profiles.tasks import run_vieclam24h_import


class MockImportResult:
    def __init__(self, created_count=5, updated_count=2, skipped_count=1):
        self.created_count = created_count
        self.updated_count = updated_count
        self.skipped_count = skipped_count


@pytest.mark.django_db
def test_run_vieclam24h_import_tracks_operation(monkeypatch, admin_user):
    job = ResumeImportJob.objects.create(
        status=ResumeImportJob.Status.PENDING,
        source_url="https://ntd.vieclam24h.vn/tim-kiem-ung-vien-nhanh",
        source_account="recruiter@example.com",
        created_by=admin_user,
    )

    def fake_import_candidates(*args, on_progress=None, **kwargs):
        if on_progress:
            on_progress(15)
            on_progress(50)
            on_progress(80)
        return MockImportResult(created_count=7, updated_count=3, skipped_count=2)

    monkeypatch.setattr(
        "apps.profiles.tasks.import_vieclam24h_candidates",
        fake_import_candidates,
    )

    result = run_vieclam24h_import.apply(
        args=[job.id],
        kwargs={
            "source_url": job.source_url,
            "account": "recruiter@example.com",
            "password": "secretpassword",
        },
    ).result

    job.refresh_from_db()
    assert job.status == ResumeImportJob.Status.COMPLETED
    assert job.progress == 100
    assert job.created_count == 7
    assert job.updated_count == 3
    assert job.skipped_count == 2
    assert result == {"createdCount": 7, "updatedCount": 3, "skippedCount": 2}

    # Verify AsyncOperation
    op = AsyncOperation.objects.filter(
        type="vieclam24h.import",
        metadata__job_id=job.id,
    ).first()

    assert op is not None, "AsyncOperation should be created for vieclam24h.import"
    assert op.status == OperationStatus.COMPLETED
    assert op.progress == 100
    assert len(op.steps) == 5

    step_keys = [s["key"] for s in op.steps]
    assert step_keys == [
        "authenticate",
        "fetch_candidates",
        "parse_normalize",
        "deduplicate_save",
        "generate_report",
    ]

    for step in op.steps:
        assert step["status"] == "completed", f"Step {step['key']} should be completed"

    assert op.result == {"createdCount": 7, "updatedCount": 3, "skippedCount": 2}
    assert job.result_payload is not None
    assert job.result_payload.get("operation_id") == op.id


@pytest.mark.django_db
def test_run_vieclam24h_import_handles_failure(monkeypatch, admin_user):
    job = ResumeImportJob.objects.create(
        status=ResumeImportJob.Status.PENDING,
        source_url="https://ntd.vieclam24h.vn/tim-kiem-ung-vien-nhanh",
        source_account="recruiter@example.com",
        created_by=admin_user,
    )

    def failing_import_candidates(*args, **kwargs):
        raise RuntimeError("Portal authentication failed: bad credentials")

    monkeypatch.setattr(
        "apps.profiles.tasks.import_vieclam24h_candidates",
        failing_import_candidates,
    )

    with pytest.raises(RuntimeError, match="Portal authentication failed"):
        run_vieclam24h_import.apply(
            args=[job.id],
            kwargs={
                "source_url": job.source_url,
                "account": "recruiter@example.com",
                "password": "wrongpassword",
            },
        ).get()

    job.refresh_from_db()
    assert job.status == ResumeImportJob.Status.FAILED

    op = AsyncOperation.objects.filter(
        type="vieclam24h.import",
        metadata__job_id=job.id,
    ).first()

    assert op is not None, "AsyncOperation should be created and recorded on failure"
    assert op.status == OperationStatus.FAILED
    assert "Portal authentication failed" in str(op.error)
