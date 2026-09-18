# Admin Operational Governance: Banners, Logs & Feedback Architecture

## 1. Banner Placement Taxonomies & Layout Engine
- **Slot Allocation & Layout Targets**:
  - `BannerTypesPage` (`/admin/banner-types`) configures display dimensions, placement slots (Hero Header, Sidebar, Interstitial), and responsive breakpoints (`/api/v1/banner-types/`).

## 2. Enterprise Verification Review Queue
- **Business Identity & Tax Compliance Auditing**:
  - `CompanyVerificationsPage` (`/admin/company-verifications`) provides a workflow for inspecting enterprise tax codes, registration licenses, and authorized contact credentials (`/api/v1/company-verifications/`).

## 3. Platform Security & Action Audit Trail
- **Immutable Administrative Logs**:
  - `AuditLogsPage` (`/admin/audit-logs`) records tamper-resistant administrative telemetry (IP addresses, action payloads, affected entities) for regulatory compliance (`/api/v1/audit-logs/`).

## 4. Job Post Activity & Dispatch Monitoring
- **Lifecycle Telemetry & Candidate Notifications**:
  - `JobActivityPage` (`/admin/job-activity`): Monitors job status transitions and application volume spikes (`/api/v1/job-activities/`).
  - `JobNotificationsPage` (`/admin/job-notifications`): Tracks candidate email/push job recommendation alerts (`/api/v1/job-notifications/`).
