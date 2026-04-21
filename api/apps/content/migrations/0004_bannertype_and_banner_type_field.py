from django.db import migrations, models


def seed_banner_types(apps, schema_editor):
    BannerType = apps.get_model('content', 'BannerType')
    defaults = [
        {
            'code': 'HOME',
            'name': 'Home',
            'value': 1,
            'web_aspect_ratio': '16:5',
            'mobile_aspect_ratio': '1:1',
            'is_active': True,
        },
        {
            'code': 'MAIN_JOB_RIGHT',
            'name': 'Main Job Right',
            'value': 2,
            'web_aspect_ratio': '1:1',
            'mobile_aspect_ratio': '1:1',
            'is_active': True,
        },
    ]
    for item in defaults:
        BannerType.objects.update_or_create(code=item['code'], defaults=item)


def unseed_banner_types(apps, schema_editor):
    BannerType = apps.get_model('content', 'BannerType')
    BannerType.objects.filter(code__in=['HOME', 'MAIN_JOB_RIGHT']).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('content', '0003_systemsetting'),
    ]

    operations = [
        migrations.CreateModel(
            name='BannerType',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('create_at', models.DateTimeField(auto_now_add=True)),
                ('update_at', models.DateTimeField(auto_now=True)),
                ('code', models.CharField(db_index=True, max_length=50, unique=True)),
                ('name', models.CharField(max_length=100)),
                ('value', models.PositiveIntegerField(unique=True)),
                ('web_aspect_ratio', models.CharField(blank=True, default='', max_length=20)),
                ('mobile_aspect_ratio', models.CharField(blank=True, default='', max_length=20)),
                ('is_active', models.BooleanField(default=True)),
            ],
            options={
                'db_table': 'project_project_banner_type',
                'ordering': ['value'],
            },
        ),
        migrations.AlterField(
            model_name='banner',
            name='type',
            field=models.IntegerField(db_index=True, default=1),
        ),
        migrations.RunPython(seed_banner_types, unseed_banner_types),
    ]
