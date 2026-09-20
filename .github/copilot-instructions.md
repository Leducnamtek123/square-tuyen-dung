# GitHub Copilot Instructions — Square Tuyển Dụng (InfoHR)

This repository follows the **Open Agentic** standard governed by [AGENTS.md](../AGENTS.md). When providing code completions, refactorings, or explanations, adhere strictly to these project conventions:

## 1. Subsystem Architectural Boundaries
- **Frontend (`/frontend`)**:
  - Next.js 16 App Router, React 19, TypeScript (`strict: true`).
  - Prefer React Server Components (RSC) for page data rendering; use `'use client'` strictly for interactive leaf components.
  - UI Styling: Coexistence of Material UI 6 (`@mui/material`) and Tailwind CSS v4. Use Tailwind for layout, spacing, and structural classes; use MUI `sx` only for deep slot customizations.
  - Data Fetching: Use `@tanstack/react-query` v5 for server state caching and mutation.
  - See detailed rules in [frontend/AGENTS.md](../frontend/AGENTS.md).

- **Backend (`/api`)**:
  - Python 3.10+, Django 4.2+ LTS with Django REST Framework (DRF).
  - Clean layered pattern: Thin ViewSets, validation Serializers, decoupled Service layer (`apps/*/services/`).
  - Database optimization: Always eliminate N+1 queries using `select_related()` (for FK/OneToOne) and `prefetch_related()` (for M2M/reverse).
  - Use `.exists()` and `.count()` instead of loading querysets into memory.
  - See detailed rules in [api/AGENTS.md](../api/AGENTS.md).

- **Voice AI (`/voice-ai`)**:
  - Python LiveKit Agent SDK, WebRTC audio streaming, VAD, STT/TTS pipeline, and MinIO S3 recording egress.
  - See detailed rules in [voice-ai/AGENTS.md](../voice-ai/AGENTS.md).

## 2. General Principles
- **No Hallucinations**: Verify field names and method signatures against existing project files before completing code.
- **Vietnamese Language**: Preserve all existing Vietnamese comments and docstrings.
- **Security**: Never expose secrets or hardcoded credentials.
