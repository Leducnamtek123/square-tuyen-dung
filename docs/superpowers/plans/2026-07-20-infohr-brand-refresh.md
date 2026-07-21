# InfoHR Brand Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Square-branded system identity with a consistent InfoHR brand, including light/dark logo variants, updated favicon/manifest assets, and matching UI theme tokens.

**Architecture:** Keep the change centralized so most UI surfaces inherit branding automatically. The logo paths, app name, theme colors, favicon, and SEO defaults will be updated in shared config files first, then a small set of direct image references and hardcoded brand strings will be normalized to match.

**Tech Stack:** Next.js, React, TypeScript, MUI, static SVG assets, shared config modules.

---

### Task 1: Add InfoHR brand assets

**Files:**
- Create: `frontend/public/infohr-icons/logo-light.svg`
- Create: `frontend/public/infohr-icons/logo-dark.svg`
- Create: `frontend/public/infohr-icons/icon.svg`

- [ ] **Step 1: Create the new logo SVGs**

Use simple, transparent SVG wordmarks for `InfoHR`:
- `logo-light.svg`: pink wordmark for light surfaces
- `logo-dark.svg`: white wordmark with pink accent for dark surfaces
- `icon.svg`: compact favicon/app icon version

- [ ] **Step 2: Verify the files render cleanly in the browser**

Open the SVGs directly from `frontend/public/infohr-icons/` and confirm the wordmark is readable at small sizes.

### Task 2: Centralize brand switching

**Files:**
- Modify: `frontend/src/configs/constants.ts`
- Modify: `frontend/src/configs/images.ts`
- Modify: `frontend/src/themeConfigs/defaultTheme.ts`
- Modify: `frontend/src/app/globals.css`
- Modify: `frontend/src/hooks/useSEO.ts`
- Modify: `frontend/src/app/layout.tsx`
- Modify: `frontend/public/manifest.json`
- Modify: `frontend/public/robots.txt`

- [ ] **Step 1: Update the shared app brand name**

Change `APP_NAME` and the shared SEO defaults from `Square` to `InfoHR` so pages that interpolate the app name switch automatically.

- [ ] **Step 2: Point shared image helpers to the new assets**

Update `IMAGES.getLogo`, `IMAGES.getTextLogo`, and `LOGO_IMAGES.LOGO_WITH_BG` to use the new InfoHR SVG files, and wire the app shell favicon/manifest to `infohr-icons/icon.svg`.

- [ ] **Step 3: Recolor the theme to match the new logo**

Refresh the primary/accent palette and CSS variables to a pink-forward InfoHR palette with a polished dark mode counterpart.

- [ ] **Step 4: Update default SEO metadata and app shell branding**

Swap the document title template, default descriptions, and site name to InfoHR across the root app shell and SEO helper.

- [ ] **Step 5: Verify the shared config compiles**

Run the frontend typecheck or a targeted lint pass for the modified config files.

### Task 3: Normalize direct brand references

**Files:**
- Modify: `frontend/src/layouts/components/commons/Header/index.tsx`
- Modify: `frontend/src/layouts/components/commons/Footer/index.tsx`
- Modify: `frontend/src/layouts/components/commons/LeftDrawer/index.tsx`
- Modify: `frontend/src/layouts/components/employers/Sidebar/DrawerContent.tsx`
- Modify: `frontend/src/layouts/components/MuiShellLayout.tsx`
- Modify: `frontend/src/views/authPages/AdminLogin/index.tsx`
- Modify: `frontend/src/views/defaultPages/HomePage/index.tsx`
- Modify: `frontend/src/views/adminPages/InterviewPreviewPage.tsx`
- Modify: `frontend/src/views/interviewPages/InterviewSessionPage.tsx`
- Modify: `frontend/src/components/Features/ChatBot/index.tsx`

- [ ] **Step 1: Replace hardcoded logo paths and alt text**

Update any remaining direct `/square-icons/...` references to the new InfoHR assets, and rename visible alt text from `Square` to `InfoHR`.

- [ ] **Step 2: Replace direct brand names in key visible strings**

Update the main shell/login/chatbot labels that still say `Square` so users see `InfoHR` instead.

- [ ] **Step 3: Verify there are no remaining direct logo references**

Search for `square-icons`, `Square Logo`, and `Square` in the frontend shell files and confirm only product-history strings remain where intended.

### Task 4: Test and verify the refresh

**Files:**
- Modify: `frontend/src/layouts/components/commons/__tests__/CommonEmployerNavigationRoutes.test.ts` if needed
- Modify: any failing snapshot or route tests surfaced by the brand refresh

- [ ] **Step 1: Run focused frontend tests**

Run the tests that cover shared navigation, header/footer brand rendering, and any modified brand-sensitive components.

- [ ] **Step 2: Run a frontend typecheck/lint pass**

Run the project’s `typecheck` and a targeted `lint` pass for the frontend package.

- [ ] **Step 3: Manually smoke-check the main surfaces**

Open the home page, employer portal, admin login, and a blog page to confirm the new InfoHR logo appears correctly in both light and dark contexts.
