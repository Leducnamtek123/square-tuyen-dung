from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('job', '0001_initial'),
        ('hrm', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='employee',
            name='onboarded_from_activity',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='converted_employees',
                to='job.jobpostactivity',
            ),
        ),
    ]
