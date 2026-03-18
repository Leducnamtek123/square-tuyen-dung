# Implementation Plan: JS → TypeScript Migration & Refresh Token

> **Mục tiêu:** Migrate toàn bộ frontend từ JS/JSX sang TS/TSX, cải thiện refresh token flow
> **Phạm vi:** `frontend/src/` — ~107 file JS/JSX → TS/TSX
> **Nguyên tắc:** Incremental migration, không thay đổi logic, mỗi phase phải build thành công

---

## User Review Required

> [!IMPORTANT]
> - File `services/axiosClient.ts` là dead code (không file nào import). Kế hoạch sẽ **xóa** file này.
> - Typo `CLIENT_SECRECT` sẽ được giữ nguyên trong Phase 0-4 để tránh breaking change, chỉ sửa ở Phase 5.
> - Cookie security flags (`secure`, `sameSite`) sẽ chỉ bật `secure` khi protocol là HTTPS (tương thích local dev HTTP).

---

## Proposed Changes

### Phase 0: Type Foundation & Cleanup

Tạo type system base, xóa dead code, fix cookie security.

---

#### [NEW] [api.ts](file:///c:/Users/leduc/Documents/square-tuyen-dung-1/frontend/src/types/api.ts)

Tạo file `src/types/api.ts` với nội dung:

```typescript
import type { AxiosRequestConfig } from 'axios';

/** Standard API response wrapper used by Django's MyJSONRenderer. */
export interface ApiResponse<T = unknown> {
  data: T;
  errors: Record<string, string[]> | null;
}

/** Paginated list response from DRF CustomPagination. */
export interface PaginatedResponse<T = unknown> {
  count: number;
  results: T[];
}

/** Shape of error payloads returned by the backend. */
export interface ApiError {
  errorMessage?: string[];
  [field: string]: string[] | undefined;
}

/** Axios config extended with retry flag (used by httpRequest interceptor). */
export interface RetryAxiosRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}
```

---

#### [NEW] [auth.ts](file:///c:/Users/leduc/Documents/square-tuyen-dung-1/frontend/src/types/auth.ts)

Tạo file `src/types/auth.ts` với nội dung:

```typescript
/** OAuth2 token pair returned by the Django backend. */
export interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type?: string;
  expires_in?: number;
  scope?: string;
}

/** Supported role names matching backend variable_system.py. */
export type RoleName = 'ADMIN' | 'EMPLOYER' | 'JOB_SEEKER';

/** OAuth provider identifiers. */
export type AuthProvider = 'email' | 'facebook' | 'google-oauth2';

/** Frontend AUTH_CONFIG shape (from configs/constants). */
export interface AuthConfigShape {
  CLIENT_ID: string;
  CLIENT_SECRECT: string;
  BACKEND_KEY: string;
  ACCESS_TOKEN_KEY: string;
  REFRESH_TOKEN_KEY: string;
  REFRESH_TOKEN_GRANT: string;
  PASSWORD_KEY: string;
  CONVERT_TOKEN_KEY: string;
  FACEBOOK_CLIENT_ID: string;
  FACEBOOK_CLIENT_SECRET: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  GOONGAPI_KEY: string;
  JOB_SEEKER_BOT: BotConfig;
  EMPLOYER_BOT: BotConfig;
  BOT_RENDER_MODE: string;
}

export interface BotConfig {
  AGENT_ID: string;
  CHAT_TITLE: string;
  CHAT_ICON: string;
}
```

---

#### [NEW] [models.ts](file:///c:/Users/leduc/Documents/square-tuyen-dung-1/frontend/src/types/models.ts)

Tạo file `src/types/models.ts` với nội dung:

```typescript
import type { RoleName } from './auth';

/* ──────────────────── User & Auth ──────────────────── */

export interface User {
  id: number;
  email: string;
  fullName?: string;
  full_name?: string;
  roleName?: RoleName;
  role_name?: RoleName;
  avatarUrl?: string | null;
  hasCompany?: boolean;
  has_company?: boolean;
  isVerifyEmail?: boolean;
  is_verify_email?: boolean;
  workspaces?: Workspace[];
  canAccessEmployerPortal?: boolean;
}

export interface Workspace {
  type: 'company' | 'job_seeker';
  companyId?: number | null;
  label?: string;
  isDefault?: boolean;
}

export interface NormalizedWorkspace {
  type: 'company' | 'job_seeker';
  companyId: number | null;
  label: string;
}

/* ──────────────────── Company ──────────────────── */

export interface Company {
  id: number;
  companyName: string;
  company_name?: string;
  slug: string;
  companyEmail?: string;
  companyPhone?: string;
  websiteUrl?: string | null;
  description?: string | null;
  employeeSize?: number | null;
  since?: string | null;
  logoUrl?: string | null;
  coverImageUrl?: string | null;
  location?: Location | null;
  fieldOperation?: string | null;
  followersCount?: number;
  jobPostsCount?: number;
}

/* ──────────────────── Job ──────────────────── */

export interface JobPost {
  id: number;
  jobName: string;
  job_name?: string;
  slug: string;
  deadline: string;
  quantity: number;
  salaryMin: number;
  salaryMax: number;
  isHot?: boolean;
  isUrgent?: boolean;
  status: 1 | 2 | 3;
  views?: number;
  position?: number;
  experience?: number;
  academicLevel?: number;
  jobType?: number;
  typeOfWorkplace?: number;
  genderRequired?: string | null;
  jobDescription?: string;
  jobRequirement?: string | null;
  benefitsEnjoyed?: string | null;
  contactPersonName?: string;
  contactPersonPhone?: string;
  contactPersonEmail?: string;
  career?: Career | null;
  company?: Company | null;
  location?: Location | null;
  createAt?: string;
}

export interface JobPostActivity {
  id: number;
  fullName?: string;
  email?: string;
  phone?: string;
  status: number;
  isSentEmail?: boolean;
  isDeleted?: boolean;
  jobPost?: JobPost;
  resume?: Resume;
  createAt?: string;
  aiAnalysisScore?: number | null;
  aiAnalysisSummary?: string | null;
  aiAnalysisStatus?: 'pending' | 'processing' | 'completed' | 'failed';
}

/* ──────────────────── Resume & Profile ──────────────────── */

export interface Resume {
  id: number;
  title?: string;
  slug: string;
  description?: string | null;
  salaryMin?: number;
  salaryMax?: number;
  expectedSalary?: number | null;
  skillsSummary?: string | null;
  position?: number | null;
  experience?: number | null;
  academicLevel?: number | null;
  typeOfWorkplace?: number | null;
  jobType?: number | null;
  isActive?: boolean;
  type?: string;
  fileUrl?: string | null;
  city?: City | null;
  career?: Career | null;
  createAt?: string;
}

export interface JobSeekerProfile {
  id: number;
  phone?: string | null;
  birthday?: string | null;
  gender?: 'M' | 'F' | 'O' | null;
  maritalStatus?: 'S' | 'M' | null;
  location?: Location | null;
}

export interface EducationDetail {
  id: number;
  degreeName: string;
  major: string;
  trainingPlaceName: string;
  startDate: string;
  completedDate?: string | null;
  description?: string | null;
}

export interface ExperienceDetail {
  id: number;
  jobName: string;
  companyName: string;
  startDate: string;
  endDate: string;
  description?: string | null;
}

export interface Certificate {
  id: number;
  name: string;
  trainingPlace: string;
  startDate: string;
  expirationDate?: string | null;
}

export interface LanguageSkill {
  id: number;
  language: number;
  level: number;
}

export interface AdvancedSkill {
  id: number;
  name: string;
  level: number;
}

/* ──────────────────── Common ──────────────────── */

export interface Career {
  id: number;
  name: string;
  slug?: string;
  iconUrl?: string | null;
}

export interface City {
  id: number;
  name: string;
  slug?: string;
}

export interface District {
  id: number;
  name: string;
  city?: City;
}

export interface Location {
  id: number;
  city?: City;
  district?: District;
  address?: string;
}

/* ──────────────────── Interview ──────────────────── */

export interface InterviewSession {
  id: number;
  roomName: string;
  inviteToken?: string;
  status: string;
  type: string;
  scheduledAt?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  duration?: number | null;
  candidate?: User;
  jobPost?: JobPost | null;
  createdBy?: User | null;
  aiOverallScore?: number | null;
  aiSummary?: string | null;
  aiStrengths?: string[] | null;
  aiWeaknesses?: string[] | null;
}

export interface InterviewEvaluation {
  id: number;
  attitudeScore?: number | null;
  professionalScore?: number | null;
  overallScore?: number | null;
  result: 'passed' | 'failed' | 'pending';
  comments?: string | null;
  proposedSalary?: number | null;
}

/* ──────────────────── Misc ──────────────────── */

export interface Notification {
  id: number;
  title: string;
  content: string;
  imageUrl?: string | null;
  type?: string;
  isRead?: boolean;
  createAt?: string;
}

export interface Feedback {
  id: number;
  content: string;
  rating: number;
  createAt?: string;
}

export interface Banner {
  id: number;
  imageUrl: string;
  description?: string;
  bannerType: number;
}

export interface SystemConfig {
  careers?: Career[];
  cities?: City[];
  banners?: Banner[];
  socialMediaLinks?: Record<string, string>;
  companyInfo?: Record<string, string>;
  [key: string]: unknown;
}
```

---

#### [NEW] [store.ts](file:///c:/Users/leduc/Documents/square-tuyen-dung-1/frontend/src/types/store.ts)

Tạo file `src/types/store.ts` với nội dung:

```typescript
import type store from '../redux/store';

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

> **Lưu ý:** File này sẽ hoạt động đúng SAU KHI `redux/store.js` được rename thành `store.ts` (Phase 1). Trước đó, tạm để file này nhưng chưa import.

---

#### [NEW] [index.ts](file:///c:/Users/leduc/Documents/square-tuyen-dung-1/frontend/src/types/index.ts)

Tạo file `src/types/index.ts` với nội dung:

```typescript
export * from './api';
export * from './auth';
export * from './models';
// store types re-exported after Phase 1
```

---

#### [NEW] [useAppStore.ts](file:///c:/Users/leduc/Documents/square-tuyen-dung-1/frontend/src/hooks/useAppStore.ts)

Tạo file `src/hooks/useAppStore.ts` với nội dung:

```typescript
import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';

// Inline types until store.ts is migrated in Phase 1.
// After Phase 1, switch to: import type { RootState, AppDispatch } from '../types/store';
type RootState = any;
type AppDispatch = any;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

---

#### [DELETE] [axiosClient.ts](file:///c:/Users/leduc/Documents/square-tuyen-dung-1/frontend/src/services/axiosClient.ts)

Xóa file `src/services/axiosClient.ts` — dead code, không có file nào import.

---

#### [MODIFY] [tokenService.ts](file:///c:/Users/leduc/Documents/square-tuyen-dung-1/frontend/src/services/tokenService.ts)

Thêm cookie security flags và proper TypeScript types. Thay thế toàn bộ nội dung bằng:

```typescript
import Cookies from 'js-cookie';
import { AUTH_CONFIG } from '../configs/constants';

/** Cookie options — enable `secure` only over HTTPS so local dev still works. */
const baseCookieOptions: Cookies.CookieAttributes = {
  sameSite: 'Lax' as const,
  secure: typeof window !== 'undefined' && window.location.protocol === 'https:',
};

const tokenService = {
  getAccessTokenFromCookie: (): string | null => {
    try {
      const accessToken = Cookies.get(AUTH_CONFIG.ACCESS_TOKEN_KEY);
      return accessToken && accessToken !== 'undefined' ? accessToken : null;
    } catch {
      return null;
    }
  },

  getRefreshTokenFromCookie: (): string | null => {
    try {
      const refreshToken = Cookies.get(AUTH_CONFIG.REFRESH_TOKEN_KEY);
      return refreshToken && refreshToken !== 'undefined' ? refreshToken : null;
    } catch {
      return null;
    }
  },

  getProviderFromCookie: (): string | null => {
    try {
      const provider = Cookies.get(AUTH_CONFIG.BACKEND_KEY);
      return provider && provider !== 'undefined' ? provider : null;
    } catch {
      return null;
    }
  },

  saveAccessTokenAndRefreshTokenToCookie: (
    accessToken: string,
    refreshToken: string,
    provider: string | null | undefined,
  ): boolean => {
    try {
      Cookies.set(AUTH_CONFIG.ACCESS_TOKEN_KEY, accessToken, {
        ...baseCookieOptions,
        expires: 7,   // 7 days — server-side TTL is the real expiry
      });
      Cookies.set(AUTH_CONFIG.REFRESH_TOKEN_KEY, refreshToken, {
        ...baseCookieOptions,
        expires: 30,  // 30 days
      });
      if (provider) {
        Cookies.set(AUTH_CONFIG.BACKEND_KEY, provider, {
          ...baseCookieOptions,
          expires: 30,
        });
      }
      return true;
    } catch {
      return false;
    }
  },

  removeAccessTokenAndRefreshTokenFromCookie: (): boolean => {
    try {
      Cookies.remove(AUTH_CONFIG.ACCESS_TOKEN_KEY);
      Cookies.remove(AUTH_CONFIG.REFRESH_TOKEN_KEY);
      Cookies.remove(AUTH_CONFIG.BACKEND_KEY);
      return true;
    } catch {
      return false;
    }
  },
};

export default tokenService;
```

**Thay đổi chính:**
- Cookie expires: `365` → `7` ngày (access), `30` ngày (refresh)
- Thêm `sameSite: 'Lax'`, `secure: true` khi HTTPS
- Thêm TypeScript types cho tất cả methods
- Fix check `!== undefined` string lỗi → `!== 'undefined'`

---

#### [MODIFY] [httpRequest.ts](file:///c:/Users/leduc/Documents/square-tuyen-dung-1/frontend/src/utils/httpRequest.ts)

Chỉ sửa type annotations, KHÔNG thay đổi logic. Các thay đổi:

1. **Dòng 58:** `const isPublicEndpoint = (url) =>` → `const isPublicEndpoint = (url: string | undefined): boolean =>`
2. **Dòng 65:** `const isAuthTokenEndpoint = (url) =>` → `const isAuthTokenEndpoint = (url: string | undefined): boolean =>`
3. **Dòng 70:** `const unwrapResponse = (response: any)` → `const unwrapResponse = (response: { data?: { data?: unknown } })`
4. **Dòng 72:** `let refreshPromise: Promise<any> | null` → `let refreshPromise: Promise<unknown> | null`
5. **Dòng 127:** `const originalConfig = error.config as any;` → `const originalConfig = error.config as RetryAxiosRequestConfig;`

Thêm import ở đầu file:
```typescript
import type { RetryAxiosRequestConfig } from '../types/api';
```

---

### Phase 1: Core Layer

Migrate Redux store, tất cả utils, và tất cả configs.

---

#### [MODIFY] [store.js → store.ts](file:///c:/Users/leduc/Documents/square-tuyen-dung-1/frontend/src/redux/store.js)

Rename file `src/redux/store.js` → `src/redux/store.ts`. Nội dung mới:

```typescript
import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import configReducer from './configSlice';
import authReducer from './authSlice';
import filterReducer from './filterSlice';
import profileReducer from './profileSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    config: configReducer,
    filter: filterReducer,
    profile: profileReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
```

Sau đó cập nhật `src/types/store.ts` để import từ store:
```typescript
export type { RootState, AppDispatch } from '../redux/store';
```

Và cập nhật `src/hooks/useAppStore.ts`:
```typescript
import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from '../redux/store';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

Và cập nhật `src/types/index.ts` thêm:
```typescript
export * from './store';
```

---

#### Utils Migration (12 files)

**Pattern chung cho mỗi util file:** Rename `.js` → `.ts`, thêm parameter types và return types.

**`utils/toastMessages.js` → `.ts`:** Thêm types cho params.

**`utils/errorHandling.js` → `.ts`:** 
```typescript
import type { AxiosError } from 'axios';
import type { ApiError } from '../types/api';
import toastMessages from './toastMessages';

type SetError = ((errors: Record<string, unknown>) => void) | null;

const errorHandling = (error: AxiosError<{ errors?: ApiError }>, setError: SetError = null): void => {
  // ... giữ nguyên logic ...
};
export default errorHandling;
```

**`utils/funcUtils.js` → `.ts`:**
```typescript
const downloadPdf = async (url: string, fileName?: string): Promise<void> => { ... };
export const formatRoute = (route: string, value: string, paramKey = ':slug'): string => { ... };
export const buildURL = (hostname: string): string => { ... };
```

**`utils/dateHelper.js` → `.ts`:** Thêm return types.
**`utils/presignUrl.js` → `.ts`:** Thêm param/return types.
**`utils/sweetalert2Modal.js` → `.ts`:** Thêm types.
**`utils/customData.js` → `.ts`:** Thêm types.
**`utils/editorUtils.js` → `.ts`:** Thêm types.
**`utils/generalFunction.js` → `.ts`:** Thêm types.
**`utils/xlsxUtils.js` → `.ts`:** Thêm types.
**`utils/transformers.js` → `.ts`:** Thêm types.

---

#### Configs Migration (6 files)

**`configs/constants.js` → `.ts`:** Thêm `as const` assertions cho các object literals. Export types cho ROUTES, AUTH_CONFIG, etc.

**`configs/portalRouting.js` → `.ts`:** Thêm param types:
```typescript
export const isAdminPortalPath = (pathname: string): boolean => { ... };
export const isEmployerPortalPath = (pathname: string): boolean => { ... };
export const getPreferredLanguage = (): string => { ... };
export const normalizePortalPath = (pathname: string, lang: string): string => { ... };
```

**`configs/routeLocalization.js` → `.ts`:** Thêm types.
**`configs/firebase-config.js` → `.ts`:** Thêm types.
**`configs/dayjs-config.js` → `.ts`:** Simple rename (no type changes needed).
**`configs/moment-config.js` → `.ts`:** Simple rename.

**`routes/index.jsx` → `.tsx`:** Simple rename.

---

#### Update ESLint config

Sửa `eslint.config.js` dòng 11:
```diff
-    files: ["src/**/*.{js,jsx}"],
+    files: ["src/**/*.{js,jsx,ts,tsx}"],
```

Sửa `tsconfig.eslint.json`:
```diff
-  "include": ["src/**/*.js", "src/**/*.jsx"]
+  "include": ["src/**/*.js", "src/**/*.jsx", "src/**/*.ts", "src/**/*.tsx"]
```

---

### Phase 2: Services (32 files)

**Pattern cho MỌI service file:** Rename `.js` → `.ts`, thêm types.

**Template:**
```typescript
// BEFORE: someService.js
import httpRequest from '../utils/httpRequest';

const someService = {
  getData: (params = {}) => {
    const url = 'some/endpoint/';
    return httpRequest.get(url, { params });
  },
  createItem: (data) => {
    const url = 'some/endpoint/';
    return httpRequest.post(url, data);
  },
};
export default someService;

// AFTER: someService.ts
import httpRequest from '../utils/httpRequest';
import type { PaginatedResponse } from '../types/api';
import type { SomeModel } from '../types/models';

const someService = {
  getData: (params: Record<string, unknown> = {}): Promise<PaginatedResponse<SomeModel>> => {
    const url = 'some/endpoint/';
    return httpRequest.get(url, { params });
  },
  createItem: (data: Partial<SomeModel>): Promise<SomeModel> => {
    const url = 'some/endpoint/';
    return httpRequest.post(url, data);
  },
};
export default someService;
```

**Danh sách 32 files cần rename từ `.js` → `.ts`:**

1. `services/authService.js` → `.ts`
2. `services/jobService.js` → `.ts`
3. `services/companyService.js` → `.ts`
4. `services/resumeService.js` → `.ts`
5. `services/commonService.js` → `.ts`
6. `services/jobPostActivityService.js` → `.ts`
7. `services/jobPostNotificationService.js` → `.ts`
8. `services/companyImageService.js` → `.ts`
9. `services/companyTeamService.js` → `.ts`
10. `services/companyFollowed.js` → `.ts`
11. `services/jobSeekerProfileService.js` → `.ts`
12. `services/educationDetailService.js` → `.ts`
13. `services/expericenDetailService.js` → `.ts`
14. `services/certificateService.js` → `.ts`
15. `services/languageSkillService.js` → `.ts`
16. `services/advancedSkillService.js` → `.ts`
17. `services/interviewService.js` → `.ts`
18. `services/questionService.js` → `.ts`
19. `services/questionGroupService.js` → `.ts`
20. `services/adminService.js` → `.ts`
21. `services/adminManagementService.js` → `.ts`
22. `services/adminJobService.js` → `.ts`
23. `services/adminInterviewService.js` → `.ts`
24. `services/adminSettingsService.js` → `.ts`
25. `services/firebaseService.js` → `.ts`
26. `services/goongService.js` → `.ts`
27. `services/mediaService.js` → `.ts`
28. `services/projectService.js` → `.ts`
29. `services/statisticService.js` → `.ts`
30. `services/userService.js` → `.ts`
31. `services/resumeSavedService.js` → `.ts`
32. `services/resumeViewedService.js` → `.ts`

Cho mỗi file: rename `.js` → `.ts`, thêm parameter types (string, number, Record<string, unknown>, etc.), thêm return type hints. Không cần thay đổi logic.

---

### Phase 3: Shared Components & Hooks (~55 files)

**Pattern cho MỌI component file:** Rename `.jsx` → `.tsx`, tạo Props interface.

**Template:**
```tsx
// BEFORE: SomeComponent/index.jsx
const SomeComponent = ({ title, onClose, data }) => {
  return <div>{title}</div>;
};
export default SomeComponent;

// AFTER: SomeComponent/index.tsx
interface SomeComponentProps {
  title: string;
  onClose?: () => void;
  data?: Record<string, unknown>;
}

const SomeComponent = ({ title, onClose, data }: SomeComponentProps) => {
  return <div>{title}</div>;
};
export default SomeComponent;
```

**Hooks (10 files):** Rename `.js/.jsx` → `.ts/.tsx`, thêm types.
**Components (45 dirs):** Rename mỗi `index.jsx` → `index.tsx`, tạo Props interface.
**Context (1 file):** Rename `ChatProvider.jsx` → `.tsx`.

---

### Phase 4: Pages & Layouts (~118 files)

Giống Phase 3 nhưng cho pages và layouts. Rename `.jsx` → `.tsx`, thêm Props interfaces cho mỗi page component.

**Layouts (22 files):** Rename `.jsx` → `.tsx`.
**Pages (~96 files):** Rename `.jsx` → `.tsx`.
**Page hooks (~15 files):** Rename `.js` → `.ts`.

---

### Phase 5: Strict Mode & Final Cleanup

#### [MODIFY] [tsconfig.json](file:///c:/Users/leduc/Documents/square-tuyen-dung-1/frontend/tsconfig.json)

```diff
 {
   "compilerOptions": {
     "target": "ESNext",
     "lib": ["ESNext", "DOM", "DOM.Iterable"],
     "module": "ESNext",
     "moduleResolution": "Bundler",
     "jsx": "react-jsx",
     "resolveJsonModule": true,
-    "allowJs": true,
-    "checkJs": false,
-    "strict": false,
+    "allowJs": false,
+    "strict": true,
+    "noImplicitAny": true,
+    "strictNullChecks": true,
     "noEmit": true,
     "baseUrl": ".",
     "paths": {
       "@/*": ["src/*"]
     },
     "types": ["vite/client", "node"],
     "skipLibCheck": true
   },
   "include": ["src"]
 }
```

Fix global typos:
- `CLIENT_SECRECT` → `CLIENT_SECRET` (search-replace across all files)
- `REGEX_VATIDATE` → `REGEX_VALIDATE`
- `expericenDetailService` → `experienceDetailService` (rename file + update imports)

---

## Verification Plan

### Automated Tests

Sau **MỖI phase**, chạy:

```powershell
# 1. TypeScript type check (phải pass với 0 errors)
cd c:\Users\leduc\Documents\square-tuyen-dung-1\frontend
npx tsc --noEmit

# 2. Vite build (phải thành công)
npm run build

# 3. ESLint (thông tin, không blocking)
npm run lint
```

**Tiêu chí PASS cho mỗi phase:**
- `npx tsc --noEmit` — exit code 0 (không có error)
- `npm run build` — tạo thành công thư mục `build/`
- Không có file `.js/.jsx` nào còn lại trong scope của phase đó

### Manual Verification

Sau Phase 0 (refresh token changes):
1. Mở app ở browser (`npm run start`)
2. Login với tài khoản test
3. Kiểm tra DevTools → Application → Cookies:
   - `access_token` cookie phải có `SameSite=Lax`
   - Expires phải là ~7 ngày (không phải 365 ngày)
4. Đợi token hết hạn (hoặc xóa access_token cookie thủ công) → App phải tự refresh token mà không bị logout

> [!IMPORTANT]
> Nếu bạn có thể chạy app locally, hãy kiểm tra manual sau Phase 0. Nếu không, chỉ cần verify bằng build test.
