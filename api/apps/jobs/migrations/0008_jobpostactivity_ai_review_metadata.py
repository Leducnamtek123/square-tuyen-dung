# Generated manually for AI resume screening metadata.

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("job", "0007_jobpostactivity_frappe_hr_sync"),
    ]

    operations = [
        migrations.AddField(
            model_name="jobpostactivity",
            name="ai_analysis_criteria",
            field=models.JSONField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="jobpostactivity",
            name="ai_analysis_evidence",
            field=models.JSONField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="jobpostactivity",
            name="ai_analysis_model",
            field=models.CharField(blank=True, default="", max_length=120),
        ),
        migrations.AddField(
            model_name="jobpostactivity",
            name="ai_analysis_source",
            field=models.CharField(blank=True, default="", max_length=60),
        ),
        migrations.AddField(
            model_name="jobpostactivity",
            name="ai_analysis_prompt_version",
            field=models.CharField(blank=True, default="", max_length=40),
        ),
        migrations.AddField(
            model_name="jobpostactivity",
            name="ai_analysis_prompt_hash",
            field=models.CharField(blank=True, default="", max_length=64),
        ),
        migrations.AddField(
            model_name="jobpostactivity",
            name="ai_analysis_review_status",
            field=models.CharField(
                choices=[
                    ("ai_only", "AI only"),
                    ("reviewed", "Reviewed"),
                    ("overridden", "Overridden"),
                ],
                default="ai_only",
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name="jobpostactivity",
            name="ai_analysis_hr_override_score",
            field=models.IntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="jobpostactivity",
            name="ai_analysis_hr_override_note",
            field=models.TextField(blank=True, default=""),
        ),
        migrations.AddField(
            model_name="jobpostactivity",
            name="ai_analysis_reviewed_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="jobpostactivity",
            name="ai_analysis_reviewed_by",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="reviewed_ai_resume_analyses",
                to=settings.AUTH_USER_MODEL,
            ),
        ),
    ]
