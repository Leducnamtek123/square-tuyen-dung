from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("info", "0007_employer_candidate_profile"),
        ("job", "0009_jobpostactivity_active_application_key"),
    ]

    operations = [
        migrations.AlterField(
            model_name="jobpostactivity",
            name="user",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.AlterField(
            model_name="jobpostactivity",
            name="resume",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                to="info.resume",
            ),
        ),
        migrations.AddField(
            model_name="jobpostactivity",
            name="manual_candidate_profile",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="job_post_activities",
                to="info.employercandidateprofile",
            ),
        ),
    ]
