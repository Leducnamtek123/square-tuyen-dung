import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from apps.agent_assistants.services import _is_notebooklm_intent, AgentAssistantService
from apps.agent_assistants.models import AgentThread
from django.contrib.auth import get_user_model

User = get_user_model()

query = "Hãy trích xuất tiêu chuẩn tuyển dụng và 5 nhiệm vụ quan trọng nhất của vị trí Quản lý Dự án (PM) theo bộ chuẩn công ty"
print("Intent detected:", _is_notebooklm_intent(query))

user = User.objects.first()
if user:
    thread = AgentThread.objects.create(portal="employer", company_id=getattr(user, "company_id", 1), created_by=user)
    print("Testing _query_notebook_knowledge direct execution...")
    res = AgentAssistantService._query_notebook_knowledge(query)
    print("Direct NotebookLM Output Keys:", list(res.keys()))
    if res.get("text"):
        print("\n--- NOTEBOOKLM ANSWER PREVIEW ---")
        print(res["text"][:600])
        print("---------------------------------")
