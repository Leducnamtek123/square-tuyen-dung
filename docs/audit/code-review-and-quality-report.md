# Multi-Axis Code Review & Quality Report

**Dự án:** `project-web-app` (Square Tuyển Dụng Frontend)  
**Tiêu chuẩn đánh giá:** 5 Trục chất lượng (Correctness, Readability, Architecture, Security, Performance)  
**Ngày thực hiện:** 30/08/2026  
**Đánh giá tổng thể (Verdict):** ⚠️ **Approve with Required & Recommended Improvements**

---

## 1. Bảng Đánh Giá Theo 5 Trục (Five-Axis Scorecard)

| Trục đánh giá | Điểm | Đánh giá | Trạng thái |
| :--- | :---: | :--- | :---: |
| **1. Correctness (Tính đúng đắn)** | 9/10 | 150+ Jest test suites PASS 100%, 0 lỗi TypeScript strict, chỉ còn 6 cảnh báo dependency hook. | 🟢 Rất tốt |
| **2. Readability & Simplicity (Độ đọc hiểu)** | 7.5/10 | Code format chuẩn mực, nhưng một số file view phình to > 800-1100 dòng gom quá nhiều logic. | 🟡 Cần tách nhỏ |
| **3. Architecture (Kiến trúc)** | 8.5/10 | Phân tầng rõ ràng (`app/`, `views/`, `services/`, `components/`), quản lý state phân định tốt giữa Redux & React Query. | 🟢 Tốt |
| **4. Security (Bảo mật)** | 7/10 | Tồn tại `dangerouslySetInnerHTML` chưa qua sanitization (DOMPurify) tại trang Admin Job. Token lưu qua js-cookie. | 🟠 Cần xử lý ngay |
| **5. Performance (Hiệu năng)** | 7.5/10 | Cần tối ưu Bundle size, loại bỏ 14 package thừa và áp dụng dynamic import cho các thư viện nặng (LiveKit, Leaflet, Chart.js, SheetJS). | 🟡 Tối ưu thêm |

---

## 2. Chi Tiết Đánh Giá Từng Trục

### Trục 1: Correctness (Tính đúng đắn)
- **Điểm mạnh:**
  - `tsc --noEmit` hoàn thành với 0 lỗi biên dịch.
  - Toàn bộ test suite (> 150 files test bao gồm routing, i18n, schemas, transformers, hooks) đều đạt 100% PASS.
  - Đa ngôn ngữ (i18n) đạt 100% parity giữa EN và VI.
- **Vấn đề phát hiện (Required):**
  - `LocationPickerContent.tsx:248`: `useEffect` thiếu `address`, `position` ➔ Có thể không cập nhật ghim vị trí khi prop thay đổi.
  - `JobSeekerLayout/index.tsx:110`: `useEffect` thiếu `pathname` ➔ Layout có thể không đồng bộ active state khi route thay đổi.
  - `JobsPage/index.tsx:290`: `useMemo` thiếu callback `handleOpenApprove` và `handleOpenReject` ➔ Nguy cơ stale closure khi action buttons được trigger.

---

### Trục 2: Readability & Simplicity (Độ đọc hiểu & Sự tinh gọn)
- **Điểm mạnh:**
  - Đặt tên biến, types, interfaces và files rất đồng nhất, có tổ chức folder theo domain (`adminPages`, `employerPages`, `jobSeekerPages`, `interviewPages`).
  - Sử dụng Tailwind CSS v4 kết hợp UI components nhất quán.
- **Vấn đề phát hiện (Structural Remedy - Decompose Large Files):**
  - Các file đang vượt ngưỡng kiểm tra kích thước (~800 - 1,150 dòng):
    1. [`UnifiedCVForm.tsx`](file:///c:/Users/WIN10/Documents/square-tuyen-dung/frontend/src/views/cvBuilderPages/CVEditorPage/components/forms/UnifiedCVForm.tsx) (1,148 dòng) ➔ Gom form cá nhân, học vấn, kỹ năng, kinh nghiệm vào chung 1 file.
    2. [`react-shader-toy.tsx`](file:///c:/Users/WIN10/Documents/square-tuyen-dung/frontend/src/components/agents-ui/react-shader-toy.tsx) (958 dòng) ➔ Shader engine & render context.
    3. [`AIInterviewLayout.tsx`](file:///c:/Users/WIN10/Documents/square-tuyen-dung/frontend/src/views/interviewPages/AIInterviewLayout.tsx) (937 dòng) ➔ Xử lý LiveKit, chat, audio visualizer, feedback modal trong 1 view.
    4. [`ProfilesPage/index.tsx`](file:///c:/Users/WIN10/Documents/square-tuyen-dung/frontend/src/views/adminPages/ProfilesPage/index.tsx) (854 dòng) & [`HomePage/index.tsx`](file:///c:/Users/WIN10/Documents/square-tuyen-dung/frontend/src/views/defaultPages/HomePage/index.tsx) (825 dòng).
  - *Đề xuất giải pháp:* Tách nhỏ thành các sub-components độc lập (ví dụ tách các Section của CV Form thành folder `sections/` và custom hook `useUnifiedCVFormState`).

---

### Trục 3: Architecture & Module Boundaries (Kiến trúc phân tầng)
- **Điểm mạnh:**
  - Tầng **Services** (`src/services/` - 44 services) được tổ chức theo đúng nguyên lý Single Responsibility.
  - Tách biệt rõ ràng giữa **Client State** (Redux Toolkit: auth, theme, notification badges) và **Server Cache State** (TanStack React Query: query jobs, resumes, statistics).
- **Vấn đề phát hiện (Required & Consider):**
  - 4 thư viện được import ngầm (Unlisted Dependencies): `@mui/utils`, `mui-file-dropzone`, `@emotion/cache`, `@livekit/components-core`. Cần đưa trực tiếp vào `package.json`.
  - Một số file view cũ bị mồ côi (35 unused files) cần được loại bỏ để giảm độ phân mảnh của codebase.

---

### Trục 4: Security & Hardening (Bảo mật)
- **Vấn đề Nghiêm Trọng (Critical):**
  - **XSS Vector tại Admin Jobs Page:**
    - [`src/views/adminPages/JobsPage/index.tsx:463, 474, 486`](file:///c:/Users/WIN10/Documents/square-tuyen-dung/frontend/src/views/adminPages/JobsPage/index.tsx#L463-L486) sử dụng trực tiếp `dangerouslySetInnerHTML` để render `inspectingJob.jobDescription`, `jobRequirement`, `benefitsEnjoyed` mà **chưa qua bộ lọc sanitization**. Nếu nội dung từ form tuyển dụng chứa thẻ `<script>` hoặc `<img onerror=...>`, người quản trị xem tin có thể bị tấn công XSS.
    - *Giải pháp:* Cài đặt và sử dụng `dompurify` / `isomorphic-dompurify` để bọc toàn bộ nội dung HTML trước khi render.
- **Bảo mật Token (FYI / Consider):**
  - `tokenService.ts` lưu `access_token` và `refresh_token` trong Cookie với cờ `SameSite: Lax` và `secure: true` (HTTPS). Tuy nhiên do set qua JS, cookie không có cờ `httpOnly`. Việc ngăn chặn triệt để XSS là yếu tố sống còn để bảo vệ accessToken khỏi bị đánh cắp.

---

### Trục 5: Performance & Optimization (Hiệu năng)
- **Vấn đề phát hiện (Consider / Optimization):**
  - **Dead Dependencies:** 14 package thừa trong `package.json` (`ai`, `@goongmaps/goong-map-react`, `react-color`, `@mui/base`, `react-to-print`,...) làm tăng thời gian `pnpm install` và kích thước deploy.
  - **Thư viện nặng cần Dynamic Import:**
    - `@livekit/components-react` & `livekit-client` (Phỏng vấn AI Voice)
    - `leaflet` & `react-leaflet` (Bản đồ tuyển dụng)
    - `xlsx` (SheetJS xuất Excel)
    - `chart.js` & `react-chartjs-2`
    - Cần đảm bảo các module này được bọc bằng `next/dynamic` với `{ ssr: false }` khi hiển thị ở Client để tránh kéo phình bundle trang chủ.

---

## 3. Danh Sách Hành Động Cần Thực Hiện (Action Items)

### 🔴 Critical & Required (Bắt buộc xử lý)
1. **[Security] Sanitize HTML:** Cài `isomorphic-dompurify` và bọc toàn bộ các vị trí dùng `dangerouslySetInnerHTML`.
2. **[Correctness] Fix React Hook Dependencies:** Sửa 4 hook thiếu dependency array trong `LocationPickerContent`, `JobSeekerLayout`, `JobsPage`, `AIAnalysisDrawer`.
3. **[Architecture] Declare Unlisted Dependencies:** Thêm `@mui/utils`, `@emotion/cache`, `mui-file-dropzone`, `@livekit/components-core` vào `package.json`.

### 🟡 Recommended (Nên thực hiện tiếp theo)
4. **[Simplicity] Decompose Monolithic Views:** Tách `UnifiedCVForm.tsx` (1,148 dòng) và `AIInterviewLayout.tsx` (937 dòng) thành các sub-components nhỏ gọn.
5. **[Cleanup] Gỡ bỏ 14 Unused Dependencies:** Chạy `npm uninstall` cho các package mồ côi.
6. **[Cleanup] Xóa 35 Unused Files:** Dọn dẹp các form và card cũ không còn sử dụng.
7. **[Compatibility] Migrate MUI slotProps:** Chuyển dần các props cũ (`PaperProps`, `InputProps`) sang `slotProps` để sẵn sàng cho MUI v7.
