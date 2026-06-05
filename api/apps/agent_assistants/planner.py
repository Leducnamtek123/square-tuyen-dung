from __future__ import annotations

import json
import logging
import re
from dataclasses import dataclass, field
from typing import Any

from django.conf import settings

from integrations.ai import client as ai_client

from .models import AgentThread
from .tool_registry import TOOL_REGISTRY

logger = logging.getLogger(__name__)

RESPOND_TOOL_NAME = "respond"


@dataclass(frozen=True)
class AgentPlannedAction:
    tool_name: str
    arguments: dict[str, Any] = field(default_factory=dict)
    assistant_text: str = ""
    requires_confirmation: bool = False
    raw_response: dict[str, Any] = field(default_factory=dict)


@dataclass(frozen=True)
class AgentPlannerUnavailable:
    message: str
    attempts: list[str] = field(default_factory=list)


def _compact_tool_schema() -> list[dict[str, Any]]:
    return [
        {
            "name": tool["name"],
            "description": tool.get("description", ""),
            "dangerLevel": tool.get("dangerLevel", "read"),
            "inputSchema": tool.get("inputSchema", {}),
        }
        for tool in TOOL_REGISTRY
    ]


def _extract_assistant_content(response_json: dict[str, Any]) -> str:
    try:
        content = response_json["choices"][0]["message"]["content"]
    except (KeyError, IndexError, TypeError):
        return ""
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        parts = []
        for item in content:
            if isinstance(item, dict) and isinstance(item.get("text"), str):
                parts.append(item["text"])
        return "\n".join(parts)
    return ""


def _parse_json_object(value: str) -> dict[str, Any] | None:
    value = (value or "").strip()
    if not value:
        return None

    fenced = re.search(r"```(?:json)?\s*(?P<body>.*?)\s*```", value, flags=re.DOTALL | re.IGNORECASE)
    if fenced:
        value = fenced.group("body")

    if not value.startswith("{"):
        start = value.find("{")
        end = value.rfind("}")
        if start >= 0 and end > start:
            value = value[start : end + 1]

    try:
        parsed = json.loads(value)
    except (TypeError, ValueError):
        return None
    return parsed if isinstance(parsed, dict) else None


def _normalize_tool_name(value: Any) -> str:
    normalized = re.sub(r"[^a-z0-9_]+", "", str(value or "").strip().lower())
    aliases = {
        "createmanualcandidate": "create_manual_candidate",
        "createcandidate": "create_manual_candidate",
        "searchcandidates": "search_candidates",
        "findcandidates": "search_candidates",
        "updateapplicationstatus": "update_application_status",
        "changeapplicationstatus": "update_application_status",
        "listjobposts": "list_job_posts",
        "listjobs": "list_job_posts",
        "listapplications": "list_applications",
        "listcompanies": "list_companies",
        "reviewjobpost": "review_job_post",
        "approvejobpost": "review_job_post",
        "rejectjobpost": "review_job_post",
        "createquestion": "create_question",
        "addquestion": "create_question",
        "listquestions": "list_questions",
        "searchquestions": "list_questions",
        "createquestiongroup": "create_question_group",
        "addquestiongroup": "create_question_group",
        "createquestionset": "create_question_group",
        "listquestiongroups": "list_question_groups",
        "listquestionsets": "list_question_groups",
        "listinterviews": "list_interviews",
        "listliveinterviews": "list_interviews",
        "searchinterviews": "list_interviews",
        "answer": RESPOND_TOOL_NAME,
        "none": RESPOND_TOOL_NAME,
    }
    return aliases.get(normalized, normalized)


def _recent_thread_messages(thread: AgentThread, limit: int = 8) -> list[dict[str, str]]:
    messages = list(thread.messages.order_by("-create_at", "-id")[:limit])
    messages.reverse()
    return [
        {
            "role": "assistant" if message.role == "assistant" else "user",
            "content": (message.content or "")[:1200],
        }
        for message in messages
        if message.role in {"user", "assistant"} and message.content
    ]


class AgentPlanner:
    @staticmethod
    def plan(
        request,
        thread: AgentThread,
        user_content: str,
        *,
        message_parts: list[dict[str, Any]] | None = None,
    ) -> AgentPlannedAction | AgentPlannerUnavailable | None:
        allowed_tools = {tool["name"] for tool in TOOL_REGISTRY}
        allowed_tools.add(RESPOND_TOOL_NAME)
        model = getattr(settings, "AI_AGENT_ASSISTANT_MODEL", "") or getattr(settings, "AI_LLM_MODEL", "")

        system_prompt = (
            "You are Square Agent Assistants, an internal recruiting operations agent. "
            "Choose exactly one action for the newest user message. "
            "Return JSON only, no markdown. "
            "Allowed JSON shape: "
            '{"toolName":"one tool name from the tools list or respond",'
            '"arguments":{},"assistantText":"short Vietnamese response with full diacritics","requiresConfirmation":false}. '
            "Always write assistantText in Vietnamese with full diacritics. "
            "If the user writes Vietnamese without diacritics, still respond with Vietnamese diacritics. "
            "Do not use emoji. "
            "Use a tool when the user asks to create or update real recruiting data. "
            "Use respond only for questions, clarification, or unsupported tasks. "
            "Do not invent IDs. For job posts, prefer jobPostName if the user gives a position name. "
            "For question bank requests, use create_question, list_questions, create_question_group, or list_question_groups. "
            "For live interview or interview schedule requests, use list_interviews; use liveOnly=true for live interviews. "
            "For application status, use integer status when known: "
            "2 contacted, 3 tested, 4 interviewed, 5 hired, 6 not selected. "
            "For interview status use draft, scheduled, calibration, in_progress, processing, completed, cancelled, or interrupted."
        )
        user_context = {
            "portal": thread.portal,
            "companyId": thread.company_id,
            "tools": _compact_tool_schema(),
            "recentMessages": _recent_thread_messages(thread),
            "newestUserMessage": user_content,
        }
        planner_user_content: str | list[dict[str, Any]] = json.dumps(user_context, ensure_ascii=False)
        image_parts = [
            {
                "type": "image_url",
                "image_url": {"url": str(part.get("dataUrl") or "")},
            }
            for part in (message_parts or [])
            if isinstance(part, dict) and part.get("type") == "image" and part.get("dataUrl")
        ]
        if image_parts:
            planner_user_content = [
                {"type": "text", "text": json.dumps(user_context, ensure_ascii=False)},
                *image_parts,
            ]
        payload = {
            "model": model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": planner_user_content},
            ],
            "temperature": 0.1,
            "max_tokens": 900,
        }

        try:
            response_json, candidate = ai_client.post_chat_completion_requests(
                payload,
                default_model=model,
                timeout=(5, 45),
            )
        except ai_client.AIServiceUnavailable as exc:
            logger.info("Agent planner unavailable, falling back to deterministic routing: %s", exc)
            return AgentPlannerUnavailable(message=str(exc), attempts=exc.attempts)
        except Exception as exc:
            logger.info("Agent planner unavailable, falling back to deterministic routing: %s", exc)
            return AgentPlannerUnavailable(message=str(exc), attempts=[])

        parsed = _parse_json_object(_extract_assistant_content(response_json))
        if not parsed:
            logger.info("Agent planner returned malformed content from %s", getattr(candidate, "name", "llm"))
            return None

        tool_name = _normalize_tool_name(parsed.get("toolName") or parsed.get("tool") or parsed.get("action"))
        if tool_name not in allowed_tools:
            return None

        arguments = parsed.get("arguments")
        if not isinstance(arguments, dict):
            arguments = parsed.get("input") if isinstance(parsed.get("input"), dict) else {}

        assistant_text = parsed.get("assistantText") or parsed.get("message") or ""
        return AgentPlannedAction(
            tool_name=tool_name,
            arguments=arguments,
            assistant_text=str(assistant_text or "")[:1200],
            requires_confirmation=bool(parsed.get("requiresConfirmation", False)),
            raw_response={"candidate": getattr(candidate, "name", ""), "parsed": parsed},
        )
