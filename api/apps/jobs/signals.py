"""
Elasticsearch auto-sync signals for the Jobs app.

Whenever a JobPost is saved or deleted, we queue a Celery task to update
(or remove) the corresponding Elasticsearch document — so the search index
stays in sync without blocking the HTTP request cycle.
"""
import logging

from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver

logger = logging.getLogger(__name__)


def _index_job_post_async(job_post_id: int):
    """Queue an async Celery task to index a single JobPost."""
    try:
        from .tasks import es_index_job_post  # imported lazily to avoid circular import
        es_index_job_post.delay(job_post_id)
    except Exception as exc:
        logger.warning(
            "Could not queue es_index_job_post(id=%s): %s", job_post_id, exc
        )


def _delete_job_post_async(job_post_id: int):
    """Queue an async Celery task to remove a JobPost from the ES index."""
    try:
        from .tasks import es_delete_job_post
        es_delete_job_post.delay(job_post_id)
    except Exception as exc:
        logger.warning(
            "Could not queue es_delete_job_post(id=%s): %s", job_post_id, exc
        )


def connect_signals():
    """
    Connect model signals.  Called from JobsConfig.ready() so that signals
    are only registered once the app registry is fully loaded.
    """
    from .models import JobPost  # noqa — imported here to avoid early model access

    @receiver(post_save, sender=JobPost, weak=False, dispatch_uid="jobs_es_index_on_save")
    def on_job_post_save(sender, instance, **kwargs):
        _index_job_post_async(instance.pk)

    @receiver(post_save, sender=JobPost, weak=False, dispatch_uid="jobs_auto_pipeline_on_save")
    def on_job_post_auto_pipeline(sender, instance, **kwargs):
        from shared.configs import variable_system as var_sys
        if getattr(instance, "is_auto_sourcing_enabled", True) and instance.status == var_sys.JobPostStatus.APPROVED:
            try:
                from .tasks import run_job_auto_pipeline_task
                run_job_auto_pipeline_task.delay(instance.pk)
            except Exception as exc:
                logger.warning("Could not queue run_job_auto_pipeline_task(id=%s): %s", instance.pk, exc)

    @receiver(post_delete, sender=JobPost, weak=False, dispatch_uid="jobs_es_delete_on_delete")
    def on_job_post_delete(sender, instance, **kwargs):
        _delete_job_post_async(instance.pk)

    logger.debug("Jobs ES and Auto-Pipeline signals connected.")
