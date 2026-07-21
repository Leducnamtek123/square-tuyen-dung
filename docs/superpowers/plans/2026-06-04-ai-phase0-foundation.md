# AI Phase 0 Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Phase 0 safety foundation for AI recruitment automation: permission-correct tool registry, non-mutating dry-run drafts, confirmation-based commit, and auditability.

**Architecture:** Keep `integrations.ai` as the API/integration package and store durable AI workflow records in the installed `common` Django app. Move inline tool definitions from `api/integrations/ai/views.py` into a focused tool registry/service layer; `ChatAPIView` asks the registry for tools allowed for the request and executes dry-runs only. Mutating operations create `AIActionDraft` rows and require a separate confirmation endpoint before committing.

**Tech Stack:** Django REST Framework, Django models/migrations, pytest, OpenAI-compatible chat completions, existing `apps.interviews`, `apps.jobs`, `apps.profiles`, and `common.AuditLog`.

---

## File Structure

- Create `api/integrations/ai/tool_registry.py`: tool definitions, permission checks, OpenAI tool schema export, tool execution dispatch.
- Create `api/integrations/ai/action_drafts.py`: draft creation, confirmation, commit handlers, audit helper.
- Modify `api/integrations/ai/views.py`: remove inline tool constants/checks/executor, use registry, add confirmation API view.
- Modify `api/config/urls.py`: add `POST /api/v1/ai/actions/<int:draft_id>/confirm/`.
- Modify `api/common/models.py`: add `AIActionDraft`.
- Add `api/common/migrations/0004_ai_action_draft.py`: migration for the durable draft model.
- Modify `api/integrations/ai/tests.py`: tests for tool availability, dry-run behavior, confirmation commit, permission failures, and audit/draft persistence.

## Task 1: Tests for Existing Permission Bug and Tool Exposure

**Files:**
- Modify: `api/integrations/ai/tests.py`

- [ ] **Step 1: Write failing tests for uppercase role support**

Add tests that prove an authenticated `EMPLOYER` receives `search_candidates` and `create_interview_invitation` tools, while a `JOB_SEEKER` receives neither restricted tool.

```python
@pytest.mark.django_db
def test_ai_chat_exposes_employer_tools_for_uppercase_role(employer_user, monkeypatch):
    captured_payloads = []

    def fake_post_chat_completion_requests(payload, default_model=None, timeout=None):
        captured_payloads.append(payload)
        return {
            "choices": [{"message": {"content": "ok"}}],
            "usage": {},
        }, Mock(model=payload.get("model"), name="test")

    monkeypatch.setattr(
        "integrations.ai.views.post_chat_completion_requests",
        fake_post_chat_completion_requests,
    )

    client = APIClient()
    client.force_authenticate(user=employer_user)
    response = client.post("/api/v1/ai/chat/", {"message": "Tìm ứng viên React"}, format="json")

    assert response.status_code == 200
    tool_names = {
        tool["function"]["name"]
        for tool in captured_payloads[0]["tools"]
    }
    assert "search_candidates" in tool_names
    assert "create_interview_invitation" in tool_names


@pytest.mark.django_db
def test_ai_chat_hides_employer_tools_from_job_seeker(job_seeker_user, monkeypatch):
    captured_payloads = []

    def fake_post_chat_completion_requests(payload, default_model=None, timeout=None):
        captured_payloads.append(payload)
        return {
            "choices": [{"message": {"content": "ok"}}],
            "usage": {},
        }, Mock(model=payload.get("model"), name="test")

    monkeypatch.setattr(
        "integrations.ai.views.post_chat_completion_requests",
        fake_post_chat_completion_requests,
    )

    client = APIClient()
    client.force_authenticate(user=job_seeker_user)
    response = client.post("/api/v1/ai/chat/", {"message": "Tìm ứng viên React"}, format="json")

    assert response.status_code == 200
    assert "tools" not in captured_payloads[0]
```

- [ ] **Step 2: Run tests to verify failure**

Run:

```bash
cd api
pytest integrations/ai/tests.py::test_ai_chat_exposes_employer_tools_for_uppercase_role integrations/ai/tests.py::test_ai_chat_hides_employer_tools_from_job_seeker -q
```

Expected: first test fails because the current permission checks compare against lowercase role strings.

## Task 2: Tool Registry Refactor

**Files:**
- Create: `api/integrations/ai/tool_registry.py`
- Modify: `api/integrations/ai/views.py`
- Test: `api/integrations/ai/tests.py`

- [ ] **Step 1: Create registry module**

Create `api/integrations/ai/tool_registry.py` with:

```python
import json
from dataclasses import dataclass
from typing import Any, Callable

from django.db.models import Q

from apps.accounts.permissions import user_has_company_permission
from shared.configs import variable_system as var_sys


ToolHandler = Callable[[dict[str, Any], Any], str]


@dataclass(frozen=True)
class AITool:
    name: str
    description: str
    parameters: dict[str, Any]
    required_roles: tuple[str, ...]
    required_company_permission: str | None
    handler: ToolHandler

    def as_openai_tool(self) -> dict[str, Any]:
        return {
            "type": "function",
            "function": {
                "name": self.name,
                "description": self.description,
                "parameters": self.parameters,
            },
        }

    def is_allowed(self, request) -> bool:
        user = getattr(request, "user", None)
        if not user or not getattr(user, "is_authenticated", False):
            return False
        if getattr(user, "role_name", None) not in self.required_roles:
            return False
        if self.required_company_permission:
            return user_has_company_permission(user, self.required_company_permission)
        return True
```

- [ ] **Step 2: Add search candidate handler**

Add:

```python
def search_candidates_handler(args: dict[str, Any], request) -> str:
    from apps.profiles.models import Resume

    query = (args.get("query") or "").strip()
    if not query:
        return "Lỗi: Vui lòng cung cấp từ khóa tìm kiếm ứng viên."

    try:
        limit = int(args.get("limit") or 5)
    except (TypeError, ValueError):
        limit = 5
    limit = max(1, min(limit, 10))

    resumes = (
        Resume.objects.filter(
            Q(title__icontains=query)
            | Q(skills_summary__icontains=query)
            | Q(description__icontains=query)
        )
        .select_related("user")
        .distinct()[:limit]
    )

    results = [
        {
            "id": resume.user_id,
            "name": resume.user.full_name if resume.user_id else "",
            "title": resume.title,
            "experience": resume.get_experience_display()
            if hasattr(resume, "get_experience_display")
            else resume.experience,
            "skills": (resume.skills_summary[:200] + "...")
            if resume.skills_summary and len(resume.skills_summary) > 200
            else resume.skills_summary,
        }
        for resume in resumes
    ]

    if not results:
        return f"Không tìm thấy ứng viên nào phù hợp với từ khóa '{query}'."
    return json.dumps(results, ensure_ascii=False)
```

- [ ] **Step 3: Add interview invitation dry-run handler placeholder backed by Task 4**

Add a handler that imports `create_interview_invitation_draft` from `action_drafts.py`. It will be implemented in Task 4.

```python
def create_interview_invitation_handler(args: dict[str, Any], request) -> str:
    from integrations.ai.action_drafts import create_interview_invitation_draft

    draft = create_interview_invitation_draft(args=args, request=request)
    return json.dumps(
        {
            "type": "ai_action_draft",
            "draftId": draft.id,
            "actionType": draft.action_type,
            "status": draft.status,
            "payload": draft.payload,
            "message": "Đã tạo bản nháp lời mời phỏng vấn. Vui lòng xác nhận trước khi hệ thống tạo lịch và gửi email.",
        },
        ensure_ascii=False,
    )
```

- [ ] **Step 4: Add registry functions**

Add:

```python
SEARCH_CANDIDATES_PARAMETERS = {
    "type": "object",
    "properties": {
        "query": {
            "type": "string",
            "description": "Từ khóa tìm kiếm, ví dụ 'React developer', 'Python', 'Kế toán'.",
        },
        "limit": {
            "type": "integer",
            "description": "Số lượng kết quả tối đa.",
            "default": 5,
        },
    },
    "required": ["query"],
}

CREATE_INTERVIEW_INVITATION_PARAMETERS = {
    "type": "object",
    "properties": {
        "candidate_id": {"type": "integer", "description": "ID của ứng viên."},
        "job_post_id": {"type": "integer", "description": "ID của tin tuyển dụng."},
        "scheduled_at": {
            "type": "string",
            "description": "Thời gian phỏng vấn định dạng ISO.",
        },
    },
    "required": ["candidate_id", "job_post_id"],
}

TOOLS = (
    AITool(
        name="search_candidates",
        description="Tìm kiếm ứng viên dựa trên kỹ năng, vị trí hoặc kinh nghiệm.",
        parameters=SEARCH_CANDIDATES_PARAMETERS,
        required_roles=(var_sys.EMPLOYER, var_sys.ADMIN),
        required_company_permission="manage_candidates",
        handler=search_candidates_handler,
    ),
    AITool(
        name="create_interview_invitation",
        description="Tạo bản nháp lời mời phỏng vấn. Không tạo lịch hoặc gửi email cho tới khi người dùng xác nhận.",
        parameters=CREATE_INTERVIEW_INVITATION_PARAMETERS,
        required_roles=(var_sys.EMPLOYER, var_sys.ADMIN),
        required_company_permission="manage_interviews",
        handler=create_interview_invitation_handler,
    ),
)


def get_allowed_tools(request) -> list[AITool]:
    return [tool for tool in TOOLS if tool.is_allowed(request)]


def get_openai_tools(request) -> list[dict[str, Any]]:
    return [tool.as_openai_tool() for tool in get_allowed_tools(request)]


def execute_tool_call(tool_call: dict[str, Any], request) -> str:
    name = tool_call.get("function", {}).get("name")
    try:
        args = json.loads(tool_call.get("function", {}).get("arguments") or "{}")
    except json.JSONDecodeError:
        return "Lỗi: Tham số công cụ AI không hợp lệ."

    for tool in TOOLS:
        if tool.name != name:
            continue
        if not tool.is_allowed(request):
            return "Lỗi: Bạn không có quyền sử dụng công cụ AI này."
        return tool.handler(args, request)

    return f"Công cụ {name} không được hỗ trợ."
```

- [ ] **Step 5: Refactor `views.py` to use registry**

Replace inline `RECRUITMENT_TOOLS`, `_can_search_candidates`, `_can_create_interview`, and `execute_tool_call` with imports:

```python
from integrations.ai.tool_registry import execute_tool_call, get_openai_tools
```

In `ChatAPIView.post`, replace the current tool filtering block with:

```python
available_tools = get_openai_tools(request)
```

Keep:

```python
if available_tools:
    base_payload["tools"] = available_tools
    base_payload["tool_choice"] = "auto"
```

- [ ] **Step 6: Run Task 1 tests**

Run:

```bash
cd api
pytest integrations/ai/tests.py::test_ai_chat_exposes_employer_tools_for_uppercase_role integrations/ai/tests.py::test_ai_chat_hides_employer_tools_from_job_seeker -q
```

Expected: both tests pass.

## Task 3: AI Action Draft Model

**Files:**
- Modify: `api/common/models.py`
- Create: `api/common/migrations/0004_ai_action_draft.py`
- Test: `api/integrations/ai/tests.py`

- [ ] **Step 1: Add model test**

Add:

```python
@pytest.mark.django_db
def test_ai_action_draft_persists_payload_and_company(employer_user, company):
    from common.models import AIActionDraft

    draft = AIActionDraft.objects.create(
        user=employer_user,
        company=company,
        portal=AIActionDraft.PORTAL_EMPLOYER,
        action_type=AIActionDraft.ACTION_CREATE_INTERVIEW_INVITATION,
        status=AIActionDraft.STATUS_DRAFT,
        input_summary="Mời ứng viên phỏng vấn",
        payload={"candidateId": 123, "jobPostId": 456},
    )

    assert draft.id
    assert draft.payload["candidateId"] == 123
    assert draft.company == company
    assert draft.status == AIActionDraft.STATUS_DRAFT
```

- [ ] **Step 2: Add model**

In `api/common/models.py`, add:

```python
class AIActionDraft(CommonBaseModel):
    PORTAL_EMPLOYER = "employer"
    PORTAL_JOB_SEEKER = "job_seeker"
    PORTAL_ADMIN = "admin"
    PORTAL_CHOICES = (
        (PORTAL_EMPLOYER, "Employer"),
        (PORTAL_JOB_SEEKER, "Job seeker"),
        (PORTAL_ADMIN, "Admin"),
    )

    ACTION_CREATE_INTERVIEW_INVITATION = "create_interview_invitation"
    ACTION_CHOICES = (
        (ACTION_CREATE_INTERVIEW_INVITATION, "Create interview invitation"),
    )

    STATUS_DRAFT = "draft"
    STATUS_CONFIRMED = "confirmed"
    STATUS_COMMITTED = "committed"
    STATUS_CANCELLED = "cancelled"
    STATUS_EXPIRED = "expired"
    STATUS_FAILED = "failed"
    STATUS_CHOICES = (
        (STATUS_DRAFT, "Draft"),
        (STATUS_CONFIRMED, "Confirmed"),
        (STATUS_COMMITTED, "Committed"),
        (STATUS_CANCELLED, "Cancelled"),
        (STATUS_EXPIRED, "Expired"),
        (STATUS_FAILED, "Failed"),
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="ai_action_drafts",
    )
    company = models.ForeignKey(
        "info.Company",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="ai_action_drafts",
    )
    portal = models.CharField(max_length=20, choices=PORTAL_CHOICES, db_index=True)
    action_type = models.CharField(max_length=80, choices=ACTION_CHOICES, db_index=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_DRAFT, db_index=True)
    input_summary = models.CharField(max_length=500, blank=True, default="")
    payload = models.JSONField(default=dict, blank=True)
    validation_errors = models.JSONField(default=dict, blank=True)
    commit_result = models.JSONField(default=dict, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True, db_index=True)
    confirmed_at = models.DateTimeField(null=True, blank=True)
    committed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "project_common_ai_action_draft"
        ordering = ["-create_at"]
        indexes = [
            models.Index(fields=["user", "status", "-create_at"], name="ai_draft_user_status_idx"),
            models.Index(fields=["company", "action_type"], name="ai_draft_company_action_idx"),
        ]
```

- [ ] **Step 3: Add migration**

Run:

```bash
cd api
python manage.py makemigrations common
```

Expected: creates `api/common/migrations/0004_ai_action_draft.py`.

- [ ] **Step 4: Run model test**

Run:

```bash
cd api
pytest integrations/ai/tests.py::test_ai_action_draft_persists_payload_and_company -q
```

Expected: pass.

## Task 4: Draft Creation and Confirmation Service

**Files:**
- Create: `api/integrations/ai/action_drafts.py`
- Modify: `api/integrations/ai/tests.py`

- [ ] **Step 1: Add dry-run test**

Add:

```python
@pytest.mark.django_db
def test_create_interview_tool_creates_draft_without_session(
    employer_user,
    job_post,
    job_seeker_user,
    monkeypatch,
):
    from apps.interviews.models import InterviewSession
    from integrations.ai.tool_registry import execute_tool_call
    from common.models import AIActionDraft

    request = Mock(user=employer_user)
    tool_call = {
        "function": {
            "name": "create_interview_invitation",
            "arguments": json.dumps(
                {
                    "candidate_id": job_seeker_user.id,
                    "job_post_id": job_post.id,
                    "scheduled_at": "2026-06-10T10:00:00+07:00",
                }
            ),
        }
    }

    result = json.loads(execute_tool_call(tool_call, request))

    assert result["type"] == "ai_action_draft"
    assert AIActionDraft.objects.count() == 1
    assert InterviewSession.objects.count() == 0
```

- [ ] **Step 2: Add confirmation test**

Add:

```python
@pytest.mark.django_db
def test_confirm_interview_invitation_draft_creates_session_and_audit(
    employer_user,
    job_post,
    job_seeker_user,
    monkeypatch,
):
    from apps.interviews.models import InterviewSession
    from common.models import AIActionDraft, AuditLog
    from integrations.ai.action_drafts import (
        confirm_ai_action_draft,
        create_interview_invitation_draft,
    )

    queued = []
    monkeypatch.setattr("integrations.ai.action_drafts.queue_invitation_email", lambda session_id: queued.append(session_id))

    request = Mock(user=employer_user, META={}, method="POST", path="/api/v1/ai/actions/1/confirm/")
    draft = create_interview_invitation_draft(
        args={
            "candidate_id": job_seeker_user.id,
            "job_post_id": job_post.id,
            "scheduled_at": "2026-06-10T10:00:00+07:00",
        },
        request=request,
    )

    result = confirm_ai_action_draft(draft_id=draft.id, request=request)

    draft.refresh_from_db()
    session = InterviewSession.objects.get(id=result["sessionId"])
    assert session.job_post == job_post
    assert session.candidate == job_seeker_user
    assert draft.status == AIActionDraft.STATUS_COMMITTED
    assert queued == [session.id]
    assert AuditLog.objects.filter(action="ai_action_commit").exists()
```

- [ ] **Step 3: Implement `action_drafts.py`**

Create:

```python
from __future__ import annotations

from typing import Any

from django.db import transaction
from django.utils import timezone
from django.utils.dateparse import parse_datetime
from rest_framework.exceptions import PermissionDenied, ValidationError

from apps.accounts.permissions import user_has_company_permission
from apps.interviews.models import InterviewSession
from apps.interviews.services import queue_invitation_email
from apps.jobs.models import JobPost
from apps.accounts.models import User
from common.models import AIActionDraft
from shared.audit import record_audit_log
from shared.configs import variable_system as var_sys


def _request_user(request):
    user = getattr(request, "user", None)
    if not user or not getattr(user, "is_authenticated", False):
        raise PermissionDenied("Bạn cần đăng nhập để sử dụng công cụ AI này.")
    return user


def _active_company(user):
    try:
        return user.get_active_company()
    except Exception:
        return None


def _ensure_employer_permission(user, permission_key: str, company=None):
    if getattr(user, "role_name", None) not in (var_sys.EMPLOYER, var_sys.ADMIN):
        raise PermissionDenied("Bạn không có quyền sử dụng công cụ AI này.")
    if not user_has_company_permission(user, permission_key, company):
        raise PermissionDenied("Bạn không có quyền thực hiện thao tác này trong công ty hiện tại.")


def create_interview_invitation_draft(args: dict[str, Any], request) -> AIActionDraft:
    user = _request_user(request)
    company = _active_company(user)
    _ensure_employer_permission(user, "manage_interviews", company)

    candidate_id = args.get("candidate_id")
    job_post_id = args.get("job_post_id")
    scheduled_at_raw = args.get("scheduled_at")

    if not candidate_id:
        raise ValidationError({"candidateId": ["Thiếu ứng viên cần phỏng vấn."]})
    if not job_post_id:
        raise ValidationError({"jobPostId": ["Thiếu tin tuyển dụng."]})

    try:
        job_post = JobPost.objects.select_related("company").get(id=job_post_id)
    except JobPost.DoesNotExist as exc:
        raise ValidationError({"jobPostId": ["Tin tuyển dụng không tồn tại."]}) from exc

    _ensure_employer_permission(user, "manage_interviews", job_post.company)
    if company and job_post.company_id != company.id and getattr(user, "role_name", None) != var_sys.ADMIN:
        raise PermissionDenied("Bạn không có quyền tạo phỏng vấn cho tin tuyển dụng của công ty khác.")

    try:
        candidate = User.objects.get(id=candidate_id)
    except User.DoesNotExist as exc:
        raise ValidationError({"candidateId": ["Ứng viên không tồn tại."]}) from exc

    scheduled_at = parse_datetime(scheduled_at_raw) if scheduled_at_raw else None
    payload = {
        "candidateId": candidate.id,
        "candidateName": candidate.full_name,
        "candidateEmail": candidate.email,
        "jobPostId": job_post.id,
        "jobName": job_post.job_name,
        "scheduledAt": scheduled_at.isoformat() if scheduled_at else None,
    }
    draft = AIActionDraft.objects.create(
        user=user,
        company=job_post.company,
        portal=AIActionDraft.PORTAL_EMPLOYER,
        action_type=AIActionDraft.ACTION_CREATE_INTERVIEW_INVITATION,
        status=AIActionDraft.STATUS_DRAFT,
        input_summary=f"Tạo lời mời phỏng vấn cho {candidate.full_name} - {job_post.job_name}",
        payload=payload,
    )
    record_audit_log(
        request=request,
        action="ai_action_draft",
        instance=draft,
        metadata={"actionType": draft.action_type},
    )
    return draft


@transaction.atomic
def confirm_ai_action_draft(draft_id: int, request) -> dict[str, Any]:
    user = _request_user(request)
    draft = AIActionDraft.objects.select_for_update().get(id=draft_id)
    if draft.user_id != user.id and getattr(user, "role_name", None) != var_sys.ADMIN:
        raise PermissionDenied("Bạn không có quyền xác nhận bản nháp AI này.")
    if draft.status != AIActionDraft.STATUS_DRAFT:
        raise ValidationError({"status": ["Chỉ có thể xác nhận bản nháp đang chờ duyệt."]})
    if draft.action_type != AIActionDraft.ACTION_CREATE_INTERVIEW_INVITATION:
        raise ValidationError({"actionType": ["Loại thao tác AI chưa được hỗ trợ."]})

    _ensure_employer_permission(user, "manage_interviews", draft.company)
    result = _commit_interview_invitation_draft(draft, request)
    draft.status = AIActionDraft.STATUS_COMMITTED
    draft.confirmed_at = timezone.now()
    draft.committed_at = timezone.now()
    draft.commit_result = result
    draft.save(update_fields=["status", "confirmed_at", "committed_at", "commit_result", "update_at"])
    record_audit_log(
        request=request,
        action="ai_action_commit",
        instance=draft,
        metadata={"actionType": draft.action_type, "result": result},
    )
    return result


def _commit_interview_invitation_draft(draft: AIActionDraft, request) -> dict[str, Any]:
    payload = draft.payload
    job_post = JobPost.objects.get(id=payload["jobPostId"])
    candidate = User.objects.get(id=payload["candidateId"])
    scheduled_at = parse_datetime(payload["scheduledAt"]) if payload.get("scheduledAt") else None
    session = InterviewSession.objects.create(
        candidate=candidate,
        job_post=job_post,
        created_by=draft.user,
        scheduled_at=scheduled_at,
        status="scheduled",
    )
    queue_invitation_email(session.id)
    return {
        "sessionId": session.id,
        "jobPostId": job_post.id,
        "candidateId": candidate.id,
        "scheduledAt": session.scheduled_at.isoformat() if session.scheduled_at else None,
    }
```

- [ ] **Step 4: Run draft tests**

Run:

```bash
cd api
pytest integrations/ai/tests.py::test_create_interview_tool_creates_draft_without_session integrations/ai/tests.py::test_confirm_interview_invitation_draft_creates_session_and_audit -q
```

Expected: pass after model/migration and service implementation.

## Task 5: Confirmation Endpoint

**Files:**
- Modify: `api/integrations/ai/views.py`
- Modify: `api/config/urls.py`
- Test: `api/integrations/ai/tests.py`

- [ ] **Step 1: Add endpoint test**

Add:

```python
@pytest.mark.django_db
def test_confirm_ai_action_endpoint_requires_draft_owner(
    employer_user,
    admin_user,
    job_post,
    job_seeker_user,
    monkeypatch,
):
    from integrations.ai.action_drafts import create_interview_invitation_draft

    monkeypatch.setattr("integrations.ai.action_drafts.queue_invitation_email", lambda session_id: None)
    request = Mock(user=employer_user, META={}, method="POST", path="/api/v1/ai/actions/1/confirm/")
    draft = create_interview_invitation_draft(
        args={"candidate_id": job_seeker_user.id, "job_post_id": job_post.id},
        request=request,
    )

    client = APIClient()
    client.force_authenticate(user=admin_user)
    response = client.post(f"/api/v1/ai/actions/{draft.id}/confirm/")

    assert response.status_code == 200
    assert response.data["data"]["sessionId"]
```

- [ ] **Step 2: Add view**

In `api/integrations/ai/views.py`, add:

```python
from integrations.ai.action_drafts import confirm_ai_action_draft
```

Add class:

```python
class AIActionConfirmAPIView(APIView):
    permission_classes = [IsAuthenticated]
    throttle_classes = [AIChatThrottle, AIChatUserThrottle] if AIChatUserThrottle else [AIChatThrottle]

    def post(self, request: DRFRequest, draft_id: int):
        result = confirm_ai_action_draft(draft_id=draft_id, request=request)
        return Response(data_response(errors={}, data=result), status=200)
```

At bottom:

```python
confirm_action = AIActionConfirmAPIView.as_view()
```

- [ ] **Step 3: Wire URL**

In `api/config/urls.py`, add inside `api_v1_patterns`:

```python
path("ai/actions/<int:draft_id>/confirm/", ai_views.confirm_action),
```

- [ ] **Step 4: Run endpoint test**

Run:

```bash
cd api
pytest integrations/ai/tests.py::test_confirm_ai_action_endpoint_requires_draft_owner -q
```

Expected: pass.

## Task 6: Backend Verification

**Files:**
- No new file changes.

- [ ] **Step 1: Run focused AI tests**

Run:

```bash
cd api
pytest integrations/ai/tests.py -q
```

Expected: all AI tests pass.

- [ ] **Step 2: Run related app tests**

Run:

```bash
cd api
pytest apps/chatbot/tests.py apps/interviews/tests.py integrations/ai/tests.py -q
```

Expected: all selected tests pass. If unrelated existing failures appear, record exact failing test and reason.

- [ ] **Step 3: Check migrations**

Run:

```bash
cd api
python manage.py makemigrations --check --dry-run
```

Expected: no changes detected.

