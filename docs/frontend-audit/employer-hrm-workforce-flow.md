# Employer HRM Core Workforce Management Architecture

## 1. Multi-Tenant HRM Core Architecture
- **Tenant Isolation**:
  - All HRM viewsets (`DepartmentViewSet`, `EmployeeViewSet`, `EmploymentContractViewSet`, `LeaveRequestViewSet`, `AttendanceRecordViewSet`) enforce company scoping via `_get_company_for_request(request)`.
  - Unauthorized recruiters cannot query or modify another company's staff directory, payroll contracts, or leave requests.
- **Auto-Increment Employee Code Sequence**:
  - Backend `generate_next_employee_code(company)` formats continuous sequence (`EMP-0001`, `EMP-0002`) isolated per company tenant.

## 2. Candidate-to-Employee Conversion Pipeline
- **Direct Onboarding Handler**:
  - `POST /api/v1/hrm/employees/onboard-candidate/` (`CandidateToEmployeeConverter.convert`).
  - Transfers application data (`fullName`, `email`, `phone`, `avatar`, `jobTitle`, `department`, `contractType`, `startingSalary`, `joinDate`) directly into active `Employee` and `EmploymentContract` database records.

## 3. Leave Management State Machine
```
PENDING (Chờ duyệt)
  ├──► APPROVED (Đã duyệt -> Triggers leave balance deduction)
  └──► REJECTED (Bị từ chối -> Requires reason note)
```
- Restricts overlapping leave periods and validates remaining annual leave balance before submission.
