from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('interview', '0006_question_title_alter_question_category'),
    ]

    operations = [
        migrations.AddField(
            model_name='questiongroup',
            name='is_public',
            field=models.BooleanField(default=False, verbose_name='Công khai cho ứng viên luyện tập'),
        ),
    ]
