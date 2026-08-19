# Admin HRM Lifecycle Operations & Final Platform Infrastructure Architecture

## 1. Enterprise Workforce Lifecycle & Contracts
- **Labor Compliance & Digital Onboarding**:
  - `ContractListPage` (`/admin/hrm/contracts`): Manages employment contract lifecycles (Probationary, Definite, Indefinite), renewal alerts, and compensation tiers (`/api/v1/hrm/contracts/`).
  - `LeaveListPage` (`/admin/hrm/leaves`): Administers corporate leave allocations, medical leave requests, and approval matrices (`/api/v1/hrm/leaves/`).
  - `OnboardingPage` (`/admin/hrm/onboarding`): Tracks new-hire documentation workflows and task checklists (`/api/v1/hrm/onboarding/`).

## 2. Platform Resumes & Document Storage
- **Attached CV Archive**:
  - `ResumesPage` (`/admin/resumes`): Centralized document storage and virus scanning archive for all candidate uploaded PDFs and Word resumes (`/api/v1/resumes/`).

## 3. Platform Utilities: Agent Assistants & Component Library
- **Executive AI Agent & Design Showcase**:
  - `AgentAssistantPage` (`/admin/agent-assistants`): High-level operational AI copilot for executive analytics querying.
  - `ComponentsDesignSystemPage` (`/admin/components`): Interactive design system token and component kitchen-sink preview.
