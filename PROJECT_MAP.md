# PROJECT_MAP.md — Architectural & Technical Map of InfoHR (Square Tuyen Dung)

**Audit Date:** 2026-08-15  
**Mode:** Zero-Assumption / Evidence-Driven Full-Stack Project Audit  
**Audited Target:** `square-tuyen-dung` (Frontend, Backend API, Voice-AI Service, Infrastructure)

---

## 1. Executive Application Architecture

The system is a distributed recruitment and AI-assisted talent evaluation platform consisting of four major runtime tiers:

```
                                  ┌────────────────────────────────────────┐
                                  │           Nginx Edge Gateway           │
                                  │      (Port 80 / 443 / SSL Term)        │
                                  └────┬─────────────────────────────┬─────┘
                                       │                             │
                     ┌─────────────────┴───────────────┐             │
                     ▼                                 ▼             ▼
      ┌─────────────────────────────┐   ┌─────────────────────────────┐   ┌─────────────────────────────┐
      │   Next.js 16 Web Frontend   │   │   Django 4.2 DRF Backend    │   │     LiveKit WebRTC Server   │
      │  (Port 3002 / Node.js 20)   │   │  (Port 8000 / Gunicorn WSGI)│   │  (Port 7880 / 7881 / 7882)  │
      └──────────────┬──────────────┘   └──────────────┬──────────────┘   └──────────────┬──────────────┘
                     │                                 │                                 │
                     │  HTTP /api/v1/ (OAuth2/Bearer)  │                                 │
                     └────────────────────────────────►│◄────────────────────────────────┘
                                                       │   LiveKit Room / Token Exchange
                     ┌─────────────────────────────────┼─────────────────────────────────┐
                     ▼                                 ▼                                 ▼
      ┌─────────────────────────────┐   ┌─────────────────────────────┐   ┌─────────────────────────────┐
      │   PostgreSQL / SQLite DB    │   │  Redis (Broker, Cache, SES) │   │  Celery Worker & Beat Tasks │
      │     (Relational Data Store) │   │  (Sessions, Cache DB 0/1/2) │   │ (Async AI, Email, Ingestion)│
      └─────────────────────────────┘   └──────────────┬──────────────┘   └──────────────┬──────────────┘
                                                       │                                 │
                                                       ▼                                 ▼
                                        ┌─────────────────────────────┐   ┌─────────────────────────────┐
                                        │  Elasticsearch 8.x Cluster  │   │  Local/Cloud LLM & Voice AI │
                                        │ (Job & Candidate Search DSL)│   │ (Ollama/Whisper/Kokoro/VAD) │
                                        └─────────────────────────────┘   └─────────────────────────────┘
```

---

## 2. Technology Stack & Runtime Boundaries

| Component Tier | Core Technologies | Runtime Port / Interface | Deployment Boundary |
| :--- | :--- | :--- | :--- |
| **Web Frontend** | Next.js 16.2.6 (App Router), React 19.2.4, MUI v6.1.1, Tailwind CSS v4.2.1, TanStack Query v5.90, Redux Toolkit v1.9, LiveKit Components React v2.9 | Port `3002` (SSR + Client SPA) | Node.js Container / Standalone Node |
| **Backend API** | Python 3.11/3.12, Django 4.2.30, Django Rest Framework 3.14, OAuth2 Provider (`django-oauth-toolkit` / `drf-social-oauth2`), Celery 5.3, WhiteNoise | Port `8000` (WSGI via Gunicorn) | Python Container (`api/`) |
| **Voice AI Agent** | Python 3.11+, LiveKit Python Agents SDK (`livekit-agents`), Silero VAD, Whisper STT, Kokoro/Ly TTS, OpenAI/Ollama LLM client | Port `8081` / WebRTC Agent | Dedicated Worker Container (`voice-ai/`) |
| **Relational Database** | PostgreSQL 16 (Production) / SQLite3 (Local fallback via `DB_ENGINE` check) | Port `5432` | Docker Postgres (`db`) |
| **In-Memory Cache & Broker** | Redis 7.x (DB 0: Celery Broker, DB 1: Default Cache, DB 2: Sessions, DB 3: API Response Cache) | Port `6379` | Docker Redis (`redis`) |
| **Search Engine** | Elasticsearch 8.11+ via `django-elasticsearch-dsl` | Port `9200` | Docker ES (`elasticsearch`) |
| **Object Storage** | MinIO S3-compatible Object Storage (Buckets: `Project-bucket`, `cv`, `avatar`, `banners`) | Port `9000` (API), `9001` (Console) | Docker MinIO (`minio`) |
| **WebRTC Media Server** | LiveKit Server 1.7+ & LiveKit Egress (for real-time audio/video interview rooms & recording) | Ports `7880` (HTTP), `7881` (TCP), `7882` (UDP) | Docker LiveKit (`livekit`) |
| **Gateway & Reverse Proxy** | Nginx with upstream proxying for `/api/v1/`, `/_next/`, `/livekit/`, `/ws/` | Port `80` / `443` | Docker Nginx (`nginx-gateway`) |

---

## 3. Major Module Directory Map

### 3.1 Backend Application Architecture (`api/`)
* **`config/`**: Django project settings (`settings.py`, `settings_test.py`), URL routers (`urls.py`), custom admin interface (`admin.py`), health checks (`health.py`), rate-limiting throttles (`throttles.py`).
* **`apps/accounts/`**: User identity, RBAC (`ADMIN`, `EMPLOYER`, `HR_MANAGER`, `JOB_SEEKER`), OAuth2 authentication, Firebase login, email verification, password reset workflows.
* **`apps/profiles/`**: Candidate profile management (`JobSeekerProfile`, `Resume`, `ExperienceDetail`, `EducationDetail`, `Certificate`, `Skill`, `Project`), Employer profile (`Company`, `EmployerCandidateProfile`), and Central Data Lake sourcing (`vieclam24h` ingestion).
* **`apps/jobs/`**: Job posts CRUD (`JobPost`), applications (`JobPostActivity`), job notifications (`JobPostNotification`), AI resume scoring (`ai_scoring_service.py`), auto-recruitment pipeline (`auto_pipeline_service.py`), Elasticsearch indexing signals (`signals.py`).
* **`apps/interviews/`**: AI interview orchestration (`InterviewSession`, `QuestionGroup`, `Question`, `InterviewTranscript`, `VoiceProfile`), LiveKit room lifecycle management (`livekit_service.py`), LLM transcript evaluation and scorecard generation (`tasks.py`).
* **`apps/hrm/` (Native HRM Core)**: Complete self-contained HR management (Departments, Designations, Employees, Leave requests, Employment Contracts, Attendance, Org Chart, Candidate-to-Employee onboarding pipeline, and Payroll CSV export).
* **`apps/content/`**: Public portal content (Banners, Feedback testimonials, Handbook/Blog Articles, Contact Messages, Maintenance Mode middleware).
* **`apps/chatbot/` & `apps/agent_assistants/`**: AI conversational assistants for job matching, FAQ answering, and recruiter agent automations.
* **`apps/locations/`**: Geographic catalog (Vietnamese Cities, Districts, Wards, Address Locations).
* **`apps/files/`**: MinIO S3 upload service, presigned URLs, MIME validation, and Cloudinary legacy fallbacks.

### 3.2 Frontend Application Architecture (`frontend/`)
* **`src/app/`**: Next.js App Router root layout (`layout.tsx`), Global styles (`globals.css`), Client root wrapper (`ClientAppRoot.tsx`), and dynamic localized routes.
* **`src/configs/`**: Route definitions (`routeConfig.ts`), localized Vietnamese $\leftrightarrow$ English slug mappings, API endpoints registry (`apiEndpoints.ts`), system constants (`constants.ts`).
* **`src/layouts/`**:
  * `HomeLayout/`: Public portal layout (TopSlide, Navigation, Footer).
  * `JobSeekerLayout/`: Candidate dashboard and application tracking.
  * `EmployerLayout/`: Recruiter portal, applicant Kanban board, interview scheduling.
  * `AdminLayout/`: System administration, user/job moderation, AI voice profile management.
  * `InterviewLayout/`: Immersive LiveKit AI video/voice interview room.
* **`src/views/`**: Feature view implementations across public, candidate, employer, admin, and interview portals.
* **`src/services/`**: API service abstraction layer calling backend endpoints via typed `apiClient` (`authService`, `jobService`, `interviewService`, `profileService`, `hrmService`, etc.).
* **`src/redux/`**: Global client state (User slice, Workspace slice, Theme/UI slice).
* **`src/i18n/`**: Bilingual dictionary resources (`vi`, `en`) across all business domains.

### 3.3 Voice AI Worker (`voice-ai/`)
* **`livekit_agent/`**: Python async worker listening to LiveKit dispatch events, executing real-time VAD voice interaction loops, streaming transcription and speech synthesis.
* **`inference/`**: Local TTS/STT model inference scripts (Kokoro TTS, Whisper STT).

---

## 4. End-to-End Runtime Execution Boundaries

```
[Candidate Browser] ──> HTTPS (Next.js App) ──> Axios /api/v1/ ──> Nginx Gateway
                                                                         │
                                                                         ▼
                                                          Gunicorn (Django WSGI)
                                                                         │
                                                ┌────────────────────────┴────────────────────────┐
                                                ▼                                                 ▼
                                        OAuth2 Auth Middleware                            DRF Controller/View
                                                │                                                 │
                                                ▼                                                 ▼
                                        PostgreSQL / Redis                              Celery Worker Queue
                                                                                                  │
                                                                                                  ▼
                                                                                        AI Scoring & LiveKit
```
