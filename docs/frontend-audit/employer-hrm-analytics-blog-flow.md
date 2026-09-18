# Employer HRM Analytics & Recruitment Content Architecture

## 1. HRM Metric Aggregations & Headcount Deck
- **KPI Metrics**:
  - `HrmDashboardStatsAPIView` (`GET /api/v1/hrm/dashboard/stats/`) returns aggregated counts for `active_employees`, `probation_employees`, `pending_leaves`, `expiring_contracts` (contracts expiring within 30 days), and `department_breakdown`.
  - Scoped strictly to `request.user.active_company`.

## 2. Interactive Organization Hierarchy Tree
- **Recursive Department Hierarchy**:
  - `DepartmentViewSet.org_chart` (`GET /api/v1/hrm/departments/org-chart/`) constructs hierarchical node trees with cycle detection (`visited` set).
  - Each tree node displays department head (`manager_name`), unique code, and dynamic employee headcount (`emp_counts`).

## 3. Employer Recruitment Blog Management
- **Article Authoring & Publishing**:
  - Employers author recruitment branding articles, employee spotlight stories, and culture posts via `EmployerBlogFormPage` (`POST/PUT /api/v1/content/articles/`).
  - Supports rich WYSIWYG editor content, cover image upload, and tags.
