# Design Specification: AI Agent Rules & Governance System (Square Tuyển Dụng / InfoHR)

- **Date**: 2026-09-20
- **Status**: Approved
- **Author**: Antigravity Assistant & Engineering Team
- **Scope**: Whole Repository (`square-tuyen-dung`)

---

## 1. Executive Summary & Goals

Square Tuyển Dụng (InfoHR) is a comprehensive recruitment ecosystem consisting of a Next.js 16 / React 19 frontend, a Django 4.2+ / DRF backend, a LiveKit-powered Voice AI real-time interview engine, S3 MinIO storage, and Docker/Nginx gateway infrastructure.

The goal of this specification is to establish a standardized, hierarchical Agent Rules system adhering to **Antigravity (Google DeepMind)** discovery patterns and the **Open Agentic (`AGENTS.md`)** standard. This ensures that any AI coding assistant (Antigravity, Cursor, Claude Code, GitHub Copilot, Windsurf) working within any part of the repository operates with consistent high quality, zero hallucination, strict adherence to architectural boundaries, and strong security practices.

---

## 2. Architecture & File Distribution

### 2.1 File Map

```text
square-tuyen-dung/
├── AGENTS.md                         # [ROOT] Ecosystem standards, monorepo map, Git & security protocols
├── .cursorrules                      # [ADAPTER] Cursor AI root config pointing to AGENTS.md
├── CLAUDE.md                         # [ADAPTER] Claude Code CLI root config
├── .github/
│   └── copilot-instructions.md       # [ADAPTER] GitHub Copilot repository instructions
├── .windsurfrules                    # [ADAPTER] Windsurf Cascade rules
│
├── frontend/
│   └── AGENTS.md                     # [FRONTEND] Next.js 16, React 19, MUI 6 + Tailwind v4, TanStack Query, Redux
│
├── api/
│   └── AGENTS.md                     # [BACKEND] Django 4.2+, DRF, Celery, MySQL, Redis, Ruff, Pytest
│
└── voice-ai/
    └── AGENTS.md                     # [AI/VOICE] LiveKit WebRTC, Agent Python SDK, STT/TTS pipeline, Egress, S3 MinIO
```

### 2.2 Antigravity Hierarchical Loading Mechanism
- Antigravity automatically scans upwards from the active file's directory to the repository root.
- Working on a frontend file (`frontend/src/app/...`) loads both `frontend/AGENTS.md` (domain specifics) and root `AGENTS.md` (global architecture & rules).
- Working on an API file (`api/apps/...`) loads both `api/AGENTS.md` and root `AGENTS.md`.
- Deduplication prevents repetitive instructions while keeping context windows clean and focused.

---

## 3. Detailed Specifications by Rule File

### 3.1 Root `AGENTS.md` (System Governance & Monorepo Map)
- **Project Overview**: Identity as InfoHR / Square Tuyển Dụng (Smart Recruitment + Real-time Voice AI Interview platform).
- **Service & Subdomain Map**:
  - `infohr.vn` -> Job Seeker portal (`frontend`)
  - `employer.infohr.vn` / `/employer/` -> Employer portal (`frontend`)
  - `admin.infohr.vn` / `/admin/` -> Admin management (`frontend`)
  - `aila.infohr.vn` -> AI Interview Center (`voice-ai` & `frontend`)
  - `hrm.infohr.vn` -> Internal HRM & Payroll (`frontend`)
  - `s3.infohr.vn:4433` -> MinIO S3 Object storage
  - `infohr.vn/api/` & `/swagger/` -> Django REST API backend (`api`)
- **Core Behavioral Directives**:
  - **No Silent Guessing**: When requirements or API contracts are ambiguous, ask or verify in existing code before implementing.
  - **Verification First**: Never claim a task is complete without running verification checks (lint, test, type-check, or build dry-run).
  - **Preserve Documentation**: Do not remove existing docstrings, Vietnamese business comments, or architectural notes unless explicitly asked.
  - **Security Mandate**: Never commit credentials, `.env` values, API keys, or raw secrets to git.
- **Git & Commit Standards**:
  - Conventional Commits: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`, `perf:`, `test:`.
  - Atomic, isolated changes per feature or bugfix.

### 3.2 `frontend/AGENTS.md` (Next.js 16 / React 19 Frontend)
- **Framework & Runtime**: Next.js 16 (App Router), React 19, TypeScript (`strict: true`).
- **Server Components (RSC) vs Client Components**:
  - Server Components by default for all layout and data presentation.
  - `'use client'` strictly restricted to interactive components (event handlers, local state hooks, browser APIs, context consumers).
  - RSC passing children to Client wrappers; never import server-only modules into Client components.
  - Eliminate async waterfalls using `Promise.all()` for concurrent fetches during SSR.
- **Styling Architecture (MUI 6 + Tailwind CSS v4 Coexistence)**:
  - Material UI 6 for core enterprise component widgets, dialogs, complex tables, and date pickers.
  - Tailwind CSS v4 for rapid utility layouts, spacing, flex/grid structures, and typography accents.
  - Styling harmony: Avoid mixing conflicting CSS specificity; prefer Tailwind classes for outer container layout and MUI `sx` only for deep component slot styling.
- **State Management & Data Layer**:
  - Server State: `@tanstack/react-query` v5 for fetching, caching, and mutation invalidation.
  - Client Global State: `@reduxjs/toolkit` reserved for global session, UI modals, and app settings.
  - Forms: `react-hook-form` + `yup` or `zod` for strictly typed validation schemas.
- **Feedback & Notifications**:
  - Use `sonner` for all modern toast notifications.
- **Code Quality & Verification**:
  - Linting: `pnpm run lint` / ESLint flat config (`eslint.config.js`).
  - Unit/Integration: `jest`.
  - E2E: `playwright`.

### 3.3 `api/AGENTS.md` (Django 4.2+ / DRF Backend)
- **Framework & Language**: Python 3.10+, Django 4.2+ LTS, Django REST Framework (DRF).
- **Clean Architecture & Separation of Concerns**:
  - Views / ViewSets: Thin controllers responsible only for HTTP request parsing, permissions, and response serialization.
  - Serializers: Data validation and shape formatting; avoid heavy business logic in `to_representation` or `validate`.
  - Services / Domain Layer (`apps/*/services/`): Pure business logic, external API integrations, calculations, and complex transactions.
- **ORM & Database Performance**:
  - Zero N+1 query tolerance: Mandatory `select_related()` for ForeignKey/OneToOne and `prefetch_related()` for ManyToMany/reverse relations.
  - Queryset efficiency: Use `.exists()` and `.count()` instead of loading objects or calling `len(queryset)`.
  - Indexing: Ensure queries match existing database composite indexes (`firestore.indexes.json` or MySQL indexes).
- **Asynchronous Tasks (Celery & Redis)**:
  - Task idempotency: Every task must be safe to re-run.
  - Timeout and retry: Always specify `bind=True`, `max_retries`, and exponential backoff.
- **Code Style, Quality & Testing**:
  - Tooling: `ruff` (linter & formatter), `mypy` (type safety), `flake8`.
  - Testing: `pytest` with `pytest-django`, adhering to Arrange-Act-Assert pattern.

### 3.4 `voice-ai/AGENTS.md` (Voice AI & Real-Time Interview Engine)
- **Core Stack**: LiveKit Server, LiveKit Agents (Python SDK), WebRTC, Egress recording.
- **Pipeline Stages**:
  - VAD (Voice Activity Detection) -> Real-time STT (Whisper / FPT AI / etc.) -> LLM Streaming (Gemini / Claude / OpenAI) -> TTS synthesis -> WebRTC Audio Track.
- **Latency & Audio Flow Rules**:
  - Streaming first: Stream LLM tokens directly to TTS buffer chunks to minimize Time-to-First-Audio (TTFA < 1000ms target).
  - Interruption handling: Detect user speech during AI speaking turns and gracefully flush output queues via LiveKit Agent cancellation tokens.
- **Egress & MinIO S3 Recording**:
  - Secure room egress upload directly to MinIO S3 buckets with structured naming conventions (`interviews/{candidate_id}/{session_id}.mp4`).

### 3.5 Adapter Files (`.cursorrules`, `CLAUDE.md`, `.github/copilot-instructions.md`, `.windsurfrules`)
- Provide high-efficiency summaries and direct pointer links to root `AGENTS.md` and subsystem rules so developers using any tool get identical guidance.

---

## 4. Verification Plan
1. Check file creation across all specified paths.
2. Verify cross-references between root and subsystem files.
3. Validate Markdown formatting, readability, and link integrity.
4. Ensure all files adhere to the Antigravity naming and location standards.
