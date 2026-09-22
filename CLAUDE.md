# Claude Code Guidelines — Square Tuyển Dụng (InfoHR)

> Single Source of Truth: Consult [AGENTS.md](./AGENTS.md) for full ecosystem architecture and rules.

## Quick Command Reference
- **Frontend (Next.js 16)**:
  - Dev server: `cd frontend && pnpm run dev`
  - Build: `cd frontend && pnpm run build`
  - Lint: `cd frontend && pnpm run lint`
  - Playwright Tests: `cd frontend && pnpm exec playwright test`
- **Backend (Django DRF)**:
  - Dev server: `cd api && python manage.py runserver 0.0.0.0:8000`
  - Migrations: `cd api && python manage.py makemigrations && python manage.py migrate`
  - Linter & Formatter: `cd api && ruff check . && ruff format .`
  - Tests: `cd api && pytest`
- **Docker Compose**:
  - Start stack: `docker compose up -d`
  - Logs: `docker compose logs -f [service_name]`

## Rules & Architecture
1. **Frontend**: Next.js 16 App Router with React 19. Default to React Server Components (RSC). Only use `'use client'` where interactivity or browser APIs are required. Use TanStack Query v5 for server state. Detailed rules in [frontend/AGENTS.md](./frontend/AGENTS.md).
2. **Backend**: Django 4.2+ DRF with MySQL 8. Keep ViewSets thin, isolate business logic in `apps/*/services/`. Enforce zero N+1 queries with `select_related()` and `prefetch_related()`. Detailed rules in [api/AGENTS.md](./api/AGENTS.md).
3. **Voice AI**: LiveKit Agents Python SDK. Streaming pipeline with low-latency LLM & TTS chunking. Detailed rules in [voice-ai/AGENTS.md](./voice-ai/AGENTS.md).
4. **Code Quality**: Run linting and verification before concluding any task. Preserve existing Vietnamese docstrings and domain comments.
