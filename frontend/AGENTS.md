# ⚛️ Frontend Agent Rules — Square Tuyển Dụng (InfoHR)

> **Subsystem**: `frontend/`  
> **Parent Governance**: Inherits all global rules from [../AGENTS.md](../AGENTS.md)  
> **Tech Stack**: Next.js 16 (App Router), React 19, TypeScript (`strict: true`), Tailwind CSS v4 + Shadcn UI, TanStack Query v5, Redux Toolkit, LiveKit Client.

---

## ⚡ Critical Rules (Always Follow)

- **NEVER** use `any` type in TypeScript — always use `unknown` with type narrowing or define explicit interfaces.
- **ALWAYS** use **Shadcn UI (`@/components/ui/*`)** and **Tailwind CSS v4** for all new UI and refactored components. **DO NOT USE Material UI (MUI)**.
- **NEVER** use rounded pills or circular shapes (`rounded-full`, `rounded-2xl`, etc.) for buttons, tags, badges, avatars, or inputs — always use **micro-radius ("bo nhẹ hết cỡ": `rounded-[3px]`, `rounded-[4px]`, `rounded-sm`)**.
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

## 2. 🎨 UI & Styling Architecture: Shadcn UI & Tailwind CSS Standard (No Material UI)

This project has officially transitioned to **Shadcn UI (`@/components/ui/*`)** and **Tailwind CSS v4**. To ensure consistent, modern, enterprise SaaS aesthetics (Linear/Stripe-inspired), strictly adhere to these directives:

### Core UI Directives
1. **Primary UI Framework**: Use **Shadcn UI** components (`Button`, `Card`, `Table`, `Input`, `Select`, `Checkbox`, `Badge`, `Skeleton`, `AlertDialog`, `Sonner`) backed by Radix UI primitives.
2. **DO NOT USE Material UI (MUI)**:
   - Do NOT import from `@mui/material` or `@mui/icons-material` in new code or refactored pages.
   - Do NOT write MUI `sx={...}` style blocks or create MUI `styled(...)` wrappers.
   - Incrementally replace remaining legacy MUI usages with Shadcn UI and Tailwind utilities.
3. **Corner Radius Mandate ("Bo nhẹ hết cỡ, tuyệt đối không bo tròn")**:
   - Always use micro-radius: `rounded-[3px]`, `rounded-[4px]`, or `rounded-sm` (2px - 5px max).
   - **Banned**: `rounded-full`, `rounded-3xl`, `rounded-2xl`, `rounded-xl`, or pill shapes for buttons, cards, tags, badges, avatars, and inputs.
4. **Icons**: Use **`lucide-react`** exclusively for crisp, modern SVG line icons with standardized sizing (`w-3.5 h-3.5`, `w-4 h-4`, `w-5 h-5`).
5. **Class Name Merging**: Always use `cn()` (combining `clsx` and `tailwind-merge`) when conditionally composing CSS classes.

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
