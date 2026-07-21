from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("job", "0006_savedjobpost_unique_user_jobpost"),
    ]

    operations = [
        migrations.AddField(
            model_name="jobpostactivity",
            name="frappe_employee_id",
            field=models.CharField(blank=True, db_index=True, default="", max_length=140),
        ),
        migrations.AddField(
            model_name="jobpostactivity",
            name="frappe_user_id",
            field=models.CharField(blank=True, default="", max_length=140),
        ),
        migrations.AddField(
            model_name="jobpostactivity",
            name="frappe_sync_status",
            field=models.CharField(
                choices=[
                    ("NOT_SYNCED", "Not synced"),
                    ("SYNCING", "Syncing"),
                    ("SYNCED", "Synced"),
                    ("FAILED", "Failed"),
                ],
                db_index=True,
                default="NOT_SYNCED",
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name="jobpostactivity",
            name="frappe_sync_error",
            field=models.TextField(blank=True, default=""),
        ),
        migrations.AddField(
            model_name="jobpostactivity",
            name="frappe_synced_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
