# Admin Core Entity Management Architecture: Users, Companies & Jobs

## 1. Global User Directory & Role Delegation
- **Multi-Tenant User Governance**:
  - `UsersPage` (`/admin/users`) enables administrative user search, role escalation (Candidate -> Recruiter -> Admin), and instant account status toggles (`is_active: boolean`).
  - Calls `adminUserService.getUsers()` (`GET /api/v1/users/`) and `adminUserService.updateUserRole()` (`PATCH /api/v1/users/{id}/`).

## 2. Enterprise Directory & Moderation
- **Company Profile & Trust Oversight**:
  - `CompaniesPage` (`/admin/companies`) lists registered enterprises with verification badges, active job count, and workforce statistics.
  - Controls company moderation flags (`is_verified`, `is_blocked`) via `PATCH /api/v1/companies/{id}/`.

## 3. Global Job Post Directory & Quality Control
- **Job Moderation & Compliance**:
  - `JobsPage` (`/admin/jobs`) manages platform job postings with status filtering (`PUBLISHED`, `PENDING_REVIEW`, `REJECTED`, `EXPIRED`).
  - Implements bulk approvals and spam filtering.

## 4. Candidate Talent Repository & Historical Auditing
- **Candidate Dossier & Resume Preview**:
  - `ProfilesPage` (`/admin/profiles`) and `ProfileDetailPage` (`/admin/profiles/[id]`) display structured candidate resumes, educational history, skill vectors, and interview records with timeline audit logging.
