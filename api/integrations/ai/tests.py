import json
from types import SimpleNamespace
from unittest.mock import Mock

import pytest
from django.utils import timezone
from rest_framework.test import APIClient

from apps.interviews.models import InterviewSession
from apps.jobs.models import JobPostActivity
from integrations.ai.client import (
    AIEndpointCandidate,
    AIServiceUnavailable,
    _candidate_payload,
    get_llm_candidates,
    post_chat_completion_requests,
)
from integrations.ai.views import execute_tool_call
from integrations.ai.views import _http_probe_url, _probe_http_service
from shared.configs import variable_system as var_sys


def test_http_probe_url_converts_websocket_schemes():
    assert _http_probe_url("wss://tuyendung.square.vn/livekit") == "https://tuyendung.square.vn/livekit"
    assert _http_probe_url("ws://livekit:7880") == "http://livekit:7880"


def test_probe_http_service_uses_http_url_for_wss(monkeypatch):
    fake_response = Mock(status_code=200)
    mock_get = Mock(return_value=fake_response)
    monkeypatch.setattr("integrations.ai.views.requests.get", mock_get)

    result = _probe_http_service("livekit", "wss://tuyendung.square.vn/livekit", path="/")

    assert result["status"] == "online"
    mock_get.assert_called_once()
    assert mock_get.call_args.args[0] == "https://tuyendung.square.vn/livekit/"


def test_llm_candidates_keep_same_base_url_with_different_model(settings):
    settings.AI_LLM_BASE_URL = "http://llm.test/v1"
    settings.AI_LLM_API_KEY = ""
    settings.AI_LLM_LOCAL_BASE_URL = "http://llm.test/v1"
    settings.AI_LLM_LOCAL_MODEL = "gemma3:12b"
    settings.AI_LLM_LOCAL_API_KEY = ""
    settings.AI_LLM_FALLBACK_BASE_URLS = "http://llm.test/v1"
    settings.AI_LLM_FALLBACK_MODELS = "gemma3:12b"
    settings.AI_LLM_FALLBACK_API_KEYS = ""

    candidates = get_llm_candidates(default_model="qwen3-14b-interview")

    assert [(candidate.name, candidate.model) for candidate in candidates] == [
        ("primary", ""),
        ("local", "gemma3:12b"),
    ]


def test_local_ollama_payload_strips_vllm_only_parameters(settings):
    settings.AI_LLM_USE_VLLM_PARAMS = True
    settings.AI_LLM_TOP_K = 20
    settings.AI_LLM_MIN_P = 0.05
    settings.AI_LLM_REPETITION_PENALTY = 1.1
    settings.AI_LLM_ENABLE_THINKING = False

    candidate = AIEndpointCandidate(
        name="local",
        base_url="http://host.docker.internal:11434/v1",
        model="gemma3:12b",
    )
    payload = _candidate_payload(candidate, {"messages": [{"role": "user", "content": "Xin chao"}]})

    assert payload["model"] == "gemma3:12b"
    assert "top_k" not in payload
    assert "min_p" not in payload
    assert "repetition_penalty" not in payload
    assert "chat_template_kwargs" not in payload
    assert "temperature" in payload


def test_image_payload_tries_local_ollama_before_primary(settings, monkeypatch):
    settings.AI_LLM_BASE_URL = "http://primary.test/v1"
    settings.AI_LLM_API_KEY = ""
    settings.AI_LLM_LOCAL_BASE_URL = "http://host.docker.internal:11434/v1"
    settings.AI_LLM_LOCAL_MODEL = "gemma3:12b"
    settings.AI_LLM_LOCAL_API_KEY = ""
    settings.AI_LLM_FALLBACK_BASE_URLS = ""
    settings.AI_LLM_FALLBACK_MODELS = ""
    settings.AI_LLM_FALLBACK_API_KEYS = ""
    native_calls = []

    def fake_native_chat(candidate, payload, *, timeout_seconds, connect_timeout_seconds):
        native_calls.append({"candidate": candidate.name, "payload": payload})
        return {"message": {"role": "assistant", "content": "{}"}}

    monkeypatch.setattr("integrations.ai.client.post_ollama_native_chat_httpx", fake_native_chat)

    response_json, candidate = post_chat_completion_requests(
        {
            "model": "qwen-text",
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "Ảnh này là gì?"},
                        {"type": "image_url", "image_url": {"url": "data:image/jpeg;base64,aGVsbG8="}},
                    ],
                }
            ],
        },
        default_model="qwen-text",
    )

    assert response_json["choices"][0]["message"]["content"] == "{}"
    assert candidate.name == "local"
    assert native_calls[0]["candidate"] == "local"
    assert native_calls[0]["payload"]["model"] == "gemma3:12b"
    assert native_calls[0]["payload"]["messages"][0]["images"] == ["aGVsbG8="]


@pytest.mark.django_db
def test_ai_health_requires_authentication(monkeypatch):
    monkeypatch.setattr(
        "integrations.ai.views._ai_service_checks",
        lambda: {"llm": {"status": "online", "latencyMs": 1}},
    )

    client = APIClient()
    response = client.get("/api/v1/ai/health/")

    assert response.status_code == 401


@pytest.mark.django_db
def test_authenticated_user_can_read_ai_health(monkeypatch, job_seeker_user):
    monkeypatch.setattr(
        "integrations.ai.views._ai_service_checks",
        lambda: {"llm": {"status": "online", "latencyMs": 1}},
    )

    client = APIClient()
    client.force_authenticate(user=job_seeker_user)
    response = client.get("/api/v1/ai/health/")

    assert response.status_code == 200
    assert response.data["data"]["checks"]["llm"]["status"] == "online"


@pytest.mark.django_db
def test_authenticated_employer_chat_retries_without_tools_when_provider_rejects_auto_tool_choice(
    monkeypatch,
    employer_user,
):
    calls = []

    def fake_post_chat_completion(payload, *, default_model="", timeout=(10, 120)):
        calls.append(payload)
        if "tools" in payload:
            raise AIServiceUnavailable(
                "llm",
                [
                    'primary: HTTP 400 {"error":{"message":"\\"auto\\" tool choice requires --enable-auto-tool-choice"}}',
                ],
            )
        return (
            {
                "choices": [
                    {
                        "message": {
                            "role": "assistant",
                            "content": "Xin chao, toi co the ho tro tuyen dung.",
                        }
                    }
                ],
                "usage": {"total_tokens": 12},
            },
            AIEndpointCandidate(name="primary", base_url="http://llm.test/v1", model=default_model),
        )

    monkeypatch.setattr(
        "integrations.ai.views.post_chat_completion_requests",
        fake_post_chat_completion,
    )

    client = APIClient()
    client.force_authenticate(user=employer_user)
    response = client.post(
        "/api/v1/ai/chat/",
        data={
            "messages": [
                {"role": "system", "content": "Ban la tro ly tuyen dung."},
                {"role": "user", "content": "Xin chao"},
            ]
        },
        format="json",
    )

    assert response.status_code == 200
    assert response.data["data"]["reply"] == "Xin chao, toi co the ho tro tuyen dung."
    assert "tools" in calls[0]
    assert "tools" not in calls[1]
    assert len(calls) == 2


@pytest.mark.django_db
def test_ai_chat_instructs_llm_to_reply_with_vietnamese_diacritics(monkeypatch, employer_user):
    calls = []

    def fake_post_chat_completion(payload, *, default_model="", timeout=(10, 120)):
        calls.append(payload)
        return (
            {
                "choices": [
                    {
                        "message": {
                            "role": "assistant",
                            "content": "Tôi đang hoạt động.",
                        }
                    }
                ],
                "usage": {"total_tokens": 8},
            },
            AIEndpointCandidate(name="local", base_url="http://llm.test/v1", model=default_model),
        )

    monkeypatch.setattr(
        "integrations.ai.views.post_chat_completion_requests",
        fake_post_chat_completion,
    )

    client = APIClient()
    client.force_authenticate(user=employer_user)
    response = client.post(
        "/api/v1/ai/chat/",
        data={"messages": [{"role": "user", "content": "xin chao"}]},
        format="json",
    )

    assert response.status_code == 200
    assert calls
    assert calls[0]["messages"][0]["role"] == "system"
    assert "tiếng Việt có dấu" in calls[0]["messages"][0]["content"]
    assert response.data["data"]["reply"] == "Tôi đang hoạt động."


@pytest.mark.django_db
def test_authenticated_employer_chat_can_create_manual_candidate_profile(
    monkeypatch,
    employer_user,
    job_post,
):
    def fail_if_llm_called(*args, **kwargs):
        raise AssertionError("manual candidate creation should not call the LLM")

    monkeypatch.setattr(
        "integrations.ai.views.post_chat_completion_requests",
        fail_if_llm_called,
    )

    client = APIClient()
    client.force_authenticate(user=employer_user)
    response = client.post(
        "/api/v1/ai/chat/",
        data={
            "messages": [
                {
                    "role": "user",
                    "content": (
                        "Tao ho so ung vien Nguyen Van A cho vi tri "
                        f"{job_post.job_name}, email candidate@example.com, sdt 0909000000"
                    ),
                },
            ]
        },
        format="json",
    )

    assert response.status_code == 200
    assert "Đã tạo hồ sơ ứng viên Nguyen Van A" in response.data["data"]["reply"]

    activity = JobPostActivity.objects.get(job_post=job_post, is_deleted=False)
    assert activity.user is None
    assert activity.resume is None
    assert activity.full_name == "Nguyen Van A"
    assert activity.email == "candidate@example.com"
    assert activity.phone == "0909000000"
    assert activity.manual_candidate_profile.full_name == "Nguyen Van A"
    assert activity.manual_candidate_profile.title == job_post.job_name


@pytest.mark.django_db
def test_ai_chat_manual_candidate_uses_selected_company_header(
    monkeypatch,
    employer_user,
    job_post,
    career,
    location,
):
    from apps.jobs.models import JobPost
    from apps.profiles.models import Company, CompanyMember, CompanyRole

    def fail_if_llm_called(*args, **kwargs):
        raise AssertionError("manual candidate creation should not call the LLM")

    monkeypatch.setattr(
        "integrations.ai.views.post_chat_completion_requests",
        fail_if_llm_called,
    )

    selected_owner = employer_user.__class__.objects.create_user_with_role_name(
        email="selected-ai-chat-owner@test.com",
        full_name="Selected AI Chat Owner",
        role_name=var_sys.EMPLOYER,
        password="pass123",
        is_active=True,
        is_verify_email=True,
        has_company=True,
    )
    selected_company = Company.objects.create(
        company_name="Selected AI Chat Company",
        company_email="selected-ai-chat-company@test.com",
        company_phone="0916000002",
        tax_code="AICHAT0002",
        user=selected_owner,
        location=location,
        is_verified=True,
    )
    role = CompanyRole.objects.create(
        company=selected_company,
        code="selected-ai-chat-candidates",
        name="Selected AI Chat Candidates",
        permissions=["manage_candidates"],
    )
    CompanyMember.objects.create(
        company=selected_company,
        user=employer_user,
        role=role,
        status=CompanyMember.STATUS_ACTIVE,
        is_active=True,
    )
    selected_job = JobPost.objects.create(
        job_name="Selected AI Chat Job",
        deadline=timezone.now().date() + timezone.timedelta(days=30),
        quantity=1,
        job_description="<p>Selected company job</p>",
        position=4,
        type_of_workplace=1,
        experience=2,
        academic_level=2,
        job_type=1,
        salary_min=10000000,
        salary_max=20000000,
        contact_person_name="HR",
        contact_person_phone="0901234567",
        contact_person_email="hr-selected-ai@test.com",
        status=var_sys.JobPostStatus.APPROVED,
        user=selected_owner,
        company=selected_company,
        career=career,
        location=location,
    )

    client = APIClient()
    client.force_authenticate(user=employer_user)
    response = client.post(
        "/api/v1/ai/chat/",
        data={
            "messages": [
                {
                    "role": "user",
                    "content": (
                        "Tao ho so ung vien Tran Thi B cho vi tri "
                        f"{selected_job.job_name}, email selected-ai-candidate@example.com, sdt 0909000001"
                    ),
                },
            ]
        },
        format="json",
        HTTP_X_ACTIVE_COMPANY_ID=str(selected_company.id),
    )

    assert response.status_code == 200
    activity = JobPostActivity.objects.get(email="selected-ai-candidate@example.com")
    assert activity.job_post == selected_job
    assert activity.job_post != job_post
    assert activity.manual_candidate_profile.company == selected_company


@pytest.mark.django_db
def test_ai_chat_candidate_search_tool_excludes_inactive_resumes(employer_user, resume):
    resume.title = "Hidden React Candidate"
    resume.skills_summary = "React, TypeScript"
    resume.is_active = False
    resume.save(update_fields=["title", "skills_summary", "is_active", "update_at"])

    result = execute_tool_call(
        {
            "function": {
                "name": "search_candidates",
                "arguments": json.dumps({"query": "React", "limit": 5}),
            }
        },
        SimpleNamespace(user=employer_user),
    )

    assert "Không tìm thấy" in result
    assert "Hidden React Candidate" not in result


@pytest.mark.django_db
def test_ai_chat_create_interview_tool_rejects_other_company_job(
    monkeypatch,
    employer_user,
    job_seeker_user,
    career,
    location,
):
    from apps.accounts.models import User
    from apps.jobs.models import JobPost
    from apps.profiles.models import Company

    monkeypatch.setattr("integrations.ai.views.send_interview_invitation", None)
    other_owner = User.objects.create_user_with_role_name(
        email="ai-tool-other-owner@test.com",
        full_name="Other Owner",
        role_name=var_sys.EMPLOYER,
        password="pass123",
        is_active=True,
        is_verify_email=True,
        has_company=True,
    )
    other_company = Company.objects.create(
        company_name="Other AI Tool Company",
        company_email="other-ai-tool-company@test.com",
        company_phone="0915000001",
        tax_code="AIT000001",
        user=other_owner,
        location=location,
        is_verified=True,
    )
    other_job = JobPost.objects.create(
        job_name="Other Company AI Interview Job",
        deadline=timezone.now().date() + timezone.timedelta(days=30),
        quantity=1,
        job_description="<p>Other job</p>",
        position=4,
        type_of_workplace=1,
        experience=2,
        academic_level=2,
        job_type=1,
        salary_min=10000000,
        salary_max=20000000,
        contact_person_name="HR",
        contact_person_phone="0901234567",
        contact_person_email="hr@test.com",
        status=var_sys.JobPostStatus.APPROVED,
        user=other_owner,
        company=other_company,
        career=career,
        location=location,
    )

    result = execute_tool_call(
        {
            "function": {
                "name": "create_interview_invitation",
                "arguments": json.dumps(
                    {"candidate_id": job_seeker_user.id, "job_post_id": other_job.id}
                ),
            }
        },
        SimpleNamespace(user=employer_user),
    )

    assert "tin tuyển dụng" in result.lower()
    assert "công ty" in result.lower()
    assert not InterviewSession.objects.filter(
        job_post=other_job,
        created_by=employer_user,
    ).exists()


@pytest.mark.django_db
def test_ai_chat_create_interview_tool_uses_selected_company_header(
    monkeypatch,
    employer_user,
    job_seeker_user,
    job_post,
    career,
    location,
):
    from apps.jobs.models import JobPost
    from apps.profiles.models import Company, CompanyMember, CompanyRole

    monkeypatch.setattr("integrations.ai.views.send_interview_invitation", None)

    selected_owner = employer_user.__class__.objects.create_user_with_role_name(
        email="selected-ai-interview-owner@test.com",
        full_name="Selected AI Interview Owner",
        role_name=var_sys.EMPLOYER,
        password="pass123",
        is_active=True,
        is_verify_email=True,
        has_company=True,
    )
    selected_company = Company.objects.create(
        company_name="Selected AI Interview Company",
        company_email="selected-ai-interview-company@test.com",
        company_phone="0916000003",
        tax_code="AIINTERVIEW0003",
        user=selected_owner,
        location=location,
        is_verified=True,
    )
    role = CompanyRole.objects.create(
        company=selected_company,
        code="selected-ai-interview-manager",
        name="Selected AI Interview Manager",
        permissions=["manage_interviews"],
    )
    CompanyMember.objects.create(
        company=selected_company,
        user=employer_user,
        role=role,
        status=CompanyMember.STATUS_ACTIVE,
        is_active=True,
    )
    selected_job = JobPost.objects.create(
        job_name="Selected AI Interview Job",
        deadline=timezone.now().date() + timezone.timedelta(days=30),
        quantity=1,
        job_description="<p>Selected interview job</p>",
        position=4,
        type_of_workplace=1,
        experience=2,
        academic_level=2,
        job_type=1,
        salary_min=10000000,
        salary_max=20000000,
        contact_person_name="HR",
        contact_person_phone="0901234567",
        contact_person_email="hr-selected-ai-interview@test.com",
        status=var_sys.JobPostStatus.APPROVED,
        user=selected_owner,
        company=selected_company,
        career=career,
        location=location,
    )

    request = SimpleNamespace(
        user=employer_user,
        headers={"X-Active-Company-Id": str(selected_company.id)},
        META={},
    )

    result = execute_tool_call(
        {
            "function": {
                "name": "create_interview_invitation",
                "arguments": json.dumps(
                    {
                        "candidate_id": job_seeker_user.id,
                        "job_post_id": selected_job.id,
                        "scheduled_at": "2026-04-15T10:00:00Z",
                    }
                ),
            }
        },
        request,
    )

    assert "Selected AI Interview Job" in result
    session = InterviewSession.objects.get(job_post=selected_job, created_by=employer_user)
    assert session.candidate == job_seeker_user
    assert not InterviewSession.objects.filter(job_post=job_post, created_by=employer_user).exists()


@pytest.mark.django_db
def test_ai_chat_tool_returns_soft_error_for_malformed_arguments(employer_user):
    result = execute_tool_call(
        {
            "function": {
                "name": "search_candidates",
                "arguments": "{not-json",
            }
        },
        SimpleNamespace(user=employer_user),
    )

    assert "tham số" in result.lower()
    assert "không hợp lệ" in result.lower()


@pytest.mark.django_db
def test_ai_chat_candidate_search_tool_uses_default_limit_for_invalid_limit(employer_user, resume):
    resume.title = "React Tool Candidate"
    resume.skills_summary = "React"
    resume.is_active = True
    resume.save(update_fields=["title", "skills_summary", "is_active", "update_at"])

    result = execute_tool_call(
        {
            "function": {
                "name": "search_candidates",
                "arguments": json.dumps({"query": "React", "limit": "not-a-number"}),
            }
        },
        SimpleNamespace(user=employer_user),
    )

    data = json.loads(result)
    assert data[0]["title"] == "React Tool Candidate"


@pytest.mark.django_db
def test_fpt_gpu_control_action_requires_admin(admin_user, job_seeker_user, settings):
    settings.FPT_GPU_BSS_ACCESS_TOKEN = "test-bss-token"
    settings.FPT_GPU_TENANT_ID = "tenant-1"
    settings.FPT_GPU_CONTAINER_ID = "container-1"

    client = APIClient()
    client.force_authenticate(user=job_seeker_user)

    response = client.post("/api/v1/ai/gpu-control/stop/")

    assert response.status_code == 403


@pytest.mark.django_db
def test_fpt_gpu_control_action_posts_to_fpt(admin_user, settings, monkeypatch):
    settings.FPT_GPU_CONTROL_BASE_URL = "https://console-api.fptcloud.com"
    settings.FPT_GPU_BSS_ACCESS_TOKEN = "test-bss-token"
    settings.FPT_GPU_REGION = "hanoi-2-vn"
    settings.FPT_GPU_TENANT_ID = "tenant-1"
    settings.FPT_GPU_CONTAINER_ID = "container-1"

    fake_response = Mock(status_code=200, content=b"{}")
    fake_response.json.return_value = {}
    mock_request = Mock(return_value=fake_response)
    monkeypatch.setattr("integrations.ai.views.requests.request", mock_request)

    client = APIClient()
    client.force_authenticate(user=admin_user)

    response = client.post("/api/v1/ai/gpu-control/start/")

    assert response.status_code == 200
    mock_request.assert_called_once()
    assert mock_request.call_args.kwargs["json"] == {"action": "START"}
    assert mock_request.call_args.kwargs["headers"]["Authorization"] == "Bearer test-bss-token"
