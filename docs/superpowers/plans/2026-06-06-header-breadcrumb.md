# Header Breadcrumb Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Render employer/admin breadcrumbs in the shared fixed header and remove duplicate page-level breadcrumbs from child page bodies.

**Architecture:** Add a route metadata resolver in `src/configs/portalBreadcrumbs.ts`, render its result in `src/layouts/components/employers/Header/index.tsx`, and remove direct MUI `Breadcrumbs` markup from employer/admin page components that are inside sidebar layouts. Use route constants and existing i18n keys so labels stay localized.

**Tech Stack:** Next.js App Router, React client components, MUI, react-i18next, Jest/ts-jest.

---

### Task 1: Breadcrumb Resolver

**Files:**
- Create: `frontend/src/configs/portalBreadcrumbs.ts`
- Create: `frontend/src/configs/__tests__/portalBreadcrumbs.test.ts`

- [ ] **Step 1: Write failing tests**

Create resolver tests for `/employer/question-groups`, `/nha-tuyen-dung/bo-cau-hoi`, `/employer/interviews/123`, `/admin/question-groups`, and `/not-a-portal-page`.

- [ ] **Step 2: Run red test**

Run: `npm test -- --runTestsByPath src/configs/__tests__/portalBreadcrumbs.test.ts`

Expected: FAIL because `portalBreadcrumbs.ts` does not exist yet.

- [ ] **Step 3: Implement resolver**

Export `getPortalBreadcrumbs(pathname: string): PortalBreadcrumbItem[]`. Normalize localized paths with `localizeRoutePath(pathname, 'en')`, match exact and dynamic route patterns, and return items containing `labelKey`, `namespace`, and optional `href`.

- [ ] **Step 4: Run green test**

Run: `npm test -- --runTestsByPath src/configs/__tests__/portalBreadcrumbs.test.ts`

Expected: PASS.

### Task 2: Header Rendering

**Files:**
- Modify: `frontend/src/layouts/components/employers/Header/index.tsx`

- [ ] **Step 1: Add header breadcrumb render path**

Use `usePathname()`, `getPortalBreadcrumbs()`, and `useTranslation(['common', 'employer', 'admin'])` to render a compact MUI `Breadcrumbs` component on the header left side.

- [ ] **Step 2: Preserve existing header controls**

Keep drawer button, account switch menu, language switcher, notifications, chat, and user menu behavior unchanged.

- [ ] **Step 3: Typecheck**

Run: `npm run typecheck`

Expected: no TypeScript errors from the new header/resolver code.

### Task 3: Remove Child Breadcrumbs

**Files:**
- Modify: `frontend/src/views/components/employers/QuestionGroupsCard/index.tsx`
- Modify admin page files under `frontend/src/views/adminPages` that import/render MUI `Breadcrumbs`

- [ ] **Step 1: Remove employer child breadcrumb**

Delete `Breadcrumbs` and `Link` imports and JSX from `QuestionGroupsCard`.

- [ ] **Step 2: Remove admin page child breadcrumbs**

For each admin page with direct `<Breadcrumbs>` markup, remove only the breadcrumb JSX and unused `Breadcrumbs`/`Link` imports. Keep titles, buttons, filters, tables, and dialogs unchanged.

- [ ] **Step 3: Scan for remaining child breadcrumbs**

Run: `rg -n "<Breadcrumbs|Breadcrumbs" src/views/employerPages src/views/components/employers src/views/adminPages`

Expected: no employer/admin sidebar child layout breadcrumbs remain.

### Task 4: Verification

**Files:**
- No new committed test artifacts.

- [ ] **Step 1: Run resolver tests**

Run: `npm test -- --runTestsByPath src/configs/__tests__/portalBreadcrumbs.test.ts`

Expected: PASS.

- [ ] **Step 2: Run typecheck**

Run: `npm run typecheck`

Expected: PASS.

- [ ] **Step 3: Render QA**

Start dev server with `npm run dev` if needed, then use Playwright because Browser plugin is unavailable in this session. Verify `/employer/question-groups` at desktop and mobile widths: header breadcrumb is visible in the blue bar, no duplicate breadcrumb appears in the card body, and no framework overlay appears.
