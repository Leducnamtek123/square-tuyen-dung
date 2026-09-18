# Employer Company Workspace & Verification Architecture

## 1. Company Multi-Tenant Profile & Branding
- **Company Workspace Data Ownership**:
  - `CompanyView.get_company_info` (`GET /api/v1/companies/private/info/`) retrieves authoritative data scoped to `request.user.active_company`.
  - Recruiter updates profile, company description, headquarters address, and industry taxonomy via `PUT /api/v1/companies/private/{slug}/`.
- **Multimedia & Team Assets**:
  - `CompanyImageViewSet` (`/api/v1/company-images/`): Manages company culture and workplace photo albums hosted on Cloudinary.
  - `CompanyMemberViewSet` & `CompanyRoleViewSet`: Granular team permission management (Admin, Recruiter, Interviewer).

## 2. Business License & Legal Representative KYC
- **KYC Verification State Machine**:
  ```
  PENDING (Chưa gửi / Chờ gửi)
    ├──► REVIEWING (Đang xét duyệt)
    │     ├──► APPROVED (Đã xác minh -> Unlocks verified badge & job posting limits)
    │     └──► REJECTED (Bị từ chối -> Requires re-submission with reason details)
  ```
- **Validation Constraints**:
  - Requires valid Tax Code (Mã số thuế), Business Registration Certificate (Giấy phép kinh doanh file attachment), Legal Representative Name, Phone Number, and Official Email.
  - Backend `CompanyVerificationView` validates company ownership and prevents tampering with verified accounts.

## 3. Real-time In-App Notifications & Alert Subscriptions
- **Dual-Channel Notification Architecture**:
  - In-App Real-time Push: Firestore collections keyed by `user_id` streaming real-time notifications with 0ms delivery delay (`firebaseService.ts`).
  - Scheduled Job Alerts: `JobPostNotificationViewSet` (`/api/v1/notifications/`) managing daily/weekly email matching digest criteria.
