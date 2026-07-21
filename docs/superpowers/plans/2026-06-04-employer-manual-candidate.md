# Employer Manual Candidate Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add private, company-owned manual candidate profiles for employers.

**Architecture:** The backend adds a separate `EmployerCandidateProfile` model and API instead of overloading public job seeker `Resume` records. The frontend renders a small company manual-candidate management section on the employer candidate page and keeps the public candidate search unchanged.

**Tech Stack:** Django REST Framework, Django migrations, React/Next.js, MUI, React Query, TypeScript.

---

### Task 1: Backend API Tests

**Files:**
- Modify: `api/apps/profiles/tests.py`

- [ ] **Step 1: Write failing tests**

Add tests that call `/api/v1/info/web/employer-candidates/` for create, list, delete, company scoping, and role denial.

- [ ] **Step 2: Run tests and verify RED**

Run: `cd api; pytest apps/profiles/tests.py -k employer_candidate -q`

Expected: tests fail because `EmployerCandidateProfile` and route do not exist.

### Task 2: Backend Implementation

**Files:**
- Modify: `api/apps/profiles/models.py`
- Create: `api/apps/profiles/migrations/0007_employer_candidate_profile.py`
- Modify: `api/apps/profiles/serializers_pkg/resume_serializers.py`
- Modify: `api/apps/profiles/serializers_pkg/__init__.py`
- Modify: `api/apps/profiles/views/web_views.py`
- Modify: `api/apps/profiles/urls.py`
- Modify: `api/apps/profiles/admin.py`

- [ ] **Step 1: Add model and migration**

Add `EmployerCandidateProfile` with company, created_by, full_name, email, phone, title, salary fields, config fields, city, career, description, skills_summary, note, optional file, and slug.

- [ ] **Step 2: Add serializer and viewset**

Create a serializer that maps camelCase fields, uploads optional CV files through `CloudinaryService`, and creates records for `request.user.get_active_company()`. Add a `ModelViewSet` filtered by active company and protected by `CanManageCandidates`.

- [ ] **Step 3: Register route and admin**

Register `web/employer-candidates/` and a basic admin model.

- [ ] **Step 4: Run tests and verify GREEN**

Run: `cd api; pytest apps/profiles/tests.py -k employer_candidate -q`

Expected: all new tests pass.

### Task 3: Frontend Service And UI

**Files:**
- Create: `frontend/src/services/employerCandidateService.ts`
- Modify: `frontend/src/services/index.ts`
- Modify: `frontend/src/views/components/employers/hooks/useEmployerQueries.ts`
- Create: `frontend/src/views/components/employers/ManualCandidateCard/index.tsx`
- Create: `frontend/src/views/components/employers/ManualCandidateForm/index.tsx`
- Modify: `frontend/src/views/components/employers/ProfileCard/index.tsx`
- Modify: `frontend/src/i18n/locales/vi/employer.json`
- Modify: `frontend/src/i18n/locales/en/employer.json`
- Modify: `frontend/src/types/models.ts`

- [ ] **Step 1: Add service and types**

Add list/create/delete calls for `info/web/employer-candidates/`.

- [ ] **Step 2: Add hooks**

Add React Query hooks that invalidate `employerManualCandidates` after create/delete.

- [ ] **Step 3: Add form and list section**

Render an `Add candidate` button above search results. The dialog submits multipart form data and the list shows manual candidates with contact, title, salary, CV link, and delete action.

- [ ] **Step 4: Run frontend checks**

Run: `cd frontend; npm run typecheck`

Expected: TypeScript passes.

### Task 4: Final Verification

**Files:**
- No new files.

- [ ] **Step 1: Run focused backend tests**

Run: `cd api; pytest apps/profiles/tests.py -k employer_candidate -q`

- [ ] **Step 2: Run frontend typecheck**

Run: `cd frontend; npm run typecheck`

- [ ] **Step 3: Start local frontend if practical and inspect page**

Run the Next dev server and check `employer/candidates` for the new button and dialog.
