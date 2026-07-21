from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import autoslug.fields
import django.utils.text


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("common", "0001_initial"),
        ("files", "0001_initial"),
        ("locations", "0001_initial"),
        ("info", "0006_company_system_roles"),
    ]

    operations = [
        migrations.CreateModel(
            name="EmployerCandidateProfile",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("create_at", models.DateTimeField(auto_now_add=True)),
                ("update_at", models.DateTimeField(auto_now=True)),
                ("full_name", models.CharField(max_length=150)),
                ("email", models.EmailField(blank=True, max_length=254, null=True)),
                ("phone", models.CharField(blank=True, max_length=20, null=True)),
                ("title", models.CharField(max_length=200)),
                (
                    "slug",
                    autoslug.fields.AutoSlugField(
                        editable=False,
                        populate_from="title",
                        slugify=django.utils.text.slugify,
                        unique=True,
                        unique_with=["id"],
                    ),
                ),
                ("description", models.TextField(blank=True, null=True)),
                ("salary_min", models.DecimalField(decimal_places=0, default=0, max_digits=12)),
                ("salary_max", models.DecimalField(decimal_places=0, default=0, max_digits=12)),
                ("expected_salary", models.DecimalField(blank=True, decimal_places=0, max_digits=12, null=True)),
                ("skills_summary", models.TextField(blank=True, null=True)),
                ("note", models.TextField(blank=True, null=True)),
                ("position", models.SmallIntegerField(blank=True, choices=[(1, "Senior Management"), (2, "Middle Management"), (3, "Team Leader - Supervisor"), (4, "Specialist"), (5, "Staff / Employee"), (6, "Collaborator")], null=True)),
                ("experience", models.SmallIntegerField(blank=True, choices=[(1, "No experience"), (2, "Under 1 year"), (3, "1 year"), (4, "2 years"), (5, "3 years"), (6, "4 years"), (7, "5 years"), (8, "Over 5 years")], null=True)),
                ("academic_level", models.SmallIntegerField(blank=True, choices=[(1, "Postgraduate"), (2, "University"), (3, "College"), (4, "Vocational / Intermediate"), (5, "High School"), (6, "Certificate")], null=True)),
                ("type_of_workplace", models.SmallIntegerField(blank=True, choices=[(1, "Office-based"), (2, "Hybrid"), (3, "Remote / Work from home")], null=True)),
                ("job_type", models.SmallIntegerField(blank=True, choices=[(1, "Full-time Permanent"), (2, "Full-time Temporary"), (3, "Part-time Permanent"), (4, "Part-time Temporary"), (5, "Consultancy Contract"), (6, "Internship"), (7, "Other")], null=True)),
                ("career", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="manual_candidate_profiles", to="common.career")),
                ("city", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="manual_candidate_profiles", to="locations.city")),
                ("company", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="manual_candidate_profiles", to="info.company")),
                ("created_by", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="created_manual_candidate_profiles", to=settings.AUTH_USER_MODEL)),
                ("file", models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="manual_candidate_profile_file", to="files.file")),
            ],
            options={
                "db_table": "project_info_employer_candidate_profile",
            },
        ),
        migrations.AddIndex(
            model_name="employercandidateprofile",
            index=models.Index(fields=["company", "-create_at"], name="idx_emp_cand_company_created"),
        ),
        migrations.AddIndex(
            model_name="employercandidateprofile",
            index=models.Index(fields=["company", "full_name"], name="idx_emp_cand_company_name"),
        ),
    ]
