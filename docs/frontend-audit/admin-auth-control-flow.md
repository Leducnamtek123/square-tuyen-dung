# Admin Authentication & Executive Control Center Architecture

## 1. Multi-factor Administrative Authentication
- **Secure MFA & Session Control**:
  - `AdminLogin` (`/admin/login`) requires staff/superuser privileges.
  - Implements secure credential submission with brute-force lockout safeguards (`POST /api/v1/auth/token/`).
  - Sets HttpOnly refresh token cookies alongside role claims (`is_staff: true`, `is_superuser: true`).

## 2. Platform Executive Dashboard & Metric Feeds
- **KPI Deck & System Health Monitor**:
  - `DashboardPage` (`/admin/dashboard`) aggregates multi-tenant platform metrics:
    - Active Candidates & Recruiters
    - Total Verified Enterprises vs Pending Verifications
    - Live AI Interviews Conducted & Pass/Fail Distribution
    - Monthly Recruitment Subscriptions & Revenue Run-rate
  - Queries `/api/v1/analytics/dashboard/` with real-time caching.

## 3. Password Recovery & Root Redirection
- **Admin Password Reset Pipeline**:
  - `/admin/forgot-password` and `/admin/reset-password/[token]` provide dedicated recovery workflows scoped to administrative credentials.
  - `/admin` provides role-aware redirection to `/admin/dashboard` or `/admin/login`.
