# HRM Suite Enterprise Enhancement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement full-lifecycle Enterprise HRM capabilities including Leave Balance Quota Management, Vietnam-compliant Payroll UI & Payslips with Employer Cost breakdown, Monthly Timesheet Grid, Contract Renewal workflow, and Employee Self-Service (ESS).

**Architecture:** 
- Backend: Django REST Framework with multi-tenant company isolation, atomic transactions, statutory tax calculation engine, and comprehensive unit tests.
- Frontend: Next.js 14 App Router, Material UI (MUI), TanStack React Query hooks, and responsive design for both Employer and Admin roles.

**Tech Stack:** Python 3.10+, Django 4+, DRF, MySQL 8.0, Next.js 14, React 18, Material UI 5, TypeScript.

---

## Global Constraints
- Multi-tenancy must be strictly maintained via `_get_company_for_request(request)`.
- No database query without filtering by `company=company` or `employee__company=company`.
- Avoid hardcoded currency formats; use standard Vietnamese Dong (VND) formatting.
- UTF-8 with BOM for CSV exports to ensure Excel compatibility on Windows.

---

### Task 1: Leave Balance / Quota Management (Quỹ Phép & Thâm niên)

**Files:**
- Modify: `api/apps/hrm/models.py`
- Modify: `api/apps/hrm/serializers.py`
- Modify: `api/apps/hrm/views.py`
- Modify: `api/apps/hrm/urls.py`
- Modify: `frontend/src/services/hrmService.ts`
- Modify: `frontend/src/views/hrmPages/hooks/useHrmQueries.ts`
- Modify: `frontend/src/views/hrmPages/LeaveListPage/index.tsx`
- Test: `api/apps/hrm/tests.py`

- [ ] **Step 1.1: Add `EmployeeLeaveBalance` model in `api/apps/hrm/models.py`**
- [ ] **Step 1.2: Add Serializers & ViewSet in `serializers.py` and `views.py`**
- [ ] **Step 1.3: Update URL routing in `api/apps/hrm/urls.py`**
- [ ] **Step 1.4: Update Frontend `hrmService.ts` and `useHrmQueries.ts`**
- [ ] **Step 1.5: Enhance `LeaveListPage/index.tsx`**

---

### Task 2: Payroll Engine Enhancement & Dedicated Payroll Management UI

**Files:**
- Modify: `api/apps/hrm/payroll_engine.py`
- Modify: `api/apps/hrm/models.py`
- Modify: `api/apps/hrm/serializers.py`
- Modify: `api/apps/hrm/views.py`
- Modify: `frontend/src/services/hrmService.ts`
- Modify: `frontend/src/views/hrmPages/hooks/useHrmQueries.ts`
- Create: `frontend/src/views/hrmPages/PayrollListPage/index.tsx`
- Create: `frontend/src/app/employer/hrm/payroll/page.tsx`
- Create: `frontend/src/app/admin/hrm/payroll/page.tsx`

- [ ] **Step 2.1: Enhance `payroll_engine.py` with Employer Statutory Contributions**
- [ ] **Step 2.2: Extend `MonthlyPayrollRecord` & `MonthlyPayrollViewSet`**
- [ ] **Step 2.3: Build `PayrollListPage/index.tsx`**
- [ ] **Step 2.4: Create page routes `/employer/hrm/payroll` & `/admin/hrm/payroll`**

---

### Task 3: Monthly Timekeeping Timesheet & Attendance Grid

**Files:**
- Modify: `api/apps/hrm/views.py`
- Modify: `frontend/src/services/hrmService.ts`
- Modify: `frontend/src/views/hrmPages/hooks/useHrmQueries.ts`
- Create: `frontend/src/views/hrmPages/AttendanceListPage/index.tsx`
- Create: `frontend/src/app/employer/hrm/attendances/page.tsx`
- Create: `frontend/src/app/admin/hrm/attendances/page.tsx`

- [ ] **Step 3.1: Add `timesheet` & `quick_checkin` actions on `AttendanceRecordViewSet`**
- [ ] **Step 3.2: Build `AttendanceListPage/index.tsx`**
- [ ] **Step 3.3: Create page routes `/employer/hrm/attendances` & `/admin/hrm/attendances`**

---

### Task 4: Contract Renewal & Lifecycle Automation

**Files:**
- Modify: `api/apps/hrm/views.py`
- Modify: `api/apps/hrm/serializers.py`
- Modify: `frontend/src/services/hrmService.ts`
- Modify: `frontend/src/views/hrmPages/ContractListPage/index.tsx`

- [ ] **Step 4.1: Add `renew_contract` action on `EmploymentContractViewSet`**
- [ ] **Step 4.2: Add "Tái ký / Gia hạn" modal to `ContractListPage/index.tsx`**

---

### Task 5: Employee Self-Service (ESS) Personal API & View

**Files:**
- Modify: `api/apps/hrm/views.py`
- Modify: `api/apps/hrm/urls.py`
- Modify: `frontend/src/services/hrmService.ts`

- [ ] **Step 5.1: Create `MyHrmProfileView` in `views.py`**
- [ ] **Step 5.2: Register endpoint `/api/v1/native-hrm/me/` in `urls.py`**

---

### Task 6: Sidebar Navigation & Comprehensive Test Suite

**Files:**
- Modify: `frontend/src/layouts/components/employers/Sidebar/EmployerMenu.tsx`
- Modify: `frontend/src/layouts/components/employers/Sidebar/AdminMenu.tsx`
- Modify: `api/apps/hrm/tests.py`

- [ ] **Step 6.1: Add menu items for Payroll and Attendances**
- [ ] **Step 6.2: Write comprehensive tests in `api/apps/hrm/tests.py`**
- [ ] **Step 6.3: Run full verification inside Docker container**
