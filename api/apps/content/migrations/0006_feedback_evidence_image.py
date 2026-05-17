from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('Project', '0005_article'),
        ('files', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='feedback',
            name='evidence_image',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='feedback_evidence_images',
                to='files.file',
            ),
        ),
    ]
