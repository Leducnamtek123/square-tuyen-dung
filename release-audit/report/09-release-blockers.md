# STEP 9: Production Release Blockers Report

This document details every critical issue blocking production release with exact line references, root cause, chain gap, and remediation code.

---

## 1. 🚨 BLOCKER 1: Axios Global Mock Fallback Masking Broken APIs

- **File**: [initMock.ts](file:///c:/Users/WIN10/Documents/square-tuyen-dung/frontend/src/mocks/initMock.ts#L105)
- **Root Cause**: `mock.onAny().reply(...)` intercepts all non-defined endpoint requests and returns `200 OK` empty arrays.
- **Chain Break**: `Axios HTTP Client` ➔ `Mock Adapter` (Masks 404 Route Missing).
- **Why It Matters**: Prevents automated integration tests and production client calls from detecting missing backend APIs.
- **Suggested Fix**:
```typescript
// initMock.ts
if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
  // Only mount specific endpoints without fallback
  mock.onGet(/\/common\/configs\/?/).reply(200, { data: mockConfigs });
  // REMOVE mock.onAny()
}
```

---

## 2. 🚨 BLOCKER 2: Optimistic Kanban Drag-and-Drop Without Rollback

- **File**: [AppliedResumeKanban](file:///c:/Users/WIN10/Documents/square-tuyen-dung/frontend/src/views/components/employers/AppliedResumeKanban)
- **Root Cause**: Drag-and-drop state update updates state optimistically without `.catch()` state restoration.
- **Chain Break**: `UI Stage Drop` ➔ `State Mutation` ➔ `API Call Failure` (State desynchronized).
- **Suggested Fix**: Add `onError` callback in `useMutation` to revert candidate to original column state if backend API returns error.

---

## 3. 🚨 BLOCKER 3: Missing Company Claim Endpoint

- **File**: [companyService.ts](file:///c:/Users/WIN10/Documents/square-tuyen-dung/frontend/src/services/companyService.ts)
- **Root Cause**: `claimCompany(id)` invokes `POST /api/v1/info/web/companies/:id/claim/` which has no corresponding route in `api/apps/profiles/urls.py`.
- **Chain Break**: `UI Button` ➔ `Axios` ➔ `Django URL Router (404 Not Found)`.
- **Suggested Fix**: Add `@action(detail=True, methods=['post'])` `claim` view method in `CompanyViewSet`.
