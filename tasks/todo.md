# Tasks: Backend Audit Remediation & Architecture Modernization

## Phase 1: High-Priority Concurrency & Network Safety
- [x] **Task 1: Fix Celery Task Dispatches Inside Atomic Transactions with `transaction.on_commit()`**
  - **Description:** Wrapped all Celery `.delay()` calls in `transaction.atomic()` blocks with `transaction.on_commit()` to eliminate race conditions.
  - **Files:** `api/apps/accounts/services.py`, `api/apps/profiles/serializers_pkg/company_serializers.py`
  - **Verification:** `pytest api/apps/accounts/tests.py api/apps/profiles/tests.py` (121 passed)
- [x] **Task 2: Add Strict Timeouts & Error Handling to Synchronous External HTTP Calls**
  - **Description:** Added explicit `timeout=10` and `requests.RequestException` handling in OAuth views and external resume ingestion.
  - **Files:** `api/apps/accounts/views_oauth.py`, `api/apps/profiles/services/vieclam24h_import.py`
  - **Verification:** `pytest api/apps/accounts/tests.py` (Passed)

### 🔍 Checkpoint 1: Concurrency & Network Safety [PASSED]
- [x] All accounts and profile tests pass without race conditions or unhandled network exceptions.

---

## Phase 2: Architectural Modularization & Separation of Concerns
- [x] **Task 3: Modularize Agent Assistants Architecture & Tool Dispatch Integrity**
  - **Description:** Cleaned up and verified tool execution pathways, natural language intent planners, and MCP bridges.
  - **Files:** `api/apps/agent_assistants/services.py`
  - **Verification:** `pytest api/apps/agent_assistants/tests.py` (25 passed)
- [x] **Task 4: Decouple Privileged FPT GPU SSH Infrastructure Control from AI Proxies**
  - **Description:** Extracted GPU control endpoints into `api/integrations/ai/views_gpu_control.py` and isolated from user AI completions.
  - **Files:** `api/integrations/ai/views.py`, `api/integrations/ai/views_gpu_control.py`, `api/config/urls.py`
  - **Verification:** `pytest api/integrations/ai/tests.py` (24 passed)

### 🔍 Checkpoint 2: Architectural Boundaries [PASSED]
- [x] Infrastructure SSH control is isolated from public AI proxy endpoints.
- [x] All 25 agent assistant tests pass cleanly.
- [x] All 24 AI integration tests pass cleanly.

---

## Phase 3: Performance, Ingestion & Cleanliness
- [x] **Task 5: Implement Safe Atomic Ingestion in Vieclam24h Data Lake Importer**
  - **Description:** Wrapped per-candidate persistence in atomic transactions with explicit fault-isolation boundaries.
  - **Files:** `api/apps/profiles/services/vieclam24h_import.py`
  - **Verification:** `pytest api/apps/profiles/tests/test_vieclam24h_import.py` (Passed)
- [x] **Task 6: Clean Up Defensive Model Imports and Deprecate Legacy Storage Aliases**
  - **Description:** Removed `try/except ImportError` blocks on core models in AI views and modernized `STORAGE_*` configuration.
  - **Files:** `api/integrations/ai/views.py`, `api/config/settings.py`
  - **Verification:** `pytest api/integrations/ai/tests.py` (Passed)

### 🔍 Checkpoint 3: Performance & Code Quality [PASSED]
- [x] Data lake candidate persistence error boundaries verified.
- [x] Clean imports and consolidated storage settings.

---

## Phase 4: Comprehensive System Verification
- [x] **Task 7: Full Test Suite Execution & Production Readiness Sign-Off**
  - **Description:** Executed full pytest suite across all 15 applications and integrations.
  - **Files:** Full test suite verification
  - **Verification:** `pytest` -> **401 passed, 0 failed** across all apps and integrations (100% pass rate).
