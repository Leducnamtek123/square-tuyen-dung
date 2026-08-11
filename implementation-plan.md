# Comprehensive Engineering Implementation Plan

> **Role**: Technical Lead  
> **Source Baseline**: Production Release Audit Suite (`release-audit/`)  
> **Status**: Approved for Engineering Execution  
> **Target Release Readiness Score**: **100%** (Current: 74%)

---

## 1. Executive Summary & Sprint Master Overview

| Sprint | Focus Area | Duration | Target Release Readiness Score | Primary Deliverables |
| :--- | :--- | :---: | :---: | :--- |
| **Sprint 1** | Production Release Blockers (P0) | 1 Week | **74% → 84%** | Disable mock catch-all, Kanban optimistic rollback, Company claim endpoint |
| **Sprint 2** | Missing Backend Integrations (P1) | 1 Week | **84% → 91%** | Verification upload feedback, SSE reconnect guard, Presigned URL validation |
| **Sprint 3** | Frontend Integrations & Form Guards (P1) | 1 Week | **91% → 96%** | Dirty form unsaved changes hook, App download widget UI |
| **Sprint 4** | UX Improvements & Payroll Export (P2) | 1 Week | **96% → 98%** | HRM Payroll CSV exporter, table pagination re-fetch disabled states |
| **Sprint 5** | Cleanup, Refactoring & Legacy Removal (P3) | 1 Week | **98% → 100%** | Legacy `/api/` route removal, demo notification cleanup, design system handlers |

---

## 2. Detailed Technical Issue Specifications

### Issue ID: `ENG-P0-001`
- **Priority**: P0 (Production Blocker)
- **Title**: Remove Global Axios Mock Adapter Catch-All Response Fallback
- **Root Cause**: `mock.onAny().reply(...)` in [initMock.ts:L105](file:///c:/Users/WIN10/Documents/square-tuyen-dung/frontend/src/mocks/initMock.ts#L105) intercepts all unhandled HTTP requests and returns `200 OK` empty arrays.
- **Business Impact**: Missing backend routes fail silently in staging and production, hiding API 404 failures.
- **User Impact**: Users see blank lists or fake success toasts when interacting with unbuilt features.
- **Affected Modules**: Core / Infrastructure
- **Affected Files**: [frontend/src/mocks/initMock.ts](file:///c:/Users/WIN10/Documents/square-tuyen-dung/frontend/src/mocks/initMock.ts#L105)
- **Dependencies**: None
- **Estimated Complexity**: S (Small)
- **Risk Level**: Critical
- **Technical Design**: Wrap `initMockAdapter` execution inside `process.env.NEXT_PUBLIC_ENABLE_MOCKS === 'true'`. Completely delete `mock.onAny().reply(...)`.
- **Implementation Steps**:
  1. Open `frontend/src/mocks/initMock.ts`.
  2. Delete lines 105-108 containing `mock.onAny()`.
  3. Ensure `initMockAdapter` is guarded by `NEXT_PUBLIC_ENABLE_MOCKS`.
- **Acceptance Criteria**: Any HTTP call to an unhandled backend endpoint MUST return a true HTTP 404 network error.
- **Verification Checklist**:
  - [ ] Trigger an invalid URL `httpRequest.get('/api/v1/invalid-route')`.
  - [ ] Verify Axios throws 404 error instead of returning `[]`.
- **Regression Risks**: Low. Frontend components relying on mock data without `NEXT_PUBLIC_ENABLE_MOCKS=true` will now explicitly fail.
- **Rollback Plan**: Revert git commit on `initMock.ts`.

---

### Issue ID: `ENG-P0-002`
- **Priority**: P0 (Production Blocker)
- **Title**: Add Optimistic Rollback for Applied Resume Kanban Drag-and-Drop
- **Root Cause**: `AppliedResumeKanban` updates card column position in local state without registering an `onError` rollback callback.
- **Business Impact**: Candidates are visually moved to wrong pipeline stages (e.g. "Hired") without backend confirmation.
- **User Impact**: Employers see desynchronized hiring status if network fails during drag-and-drop.
- **Affected Modules**: Employer Recruitment Pipeline
- **Affected Files**: `frontend/src/views/components/employers/AppliedResumeKanban/index.tsx`
- **Dependencies**: `jobPostActivityService.updateStatus`
- **Estimated Complexity**: M (Medium)
- **Risk Level**: High
- **Technical Design**: Save pre-drag column state into a React `useRef`. Pass `onError` context handler to React Query mutation to restore original column position on HTTP failure.
- **Implementation Steps**:
  1. Capture source column index before dispatching status update.
  2. Wrap status update call in React Query `useMutation` with `onMutate`, `onError`, and `onSettled`.
  3. Revert column state in `onError` and display error toast message.
- **Acceptance Criteria**: Dragging a candidate card to a new column when server returns 500 automatically snaps card back to original column.
- **Verification Checklist**:
  - [ ] Mock server 500 error on candidate status patch.
  - [ ] Drag candidate card to "Interview" stage.
  - [ ] Verify card returns to "Applied" column and toast error appears.
- **Regression Risks**: Low. State management restricted to Kanban view.
- **Rollback Plan**: Revert mutation handler changes.

---

### Issue ID: `ENG-P0-003`
- **Priority**: P0 (Production Blocker)
- **Title**: Implement Missing Company Claim Endpoint in DRF Backend ViewSet
- **Root Cause**: `companyService.claimCompany(id)` calls `POST /api/v1/info/web/companies/:id/claim/` which has no corresponding route or view method.
- **Business Impact**: Employers cannot claim existing company profiles.
- **User Impact**: "Claim Company" button returns 404 Not Found error.
- **Affected Modules**: Company Profile & Verification
- **Affected Files**:
  - `api/apps/profiles/views/web_views.py`
  - `api/apps/profiles/urls.py`
  - [frontend/src/services/companyService.ts](file:///c:/Users/WIN10/Documents/square-tuyen-dung/frontend/src/services/companyService.ts)
- **Dependencies**: Django ORM `Company` and `CompanyVerification` models
- **Estimated Complexity**: M (Medium)
- **Risk Level**: High
- **Technical Design**: Add `@action(detail=True, methods=['post'], permission_classes=[IsEmployerUser])` `claim` method to `CompanyViewSet` in `web_views.py`.
- **Implementation Steps**:
  1. Open `api/apps/profiles/views/web_views.py`.
  2. Add `claim` method to `CompanyViewSet`.
  3. Create pending `CompanyVerification` record with request user and target company ID.
  4. Return `201 Created` with verification instance serializer payload.
- **Acceptance Criteria**: Clicking "Claim Company" in frontend creates pending verification record in DB and returns 201 status.
- **Verification Checklist**:
  - [ ] Execute `POST /api/v1/info/web/companies/1/claim/` as authenticated employer.
  - [ ] Verify HTTP response status is 201 Created.
  - [ ] Check DB table `profiles_companyverification` for new row.
- **Regression Risks**: Low. Isolated new action method.
- **Rollback Plan**: Remove `@action` method from `CompanyViewSet`.

---

### Issue ID: `ENG-P1-001`
- **Priority**: P1 (Pre-launch Hardening)
- **Title**: Add Unsaved Changes Navigation Guard Hook to Core Creation Forms
- **Root Cause**: `JobPostForm` and `OnlineProfilePage` do not hook into browser `beforeunload` or Next.js router transition events.
- **Business Impact**: Users lose unsaved draft data when accidentally navigating away.
- **User Impact**: Frustration due to lost form input.
- **Affected Modules**: Employer Job Posts, Candidate Profile Builder
- **Affected Files**:
  - `frontend/src/hooks/usePreventUnsavedChanges.ts`
  - `frontend/src/views/components/employers/JobPostForm/index.tsx`
  - `frontend/src/views/jobSeekerPages/OnlineProfilePage/index.tsx`
- **Dependencies**: React Hook Form / Formik `isDirty` state
- **Estimated Complexity**: M (Medium)
- **Risk Level**: Medium
- **Technical Design**: Create `usePreventUnsavedChanges(isDirty)` custom hook attaching `window.addEventListener('beforeunload')` and intercepting Next.js router changes.
- **Implementation Steps**:
  1. Create `usePreventUnsavedChanges.ts` under `frontend/src/hooks/`.
  2. Import hook into `JobPostForm` and `OnlineProfilePage`.
  3. Pass `formState.isDirty` boolean to hook.
- **Acceptance Criteria**: Navigating away from dirty form shows standard browser confirmation dialog.
- **Verification Checklist**:
  - [ ] Type text into job post title field.
  - [ ] Click sidebar link to navigate away.
  - [ ] Confirm unsaved changes warning dialog appears.
- **Regression Risks**: Low.
- **Rollback Plan**: Remove hook invocation from components.

---

### Issue ID: `ENG-P1-002`
- **Priority**: P1 (Pre-launch Hardening)
- **Title**: Implement Auto-Reconnect Heartbeat in AI Voice Interview SSE Stream
- **Root Cause**: `InterviewRoomPage` does not implement automatic retry reconnection if the SSE `EventSource` stream encounters network dropouts.
- **Business Impact**: Interrupted voice interview sessions fail without recovering, leading to candidate abandonment.
- **User Impact**: Candidate gets stuck in interview room with frozen voice questions.
- **Affected Modules**: Voice AI Interview Subsystem
- **Affected Files**:
  - `frontend/src/views/jobSeekerPages/InterviewRoomPage/index.tsx`
  - `api/apps/interviews/sse_views.py`
- **Dependencies**: EventSource API, LiveKit WebRTC Session
- **Estimated Complexity**: L (Large)
- **Risk Level**: High
- **Technical Design**: Add exponential backoff reconnect logic to `EventSource.onerror` handler in `InterviewRoomPage` with maximum 5 retry attempts.
- **Implementation Steps**:
  1. Attach `onerror` listener to SSE EventSource instance.
  2. Trigger reconnect timer with backoff delay (1s, 2s, 4s, 8s).
  3. Re-establish connection with `session_id` and last event ID header.
- **Acceptance Criteria**: Disconnecting network for 3 seconds during interview auto-reconnects SSE stream without refreshing page.
- **Verification Checklist**:
  - [ ] Start AI Voice Interview session.
  - [ ] Toggle network offline for 3s then online.
  - [ ] Verify SSE stream resumes question flow seamlessly.
- **Regression Risks**: Medium. SSE stream state synchronization must be validated.
- **Rollback Plan**: Revert SSE handler to single connection.
