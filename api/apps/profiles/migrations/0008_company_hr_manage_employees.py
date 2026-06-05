from django.db import migrations


def add_manage_employees_permission(apps, schema_editor):
    CompanyRole = apps.get_model("info", "CompanyRole")
    for role in CompanyRole.objects.filter(code="hr").iterator():
        permissions = list(role.permissions or [])
        if "manage_employees" not in permissions:
            permissions.append("manage_employees")
            role.permissions = permissions
            role.save(update_fields=["permissions"])


def remove_manage_employees_permission(apps, schema_editor):
    CompanyRole = apps.get_model("info", "CompanyRole")
    for role in CompanyRole.objects.filter(code="hr").iterator():
        permissions = [permission for permission in (role.permissions or []) if permission != "manage_employees"]
        role.permissions = permissions
        role.save(update_fields=["permissions"])


class Migration(migrations.Migration):

    dependencies = [
        ("info", "0007_employer_candidate_profile"),
    ]

    operations = [
        migrations.RunPython(add_manage_employees_permission, remove_manage_employees_permission),
    ]
