# 📐 Coding Guidelines Index

> **Ecosystem**: Square Tuyển Dụng (InfoHR)  
> **Location**: `docs/coding_guidelines/`  
> **Status**: Active Standard

---

## 1. 📌 Overview

This directory contains the engineering standards, protocols, and architectural rules governing development across all subsystems of the InfoHR monorepo. Every developer, contributor, and AI assistant must comply with these guidelines.

---

## 2. 📚 Guidelines Directory

| Document | Focus Area | Key Highlights |
| :--- | :--- | :--- |
| [01_git_branching.md](file:///c:/Users/WIN10/Documents/square-tuyen-dung/docs/coding_guidelines/01_git_branching.md) | Git Branching Strategy | `main` (prod) vs `dev` (staging), `feature/`, `bugfix/`, rebase workflow, PR requirements. |
| [02_git_commit_messages.md](file:///c:/Users/WIN10/Documents/square-tuyen-dung/docs/coding_guidelines/02_git_commit_messages.md) | Commit Message Standards | Conventional Commits 1.0.0, allowed types (`feat`, `fix`, `refactor`), scopes, atomic changes. |
| [03_backend_guidelines.md](file:///c:/Users/WIN10/Documents/square-tuyen-dung/docs/coding_guidelines/03_backend_guidelines.md) | Django & DRF Guidelines | Service Layer pattern, thin views, ORM N+1 query eradication, migration hygiene, Celery rules. |
| [04_frontend_guidelines.md](file:///c:/Users/WIN10/Documents/square-tuyen-dung/docs/coding_guidelines/04_frontend_guidelines.md) | Next.js 16 & React 19 | Server vs Client boundaries, 3-tier state model (URL, TanStack Query, Redux), Tailwind v4, Web Vitals. |
| [05_definition_of_done.md](file:///c:/Users/WIN10/Documents/square-tuyen-dung/docs/coding_guidelines/05_definition_of_done.md) | Definition of Done (DoD) | 7-pillar completion criteria: Code quality, tests, security, performance, contract sync, responsive, docs. |
| [06_clarification_and_question_protocol.md](file:///c:/Users/WIN10/Documents/square-tuyen-dung/docs/coding_guidelines/06_clarification_and_question_protocol.md) | Ambiguity & Inquiry Protocol | Evidence over assumption, 4-step question framework, assumption tracking in `questions.md`. |
| [07_admin_guidelines.md](file:///c:/Users/WIN10/Documents/square-tuyen-dung/docs/coding_guidelines/07_admin_guidelines.md) | Admin Subsystem Standards | Role-Based Access Control (RBAC), audit logging, two-step confirmation for destructive actions, UI density. |

---

## 3. 🔄 Updating These Guidelines

Guidelines are living documents. To propose a change or add a new guideline:
1. Open a discussion or create a feature branch (`docs/update-guidelines`).
2. If the change represents an architectural fork, submit an ADR in `docs/decisions/`.
3. Submit a Pull Request with the rationale for the update.
