from django.db import migrations, models


def dedupe_saved_jobs(apps, schema_editor):
    SavedJobPost = apps.get_model("job", "SavedJobPost")
    duplicates = (
        SavedJobPost.objects.values("user_id", "job_post_id")
        .annotate(first_id=models.Min("id"), total=models.Count("id"))
        .filter(total__gt=1)
    )
    for duplicate in duplicates.iterator():
        SavedJobPost.objects.filter(
            user_id=duplicate["user_id"],
            job_post_id=duplicate["job_post_id"],
        ).exclude(id=duplicate["first_id"]).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("job", "0005_jobpostactivity_unique_active_application"),
    ]

    operations = [
        migrations.RunPython(dedupe_saved_jobs, migrations.RunPython.noop),
        migrations.AddConstraint(
            model_name="savedjobpost",
            constraint=models.UniqueConstraint(
                fields=("user", "job_post"),
                name="uq_savedjobpost_user_jobpost",
            ),
        ),
    ]
