# STEP 4: Missing Backend Endpoints & Controllers Report

This document reports all frontend API service calls that fail to map to an active backend route or return 404 / 500 when called.

---

## Missing Backend Services & Controllers

| Frontend API Service | Target API Route | Caller Component | Severity | Issue & Impact |
| :--- | :--- | :--- | :---: | :--- |
| `companyService.claimCompany` | `/api/v1/info/web/companies/:id/claim/` | `CompanyPage` | 🔴 **HIGH** | Candidate/Employer clicking "Claim Company" fails with 404 route missing in `api/apps/profiles/urls.py`. |
| `hrmService.exportPayroll` | `/api/v1/native-hrm/payroll/export/` | `EmployeeListPage` | 🟡 **MEDIUM** | Frontend triggers payroll export, but endpoint is unimplemented in backend DRF router. |
| `interviewService.reconnectSession` | `/api/v1/interview/web/sessions/:id/reconnect/` | `InterviewRoomPage` | 🔴 **HIGH** | If LiveKit socket drops, frontend attempts reconnect API call which has no corresponding controller view. |
