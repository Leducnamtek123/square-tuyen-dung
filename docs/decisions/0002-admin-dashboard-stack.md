# ADR-0002: Admin Dashboard Architecture & Tech Stack

> **Status**: ACCEPTED  
> **Date**: 2026-10-02  
> **Deciders**: Frontend Lead, Architecture Lead, Product Security  
> **Consulted**: Backend Team, System Operations  
> **Informed**: All Engineering Staff

---

## 1. 📋 Context & Problem Statement

InfoHR requires an internal Admin Portal for managing users, approving employer verifications, auditing AI interview scorecards, managing platform configuration, and monitoring system health. We evaluated whether to:
1. Build a separate frontend repository/SPA (e.g. Vite + React Admin or Django Admin).
2. Integrate the Admin Portal directly inside the main Next.js 16 monorepo frontend with subdomain routing (`admin.infohr.vn` and `/admin/`).

---

## 2. 🎯 Decision Drivers

* **Design System & Component Reuse**: Reusing shared table primitives, modals, dropdowns, and theme tokens already developed for Employer and Job Seeker portals.
* **Shared Authentication State**: Single session management and seamless cookie-based JWT authentication across `infohr.vn`, `employer.infohr.vn`, and `admin.infohr.vn`.
* **Zero Additional Build Pipelines**: Avoid maintaining separate CI/CD pipelines, Docker images, and deployment targets for internal admin tools.
* **Security & Isolation**: Strict Role-Based Access Control (RBAC) ensuring non-staff accounts cannot access admin routes or sensitive actions.

---

## 3. 🔍 Considered Options

* **Option 1: Integrated Next.js 16 App Router Subdomain Routing (`frontend/src/app/admin`)**
* **Option 2: Standalone Vite + React Admin SPA in a separate repository**
* **Option 3: Standard Django Admin / Jazzmin Backend Templates**

---

## 4. ⚖️ Decision Outcome

**Chosen Option**: **Option 1 (Integrated Next.js 16 App Router with Subdomain Routing)**.

### Rationale:
1. **Unified Frontend Engine**: Next.js 16 App Router supports route groups and middleware-based subdomain rewriting. Requests to `admin.infohr.vn` transparently map to `frontend/src/app/admin/`.
2. **Single Component Ecosystem**: The admin portal directly inherits all design system components (Shadcn UI, Radix primitives, Tailwind CSS v4 utilities, TanStack Query) built for the platform.
3. **Optimized Build & Deploy**: One unified Docker container serves all portals, saving CI build minutes and server RAM.

---

## 5. 📊 Pros & Cons of the Options

### Option 1: Integrated Next.js 16 App Router (Chosen)
* **Good**: 100% component and type sharing with Employer and Job Seeker portals.
* **Good**: Consistent UX and dark/light mode themes across the entire ecosystem.
* **Good**: Middleware enforces JWT role validation (`ADMIN`, `SUPERADMIN`) before rendering.
* **Bad**: Frontend deployment impacts both consumer and admin portals simultaneously.

### Option 2: Standalone Vite SPA
* **Good**: Independent release cycle.
* **Bad**: Severe code duplication of UI components, types, and API callers; requires a second deployment target.

### Option 3: Django Admin / Jazzmin
* **Good**: Fast to set up initial CRUD.
* **Bad**: Difficult to customize for real-time LiveKit audio inspection, modern interactive dashboards, or unified design system.

---

## 6. 🛡️ Compliance & Validation Plan

* Next.js Middleware in `frontend/src/middleware.ts` intercepts all requests to `admin.infohr.vn` and `/admin/`, redirecting unauthenticated or unauthorized users to `/admin/login`.
* Backend DRF permission class `IsAdminOrSuperUser` validates every admin API endpoint independently.
