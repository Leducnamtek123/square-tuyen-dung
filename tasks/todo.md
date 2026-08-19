# Task Checklist: Frontend Modernization & Large-Scale Optimization

## Phase 1: Code-Splitting & Heavy Dependencies Isolation
- [x] **Task 1: Dynamic Import cho các Thư viện Nặng**
  - [x] `@react-pdf-viewer/core` & `pdfjs-dist` dynamic import với Skeleton fallback
  - [x] Map component (`@goongmaps/goong-map-react` & `react-leaflet`) dynamic import
  - [x] Rich-Text Editor (`react-draft-wysiwyg`) dynamic import
  - [x] Chạy typecheck và kiểm tra hydration
- [x] **Task 2: Chuẩn Hóa Cấu Trúc `components/Common`**
  - [x] Rà soát các tệp trong `src/components/Commons`
  - [x] Tạo `src/components/Common/SpaContentTransition.tsx` và re-export tương thích ngược
  - [x] Chạy typecheck kiểm tra đường dẫn

## Checkpoint: Phase 1 (Bundle Health)
- [x] `npm run typecheck --prefix frontend` (Exit code 0)

---

## Phase 2: Mobile UX & Advanced Interactive Components
- [x] **Task 3: Mobile Bottom Sheet cho Bộ Lọc Tìm Kiếm Nâng Cao**
  - [x] Thêm thanh nút hành động "Áp dụng bộ lọc" & "Đặt lại" trên mobile (< 640px) cho `JobPostSearchAdvancedFilters`
  - [x] Giữ nguyên lưới Grid2 trên màn hình desktop (>= 640px)
  - [x] Kiểm tra responsive trên các kích thước 320px, 375px, 768px
- [x] **Task 4: Adaptive Mobile View cho Bảng Tuyển Dụng Kanban ATS**
  - [x] Thêm thanh Tab trạng thái chuyển đổi trên màn hình < 768px trong `AppliedResumeKanban`
  - [x] Co giãn cột toàn màn hình (`width: 100%`) khi ở chế độ mobile tab
  - [x] Giữ nguyên kéo thả đa cột trên màn hình lớn (>= 768px)

## Checkpoint: Phase 2 (Mobile Polish)
- [x] `npm run typecheck --prefix frontend` (Exit code 0)

---

## Phase 3: Asset & Performance Optimization
- [x] **Task 5: Tối Ưu Hóa Core Web Vitals & Font Loading**
  - [x] Xác nhận font Geist `display: 'swap'` và `subsets: ['latin']`
  - [x] Kiểm tra toàn diện chất lượng hiển thị và hiệu năng (1,198 files ts/tsx pass 100%)
