# 🚀 Kế Hoạch Chuẩn Hoá Cấu Trúc & Phân Tầng Codebase (100% Standardization Plan)

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Chuẩn hoá 100% kiến trúc repository, phân tầng module đúng convention, triệt tiêu toàn bộ circular dependencies, dọn dẹp file rác / dead code / duplicate assets, và đưa điểm chất lượng codebase từ 66.5 lên 98/100.

**Architecture:** Thực thi tuần tự qua 4 Phase tách biệt nhằm đảm bảo an toàn tuyệt đối, không gây gián đoạn hệ thống (Zero Regression):
1. **Phase 1 — Safe Cleanup & Hygiene:** Loại bỏ dead code, rác root, fix layer inversion type.
2. **Phase 2 — Structural Cleanup:** Di chuyển app `common`, seed scripts, tách `config/admin.py` về từng app.
3. **Phase 3 — Architecture & Dependency Normalization:** Chuẩn hoá 1,018 deep relative imports sang `@/*`, hợp nhất date utils, đổi tên `agents-ui`.
4. **Phase 4 — Asset Deduplication & Final Verification:** Hợp nhất 18 nhóm asset duplicate, kiểm tra toàn bộ build frontend & backend.

**Tech Stack:** Next.js 14 / TypeScript / React 18 / TailwindCSS / Django 4.1.7 / DRF / Python 3.11 / pnpm

---

## User Review Required

> [!IMPORTANT]
> **Các thay đổi cấu trúc quan trọng cần lưu ý:**
> 1. **Di chuyển `api/common` thành `api/apps/common`:** Cần cập nhật `INSTALLED_APPS` trong `api/config/settings.py` và đường dẫn import từ các apps khác.
> 2. **Tách `api/config/admin.py` (22KB):** Chuyển các class `ModelAdmin` về `admin.py` của từng app tương ứng (`apps/profiles/admin.py`, `apps/jobs/admin.py`, v.v.).
> 3. **Xoá `frontend/package-lock.json`:** Dự án sử dụng `pnpm-workspace.yaml`, chỉ duy trì `pnpm-lock.yaml`.

---

## Proposed Changes & Tasks

### PHASE 1: SAFE CLEANUP & HYGIENE (ZERO RISK)

---

#### Task 1.1: Triệt tiêu Circular Dependency trong `frontend/src/types/auth.ts`
**Files:**
- Modify: `frontend/src/types/auth.ts:1`
- Modify: `frontend/src/views/components/auths/EmployerSignUpForm/index.tsx`

**Interfaces:**
- Consumes: Interface `EmployerSignUpFormData`
- Produces: Pure type definition `EmployerSignUpFormData` export từ `@/types/auth`

- [ ] **Step 1: Khai báo `EmployerSignUpFormData` trực tiếp trong `types/auth.ts`**
  Chuyển interface definition từ `EmployerSignUpForm/index.tsx` vào `frontend/src/types/auth.ts` và xoá dòng `import type { EmployerSignUpFormData } from '../views/components/auths/EmployerSignUpForm'`.
- [ ] **Step 2: Cập nhật import trong `EmployerSignUpForm/index.tsx`**
  Đổi thành `import type { EmployerSignUpFormData } from '@/types/auth'`.
- [ ] **Step 3: Verify không còn Circular Dependency**
  Chạy kiểm tra import cycles.

---

#### Task 1.2: Dọn dẹp Dead Files, Typo Directory & Lockfile Rác
**Files:**
- Delete: `tuyendungsqstudio.sql` (Root 0-byte file)
- Delete: `frontend/package-lock.json` (Dual lockfile)
- Delete: `frontend/audit_output.md` (Temporary audit log)
- Modify: `frontend/src/layouts/JobSeekerLayout/index.tsx:10`
- Modify: `frontend/src/app/(candidate)/loading.tsx:3`
- Delete: `frontend/src/components/Commons/` (Typo directory)

- [ ] **Step 1: Cập nhật imports trỏ từ `Commons/` về `Common/`**
  Đổi `@/components/Commons/SpaContentTransition` thành `@/components/Common/SpaContentTransition`.
- [ ] **Step 2: Xoá thư mục `frontend/src/components/Commons/`**
- [ ] **Step 3: Xoá các file rác `tuyendungsqstudio.sql`, `package-lock.json`, `audit_output.md`**

---

#### Task 1.3: Dọn dẹp Production Debug Logs & Vệ sinh Root Documents
**Files:**
- Modify: `frontend/src/app/tin-tuc/[slug]/page.tsx:14-16`
- Move: `HCNS.QT.01.F06 v1.3 Cau hoi phong van.doc` ➔ `docs/resources/`
- Move: `ENVIRONMENT_AUDIT.md`, `START_GUIDE.md`, `MIGRATIONS.md` ➔ `docs/`
- Modify: `.gitignore` (Thêm rule ignore `backups/*.sql*` và `frontend/tsconfig.tsbuildinfo`)
- Delete: 5 file backup 20-byte rỗng lỗi trong `backups/` (`*014125.sql.gz`, `*043839.sql.gz`, `*033656.sql.gz`, `*120600.sql.gz`, `*154705.sql.gz`)

- [ ] **Step 1: Xoá `console.log` trong `tin-tuc/[slug]/page.tsx`**
- [ ] **Step 2: Di chuyển các tài liệu root vào `docs/`**
- [ ] **Step 3: Cập nhật `.gitignore` và xoá các file backup lỗi**

---

### PHASE 2: STRUCTURAL CLEANUP & BACKEND REORGANIZATION

---

#### Task 2.1: Chuẩn hoá vị trí Django App `api/common` ➔ `api/apps/common`
**Files:**
- Move: `api/common/` ➔ `api/apps/common/`
- Modify: `api/config/settings.py` (Cập nhật `INSTALLED_APPS` từ `'common'` hoặc `'common.apps.CommonConfig'` thành `'apps.common.apps.CommonConfig'`)
- Modify: Các file backend đang import `from common...` thành `from apps.common...`

- [ ] **Step 1: Di chuyển thư mục `api/common` vào `api/apps/common`**
- [ ] **Step 2: Cập nhật `api/apps/common/apps.py` (`name = 'apps.common'`)**
- [ ] **Step 3: Cập nhật `api/config/settings.py` và các imports liên quan**
- [ ] **Step 4: Chạy `python api/manage.py check` để kiểm tra Django system check**

---

#### Task 2.2: Di chuyển Database Seed & Maintenance Scripts
**Files:**
- Move: `api/reset_db.py` ➔ `api/scripts/reset_db.py`
- Move: `api/seed_jobs.py` ➔ `api/scripts/seed_jobs.py`
- Move: `api/seed_users.py` ➔ `api/scripts/seed_users.py`

- [ ] **Step 1: Di chuyển các file vào `api/scripts/`**
- [ ] **Step 2: Cập nhật đường dẫn thực thi trong documentation và scripts nếu có**

---

#### Task 2.3: Di chuyển `interviews_compat_views.py` và Tách `api/config/admin.py`
**Files:**
- Move: `api/config/interviews_compat_views.py` ➔ `api/apps/interviews/views_compat.py`
- Modify: `api/config/urls.py` (Cập nhật import endpoint)
- Split: `api/config/admin.py` (Chuyển các `ModelAdmin` vào `api/apps/profiles/admin.py`, `api/apps/jobs/admin.py`, `api/apps/interviews/admin.py`, `api/apps/accounts/admin.py`)

- [ ] **Step 1: Di chuyển `interviews_compat_views.py` vào `apps/interviews/` và cập nhật `urls.py`**
- [ ] **Step 2: Phân bổ các class `ModelAdmin` về `admin.py` của từng app**
- [ ] **Step 3: Rút gọn `api/config/admin.py` chỉ giữ lại cấu hình global admin site**

---

#### Task 2.4: Hợp nhất Cấu hình Frontend & Task Tracking
**Files:**
- Move: `frontend/src/themeConfigs/*` ➔ `frontend/src/configs/theme/`
- Update: Imports liên quan từ `@/themeConfigs/...` ➔ `@/configs/theme/...`
- Move: `tasks/` (root) & `frontend/tasks/` ➔ `docs/tasks/`

- [ ] **Step 1: Di chuyển `themeConfigs` vào `configs/theme` và cập nhật imports**
- [ ] **Step 2: Gom các file markdown trong `tasks/` vào `docs/tasks/`**

---

### PHASE 3: ARCHITECTURE & DEPENDENCY NORMALIZATION

---

#### Task 3.1: Chuẩn hoá 1,018 Deep Relative Imports (`../../../`) sang Path Alias `@/*`
**Files:**
- Modify: Toàn bộ các file trong `frontend/src/` đang chứa import relative sâu `../../..`

- [ ] **Step 1: Viết script tự động rewrite các relative import sâu sang `@/...`**
- [ ] **Step 2: Chạy script và kiểm tra cú pháp toàn bộ frontend**
- [ ] **Step 3: Chạy TypeScript check `pnpm build` hoặc `tsc --noEmit` để đảm bảo 0 lỗi syntax**

---

#### Task 3.2: Hợp nhất 11 hàm format ngày giờ phân tán về `dateHelper.ts`
**Files:**
- Enhance: `frontend/src/utils/dateHelper.ts` (Bổ sung `formatDate`, `formatTime`, `formatTimer`, `formatDateForApi` đầy đủ)
- Modify: 11 file đang tự định nghĩa hàm date format cục bộ

- [ ] **Step 1: Bổ sung các helpers chuẩn hoá vào `src/utils/dateHelper.ts`**
- [ ] **Step 2: Refactor các components/services sử dụng trực tiếp hàm từ `dateHelper`**

---

#### Task 3.3: Chuẩn hoá Naming Thư mục `agents-ui`
**Files:**
- Move: `frontend/src/components/agents-ui/` ➔ `frontend/src/components/Features/AgentsUI/`
- Update: Imports tương ứng trong `src/views/agentAssistantPage/`

- [ ] **Step 1: Di chuyển và đổi tên thư mục sang PascalCase chuẩn**
- [ ] **Step 2: Cập nhật imports**

---

### PHASE 4: ASSET DEDUPLICATION & FINAL SYSTEM VERIFICATION

---

#### Task 4.1: Deduplicate 18 nhóm Assets trùng khớp SHA-256
**Files:**
- Remove copies:
  - `frontend/public/infohr-icons/` (Xoá các bản sao trùng với `frontend/public/`)
  - `frontend/src/app/android-chrome-*.png`, `apple-touch-icon.png`, `favicon.ico` (Giữ lại tại `frontend/public/` hoặc config Next.js chuẩn)
  - `frontend/src/assets/images/company_cover_default.png` vs `frontend/public/company_cover_default.png`
  - `frontend/src/assets/images/company_logo_default.png` vs `frontend/public/company_logo_default.png`
  - `frontend/src/assets/images/loading/loading-spinner.gif` vs `frontend/public/loading-spinner.gif`
- Update: Cập nhật references trỏ về đúng 1 nguồn asset duy nhất

- [ ] **Step 1: Xoá các asset trùng lặp**
- [ ] **Step 2: Kiểm tra tất cả references trong code để đảm bảo hình ảnh hiển thị 100%**

---

## Verification Plan

### Automated Tests
1. **Frontend Type Check & Lint:**
   ```bash
   cd frontend && npx tsc --noEmit
   ```
2. **Frontend Unit/E2E Tests:**
   ```bash
   cd frontend && npm test -- --passWithNoTests
   ```
3. **Backend Django System Check:**
   ```bash
   cd api && python manage.py check
   ```
4. **Backend Test Suite:**
   ```bash
   cd api && pytest -q
   ```
5. **Asset Integrity Check:**
   Chạy script verify mọi asset references trong frontend & backend đều trỏ tới file tồn tại thực tế.

### Manual Verification
- Kiểm tra hiển thị trang chủ, CV Editor (`/cv-builder/editor`), trang việc làm, logo, favicon, và các banner tuyển dụng.
