from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import autoslug.fields


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("files", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="CVTemplate",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("create_at", models.DateTimeField(auto_now_add=True)),
                ("update_at", models.DateTimeField(auto_now=True)),
                ("code", models.SlugField(unique=True)),
                ("name", models.CharField(max_length=150)),
                ("description", models.TextField(blank=True, default="")),
                ("category", models.CharField(db_index=True, default="modern", max_length=50)),
                ("category_name", models.CharField(default="Hiện đại", max_length=100)),
                ("thumbnail_url", models.URLField(blank=True, max_length=500, null=True)),
                ("color_palettes", models.JSONField(blank=True, default=list)),
                ("default_theme", models.JSONField(blank=True, default=dict)),
                ("sample_data", models.JSONField(blank=True, default=dict)),
                ("is_active", models.BooleanField(db_index=True, default=True)),
                ("is_premium", models.BooleanField(default=False)),
                ("is_popular", models.BooleanField(default=False)),
                ("sort_order", models.IntegerField(default=0)),
                ("use_count", models.PositiveIntegerField(default=0)),
                ("view_count", models.PositiveIntegerField(default=0)),
            ],
            options={
                "verbose_name": "CV Template",
                "verbose_name_plural": "CV Templates",
                "db_table": "project_info_cv_template",
                "ordering": ["sort_order", "-use_count", "-create_at"],
            },
        ),
        migrations.CreateModel(
            name="CVSuggestion",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("create_at", models.DateTimeField(auto_now_add=True)),
                ("update_at", models.DateTimeField(auto_now=True)),
                ("industry", models.CharField(db_index=True, max_length=100)),
                ("industry_name", models.CharField(max_length=150)),
                ("suggestion_type", models.CharField(db_index=True, default="summary", max_length=50)),
                ("title", models.CharField(max_length=200)),
                ("content", models.TextField()),
                ("skills_list", models.JSONField(blank=True, default=list)),
                ("sort_order", models.IntegerField(default=0)),
                ("is_active", models.BooleanField(db_index=True, default=True)),
            ],
            options={
                "verbose_name": "CV Suggestion",
                "verbose_name_plural": "CV Suggestions",
                "db_table": "project_info_cv_suggestion",
                "ordering": ["sort_order", "industry", "-create_at"],
            },
        ),
        migrations.CreateModel(
            name="CandidateCV",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("create_at", models.DateTimeField(auto_now_add=True)),
                ("update_at", models.DateTimeField(auto_now=True)),
                ("template_code", models.CharField(default="modern-navy", max_length=50)),
                ("title", models.CharField(default="CV Chưa Đặt Tên", max_length=200)),
                (
                    "slug",
                    autoslug.fields.AutoSlugField(
                        editable=False,
                        max_length=255,
                        populate_from="title",
                        unique=True,
                        unique_with=["id"],
                    ),
                ),
                ("theme_config", models.JSONField(blank=True, default=dict)),
                ("cv_data", models.JSONField(blank=True, default=dict)),
                ("thumbnail_url", models.URLField(blank=True, max_length=500, null=True)),
                ("pdf_url", models.URLField(blank=True, max_length=500, null=True)),
                ("is_main_cv", models.BooleanField(db_index=True, default=False)),
                ("is_public", models.BooleanField(db_index=True, default=True)),
                ("views_count", models.PositiveIntegerField(default=0)),
                ("download_count", models.PositiveIntegerField(default=0)),
                (
                    "pdf_file",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="candidate_cv_files",
                        to="files.file",
                    ),
                ),
                (
                    "template",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="candidate_cvs",
                        to="cv_builder.cvtemplate",
                    ),
                ),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="candidate_cvs",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "verbose_name": "Candidate CV",
                "verbose_name_plural": "Candidate CVs",
                "db_table": "project_info_candidate_cv",
                "ordering": ["-is_main_cv", "-update_at"],
            },
        ),
        migrations.AddIndex(
            model_name="candidatecv",
            index=models.Index(fields=["user", "-update_at"], name="idx_cand_cv_user_upd"),
        ),
        migrations.AddIndex(
            model_name="candidatecv",
            index=models.Index(fields=["slug"], name="idx_cand_cv_slug"),
        ),
        migrations.AddIndex(
            model_name="candidatecv",
            index=models.Index(fields=["is_public", "slug"], name="idx_cand_cv_pub_slug"),
        ),
    ]
