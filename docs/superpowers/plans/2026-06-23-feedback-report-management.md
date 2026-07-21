# Feedback and Report Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split public feedback from abuse/report handling, and upgrade both admin lists with server-side pagination, filtering, and searchable moderation workflows.

**Architecture:** Keep `Feedback` for public reviews only, and use the existing `TrustReport` flow for issue reporting. The backend exposes explicit query params for list filtering and pagination; the frontend admin pages consume those params through the shared `DataTable` and `useDataTable` patterns so both pages behave consistently.

**Tech Stack:** Django REST Framework, `django-filter`-style query param handling, React, TanStack Table, React Query, MUI, existing shared admin service layer.

---

### Task 1: Add backend filters for admin feedback

**Files:**
- Modify: `api/apps/content/views.py`
- Modify: `api/apps/content/tests.py`

- [ ] **Step 1: Write the failing test**

```python
def test_admin_feedback_list_filters_by_user_status_and_evidence(admin_user, job_seeker_user):
    ...
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest api/apps/content/tests.py -k feedback -q`
Expected: fails because `AdminFeedbackViewSet` does not yet support `user`, `is_active`, or `hasEvidence` filters.

- [ ] **Step 3: Write minimal implementation**

Add `kw/search`, `user`, `is_active`, `hasEvidence`, and `rating` filtering to `AdminFeedbackViewSet.list`, with pagination preserved.

- [ ] **Step 4: Run test to verify it passes**

Run: `pytest api/apps/content/tests.py -k feedback -q`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add api/apps/content/views.py api/apps/content/tests.py
git commit -m "feat: filter admin feedback lists"
```

### Task 2: Extend admin trust report filtering

**Files:**
- Modify: `api/apps/profiles/views/web_companies.py`
- Modify: `api/apps/profiles/tests.py`

- [ ] **Step 1: Write the failing test**

```python
def test_admin_trust_report_list_filters_by_status_target_and_reporter(admin_user, job_seeker_user, company):
    ...
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest api/apps/profiles/tests.py -k trust_report -q`
Expected: fails because `AdminTrustReportViewSet` does not yet support reporter/search filtering.

- [ ] **Step 3: Write minimal implementation**

Add search, reporter, `status`, and `targetType` filtering to `AdminTrustReportViewSet.get_queryset`.

- [ ] **Step 4: Run test to verify it passes**

Run: `pytest api/apps/profiles/tests.py -k trust_report -q`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add api/apps/profiles/views/web_companies.py api/apps/profiles/tests.py
git commit -m "feat: filter admin trust reports"
```

### Task 3: Upgrade admin feedback page to server pagination and filters

**Files:**
- Modify: `frontend/src/views/adminPages/FeedbacksPage/index.tsx`
- Modify: `frontend/src/views/adminPages/FeedbacksPage/hooks/useFeedbacks.ts`
- Modify: `frontend/src/services/adminManagementService.ts`
- Modify: `frontend/src/types/models.ts` if a filter DTO needs new fields
- Modify: `frontend/src/services/__tests__/adminManagementServiceResponse.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
it('forwards feedback list filter params to the admin feedback endpoint', async () => {
  ...
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- frontend/src/services/__tests__/adminManagementServiceResponse.test.ts`
Expected: fails because the new query params are not yet asserted.

- [ ] **Step 3: Write minimal implementation**

Switch `FeedbacksPage` to `useDataTable` pagination, add filter controls for search/user/status/evidence/rating, and wire the page to `adminManagementService.getFeedbacks(...)`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- frontend/src/services/__tests__/adminManagementServiceResponse.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/views/adminPages/FeedbacksPage/index.tsx frontend/src/views/adminPages/FeedbacksPage/hooks/useFeedbacks.ts frontend/src/services/adminManagementService.ts frontend/src/services/__tests__/adminManagementServiceResponse.test.ts frontend/src/types/models.ts
git commit -m "feat: add feedback admin filters and paging"
```

### Task 4: Upgrade admin report page to server pagination and filters

**Files:**
- Modify: `frontend/src/views/adminPages/TrustReportsPage/index.tsx`
- Add: `frontend/src/views/adminPages/TrustReportsPage/hooks/useTrustReports.ts`
- Modify: `frontend/src/services/adminManagementService.ts`
- Modify: `frontend/src/services/__tests__/adminManagementServiceResponse.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
it('forwards trust report list filter params to the admin trust report endpoint', async () => {
  ...
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- frontend/src/services/__tests__/adminManagementServiceResponse.test.ts`
Expected: fails until the new trust-report list params are implemented.

- [ ] **Step 3: Write minimal implementation**

Use the shared `DataTable` pattern for trust reports and add filters for search, status, target type, and reporter.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- frontend/src/services/__tests__/adminManagementServiceResponse.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/views/adminPages/TrustReportsPage/index.tsx frontend/src/views/adminPages/TrustReportsPage/hooks/useTrustReports.ts frontend/src/services/adminManagementService.ts frontend/src/services/__tests__/adminManagementServiceResponse.test.ts
git commit -m "feat: add trust report admin filters and paging"
```

### Task 5: Verify end-to-end behavior

**Files:**
- No code changes unless verification reveals a gap

- [ ] **Step 1: Run backend tests**

Run: `pytest api/apps/content/tests.py api/apps/profiles/tests.py -q`
Expected: all targeted feedback/report tests pass.

- [ ] **Step 2: Run frontend service tests**

Run: `npm test -- frontend/src/services/__tests__/adminManagementServiceResponse.test.ts`
Expected: pass.

- [ ] **Step 3: Smoke test the app**

Run: `docker compose up -d --build backend frontend nginx-gateway`
Then verify `/api/v1/common/admin/feedbacks/` and `/api/v1/info/web/admin/trust-reports/` return paginated results.

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: modernize review and report moderation"
```
