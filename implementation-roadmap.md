# Engineering Implementation Roadmap & Sprint Schedule

> **Role**: Technical Lead  
> **Source Baseline**: Production Release Audit Suite (`release-audit/`)  
> **Target Timeline**: 5 Weekly Sprints  
> **Target Readiness Score**: **100%**

---

## 🗺️ Sprint Master Timeline & Score Progression

```
[Sprint 1: Blockers] ➔ [Sprint 2: Backend] ➔ [Sprint 3: Frontend] ➔ [Sprint 4: UX] ➔ [Sprint 5: Cleanup]
   (74% ➔ 84%)            (84% ➔ 91%)          (91% ➔ 96%)        (96% ➔ 98%)     (98% ➔ 100%)
```

---

## 🏃 Sprint 1: Production Release Blockers (P0)

- **Duration**: 1 Week
- **Focus Area**: Resolve critical P0 bugs blocking core system stability.
- **Affected Modules**: API Gateway Infrastructure, Employer Recruitment Pipeline, Company Verification.
- **Target Release Score**: **74% ➔ 84%** (+10%)

### Work Items

| Task ID | Module | Title | Complexity | Priority | Assignee |
| :--- | :--- | :--- | :---: | :---: | :--- |
| `ENG-P0-001` | Core / Infrastructure | Remove Global Axios Catch-All Mock Fallback in [initMock.ts](file:///c:/Users/WIN10/Documents/square-tuyen-dung/frontend/src/mocks/initMock.ts#L105) | S | P0 | Frontend Lead |
| `ENG-P0-002` | Employer Recruitment | Add Optimistic Rollback for Applied Resume Kanban Drag-and-Drop | M | P0 | Frontend Engineer |
| `ENG-P0-003` | Company Verification | Implement Missing `claimCompany` Action Endpoint in `CompanyViewSet` | M | P0 | Backend Engineer |

---

## 🏃 Sprint 2: Missing Backend Integrations & Resiliency (P1)

- **Duration**: 1 Week
- **Focus Area**: Implement missing backend controllers, presigned URL validations, and stream resiliency.
- **Affected Modules**: Voice AI Interview Subsystem, Employer Candidate Screening.
- **Target Release Score**: **84% ➔ 91%** (+7%)

### Work Items

| Task ID | Module | Title | Complexity | Priority | Assignee |
| :--- | :--- | :--- | :---: | :---: | :--- |
| `ENG-P1-002` | AI Voice Interview | Implement Auto-Reconnect Heartbeat in Voice AI SSE Stream | L | P1 | Fullstack Engineer |
| `ENG-P1-003` | Candidate Screening | Presigned CV Download URL Expiration & Error Feedback | S | P1 | Frontend Engineer |
| `ENG-P1-004` | Company Verification | Add Nullable Tax Code Fallback in Company Verification Serializer | S | P1 | Backend Engineer |

---

## 🏃 Sprint 3: Frontend Integrations & Form Guards (P1)

- **Duration**: 1 Week
- **Focus Area**: Add dirty form navigation guards and missing public UI widgets.
- **Affected Modules**: Employer Job Posts, Candidate Resume Builder, Public Content.
- **Target Release Score**: **91% ➔ 96%** (+5%)

### Work Items

| Task ID | Module | Title | Complexity | Priority | Assignee |
| :--- | :--- | :--- | :---: | :---: | :--- |
| `ENG-P1-001` | Core Forms | Add Unsaved Changes Navigation Guard Hook to `JobPostForm` and `OnlineProfilePage` | M | P1 | Frontend Engineer |
| `ENG-P2-002` | Public Content | Build UI Widget Component for App Download SMS Trigger | S | P1 | Frontend Engineer |

---

## 🏃 Sprint 4: UX Improvements & Native HRM (P2)

- **Duration**: 1 Week
- **Focus Area**: Implement payroll export backend serializer and improve table loading states.
- **Affected Modules**: Native HRM Subsystem, Admin Management.
- **Target Release Score**: **96% ➔ 98%** (+2%)

### Work Items

| Task ID | Module | Title | Complexity | Priority | Assignee |
| :--- | :--- | :--- | :---: | :---: | :--- |
| `ENG-P2-001` | Native HRM | Connect HRM Payroll CSV Export Button to Backend Exporter | M | P2 | Fullstack Engineer |
| `ENG-P2-003` | Admin & Tables | Disable Table Pagination Buttons During Background Re-Fetching | S | P2 | Frontend Engineer |

---

## 🏃 Sprint 5: Cleanup, Refactoring & Production Hardening (P3)

- **Duration**: 1 Week
- **Focus Area**: Remove legacy dual routes, test notification endpoints, and unused callbacks.
- **Affected Modules**: API Router Gateway, Admin Design System.
- **Target Release Score**: **98% ➔ 100%** (+2%)

### Work Items

| Task ID | Module | Title | Complexity | Priority | Assignee |
| :--- | :--- | :--- | :---: | :---: | :--- |
| `ENG-P3-001` | API Gateway | Deprecate Legacy Dual-Routing `/api/` Mirror Block in [config/urls.py](file:///c:/Users/WIN10/Documents/square-tuyen-dung/api/config/urls.py#L63) | S | P3 | Backend Lead |
| `ENG-P3-002` | Admin & Content | Remove Unused `/send-noti-demo/` Endpoint and Clean Up Design System Callbacks | S | P3 | Fullstack Engineer |

---

## 🏁 Final Sign-Off Criteria for Production Release

- [ ] All Sprint 1–5 tasks marked `VERIFIED` and merged to `main`.
- [ ] Automated regression test suite passing with 0 failures.
- [ ] Final Agent 11 Release Confidence Auditor Score reaches **100%**.
