from __future__ import annotations

import base64
import binascii
import json
import re
import unicodedata
from dataclasses import dataclass
from typing import Any

from django.db import transaction
from django.db.models import Q
from django.utils import timezone

from apps.interviews.models import InterviewSession, Question, QuestionGroup
from apps.jobs.models import JobPost, JobPostActivity
from apps.jobs.services import JobActivityService
from apps.profiles.models import Company, Resume
from apps.profiles.serializers import EmployerCandidateProfileSerializer
from shared.audit import record_audit_log
from shared.configs import variable_system as var_sys

from .models import AgentMessage, AgentThread, AgentToolCall
from .planner import RESPOND_TOOL_NAME, AgentPlannedAction, AgentPlanner, AgentPlannerUnavailable
from .tool_registry import TOOL_REGISTRY, get_tool_definition


class AgentAssistantError(Exception):
    def __init__(self, message: str, *, details: dict[str, Any] | None = None):
        super().__init__(message)
        self.message = message
        self.details = details or {}


@dataclass
class AgentRunResult:
    user_message: AgentMessage
    assistant_message: AgentMessage
    tool_calls: list[AgentToolCall]


MAX_AGENT_IMAGE_ATTACHMENTS = 5
MAX_AGENT_IMAGE_BYTES = 2 * 1024 * 1024
ALLOWED_AGENT_IMAGE_MIME_TYPES = {"image/png", "image/jpeg", "image/webp", "image/gif"}


def _json_safe(value: Any) -> Any:
    return json.loads(json.dumps(value, default=str))


def _attachment_name(value: Any) -> str:
    name = re.sub(r"\s+", " ", str(value or "")).strip()
    return name[:180] or "image"


def _normalize_agent_attachments(content: str, attachments: Any) -> list[dict[str, Any]]:
    parts: list[dict[str, Any]] = []
    if content:
        parts.append({"type": "text", "text": content})

    if attachments in (None, ""):
        return parts
    if not isinstance(attachments, list):
        raise AgentAssistantError("Định dạng tệp đính kèm không hợp lệ.")
    if len(attachments) > MAX_AGENT_IMAGE_ATTACHMENTS:
        raise AgentAssistantError(f"Chỉ hỗ trợ tối đa {MAX_AGENT_IMAGE_ATTACHMENTS} ảnh trong một tin nhắn.")

    for attachment in attachments:
        if not isinstance(attachment, dict):
            raise AgentAssistantError("Định dạng tệp đính kèm không hợp lệ.")

        attachment_type = str(attachment.get("type") or "").strip().lower()
        mime_type = str(attachment.get("mimeType") or attachment.get("mime_type") or "").strip().lower()
        if attachment_type != "image" or mime_type not in ALLOWED_AGENT_IMAGE_MIME_TYPES:
            raise AgentAssistantError("Chỉ hỗ trợ ảnh PNG, JPG, WebP hoặc GIF trong Agent Assistants.")

        data_url = str(attachment.get("dataUrl") or attachment.get("data_url") or "").strip()
        expected_prefix = f"data:{mime_type};base64,"
        if not data_url.lower().startswith(expected_prefix):
            raise AgentAssistantError("Ảnh đính kèm không hợp lệ hoặc thiếu dữ liệu base64.")

        encoded = data_url[len(expected_prefix) :]
        try:
            decoded = base64.b64decode(encoded, validate=True)
        except (binascii.Error, ValueError):
            raise AgentAssistantError("Ảnh đính kèm không hợp lệ hoặc thiếu dữ liệu base64.")

        byte_size = len(decoded)
        declared_size = _coerce_int(attachment.get("size"))
        effective_size = declared_size or byte_size
        if byte_size > MAX_AGENT_IMAGE_BYTES or effective_size > MAX_AGENT_IMAGE_BYTES:
            raise AgentAssistantError("Ảnh đính kèm vượt quá giới hạn 2MB.")

        parts.append(
            {
                "type": "image",
                "name": _attachment_name(attachment.get("name")),
                "mimeType": mime_type,
                "size": byte_size,
                "dataUrl": data_url,
            }
        )

    return parts


def _strip_accents(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value or "")
    return "".join(ch for ch in normalized if not unicodedata.combining(ch))


def _normalize_text(value: str) -> str:
    normalized = _strip_accents(value).lower()
    normalized = re.sub(r"[^a-z0-9]+", " ", normalized)
    return re.sub(r"\s+", " ", normalized).strip()


def _clean_name(value: str) -> str:
    name = re.sub(r"\s+", " ", value or "").strip(" ,.;:-")
    name = re.sub(r"^(?:ten|tên|la|là)\s+", "", name, flags=re.IGNORECASE).strip(" ,.;:-")
    return name[:150]


def _extract_candidate_name(text: str) -> str:
    patterns = [
        r"(?:dua|them|add)\s+(?:anh|chi|ban|ong|ba)?\s*(?P<name>.+?)(?=\s+(?:vao|vÃ o)\s+(?:danh sach|ds)\s+(?:ung tuyen|á»©ng tuyá»ƒn)\b|[,.;]|\n|$)",
        r"(?:ứng viên|ung vien|candidate)\s+(?P<name>.+?)(?=\s+(?:cho|vào|vao|ứng tuyển|ung tuyen|vị trí|vi tri|tin|job|email|sdt|phone|điện thoại|dien thoai)\b|[,.;]|\n|$)",
        r"(?:tên|ten)\s+(?P<name>.+?)(?=\s+(?:cho|vào|vao|ứng tuyển|ung tuyen|vị trí|vi tri|tin|job|email|sdt|phone|điện thoại|dien thoai)\b|[,.;]|\n|$)",
    ]
    for pattern in patterns:
        match = re.search(pattern, text or "", flags=re.IGNORECASE | re.DOTALL)
        if match:
            name = _clean_name(match.group("name"))
            if len(name.split()) >= 2:
                return name
    return ""


def _extract_email(text: str) -> str:
    match = re.search(r"[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}", text or "")
    return match.group(0)[:254] if match else ""


def _extract_phone(text: str) -> str:
    simple_match = re.search(
        r"\bso\s*[:\-]?\s*(?P<phone>\+?\d[\d\s.\-]{7,18})",
        text or "",
        flags=re.IGNORECASE,
    )
    if simple_match:
        return re.sub(r"[^\d+]", "", simple_match.group("phone"))[:20]

    match = re.search(
        r"(?:sdt|số điện thoại|so dien thoai|phone|điện thoại|dien thoai)\s*[:\-]?\s*(?P<phone>\+?\d[\d\s.\-]{7,18})",
        text or "",
        flags=re.IGNORECASE,
    )
    if not match:
        return ""
    return re.sub(r"[^\d+]", "", match.group("phone"))[:20]


def _is_create_manual_candidate_intent(text: str) -> bool:
    normalized = _normalize_text(text)
    if any(token in normalized for token in ("tao", "them", "create")):
        return ("ho so" in normalized and "ung vien" in normalized) or "manual candidate" in normalized
    return (
        any(token in normalized for token in ("dua", "them", "add"))
        and ("danh sach ung tuyen" in normalized or ("ung tuyen" in normalized and "vi tri" in normalized))
    )


def _is_search_candidates_intent(text: str) -> bool:
    normalized = _normalize_text(text)
    return (
        any(token in normalized for token in ("tim", "search", "kiem"))
        and ("ung vien" in normalized or "candidate" in normalized)
    )


def _extract_search_query(text: str) -> str:
    patterns = [
        r"(?:ứng viên|ung vien|candidate)\s+(?P<query>.+)$",
        r"(?:tìm|tim|search|kiếm|kiem)\s+(?P<query>.+)$",
    ]
    for pattern in patterns:
        match = re.search(pattern, text or "", flags=re.IGNORECASE | re.DOTALL)
        if match:
            query = re.sub(r"\s+", " ", match.group("query")).strip(" ,.;:-")
            query = re.sub(r"^(?:ung vien|candidate)\s+", "", query, flags=re.IGNORECASE).strip(" ,.;:-")
            if query:
                return query[:120]
    return ""


def _is_update_application_status_intent(text: str) -> bool:
    normalized = _normalize_text(text)
    return (
        any(token in normalized for token in ("cap nhat", "doi", "chuyen", "update"))
        and ("trang thai" in normalized or "status" in normalized)
        and ("ho so" in normalized or "application" in normalized)
    )


def _is_create_question_group_intent(text: str) -> bool:
    normalized = _normalize_text(text)
    return any(token in normalized for token in ("tao", "them", "create")) and (
        "bo cau hoi" in normalized
        or "nhom cau hoi" in normalized
        or "question group" in normalized
    )


def _is_create_question_intent(text: str) -> bool:
    normalized = _normalize_text(text)
    return (
        any(token in normalized for token in ("tao", "them", "create"))
        and ("cau hoi" in normalized or "question" in normalized)
        and not _is_create_question_group_intent(text)
    )


def _is_list_questions_intent(text: str) -> bool:
    normalized = _normalize_text(text)
    return any(token in normalized for token in ("liet ke", "xem", "tim", "list", "search")) and (
        "ngan hang cau hoi" in normalized
        or "kho cau hoi" in normalized
        or "question bank" in normalized
        or ("cau hoi" in normalized and "bo cau hoi" not in normalized)
    )


def _is_list_question_groups_intent(text: str) -> bool:
    normalized = _normalize_text(text)
    return any(token in normalized for token in ("liet ke", "xem", "tim", "list", "search")) and (
        "bo cau hoi" in normalized
        or "nhom cau hoi" in normalized
        or "question group" in normalized
    )


def _is_list_interviews_intent(text: str) -> bool:
    normalized = _normalize_text(text)
    return (
        "phong van" in normalized
        or "interview" in normalized
    ) and any(token in normalized for token in ("live", "dang", "lich", "list", "liet ke", "xem", "ai"))


def _extract_question_text(text: str) -> str:
    cleaned = re.sub(r"\s+", " ", text or "").strip(" ,.;:-")
    patterns = [
        r"(?:câu hỏi|cau hoi|question)\s*[:\-]?\s*(?P<text>.+)$",
        r"(?:tạo|tao|thêm|them|create)\s+(?:một\s+|mot\s+)?(?:câu hỏi|cau hoi|question)\s*(?P<text>.+)$",
    ]
    for pattern in patterns:
        match = re.search(pattern, cleaned, flags=re.IGNORECASE | re.DOTALL)
        if match:
            value = re.sub(r"\s+", " ", match.group("text")).strip(" ,.;:-")
            if value:
                return value[:1000]
    return cleaned[:1000]


def _extract_question_group_name(text: str) -> str:
    cleaned = re.sub(r"\s+", " ", text or "").strip(" ,.;:-")
    patterns = [
        r"(?:bộ câu hỏi|bo cau hoi|nhóm câu hỏi|nhom cau hoi|question group)\s+(?P<name>.+?)(?=\s+(?:gồm|gom|với|voi|cho|về|ve)\b|[,.;]|\n|$)",
        r"(?:tạo|tao|thêm|them|create)\s+(?:bộ câu hỏi|bo cau hoi|nhóm câu hỏi|nhom cau hoi)\s+(?P<name>.+?)(?=\s+(?:gồm|gom|với|voi|cho|về|ve)\b|[,.;]|\n|$)",
    ]
    for pattern in patterns:
        match = re.search(pattern, cleaned, flags=re.IGNORECASE | re.DOTALL)
        if match:
            name = re.sub(r"\s+", " ", match.group("name")).strip(" ,.;:-")
            if name:
                return name[:255]
    return cleaned[:120] or "Bộ câu hỏi mới"


def _extract_application_id(text: str) -> int | None:
    normalized = _normalize_text(text)
    patterns = [
        r"(?:ho so|application|id)\s+(?P<id>\d+)",
        r"#(?P<id>\d+)",
    ]
    for pattern in patterns:
        match = re.search(pattern, normalized)
        if match:
            try:
                return int(match.group("id"))
            except (TypeError, ValueError):
                return None
    return None


def _extract_application_status(text: str) -> int | None:
    normalized = _normalize_text(text)
    status_map = [
        (("khong phu hop", "not selected", "loai"), var_sys.ApplicationStatus.NOT_SELECTED),
        (("da tuyen", "hired", "tuyen"), var_sys.ApplicationStatus.HIRED),
        (("da phong van", "phong van", "interviewed"), var_sys.ApplicationStatus.INTERVIEWED),
        (("da kiem tra", "kiem tra", "tested", "test"), var_sys.ApplicationStatus.TESTED),
        (("da lien he", "lien he", "contacted"), var_sys.ApplicationStatus.CONTACTED),
    ]
    for tokens, status in status_map:
        if any(token in normalized for token in tokens):
            return int(status)
    return None


def _string_arg(value: Any) -> str:
    if value is None:
        return ""
    return re.sub(r"\s+", " ", str(value)).strip()


def _coerce_int(value: Any) -> int | None:
    if value is None or value == "":
        return None
    if isinstance(value, bool):
        return None
    try:
        return int(value)
    except (TypeError, ValueError):
        match = re.search(r"\d+", str(value))
        return int(match.group(0)) if match else None


def _coerce_limit(value: Any, default: int = 5) -> int:
    limit = _coerce_int(value) or default
    return max(1, min(limit, 10))


def _resolve_application_status(value: Any, fallback_text: str = "") -> int | None:
    direct = _coerce_int(value)
    if direct:
        return direct

    normalized = _normalize_text(str(value or ""))
    status_aliases = [
        (("not_selected", "not selected", "khong phu hop", "loai"), var_sys.ApplicationStatus.NOT_SELECTED),
        (("hired", "da tuyen", "tuyen"), var_sys.ApplicationStatus.HIRED),
        (("interviewed", "da phong van", "phong van"), var_sys.ApplicationStatus.INTERVIEWED),
        (("tested", "da kiem tra", "kiem tra", "test"), var_sys.ApplicationStatus.TESTED),
        (("contacted", "da lien he", "lien he"), var_sys.ApplicationStatus.CONTACTED),
    ]
    for aliases, status in status_aliases:
        if any(_normalize_text(alias) in normalized for alias in aliases):
            return int(status)
    return _extract_application_status(fallback_text)


def _resolve_job_post_status(value: Any, fallback_text: str = "") -> int | None:
    direct = _coerce_int(value)
    if direct:
        return direct

    normalized = _normalize_text(f"{value or ''} {fallback_text or ''}")
    status_aliases = [
        (("approved", "approve", "duyet", "da duyet"), var_sys.JobPostStatus.APPROVED),
        (("rejected", "reject", "tu choi", "bi tu choi"), var_sys.JobPostStatus.REJECTED),
        (("pending", "cho duyet", "dang cho", "cho xac nhan"), var_sys.JobPostStatus.PENDING),
    ]
    for aliases, status in status_aliases:
        if any(_normalize_text(alias) in normalized for alias in aliases):
            return int(status)
    return None


def _choice_label(choices: Any, value: Any) -> str:
    try:
        value_int = int(value)
    except (TypeError, ValueError):
        return str(value or "")
    for choice_value, label in choices:
        try:
            if int(choice_value) == value_int:
                return str(label)
        except (TypeError, ValueError):
            continue
    return str(value_int)


def _text_choice_label(choices: Any, value: Any) -> str:
    value_text = str(value or "")
    for choice_value, label in choices:
        if str(choice_value) == value_text:
            return str(label)
    return value_text


def _coerce_bool(value: Any) -> bool | None:
    if isinstance(value, bool):
        return value
    if value in (None, ""):
        return None
    normalized = _normalize_text(str(value))
    if normalized in {"true", "1", "yes", "y", "da xac thuc", "verified"}:
        return True
    if normalized in {"false", "0", "no", "n", "chua xac thuc", "unverified"}:
        return False
    return None


def _coerce_question_difficulty(value: Any, default: int = 1) -> int:
    difficulty = _coerce_int(value) or default
    if difficulty < 1:
        return 1
    if difficulty > 3:
        return 3
    return difficulty


def _coerce_question_category(value: Any) -> str:
    normalized = _normalize_text(str(value or ""))
    category_aliases = {
        "soft_skills": "soft_skills",
        "soft skill": "soft_skills",
        "ky nang mem": "soft_skills",
        "technical": "technical",
        "ky thuat": "technical",
        "behavioral": "behavioral",
        "hanh vi": "behavioral",
        "situational": "situational",
        "tinh huong": "situational",
        "general": "general",
        "chung": "general",
    }
    for alias, category in category_aliases.items():
        if _normalize_text(alias) == normalized:
            return category
    return "general"


def _coerce_interview_status(value: Any, fallback_text: str = "") -> str:
    normalized = _normalize_text(f"{value or ''} {fallback_text or ''}")
    status_aliases = [
        (("in_progress", "in progress", "dang phong van", "live"), "in_progress"),
        (("calibration", "kiem tra thiet bi"), "calibration"),
        (("scheduled", "da len lich", "lich"), "scheduled"),
        (("completed", "hoan thanh", "xong"), "completed"),
        (("cancelled", "da huy", "huy"), "cancelled"),
        (("interrupted", "gian doan"), "interrupted"),
        (("processing", "dang xu ly"), "processing"),
        (("draft", "ban nhap"), "draft"),
    ]
    for aliases, status in status_aliases:
        if any(_normalize_text(alias) in normalized for alias in aliases):
            return status
    return ""


def _list_arg(value: Any) -> list[Any]:
    if value is None:
        return []
    if isinstance(value, list):
        return value
    if isinstance(value, tuple):
        return list(value)
    return [value]


def _question_texts_from_input(value: Any) -> list[str]:
    texts: list[str] = []
    for item in _list_arg(value):
        if isinstance(item, dict):
            text = _string_arg(item.get("text") or item.get("questionText") or item.get("question"))
        else:
            text = _string_arg(item)
        if text:
            texts.append(text[:1000])
    return texts[:20]


def _tool_display_name(tool_name: str) -> str:
    tool = get_tool_definition(tool_name)
    return str(tool.get("displayName") or tool_name) if tool else tool_name


def _active_company(user):
    try:
        return user.get_active_company()
    except Exception:
        return getattr(user, "active_company", None)


def _company_for_scoped_write(request, feature_name: str):
    if getattr(request.user, "role_name", "") == var_sys.ADMIN:
        return None
    company = _active_company(request.user)
    if not company:
        raise AgentAssistantError(f"Bạn cần chọn công ty đang hoạt động trước khi {feature_name}.")
    return company


def _visible_questions_queryset(request):
    queryset = Question.objects.select_related("company", "author").order_by("sort_order", "-create_at", "-id")
    if getattr(request.user, "role_name", "") == var_sys.ADMIN:
        return queryset
    company = _active_company(request.user)
    if not company:
        raise AgentAssistantError("Bạn cần chọn công ty đang hoạt động trước khi dùng ngân hàng câu hỏi.")
    return queryset.filter(Q(company__isnull=True) | Q(company=company))


def _visible_question_groups_queryset(request):
    queryset = (
        QuestionGroup.objects.select_related("company", "author")
        .prefetch_related("questions")
        .order_by("-create_at", "-id")
    )
    if getattr(request.user, "role_name", "") == var_sys.ADMIN:
        return queryset
    company = _active_company(request.user)
    if not company:
        raise AgentAssistantError("Bạn cần chọn công ty đang hoạt động trước khi dùng bộ câu hỏi.")
    return queryset.filter(Q(company__isnull=True) | Q(company=company))


def _select_job_post(user, text: str, parsed_input: dict[str, Any] | None = None):
    company = _active_company(user)
    if not company:
        raise AgentAssistantError("Bạn cần chọn công ty đang hoạt động trước khi dùng agent tuyển dụng.")

    queryset = JobPost.objects.filter(company=company)
    parsed_input = parsed_input or {}

    planned_job_post_id = _coerce_int(parsed_input.get("jobPostId") or parsed_input.get("job_post_id"))
    if planned_job_post_id:
        job_post = queryset.filter(id=planned_job_post_id).first()
        if job_post:
            return job_post

    planned_job_post_name = _string_arg(parsed_input.get("jobPostName") or parsed_input.get("job_post_name"))
    if planned_job_post_name:
        normalized_job_post_name = _normalize_text(planned_job_post_name)
        matches = [
            job_post
            for job_post in queryset
            if normalized_job_post_name in _normalize_text(getattr(job_post, "job_name", ""))
            or _normalize_text(getattr(job_post, "job_name", "")) in normalized_job_post_name
        ]
        if matches:
            return sorted(matches, key=lambda item: len(item.job_name or ""), reverse=True)[0]

    normalized_text = _normalize_text(text)
    id_match = re.search(r"(?:jobpost|job post|job_post|tin|job)\s*(?P<id>\d+)", normalized_text)
    if id_match:
        job_post = queryset.filter(id=int(id_match.group("id"))).first()
        if job_post:
            return job_post

    matches = [
        job_post
        for job_post in queryset
        if _normalize_text(getattr(job_post, "job_name", "")) in normalized_text
    ]
    if matches:
        return sorted(matches, key=lambda item: len(item.job_name or ""), reverse=True)[0]

    if queryset.count() == 1:
        return queryset.first()

    raise AgentAssistantError("Bạn cần nói rõ tin tuyển dụng hoặc vị trí muốn thêm hồ sơ ứng viên.")


class AgentAssistantService:
    @staticmethod
    def tool_registry() -> list[dict[str, Any]]:
        return TOOL_REGISTRY

    @staticmethod
    def create_thread(request, portal: str | None = None) -> AgentThread:
        user = request.user
        user_role = getattr(user, "role_name", "")
        portal = (portal or "").strip()
        valid_portals = {AgentThread.PORTAL_ADMIN, AgentThread.PORTAL_EMPLOYER}
        if portal and portal not in valid_portals:
            raise AgentAssistantError("Portal agent không hợp lệ.")

        if user_role == var_sys.ADMIN:
            if portal == AgentThread.PORTAL_EMPLOYER:
                raise AgentAssistantError("Admin chỉ được tạo thread agent cho portal admin.")
            resolved_portal = AgentThread.PORTAL_ADMIN
        else:
            if portal == AgentThread.PORTAL_ADMIN:
                raise AgentAssistantError("Nhà tuyển dụng không được tạo thread agent cho portal admin.")
            resolved_portal = AgentThread.PORTAL_EMPLOYER

        company = None if resolved_portal == AgentThread.PORTAL_ADMIN else _active_company(user)
        if resolved_portal == AgentThread.PORTAL_EMPLOYER and not company:
            raise AgentAssistantError("Bạn cần chọn công ty đang hoạt động trước khi dùng agent tuyển dụng.")

        return AgentThread.objects.create(
            owner=user,
            company=company,
            portal=resolved_portal,
            title="Agent Assistants",
            last_message_at=timezone.now(),
        )

    @staticmethod
    def thread_queryset(request):
        queryset = AgentThread.objects.filter(owner=request.user)
        user_role = getattr(request.user, "role_name", "")
        if user_role == var_sys.ADMIN:
            return queryset.filter(portal=AgentThread.PORTAL_ADMIN)

        company = _active_company(request.user)
        if company:
            return queryset.filter(portal=AgentThread.PORTAL_EMPLOYER, company=company)
        return queryset.none()

    @staticmethod
    def process_user_message(
        request,
        thread: AgentThread,
        content: str,
        attachments: Any | None = None,
    ) -> AgentRunResult:
        content = (content or "").strip()
        parts = _normalize_agent_attachments(content, attachments)
        if not content and not parts:
            raise AgentAssistantError("Nội dung tin nhắn không được để trống.")

        user_message = AgentMessage.objects.create(
            thread=thread,
            role=AgentMessage.ROLE_USER,
            content=content,
            parts=parts,
        )

        if thread.title == "Agent Assistants":
            thread.title = content[:90] if content else "Đã gửi ảnh"
        thread.last_message_at = timezone.now()
        thread.save(update_fields=["title", "last_message_at", "update_at"])

        planner_unavailable = None
        planned_action = AgentPlanner.plan(request, thread, content, message_parts=parts)
        if isinstance(planned_action, AgentPlannerUnavailable):
            planner_unavailable = planned_action
            planned_action = None
        if planned_action:
            planned_result = AgentAssistantService._run_planned_action(
                request,
                thread,
                user_message,
                content,
                planned_action,
            )
            if planned_result:
                return planned_result

        if _is_create_manual_candidate_intent(content):
            return AgentAssistantService._run_create_manual_candidate(request, thread, user_message, content)
        if _is_search_candidates_intent(content):
            return AgentAssistantService._run_search_candidates(request, thread, user_message, content)
        if _is_update_application_status_intent(content):
            return AgentAssistantService._run_update_application_status(request, thread, user_message, content)
        if _is_create_question_group_intent(content):
            return AgentAssistantService._run_create_question_group(request, thread, user_message, content)
        if _is_create_question_intent(content):
            return AgentAssistantService._run_create_question(request, thread, user_message, content)
        if _is_list_question_groups_intent(content):
            return AgentAssistantService._run_list_question_groups(request, thread, user_message, content)
        if _is_list_questions_intent(content):
            return AgentAssistantService._run_list_questions(request, thread, user_message, content)
        if _is_list_interviews_intent(content):
            return AgentAssistantService._run_list_interviews(request, thread, user_message, content)

        if planner_unavailable:
            assistant_content = (
                "AI engine tạm thời không khả dụng nên tôi chưa thể trả lời câu hỏi tổng quát này. "
                "Các thao tác có quy tắc rõ như tạo hồ sơ, tìm ứng viên hoặc cập nhật trạng thái vẫn có thể xử lý bằng fallback nội bộ."
            )
            return AgentAssistantService._create_text_response(
                thread,
                user_message,
                assistant_content,
                metadata={
                    "plannerUnavailable": {
                        "message": planner_unavailable.message,
                        "attempts": planner_unavailable.attempts,
                    }
                },
            )

        assistant_content = (
            "Tôi chưa xác định được tool phù hợp cho yêu cầu này. "
            "Bạn có thể nói rõ thao tác cần làm, ví dụ: liệt kê tin tuyển dụng, "
            "tìm hồ sơ ứng tuyển, tạo hồ sơ ứng viên, cập nhật pipeline, hoặc duyệt/từ chối tin tuyển dụng."
        )
        return AgentAssistantService._create_text_response(thread, user_message, assistant_content)

    @staticmethod
    def _create_text_response(
        thread: AgentThread,
        user_message: AgentMessage,
        assistant_content: str,
        *,
        metadata: dict[str, Any] | None = None,
    ) -> AgentRunResult:
        assistant_message = AgentMessage.objects.create(
            thread=thread,
            role=AgentMessage.ROLE_ASSISTANT,
            content=assistant_content,
            parts=[{"type": "text", "text": assistant_content}],
            metadata=metadata or {},
        )
        thread.last_message_at = assistant_message.create_at
        thread.save(update_fields=["last_message_at", "update_at"])
        return AgentRunResult(user_message=user_message, assistant_message=assistant_message, tool_calls=[])

    @staticmethod
    def _create_tool_response(
        thread: AgentThread,
        user_message: AgentMessage,
        tool_call: AgentToolCall,
        assistant_content: str,
    ) -> AgentRunResult:
        tool_call.save(update_fields=["status", "error_message", "output_payload", "update_at"])
        assistant_message = AgentMessage.objects.create(
            thread=thread,
            role=AgentMessage.ROLE_ASSISTANT,
            content=assistant_content,
            parts=[
                {
                    "type": "tool",
                    "toolName": tool_call.tool_name,
                    "status": tool_call.status,
                    "input": tool_call.input_payload,
                    "output": tool_call.output_payload,
                    "error": tool_call.error_message,
                },
                {"type": "text", "text": assistant_content},
            ],
        )
        tool_call.message = assistant_message
        tool_call.save(update_fields=["message", "update_at"])
        thread.last_message_at = assistant_message.create_at
        thread.save(update_fields=["last_message_at", "update_at"])
        return AgentRunResult(user_message=user_message, assistant_message=assistant_message, tool_calls=[tool_call])

    @staticmethod
    def _run_tool_executor(
        thread: AgentThread,
        user_message: AgentMessage,
        tool_call: AgentToolCall,
        executor,
    ) -> AgentRunResult:
        try:
            output = executor()
        except AgentAssistantError as exc:
            tool_call.status = AgentToolCall.STATUS_FAILED
            tool_call.error_message = exc.message
            tool_call.output_payload = {"message": exc.message, "details": _json_safe(exc.details)}
            assistant_content = exc.message
        else:
            tool_call.status = AgentToolCall.STATUS_SUCCEEDED
            tool_call.output_payload = output
            assistant_content = output["message"]
        return AgentAssistantService._create_tool_response(thread, user_message, tool_call, assistant_content)

    @staticmethod
    def _run_planned_action(
        request,
        thread: AgentThread,
        user_message: AgentMessage,
        content: str,
        planned_action: AgentPlannedAction,
    ) -> AgentRunResult | None:
        if planned_action.tool_name == RESPOND_TOOL_NAME:
            assistant_content = planned_action.assistant_text or (
                "Tôi có thể hỗ trợ tạo hồ sơ ứng viên, tìm ứng viên và cập nhật pipeline bằng tool nội bộ."
            )
            return AgentAssistantService._create_text_response(
                thread,
                user_message,
                assistant_content,
                metadata={"planner": planned_action.raw_response},
            )

        if planned_action.tool_name == "create_manual_candidate":
            return AgentAssistantService._run_create_manual_candidate(
                request,
                thread,
                user_message,
                content,
                planned_input=planned_action.arguments,
                metadata={"source": "planner", "planner": planned_action.raw_response},
            )
        if planned_action.tool_name == "search_candidates":
            return AgentAssistantService._run_search_candidates(
                request,
                thread,
                user_message,
                content,
                planned_input=planned_action.arguments,
                metadata={"source": "planner", "planner": planned_action.raw_response},
            )
        if planned_action.tool_name == "update_application_status":
            return AgentAssistantService._run_update_application_status(
                request,
                thread,
                user_message,
                content,
                planned_input=planned_action.arguments,
                metadata={"source": "planner", "planner": planned_action.raw_response},
            )
        if planned_action.tool_name == "list_job_posts":
            return AgentAssistantService._run_list_job_posts(
                request,
                thread,
                user_message,
                planned_input=planned_action.arguments,
                metadata={"source": "planner", "planner": planned_action.raw_response},
            )
        if planned_action.tool_name == "list_applications":
            return AgentAssistantService._run_list_applications(
                request,
                thread,
                user_message,
                planned_input=planned_action.arguments,
                metadata={"source": "planner", "planner": planned_action.raw_response},
            )
        if planned_action.tool_name == "list_companies":
            return AgentAssistantService._run_list_companies(
                request,
                thread,
                user_message,
                planned_input=planned_action.arguments,
                metadata={"source": "planner", "planner": planned_action.raw_response},
            )
        if planned_action.tool_name == "review_job_post":
            return AgentAssistantService._run_review_job_post(
                request,
                thread,
                user_message,
                planned_input=planned_action.arguments,
                metadata={"source": "planner", "planner": planned_action.raw_response},
            )
        if planned_action.tool_name == "create_question":
            return AgentAssistantService._run_create_question(
                request,
                thread,
                user_message,
                content,
                planned_input=planned_action.arguments,
                metadata={"source": "planner", "planner": planned_action.raw_response},
            )
        if planned_action.tool_name == "list_questions":
            return AgentAssistantService._run_list_questions(
                request,
                thread,
                user_message,
                content,
                planned_input=planned_action.arguments,
                metadata={"source": "planner", "planner": planned_action.raw_response},
            )
        if planned_action.tool_name == "create_question_group":
            return AgentAssistantService._run_create_question_group(
                request,
                thread,
                user_message,
                content,
                planned_input=planned_action.arguments,
                metadata={"source": "planner", "planner": planned_action.raw_response},
            )
        if planned_action.tool_name == "list_question_groups":
            return AgentAssistantService._run_list_question_groups(
                request,
                thread,
                user_message,
                content,
                planned_input=planned_action.arguments,
                metadata={"source": "planner", "planner": planned_action.raw_response},
            )
        if planned_action.tool_name == "list_interviews":
            return AgentAssistantService._run_list_interviews(
                request,
                thread,
                user_message,
                content,
                planned_input=planned_action.arguments,
                metadata={"source": "planner", "planner": planned_action.raw_response},
            )
        return None

    @staticmethod
    def _run_create_question(
        request,
        thread: AgentThread,
        user_message: AgentMessage,
        content: str,
        planned_input: dict[str, Any] | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> AgentRunResult:
        planned_input = planned_input or {}
        text = _string_arg(
            planned_input.get("text")
            or planned_input.get("questionText")
            or planned_input.get("question")
        ) or _extract_question_text(content)
        difficulty = _coerce_question_difficulty(planned_input.get("difficulty"), default=1)
        category = _coerce_question_category(planned_input.get("category"))
        tool_call = AgentToolCall.objects.create(
            thread=thread,
            tool_name="create_question",
            display_name=_tool_display_name("create_question"),
            status=AgentToolCall.STATUS_RUNNING,
            input_payload={"text": text, "difficulty": difficulty, "category": category},
            metadata=metadata or {},
        )
        return AgentAssistantService._run_tool_executor(
            thread,
            user_message,
            tool_call,
            lambda: AgentAssistantService._create_question(
                request,
                thread,
                text=text,
                difficulty=difficulty,
                category=category,
            ),
        )

    @staticmethod
    def _run_list_questions(
        request,
        thread: AgentThread,
        user_message: AgentMessage,
        content: str,
        planned_input: dict[str, Any] | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> AgentRunResult:
        planned_input = planned_input or {}
        query = _string_arg(planned_input.get("query")) or _extract_search_query(content)
        difficulty = _coerce_int(planned_input.get("difficulty"))
        category = _coerce_question_category(planned_input.get("category")) if planned_input.get("category") else ""
        limit = _coerce_limit(planned_input.get("limit"), default=8)
        tool_call = AgentToolCall.objects.create(
            thread=thread,
            tool_name="list_questions",
            display_name=_tool_display_name("list_questions"),
            status=AgentToolCall.STATUS_RUNNING,
            input_payload={"query": query, "difficulty": difficulty, "category": category, "limit": limit},
            metadata=metadata or {},
        )
        return AgentAssistantService._run_tool_executor(
            thread,
            user_message,
            tool_call,
            lambda: AgentAssistantService._list_questions(
                request,
                query=query,
                difficulty=difficulty,
                category=category,
                limit=limit,
            ),
        )

    @staticmethod
    def _run_create_question_group(
        request,
        thread: AgentThread,
        user_message: AgentMessage,
        content: str,
        planned_input: dict[str, Any] | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> AgentRunResult:
        planned_input = planned_input or {}
        name = _string_arg(planned_input.get("name") or planned_input.get("groupName")) or _extract_question_group_name(content)
        description = _string_arg(planned_input.get("description"))
        question_ids = [
            item
            for item in (_coerce_int(value) for value in _list_arg(planned_input.get("questionIds") or planned_input.get("question_ids")))
            if item
        ]
        question_texts = _question_texts_from_input(
            planned_input.get("questionTexts")
            or planned_input.get("questions")
            or planned_input.get("question_texts")
        )
        difficulty = _coerce_question_difficulty(planned_input.get("difficulty"), default=1)
        category = _coerce_question_category(planned_input.get("category"))
        tool_input = {
            "name": name,
            "description": description,
            "questionIds": question_ids,
            "questionTexts": question_texts,
            "difficulty": difficulty,
            "category": category,
        }
        tool_call = AgentToolCall.objects.create(
            thread=thread,
            tool_name="create_question_group",
            display_name=_tool_display_name("create_question_group"),
            status=AgentToolCall.STATUS_RUNNING,
            input_payload=tool_input,
            metadata=metadata or {},
        )
        return AgentAssistantService._run_tool_executor(
            thread,
            user_message,
            tool_call,
            lambda: AgentAssistantService._create_question_group(
                request,
                thread,
                name=name,
                description=description,
                question_ids=question_ids,
                question_texts=question_texts,
                difficulty=difficulty,
                category=category,
            ),
        )

    @staticmethod
    def _run_list_question_groups(
        request,
        thread: AgentThread,
        user_message: AgentMessage,
        content: str,
        planned_input: dict[str, Any] | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> AgentRunResult:
        planned_input = planned_input or {}
        query = _string_arg(planned_input.get("query")) or _extract_search_query(content)
        limit = _coerce_limit(planned_input.get("limit"), default=8)
        tool_call = AgentToolCall.objects.create(
            thread=thread,
            tool_name="list_question_groups",
            display_name=_tool_display_name("list_question_groups"),
            status=AgentToolCall.STATUS_RUNNING,
            input_payload={"query": query, "limit": limit},
            metadata=metadata or {},
        )
        return AgentAssistantService._run_tool_executor(
            thread,
            user_message,
            tool_call,
            lambda: AgentAssistantService._list_question_groups(request, query=query, limit=limit),
        )

    @staticmethod
    def _run_list_interviews(
        request,
        thread: AgentThread,
        user_message: AgentMessage,
        content: str,
        planned_input: dict[str, Any] | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> AgentRunResult:
        planned_input = planned_input or {}
        query = _string_arg(planned_input.get("query")) or _extract_search_query(content)
        live_only = bool(_coerce_bool(planned_input.get("liveOnly")) or "live" in _normalize_text(content))
        status_filter = _coerce_interview_status(planned_input.get("status"), content)
        limit = _coerce_limit(planned_input.get("limit"), default=8)
        tool_call = AgentToolCall.objects.create(
            thread=thread,
            tool_name="list_interviews",
            display_name=_tool_display_name("list_interviews"),
            status=AgentToolCall.STATUS_RUNNING,
            input_payload={"query": query, "status": status_filter, "liveOnly": live_only, "limit": limit},
            metadata=metadata or {},
        )
        return AgentAssistantService._run_tool_executor(
            thread,
            user_message,
            tool_call,
            lambda: AgentAssistantService._list_interviews(
                request,
                query=query,
                status_filter=status_filter,
                live_only=live_only,
                limit=limit,
            ),
        )

    @staticmethod
    def _run_create_manual_candidate(
        request,
        thread: AgentThread,
        user_message: AgentMessage,
        content: str,
        planned_input: dict[str, Any] | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> AgentRunResult:
        tool_input: dict[str, Any] = {
            "fullName": _extract_candidate_name(content),
            "email": _extract_email(content),
            "phone": _extract_phone(content),
        }
        for key in ("fullName", "email", "phone", "jobPostId", "jobPostName"):
            value = (planned_input or {}).get(key)
            if value not in (None, ""):
                tool_input[key] = value

        tool_call = AgentToolCall.objects.create(
            thread=thread,
            tool_name="create_manual_candidate",
            display_name=_tool_display_name("create_manual_candidate"),
            status=AgentToolCall.STATUS_RUNNING,
            input_payload=tool_input,
            metadata=metadata or {},
        )

        try:
            output = AgentAssistantService._create_manual_candidate(request, thread, content, tool_input)
        except AgentAssistantError as exc:
            tool_call.status = AgentToolCall.STATUS_FAILED
            tool_call.error_message = exc.message
            tool_call.output_payload = {"message": exc.message, "details": _json_safe(exc.details)}
            tool_call.save(update_fields=["status", "error_message", "output_payload", "update_at"])
            assistant_content = exc.message
        else:
            tool_call.status = AgentToolCall.STATUS_SUCCEEDED
            tool_call.output_payload = output
            tool_call.input_payload = {**tool_input, **output.get("input", {})}
            tool_call.save(update_fields=["status", "input_payload", "output_payload", "update_at"])
            assistant_content = output["message"]

        assistant_message = AgentMessage.objects.create(
            thread=thread,
            role=AgentMessage.ROLE_ASSISTANT,
            content=assistant_content,
            parts=[
                {
                    "type": "tool",
                    "toolName": tool_call.tool_name,
                    "status": tool_call.status,
                    "input": tool_call.input_payload,
                    "output": tool_call.output_payload,
                    "error": tool_call.error_message,
                },
                {"type": "text", "text": assistant_content},
            ],
        )
        tool_call.message = assistant_message
        tool_call.save(update_fields=["message", "update_at"])
        thread.last_message_at = assistant_message.create_at
        thread.save(update_fields=["last_message_at", "update_at"])
        return AgentRunResult(user_message=user_message, assistant_message=assistant_message, tool_calls=[tool_call])

    @staticmethod
    def _run_search_candidates(
        request,
        thread: AgentThread,
        user_message: AgentMessage,
        content: str,
        planned_input: dict[str, Any] | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> AgentRunResult:
        planned_input = planned_input or {}
        query = _string_arg(planned_input.get("query")) or _extract_search_query(content)
        limit = _coerce_limit(planned_input.get("limit"), default=5)
        tool_call = AgentToolCall.objects.create(
            thread=thread,
            tool_name="search_candidates",
            display_name=_tool_display_name("search_candidates"),
            status=AgentToolCall.STATUS_RUNNING,
            input_payload={"query": query, "limit": limit},
            metadata=metadata or {},
        )

        try:
            output = AgentAssistantService._search_candidates(query, limit=limit)
        except AgentAssistantError as exc:
            tool_call.status = AgentToolCall.STATUS_FAILED
            tool_call.error_message = exc.message
            tool_call.output_payload = {"message": exc.message, "details": _json_safe(exc.details)}
            assistant_content = exc.message
        else:
            tool_call.status = AgentToolCall.STATUS_SUCCEEDED
            tool_call.output_payload = output
            assistant_content = output["message"]

        tool_call.save(update_fields=["status", "error_message", "output_payload", "update_at"])
        assistant_message = AgentMessage.objects.create(
            thread=thread,
            role=AgentMessage.ROLE_ASSISTANT,
            content=assistant_content,
            parts=[
                {
                    "type": "tool",
                    "toolName": tool_call.tool_name,
                    "status": tool_call.status,
                    "input": tool_call.input_payload,
                    "output": tool_call.output_payload,
                    "error": tool_call.error_message,
                },
                {"type": "text", "text": assistant_content},
            ],
        )
        tool_call.message = assistant_message
        tool_call.save(update_fields=["message", "update_at"])
        thread.last_message_at = assistant_message.create_at
        thread.save(update_fields=["last_message_at", "update_at"])
        return AgentRunResult(user_message=user_message, assistant_message=assistant_message, tool_calls=[tool_call])

    @staticmethod
    def _run_update_application_status(
        request,
        thread: AgentThread,
        user_message: AgentMessage,
        content: str,
        planned_input: dict[str, Any] | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> AgentRunResult:
        planned_input = planned_input or {}
        application_id = _coerce_int(
            planned_input.get("applicationId")
            or planned_input.get("application_id")
            or planned_input.get("id")
        ) or _extract_application_id(content)
        new_status = _resolve_application_status(planned_input.get("status"), content)
        tool_input = {"applicationId": application_id, "status": new_status}
        tool_call = AgentToolCall.objects.create(
            thread=thread,
            tool_name="update_application_status",
            display_name=_tool_display_name("update_application_status"),
            status=AgentToolCall.STATUS_RUNNING,
            input_payload=tool_input,
            metadata=metadata or {},
        )

        try:
            output = AgentAssistantService._update_application_status(request, thread, application_id, new_status)
        except AgentAssistantError as exc:
            tool_call.status = AgentToolCall.STATUS_FAILED
            tool_call.error_message = exc.message
            tool_call.output_payload = {"message": exc.message, "details": _json_safe(exc.details)}
            assistant_content = exc.message
        else:
            tool_call.status = AgentToolCall.STATUS_SUCCEEDED
            tool_call.output_payload = output
            assistant_content = output["message"]

        tool_call.save(update_fields=["status", "error_message", "output_payload", "update_at"])
        assistant_message = AgentMessage.objects.create(
            thread=thread,
            role=AgentMessage.ROLE_ASSISTANT,
            content=assistant_content,
            parts=[
                {
                    "type": "tool",
                    "toolName": tool_call.tool_name,
                    "status": tool_call.status,
                    "input": tool_call.input_payload,
                    "output": tool_call.output_payload,
                    "error": tool_call.error_message,
                },
                {"type": "text", "text": assistant_content},
            ],
        )
        tool_call.message = assistant_message
        tool_call.save(update_fields=["message", "update_at"])
        thread.last_message_at = assistant_message.create_at
        thread.save(update_fields=["last_message_at", "update_at"])
        return AgentRunResult(user_message=user_message, assistant_message=assistant_message, tool_calls=[tool_call])

    @staticmethod
    def _run_list_job_posts(
        request,
        thread: AgentThread,
        user_message: AgentMessage,
        planned_input: dict[str, Any] | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> AgentRunResult:
        planned_input = planned_input or {}
        query = _string_arg(planned_input.get("query"))
        status_filter = _resolve_job_post_status(planned_input.get("status"))
        limit = _coerce_limit(planned_input.get("limit"), default=8)
        tool_call = AgentToolCall.objects.create(
            thread=thread,
            tool_name="list_job_posts",
            display_name=_tool_display_name("list_job_posts"),
            status=AgentToolCall.STATUS_RUNNING,
            input_payload={"query": query, "status": status_filter, "limit": limit},
            metadata=metadata or {},
        )
        try:
            output = AgentAssistantService._list_job_posts(request, query=query, status_filter=status_filter, limit=limit)
        except AgentAssistantError as exc:
            tool_call.status = AgentToolCall.STATUS_FAILED
            tool_call.error_message = exc.message
            tool_call.output_payload = {"message": exc.message, "details": _json_safe(exc.details)}
            assistant_content = exc.message
        else:
            tool_call.status = AgentToolCall.STATUS_SUCCEEDED
            tool_call.output_payload = output
            assistant_content = output["message"]
        return AgentAssistantService._create_tool_response(thread, user_message, tool_call, assistant_content)

    @staticmethod
    def _run_list_applications(
        request,
        thread: AgentThread,
        user_message: AgentMessage,
        planned_input: dict[str, Any] | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> AgentRunResult:
        planned_input = planned_input or {}
        query = _string_arg(planned_input.get("query"))
        status_filter = _resolve_application_status(planned_input.get("status"))
        job_post_id = _coerce_int(planned_input.get("jobPostId") or planned_input.get("job_post_id"))
        limit = _coerce_limit(planned_input.get("limit"), default=8)
        tool_call = AgentToolCall.objects.create(
            thread=thread,
            tool_name="list_applications",
            display_name=_tool_display_name("list_applications"),
            status=AgentToolCall.STATUS_RUNNING,
            input_payload={
                "query": query,
                "status": status_filter,
                "jobPostId": job_post_id,
                "limit": limit,
            },
            metadata=metadata or {},
        )
        try:
            output = AgentAssistantService._list_applications(
                request,
                query=query,
                status_filter=status_filter,
                job_post_id=job_post_id,
                limit=limit,
            )
        except AgentAssistantError as exc:
            tool_call.status = AgentToolCall.STATUS_FAILED
            tool_call.error_message = exc.message
            tool_call.output_payload = {"message": exc.message, "details": _json_safe(exc.details)}
            assistant_content = exc.message
        else:
            tool_call.status = AgentToolCall.STATUS_SUCCEEDED
            tool_call.output_payload = output
            assistant_content = output["message"]
        return AgentAssistantService._create_tool_response(thread, user_message, tool_call, assistant_content)

    @staticmethod
    def _run_list_companies(
        request,
        thread: AgentThread,
        user_message: AgentMessage,
        planned_input: dict[str, Any] | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> AgentRunResult:
        planned_input = planned_input or {}
        query = _string_arg(planned_input.get("query"))
        verified = _coerce_bool(planned_input.get("verified"))
        limit = _coerce_limit(planned_input.get("limit"), default=8)
        tool_call = AgentToolCall.objects.create(
            thread=thread,
            tool_name="list_companies",
            display_name=_tool_display_name("list_companies"),
            status=AgentToolCall.STATUS_RUNNING,
            input_payload={"query": query, "verified": verified, "limit": limit},
            metadata=metadata or {},
        )
        try:
            output = AgentAssistantService._list_companies(
                request,
                query=query,
                verified=verified,
                limit=limit,
            )
        except AgentAssistantError as exc:
            tool_call.status = AgentToolCall.STATUS_FAILED
            tool_call.error_message = exc.message
            tool_call.output_payload = {"message": exc.message, "details": _json_safe(exc.details)}
            assistant_content = exc.message
        else:
            tool_call.status = AgentToolCall.STATUS_SUCCEEDED
            tool_call.output_payload = output
            assistant_content = output["message"]
        return AgentAssistantService._create_tool_response(thread, user_message, tool_call, assistant_content)

    @staticmethod
    def _run_review_job_post(
        request,
        thread: AgentThread,
        user_message: AgentMessage,
        planned_input: dict[str, Any] | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> AgentRunResult:
        planned_input = planned_input or {}
        job_post_id = _coerce_int(planned_input.get("jobPostId") or planned_input.get("job_post_id"))
        action = _normalize_text(_string_arg(planned_input.get("action")))
        tool_call = AgentToolCall.objects.create(
            thread=thread,
            tool_name="review_job_post",
            display_name=_tool_display_name("review_job_post"),
            status=AgentToolCall.STATUS_RUNNING,
            input_payload={"jobPostId": job_post_id, "action": action},
            metadata=metadata or {},
        )
        try:
            output = AgentAssistantService._review_job_post(
                request,
                thread,
                job_post_id=job_post_id,
                action=action,
            )
        except AgentAssistantError as exc:
            tool_call.status = AgentToolCall.STATUS_FAILED
            tool_call.error_message = exc.message
            tool_call.output_payload = {"message": exc.message, "details": _json_safe(exc.details)}
            assistant_content = exc.message
        else:
            tool_call.status = AgentToolCall.STATUS_SUCCEEDED
            tool_call.output_payload = output
            assistant_content = output["message"]
        return AgentAssistantService._create_tool_response(thread, user_message, tool_call, assistant_content)

    @staticmethod
    def _create_manual_candidate(request, thread: AgentThread, content: str, parsed_input: dict[str, Any]) -> dict[str, Any]:
        if getattr(request.user, "role_name", "") == var_sys.ADMIN:
            raise AgentAssistantError("Admin cần chọn ngữ cảnh công ty trước khi tạo hồ sơ ứng viên.")

        full_name = _string_arg(parsed_input.get("fullName"))
        if not full_name:
            raise AgentAssistantError("Bạn vui lòng cung cấp họ tên ứng viên để agent tạo hồ sơ.")

        job_post = _select_job_post(request.user, content, parsed_input)
        candidate_data = {
            "fullName": full_name,
            "title": job_post.job_name,
            "note": "Created by Agent Assistants.",
        }
        email = _string_arg(parsed_input.get("email"))
        phone = _string_arg(parsed_input.get("phone"))
        if email:
            candidate_data["email"] = email
        if phone:
            candidate_data["phone"] = phone

        serializer = EmployerCandidateProfileSerializer(
            data=candidate_data,
            context={"request": request},
        )
        if not serializer.is_valid():
            raise AgentAssistantError(
                "Không thể tạo hồ sơ ứng viên từ nội dung này. Bạn kiểm tra lại tên, email, số điện thoại và tin tuyển dụng.",
                details={"errors": serializer.errors},
            )

        with transaction.atomic():
            candidate_profile = serializer.save()
            activity = JobPostActivity.objects.create(
                job_post=job_post,
                user=None,
                resume=None,
                manual_candidate_profile=candidate_profile,
                full_name=candidate_profile.full_name,
                email=candidate_profile.email,
                phone=candidate_profile.phone,
            )

        record_audit_log(
            request=request,
            action="agent_access",
            instance=activity,
            metadata={
                "agentTool": "create_manual_candidate",
                "agentThreadId": thread.id,
                "manualCandidateProfileId": candidate_profile.id,
            },
        )

        record = {
            "applicationId": activity.id,
            "manualCandidateProfileId": candidate_profile.id,
            "fullName": candidate_profile.full_name,
            "email": candidate_profile.email,
            "phone": candidate_profile.phone,
            "jobPostId": job_post.id,
            "jobPostName": job_post.job_name,
            "url": f"/employer/applied-profiles?applicationId={activity.id}",
        }
        return {
            "message": f"Đã tạo hồ sơ ứng viên {candidate_profile.full_name} cho tin tuyển dụng {job_post.job_name}.",
            "record": record,
            "input": {"jobPostId": job_post.id, "jobPostName": job_post.job_name},
        }

    @staticmethod
    def _search_candidates(query: str, *, limit: int = 5) -> dict[str, Any]:
        if not query:
            raise AgentAssistantError("Bạn cần nhập từ khóa để tìm ứng viên.")

        resumes = (
            Resume.objects.filter(is_active=True, user__role_name=var_sys.JOB_SEEKER)
            .filter(Q(title__icontains=query) | Q(skills_summary__icontains=query) | Q(description__icontains=query))
            .select_related("user")
            .distinct()[:_coerce_limit(limit)]
        )
        results = [
            {
                "userId": resume.user_id,
                "resumeId": resume.id,
                "name": resume.user.full_name,
                "title": resume.title,
                "slug": resume.slug,
                "url": f"/employer/candidates/{resume.slug}",
                "experience": resume.get_experience_display() if hasattr(resume, "get_experience_display") else resume.experience,
                "skills": (resume.skills_summary or "")[:240],
            }
            for resume in resumes
        ]
        if not results:
            return {"message": f"Không tìm thấy ứng viên phù hợp với từ khóa {query}.", "results": []}
        return {"message": f"Tìm thấy {len(results)} ứng viên phù hợp với từ khóa {query}.", "results": results}

    @staticmethod
    def _update_application_status(
        request,
        thread: AgentThread,
        application_id: int | None,
        new_status: int | None,
    ) -> dict[str, Any]:
        if not application_id:
            raise AgentAssistantError("Bạn cần cung cấp ID hồ sơ ứng tuyển cần cập nhật.")
        if not new_status:
            raise AgentAssistantError("Bạn cần nói rõ trạng thái mới của hồ sơ ứng tuyển.")

        company = _active_company(request.user)
        if not company:
            raise AgentAssistantError("Bạn cần chọn công ty đang hoạt động trước khi cập nhật hồ sơ.")

        activity = (
            JobPostActivity.objects.select_related("job_post", "job_post__company")
            .filter(id=application_id, job_post__company=company, is_deleted=False)
            .first()
        )
        if not activity:
            raise AgentAssistantError("Không tìm thấy hồ sơ ứng tuyển thuộc công ty đang hoạt động.")

        previous_status = int(activity.status)
        try:
            activity = JobActivityService.change_application_status(activity, int(new_status))
        except Exception as exc:
            raise AgentAssistantError(f"Không thể cập nhật trạng thái hồ sơ: {exc}") from exc

        record_audit_log(
            request=request,
            action="agent_access",
            instance=activity,
            metadata={
                "agentTool": "update_application_status",
                "agentThreadId": thread.id,
                "previousStatus": previous_status,
                "newStatus": int(activity.status),
            },
        )
        return {
            "message": f"Đã cập nhật trạng thái hồ sơ {activity.id}.",
            "record": {
                "applicationId": activity.id,
                "previousStatus": previous_status,
                "status": int(activity.status),
                "jobPostId": activity.job_post_id,
                "jobPostName": activity.job_post.job_name,
                "url": f"/employer/applied-profiles?applicationId={activity.id}",
            },
        }

    @staticmethod
    def _create_question(
        request,
        thread: AgentThread,
        *,
        text: str,
        difficulty: int = 1,
        category: str = "general",
    ) -> dict[str, Any]:
        text = _string_arg(text)
        if not text:
            raise AgentAssistantError("Bạn cần cung cấp nội dung câu hỏi.")
        company = _company_for_scoped_write(request, "tạo câu hỏi")
        question = Question.objects.create(
            text=text,
            difficulty=_coerce_question_difficulty(difficulty),
            category=_coerce_question_category(category),
            author=request.user,
            company=company,
        )
        record_audit_log(
            request=request,
            action="create",
            instance=question,
            metadata={"agentTool": "create_question", "agentThreadId": thread.id},
        )
        portal_prefix = "/admin/questions" if getattr(request.user, "role_name", "") == var_sys.ADMIN else "/employer/question-bank"
        return {
            "message": "Đã tạo câu hỏi phỏng vấn mới.",
            "record": {
                "questionId": question.id,
                "text": question.text,
                "category": question.category,
                "difficulty": question.difficulty,
                "companyId": question.company_id,
                "url": portal_prefix,
            },
        }

    @staticmethod
    def _list_questions(
        request,
        *,
        query: str = "",
        difficulty: int | None = None,
        category: str = "",
        limit: int = 8,
    ) -> dict[str, Any]:
        queryset = _visible_questions_queryset(request)
        if query:
            queryset = queryset.filter(text__icontains=query)
        if difficulty:
            queryset = queryset.filter(difficulty=_coerce_question_difficulty(difficulty))
        if category:
            queryset = queryset.filter(category=_coerce_question_category(category))
        portal_prefix = "/admin/questions" if getattr(request.user, "role_name", "") == var_sys.ADMIN else "/employer/question-bank"
        records = [
            {
                "questionId": question.id,
                "text": question.text,
                "category": question.category,
                "difficulty": question.difficulty,
                "companyId": question.company_id,
                "companyName": question.company.company_name if question.company_id else "Global",
                "url": portal_prefix,
            }
            for question in queryset[:_coerce_limit(limit, default=8)]
        ]
        return {
            "message": f"Đã tìm thấy {len(records)} câu hỏi.",
            "results": _json_safe(records),
        }

    @staticmethod
    def _create_question_group(
        request,
        thread: AgentThread,
        *,
        name: str,
        description: str = "",
        question_ids: list[int] | None = None,
        question_texts: list[str] | None = None,
        difficulty: int = 1,
        category: str = "general",
    ) -> dict[str, Any]:
        name = _string_arg(name)
        if not name:
            raise AgentAssistantError("Bạn cần cung cấp tên bộ câu hỏi.")
        company = _company_for_scoped_write(request, "tạo bộ câu hỏi")
        question_ids = list(dict.fromkeys(question_ids or []))
        question_texts = _question_texts_from_input(question_texts or [])
        with transaction.atomic():
            group = QuestionGroup.objects.create(
                name=name,
                description=description or "",
                author=request.user,
                company=company,
            )
            questions: list[Question] = []
            if question_ids:
                visible_questions = list(_visible_questions_queryset(request).filter(id__in=question_ids))
                if len(visible_questions) != len(question_ids):
                    raise AgentAssistantError("Một số câu hỏi không tồn tại hoặc không thuộc phạm vi công ty hiện tại.")
                questions.extend(visible_questions)
            for text in question_texts:
                questions.append(
                    Question.objects.create(
                        text=text,
                        difficulty=_coerce_question_difficulty(difficulty),
                        category=_coerce_question_category(category),
                        author=request.user,
                        company=company,
                    )
                )
            if questions:
                group.questions.set(questions)
            record_audit_log(
                request=request,
                action="create",
                instance=group,
                metadata={"agentTool": "create_question_group", "agentThreadId": thread.id},
            )
        portal_prefix = "/admin/question-groups" if getattr(request.user, "role_name", "") == var_sys.ADMIN else "/employer/question-groups"
        return {
            "message": f"Đã tạo bộ câu hỏi {group.name} với {group.questions.count()} câu hỏi.",
            "record": {
                "questionGroupId": group.id,
                "name": group.name,
                "description": group.description or "",
                "questionsCount": group.questions.count(),
                "companyId": group.company_id,
                "url": portal_prefix,
            },
        }

    @staticmethod
    def _list_question_groups(
        request,
        *,
        query: str = "",
        limit: int = 8,
    ) -> dict[str, Any]:
        queryset = _visible_question_groups_queryset(request)
        if query:
            queryset = queryset.filter(Q(name__icontains=query) | Q(description__icontains=query))
        portal_prefix = "/admin/question-groups" if getattr(request.user, "role_name", "") == var_sys.ADMIN else "/employer/question-groups"
        records = [
            {
                "questionGroupId": group.id,
                "name": group.name,
                "description": group.description or "",
                "questionsCount": group.questions.count(),
                "companyId": group.company_id,
                "companyName": group.company.company_name if group.company_id else "Global",
                "url": portal_prefix,
            }
            for group in queryset[:_coerce_limit(limit, default=8)]
        ]
        return {
            "message": f"Đã tìm thấy {len(records)} bộ câu hỏi.",
            "results": _json_safe(records),
        }

    @staticmethod
    def _list_interviews(
        request,
        *,
        query: str = "",
        status_filter: str = "",
        live_only: bool = False,
        limit: int = 8,
    ) -> dict[str, Any]:
        queryset = (
            InterviewSession.objects.select_related("candidate", "job_post", "job_post__company", "created_by")
            .order_by("-update_at", "-create_at")
        )
        is_admin = getattr(request.user, "role_name", "") == var_sys.ADMIN
        if not is_admin:
            company = _active_company(request.user)
            if not company:
                raise AgentAssistantError("Bạn cần chọn công ty đang hoạt động trước khi liệt kê phỏng vấn.")
            queryset = queryset.filter(
                Q(job_post__company=company)
                | Q(question_group__company=company)
                | Q(created_by=request.user)
            ).distinct()
        if live_only:
            queryset = queryset.filter(status__in=["in_progress", "calibration", "processing"])
        elif status_filter:
            queryset = queryset.filter(status=status_filter)
        if query:
            queryset = queryset.filter(
                Q(candidate__full_name__icontains=query)
                | Q(candidate__email__icontains=query)
                | Q(job_post__job_name__icontains=query)
                | Q(room_name__icontains=query)
            )

        records = []
        for session in queryset[:_coerce_limit(limit, default=8)]:
            url = f"/admin/interviews?id={session.id}" if is_admin else f"/employer/interviews/{session.id}"
            records.append(
                {
                    "interviewId": session.id,
                    "candidateName": session.candidate.full_name if session.candidate_id else "",
                    "candidateEmail": session.candidate.email if session.candidate_id else "",
                    "jobPostId": session.job_post_id,
                    "jobPostName": session.job_post.job_name if session.job_post_id else "",
                    "companyId": session.job_post.company_id if session.job_post_id else None,
                    "companyName": session.job_post.company.company_name if session.job_post_id else "",
                    "status": session.status,
                    "statusLabel": _text_choice_label(InterviewSession.STATUS_CHOICES, session.status),
                    "scheduledAt": session.scheduled_at,
                    "startTime": session.start_time,
                    "url": url,
                }
            )
        label = "phỏng vấn live" if live_only else "buổi phỏng vấn"
        return {
            "message": f"Đã tìm thấy {len(records)} {label}.",
            "results": _json_safe(records),
        }

    @staticmethod
    def _list_job_posts(
        request,
        *,
        query: str = "",
        status_filter: int | None = None,
        limit: int = 8,
    ) -> dict[str, Any]:
        queryset = JobPost.objects.select_related("company").order_by("-update_at", "-create_at")
        if getattr(request.user, "role_name", "") != var_sys.ADMIN:
            company = _active_company(request.user)
            if not company:
                raise AgentAssistantError("Bạn cần chọn công ty đang hoạt động trước khi liệt kê tin tuyển dụng.")
            queryset = queryset.filter(company=company)

        if query:
            queryset = queryset.filter(Q(job_name__icontains=query) | Q(company__company_name__icontains=query))
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        records = [
            {
                "jobPostId": job_post.id,
                "jobPostName": job_post.job_name,
                "status": int(job_post.status),
                "statusLabel": _choice_label(var_sys.JOB_POST_STATUS, job_post.status),
                "companyId": job_post.company_id,
                "companyName": job_post.company.company_name if job_post.company_id else "",
                "deadline": job_post.deadline,
                "applicationsCount": job_post.jobpostactivity_set.filter(is_deleted=False).count(),
                "url": f"/employer/jobs/{job_post.id}",
            }
            for job_post in queryset[:_coerce_limit(limit, default=8)]
        ]
        return {
            "message": f"Đã tìm thấy {len(records)} tin tuyển dụng.",
            "results": _json_safe(records),
        }

    @staticmethod
    def _list_applications(
        request,
        *,
        query: str = "",
        status_filter: int | None = None,
        job_post_id: int | None = None,
        limit: int = 8,
    ) -> dict[str, Any]:
        queryset = (
            JobPostActivity.objects.filter(is_deleted=False)
            .select_related("job_post", "job_post__company", "user", "resume", "manual_candidate_profile")
            .order_by("-update_at", "-create_at")
        )
        if getattr(request.user, "role_name", "") != var_sys.ADMIN:
            company = _active_company(request.user)
            if not company:
                raise AgentAssistantError("Bạn cần chọn công ty đang hoạt động trước khi liệt kê hồ sơ ứng tuyển.")
            queryset = queryset.filter(job_post__company=company)

        if job_post_id:
            queryset = queryset.filter(job_post_id=job_post_id)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if query:
            queryset = queryset.filter(
                Q(full_name__icontains=query)
                | Q(email__icontains=query)
                | Q(phone__icontains=query)
                | Q(job_post__job_name__icontains=query)
                | Q(user__full_name__icontains=query)
                | Q(manual_candidate_profile__full_name__icontains=query)
            )

        records = []
        for activity in queryset[:_coerce_limit(limit, default=8)]:
            manual_profile = getattr(activity, "manual_candidate_profile", None)
            user = getattr(activity, "user", None)
            name = activity.full_name or getattr(manual_profile, "full_name", "") or getattr(user, "full_name", "")
            email = activity.email or getattr(manual_profile, "email", "") or getattr(user, "email", "")
            records.append(
                {
                    "applicationId": activity.id,
                    "candidateName": name,
                    "email": email,
                    "phone": activity.phone or getattr(manual_profile, "phone", ""),
                    "status": int(activity.status),
                    "statusLabel": _choice_label(var_sys.APPLICATION_STATUS, activity.status),
                    "jobPostId": activity.job_post_id,
                    "jobPostName": activity.job_post.job_name if activity.job_post_id else "",
                    "companyId": activity.job_post.company_id if activity.job_post_id else None,
                    "companyName": activity.job_post.company.company_name if activity.job_post_id else "",
                    "url": f"/employer/applied-profiles?applicationId={activity.id}",
                }
            )
        return {
            "message": f"Đã tìm thấy {len(records)} hồ sơ ứng tuyển.",
            "results": _json_safe(records),
        }

    @staticmethod
    def _list_companies(
        request,
        *,
        query: str = "",
        verified: bool | None = None,
        limit: int = 8,
    ) -> dict[str, Any]:
        if getattr(request.user, "role_name", "") != var_sys.ADMIN:
            raise AgentAssistantError("Chỉ admin mới được dùng tool liệt kê công ty.")

        queryset = Company.objects.select_related("user").order_by("-update_at", "-create_at")
        if verified is not None:
            queryset = queryset.filter(is_verified=verified)
        if query:
            queryset = queryset.filter(
                Q(company_name__icontains=query)
                | Q(company_email__icontains=query)
                | Q(company_phone__icontains=query)
                | Q(tax_code__icontains=query)
            )

        records = [
            {
                "companyId": company.id,
                "companyName": company.company_name,
                "email": company.company_email,
                "phone": company.company_phone,
                "taxCode": company.tax_code,
                "verified": company.is_verified,
                "ownerId": company.user_id,
                "ownerEmail": company.user.email if company.user_id else "",
                "jobPostsCount": company.job_posts.count(),
                "url": f"/admin/companies?id={company.id}",
            }
            for company in queryset[:_coerce_limit(limit, default=8)]
        ]
        return {
            "message": f"Đã tìm thấy {len(records)} công ty.",
            "results": _json_safe(records),
        }

    @staticmethod
    def _review_job_post(
        request,
        thread: AgentThread,
        *,
        job_post_id: int | None,
        action: str,
    ) -> dict[str, Any]:
        if getattr(request.user, "role_name", "") != var_sys.ADMIN:
            raise AgentAssistantError("Chỉ admin mới được duyệt hoặc từ chối tin tuyển dụng.")
        if not job_post_id:
            raise AgentAssistantError("Bạn cần cung cấp ID tin tuyển dụng.")

        job_post = JobPost.objects.select_related("company").filter(id=job_post_id).first()
        if not job_post:
            raise AgentAssistantError("Không tìm thấy tin tuyển dụng cần review.")

        normalized_action = _normalize_text(action)
        if normalized_action in {"approve", "approved", "duyet", "da duyet"}:
            new_status = var_sys.JobPostStatus.APPROVED
            audit_action = "approve"
        elif normalized_action in {"reject", "rejected", "tu choi", "khong duyet"}:
            new_status = var_sys.JobPostStatus.REJECTED
            audit_action = "reject"
        else:
            raise AgentAssistantError("Action review_job_post chỉ hỗ trợ approve hoặc reject.")

        previous_status = int(job_post.status)
        job_post.status = new_status
        job_post.save(update_fields=["status", "update_at"])
        record_audit_log(
            request=request,
            action=audit_action,
            instance=job_post,
            metadata={"agentTool": "review_job_post", "agentThreadId": thread.id, "previousStatus": previous_status},
        )
        action_label = "duyệt" if audit_action == "approve" else "từ chối"
        return {
            "message": f"Đã {action_label} tin tuyển dụng {job_post.id}.",
            "record": {
                "jobPostId": job_post.id,
                "jobPostName": job_post.job_name,
                "previousStatus": previous_status,
                "status": int(job_post.status),
                "statusLabel": _choice_label(var_sys.JOB_POST_STATUS, job_post.status),
                "companyId": job_post.company_id,
                "companyName": job_post.company.company_name if job_post.company_id else "",
                "url": f"/admin/jobs?id={job_post.id}",
            },
        }
