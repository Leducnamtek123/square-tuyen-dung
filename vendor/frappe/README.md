# Vendored Frappe Sources

This directory contains local source checkouts used to build the custom Square Frappe HRMS image.

Current layout:

```text
vendor/frappe/frappe          Frappe Framework, branch version-16
vendor/frappe/erpnext         ERPNext, branch version-16
vendor/frappe/hrms            Frappe HRMS, branch version-16
vendor/frappe/square_hrm_branding
                              Square UI-only branding app
vendor/frappe/frappe_docker   Frappe Docker build tooling, branch main
```

Build target:

```text
square/frappe-hrms:custom
```

Keep upstream license files in place. Frappe Framework is MIT licensed; ERPNext and Frappe HRMS are GPL-3.0 licensed. Rebrand and customize code, DocTypes, UI, workflows, and roles here, then rebuild with:

```bash
docker compose --profile frappe-hrm build frappe-hrms-backend
docker compose --profile frappe-hrm up -d
```
