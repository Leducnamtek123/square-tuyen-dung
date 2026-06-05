import pytest
from rest_framework.test import APIClient

from apps.agent_assistants.models import AgentThread
from apps.interviews.models import InterviewSession, Question, QuestionGroup
from apps.jobs.models import JobPostActivity
from apps.profiles.models import Company
from integrations.ai.client import AIEndpointCandidate, AIServiceUnavailable
from shared.configs import variable_system as var_sys


@pytest.fixture(autouse=True)
def agent_planner_no_network(monkeypatch):
    def unavailable_llm(*args, **kwargs):
        raise AIServiceUnavailable("llm", ["tests disabled external LLM"])

    monkeypatch.setattr(
        "integrations.ai.client.post_chat_completion_requests",
        unavailable_llm,
    )


@pytest.mark.django_db
def test_employer_can_read_agent_tool_registry(employer_user):
    client = APIClient()
    client.force_authenticate(user=employer_user)

    response = client.get("/api/v1/agent-assistants/tools/")

    assert response.status_code == 200
    payload = response.data["data"]
    assert any(tool["name"] == "create_manual_candidate" for tool in payload["tools"])
    assert any(tool["name"] == "list_job_posts" for tool in payload["tools"])
    assert any(tool["name"] == "review_job_post" for tool in payload["tools"])


@pytest.mark.django_db
def test_employer_agent_thread_rejects_unowned_active_company_header(employer_user, company, location):
    other_owner = employer_user.__class__.objects.create_user_with_role_name(
        email="other-agent-owner@test.com",
        full_name="Other Agent Owner",
        role_name=var_sys.EMPLOYER,
        password="testpass123",
        is_active=True,
        is_verify_email=True,
        has_company=True,
    )
    other_company = Company.objects.create(
        company_name="Other Agent Company",
        company_email="other-agent-company@test.com",
        company_phone="0902000001",
        tax_code="2000000001",
        user=other_owner,
        location=location,
    )

    client = APIClient()
    client.force_authenticate(user=employer_user)

    response = client.post(
        "/api/v1/agent-assistants/threads/",
        data={"portal": "employer"},
        format="json",
        HTTP_X_ACTIVE_COMPANY_ID=str(other_company.id),
    )

    assert response.status_code == 403
    assert not AgentThread.objects.filter(
        owner=employer_user,
        portal=AgentThread.PORTAL_EMPLOYER,
        company__isnull=True,
    ).exists()


@pytest.mark.django_db
def test_admin_agent_thread_rejects_employer_portal(admin_user):
    client = APIClient()
    client.force_authenticate(user=admin_user)

    response = client.post(
        "/api/v1/agent-assistants/threads/",
        data={"portal": "employer"},
        format="json",
    )

    assert response.status_code == 400
    assert not AgentThread.objects.filter(owner=admin_user, portal=AgentThread.PORTAL_EMPLOYER).exists()


@pytest.mark.django_db
def test_employer_agent_thread_rejects_admin_portal(employer_user):
    client = APIClient()
    client.force_authenticate(user=employer_user)

    response = client.post(
        "/api/v1/agent-assistants/threads/",
        data={"portal": "admin"},
        format="json",
    )

    assert response.status_code == 400
    assert not AgentThread.objects.filter(owner=employer_user, portal=AgentThread.PORTAL_ADMIN).exists()


@pytest.mark.django_db
def test_agent_thread_rejects_unknown_portal(employer_user):
    client = APIClient()
    client.force_authenticate(user=employer_user)

    response = client.post(
        "/api/v1/agent-assistants/threads/",
        data={"portal": "mobile"},
        format="json",
    )

    assert response.status_code == 400
    assert not AgentThread.objects.filter(owner=employer_user).exists()


@pytest.mark.django_db
def test_employer_agent_message_creates_manual_candidate_application(employer_user, job_post):
    client = APIClient()
    client.force_authenticate(user=employer_user)

    thread_response = client.post(
        "/api/v1/agent-assistants/threads/",
        data={"portal": "employer"},
        format="json",
    )

    assert thread_response.status_code == 201
    thread_id = thread_response.data["data"]["id"]

    response = client.post(
        f"/api/v1/agent-assistants/threads/{thread_id}/messages/",
        data={
            "content": (
                "Tao ho so ung vien Nguyen Van A cho vi tri "
                f"{job_post.job_name}, email candidate@example.com, sdt 0909000000"
            )
        },
        format="json",
    )

    assert response.status_code == 200
    payload = response.data["data"]
    assert payload["assistantMessage"]["role"] == "assistant"
    assert "Nguyen Van A" in payload["assistantMessage"]["content"]
    assert payload["toolCalls"][0]["toolName"] == "create_manual_candidate"
    assert payload["toolCalls"][0]["status"] == "succeeded"
    assert payload["toolCalls"][0]["output"]["record"]["fullName"] == "Nguyen Van A"

    activity = JobPostActivity.objects.get(job_post=job_post, is_deleted=False)
    assert activity.user is None
    assert activity.resume is None
    assert activity.full_name == "Nguyen Van A"
    assert activity.email == "candidate@example.com"
    assert activity.phone == "0909000000"
    assert activity.manual_candidate_profile.full_name == "Nguyen Van A"


@pytest.mark.django_db
def test_employer_agent_uses_llm_planner_for_natural_create_candidate_command(
    monkeypatch,
    employer_user,
    job_post,
):
    calls = []

    def fake_post_chat_completion(payload, *, default_model="", timeout=(10, 120)):
        calls.append(payload)
        return (
            {
                "choices": [
                    {
                        "message": {
                            "role": "assistant",
                            "content": (
                                "{"
                                "\"toolName\":\"create_manual_candidate\","
                                "\"arguments\":{"
                                "\"fullName\":\"Nguyen Van B\","
                                "\"email\":\"candidate-b@example.com\","
                                "\"phone\":\"0909111222\","
                                f"\"jobPostName\":\"{job_post.job_name}\""
                                "},"
                                "\"assistantText\":\"Toi se tao ho so ung vien Nguyen Van B.\""
                                "}"
                            ),
                        }
                    }
                ],
            },
            AIEndpointCandidate(name="primary", base_url="http://llm.test/v1", model=default_model),
        )

    monkeypatch.setattr(
        "integrations.ai.client.post_chat_completion_requests",
        fake_post_chat_completion,
    )

    client = APIClient()
    client.force_authenticate(user=employer_user)
    thread_response = client.post("/api/v1/agent-assistants/threads/", data={"portal": "employer"}, format="json")
    thread_id = thread_response.data["data"]["id"]

    response = client.post(
        f"/api/v1/agent-assistants/threads/{thread_id}/messages/",
        data={
            "content": (
                "Hay dua anh Nguyen Van B vao danh sach ung tuyen vi tri "
                f"{job_post.job_name}, email candidate-b@example.com, so 0909111222"
            )
        },
        format="json",
    )

    assert response.status_code == 200
    assert calls, "agent planner should call the LLM before deterministic fallback"
    tool_call = response.data["data"]["toolCalls"][0]
    assert tool_call["toolName"] == "create_manual_candidate"
    assert tool_call["status"] == "succeeded"
    assert tool_call["output"]["record"]["fullName"] == "Nguyen Van B"

    activity = JobPostActivity.objects.get(job_post=job_post, email="candidate-b@example.com", is_deleted=False)
    assert activity.full_name == "Nguyen Van B"
    assert activity.phone == "0909111222"


@pytest.mark.django_db
def test_employer_agent_fallback_handles_add_to_application_list_when_llm_is_unavailable(
    employer_user,
    job_post,
):
    client = APIClient()
    client.force_authenticate(user=employer_user)
    thread_response = client.post("/api/v1/agent-assistants/threads/", data={"portal": "employer"}, format="json")
    thread_id = thread_response.data["data"]["id"]

    response = client.post(
        f"/api/v1/agent-assistants/threads/{thread_id}/messages/",
        data={
            "content": (
                "Hay dua anh AI Fallback Candidate vao danh sach ung tuyen vi tri "
                f"{job_post.job_name}, email fallback@example.com, so 0909000707"
            )
        },
        format="json",
    )

    assert response.status_code == 200
    tool_call = response.data["data"]["toolCalls"][0]
    assert tool_call["toolName"] == "create_manual_candidate"
    assert tool_call["status"] == "succeeded"

    activity = JobPostActivity.objects.get(job_post=job_post, email="fallback@example.com", is_deleted=False)
    assert activity.full_name == "AI Fallback Candidate"
    assert activity.phone == "0909000707"


@pytest.mark.django_db
def test_agent_does_not_return_static_intro_when_llm_is_unavailable_for_general_chat(employer_user, company):
    client = APIClient()
    client.force_authenticate(user=employer_user)
    thread_response = client.post("/api/v1/agent-assistants/threads/", data={"portal": "employer"}, format="json")
    thread_id = thread_response.data["data"]["id"]

    response = client.post(
        f"/api/v1/agent-assistants/threads/{thread_id}/messages/",
        data={"content": "Hom nay co nhung viec gi can xu ly?"},
        format="json",
    )

    assert response.status_code == 200
    assistant_content = response.data["data"]["assistantMessage"]["content"]
    assert "AI engine" in assistant_content
    assert "tạm thời không khả dụng" in assistant_content
    assert "Tôi là Agent Assistants nội bộ" not in assistant_content
    assert response.data["data"]["toolCalls"] == []


@pytest.mark.django_db
def test_agent_fallback_response_uses_vietnamese_diacritics_when_planner_is_malformed(monkeypatch, employer_user, company):
    def malformed_planner_response(payload, *, default_model="", timeout=(10, 120)):
        return (
            {"choices": [{"message": {"role": "assistant", "content": "not json"}}]},
            AIEndpointCandidate(name="local", base_url="http://llm.test/v1", model=default_model),
        )

    monkeypatch.setattr(
        "integrations.ai.client.post_chat_completion_requests",
        malformed_planner_response,
    )

    client = APIClient()
    client.force_authenticate(user=employer_user)
    thread_response = client.post("/api/v1/agent-assistants/threads/", data={"portal": "employer"}, format="json")
    thread_id = thread_response.data["data"]["id"]

    response = client.post(
        f"/api/v1/agent-assistants/threads/{thread_id}/messages/",
        data={"content": "Lam gi tiep theo?"},
        format="json",
    )

    assert response.status_code == 200
    assistant_content = response.data["data"]["assistantMessage"]["content"]
    assert "Tôi chưa xác định" in assistant_content
    assert "Bạn có thể" in assistant_content
    assert "Toi chua" not in assistant_content
    assert "Ban co" not in assistant_content


@pytest.mark.django_db
def test_agent_message_accepts_image_attachment_and_passes_it_to_planner(monkeypatch, employer_user, company):
    calls = []
    image_data_url = "data:image/png;base64,iVBORw0KGgo="

    def fake_post_chat_completion(payload, *, default_model="", timeout=(10, 120)):
        calls.append(payload)
        return (
            {
                "choices": [
                    {
                        "message": {
                            "role": "assistant",
                            "content": (
                                "{"
                                "\"toolName\":\"respond\","
                                "\"arguments\":{},"
                                "\"assistantText\":\"Tôi đã nhận ảnh và có thể phân tích nội dung trong ảnh.\""
                                "}"
                            ),
                        }
                    }
                ],
            },
            AIEndpointCandidate(name="local", base_url="http://llm.test/v1", model=default_model),
        )

    monkeypatch.setattr(
        "integrations.ai.client.post_chat_completion_requests",
        fake_post_chat_completion,
    )

    client = APIClient()
    client.force_authenticate(user=employer_user)
    thread_response = client.post("/api/v1/agent-assistants/threads/", data={"portal": "employer"}, format="json")
    thread_id = thread_response.data["data"]["id"]

    response = client.post(
        f"/api/v1/agent-assistants/threads/{thread_id}/messages/",
        data={
            "content": "Phân tích ảnh ứng viên này giúp tôi",
            "attachments": [
                {
                    "type": "image",
                    "name": "candidate-screen.png",
                    "mimeType": "image/png",
                    "size": 8,
                    "dataUrl": image_data_url,
                }
            ],
        },
        format="json",
    )

    assert response.status_code == 200
    user_message = response.data["data"]["userMessage"]
    assert user_message["parts"][0] == {"type": "text", "text": "Phân tích ảnh ứng viên này giúp tôi"}
    assert user_message["parts"][1]["type"] == "image"
    assert user_message["parts"][1]["mimeType"] == "image/png"
    assert user_message["parts"][1]["name"] == "candidate-screen.png"
    assert user_message["parts"][1]["dataUrl"] == image_data_url

    assert calls, "planner should receive the multimodal user message"
    planner_user_message = calls[0]["messages"][1]
    assert isinstance(planner_user_message["content"], list)
    assert planner_user_message["content"][0]["type"] == "text"
    assert planner_user_message["content"][1] == {
        "type": "image_url",
        "image_url": {"url": image_data_url},
    }
    assert "Tôi đã nhận ảnh" in response.data["data"]["assistantMessage"]["content"]


@pytest.mark.django_db
def test_agent_message_rejects_non_image_attachment(employer_user, company):
    client = APIClient()
    client.force_authenticate(user=employer_user)
    thread_response = client.post("/api/v1/agent-assistants/threads/", data={"portal": "employer"}, format="json")
    thread_id = thread_response.data["data"]["id"]

    response = client.post(
        f"/api/v1/agent-assistants/threads/{thread_id}/messages/",
        data={
            "content": "Đọc file này",
            "attachments": [
                {
                    "type": "file",
                    "name": "resume.pdf",
                    "mimeType": "application/pdf",
                    "size": 12,
                    "dataUrl": "data:application/pdf;base64,JVBERi0=",
                }
            ],
        },
        format="json",
    )

    assert response.status_code == 400
    assert "Chỉ hỗ trợ ảnh" in response.data["error"]["message"]


@pytest.mark.django_db
def test_employer_agent_message_searches_candidate_resumes(employer_user, job_post, resume):
    resume.title = "Senior React Engineer"
    resume.skills_summary = "React, TypeScript, hiring platform"
    resume.is_active = True
    resume.save(update_fields=["title", "skills_summary", "is_active", "update_at"])

    client = APIClient()
    client.force_authenticate(user=employer_user)
    thread_response = client.post("/api/v1/agent-assistants/threads/", data={"portal": "employer"}, format="json")
    thread_id = thread_response.data["data"]["id"]

    response = client.post(
        f"/api/v1/agent-assistants/threads/{thread_id}/messages/",
        data={"content": "Tim ung vien React"},
        format="json",
    )

    assert response.status_code == 200
    tool_call = response.data["data"]["toolCalls"][0]
    assert tool_call["toolName"] == "search_candidates"
    assert tool_call["status"] == "succeeded"
    assert tool_call["output"]["results"][0]["title"] == "Senior React Engineer"
    assert tool_call["output"]["results"][0]["url"] == f"/employer/candidates/{resume.slug}"


@pytest.mark.django_db
def test_employer_agent_planner_can_list_job_posts(monkeypatch, employer_user, job_post):
    job_post.job_name = "Agent Tool Python Lead"
    job_post.save(update_fields=["job_name", "update_at"])

    def fake_post_chat_completion(payload, *, default_model="", timeout=(10, 120)):
        return (
            {
                "choices": [
                    {
                        "message": {
                            "role": "assistant",
                            "content": (
                                "{"
                                "\"toolName\":\"list_job_posts\","
                                "\"arguments\":{\"query\":\"Agent Tool\",\"limit\":5},"
                                "\"assistantText\":\"Toi se liet ke tin tuyen dung.\""
                                "}"
                            ),
                        }
                    }
                ],
            },
            AIEndpointCandidate(name="primary", base_url="http://llm.test/v1", model=default_model),
        )

    monkeypatch.setattr(
        "integrations.ai.client.post_chat_completion_requests",
        fake_post_chat_completion,
    )

    client = APIClient()
    client.force_authenticate(user=employer_user)
    thread_response = client.post("/api/v1/agent-assistants/threads/", data={"portal": "employer"}, format="json")
    thread_id = thread_response.data["data"]["id"]

    response = client.post(
        f"/api/v1/agent-assistants/threads/{thread_id}/messages/",
        data={"content": "Liet ke cac tin tuyen dung Agent Tool"},
        format="json",
    )

    assert response.status_code == 200
    tool_call = response.data["data"]["toolCalls"][0]
    assert tool_call["toolName"] == "list_job_posts"
    assert tool_call["status"] == "succeeded"
    assert tool_call["output"]["results"][0]["jobPostId"] == job_post.id


@pytest.mark.django_db
def test_employer_agent_planner_can_create_question(monkeypatch, employer_user, company):
    def fake_post_chat_completion(payload, *, default_model="", timeout=(10, 120)):
        return (
            {
                "choices": [
                    {
                        "message": {
                            "role": "assistant",
                            "content": (
                                "{"
                                "\"toolName\":\"create_question\","
                                "\"arguments\":{"
                                "\"text\":\"Ung vien da tung xu ly khach hang kho tinh nhu the nao?\","
                                "\"difficulty\":2,"
                                "\"category\":\"behavioral\""
                                "},"
                                "\"assistantText\":\"Toi se tao cau hoi phong van.\""
                                "}"
                            ),
                        }
                    }
                ],
            },
            AIEndpointCandidate(name="primary", base_url="http://llm.test/v1", model=default_model),
        )

    monkeypatch.setattr(
        "integrations.ai.client.post_chat_completion_requests",
        fake_post_chat_completion,
    )

    client = APIClient()
    client.force_authenticate(user=employer_user)
    thread_response = client.post("/api/v1/agent-assistants/threads/", data={"portal": "employer"}, format="json")
    thread_id = thread_response.data["data"]["id"]

    response = client.post(
        f"/api/v1/agent-assistants/threads/{thread_id}/messages/",
        data={"content": "Tao mot question phong van hanh vi ve xu ly khach hang kho tinh"},
        format="json",
    )

    assert response.status_code == 200
    tool_call = response.data["data"]["toolCalls"][0]
    assert tool_call["toolName"] == "create_question"
    assert tool_call["status"] == "succeeded"
    assert tool_call["output"]["record"]["text"].startswith("Ung vien da tung")
    assert tool_call["output"]["record"]["url"] == "/employer/question-bank"

    question = Question.objects.get(text__startswith="Ung vien da tung")
    assert question.company == company
    assert question.author == employer_user
    assert question.difficulty == 2
    assert question.category == "behavioral"


@pytest.mark.django_db
def test_employer_agent_planner_can_create_question_group_with_questions(monkeypatch, employer_user, company):
    def fake_post_chat_completion(payload, *, default_model="", timeout=(10, 120)):
        return (
            {
                "choices": [
                    {
                        "message": {
                            "role": "assistant",
                            "content": (
                                "{"
                                "\"toolName\":\"create_question_group\","
                                "\"arguments\":{"
                                "\"name\":\"Bo cau hoi bat dong san\","
                                "\"description\":\"Sang loc ung vien tu van bat dong san\","
                                "\"questionTexts\":["
                                "\"Hay mo ta quy trinh tu van mot khach hang mua nha.\","
                                "\"Ban xu ly nhu the nao khi khach hang doi gia qua muc?\""
                                "]"
                                "},"
                                "\"assistantText\":\"Toi se tao bo cau hoi.\""
                                "}"
                            ),
                        }
                    }
                ],
            },
            AIEndpointCandidate(name="primary", base_url="http://llm.test/v1", model=default_model),
        )

    monkeypatch.setattr(
        "integrations.ai.client.post_chat_completion_requests",
        fake_post_chat_completion,
    )

    client = APIClient()
    client.force_authenticate(user=employer_user)
    thread_response = client.post("/api/v1/agent-assistants/threads/", data={"portal": "employer"}, format="json")
    thread_id = thread_response.data["data"]["id"]

    response = client.post(
        f"/api/v1/agent-assistants/threads/{thread_id}/messages/",
        data={"content": "Tao bo cau hoi bat dong san gom 2 cau"},
        format="json",
    )

    assert response.status_code == 200
    tool_call = response.data["data"]["toolCalls"][0]
    assert tool_call["toolName"] == "create_question_group"
    assert tool_call["status"] == "succeeded"
    assert tool_call["output"]["record"]["name"] == "Bo cau hoi bat dong san"
    assert tool_call["output"]["record"]["questionsCount"] == 2
    assert tool_call["output"]["record"]["url"] == "/employer/question-groups"

    group = QuestionGroup.objects.get(name="Bo cau hoi bat dong san")
    assert group.company == company
    assert group.author == employer_user
    assert group.questions.count() == 2
    assert all(question.company == company for question in group.questions.all())


@pytest.mark.django_db
def test_employer_agent_fallback_lists_live_interviews_when_llm_is_unavailable(
    employer_user,
    job_seeker_user,
    job_post,
):
    session = InterviewSession.objects.create(
        candidate=job_seeker_user,
        job_post=job_post,
        created_by=employer_user,
        status="in_progress",
        type="mixed",
    )

    client = APIClient()
    client.force_authenticate(user=employer_user)
    thread_response = client.post("/api/v1/agent-assistants/threads/", data={"portal": "employer"}, format="json")
    thread_id = thread_response.data["data"]["id"]

    response = client.post(
        f"/api/v1/agent-assistants/threads/{thread_id}/messages/",
        data={"content": "Giup toi xem dang co ai dang live phong van"},
        format="json",
    )

    assert response.status_code == 200
    tool_call = response.data["data"]["toolCalls"][0]
    assert tool_call["toolName"] == "list_interviews"
    assert tool_call["status"] == "succeeded"
    assert tool_call["output"]["results"][0]["interviewId"] == session.id
    assert tool_call["output"]["results"][0]["url"] == f"/employer/interviews/{session.id}"


@pytest.mark.django_db
def test_admin_agent_planner_can_approve_job_post(monkeypatch, admin_user, job_post):
    job_post.status = var_sys.JobPostStatus.PENDING
    job_post.save(update_fields=["status", "update_at"])

    def fake_post_chat_completion(payload, *, default_model="", timeout=(10, 120)):
        return (
            {
                "choices": [
                    {
                        "message": {
                            "role": "assistant",
                            "content": (
                                "{"
                                "\"toolName\":\"review_job_post\","
                                f"\"arguments\":{{\"jobPostId\":{job_post.id},\"action\":\"approve\"}},"
                                "\"assistantText\":\"Toi se duyet tin tuyen dung.\""
                                "}"
                            ),
                        }
                    }
                ],
            },
            AIEndpointCandidate(name="primary", base_url="http://llm.test/v1", model=default_model),
        )

    monkeypatch.setattr(
        "integrations.ai.client.post_chat_completion_requests",
        fake_post_chat_completion,
    )

    client = APIClient()
    client.force_authenticate(user=admin_user)
    thread_response = client.post("/api/v1/agent-assistants/threads/", data={"portal": "admin"}, format="json")
    thread_id = thread_response.data["data"]["id"]

    response = client.post(
        f"/api/v1/agent-assistants/threads/{thread_id}/messages/",
        data={"content": f"Duyet tin tuyen dung {job_post.id}"},
        format="json",
    )

    assert response.status_code == 200
    tool_call = response.data["data"]["toolCalls"][0]
    assert tool_call["toolName"] == "review_job_post"
    assert tool_call["status"] == "succeeded"
    assert tool_call["output"]["record"]["status"] == var_sys.JobPostStatus.APPROVED
    job_post.refresh_from_db()
    assert job_post.status == var_sys.JobPostStatus.APPROVED


@pytest.mark.django_db
def test_employer_agent_message_updates_application_status(employer_user, job_seeker_user, job_post):
    activity = JobPostActivity.objects.create(
        user=job_seeker_user,
        job_post=job_post,
        full_name="Pipeline Candidate",
        email="pipeline@example.com",
        phone="0909000002",
        status=var_sys.ApplicationStatus.PENDING_CONFIRMATION,
    )

    client = APIClient()
    client.force_authenticate(user=employer_user)
    thread_response = client.post("/api/v1/agent-assistants/threads/", data={"portal": "employer"}, format="json")
    thread_id = thread_response.data["data"]["id"]

    response = client.post(
        f"/api/v1/agent-assistants/threads/{thread_id}/messages/",
        data={"content": f"Cap nhat trang thai ho so {activity.id} sang da lien he"},
        format="json",
    )

    assert response.status_code == 200
    tool_call = response.data["data"]["toolCalls"][0]
    assert tool_call["toolName"] == "update_application_status"
    assert tool_call["status"] == "succeeded"
    assert tool_call["output"]["record"]["applicationId"] == activity.id
    activity.refresh_from_db()
    assert activity.status == var_sys.ApplicationStatus.CONTACTED


@pytest.mark.django_db
def test_employer_can_delete_own_agent_thread_history(employer_user, company):
    client = APIClient()
    client.force_authenticate(user=employer_user)

    thread_response = client.post("/api/v1/agent-assistants/threads/", data={"portal": "employer"}, format="json")
    thread_id = thread_response.data["data"]["id"]
    message_response = client.post(
        f"/api/v1/agent-assistants/threads/{thread_id}/messages/",
        data={"content": "Xin chao agent"},
        format="json",
    )
    assert message_response.status_code == 200

    response = client.delete(f"/api/v1/agent-assistants/threads/{thread_id}/")

    assert response.status_code == 204
    assert not AgentThread.objects.filter(id=thread_id).exists()

    list_response = client.get("/api/v1/agent-assistants/threads/")
    assert all(thread["id"] != thread_id for thread in list_response.data["data"]["threads"])


@pytest.mark.django_db
def test_job_seeker_cannot_use_internal_agent_assistant(job_seeker_user):
    client = APIClient()
    client.force_authenticate(user=job_seeker_user)

    response = client.post(
        "/api/v1/agent-assistants/threads/",
        data={"portal": "employer"},
        format="json",
    )

    assert response.status_code == 403
