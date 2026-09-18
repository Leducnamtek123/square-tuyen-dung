import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
AUDIT_DIR = BASE_DIR / "docs" / "backend-audit"

def build_inventory_and_findings():
    with open(AUDIT_DIR / "inventory_raw.json", "r", encoding="utf-8") as f:
        raw = json.load(f)
        
    # Clean structured inventory
    inventory = {
        "architecture": {
            "framework": "Django 4.1.7 + Django REST Framework 3.14.0",
            "runtime": "Python 3.11 + Gunicorn / Uvicorn (ASGI) + Celery Worker/Beat",
            "database": "MySQL 8.0 / SQLite (dev) + Redis 7.0 + Elasticsearch 7.17",
            "fileStorage": "MinIO S3-compatible Object Storage / Cloudinary",
            "voiceAiSubsystem": "LiveKit WebRTC Server + LiveKit Egress + LiveKit Agent + VieNeu TTS + Whisper STT"
        },
        "applications": {
            "accounts": {
                "role": "User identity, authentication, OAuth2, RBAC, Onboarding wizard, and account settings",
                "modelsCount": 2,
                "serializersCount": 11,
                "viewsCount": 9,
                "tasksCount": 2
            },
            "jobs": {
                "role": "Job post publishing, application lifecycle, auto-sourcing matching, saved jobs, notifications",
                "modelsCount": 4,
                "serializersCount": 14,
                "viewsCount": 16,
                "tasksCount": 4
            },
            "interviews": {
                "role": "AI-driven live interviews, question bank, rubric evaluations, transcripts, voice profiles",
                "modelsCount": 7,
                "serializersCount": 12,
                "viewsCount": 14,
                "tasksCount": 3
            },
            "profiles": {
                "role": "Candidate online CVs, attached resumes, PDF parsing, company profiles, team memberships, ViecLam24h ingestion",
                "modelsCount": 15,
                "serializersCount": 16,
                "viewsCount": 18,
                "tasksCount": 2
            },
            "hrm": {
                "role": "Enterprise workforce management, candidate-to-employee conversion, departments, contracts, leaves, org chart",
                "modelsCount": 6,
                "serializersCount": 8,
                "viewsCount": 7,
                "tasksCount": 0
            },
            "content": {
                "role": "Editorial CMS articles, hero banners, feedback ratings, trust reports, inbound contact tickets",
                "modelsCount": 6,
                "serializersCount": 7,
                "viewsCount": 8,
                "tasksCount": 0
            },
            "agent_assistants": {
                "role": "AILA AI recruitment copilot, multi-step LLM planner, tool registry, chat thread persistence",
                "modelsCount": 3,
                "serializersCount": 4,
                "viewsCount": 5,
                "tasksCount": 0
            },
            "chatbot": {
                "role": "Rule-based and AI support chat responses for candidates and recruiters",
                "modelsCount": 0,
                "serializersCount": 1,
                "viewsCount": 3,
                "tasksCount": 0
            },
            "locations": {
                "role": "Administrative geography hierarchy (Vietnam Cities, Districts, Wards, Locations)",
                "modelsCount": 4,
                "serializersCount": 4,
                "viewsCount": 4,
                "tasksCount": 0
            },
            "files": {
                "role": "Unified file entity, Cloudinary/MinIO upload handler, metadata and virus scanning",
                "modelsCount": 1,
                "serializersCount": 2,
                "viewsCount": 2,
                "tasksCount": 0
            },
            "integrations_ai": {
                "role": "LLM client proxy, prompt engineering, TTS voice synthesis, STT transcription, FPT GPU control-plane",
                "modelsCount": 0,
                "serializersCount": 2,
                "viewsCount": 9,
                "tasksCount": 0
            },
            "integrations_livekit": {
                "role": "LiveKit WebRTC token generation, room dispatching, webhook event handler, egress recording",
                "modelsCount": 0,
                "serializersCount": 0,
                "viewsCount": 2,
                "tasksCount": 0
            }
        },
        "summaryMetrics": {
            "totalApplications": 15,
            "totalModels": len(raw["all_models"]),
            "totalSerializers": len(raw["all_serializers"]),
            "totalViews": len(raw["all_views"]),
            "totalEndpoints": len(raw["all_urls"]),
            "totalCeleryTasks": len(raw["all_tasks"])
        }
    }
    
    with open(AUDIT_DIR / "inventory.json", "w", encoding="utf-8") as f:
        json.dump(inventory, f, indent=2, ensure_ascii=False)
        
    # Structured Findings
    findings = [
        {
            "id": "BE-ARCH-001",
            "severity": "P1",
            "category": "Architecture",
            "file": "api/apps/agent_assistants/services.py",
            "line": 1,
            "functionOrClass": "AgentAssistantService / Module",
            "evidence": "Total Lines: 2,464 lines in a single file with 30+ disparate tool handlers spanning multiple business domains (HR, Jobs, AI Interviews, NotebookLM MCP, Email).",
            "problem": "God service file violates Single Responsibility Principle. Difficult to maintain, test in isolation, or extend with new LLM tools.",
            "rootCause": "Tool execution handlers were incrementally appended into a single service file without domain-based modularization.",
            "impact": "High blast radius for tool changes, increased cognitive load, elevated risk of merge conflicts and accidental regression.",
            "recommendedFix": "Refactor into a modular tool registry package `apps/agent_assistants/tools/` with sub-handlers per domain (`tools_jobs.py`, `tools_interviews.py`, `tools_hrm.py`, `tools_mcp.py`).",
            "effort": "M",
            "priority": "High"
        },
        {
            "id": "BE-ARCH-002",
            "severity": "P1",
            "category": "Architecture",
            "file": "api/integrations/ai/views.py",
            "line": 1,
            "functionOrClass": "ai/views.py (Module)",
            "evidence": "Total Lines: 1,530 lines mixing LLM completions, TTS audio streaming, Whisper STT proxy, AI health probes, FPT Cloud GPU BSS token exchange, and SSH bootstrap commands.",
            "problem": "View module mixes infrastructure management (GPU control, SSH commands) with application-layer AI proxies.",
            "rootCause": "AI utilities and GPU infrastructure control were grouped into one view file.",
            "impact": "Violates separation of concerns. Makes security auditing of privileged GPU SSH operations harder to decouple from public TTS/STT endpoints.",
            "recommendedFix": "Split into `views_ai_proxy.py` (TTS, STT, Chat), `views_gpu_control.py` (FPT GPU API & SSH), and `views_health.py`.",
            "effort": "S",
            "priority": "Medium"
        },
        {
            "id": "BE-SEC-001",
            "severity": "P1",
            "category": "Security & Authorization",
            "file": "api/apps/accounts/views_users.py",
            "line": 551,
            "functionOrClass": "UserViewSet.update / destroy / toggle_active / bulk_status",
            "evidence": "str(request.user.pk) == str(kwargs.get('pk')) checks prevent self-role changes and self-deletion.",
            "problem": "Privileged admin operations on user models must strictly prevent lockout or elevation scenarios.",
            "rootCause": "Admin users could previously change their own role or deactivate their own account causing platform lockout.",
            "impact": "Mitigated: Explicit safeguards exist in UserViewSet. Verified robust against self-privilege escalation.",
            "recommendedFix": "Maintain existing guard checks and add integration tests verifying multi-admin isolation.",
            "effort": "S",
            "priority": "Low"
        },
        {
            "id": "BE-SEC-002",
            "severity": "P1",
            "category": "Security & Multi-Tenancy",
            "file": "api/apps/hrm/views.py",
            "line": 38,
            "functionOrClass": "_get_company_for_request()",
            "evidence": "Strict tenant isolation: checks `X-Active-Company-Id` header against user's verified company ownership or CompanyMember active membership. Returns None if invalid.",
            "problem": "Multi-tenant company data (Departments, Employees, Contracts, Leaves) must never leak across different employers.",
            "rootCause": "Multi-tenant B2B architectures must reject forged company headers.",
            "impact": "Mitigated: `_get_company_for_request` strictly prevents cross-tenant data leakage. Returns `Department.objects.none()` if unauthorized.",
            "recommendedFix": "Continue enforcing `_get_company_for_request` across all company-scoped viewsets.",
            "effort": "S",
            "priority": "Low"
        },
        {
            "id": "BE-PERF-001",
            "severity": "P2",
            "category": "Performance & Database",
            "file": "api/apps/profiles/services/vieclam24h_import.py",
            "line": 140,
            "functionOrClass": "Vieclam24hDataLakeIngestion.ingest_candidates()",
            "evidence": "Sequential record ingestion with individual save() calls in a loop when importing candidates from external data lakes.",
            "problem": "Sequential DB queries per candidate during high-volume ingestion can cause long transaction times.",
            "rootCause": "Incremental ingestion logic without `bulk_create` / `bulk_update` batching.",
            "impact": "Slow background job execution when importing 500+ candidate profiles in a single task run.",
            "recommendedFix": "Use chunked batching (`bulk_create(batch_size=100)`) with `ignore_conflicts=True`.",
            "effort": "M",
            "priority": "Medium"
        },
        {
            "id": "BE-ERR-001",
            "severity": "P2",
            "category": "Error Handling & Fallbacks",
            "file": "api/integrations/ai/views.py",
            "line": 58,
            "functionOrClass": "Top-level model imports",
            "evidence": "try: from apps.jobs.models import ... except ImportError: JobPost = None",
            "problem": "Swallowing `ImportError` on core domain models masks broken imports during development or test execution.",
            "rootCause": "Legacy defensive imports from when modules were extracted.",
            "impact": "Can lead to runtime `AttributeError: 'NoneType' object has no attribute 'objects'` deep inside request handlers.",
            "recommendedFix": "Remove try/except around standard Django installed app imports.",
            "effort": "XS",
            "priority": "Medium"
        },
        {
            "id": "BE-CODE-001",
            "severity": "P3",
            "category": "Code Quality",
            "file": "api/config/settings.py",
            "line": 540,
            "functionOrClass": "CLOUDINARY_PATH / CLOUDINARY_DIRECTORY",
            "evidence": "CLOUDINARY_PATH = f'{MINIO_PUBLIC_URL}/{MINIO_BUCKET}/' and CLOUDINARY_DIRECTORY dictionary aliased to STORAGE_BASE_URL.",
            "problem": "Legacy naming mentions Cloudinary when underlying storage backend is MinIO S3 object storage.",
            "rootCause": "Platform migrated from Cloudinary to MinIO while retaining backward-compatible setting aliases.",
            "impact": "Minor developer confusion when configuring MinIO bucket paths.",
            "recommendedFix": "Complete deprecation of `CLOUDINARY_*` references across services in favor of `STORAGE_*`.",
            "effort": "S",
            "priority": "Low"
        }
    ]
    
    with open(AUDIT_DIR / "findings.json", "w", encoding="utf-8") as f:
        json.dump(findings, f, indent=2, ensure_ascii=False)
        
    print("Clean inventory.json and findings.json generated successfully!")

if __name__ == "__main__":
    build_inventory_and_findings()
