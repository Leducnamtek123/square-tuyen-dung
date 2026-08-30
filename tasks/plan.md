# Implementation Plan: System Modernization & Observability Enhancement

## Overview
Modernize frontend Onboarding and Profile UI components by migrating from deprecated MUI v5 `Grid` and `FormHelperTextProps` to MUI v6 `Grid2` and `slotProps`, eliminating 190+ lint warnings. Enhance frontend and backend observability and error tracking.

## Architecture Decisions
1. **MUI v6 Grid2 Migration**: Standardize all grid layouts across `CandidateOnboardingPage` and `EmployerOnboardingPage` components to `Grid2 as Grid` using `size={{ xs: ..., sm: ... }}` props instead of deprecated `item xs={...}`.
2. **Modern Input SlotProps**: Replace deprecated `FormHelperTextProps` with `slotProps={{ formHelperText: ... }}` across all `TextField` and `Autocomplete` components.
3. **Observability**: Maintain consistent error boundaries and logging.

## Task List

### Phase 1: Employer Onboarding Components Modernization
- [ ] Task 1: Migrate `StepCompanyProfile.tsx` to `Grid2` & `slotProps`
- [ ] Task 2: Migrate `StepRecruiterProfile.tsx` to `Grid2` & `slotProps`
- [ ] Task 3: Migrate `StepEmployerComplete.tsx` to `Grid2` & `slotProps`

### Checkpoint: Employer Onboarding
- [ ] ESLint check passes for Employer Onboarding components with zero warnings.

### Phase 2: Candidate Onboarding Components Modernization
- [ ] Task 4: Migrate `StepSkillsExperience.tsx` to `Grid2` & `slotProps`
- [ ] Task 5: Migrate `StepCareerGoals.tsx` to `Grid2` & `slotProps`
- [ ] Task 6: Migrate `StepCandidateComplete.tsx` to `Grid2` & `slotProps`

### Checkpoint: Candidate Onboarding
- [ ] ESLint check passes for Candidate Onboarding components.

### Phase 3: Verification & Integration
- [ ] Task 7: Full TypeScript typecheck and ESLint pass across the frontend repository.
- [ ] Task 8: Run full unit & integration test suites.

### Checkpoint: Complete
- [ ] 0 TypeScript compilation errors.
- [ ] 0 ESLint errors and reduced deprecation warnings.
- [ ] All test suites passing.
