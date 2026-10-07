# 📚 InfoHR Documentation Hub

> **Ecosystem**: Square Tuyển Dụng (InfoHR)  
> **Repository**: Monorepo (`frontend`, `api`, `voice-ai`, `nginx-gateway`)  
> **Status**: Production Standard

---

## 1. 📌 Documentation Architecture

Welcome to the centralized documentation hub for **Square Tuyển Dụng (InfoHR)**. This repository follows a strict, spec-driven documentation hierarchy designed for long-term scalability and clarity for both human engineers and AI coding assistants.

```text
docs/
├── coding_guidelines/                  # 📐 Engineering standards & team conventions
│   ├── 01_git_branching.md             # Git branch model (main, dev, feature/*)
│   ├── 02_git_commit_messages.md       # Conventional Commits 1.0.0
│   ├── 03_backend_guidelines.md        # Django 4.2+, DRF, Service Layer, ORM
│   ├── 04_frontend_guidelines.md       # Next.js 16, React 19, Tailwind v4
│   ├── 05_definition_of_done.md        # 7-pillar DoD checklist
│   ├── 06_clarification_and_question_protocol.md # Ambiguity & questioning process
│   ├── 07_admin_guidelines.md          # Admin portal, RBAC, audit logging
│   └── README.md                       # Coding guidelines index
│
├── decisions/                          # 🏛️ Architecture Decision Records (ADRs)
│   ├── 0001-monorepo-dual-persistence.md # Monorepo & MySQL/ES/MinIO dual persistence
│   ├── 0002-admin-dashboard-stack.md   # Unified Next.js 16 App Router admin stack
│   ├── template.md                     # Blank ADR template
│   └── README.md                       # ADR registry and lifecycle
│
├── features/                           # 🚀 Feature specifications and execution plans
│   ├── _template/                      # Reusable feature template
│   │   ├── spec.md                     # Feature requirements & API contracts
│   │   ├── questions.md                # Questions, assumptions, decision log
│   │   └── plan.md                     # Phased task breakdown
│   ├── 2026-10-02-mvp-bootstrap/       # Foundation MVP feature package
│   │   ├── spec.md
│   │   ├── questions.md
│   │   └── plan.md
│   ├── EXAMPLE_WORKFLOW.md             # End-to-end feature shipping walkthrough
│   └── README.md                       # Feature registry
│
├── progress/                           # 📊 Milestone progress & sprint status
│   └── README.md                       # Progress dashboard & roadmap
│
├── BUSINESS_REQUIREMENTS.md            # 💼 Comprehensive business requirements (BRD)
├── domain.md                           # 🌐 Domain models & ubiquitous language (DDD)
├── MVP.md                              # 🎯 MVP scope, ports, and release criteria
└── README.md                           # 📖 This documentation index
```

---

## 2. 🗺️ Reading Guide by Role

### 👨‍💻 New Backend Developers
1. Read [docs/BUSINESS_REQUIREMENTS.md](file:///c:/Users/WIN10/Documents/square-tuyen-dung/docs/BUSINESS_REQUIREMENTS.md) & [docs/domain.md](file:///c:/Users/WIN10/Documents/square-tuyen-dung/docs/domain.md) to understand core business entities.
2. Read [docs/coding_guidelines/03_backend_guidelines.md](file:///c:/Users/WIN10/Documents/square-tuyen-dung/docs/coding_guidelines/03_backend_guidelines.md) for Django & Service Layer patterns.
3. Review [docs/decisions/0001-monorepo-dual-persistence.md](file:///c:/Users/WIN10/Documents/square-tuyen-dung/docs/decisions/0001-monorepo-dual-persistence.md).

### 🎨 New Frontend Developers
1. Read [docs/coding_guidelines/04_frontend_guidelines.md](file:///c:/Users/WIN10/Documents/square-tuyen-dung/docs/coding_guidelines/04_frontend_guidelines.md) for Next.js 16 App Router & Tailwind v4.
2. Review [docs/decisions/0002-admin-dashboard-stack.md](file:///c:/Users/WIN10/Documents/square-tuyen-dung/docs/decisions/0002-admin-dashboard-stack.md) for subdomain routing conventions.

### 🤖 AI Coding Assistants
1. Adhere strictly to [docs/coding_guidelines/05_definition_of_done.md](file:///c:/Users/WIN10/Documents/square-tuyen-dung/docs/coding_guidelines/05_definition_of_done.md).
2. When requirements are ambiguous, follow [docs/coding_guidelines/06_clarification_and_question_protocol.md](file:///c:/Users/WIN10/Documents/square-tuyen-dung/docs/coding_guidelines/06_clarification_and_question_protocol.md).
3. Record new features under [docs/features/](file:///c:/Users/WIN10/Documents/square-tuyen-dung/docs/features/).

---

## 3. 🔄 How to Propose Documentation Updates

- To update guidelines: Submit a PR updating `docs/coding_guidelines/`.
- To introduce architectural changes: Add a new ADR in `docs/decisions/`.
- To start a feature: Copy `docs/features/_template/` into a new folder.
