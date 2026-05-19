# Generated manually for repeatable soft-delete application history.

from django.db import migrations, models
from django.db.models import Count


def backfill_active_application_keys(apps, schema_editor):
    JobPostActivity = apps.get_model("job", "JobPostActivity")

    duplicate_groups = (
        JobPostActivity.objects.filter(is_deleted=False)
        .values("user_id", "job_post_id")
        .annotate(total=Count("id"))
        .filter(total__gt=1)
    )

    for group in duplicate_groups:
        ids = list(
            JobPostActivity.objects.filter(
                user_id=group["user_id"],
                job_post_id=group["job_post_id"],
                is_deleted=False,
            )
            .order_by("-create_at", "-id")
            .values_list("id", flat=True)
        )
        stale_ids = ids[1:]
        if stale_ids:
            JobPostActivity.objects.filter(id__in=stale_ids).update(
                is_deleted=True,
                active_application_key=None,
            )

    JobPostActivity.objects.filter(is_deleted=True).update(active_application_key=None)

    for activity in JobPostActivity.objects.filter(is_deleted=False).iterator():
        JobPostActivity.objects.filter(id=activity.id).update(
            active_application_key=f"{activity.user_id}:{activity.job_post_id}"
        )


def clear_active_application_keys(apps, schema_editor):
    JobPostActivity = apps.get_model("job", "JobPostActivity")
    JobPostActivity.objects.update(active_application_key=None)


def suspend_unverified_company_jobs(apps, schema_editor):
    JobPost = apps.get_model("job", "JobPost")
    JobPost.objects.filter(status=3, company__is_verified=False).update(status=1)


def noop_reverse(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("job", "0008_jobpostactivity_ai_review_metadata"),
        ("info", "0005_resume_interaction_uniques"),
    ]

    operations = [
        migrations.AddField(
            model_name="jobpostactivity",
            name="active_application_key",
            field=models.CharField(blank=True, editable=False, max_length=64, null=True, unique=True),
        ),
        migrations.RemoveConstraint(
            model_name="jobpostactivity",
            name="uq_jobpostactivity_user_jobpost_deleted_state",
        ),
        migrations.RunPython(backfill_active_application_keys, clear_active_application_keys),
        migrations.RunPython(suspend_unverified_company_jobs, noop_reverse),
    ]
