from __future__ import annotations

from typing import Any


TOOL_REGISTRY: list[dict[str, Any]] = [
    {
        "name": "create_manual_candidate",
        "displayName": "Create manual candidate",
        "description": "Create a candidate profile and attach it to an employer job post.",
        "category": "recruitment",
        "dangerLevel": "write",
        "inputSchema": {
            "type": "object",
            "required": ["fullName", "jobPostId"],
            "properties": {
                "fullName": {"type": "string"},
                "email": {"type": "string"},
                "phone": {"type": "string"},
                "jobPostId": {"type": "integer"},
                "jobPostName": {"type": "string"},
            },
        },
    },
    {
        "name": "search_candidates",
        "displayName": "Search candidates",
        "description": "Search active candidate resumes using the existing candidate database.",
        "category": "recruitment",
        "dangerLevel": "read",
        "inputSchema": {
            "type": "object",
            "required": ["query"],
            "properties": {"query": {"type": "string"}, "limit": {"type": "integer"}},
        },
    },
    {
        "name": "update_application_status",
        "displayName": "Update application status",
        "description": "Move an application through the allowed recruitment pipeline transitions.",
        "category": "recruitment",
        "dangerLevel": "write",
        "inputSchema": {
            "type": "object",
            "required": ["applicationId", "status"],
            "properties": {"applicationId": {"type": "integer"}, "status": {"type": "integer"}},
        },
    },
    {
        "name": "list_job_posts",
        "displayName": "List job posts",
        "description": "List job posts visible to the current employer company or admin workspace.",
        "category": "recruitment",
        "dangerLevel": "read",
        "inputSchema": {
            "type": "object",
            "properties": {
                "query": {"type": "string"},
                "status": {"type": ["integer", "string"]},
                "limit": {"type": "integer"},
            },
        },
    },
    {
        "name": "list_applications",
        "displayName": "List applications",
        "description": "List candidate applications by job, status, candidate name, email, or phone.",
        "category": "recruitment",
        "dangerLevel": "read",
        "inputSchema": {
            "type": "object",
            "properties": {
                "query": {"type": "string"},
                "status": {"type": ["integer", "string"]},
                "jobPostId": {"type": "integer"},
                "limit": {"type": "integer"},
            },
        },
    },
    {
        "name": "list_companies",
        "displayName": "List companies",
        "description": "Admin-only company lookup by name, email, phone, tax code, or verification status.",
        "category": "admin",
        "dangerLevel": "read",
        "inputSchema": {
            "type": "object",
            "properties": {
                "query": {"type": "string"},
                "verified": {"type": ["boolean", "string"]},
                "limit": {"type": "integer"},
            },
        },
    },
    {
        "name": "review_job_post",
        "displayName": "Review job post",
        "description": "Admin-only action to approve or reject a job post.",
        "category": "admin",
        "dangerLevel": "write",
        "inputSchema": {
            "type": "object",
            "required": ["jobPostId", "action"],
            "properties": {
                "jobPostId": {"type": "integer"},
                "action": {"type": "string", "enum": ["approve", "reject"]},
            },
        },
    },
    {
        "name": "create_question",
        "displayName": "Create interview question",
        "description": "Create a company-scoped interview question in the question bank.",
        "category": "interviews",
        "dangerLevel": "write",
        "inputSchema": {
            "type": "object",
            "required": ["text"],
            "properties": {
                "text": {"type": "string"},
                "category": {
                    "type": "string",
                    "enum": ["general", "technical", "behavioral", "situational", "soft_skills"],
                },
                "difficulty": {"type": "integer", "minimum": 1, "maximum": 3},
            },
        },
    },
    {
        "name": "list_questions",
        "displayName": "List interview questions",
        "description": "Search the visible question bank for the current employer company or admin.",
        "category": "interviews",
        "dangerLevel": "read",
        "inputSchema": {
            "type": "object",
            "properties": {
                "query": {"type": "string"},
                "category": {"type": "string"},
                "difficulty": {"type": "integer"},
                "limit": {"type": "integer"},
            },
        },
    },
    {
        "name": "create_question_group",
        "displayName": "Create question group",
        "description": "Create a question group and optionally create/attach interview questions.",
        "category": "interviews",
        "dangerLevel": "write",
        "inputSchema": {
            "type": "object",
            "required": ["name"],
            "properties": {
                "name": {"type": "string"},
                "description": {"type": "string"},
                "questionIds": {"type": "array", "items": {"type": "integer"}},
                "questionTexts": {"type": "array", "items": {"type": "string"}},
                "category": {"type": "string"},
                "difficulty": {"type": "integer", "minimum": 1, "maximum": 3},
            },
        },
    },
    {
        "name": "list_question_groups",
        "displayName": "List question groups",
        "description": "Search visible interview question groups.",
        "category": "interviews",
        "dangerLevel": "read",
        "inputSchema": {
            "type": "object",
            "properties": {
                "query": {"type": "string"},
                "limit": {"type": "integer"},
            },
        },
    },
    {
        "name": "list_interviews",
        "displayName": "List interviews",
        "description": "List scheduled, live, processing, completed, or cancelled interview sessions.",
        "category": "interviews",
        "dangerLevel": "read",
        "inputSchema": {
            "type": "object",
            "properties": {
                "query": {"type": "string"},
                "status": {"type": "string"},
                "liveOnly": {"type": "boolean"},
                "limit": {"type": "integer"},
            },
        },
    },
    {
        "name": "query_notebook_knowledge",
        "displayName": "Query NotebookLM Knowledge Base",
        "description": "Query company job descriptions, KPIs, HR regulations and evaluation standards directly from Google NotebookLM.",
        "category": "recruitment",
        "dangerLevel": "read",
        "inputSchema": {
            "type": "object",
            "required": ["query"],
            "properties": {
                "query": {"type": "string", "description": "The specific job requirement, KPI, or HR standard question to query."},
                "notebookId": {"type": "string", "description": "Optional NotebookLM ID (uses default if omitted)."},
            },
        },
    },
    {
        "name": "evaluate_cv_with_notebook",
        "displayName": "Evaluate CV against NotebookLM JD",
        "description": "Cross-check candidate CV against exact job description and standards indexed in Google NotebookLM.",
        "category": "recruitment",
        "dangerLevel": "read",
        "inputSchema": {
            "type": "object",
            "required": ["cvContent"],
            "properties": {
                "cvContent": {"type": "string", "description": "Text content or summary of the candidate CV."},
                "jobTitle": {"type": "string", "description": "Target job position title."},
                "notebookId": {"type": "string", "description": "Optional NotebookLM ID."},
            },
        },
    },
]


def get_tool_definition(tool_name: str) -> dict[str, Any] | None:
    for tool in TOOL_REGISTRY:
        if tool["name"] == tool_name:
            return tool
    return None
