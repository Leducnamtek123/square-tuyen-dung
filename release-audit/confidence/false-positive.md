# Agent 11: False Positive Audit Analysis

This document records the evaluation of potential false positive reports in the audit.

---

## False Positive Checks

| Reported Issue | Evaluation | Status | Rationale |
| :--- | :--- | :---: | :--- |
| **Missing Company Claim Route** | Verified against `api/apps/profiles/urls.py` | **VALID FINDING** | No `@action(detail=True, methods=['post'])` claim method exists in `CompanyViewSet`. |
| **Global Mock Adapter Catch-all** | Verified against [initMock.ts:L105](file:///c:/Users/WIN10/Documents/square-tuyen-dung/frontend/src/mocks/initMock.ts#L105) | **VALID FINDING** | `mock.onAny().reply(200, ...)` is actively declared. |
| **Unsaved Form Changes Deficit** | Verified against `JobPostForm` and `OnlineProfilePage` | **VALID FINDING** | Neither component attaches `beforeunload` or router transition blocks. |

**Total False Positives Found**: **0**
