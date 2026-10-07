# 📝 Git Commit Messages Guidelines

> **Ecosystem**: Square Tuyển Dụng (InfoHR)  
> **Standard**: Conventional Commits 1.0.0  
> **Audience**: All Developers & AI Agents

---

## 1. 📌 Format Specification

Every commit message in InfoHR must conform to the **Conventional Commits** standard:

```text
<type>(<scope>): <short imperative description>

[optional body explaining WHY this change was made and technical details]

[optional footer(s): BREAKING CHANGE, Closes #123, Co-authored-by]
```

---

## 2. 🏷️ Allowed Commit Types

| Type | When to Use | Example |
| :--- | :--- | :--- |
| `feat` | Adding a new user-facing or system capability | `feat(voice-ai): add real-time lipsync avatar stream` |
| `fix` | Resolving a bug, crash, or regression | `fix(auth): handle JWT expiry refresh token gracefully` |
| `refactor` | Code restructuring without changing behavior or adding features | `refactor(api): extract application scoring into service layer` |
| `perf` | Optimizations targeting latency, bundle size, or query speed | `perf(frontend): replace lucide icons with phosphor lightweight set` |
| `docs` | Documentation-only changes (markdown, comments, ADRs) | `docs: add ADR 0001 for dual persistence database architecture` |
| `test` | Adding, updating, or fixing unit, integration, or E2E tests | `test(employer): add Playwright E2E test for job post creation` |
| `chore` | Build tasks, dependencies, configs, or maintenance tasks | `chore(deps): update livekit-server to v1.7.2` |
| `style` | Formatting, whitespace, semicolon fixes (no logic impact) | `style: run ruff format on all api/apps modules` |
| `ci` | Changes to CI/CD workflows, Docker configs, or automated checks | `ci(github): add automated pytest and lint workflow` |

---

## 3. 🎯 Standard Monorepo Scopes

Always specify a scope when the change targets a specific subsystem or domain module:

```text
(frontend)       - General frontend code
(api)            - General Django backend code
(voice-ai)       - LiveKit agents, STT/TTS pipeline, talking-head
(gateway)        - Nginx Gateway, SSL, domain routing, WAF
(admin)          - Admin dashboard and moderation
(employer)       - Employer portal, job posting, interview configs
(job-seeker)     - Candidate portal, CV builder, job search
(interviews)     - Interview session management, scoring, WebRTC
(hrm)            - HRM suite, attendance, payroll engine
(monitoring)     - Prometheus, Grafana, Loki, Alertmanager
(infra)          - Docker compose, S3/MinIO, Redis, MySQL configs
```

---

## 4. ✍️ Good vs. Bad Commit Examples

### ✅ Good Commits
```text
feat(voice-ai): stream audio telemetry over LiveKit data channel

Send inbound and outbound WebRTC connection metrics every 2 seconds
to allow the frontend to display connection quality indicators to candidates.
```

```text
fix(api): prevent N+1 query in candidate application listing

Add select_related('candidate', 'job_post') and prefetch_related('scores')
to the ApplicationViewSet queryset. Reduced query count from 42 to 2.
```

```text
refactor(frontend): decouple interview scorecard into isolated component
```

### ❌ Bad Commits (Rejected in Review)
- `fixed bug` *(No type, no scope, vague)*
- `update code` *(Meaningless)*
- `wip` *(Never commit WIP to shared branches)*
- `feat: fixed the login problem and also updated tailwind and docker` *(Violates atomic commit rule)*

---

## 5. 💥 Breaking Changes

Breaking changes MUST be explicitly flagged either by an exclamation mark (`!`) after the type/scope or with a `BREAKING CHANGE:` block in the footer:

```text
feat(api)!: migrate interview session payload from snake_case to camelCase

BREAKING CHANGE: The /api/v1/interviews/session endpoint now returns camelCase keys.
Frontend components must be updated to use the new TypeScript interfaces.
```
