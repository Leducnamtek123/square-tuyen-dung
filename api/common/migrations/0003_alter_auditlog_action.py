# Generated manually to align AuditLog action choices with the model.

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("common", "0002_auditlog"),
    ]

    operations = [
        migrations.AlterField(
            model_name="auditlog",
            name="action",
            field=models.CharField(
                choices=[
                    ("create", "Create"),
                    ("update", "Update"),
                    ("delete", "Delete"),
                    ("approve", "Approve"),
                    ("reject", "Reject"),
                    ("status_change", "Status change"),
                    ("bulk_status", "Bulk status"),
                    ("agent_access", "Agent access"),
                    ("export", "Export"),
                ],
                db_index=True,
                max_length=40,
            ),
        ),
    ]
