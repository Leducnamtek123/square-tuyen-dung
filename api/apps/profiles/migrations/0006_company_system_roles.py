from django.db import migrations


SYSTEM_ROLES = (
    ("owner", "Owner", ["*"]),
    (
        "hr",
        "HR",
        [
            "manage_candidates",
            "manage_interviews",
            "manage_question_bank",
            "manage_members",
        ],
    ),
)


def _unique_role_name(role):
    suffix = f" ({role.id})"
    base = role.name or role.code or "Role"
    return f"{base[:100 - len(suffix)]}{suffix}"


def ensure_company_system_roles(apps, schema_editor):
    Company = apps.get_model("info", "Company")
    CompanyRole = apps.get_model("info", "CompanyRole")

    for company in Company.objects.iterator():
        for code, name, permissions in SYSTEM_ROLES:
            role = CompanyRole.objects.filter(company_id=company.id, code=code).first()
            if not role:
                role = CompanyRole.objects.filter(company_id=company.id, name=name).first()

            if role:
                name_conflict = CompanyRole.objects.filter(
                    company_id=company.id,
                    name=name,
                ).exclude(id=role.id).first()
                if name_conflict:
                    name_conflict.name = _unique_role_name(name_conflict)
                    name_conflict.save(update_fields=["name"])

                role.code = code
                role.name = name
                role.permissions = permissions
                role.is_system = True
                role.is_active = True
                role.save(update_fields=["code", "name", "permissions", "is_system", "is_active"])
            else:
                CompanyRole.objects.create(
                    company_id=company.id,
                    code=code,
                    name=name,
                    permissions=permissions,
                    is_system=True,
                    is_active=True,
                )


class Migration(migrations.Migration):

    dependencies = [
        ("info", "0005_resume_interaction_uniques"),
    ]

    operations = [
        migrations.RunPython(ensure_company_system_roles, migrations.RunPython.noop),
    ]
