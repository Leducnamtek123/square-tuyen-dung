import logging
from celery import shared_task
from apps.exchange.models import ExportJob, ImportJob
from apps.exchange.services.export_service import ExportService
from apps.exchange.services.import_service import ImportService

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=2, default_retry_delay=10)
def process_export_job_task(self, job_id: int):
    """Celery background task for asynchronous file generation & storage."""
    try:
        job = ExportJob.objects.get(id=job_id)
        ExportService.run_export_job(job)
    except ExportJob.DoesNotExist:
        logger.error("ExportJob with id %d does not exist", job_id)
    except Exception as exc:
        logger.exception("Error executing export task %d: %s", job_id, exc)
        try:
            self.retry(exc=exc)
        except Exception:
            pass


@shared_task(bind=True, max_retries=1, default_retry_delay=10)
def process_import_commit_task(self, job_id: int):
    """Celery background task for committing validated import records."""
    try:
        job = ImportJob.objects.get(id=job_id)
        ImportService.commit_import_job(job)
    except ImportJob.DoesNotExist:
        logger.error("ImportJob with id %d does not exist", job_id)
    except Exception as exc:
        logger.exception("Error executing import commit task %d: %s", job_id, exc)
