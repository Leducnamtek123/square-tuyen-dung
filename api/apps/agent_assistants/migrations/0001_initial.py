# Generated manually for internal agent assistants.

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("info", "0007_employer_candidate_profile"),
    ]

    operations = [
        migrations.CreateModel(
            name="AgentThread",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("create_at", models.DateTimeField(auto_now_add=True)),
                ("update_at", models.DateTimeField(auto_now=True)),
                ("portal", models.CharField(choices=[("employer", "Employer"), ("admin", "Admin")], db_index=True, max_length=20)),
                ("title", models.CharField(blank=True, default="New agent chat", max_length=180)),
                ("status", models.CharField(choices=[("active", "Active"), ("archived", "Archived")], db_index=True, default="active", max_length=20)),
                ("last_message_at", models.DateTimeField(db_index=True, null=True, blank=True)),
                ("metadata", models.JSONField(blank=True, default=dict)),
                ("company", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name="agent_assistant_threads", to="info.company")),
                ("owner", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="agent_assistant_threads", to=settings.AUTH_USER_MODEL)),
            ],
            options={
                "db_table": "project_agent_assistant_thread",
                "ordering": ["-last_message_at", "-create_at"],
            },
        ),
        migrations.CreateModel(
            name="AgentMessage",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("create_at", models.DateTimeField(auto_now_add=True)),
                ("update_at", models.DateTimeField(auto_now=True)),
                ("role", models.CharField(choices=[("user", "User"), ("assistant", "Assistant"), ("system", "System")], db_index=True, max_length=20)),
                ("content", models.TextField(blank=True, default="")),
                ("parts", models.JSONField(blank=True, default=list)),
                ("metadata", models.JSONField(blank=True, default=dict)),
                ("thread", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="messages", to="agent_assistants.agentthread")),
            ],
            options={
                "db_table": "project_agent_assistant_message",
                "ordering": ["create_at", "id"],
            },
        ),
        migrations.CreateModel(
            name="AgentToolCall",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("create_at", models.DateTimeField(auto_now_add=True)),
                ("update_at", models.DateTimeField(auto_now=True)),
                ("tool_name", models.CharField(db_index=True, max_length=120)),
                ("display_name", models.CharField(blank=True, default="", max_length=180)),
                ("status", models.CharField(choices=[("pending", "Pending"), ("running", "Running"), ("succeeded", "Succeeded"), ("failed", "Failed")], db_index=True, default="pending", max_length=20)),
                ("input_payload", models.JSONField(blank=True, default=dict)),
                ("output_payload", models.JSONField(blank=True, default=dict)),
                ("error_message", models.TextField(blank=True, default="")),
                ("requires_confirmation", models.BooleanField(default=False)),
                ("metadata", models.JSONField(blank=True, default=dict)),
                ("message", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name="tool_calls", to="agent_assistants.agentmessage")),
                ("thread", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="tool_calls", to="agent_assistants.agentthread")),
            ],
            options={
                "db_table": "project_agent_assistant_tool_call",
                "ordering": ["create_at", "id"],
            },
        ),
        migrations.AddIndex(
            model_name="agentthread",
            index=models.Index(fields=["owner", "portal", "-last_message_at"], name="idx_agent_thread_owner"),
        ),
        migrations.AddIndex(
            model_name="agentthread",
            index=models.Index(fields=["company", "portal", "-last_message_at"], name="idx_agent_thread_company"),
        ),
        migrations.AddIndex(
            model_name="agentmessage",
            index=models.Index(fields=["thread", "create_at"], name="idx_agent_msg_thread"),
        ),
        migrations.AddIndex(
            model_name="agenttoolcall",
            index=models.Index(fields=["thread", "status"], name="idx_agent_tool_thread"),
        ),
        migrations.AddIndex(
            model_name="agenttoolcall",
            index=models.Index(fields=["tool_name", "status"], name="idx_agent_tool_name"),
        ),
    ]

