# PLAN: React Doctor Deep Optimization

> **Task:** Fix errors and warnings identified by `react-doctor` to improve stability, performance, and maintainability of the frontend.
> **Project Type:** WEB (Next.js 16+, Tailwind CSS 4, TypeScript)

## 🎯 Success Criteria

- [ ] 0 Errors in `react-doctor` scan.
- [ ] < 10 Warnings in `react-doctor` scan (or only unavoidable ones).
- [ ] Full React Compiler optimization for core components.
- [ ] Proper hydration and Suspense boundaries for all dynamic routes.
- [ ] No hook violations or components defined within renders.

## 🛠 Tech Stack

- **Next.js 16 (App Router)**: Utilizing Server Components and Server Actions.
- **React 19**: Leveraging React Compiler and new hooks.
- **Tailwind CSS 4**: Modern styling with optimized transitions.
- **TypeScript**: Strict typing to prevent regressions.

---

## 📅 Task Breakdown

### Phase 1: Critical & Compiler Fixes
*Goal: Fix blockers that prevent the React Compiler from optimizing and fix runtime hook violations.*

| ID | Task | Agent | Priority | Dependencies |
|---|---|---|---|---|
| 1.1 | Fix `useBrowserSpeech` hook violation in `interview/[id]/page.tsx` | `frontend-specialist` | P0 | None |
| 1.2 | Move components defined inside render to module scope in `sidebar.tsx` | `frontend-specialist` | P0 | None |
| 1.3 | Fix variable modification outside component in `sign-in` page | `frontend-specialist` | P0 | None |
| 1.4 | Resolve synchronous `setState` in effects (Fix cascading renders) | `frontend-specialist` | P1 | None |
| 1.5 | Fix `finally` blocks in components to assist React Compiler | `frontend-specialist` | P1 | None |

### Phase 2: Architecture & Hydration
*Goal: Ensure the app hydrates correctly and doesn't bail out to client-side rendering.*

| ID | Task | Agent | Priority | Dependencies |
|---|---|---|---|---|
| 2.1 | Wrap `useSearchParams` usages in `<Suspense>` boundaries | `frontend-specialist` | P0 | None |
| 2.2 | Replace `useEffect` state resets with `key` prop pattern | `frontend-specialist` | P1 | None |
| 2.3 | Extract default `[]` array props to module constants | `frontend-specialist` | P2 | None |

### Phase 3: Component Refactoring
*Goal: Break down large components and simplify state management.*

| ID | Task | Agent | Priority | Dependencies |
|---|---|---|---|---|
| 3.1 | Implement `useReducer` for `PublicInterviewPage` (9+ states) | `frontend-specialist` | P1 | 1.1 |
| 3.2 | Split `PublicInterviewPage` into smaller sub-components | `frontend-specialist` | P1 | 3.1 |
| 3.3 | Implement `useReducer` for `BulkImportModal` | `frontend-specialist` | P1 | None |
| 3.4 | Extract inline render functions to named components | `frontend-specialist` | P2 | None |

### Phase 4: Polish & Performance
*Goal: Standardize styling, keys, and event handling.*

| ID | Task | Agent | Priority | Dependencies |
|---|---|---|---|---|
| 4.1 | Replace array `index` keys with stable identifiers | `frontend-specialist` | P2 | None |
| 4.2 | Specific property transitions instead of `transition: all` | `frontend-specialist` | P2 | None |
| 4.3 | Refactor `useEffect` logic back into event handlers | `frontend-specialist` | P2 | None |

---

## 🧪 Phase X: Final Verification

- [ ] **Lint & Types:** `npm run lint && npx tsc --noEmit`
- [ ] **React Doctor Final Audit:** `npx -y react-doctor@latest --yes`
- [ ] **UX Audit:** `python .agent/skills/frontend-design/scripts/ux_audit.py .`
- [ ] **Build Check:** `npm run build`
- [ ] **E2E Smoke Test:** Verify interview flow still functions.

## ✅ PHASE X COMPLETE
- Lint: [ ]
- Security: [ ]
- Build: [ ]
- Date: 2026-02-21
