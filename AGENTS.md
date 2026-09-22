# 🤖 Square Tuyển Dụng (InfoHR) — Unified Agent Rules & Guidelines

> **Standard**: Open Agentic (`AGENTS.md`) & Antigravity Hierarchical Discovery  
> **Scope**: Root Ecosystem Governance & Monorepo Operations  
> **Applies to**: Antigravity, Cursor, Claude Code, GitHub Copilot, Windsurf, and all AI coding assistants.

---

## ⚡ Critical Rules (Always Follow)

- **NEVER** commit or output raw credentials, `.env` files, or private keys to version control.
- **ALWAYS** inspect existing codebase files before writing code — never invent non-existent models, fields, or endpoints.
- **ALWAYS** run verification commands (lint, test, or build) before claiming completion.
- **NEVER** strip or delete Vietnamese domain explanations, comments, or docstrings.
- **ALWAYS** synchronize TypeScript types in `frontend/src/types/` whenever backend DRF serializers change.
- **ALWAYS** respect subsystem boundaries: consult `frontend/AGENTS.md`, `api/AGENTS.md`, and `voice-ai/AGENTS.md`.

---

## 1. 🌐 System Overview & Ecosystem Map

**Square Tuyển Dụng** (commercial brand **InfoHR**) is a smart recruitment and real-time WebRTC Voice AI interview platform. It operates as a monorepo consisting of a Next.js frontend, a Django REST Framework backend, a Python LiveKit Voice AI agent service, MinIO S3 object storage, and an Nginx Gateway.

### Subdomain & Gateway Routing Map

| Domain / URL | Service / Container | Primary Functionality |
| :--- | :--- | :--- |
| `https://infohr.vn` | `frontend` (Next.js 16) | Job Seeker portal: Search jobs, apply CV, online builder, AI practice |
| `https://employer.infohr.vn` *(or `/employer/`)* | `frontend` (Next.js 16) | Employer portal: Post jobs, manage candidates, interview scripts, evaluation |
| `https://admin.infohr.vn` *(or `/admin/`)* | `frontend` (Next.js 16) | System admin: User permissions, job approvals, system configuration |
| `https://aila.infohr.vn` | `frontend` + `voice-ai` | AI Voice Interview Center: Real-time automated candidate evaluation |
| `https://hrm.infohr.vn` | `frontend` (Next.js 16) | Internal HRM: Employee records, attendance, payroll engine |
| `https://infohr.vn/api/` | `backend` (Django 4.2+) | Core REST API, Auth, Celery workers, MySQL 8, Redis 7, Elasticsearch 7 |
| `https://infohr.vn/swagger/` | `backend` (drf-yasg) | Interactive OpenAPI / Swagger API documentation |
| `https://s3.infohr.vn:4433` | `minio` (S3 API) | Object storage for CVs, candidate avatars, interview audio & video recordings |
| `https://infohr.vn/minio-console/` | `minio-console` | S3 bucket management web interface |

---

## 2. 📁 Monorepo Directory Layout & Hierarchical Rules

The codebase leverages **Hierarchical Rule Discovery**. In addition to this root rule file, specialized rule files govern individual subsystems:

```text
square-tuyen-dung/
├── AGENTS.md                         # [ROOT] This file: Global architecture, security, git & monorepo standards
├── .cursorrules                      # Cursor AI adapter
├── CLAUDE.md                         # Claude Code adapter
├── .github/copilot-instructions.md   # GitHub Copilot adapter
├── .windsurfrules                    # Windsurf adapter
│
├── frontend/                         # Next.js 16, React 19, MUI 6, Tailwind v4, TanStack Query, Redux
│   └── AGENTS.md                     # 📖 Frontend-specific rules & component guidelines
│
├── api/                              # Django 4.2+, DRF, Celery, MySQL 8.0, Redis 7, Elasticsearch 7
│   └── AGENTS.md                     # 📖 Backend-specific rules, ORM optimization & API guidelines
│
├── voice-ai/                         # LiveKit Server, LiveKit Python Agent, WebRTC, STT/TTS pipeline
│   └── AGENTS.md                     # 📖 Voice AI, audio streaming & interview engine guidelines
│
├── nginx-gateway/                    # Reverse proxy, SSL termination, subdomain routing
├── docs/                             # Architecture specifications, audits, and deployment guides
│   ├── ARCHITECTURE.md               # 📖 Master System Architecture Guide & Archify Blueprints
│   └── architecture/                 # 🌐 Interactive Archify HTML & JSON models
└── docker-compose.yml                # Full local & staging orchestration
```

> **Hierarchical Rule Inheritance**: When editing files in `frontend/`, agents MUST adhere to both `frontend/AGENTS.md` and this root `AGENTS.md`. When editing files in `api/`, agents MUST adhere to both `api/AGENTS.md` and this root `AGENTS.md`.

---

## 3. 🎯 Core Behavioral Directives for AI Agents

All AI agents operating in this repository MUST comply with the following 6 core directives:

### 1. Evidence Over Assumption (No Silent Hallucinations)
- Always verify existing implementations before writing new code. Inspect real files, imports, and function signatures.
- If an API response shape, model field, or business logic requirement is ambiguous, check `docs/`, inspect schema files, or ask for clarification. Never invent non-existent endpoints or database columns.

### 2. Verification First (Evidence Before Completion)
- Before concluding any task, verify the changes:
  - For frontend changes: run `pnpm run lint` or `pnpm run build` dry-run.
  - For backend changes: run `ruff check .`, `mypy`, or `pytest`.
  - Check for syntax errors, unresolved imports, and broken typings.

### 3. Non-Destructive Editing & Documentation Integrity
- **Preserve Existing Vietnamese Comments**: The codebase contains valuable Vietnamese domain explanations and docstrings. Do NOT strip or replace them unless explicitly requested.
- Maintain existing architecture patterns (e.g. Service layers in Django, Server Components in Next.js). Do not introduce unnecessary third-party libraries when built-in or existing dependencies suffice.

### 4. Cross-Service Contract Synchronization
- When modifying backend serializers (`api/apps/*/serializers.py`):
  - Check and update corresponding TypeScript interfaces in `frontend/src/types/` or API service callers.
  - Ensure OpenAPI docs (`/swagger/`) reflect the updated payload contracts.

### 5. Strict Security & Secret Hygiene
- **Zero Secrets in Git**: Never commit `.env`, `.env.prod`, private keys (`.pem`, `.key`, `.crt`), MinIO access keys, or API tokens.
- Always use environment variable accessors:
  - Python: `from decouple import config` or `os.getenv`.
  - Next.js: `process.env.VARIABLE` (prefix with `NEXT_PUBLIC_` ONLY if required in browser bundles).

### 6. Atomic, Clean Git Commits
- Follow Conventional Commits:
  - `feat: <feature description>`
  - `fix: <bug description>`
  - `refactor: <refactor description>`
  - `perf: <performance enhancement>`
  - `docs: <documentation updates>`
  - `test: <adding or updating tests>`
  - `chore: <maintenance or dependency update>`
- Keep commits scoped to a single logical change.

---

## 4. 🛠️ Development Environment & Core Commands

### Docker Compose Orchestration

```bash
# Start all core services in background
docker compose up -d

# View real-time logs for a specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f livekit

# Restart a modified service
docker compose restart backend
docker compose restart frontend

# Stop all containers
docker compose down
```

### Frontend Service (`/frontend`)
- **Development**: `pnpm run dev` (starts Next.js on port 3000 with `--webpack`)
- **Build**: `pnpm run build`
- **Lint**: `pnpm run lint`
- **E2E Tests**: `pnpm exec playwright test`

### Backend Service (`/api`)
- **Environment**: Python 3.10+, Django 4.2+
- **Migrations**: `python manage.py makemigrations` && `python manage.py migrate`
- **Run Server (Local)**: `python manage.py runserver 0.0.0.0:8000`
- **Linter & Formatter**: `ruff check .` && `ruff format .`
- **Unit Tests**: `pytest`

### Voice AI Service (`/voice-ai`)
- **Environment**: Python 3.10+, LiveKit Agents
- **Run Agent**: `python -m livekit_agent.main dev`
- **LiveKit Server**: Port `7880` (HTTP/WS), `7881` (TCP WebRTC), `7882` (UDP WebRTC)

---

## 5. 🛡️ Definition of Done (DoD)

A task is considered complete ONLY when:
1. All changes strictly adhere to the respective subsystem `AGENTS.md`.
2. Code passes linting and type checking without new warnings or errors.
3. Relevant tests pass, or new regression tests are added for bug fixes.
4. No sensitive secrets, debug tokens, or temporary files are left behind.
5. All touched files are properly formatted.
