from django.db import migrations, models
import django.db.models.deletion
from django.utils import timezone


def seed_default_company_roles_and_members(apps, schema_editor):
    Company = apps.get_model("info", "Company")
    CompanyRole = apps.get_model("info", "CompanyRole")
    CompanyMember = apps.get_model("info", "CompanyMember")

    for company in Company.objects.all().iterator():
        owner_role, _ = CompanyRole.objects.get_or_create(
            company_id=company.id,
            code="owner",
            defaults={
                "name": "Owner",
                "description": "Company owner with full permissions.",
                "permissions": ["*"],
                "is_system": True,
                "is_active": True,
            },
        )
        CompanyRole.objects.get_or_create(
            company_id=company.id,
            code="hr",
            defaults={
                "name": "HR",
                "description": "HR role for candidate and interview workflows.",
                "permissions": [
                    "manage_candidates",
                    "manage_interviews",
                    "manage_question_bank",
                    "manage_members",
                ],
                "is_system": True,
                "is_active": True,
            },
        )

        CompanyMember.objects.get_or_create(
            company_id=company.id,
            user_id=company.user_id,
            defaults={
                "role_id": owner_role.id,
                "status": "ACTIVE",
                "joined_at": timezone.now(),
                "is_active": True,
            },
        )


class Migration(migrations.Migration):

    dependencies = [
        ("authentication", "0006_alter_forgotpasswordtoken_platform_and_more"),
        ("info", "0010_alter_company_employee_size_and_more"),
    ]

    operations = [
        migrations.CreateModel(
            name="CompanyRole",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("create_at", models.DateTimeField(auto_now_add=True)),
                ("update_at", models.DateTimeField(auto_now=True)),
                ("code", models.SlugField(max_length=50)),
                ("name", models.CharField(max_length=100)),
                ("description", models.CharField(blank=True, max_length=255, null=True)),
                ("permissions", models.JSONField(blank=True, default=list)),
                ("is_system", models.BooleanField(default=False)),
                ("is_active", models.BooleanField(default=True)),
                ("company", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="roles", to="info.company")),
            ],
            options={
                "db_table": "project_info_company_role",
            },
        ),
        migrations.CreateModel(
            name="CompanyMember",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("create_at", models.DateTimeField(auto_now_add=True)),
                ("update_at", models.DateTimeField(auto_now=True)),
                ("status", models.CharField(choices=[("INVITED", "Invited"), ("ACTIVE", "Active"), ("DISABLED", "Disabled")], default="ACTIVE", max_length=10)),
                ("joined_at", models.DateTimeField(blank=True, null=True)),
                ("invited_email", models.EmailField(blank=True, max_length=100, null=True)),
                ("is_active", models.BooleanField(default=True)),
                ("company", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="members", to="info.company")),
                ("invited_by", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="company_invitations_sent", to="authentication.user")),
                ("role", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="members", to="info.companyrole")),
                ("user", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="company_memberships", to="authentication.user")),
            ],
            options={
                "db_table": "project_info_company_member",
            },
        ),
        migrations.AddConstraint(
            model_name="companyrole",
            constraint=models.UniqueConstraint(fields=("company", "code"), name="uq_company_role_code"),
        ),
        migrations.AddConstraint(
            model_name="companyrole",
            constraint=models.UniqueConstraint(fields=("company", "name"), name="uq_company_role_name"),
        ),
        migrations.AddConstraint(
            model_name="companymember",
            constraint=models.UniqueConstraint(fields=("company", "user"), name="uq_company_member_company_user"),
        ),
        migrations.RunPython(seed_default_company_roles_and_members, migrations.RunPython.noop),
    ]


