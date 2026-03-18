# Task: JS → TypeScript Migration & Refresh Token

## Phase 0: Foundation & Cleanup
- [x] Create `src/types/api.ts`
- [x] Create `src/types/auth.ts`
- [x] Create `src/types/models.ts`
- [x] Create `src/types/store.ts`
- [x] Create `src/types/index.ts`
- [x] Create `src/hooks/useAppStore.ts`
- [x] Delete `src/services/axiosClient.ts` (dead code)
- [x] Fix `src/services/tokenService.ts` — cookie security + types
- [x] Fix `src/utils/httpRequest.ts` — strengthen types + logout redirect

## Phase 1: Core Layer (Redux + Utils + Configs)
- [x] `redux/store.js` → `store.ts` + export RootState/AppDispatch
- [x] Add interfaces to all redux slices
- [x] `utils/errorHandling.js` → `.ts`
- [x] `utils/toastMessages.js` → `.ts`
- [x] `utils/funcUtils.js` → `.ts`
- [x] `utils/dateHelper.js` → `.ts`
- [x] `utils/presignUrl.js` → `.ts`
- [x] `utils/sweetalert2Modal.js` → `.ts`
- [x] `utils/customData.js` → `.ts`
- [x] `utils/editorUtils.js` → `.ts`
- [x] `utils/generalFunction.js` → `.ts`
- [x] `utils/xlsxUtils.js` → `.ts`
- [x] `utils/transformers.js` → `.ts`
- [x] `configs/constants.js` → `.ts`
- [x] `configs/portalRouting.js` → `.ts`
- [x] `configs/routeLocalization.js` → `.ts`
- [x] `configs/firebase-config.js` → `.ts`
- [x] `configs/dayjs-config.js` → `.ts`
- [x] `configs/moment-config.js` → `.ts`
- [x] `routes/index.jsx` → `.tsx`
- [x] Update `tsconfig.eslint.json` to include `.ts/.tsx`

## Phase 2: Services (32 files)
- [x] All 32 service `.js` files → `.ts` with typed params/returns

## Phase 3: Shared Components & Hooks (~55 files)
- [x] All `hooks/*.js/jsx` → `.ts/.tsx`
- [x] All `components/**/index.jsx` → `index.tsx` with Props interfaces
- [x] `context/ChatProvider.jsx` → `.tsx`

## Phase 4: Pages & Layouts (~118 files)
- [x] All `layouts/**/*.jsx` → `.tsx`
- [x] All `pages/**/*.jsx` → `.tsx`
- [x] All `pages/**/hooks/*.js` → `.ts`

## Phase 5: Strict Mode & Cleanup
- [x] Set `tsconfig.json` → `strict: true`, `allowJs: false`
- [/] Fix all remaining type errors
    - [x] Batch 1: Core Components & Context (`ChatBot`, `ChatProvider`, `AppRouter`)
    - [x] Batch 2: Common UI Elements (`JobPost`, `ApplyForm`, etc.)
    - [x] Batch 3: User Pages (Dashboard, Profile, etc.)
    - [ ] Batch 4: Employer Pages
    - [ ] Batch 5: Admin & Interview Pages
- [x] Update `eslint.config.js` for TS-only
- [ ] Final build verification
