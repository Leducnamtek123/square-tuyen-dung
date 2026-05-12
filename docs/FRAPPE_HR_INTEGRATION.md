# Frappe HR Integration

Square Tuyển Dụng is now the ATS and AI interview system. HRM ownership lives in Frappe HR.

## Runtime

Start the recruitment stack normally:

```bash
docker compose up -d --build
```

Start Frappe HRMS when HRM is needed. The image is built from local source under `vendor/frappe`:

```bash
docker compose --profile frappe-hrm build frappe-hrms-backend
docker compose --profile frappe-hrm up -d
```

Local Frappe URL:

```text
http://localhost:8081
```

Production gateway URL:

```text
https://hrm.square.vn
```

## Required Env

Set these values in `.env`:

```env
FRAPPE_HR_SITE_NAME=hrm.tuyendung.square.vn
FRAPPE_HR_PUBLIC_URL=https://hrm.square.vn
NEXT_PUBLIC_FRAPPE_HR_PUBLIC_URL=https://hrm.square.vn
FRAPPE_HR_BASE_URL=http://frappe-hrms-frontend:8080
FRAPPE_HR_IMAGE=square/frappe-hrms:custom
FRAPPE_HR_FRAPPE_BRANCH=version-16
FRAPPE_HR_API_KEY=...
FRAPPE_HR_API_SECRET=...
FRAPPE_HR_ADMIN_PASSWORD=...
FRAPPE_HR_DB_ROOT_PASSWORD=...
FRAPPE_HR_DEFAULT_COUNTRY=Vietnam
FRAPPE_HR_DEFAULT_GENDER=Other
FRAPPE_HR_DEFAULT_DATE_OF_BIRTH=1990-01-01
```

## Source Layout

Frappe source is vendored locally for Square customization:

```text
vendor/frappe/frappe          Frappe Framework source
vendor/frappe/erpnext         ERPNext source required by Frappe HRMS
vendor/frappe/hrms            Frappe HRMS source
vendor/frappe/square_hrm_branding
                              Square UI-only branding app
vendor/frappe/frappe_docker   Frappe Docker build tooling
infra/frappe-hrms             Square custom image build files
```

Customize Frappe HRMS inside `vendor/frappe/hrms`, ERPNext behavior inside `vendor/frappe/erpnext`, UI-only branding inside `vendor/frappe/square_hrm_branding`, and framework behavior inside `vendor/frappe/frappe`, then rebuild `square/frappe-hrms:custom`.

Keep upstream license files in place. The Square deployment can be rebranded and self-managed, but Frappe HRMS and ERPNext remain GPL-3.0 licensed.

Generate `FRAPPE_HR_API_KEY` / `FRAPPE_HR_API_SECRET` inside Frappe from a user with HR permissions:

```text
User -> Settings -> API Access -> Generate Keys
```

## Data Flow

When a recruiter clicks "Send to Frappe HR" from an application:

1. The backend validates the application belongs to the active company.
2. The bridge creates or finds the Frappe Company.
3. The bridge provisions the recruiter account and assigns `HR Manager,HR User` by default.
4. If requested, the bridge creates or updates the candidate Frappe User with `Employee` role.
5. The bridge creates or updates the Frappe Employee record.
6. `JobPostActivity` stores only sync metadata:

```text
frappe_employee_id
frappe_user_id
frappe_sync_status
frappe_sync_error
frappe_synced_at
```

No local HRM employee/contracts/tasks/reviews lifecycle is managed in Square Tuyển Dụng anymore.
