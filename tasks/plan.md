# Implementation Plan: Frontend Full Remediation & Architecture Modernization

## Overview
Based on the independent audit verification across all 128 routes of `square-tuyen-dung`, this plan details the ordered, test-verified remediation of architectural debt, accessibility gaps, route protection vulnerabilities, giant components, i18n inconsistencies, and design token fragmentation.

---

## Architecture Decisions
1. **Vertical Feature Slicing**: Tackle highest-risk P0 security and boundary flaws first, then decouple giant monolithic components using Custom Hooks + Leaf Presenters, followed by global cross-cutting concerns (A11y, i18n, Tokens, Types).
2. **Strict Test & Type Gating**: Every modified module must pass `npm test` and `npx tsc --noEmit` before marking complete.
3. **Preserve Business Logic**: Zero alteration to existing business logic or API contracts unless fixing an explicit defect.

---

## Task Breakdown

### Phase 1: Critical Security & Boundary Fixes (P0)

#### Task 1: Protect Public Route Bypasses (`/online-profile/[slug]` & `/attached-profile/[slug]`)
- **Description**: Currently `src/app/online-profile/[slug]/page.tsx` and `src/app/attached-profile/[slug]/page.tsx` wrap with `DefaultLayout` (public). When an anonymous user opens these URLs, it causes unauthenticated requests and UI flashing. Wrap them with `JobSeekerLayout` or an active auth/permission guard.
- **Acceptance criteria**:
  - Anonymous users are redirected to `/login?redirect=...`.
  - Authenticated candidates can view and edit their profiles properly.
  - Test suites and typecheck pass.
- **Verification**: `npx jest src/layouts/__tests__/` & `npx tsc --noEmit`.
- **Files**:
  - `src/app/online-profile/[slug]/page.tsx`
  - `src/app/attached-profile/[slug]/page.tsx`
- **Scope**: Small (2 files).

---

### Phase 2: Giant Component Refactoring (P1)

#### Task 2: Refactor `ProfileCard/index.tsx` (1,399 lines $\rightarrow$ Sub-modules)
- **Description**: Deconstruct `ProfileCard` into a cohesive custom hook `useProfileCardState.ts` for handling modal state, active tab, CV preview, and API actions, with 3 dedicated sub-views (`ProfileCardHeader.tsx`, `ProfileCardBody.tsx`, `ProfileCardActions.tsx`).
- **Acceptance criteria**:
  - `ProfileCard/index.tsx` reduced to $< 350$ lines.
  - All existing candidate modals, invitations, CV previews, and status updates work identically.
  - Unit tests for ProfileCard pass with 0 regressions.
- **Verification**: `npx jest src/views/components/employers/` & `npx tsc --noEmit`.
- **Files**:
  - `src/views/components/employers/ProfileCard/index.tsx`
  - `src/views/components/employers/ProfileCard/hooks/useProfileCardState.ts` [NEW]
  - `src/views/components/employers/ProfileCard/components/ProfileCardHeader.tsx` [NEW]
  - `src/views/components/employers/ProfileCard/components/ProfileCardBody.tsx` [NEW]
  - `src/views/components/employers/ProfileCard/components/ProfileCardActions.tsx` [NEW]
- **Scope**: Medium (5 files).

#### Task 3: Refactor `agentAssistantPage/index.tsx` (1,241 lines $\rightarrow$ Audio/SSE Hook + Presenter)
- **Description**: Extract Live SSE streaming, audio playback, tool call dispatching into `useAgentStreamingEngine.ts` and isolate ShaderToy WebGL visualizer into a memoized container.
- **Acceptance criteria**:
  - `agentAssistantPage/index.tsx` reduced to $< 400$ lines.
  - Real-time voice/text stream with AI agent works with zero latency degradation.
  - Proper WebGL cleanup on component unmount.
- **Verification**: `npx jest src/views/agentAssistantPage/` & `npx tsc --noEmit`.
- **Files**:
  - `src/views/agentAssistantPage/index.tsx`
  - `src/views/agentAssistantPage/hooks/useAgentStreamingEngine.ts` [NEW]
  - `src/views/agentAssistantPage/components/AgentCanvasVisualizer.tsx` [NEW]
- **Scope**: Medium (3 files).

#### Task 4: Refactor `AIInterviewLayout.tsx` (988 lines $\rightarrow$ LiveKit Hook + Video Container)
- **Description**: Extract LiveKit Room events, participant track subscriptions, and audio analyser into `useLiveKitSession.ts`.
- **Acceptance criteria**:
  - `AIInterviewLayout.tsx` reduced to $< 350$ lines.
  - Video stream, questions card, and transcript sync retain full fidelity.
  - Room disconnect cleans up all camera/mic tracks cleanly.
- **Verification**: `npx jest src/views/interviewPages/` & `npx tsc --noEmit`.
- **Files**:
  - `src/views/interviewPages/AIInterviewLayout.tsx`
  - `src/views/interviewPages/hooks/useLiveKitSession.ts` [NEW]
  - `src/views/interviewPages/components/InterviewVideoGrid.tsx` [NEW]
- **Scope**: Medium (3 files).

---

### Checkpoint: Phase 1 & 2 Completed
- [ ] `npm test` passes (all 114 suites).
- [ ] `npx tsc --noEmit` passes (0 errors).

---

### Phase 3: Accessibility (A11y) Remediation (P1)

#### Task 5: Add Accessible Names to 195 `<IconButton>` instances & 6 Missing `alt` tags
- **Description**: Add `aria-label={t('common:actions.actionName')}` or `title` to all identified `<IconButton>` and missing `alt` attributes to images.
- **Acceptance criteria**:
  - `verify_a11y_deep.mjs` reports 0 missing accessible names on icon buttons.
  - Screen readers can narrate every button action.
- **Verification**: `node scratch/verify_a11y_deep.mjs` & `npm test`.
- **Scope**: Large (Touches multiple view files).

---

### Phase 4: Localization (i18n) Parity & String Extraction (P2)

#### Task 6: Synchronize Missing Keys & Extract Hardcoded Vietnamese Strings
- **Description**: Sync 32 missing keys in EN and 34 in VI across all 12 namespaces. Replace hardcoded UI text in TSX with `useTranslation` hooks.
- **Acceptance criteria**:
  - 100% key parity between `locales/vi/` and `locales/en/`.
  - Switching to English (EN) shows no raw Vietnamese strings.
- **Verification**: `node scratch/verify_i18n_deep.mjs` & `npm test`.
- **Scope**: Large (locale JSON files + views).

---

### Phase 5: Design System Token Consolidation (P2)

#### Task 7: Consolidate 204 HEX Colors into CSS Variables
- **Description**: Define standardized semantic color tokens in `src/app/globals.css` (`--brand-primary`, `--surface-card`, `--text-main`, `--status-success`, etc.) and replace hardcoded HEX references.
- **Acceptance criteria**:
  - Hardcoded HEX outside design tokens reduced by $\ge 80\%$.
  - Design consistency across dark/light surfaces preserved.
- **Verification**: `node scratch/verify_design_tokens.mjs` & visual inspection.
- **Scope**: Medium.

---

### Phase 6: Type Safety & Final Gate Verification (P2/P3)

#### Task 8: Replace Unsafe Type Casts (`as any`) with Strict DTOs
- **Description**: Refactor 138 `as any` and 16 `unknown as` instances into typed DTO interfaces in `src/types/models.ts`.
- **Acceptance criteria**:
  - `npx tsc --noEmit` passes with 0 errors.
  - `verified_type_safety.json` reports $\le 10$ legacy third-party type casts.
- **Verification**: `npx tsc --noEmit` & `npm test`.
- **Scope**: Medium.

---

## Final Production Gate Checklist
- [ ] 128/128 Routes verified
- [ ] 0 Failing unit tests
- [ ] 0 TypeScript compilation errors
- [ ] 0 Broken auth route boundaries
- [ ] 0 Unlabelled icon buttons
- [ ] 0 Missing locale keys
- [ ] All 3 giant components refactored cleanly into SRP sub-modules
