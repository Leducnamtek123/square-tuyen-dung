# Generated manually to add company verification and trust reporting.

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("info", "0002_alter_resume_is_active_and_more"),
        ("job", "0005_jobpostactivity_unique_active_application"),
    ]

    operations = [
        migrations.AddField(
            model_name="company",
            name="is_verified",
            field=models.BooleanField(db_index=True, default=False),
        ),
        migrations.CreateModel(
            name="TrustReport",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("create_at", models.DateTimeField(auto_now_add=True)),
                ("update_at", models.DateTimeField(auto_now=True)),
                (
                    "target_type",
                    models.CharField(
                        choices=[("job", "Job post"), ("company", "Company")],
                        max_length=20,
                    ),
                ),
                (
                    "reason",
                    models.CharField(
                        choices=[
                            ("scam", "Scam or fraud"),
                            ("wrong_info", "Wrong or misleading information"),
                            ("spam", "Spam"),
                            ("duplicate", "Duplicate listing"),
                            ("other", "Other"),
                        ],
                        max_length=30,
                    ),
                ),
                ("message", models.TextField(blank=True, default="")),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("open", "Open"),
                            ("reviewing", "Reviewing"),
                            ("resolved", "Resolved"),
                            ("rejected", "Rejected"),
                        ],
                        db_index=True,
                        default="open",
                        max_length=20,
                    ),
                ),
                (
                    "company",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="trust_reports",
                        to="info.company",
                    ),
                ),
                (
                    "job_post",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="trust_reports",
                        to="job.jobpost",
                    ),
                ),
                (
                    "reporter",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="trust_reports",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "db_table": "project_info_trust_report",
            },
        ),
        migrations.AddIndex(
            model_name="trustreport",
            index=models.Index(fields=["target_type", "status"], name="idx_trust_report_target_status"),
        ),
        migrations.AddIndex(
            model_name="trustreport",
            index=models.Index(fields=["reporter", "status"], name="idx_trust_report_reporter_status"),
        ),
    ]
