# Admin System Operations, Location Directory & Marketing Architecture

## 1. Global Career Taxonomy & Skill Hierarchy
- **Standardized Job Classifications**:
  - `CareersPage` (`/admin/careers`) administers industry hierarchies, job function groups, and required skill tags across all platform job postings.
  - CRUD operations mapped to `GET/POST/PATCH/DELETE /api/v1/careers/`.

## 2. Territorial & Administrative Geography Governance
- **Three-Tier Administrative Hierarchy**:
  - `CitiesPage` (`/admin/cities`): Province / Municipality level governance (`/api/v1/cities/`).
  - `DistrictsPage` (`/admin/districts`): Urban / Rural district divisions with foreign-key mapping to parent city (`/api/v1/districts/`).
  - `WardsPage` (`/admin/wards`): Ward / Commune micro-locations (`/api/v1/wards/`).

## 3. Marketing Campaign Hero Banners
- **Promotional Asset Management**:
  - `BannersPage` (`/admin/banners`) manages platform promotional displays, CTA link targets, active scheduling, and impression prioritization (`/api/v1/banners/`).
