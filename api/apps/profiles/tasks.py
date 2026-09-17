import logging

from celery import shared_task
from django.utils import timezone

from apps.locations.models import City, District
from apps.operations.models import AsyncOperation
from apps.operations.services import OperationTracker
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

    tracker = None
    try:
        create_kwargs = {
            "type": "vieclam24h.import",
            "title": f"Đồng bộ ứng viên Vieclam24h #{job.id}",
            "steps": [
                {"key": "authenticate", "label": "Đăng nhập portal Vieclam24h"},
                {"key": "fetch_candidates", "label": "Tải danh sách ứng viên"},
                {"key": "parse_normalize", "label": "Chuẩn hóa dữ liệu hồ sơ"},
                {"key": "deduplicate_save", "label": "Đối soát trùng lặp & lưu CSDL"},
                {"key": "generate_report", "label": "Tổng hợp báo cáo kết quả"},
            ],
            "metadata": {"job_id": job.id, "source_url": source_url},
        }
        user = getattr(job, "created_by", None)
        if user:
            create_kwargs["user_id"] = getattr(user, "id", None)

        try:
            tracker = OperationTracker.create(**create_kwargs)
        except TypeError:
            create_kwargs.pop("user_id", None)
            create_kwargs["user"] = user
            try:
                tracker = OperationTracker.create(**create_kwargs)
            except TypeError:
                create_kwargs.pop("user", None)
                tracker = OperationTracker.create(**create_kwargs)

        if user and hasattr(tracker.op, "user_id") and not tracker.op.user_id:
            try:
                tracker.op.user = user
                tracker.op.save(update_fields=["user"])
            except Exception:
                pass
    except Exception as tr_err:
        logger.warning("Could not initialize OperationTracker: %s", tr_err)

    initial_result_payload = job.result_payload or {}
    if isinstance(initial_result_payload, dict):
        if tracker:
            initial_result_payload["operation_id"] = tracker.operation.id
    else:
        initial_result_payload = {"operation_id": tracker.operation.id} if tracker else {}

    initial_source_payload = job.source_payload or {}
    if isinstance(initial_source_payload, dict) and tracker:
        initial_source_payload["operation_id"] = tracker.operation.id
        job.source_payload = initial_source_payload

    _update_job(
        job,
        status=ResumeImportJob.Status.PROCESSING,
        progress=5,
        started_at=timezone.now(),
        error_message="",
        result_payload=initial_result_payload,
        source_payload=job.source_payload,
    )

    if tracker:
        try:
            tracker.start_step("authenticate", detail="Đang kết nối và xác thực tài khoản Vieclam24h...")
        except Exception as step_err:
            logger.warning("OperationTracker start_step failed: %s", step_err)

    target_city = City.objects.filter(id=target_city_id).first() if target_city_id else None
    target_district = District.objects.filter(id=target_district_id).first() if target_district_id else None

    def progress_callback(pct: int):
        _update_job(job, progress=min(pct, 95))
        if tracker:
            try:
                if 10 <= pct < 40:
                    tracker.complete_step("authenticate", detail="Xác thực thành công.")
                    tracker.start_step("fetch_candidates", detail=f"Đang thu thập ứng viên ({pct}%)...")
                elif 40 <= pct < 70:
                    tracker.complete_step("fetch_candidates", detail="Đã thu thập ứng viên.")
                    tracker.start_step("parse_normalize", detail=f"Đang phân tích và chuẩn hóa hồ sơ ({pct}%)...")
                elif pct >= 70:
                    tracker.complete_step("parse_normalize", detail="Đã chuẩn hóa hồ sơ.")
                    tracker.start_step("deduplicate_save", detail=f"Đang đối soát trùng lặp và lưu CSDL ({pct}%)...")
            except Exception as e:
                logger.warning("OperationTracker step transition failed in progress_callback: %s", e)

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
        if tracker:
            try:
                current_step = tracker.op.current_step_key or "authenticate"
                for s in tracker.op.steps:
                    if s.get("key") == current_step:
                        s["status"] = "failed"
                        s["errorMessage"] = str(exc)[:500]
                        break
                tracker.op.save(update_fields=["steps"])
                try:
                    tracker.fail(str(exc)[:500], code="IMPORT_FAILED")
                except TypeError:
                    tracker.fail(error=str(exc)[:500], error_code="IMPORT_FAILED")
            except Exception as tr_fail_err:
                logger.warning("OperationTracker fail failed: %s", tr_fail_err)

        _update_job(
            job,
            status=ResumeImportJob.Status.FAILED,
            progress=0,
            error_message=str(exc),
            finished_at=timezone.now(),
        )
        raise

    if tracker:
        try:
            tracker.complete_step("authenticate", detail="Xác thực thành công.")
            tracker.complete_step("fetch_candidates", detail="Đã thu thập ứng viên.")
            tracker.complete_step("parse_normalize", detail="Đã chuẩn hóa hồ sơ.")
            tracker.complete_step(
                "deduplicate_save",
                detail=f"Đã lưu: tạo mới {result.created_count}, cập nhật {result.updated_count}, bỏ qua {result.skipped_count}.",
            )
            tracker.start_step("generate_report", detail="Đang hoàn tất báo cáo...")
            tracker.complete_step("generate_report", detail="Hoàn tất đồng bộ ứng viên Vieclam24h.")
            tracker.finish(
                result={
                    "createdCount": result.created_count,
                    "updatedCount": result.updated_count,
                    "skippedCount": result.skipped_count,
                }
            )
        except Exception as tr_finish_err:
            logger.warning("OperationTracker finish failed: %s", tr_finish_err)

    final_result_payload = {
        "createdCount": result.created_count,
        "updatedCount": result.updated_count,
        "skippedCount": result.skipped_count,
    }
    if tracker:
        final_result_payload["operation_id"] = tracker.operation.id

    _update_job(
        job,
        status=ResumeImportJob.Status.COMPLETED,
        progress=100,
        created_count=result.created_count,
        updated_count=result.updated_count,
        skipped_count=result.skipped_count,
        result_payload=final_result_payload,
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

    from apps.jobs.models import JobPost

    source_url = "https://ntd.vieclam24h.vn/tim-kiem-ung-vien-nhanh"
    hcm_city = City.objects.filter(name__icontains="Hồ Chí Minh").first()
    active_jobs = JobPost.objects.filter(status=3).select_related("career", "location", "location__city")

    total_created = 0
    total_updated = 0
    total_skipped = 0

    try:
        if active_jobs.exists():
            for job in active_jobs[:5]:
                job_city = (job.location.city if job.location and job.location.city else None) or hcm_city
                keyword = (job.job_name or "").strip()
                if not keyword:
                    continue

                candidates = collect_vieclam24h_candidates(
                    source_url=source_url,
                    username=username,
                    password=password,
                    keyword=keyword,
                    max_pages=1,
                    per_page=15,
                )
                if candidates:
                    result = persist_vieclam24h_candidates(
                        candidates=candidates,
                        source_url=source_url,
                        source_account=username,
                        target_career=job.career,
                        target_city=job_city,
                    )
                    total_created += result.created_count
                    total_updated += result.updated_count
                    total_skipped += result.skipped_count
        else:
            candidates = collect_vieclam24h_candidates(
                source_url=source_url,
                username=username,
                password=password,
                keyword="Xây dựng Nội thất",
                max_pages=1,
                per_page=15,
            )
            if candidates:
                result = persist_vieclam24h_candidates(
                    candidates=candidates,
                    source_url=source_url,
                    source_account=username,
                    target_city=hcm_city,
                )
                total_created += result.created_count
                total_updated += result.updated_count
                total_skipped += result.skipped_count

        logger.info(
            "Scheduled Data Lake Ingestion completed: created=%d, updated=%d, skipped=%d",
            total_created,
            total_updated,
            total_skipped,
        )
        return {
            "createdCount": total_created,
            "updatedCount": total_updated,
            "skippedCount": total_skipped,
        }
    except Exception as exc:
        logger.exception("Scheduled Vieclam24h Data Lake ingestion failed: %s", exc)
        return {"status": "error", "message": str(exc)}
    return {"createdCount": 0, "updatedCount": 0, "skippedCount": 0}
