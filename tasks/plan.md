# Implementation Plan: Frontend ↔ Backend API Contract Remediation

## Overview
Decomposes the remediation work for all discovered API contract mismatches, missing endpoints, dead services, and payload misalignments into small, verifiable vertical slices.

## Architecture Decisions
- **Choice-Based Category Endpoint**: Backend will expose `Article.CATEGORY_CHOICES` dynamically under `GET /api/v1/content/web/article-categories/` to maintain parity with the frontend CMS interface without modifying database tables.
- **Service Consolidation**: Deprecate and remove redundant `adminService.ts`, routing all user management requests to `userService.ts`.
- **Payload Dual-Compatibility**: Support both `applicationId` and `job_application_id` on the client adapter layer to eliminate silent param loss.

## Task List

### Phase 1: P0 Fixes (Missing Backend Endpoints)
- [ ] **Task 1**: Implement `GET common/popular-keywords/` in Django backend (`api/common/views.py` & `api/common/urls.py`).
- [ ] **Task 2**: Implement `GET content/web/article-categories/` in Django backend (`api/apps/content/views.py` & `api/apps/content/urls.py`).
- [ ] **Task 3**: Implement `POST content/send-noti-demo/` in Django backend (`api/apps/content/views.py` & `api/apps/content/urls.py`).

### Checkpoint 1: P0 Endpoints Resolved
- [ ] All 3 previously missing endpoints respond with 200 OK without 404s.

### Phase 2: P1 Fixes (Clean Up Dead & Duplicate Services)
- [ ] **Task 4**: Delete `frontend/src/services/adminService.ts` and consolidate unit tests to `userService.test.ts`.
- [ ] **Task 5**: Add env check fallback in `frontend/src/components/Features/VoiceAssistant/utils.ts`.

### Checkpoint 2: P1 Cleanups Verified
- [ ] TypeScript check (`npx tsc --noEmit`) passes cleanly without missing import errors.

### Phase 3: P2 Contract Alignments
- [ ] **Task 6**: Unify `hrmService.onboardCandidate` payload keys to support both `applicationId` and `job_application_id`.
- [ ] **Task 7**: Optimize `commonService.getAllCareers` to use a single large fetch rather than recursive batching.

### Checkpoint 3: Complete & Verified
- [ ] Frontend Jest test suite passes (`npm test -- src/services`).
- [ ] Backend sanity / test suite passes.
