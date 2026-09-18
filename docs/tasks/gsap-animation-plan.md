# Kế hoạch Triển khai: Audit & Tối ưu hóa Toàn diện Hiệu ứng Động GSAP & ScrollTrigger (Mobile & Desktop)

> **Mục tiêu:** Chuẩn hóa toàn bộ hệ thống hoạt ứng động GSAP và ScrollTrigger trên cả điện thoại (Mobile) và máy tính (Desktop), loại bỏ triệt để lỗi không hiển thị / kẹt opacity: 0, tối ưu hiệu năng GPU, hỗ trợ `prefers-reduced-motion` và tự động đồng bộ toạ độ ScrollTrigger khi dữ liệu động nạp về.

---

## 1. User Review Required

- **Cơ chế Fail-Safe tuyệt đối**: Mọi animation đều có `clearProps: 'all'` để giải phóng toàn bộ inline styles ngay sau khi hoàn thành. Nội dung trên mobile luôn đảm bảo 100% hiển thị ngay cả khi người dùng cuộn cực nhanh hoặc mạng chậm.
- **Hỗ trợ Tiếp cận (Accessibility)**: Tự động tuân thủ chuẩn `prefers-reduced-motion: reduce`, đảm bảo người dùng nhạy cảm với chuyển động vẫn xem được trọn vẹn nội dung mà không bị che khuất.

---

## 2. Proposed Changes

### Component 1: Shared GSAP Helpers & Utilities
Tạo utility dùng chung để quản lý đăng ký plugin, matchMedia breakpoints chuẩn và debounce `ScrollTrigger.refresh()`.

#### [NEW] `frontend/src/utils/gsapHelpers.ts`
- Hàm `registerGsapPlugins()` an toàn trong môi trường SSR (Next.js App Router).
- Tiện ích `safeScrollTriggerRefresh()` (debounced với `requestAnimationFrame`).
- Cấu hình breakpoints chuẩn `GSAP_BREAKPOINTS`: Desktop (`min-width: 769px`), Mobile (`max-width: 768px`), ReducedMotion (`prefers-reduced-motion: reduce`).

#### [NEW] `frontend/src/utils/__tests__/gsapHelpers.test.ts`
- Kiểm thử các hàm helper và cấu hình breakpoints.

---

### Component 2: Trang Chủ Public (`HomePage`)

#### [MODIFY] `frontend/src/views/defaultPages/HomePage/index.tsx`
- Sử dụng `gsap.matchMedia()` phân tách Desktop (`start: "top 85%"`, `y: 25px`) và Mobile (`start: "top 92%"`, `y: 14px`, `duration: 0.45s`).
- Thêm `dependencies: [careerSections]` và `revertOnUpdate: true` vào `useGSAP` để tự động tính toán lại khi 4 danh mục ngành nghề tải xong.
- Thêm `once: true`, `clearProps: 'all'` cho tất cả các ScrollTrigger (Top Companies, Choose Path, Feedbacks, Handbooks).
- Tự động gọi `safeScrollTriggerRefresh()` khi dữ liệu React Query nạp thành công.

#### [NEW] `frontend/src/views/defaultPages/HomePage/__tests__/HomePageAnimation.test.ts`
- Kiểm thử cấu trúc code GSAP, kiểm tra có đầy đủ `clearProps: 'all'` và `matchMedia`.

---

### Component 3: Trang Giới Thiệu Nhà Tuyển Dụng (`IntroducePage`)

#### [MODIFY] `frontend/src/views/employerPages/IntroducePage/index.tsx`
- Chuyển toàn bộ Hero Timeline, Highlights Grid, Services Box, Services Grid, Steps Grid sang `gsap.matchMedia()`.
- Cấu hình Mobile: `start: "top 90%"`, `y: 15px`, `stagger: 0.08s`, `clearProps: 'all'`, `once: true`.
- Hỗ trợ `prefers-reduced-motion` hiển thị tĩnh mượt mà.

#### [NEW] `frontend/src/views/employerPages/IntroducePage/__tests__/IntroducePageAnimation.test.ts`
- Kiểm thử cấu trúc animation của IntroducePage.

---

### Component 4: Dashboard Ứng Viên & Nhà Tuyển Dụng

#### [MODIFY] `frontend/src/views/jobSeekerPages/DashboardPage/index.tsx`
- Cập nhật `useGSAP` với `gsap.matchMedia()`, `clearProps: 'all'`, tinh chỉnh độ trượt trên mobile và `dependencies: [stats]`.

#### [MODIFY] `frontend/src/views/employerPages/DashboardPage/index.tsx`
- Cập nhật `useGSAP` với `gsap.matchMedia()`, `clearProps: 'all'`, mobile-optimized stagger.

#### [NEW] `frontend/src/views/jobSeekerPages/DashboardPage/__tests__/DashboardAnimation.test.ts`
#### [NEW] `frontend/src/views/employerPages/DashboardPage/__tests__/EmployerDashboardAnimation.test.ts`
- Kiểm thử xác thực animation dashboard.

---

### Component 5: Hero Banner (`TopSlide`)

#### [MODIFY] `frontend/src/layouts/components/commons/TopSlide/index.tsx`
- Áp dụng `clearProps: 'all'` trên timeline entrance, giảm biên độ trượt trên mobile để tránh che khuất thanh tìm kiếm nhanh.

#### [NEW] `frontend/src/layouts/components/commons/TopSlide/__tests__/TopSlideAnimation.test.ts`
- Kiểm thử unit test cho TopSlide animation.

---

## 3. Verification Plan

### Automated Tests
1. **Jest Test Suites**:
   - `npx jest src/utils/__tests__/gsapHelpers.test.ts`
   - `npx jest src/views/defaultPages/HomePage/__tests__/HomePageAnimation.test.ts`
   - `npx jest src/views/employerPages/IntroducePage/__tests__/IntroducePageAnimation.test.ts`
   - `npx jest src/views/jobSeekerPages/DashboardPage/__tests__/DashboardAnimation.test.ts`
   - `npx jest src/views/employerPages/DashboardPage/__tests__/EmployerDashboardAnimation.test.ts`
   - `npx jest src/layouts/components/commons/TopSlide/__tests__/TopSlideAnimation.test.ts`
2. **TypeScript & Linter**:
   - `npx tsc --noEmit -p tsconfig.json` (0 errors)
   - `npx eslint src/utils/gsapHelpers.ts src/views/defaultPages/HomePage src/views/employerPages/IntroducePage src/views/jobSeekerPages/DashboardPage src/views/employerPages/DashboardPage src/layouts/components/commons/TopSlide --ext .ts,.tsx`
3. **Docker Rebuild**:
   - `docker compose up --build -d frontend`
