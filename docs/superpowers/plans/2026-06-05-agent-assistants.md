# Agent Assistants Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Twenty-style internal Agent Assistants surface for employer/admin users that can run real system actions, starting with creating manual candidate applications.

**Architecture:** Keep the public floating chatbot as a public/support surface only. Add a new Django app for agent threads, messages, and tool calls, expose DRF endpoints under `/api/v1/agent-assistants/`, and add shared Next.js employer/admin pages with thread list, chat, and tool execution cards.

**Tech Stack:** Django REST Framework, existing Square recruitment models/services, Next.js App Router, React, MUI, existing `httpRequest`.

---

### Task 1: Backend Agent MVP

**Files:**
- Create: `api/apps/agent_assistants/models.py`
- Create: `api/apps/agent_assistants/serializers.py`
- Create: `api/apps/agent_assistants/services.py`
- Create: `api/apps/agent_assistants/views.py`
- Create: `api/apps/agent_assistants/urls.py`
- Create: `api/apps/agent_assistants/tests.py`
- Modify: `api/config/settings.py`
- Modify: `api/config/urls.py`

- [ ] Write failing tests for employer thread creation, real manual candidate creation via agent message, and job seeker rejection.
- [ ] Implement models for thread, message, and tool call with audit-friendly JSON input/output.
- [ ] Implement a deterministic tool runner for `create_manual_candidate` using the same company/job constraints as the manual candidate endpoint.
- [ ] Wire DRF endpoints for listing/creating threads, reading/posting messages, and listing tool metadata.
- [ ] Run `pytest apps/agent_assistants/tests.py -q`.

### Task 2: Frontend Agent Surface

**Files:**
- Create: `frontend/src/services/agentAssistantService.ts`
- Create: `frontend/src/views/agentAssistantPage/index.tsx`
- Create: `frontend/src/app/employer/agent-assistants/page.tsx`
- Create: `frontend/src/app/admin/agent-assistants/page.tsx`
- Modify: `frontend/src/app/ClientAppRoot.tsx`
- Modify: `frontend/src/configs/routeConfig.ts`
- Modify: `frontend/src/layouts/components/employers/Sidebar/EmployerMenu.tsx`
- Modify: `frontend/src/layouts/components/employers/Sidebar/AdminMenu.tsx`
- Modify: `frontend/src/i18n/locales/vi/employer.json`
- Modify: `frontend/src/i18n/locales/en/employer.json`
- Modify: `frontend/src/i18n/locales/vi/admin.json`
- Modify: `frontend/src/i18n/locales/en/admin.json`

- [ ] Hide the public floating chatbot on employer/admin portal paths.
- [ ] Add `agent-assistants` routes and sidebar menu entries.
- [ ] Build shared agent UI with thread list, message pane, tool cards, and input composer.
- [ ] Use `agentAssistantService` for thread/message/tool endpoints.

### Task 3: Verification

- [ ] Run backend agent tests.
- [ ] Run the existing AI tests touched earlier to ensure no regression.
- [ ] Run frontend type/lint check available in the repo.
- [ ] Start or rebuild the app only if verification requires it; report any unavailable checks.

