# Implementation Plan: Backend Audit Remediation & Architecture Modernization

## Overview
Comprehensive engineering plan to remediate high-priority findings from the Phase 2 Independent Backend Audit for **Square Tuyển Dụng**. The plan focuses on four core pillars: **Transaction & Concurrency Safety** (`transaction.on_commit` Celery dispatch), **Network Resilience** (non-blocking timeouts on external HTTP), **Architectural Boundary Decoupling** (modularizing the 2,464 LOC Agent Assistants god service & isolating FPT GPU infrastructure SSH control), and **Data Ingestion Performance Optimization** (bulk chunking).

---

## Architecture Decisions

1. **Transaction-Safe Async Dispatch (`transaction.on_commit`)**:
   - Guarantee that all Celery tasks (Firebase auth sync, avatar sync, email dispatch) only trigger **after** the surrounding database transaction successfully commits. This prevents worker race conditions and phantom task executions during transaction rollbacks.
2. **Strict Timeouts & Non-Blocking HTTP Clients**:
   - Protect Gunicorn WSGI request threads by enforcing strict `timeout=10` on all synchronous `requests` calls (OAuth token exchanges, Facebook token revocation, external resume downloads).
3. **Modular Domain Tool Registry for Agent Assistants**:
   - Deconstruct `api/apps/agent_assistants/services.py` (2,464 lines) into a domain-partitioned package `api/apps/agent_assistants/tools/` (`tools_recruitment.py`, `tools_jobs.py`, `tools_interviews.py`, `tools_mcp.py`, `tools_hrm.py`) with a lightweight dispatcher in `services.py`.
4. **Decouple Privileged Infrastructure Control Plane**:
   - Extract FPT Cloud GPU SSH command execution from user-facing AI proxy endpoints in `api/integrations/ai/views.py` into a dedicated admin service `api/integrations/ai/views_gpu_control.py`.
5. **High-Performance Chunked Ingestion**:
   - Wrap candidate data ingestion in `Vieclam24hDataLakeIngestion` with chunked `bulk_create(batch_size=100)` to optimize database performance during large profile imports.

---

## Task List & Phased Execution

### Phase 1: High-Priority Concurrency & Network Safety

#### Task 1: Fix Celery Task Dispatches Inside Atomic Transactions with `transaction.on_commit()`
**Description:** Ensure Celery task dispatches inside `transaction.atomic()` blocks are registered with `transaction.on_commit()` callbacks rather than directly called via `.delay()`.  
**Acceptance Criteria:**
- [ ] Celery task `queue_auth.update_avatar.delay` in `apps/accounts/services.py` runs inside `transaction.on_commit()`.
- [ ] Celery tasks `queue_auth.update_info.delay` and `queue_auth.update_avatar.delay` in `company_serializers.py` run inside `transaction.on_commit()`.
- [ ] No `.delay()` calls are invoked directly within active atomic transactions.  
**Verification:**
- [ ] `pytest api/apps/accounts/tests.py api/apps/profiles/tests.py` (All tests pass)  
**Dependencies:** None  
**Files:**
- `api/apps/accounts/services.py`
- `api/apps/profiles/serializers_pkg/company_serializers.py`  
**Estimated Scope:** S (2 files)

#### Task 2: Add Strict Timeouts & Error Handling to Synchronous External HTTP Calls
**Description:** Add explicit `timeout=10` and structured connection exception handling to all synchronous `requests` calls in request threads.  
**Acceptance Criteria:**
- [ ] `GoogleLoginAPIView` and `FacebookLoginAPIView` in `apps/accounts/views_oauth.py` specify explicit timeouts.
- [ ] Resume download in `apps/profiles/services/vieclam24h_import.py` specifies timeout and catches `requests.RequestException`.  
**Verification:**
- [ ] `pytest api/apps/accounts/tests.py` (All OAuth tests pass)  
**Dependencies:** None  
**Files:**
- `api/apps/accounts/views_oauth.py`
- `api/apps/profiles/services/vieclam24h_import.py`  
**Estimated Scope:** S (2 files)

### Checkpoint 1: Concurrency & Network Safety
- [ ] All accounts and profile tests pass without race condition warnings.
- [ ] No unhandled timeout or uncommitted database reads in Celery workers.

---

### Phase 2: Architectural Modularization & Separation of Concerns

#### Task 3: Modularize Agent Assistants God Service into Domain Tool Registry
**Description:** Refactor `api/apps/agent_assistants/services.py` (2,464 lines) into modular tool packages.  
**Acceptance Criteria:**
- [ ] Create `api/apps/agent_assistants/tools/` sub-package with domain modules:
  - `tools_recruitment.py` (Candidate search, manual profile, application status)
  - `tools_jobs.py` (Job post creation, approval, listing)
  - `tools_interviews.py` (Question generation, group creation, scheduling)
  - `tools_mcp.py` (NotebookLM MCP queries)
- [ ] `services.py` acts as a clean coordinator orchestrating LLM planner actions via the tool registry.
- [ ] All existing 34 tool handlers preserve their signatures and return contracts.  
**Verification:**
- [ ] `pytest api/apps/agent_assistants/tests.py` (All 25 agent tests pass)  
**Dependencies:** None  
**Files:**
- `api/apps/agent_assistants/services.py`
- `api/apps/agent_assistants/tools/__init__.py`
- `api/apps/agent_assistants/tools/tools_recruitment.py`
- `api/apps/agent_assistants/tools/tools_jobs.py`
- `api/apps/agent_assistants/tools/tools_interviews.py`
- `api/apps/agent_assistants/tools/tools_mcp.py`  
**Estimated Scope:** M (6 files)

#### Task 4: Decouple Privileged FPT GPU SSH Infrastructure Control from AI Proxies
**Description:** Separate privileged FPT GPU SSH container control endpoints from user-facing AI chat, TTS, and transcription proxy views in `api/integrations/ai/views.py`.  
**Acceptance Criteria:**
- [ ] Create `api/integrations/ai/views_gpu_control.py` containing `FPTGPUControlStatusAPIView`, `FPTGPUControlActionAPIView`, and SSH bootstrap functions.
- [ ] `api/integrations/ai/views.py` retains user-facing `chat`, `tts`, `transcribe`, and `health` endpoints.
- [ ] URL routing in `api/config/urls.py` correctly connects to the decoupled views with `IsAdminUser` permission enforcement.  
**Verification:**
- [ ] `pytest api/integrations/ai/tests.py` (All AI tests pass)  
**Dependencies:** None  
**Files:**
- `api/integrations/ai/views.py`
- `api/integrations/ai/views_gpu_control.py`
- `api/config/urls.py`  
**Estimated Scope:** S (3 files)

### Checkpoint 2: Architectural Boundaries
- [ ] `apps/agent_assistants/services.py` is under 400 LOC.
- [ ] Infrastructure SSH control is isolated from public AI endpoints.
- [ ] All agent assistant and AI integration tests pass cleanly.

---

### Phase 3: Performance, Ingestion & Cleanliness

#### Task 5: Implement Chunked Batch Ingestion in Vieclam24h Data Lake Importer
**Description:** Optimize `Vieclam24hDataLakeIngestion.ingest_candidates()` with chunked batching.  
**Acceptance Criteria:**
- [ ] Replaces row-by-row `.save()` loops with chunked `bulk_create(batch_size=100, ignore_conflicts=True)` where appropriate.
- [ ] Candidate profile and resume relations maintain relational integrity.  
**Verification:**
- [ ] `pytest api/apps/profiles/tests/test_vieclam24h_import.py` (All import tests pass)  
**Dependencies:** None  
**Files:**
- `api/apps/profiles/services/vieclam24h_import.py`  
**Estimated Scope:** S (1 file)

#### Task 6: Clean Up Defensive Model Imports and Deprecate Legacy Storage Aliases
**Description:** Remove defensive `try/except ImportError` blocks in `integrations/ai/views.py` and standardize storage setting references.  
**Acceptance Criteria:**
- [ ] Remove `try/except ImportError` around standard Django models in `integrations/ai/views.py`.
- [ ] Ensure `STORAGE_BASE_URL` and `STORAGE_DIRECTORIES` are consistently used throughout settings.  
**Verification:**
- [ ] `pytest api/integrations/ai/tests.py` (Exit code 0)  
**Dependencies:** Task 4  
**Files:**
- `api/integrations/ai/views.py`
- `api/config/settings.py`  
**Estimated Scope:** S (2 files)

### Checkpoint 3: Performance & Code Quality
- [ ] Data lake ingestion batching verified with high throughput.
- [ ] No masked import errors or confusing storage aliases.

---

### Phase 4: Comprehensive System Verification

#### Task 7: Full Test Suite Execution & Production Readiness Sign-Off
**Description:** Execute the full backend test suite, verify LiveKit voice agent health, and update audit documentation.  
**Acceptance Criteria:**
- [ ] Full pytest suite passes across all 15 applications.
- [ ] Health check endpoints (`/health/`, `/api/v1/ai/health/`) return HTTP 200 with all services online.
- [ ] Update `docs/backend-audit/score-recalculation.json` and `docs/backend-audit/VERIFICATION-REPORT.md` reflecting verified improvements.  
**Verification:**
- [ ] `pytest` across entire `api/` directory (100% pass)
- [ ] `curl http://localhost:8080/health/` (HTTP 200 OK)  
**Dependencies:** Tasks 1–6  
**Files:**
- `docs/backend-audit/score-recalculation.json`
- `docs/backend-audit/VERIFICATION-REPORT.md`  
**Estimated Scope:** S (2 files)

---

## Risks and Mitigations

| Risk | Impact | Mitigation Strategy |
| :--- | :---: | :--- |
| **Agent Assistant Tool Regressions** | High | Run full `apps/agent_assistants/tests.py` test suite before and after modularizing `services.py` to ensure zero signature or response format changes. |
| **Celery `on_commit` Hook Delay in SQLite Testing** | Low | Django test runner automatically executes `on_commit` callbacks during `TestCase` execution when configured with `django.test.TestCase` or `transaction=True`. |
| **External API Rate Limits during OAuth/AI testing** | Medium | Maintain existing mock fixtures in `integrations/ai/tests.py` for CI runs while testing live endpoints on staging. |

---

## Open Questions
- None. All 15 applications, 118 models, 97 serializers, and 107 viewsets have been mapped and verified.
