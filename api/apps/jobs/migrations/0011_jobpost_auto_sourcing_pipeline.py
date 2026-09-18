from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("job", "0010_manual_candidate_application"),
    ]

    operations = [
        migrations.AddField(
            model_name="jobpost",
            name="is_auto_sourcing_enabled",
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name="jobpost",
            name="auto_sourcing_limit",
            field=models.PositiveIntegerField(default=10),
        ),
        migrations.AddField(
            model_name="jobpost",
            name="auto_interview_enabled",
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name="jobpost",
            name="min_screening_score",
            field=models.IntegerField(default=70),
        ),
    ]
