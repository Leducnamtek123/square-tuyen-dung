# 📋 Implementation Plan: MVP Bootstrap (InfoHR Core)

> **Feature Slug**: `2026-10-02-mvp-bootstrap`  
> **Related Spec**: [spec.md](spec.md)  
> **Questions & Decisions**: [questions.md](questions.md)  
> **Target Release**: v1.0.0

---

## 1. 🎯 Executive Strategy

The MVP bootstrap establishes the core monorepo foundation: Docker Compose orchestration, Django REST backend models and services, Next.js 16 frontend App Router portals, LiveKit WebRTC Voice AI pipeline, and S3 media storage.

---

## 2. 🏗️ Phased Task Breakdown

### Phase 1: Infrastructure & Orchestration Foundation
- [x] Configure `docker-compose.yml` with MySQL 8.0, Redis 7, Elasticsearch 7, MinIO S3, and Nginx Gateway.
- [x] Wire healthchecks and volume persistence for all stateful containers.
- [x] Configure Nginx subdomain routing for `infohr.vn`, `employer.infohr.vn`, `admin.infohr.vn`, `aila.infohr.vn`.

### Phase 2: Core Auth & Business Models (Backend)
- [x] Implement multi-role `User` model (`ADMIN`, `EMPLOYER`, `CANDIDATE`, `EMPLOYEE`).
- [x] Implement `Company`, `JobPost`, `Application`, and `InterviewSession` models with migrations.
- [x] Implement JWT authentication endpoints with cross-subdomain cookie support.
- [x] Configure Celery worker and Redis broker for asynchronous background jobs.

### Phase 3: Portals & UI Implementation (Frontend)
- [x] Scaffold Next.js 16 App Router structure with route groups `(job-seeker)`, `employer/`, `admin/`, `hrm/`.
- [x] Integrate Tailwind CSS v4 design system, color tokens, and Shadcn UI components.
- [x] Implement Job Seeker home, search filter, and CV application modal.
- [x] Implement Employer dashboard, job post creator, and candidate evaluation Kanban board.
- [x] Implement Admin portal dashboard with employer approval queue and user moderation.

### Phase 4: Voice AI WebRTC Interview Engine
- [x] Configure LiveKit SFU media server on ports `7880` (HTTP/WS) and `7881`/`7882` (WebRTC).
- [x] Implement LiveKit Agent in Python (`voice-ai/livekit_agent/`) with Vietnamese prompt pipeline.
- [x] Wire STT (`faster-whisper`) and TTS (`VieNeu`) audio bridge.
- [x] Implement frontend interview room view with microphone controls, audio visualizer, and connection telemetry.
- [x] Implement Celery task for automatic PDF scorecard generation and MinIO S3 upload.

### Phase 5: Verification & Production Hardening
- [ ] Run full backend lint & tests (`ruff check .`, `pytest`).
- [ ] Run full frontend lint & build (`pnpm run lint`, `pnpm run build`).
- [ ] Run end-to-end integration test of candidate application -> interview -> scorecard delivery.
- [ ] Verify zero security secrets in git tracking.
