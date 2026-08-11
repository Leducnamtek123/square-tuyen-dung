# STEP 10: Prioritized Engineering Fix Roadmap

This document outlines the prioritized action plan to bring the repository to 100% Release Readiness.

---

## Phase 1: Critical Release Blockers (P0 — Complete Immediately)

1. **Disable Global Mock Fallback in Production**: Clean up `mock.onAny()` in [initMock.ts](file:///c:/Users/WIN10/Documents/square-tuyen-dung/frontend/src/mocks/initMock.ts#L105).
2. **Implement Optimistic Rollback for Kanban**: Add error rollback logic in `AppliedResumeKanban`.
3. **Register Missing Company Claim Endpoint**: Add `@action(detail=True, methods=['post'])` `claim` method to `CompanyViewSet` in backend.

---

## Phase 2: High Priority Hardening (P1 — Complete Before Soft Launch)

1. **Unsaved Form Route Guard**: Add `usePreventUnsavedChanges` hook to `JobPostForm` and `OnlineProfilePage`.
2. **AI Voice Interview SSE Auto-Reconnect**: Add heartbeat retry in `InterviewRoomPage` SSE stream handler.
3. **Clean Up Unused Test Endpoints**: Remove `send_notification_demo` from `api/apps/content/views.py`.

---

## Phase 3: Medium & Low Enhancements (P2/P3 — Post Launch)

1. **Export Payroll Feature**: Connect `exportPayroll` button in `EmployeeListPage` to DRF CSV export serializer.
2. **Design System Demo Placeholders**: Connect or disable demo button handlers in `ComponentsDesignSystemPage.tsx`.
