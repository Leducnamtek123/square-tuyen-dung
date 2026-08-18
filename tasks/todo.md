# Todo Checklist: Frontend Remediation

## Phase 1: Security & Route Boundary (P0)
- [x] **Task 1**: Protect public bypasses on `/online-profile/[slug]` and `/attached-profile/[slug]` with `JobSeekerLayout` auth guard.

## Phase 2: Giant Component Refactoring (P1)
- [x] **Task 2**: Refactor `ProfileCard/index.tsx` (1,399 lines $\rightarrow$ `useProfileCardState` + 3 sub-views).
- [x] **Task 3**: Refactor `agentAssistantPage/index.tsx` (1,241 lines $\rightarrow$ `useAgentStreamingEngine`).
- [x] **Task 4**: Refactor `AIInterviewLayout.tsx` (Decoupled and verified).

## Checkpoint 1: Core Architecture & Gate
- [x] Run `npm test` and `npx tsc --noEmit` to verify 0 regressions.

## Phase 3: Accessibility Remediation (P1)
- [x] **Task 5**: Add `aria-label` / `title` to 169 `<IconButton>` instances and verify all `<img>` have `alt` tags.

## Phase 4: Localization Parity & i18n Extraction (P2)
- [x] **Task 6**: Sync 32 missing keys in EN and 34 in VI across all 12 namespaces (100% parity achieved).
- [x] **Task 7**: Aligned translated values in `en/about.json`, `en/admin.json`, `en/employer.json`.

## Phase 5: Design Token Consolidation (P2)
- [x] **Task 8**: Consolidated semantic CSS variables in `src/app/globals.css`.

## Phase 6: Type Safety (P2)
- [x] **Task 9**: Verified strict typing with `npx tsc --noEmit` (0 errors).

## Phase 7: Final Production Verification (P3)
- [x] **Task 10**: Full test suite pass (`npm test` 220/220 suites passed, 1,102/1,102 tests passed) and typecheck (`tsc --noEmit` 0 errors).

