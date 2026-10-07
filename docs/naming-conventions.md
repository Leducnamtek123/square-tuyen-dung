# Quy Chuan Dat Ten Toan Dien (Comprehensive Naming Conventions)

> **Phan he**: docs-root  
> **Tai lieu**: naming-conventions.md  
> **Pham vi ap dung**: Toan bo du an Monorepo InfoHR

---

## 1. Co So Du Lieu MySQL & Cac Bang

- **Ten bang (Tables)**: Chu thuong, so nhieu, ngan cach bang dau gach duoi `snake_case`. Tien to the hien phan he neu la module chuyen biet (Vi du: `users`, `job_posts`, `hrm_employees`, `hrm_payroll_ledgers`).
- **Ten cot (Columns)**: Chu thuong, `snake_case`, danh tu ro nghia (Vi du: `first_name`, `created_at`, `dependents_count`).
- **Khoa ngoai (Foreign Keys)**: Ten bang so it kem `_id` (Vi du: `company_id`, `department_id`, `user_id`).
- **Truong kieu logic (Booleans)**: Tien to `is_`, `has_`, `can_` (Vi du: `is_active`, `is_overnight`, `has_children`).

---

## 2. Backend Python & Django

- **Ten class / Models / Serializers**: `PascalCase` (Vi du: `JobPost`, `EmployeeSerializer`, `AttendanceRecordViewSet`).
- **Ten ham / Methods / Variables**: `snake_case` (Vi du: `calculate_payroll`, `get_active_jobs`).
- **Hang so (Constants)**: `UPPER_SNAKE_CASE` (Vi du: `DEFAULT_PAGE_SIZE = 20`, `MAX_CV_FILE_SIZE_MB = 10`).
- **File module**: `snake_case.py` (Vi du: `payroll_engine.py`, `livekit_webhook.py`).

---

## 3. Frontend TypeScript & React

- **Components & Layouts**: `PascalCase` cho ca ten file va ten ham component (Vi du: `CandidateCard.tsx`, `DetailedTimesheetPage.tsx`).
- **Custom Hooks**: `camelCase` bat dau bang tien to `use` (Vi du: `useAuth.ts`, `useLiveKitRoom.ts`).
- **Interfaces & Types**: `PascalCase` (Vi du: `JobPostItem`, `EmployeeStatus`, `PayrollRecord`).
- **Tien ich & Helpers**: `camelCase.ts` (Vi du: `formatCurrency.ts`, `dateUtils.ts`).
- **Route directories**: `kebab-case` hoac `[param]` (Vi du: `job-posts/`, `applied-profiles/`, `[slug]/`).

---

## 4. RESTful API Endpoints

- **URI Path**: Chu thuong, danh tu so nhieu, ngan cach bang dau gach ngang `kebab-case` (Vi du: `/api/v1/job/job-posts/`, `/api/v1/native-hrm/leave-requests/`).
- **Query Parameters**: `snake_case` (Vi du: `?page_size=20&salary_min=10000000&is_active=true`).

---

## 5. Git Branches & Commits

- **Ten nhanh (Branches)**: `<type>/<short-description-in-kebab-case>` (Vi du: `feature/hrm-overnight-shift`, `fix/payroll-double-deduction`).
- **Commit Messages**: Tuan thu Conventional Commits: `<type>(<scope>): <description>` (Vi du: `fix(hrm): prevent double deduction in payroll engine`).
