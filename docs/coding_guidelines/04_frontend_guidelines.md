# ⚛️ Frontend Engineering Guidelines (Next.js 16 & React 19)

> **Ecosystem**: Square Tuyển Dụng (InfoHR)  
> **Tech Stack**: Next.js 16 (App Router), React 19, Tailwind CSS v4, TypeScript 5+, TanStack Query v5, Redux Toolkit, Shadcn UI  
> **Target Subsystems**: Job Seeker (`infohr.vn`), Employer (`employer.infohr.vn`), Admin (`admin.infohr.vn`), HRM (`hrm.infohr.vn`)

---

## 1. 🏗️ Component Architecture: Server vs. Client Boundary

Next.js 16 uses React Server Components (RSC) by default. Keep the client JavaScript bundle as small as possible by pushing `'use client'` down to the leaves of your component tree.

```text
frontend/src/
├── app/                  # App Router: Pages, layouts, metadata, route handlers
│   ├── (job-seeker)/     # Route group for Job Seeker portal
│   ├── employer/         # Route group for Employer portal
│   ├── admin/            # Route group for Admin portal
│   └── hrm/              # Route group for Internal HRM portal
├── components/           # Reusable presentational components (buttons, tables, modals)
│   └── ui/               # Shadcn / Radix primitives
├── views/                # Domain-specific composite views
├── hooks/                # Custom React hooks (WebRTC, media streams, local state)
├── services/             # API client functions (Axios / Fetch wrappers)
├── store/                # Redux slices & store configuration
└── types/                # Synchronized TypeScript interface declarations
```

### 1.1. Rules for Component Boundaries
- **Server Components (Default)**: Fetch data, render static layouts, access server-only environment variables.
- **Client Components (`'use client'`)**: Only when using browser APIs (`window`, `localStorage`, WebRTC), event listeners (`onClick`, `onChange`), or React state hooks (`useState`, `useEffect`, `useReducer`).
- **Never make entire pages `'use client'`** when only a small button or form needs interactivity. Wrap interactive controls in small client components and pass server children into them.

---

## 2. 🗄️ State Management Architecture

InfoHR implements a 3-tier state hierarchy:

```text
┌────────────────────────────────────────────────────────┐
│ 1. URL State (Search Params & Dynamic Segments)        │
│    - Pagination, search queries, active tabs, filters  │
├────────────────────────────────────────────────────────┤
│ 2. Server State (TanStack Query v5)                    │
│    - Remote API responses, optimistic updates, cache   │
├────────────────────────────────────────────────────────┤
│ 3. Global Client State (Redux Toolkit)                 │
│    - Auth session, candidate active interview room,    │
│      WebRTC stream telemetry, audio device status      │
└────────────────────────────────────────────────────────┘
```

1. **URL as Single Source of Truth**: Any state that should survive page refresh or be shareable (e.g., job filter criteria, pagination index `?page=2`, active tab) MUST live in the URL search params.
2. **TanStack Query for API Data**: Do not duplicate API data into Redux or `useState`. Use TanStack Query hooks with clear cache key invalidation strategies.
3. **Redux Toolkit for Volatile Session State**: Use Redux for complex real-time interview state (WebRTC packet metrics, talking-head avatar speech cycle, active audio devices).

---

## 3. 🎨 Styling & Design System (Tailwind CSS v4)

- **Design System First**: Use tokenized colors, spacing, and typography defined in CSS variables (`theme.css` / `globals.css`).
- **No Magic Numbers**: Avoid arbitrary inline classes like `w-[327px]` or `top-[17px]`. Use standard spacing scale (`w-80`, `top-4`).
- **Tailwind v4 Modern Utilities**: Utilize modern CSS features like CSS Grid, subgrid, container queries (`@container`), and `color-mix()` where appropriate.
- **Dark Mode Compatibility**: All new components must support both light and dark modes with clear contrast ratios meeting WCAG 2.1 AA standards.

---

## 4. ⚡ Web Performance & Core Web Vitals

To maintain high user retention and strong search engine rankings:

1. **Image Optimization**: Always use `next/image` with explicit `width`, `height`, and responsive `sizes` attribute. Avoid raw `<img>` tags.
2. **Font Optimization**: Use `next/font/google` with `display: 'swap'` to avoid Flash of Unstyled Text (FOUT).
3. **Bundle Size**: Avoid importing entire utility libraries. Use tree-shakeable imports:
   ```typescript
   // ❌ BAD
   import _ from 'lodash';
   
   // ✅ GOOD
   import debounce from 'lodash/debounce';
   ```
4. **Target Metrics**:
   - **LCP** (Largest Contentful Paint) < 2.0s
   - **INP** (Interaction to Next Paint) < 150ms
   - **CLS** (Cumulative Layout Shift) < 0.05

---

## 5. 🛡️ Verification & Type Safety

Before opening any Pull Request:

```bash
# 1. Check for linting issues
pnpm run lint

# 2. Dry-run type build
pnpm run build

# 3. Run Playwright E2E tests (if applicable)
pnpm exec playwright test
```

> **Sync Rule**: Whenever backend DRF serializers change, immediately update the corresponding TypeScript definitions in `frontend/src/types/`. Never use `any` in production code.
