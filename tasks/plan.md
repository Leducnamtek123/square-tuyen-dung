# Implementation Plan: Frontend Modernization & Large-Scale Optimization

## Overview
Kế hoạch chi tiết phân rã các đầu việc hiện đại hóa toàn bộ 1,198 files của hệ thống Frontend InfoHR. Kế hoạch tập trung vào 3 trụ cột: Phân tách tải động các thư viện nặng (Code-Splitting), Tối ưu trải nghiệm mobile toàn diện (Bottom Sheet & Kanban Adaptive), và Chuẩn hóa cấu trúc thư mục & tài nguyên (Asset Optimization).

---

## Architecture Decisions
1. **Dynamic Import với `ssr: false`**: Tách các thư viện nặng (> 1MB: PDF Viewer, Leaflet/GoongMap, Draft-JS) ra khỏi main bundle để giảm thời gian tải trang ban đầu (First Load JS).
2. **Adaptive Mobile UX cho ATS & Search**: Chuyển đổi các cấu trúc desktop-first (bảng Kanban 1920px, lưới 10 ô select) sang cấu trúc native mobile (Bottom Sheet và Status Tabs).
3. **Consolidation of Shared Components**: Gom nhóm và thống nhất cấu trúc thư viện components dùng chung.

---

## Task List

### Phase 1: Code-Splitting & Heavy Dependencies Isolation

#### Task 1: Dynamic Import cho các Thư viện Nặng
**Description:** Tách biệt PDF Viewer, Map và Rich-Text Editor khỏi initial bundle bằng `next/dynamic`.
**Acceptance Criteria:**
- [ ] `@react-pdf-viewer/core` và `pdfjs-dist` chỉ được tải khi người dùng mở trang xem/duyệt CV.
- [ ] `@goongmaps/goong-map-react` và `react-leaflet` chỉ được tải khi mở modal bản đồ hoặc trang chi tiết công ty.
- [ ] `react-draft-wysiwyg` chỉ được tải khi mở form soạn thảo tin tuyển dụng/mô tả.
**Verification:**
- [ ] `npm run typecheck --prefix frontend` (Exit code 0)
- [ ] Không có lỗi runtime hydration mismatch.
**Files:**
- `frontend/src/views/jobSeekerPages/AttachedProfilePage/index.tsx`
- `frontend/src/views/employerPages/ProfilePage/index.tsx`
- `frontend/src/views/components/employers/ProfileDetailCard/AttachedDocumentRow.tsx`

#### Task 2: Chuẩn Hóa Cấu Trúc `components/Common`
**Description:** Rà soát và thống nhất việc import giữa `src/components/Common` và `src/components/Commons`.
**Acceptance Criteria:**
- [ ] Xác định các component trùng lặp hoặc legacy trong `components/Commons/`.
- [ ] Cập nhật đường dẫn import nhất quán sang `@/components/Common/...`.
**Verification:**
- [ ] `npm run typecheck --prefix frontend` (Exit code 0)

### Checkpoint: Phase 1 (Bundle Health)
- [ ] Toàn bộ typecheck vượt qua.
- [ ] Không còn cảnh báo import component sai đường dẫn.

---

### Phase 2: Mobile UX & Advanced Interactive Components

#### Task 3: Mobile Bottom Sheet cho Bộ Lọc Tìm Kiếm Nâng Cao
**Description:** Chuyển lưới 10 ô dropdown trong `JobPostSearchAdvancedFilters` thành Drawer/Bottom Sheet trên màn hình < 640px.
**Acceptance Criteria:**
- [ ] Trên Desktop (>= 640px): Giữ nguyên lưới Grid2 trực quan.
- [ ] Trên Mobile (< 640px): Hiển thị nút "Bộ lọc nâng cao (N)" kích hoạt Bottom Sheet trượt từ dưới lên kèm nút "Áp dụng" ghim đáy.
**Verification:**
- [ ] `npm run typecheck --prefix frontend`
- [ ] Thử nghiệm responsive trên viewports 320px, 375px và 768px.
**Files:**
- `frontend/src/views/components/defaults/JobPostSearch/JobPostSearchAdvancedFilters.tsx`
- `frontend/src/views/components/defaults/JobPostSearch/index.tsx`

#### Task 4: Adaptive Mobile View cho Bảng Tuyển Dụng Kanban ATS
**Description:** Xây dựng chế độ hiển thị linh hoạt cho bảng Kanban tuyển dụng của Nhà tuyển dụng.
**Acceptance Criteria:**
- [ ] Trên Desktop (>= 768px): Giữ nguyên bảng 6 cột kéo thả cuộn ngang.
- [ ] Trên Mobile (< 768px): Tự động chuyển sang thanh Tab trạng thái (Mới ứng tuyển, Đã duyệt, Phỏng vấn...) và hiển thị danh sách thẻ dọc của cột được chọn kèm nút chuyển bước nhanh.
**Verification:**
- [ ] `npm run typecheck --prefix frontend`
- [ ] Cập nhật trạng thái ứng viên hoạt động ổn định trên cả mobile và desktop.
**Files:**
- `frontend/src/views/components/employers/AppliedResumeKanban/index.tsx`

### Checkpoint: Phase 2 (Mobile Polish)
- [ ] Bộ lọc và Kanban hoạt động trơn tru trên màn hình cảm ứng di động.

---

### Phase 3: Asset & Performance Optimization

#### Task 5: Tối Ưu Hóa Core Web Vitals & Font Loading
**Description:** Tinh chỉnh cơ chế tải font Geist và cache hình ảnh cho logo công ty và cover.
**Acceptance Criteria:**
- [ ] Font Geist được nạp với `display: 'swap'` và `preload: true`.
- [ ] Thẻ ảnh trong `MuiImageCustom` thiết lập đúng `loading="lazy"` cho các item bên dưới màn hình đầu tiên (below the fold).
**Verification:**
- [ ] `npm run typecheck --prefix frontend`

---

## Risks and Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| Dynamic Import gây giật khung hình (CLS) khi tải | Med | Thêm Skeleton loader với đúng kích thước tương ứng trong `loading: () => <Skeleton height={...} />` |
| Xung đột state khi đổi từ Kanban kéo thả sang Tab trên mobile | Med | Dùng chung một Redux/Local state data source `localRows`, chỉ thay đổi tầng trình diễn UI (Presentation layer) |
