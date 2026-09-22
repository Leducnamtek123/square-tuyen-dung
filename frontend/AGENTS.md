# ⚛️ Frontend Agent Rules — Square Tuyển Dụng (InfoHR)

> **Subsystem**: `frontend/`  
> **Parent Governance**: Inherits all global rules from [../AGENTS.md](../AGENTS.md)  
> **Tech Stack**: Next.js 16 (App Router), React 19, TypeScript (`strict: true`), MUI 6 + Tailwind CSS v4, TanStack Query v5, Redux Toolkit, LiveKit Client.

---

## ⚡ Critical Rules (Always Follow)

- **NEVER** use `any` type in TypeScript — always use `unknown` with type narrowing or define explicit interfaces.
- **ALWAYS** default components to Server Components (RSC) unless interactivity, React hooks, or browser APIs are required.
- **ALWAYS** lazy-load heavy client-only modules (`@react-pdf-viewer`, `chart.js`, `leaflet`, `react-draft-wysiwyg`) using `next/dynamic` with `{ ssr: false }`.
- **NEVER** duplicate API server cache into Redux — use `@tanstack/react-query` v5 for all server data.
- **ALWAYS** eliminate SSR waterfalls: parallelize independent fetches using `Promise.all()`.
- **NEVER** expose non-public environment variables without `NEXT_PUBLIC_` prefix to client components.

---

## 1. 🏗️ Architecture & Component Philosophy

### React Server Components (RSC) vs Client Components
- **Default to Server Components**: Every page (`page.tsx`) and layout (`layout.tsx`) is a Server Component by default.
- **Strict `'use client'` Boundaries**:
  - Add `'use client'` only when the component requires:
    1. React interactivity hooks (`useState`, `useReducer`, `useEffect`, `useCallback`, `useMemo`).
    2. Event listeners (`onClick`, `onChange`, `onSubmit`, `onKeyDown`).
    3. Browser-only APIs (`window`, `localStorage`, `ResizeObserver`, `navigator`).
    4. Custom context consumers or third-party client wrappers.
- **Never Mix Server Secrets into Client Bundles**:
  - Never import server-only modules or read non-public environment variables in `'use client'` files.
- **Avoid Waterfall Rendering**:
  - In Server Components, execute independent async operations concurrently using `Promise.all([fetchJobs(), fetchCategories()])`.
  - Pass server data down to Client Components as props or wrap Client Components using RSC `children`.

---

## 2. 🎨 UI & Styling Architecture: MUI 6 & Tailwind CSS v4 Coexistence

This project harnesses both **Material UI (MUI v6)** and **Tailwind CSS v4**. To avoid CSS specificity conflicts, adhere to these strict rules:

### Coexistence Principles
1. **Structural Layout & Spacing**: Use **Tailwind CSS** utility classes for page grids, flex layouts, responsive breakpoints, padding, and margins (`className="flex flex-col gap-4 p-6 md:p-8"`).
2. **Complex Interactive Widgets**: Use **MUI 6** components for specialized enterprise UI: Dialogs, Menus, DatePickers (`@mui/x-date-pickers`), DataTables, and Sliders.
3. **MUI Styling (`sx` vs Tailwind)**:
   - Do NOT mix competing color or font declarations across both `className` and `sx` on the same component.
   - Use `sx` only for deep slot customizations that cannot be targeted cleanly with Tailwind.
4. **Class Name Merging**: Always use `cn()` (combining `clsx` and `tailwind-merge`) when conditionally composing CSS classes.
5. **Icons**: Prefer `lucide-react` or `@phosphor-icons/react` for modern, lightweight SVGs. Keep icon sizing consistent (`size-4`, `size-5`, `h-5 w-5`).

---

## 3. 🔄 State Management & Data Fetching

### Server State vs Client Global State
- **Server State (Async Data)**: Use **TanStack React Query v5** (`@tanstack/react-query`).
  - Use `useQuery` with descriptive, structured query keys: `['jobs', { status, page }]`.
  - Perform data mutations with `useMutation`, and invalidate matching query keys in `onSuccess` via `queryClient.invalidateQueries({ queryKey: [...] })`.
  - Set reasonable `staleTime` and `gcTime` to avoid redundant network roundtrips.
- **Client Global State**: Use **Redux Toolkit** (`@reduxjs/toolkit`).
  - Reserve Redux exclusively for application-wide UI states: user session metadata, active modal states, notification badges, or drawer toggles.
  - Do NOT duplicate API server cache inside Redux.
- **Toasts & User Feedback**: Use **Sonner** (`toast.success()`, `toast.error()`, `toast.info()`) for all user notifications.

---

## 4. 📝 Forms & Data Validation

- **Form Management**: Use **`react-hook-form`** for all form handling.
- **Schema Validation**: Pair with **Yup** or **Zod** schema resolvers (`@hookform/resolvers`).
- **Best Practices**:
  - Define schemas outside component renders to avoid re-allocation.
  - Use strongly typed form inputs: `useForm<FormInputs>({ resolver: yupResolver(schema) })`.
  - Show inline, accessible error messages under invalid inputs.
  - Disable submit buttons while `isSubmitting` is true to prevent duplicate submissions.

---

## 5. 🎙️ LiveKit & Video/Audio Integration

When touching candidate interview rooms or Voice AI features (`@livekit/components-react`, `livekit-client`):
- Clean up WebRTC audio/video tracks on unmount to prevent camera/microphone memory leaks or lingering device locks.
- Handle connection states gracefully (`disconnected`, `connecting`, `connected`, `reconnecting`).
- Show clear visual indicators for Microphone Mute, Camera Status, and Connection Quality.

---

## 6. 📁 Code Style & Naming Conventions

- **File Naming**:
  - Components: PascalCase (e.g., `JobCard.tsx`, `CandidateTable.tsx`).
  - Hooks: camelCase starting with `use` (e.g., `useJobFilter.ts`, `useLiveKitRoom.ts`).
  - Utils & Services: kebab-case or camelCase (e.g., `format-currency.ts`, `apiClient.ts`).
  - App Router routes: lowercase folder names (e.g., `src/app/jobs/[id]/page.tsx`).
- **TypeScript Rules**:
  - `strict: true` is enforced. Never use `any`. Use `unknown` with narrowing or type guards.
  - Use `interface` for component props and object shapes; use `type` for unions, intersections, and mapped types.
  - Export types cleanly alongside components or in `src/types/`.
- **Component Anatomy**:
  ```tsx
  // 1. Imports: React -> Third-party -> Internal components -> Hooks/Utils -> Types
  import { useState, useTransition } from 'react';
  import { toast } from 'sonner';
  import { Button } from '@/components/ui/button';
  import type { JobSummary } from '@/types/job';

  // 2. Props Interface
  interface JobCardProps {
    job: JobSummary;
    onApply?: (id: string) => void;
  }

  // 3. Component Implementation
  export function JobCard({ job, onApply }: JobCardProps) {
    // Hooks -> Handlers -> Render
    return (
      <div className="rounded-xl border border-border/60 p-4 shadow-sm hover:shadow-md transition-shadow">
        <h3 className="text-lg font-semibold text-foreground">{job.title}</h3>
      </div>
    );
  }
  ```

---

## 7. 🧪 Testing & Verification Gate

Before submitting or completing frontend tasks, run:
```bash
# Linting & code style
pnpm run lint

# Check build integrity (type checking & SSR packaging)
pnpm run build

# Run unit tests
pnpm test

# Run Playwright E2E tests (if modifying critical user flows)
pnpm exec playwright test
```
