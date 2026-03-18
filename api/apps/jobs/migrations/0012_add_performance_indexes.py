# Generated manually for performance optimization.

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("job", "0011_alter_jobpost_academic_level_and_more"),
    ]

    operations = [
        migrations.AlterField(
            model_name="jobpost",
            name="deadline",
            field=models.DateField(db_index=True),
        ),
        migrations.AlterField(
            model_name="jobpost",
            name="status",
            field=models.IntegerField(
                choices=[(1, "Pending"), (2, "Rejected"), (3, "Approved")],
                default=1,
                db_index=True,
            ),
        ),
        migrations.AlterField(
            model_name="jobpostactivity",
            name="status",
            field=models.IntegerField(
                choices=[
                    (1, "Pending Confirmation"),
                    (2, "Contacted"),
                    (3, "Tested"),
                    (4, "Interviewed"),
                    (5, "Hired"),
                    (6, "Not Selected"),
                ],
                db_index=True,
                default=1,
            ),
        ),
        migrations.AlterField(
            model_name="jobpostactivity",
            name="is_deleted",
            field=models.BooleanField(db_index=True, default=False),
        ),
        migrations.AddIndex(
            model_name="jobpost",
            index=models.Index(fields=["status", "deadline"], name="job_post_stt_dead_idx"),
        ),
        migrations.AddIndex(
            model_name="jobpost",
            index=models.Index(fields=["status", "create_at"], name="job_post_stt_create_idx"),
        ),
        migrations.AddIndex(
            model_name="jobpost",
            index=models.Index(fields=["deadline", "create_at"], name="job_post_dead_create_idx"),
        ),
        migrations.AddIndex(
            model_name="jobpostactivity",
            index=models.Index(fields=["status", "is_deleted"], name="job_act_stt_del_idx"),
        ),
        migrations.AddIndex(
            model_name="jobpostactivity",
            index=models.Index(fields=["job_post", "status"], name="job_act_post_stt_idx"),
        ),
        migrations.AddIndex(
            model_name="jobpostactivity",
            index=models.Index(fields=["create_at"], name="job_act_create_idx"),
        ),
    ]
