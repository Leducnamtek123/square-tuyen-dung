import logging

from celery import shared_task
from django.utils import timezone

from apps.locations.models import City, District
from apps.profiles.models import ResumeImportJob
from apps.profiles.services.vieclam24h_import import import_vieclam24h_candidates

logger = logging.getLogger(__name__)


def _update_job(job: ResumeImportJob, **fields) -> None:
    for key, value in fields.items():
        setattr(job, key, value)
    try:
        job.save(update_fields=[*fields.keys(), "update_at"])
    except Exception:
        try:
            job.save()
        except Exception:
            pass


@shared_task(bind=True)
def run_vieclam24h_import(
    self,
    job_id: int,
    *,
    source_url: str,
    account: str,
    password: str,
    occupation_ids: list[int] | None = None,
    target_city_id: int | None = None,
    target_district_id: int | None = None,
) -> dict[str, int | str]:
    job = ResumeImportJob.objects.filter(id=job_id).first()
    if not job:
        raise ResumeImportJob.DoesNotExist(f"ResumeImportJob {job_id} does not exist")

    job.task_id = self.request.id or ""
    _update_job(
        job,
        status=ResumeImportJob.Status.PROCESSING,
        progress=5,
        started_at=timezone.now(),
        error_message="",
        result_payload=None,
    )

    target_city = City.objects.filter(id=target_city_id).first() if target_city_id else None
    target_district = District.objects.filter(id=target_district_id).first() if target_district_id else None

    def progress_callback(pct: int):
        _update_job(job, progress=min(pct, 95))

    try:
        _update_job(job, progress=10)
        result = import_vieclam24h_candidates(
            source_url=source_url,
            username=account,
            password=password,
            occupation_ids=list(occupation_ids or []),
            target_city=target_city,
            target_district=target_district,
            on_progress=progress_callback,
        )
    except Exception as exc:
        logger.exception("Vieclam24h import job %s failed", job_id)
        _update_job(
            job,
            status=ResumeImportJob.Status.FAILED,
            progress=0,
            error_message=str(exc),
            finished_at=timezone.now(),
        )
        raise

    _update_job(
        job,
        status=ResumeImportJob.Status.COMPLETED,
        progress=100,
        created_count=result.created_count,
        updated_count=result.updated_count,
        skipped_count=result.skipped_count,
        result_payload={
            "createdCount": result.created_count,
            "updatedCount": result.updated_count,
            "skippedCount": result.skipped_count,
        },
        finished_at=timezone.now(),
    )
    return {
        "createdCount": result.created_count,
        "updatedCount": result.updated_count,
        "skippedCount": result.skipped_count,
    }


@shared_task
def scheduled_vieclam24h_data_lake_ingestion_task():
    """
    Periodic background task to ingest candidate profiles from Vieclam24h
    into the central Candidate Data Lake using the system shared credentials.
    """
    from apps.content.system_settings import get_system_setting
    from apps.profiles.services.vieclam24h_import_browser import collect_vieclam24h_candidates
    from apps.profiles.services.vieclam24h_import import persist_vieclam24h_candidates

    enabled = bool(get_system_setting("vieclam24hAutoIngestEnabled", True))
    if not enabled:
        logger.info("Vieclam24h Data Lake auto-ingestion is disabled in system settings.")
        return {"status": "disabled"}

    username = str(get_system_setting("vieclam24hSharedUsername", "") or "").strip()
    password = str(get_system_setting("vieclam24hSharedPassword", "") or "").strip()
    if not username or not password:
        logger.info("Vieclam24h shared credentials not configured.")
        return {"status": "unconfigured"}

    source_url = "https://ntd.vieclam24h.vn/tim-kiem-ung-vien-nhanh"
    try:
        candidates = collect_vieclam24h_candidates(
            source_url=source_url,
            username=username,
            password=password,
            occupation_ids=[],
        )
        if candidates:
            result = persist_vieclam24h_candidates(
                candidates=candidates,
                source_url=source_url,
                source_account=username,
            )
            logger.info(
                "Scheduled Data Lake Ingestion completed: created=%d, updated=%d, skipped=%d",
                result.created_count,
                result.updated_count,
                result.skipped_count,
            )
            return {
                "createdCount": result.created_count,
                "updatedCount": result.updated_count,
                "skippedCount": result.skipped_count,
            }
    except Exception as exc:
        logger.exception("Scheduled Vieclam24h Data Lake ingestion failed: %s", exc)
        return {"status": "error", "message": str(exc)}
    return {"createdCount": 0, "updatedCount": 0, "skippedCount": 0}
