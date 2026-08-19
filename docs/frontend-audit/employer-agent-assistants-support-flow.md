# Employer AI Agent Assistants, Helpdesk & Legal Architecture

## 1. AILA AI Recruitment Agent Assistant
- **Agent Orchestration & Tool Execution**:
  - `AgentAssistantPage` binds to `/api/v1/agent-assistants/` (`AgentSessionViewSet` and `AgentMessageViewSet`).
  - Powered by multi-step planner (`planner.py`) and tool registry (`tool_registry.py`) enabling automated candidate discovery, JD drafting, and AI interview scheduling via conversational prompts.

## 2. Employer Helpdesk & Support Center
- **Support & Ticket Submission**:
  - `SupportPage` offers categorized troubleshooting for billing, job posting compliance, and AI interview connection setup.
  - Submits structured inquiry leads and bug reports via `contactMessageService` (`POST /api/v1/content/contact-messages/`).

## 3. Employer Legal & Compliance Terms
- **Contractual & Privacy Framework**:
  - `/employer/privacy-policy` and `/employer/terms-of-service` render server-cached, localized terms governing candidate data retention, GDPR/PDPA compliance, and AI evaluation consent.
