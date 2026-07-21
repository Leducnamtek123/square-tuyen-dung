from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("info", "0003_company_is_verified_trust_report"),
    ]

    operations = [
        migrations.CreateModel(
            name="CompanyVerification",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("create_at", models.DateTimeField(auto_now_add=True)),
                ("update_at", models.DateTimeField(auto_now=True)),
                ("status", models.CharField(choices=[("pending", "Pending"), ("reviewing", "Reviewing"), ("approved", "Approved"), ("rejected", "Rejected")], db_index=True, default="pending", max_length=20)),
                ("legal_company_name", models.CharField(blank=True, default="", max_length=255)),
                ("tax_code", models.CharField(blank=True, default="", max_length=30)),
                ("business_license", models.CharField(blank=True, default="", max_length=255)),
                ("representative_name", models.CharField(blank=True, default="", max_length=100)),
                ("contact_phone", models.CharField(blank=True, default="", max_length=30)),
                ("contact_email", models.EmailField(blank=True, default="", max_length=100)),
                ("website", models.URLField(blank=True, default="", max_length=300)),
                ("verification_scheduled_at", models.DateTimeField(blank=True, null=True)),
                ("verification_contact_name", models.CharField(blank=True, default="", max_length=100)),
                ("verification_contact_phone", models.CharField(blank=True, default="", max_length=30)),
                ("verification_notes", models.TextField(blank=True, default="")),
                ("admin_note", models.TextField(blank=True, default="")),
                ("reviewed_at", models.DateTimeField(blank=True, null=True)),
                ("company", models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name="verification_request", to="info.company")),
                ("reviewed_by", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="company_verification_reviews", to=settings.AUTH_USER_MODEL)),
                ("submitted_by", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="company_verification_submissions", to=settings.AUTH_USER_MODEL)),
            ],
            options={
                "db_table": "project_info_company_verification",
            },
        ),
        migrations.AddIndex(
            model_name="companyverification",
            index=models.Index(fields=["status", "-create_at"], name="idx_company_verif_status"),
        ),
    ]
