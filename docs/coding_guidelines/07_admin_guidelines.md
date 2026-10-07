# 🛡️ Admin Portal Guidelines & Governance

> **Ecosystem**: Square Tuyển Dụng (InfoHR)  
> **Subsystem**: Admin Portal (`admin.infohr.vn` / `frontend/src/app/admin`)  
> **Security Level**: Critical / High Privilege

---

## 1. 📌 Scope & Purpose

The Admin Portal is the central command center for InfoHR platform operators. It manages user accounts, company verifications, job post approvals, interview script templates, subscription billing, and system health. Due to its elevated privileges, special security and UI conventions apply.

---

## 2. 🔐 Role-Based Access Control (RBAC)

All admin endpoints in `api/apps/admin_panel/` and frontend views in `frontend/src/app/admin/` must enforce role checks:

| Role | Permissions | Typical Operations |
| :--- | :--- | :--- |
| **SuperAdmin** | Full system access, staff management, financial overrides, system settings. | Create admin staff, modify system variables, manage API keys. |
| **Moderator** | Content moderation, verification queues, candidate & employer support. | Review job postings, verify employer business licenses, review reported CVs. |
| **Auditor / Read-Only** | Read-only access to audit logs, financial reports, analytics. | Inspect system telemetry, view transaction logs, export compliance reports. |

```python
# Backend permission enforcement
from rest_framework.permissions import BasePermission

class IsAdminOrSuperUser(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            (request.user.is_staff or request.user.role == 'ADMIN')
        )
```

---

## 3. 🚨 Data Safety & Destructive Action Safeguards

1. **Soft Deletes by Default**: Never hard delete candidates, companies, or job postings. Set `is_active = False` or `deleted_at = timezone.now()`.
2. **Two-Step Confirmation**: All destructive operations (e.g. banning an employer, cancelling a job post, revoking API keys) must require explicit confirmation in the UI:
   - Destructive modal with red confirmation button.
   - For irreversible operations (e.g. purging database caches), require typing the resource identifier or `CONFIRM`.
3. **Audit Logging**: Every mutating administrative action MUST be recorded in the `AdminAuditLog` table with:
   - `admin_user_id`
   - `action_type` (e.g. `JOB_POST_APPROVED`, `EMPLOYER_BANNED`)
   - `target_model` & `target_id`
   - `payload_snapshot` (before & after state)
   - `ip_address` & `user_agent`

---

## 4. 📊 UI/UX Standards for Admin Dashboard

Admin interfaces differ fundamentally from consumer marketing pages:

- **Data Density**: Maximize visible information without cluttered typography. Use compact table rows (`py-2` or `py-2.5`).
- **Server-Driven Pagination & Filtering**: Always use server-side pagination (`pageSize=20|50|100`) and URL search params for search queries, status filters, and sorting.
- **Batch Actions**: Provide checkboxes for bulk approval, rejection, or tagging.
- **Status Badges**: Use standard, consistent badge semantics:
  - 🟢 Green: `ACTIVE`, `APPROVED`, `VERIFIED`
  - 🟡 Yellow: `PENDING_REVIEW`, `DRAFT`, `WAITING`
  - 🔴 Red: `BANNED`, `REJECTED`, `EXPIRED`, `SUSPENDED`
  - ⚪ Gray: `INACTIVE`, `ARCHIVED`
