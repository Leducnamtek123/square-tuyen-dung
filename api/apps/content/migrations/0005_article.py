from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('Project', '0004_bannertype_and_banner_type_field'),
        ('files', '0001_initial'),
        ('accounts', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Article',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('create_at', models.DateTimeField(auto_now_add=True)),
                ('update_at', models.DateTimeField(auto_now=True)),
                ('title', models.CharField(max_length=255)),
                ('slug', models.SlugField(allow_unicode=True, max_length=280, unique=True)),
                ('excerpt', models.TextField(blank=True, default='', max_length=500)),
                ('content', models.TextField(default='')),
                ('category', models.CharField(
                    choices=[('news', 'Tin tức'), ('blog', 'Blog tuyển dụng')],
                    db_index=True, default='news', max_length=10
                )),
                ('status', models.CharField(
                    choices=[('draft', 'Bản nháp'), ('pending', 'Chờ duyệt'),
                             ('published', 'Đã đăng'), ('archived', 'Lưu trữ')],
                    db_index=True, default='draft', max_length=15
                )),
                ('view_count', models.PositiveIntegerField(default=0)),
                ('published_at', models.DateTimeField(blank=True, db_index=True, null=True)),
                ('tags', models.CharField(blank=True, default='', max_length=500)),
                ('thumbnail', models.ForeignKey(
                    blank=True, null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name='article_thumbnail',
                    to='files.file'
                )),
                ('author', models.ForeignKey(
                    blank=True, null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name='articles',
                    to='accounts.user'
                )),
            ],
            options={
                'db_table': 'project_content_article',
                'ordering': ['-published_at', '-create_at'],
            },
        ),
    ]
