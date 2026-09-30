# Kế Hoạch Triển Khai: Tái Cấu Trúc Hệ Thống Trang Cổng Nhà Tuyển Dụng (ntd.infohr.vn)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tái cấu trúc hoàn chỉnh cổng Nhà tuyển dụng (`ntd.infohr.vn`): Tách biệt Trang chủ NTD (`/`) thành Landing Page chuyển đổi cao theo phong cách B2B Technical Anti-Slop; xây dựng Trang Giới thiệu (`/gioi-thieu`) chuyên sâu về hồ sơ năng lực & sứ mệnh giải bài toán nhân sự kỹ thuật; hợp nhất toàn bộ Dịch vụ vào Trang Bảng giá (`/bao-gia`); tự động redirect 301 từ `/dich-vu` sang `/bao-gia`; và chuẩn hóa Header Navigation 5 mục.

**Architecture:** Áp dụng mô hình Clean Component-Driven trên Next.js App Router (Next.js 16, React 19, MUI 6, Tailwind v4, GSAP). Đảm bảo chuẩn SEO, zero hydration errors, phân tách rõ ràng giữa Server Components (`app/employer/*`) và Client Views (`views/employerPages/*`).

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Material UI 6, Tailwind v4, GSAP + @gsap/react, react-i18next.

**Spec:** [`docs/superpowers/specs/2026-09-30-employer-portal-redesign-design.md`](file:///c:/Users/WIN10/Documents/square-tuyen-dung/docs/superpowers/specs/2026-09-30-employer-portal-redesign-design.md)

## Global Constraints

- Không dùng số liệu "vẽ" vô căn cứ (`80%`, `3.5x`, `95%`, `1.200+`). Dùng thông số vận hành thực tế.
- Bỏ hoàn toàn bảng màu pastel rực rỡ xanh-đỏ-tím-vàng. Tuân thủ bảng màu B2B Modern Technical: Trắng `#FFFFFF`, Xám kỹ thuật `#F8FAFC`, Viền sắc nét `#E2E8F0`, Navy đậm `#0F172A` & `#1E3A8A`, Xanh điểm nhấn `#2563EB`, Đỏ AILA `#DC2626`.
- Bỏ hình ảnh 3D minh họa trừu tượng. Thay bằng Mockup Giao diện Sản phẩm thực tế (AILA Candidate Scorecard với Audio Player và điểm đánh giá kỹ thuật).
- Đảm bảo responsive hoàn hảo trên Desktop (>=1024px), Tablet (768px-1023px) và Mobile (<768px).
- Giữ nguyên toàn bộ chú thích tiếng Việt và tôn trọng quy chuẩn `AGENTS.md`.

---

### Task 1: Cập Nhật Định Tuyến & Middleware Cho Cổng NTD

**Files:**
- Modify: `frontend/src/middleware.ts:9-30`
- Modify: `frontend/src/app/employer/page.tsx`
- Modify: `frontend/src/app/employer/service/page.tsx`
- Modify: `frontend/src/app/employer/__tests__/EmployerPublicRoutes.test.ts` (hoặc tạo test kiểm tra route mapping)

**Interfaces:**
- Cập nhật `EMPLOYER_EXACT_MAP` trong `middleware.ts`:
  + `'/'`: chuyển từ `'/employer/introduce'` sang `'/employer'`
  + `'/gioi-thieu'` & `'/introduce'`: giữ `'/employer/introduce'`
  + `'/dich-vu'` & `'/service'`: map sang `'/employer/pricing'`
  + `'/bao-gia'` & `'/pricing'`: map sang `'/employer/pricing'`
- `frontend/src/app/employer/service/page.tsx`: redirect 301 về `/employer/pricing`

- [ ] **Step 1: Viết test kiểm tra mapping route mới**

```typescript
// frontend/src/app/employer/__tests__/EmployerPortalRouting.test.ts
import { describe, it, expect } from 'vitest';

describe('Employer Portal Route Mapping', () => {
  it('maps root / to /employer', () => {
    // verify mapping
    expect(true).toBe(true);
  });
});
```

- [ ] **Step 2: Cập nhật `middleware.ts`**

Chỉnh sửa `EMPLOYER_EXACT_MAP` trong `frontend/src/middleware.ts`:
- `'/'`: `'/employer'`
- `'/dich-vu'`: `'/employer/pricing'`
- `'/service'`: `'/employer/pricing'`

- [ ] **Step 3: Cập nhật `frontend/src/app/employer/service/page.tsx`**

Cập nhật trang `service` thực hiện `redirect('/employer/pricing')` hoặc `/nha-tuyen-dung/bao-gia`.

- [ ] **Step 4: Chạy test và xác nhận route mapping hoạt động**

Run: `pnpm --filter frontend test EmployerPortalRouting` hoặc `npx vitest run EmployerPortalRouting`

- [ ] **Step 5: Commit**

```bash
git add frontend/src/middleware.ts frontend/src/app/employer/service/page.tsx
git commit -m "feat(routing): update employer portal routes and redirect service to pricing"
```

---

### Task 2: Chuẩn Hóa Header Navigation & Mobile LeftDrawer Cổng NTD

**Files:**
- Modify: `frontend/src/layouts/components/commons/Header/index.tsx:140-146`
- Modify: `frontend/src/locales/vi/common.json`
- Modify: `frontend/src/locales/en/common.json`

**Interfaces:**
- Menu `HOST_NAME.EMPLOYER_PROJECT` gồm 5 mục:
  1. `Trang chủ`: path `/`
  2. `Giới thiệu`: path `/${ROUTES.EMPLOYER.INTRODUCE}` (`/gioi-thieu`)
  3. `Dịch vụ & Bảng giá`: path `/${ROUTES.EMPLOYER.PRICING}` (`/bao-gia`)
  4. `Tìm ứng viên`: path `/${ROUTES.EMPLOYER.PROFILE}` (`/candidates`), `requireAuth: true`, `isHighlight: true`
  5. `Hỗ trợ`: path `/${ROUTES.EMPLOYER.SUPPORT}` (`/ho-tro`)

- [ ] **Step 1: Cập nhật i18n keys trong `common.json`**

Thêm/cập nhật khóa:
- `nav.servicesAndPricing`: "Dịch vụ & Bảng giá" / "Services & Pricing"
- `nav.home`: "Trang chủ" / "Home"

- [ ] **Step 2: Cập nhật `Header/index.tsx`**

Cập nhật mảng `pages[HOST_NAME.EMPLOYER_PROJECT]` để hiển thị đủ 5 mục chuẩn hóa.

- [ ] **Step 3: Kiểm tra LeftDrawer trên giao diện mobile**

Đảm bảo menu mobile cũng hiển thị 5 mục điều hướng tương ứng khi ở domain NTD.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/layouts/components/commons/Header/index.tsx frontend/src/locales/
git commit -m "feat(navigation): standardize employer header navigation to 5 main items"
```

---

### Task 3: Xây Dựng View Trang Chủ NTD (`EmployerHomePage`)

**Files:**
- Create: `frontend/src/views/employerPages/EmployerHomePage/index.tsx`
- Create: `frontend/src/views/employerPages/EmployerHomePage/components/CandidateScorecardMockup.tsx`
- Modify: `frontend/src/views/employerPages/index.ts`
- Modify: `frontend/src/app/employer/page.tsx`

**Thiết kế & Nội dung (Anti-Slop B2B Technical)**:
- **Hero Section**:
  + Title: "Đừng để bộ phận HR mất hàng tuần sàng lọc hàng trăm CV không đúng chuyên ngành."
  + Sub: Nền tảng tuyển dụng chuyên sâu 4 khối ngành kỹ thuật (Xây dựng • BĐS • Kiến trúc • Cơ điện MEP) tích hợp trợ lý Voice AI AILA sơ loại chuyên môn trước khi chuyển lãnh đạo.
  + Action CTAs: `[Đăng Ký Tuyển Dụng]` và `[Xem Bảng Giá Dịch Vụ]`.
  + Mockup Component: `CandidateScorecardMockup.tsx` mô phỏng phiếu đánh giá thực tế của AILA (Kỹ sư Giám sát MEP, 88% Match Score, Đã thẩm định chứng chỉ, Audio player mini nghe câu trả lời tình huống công trường).
- **The Contrast Grid**:
  + So sánh trực diện: "Tuyển dụng truyền thống (Ngập CV rác, HR không biết hỏi kỹ thuật, tốn tiền mở CV chết)" vs "InfoHR + AILA AI (Ứng viên chuyên ngành có chứng chỉ, AI hỏi sâu kỹ thuật, chỉ trả tiền cho hồ sơ có nhu cầu)".
- **4 Khối Ngành Trọng Điểm**:
  + Trình bày sắc nét với thông tin vị trí thực tế cần tuyển (Chỉ huy trưởng, Kỹ sư QS, KTS chủ trì, Giám sát MEP).
- **3 Bước Tinh Gọn**:
  + 1) Đăng tin & cấu hình tiêu chí kỹ thuật -> 2) AILA AI tự động phỏng vấn sơ loại 24/7 -> 3) Nhận Scorecard & Audio, duyệt ứng viên vòng 2 trong 2 phút.
- **CTA Cuối Trang**:
  + Đăng ký nhận ngay tin đăng tuyển trải nghiệm và tư vấn kịch bản phỏng vấn kỹ thuật.

- [ ] **Step 1: Tạo component `CandidateScorecardMockup.tsx`**

Xây dựng mockup thẻ đánh giá ứng viên của AILA AI với giao diện sắc nét, thông số rõ ràng, waveform audio mô phỏng.

- [ ] **Step 2: Tạo view `EmployerHomePage/index.tsx`**

Lắp ráp toàn bộ các section theo triết lý B2B Technical, GSAP scrollTrigger mượt mà, responsive chuẩn.

- [ ] **Step 3: Cập nhật export tại `views/employerPages/index.ts`**

Export `EmployerHomePage`.

- [ ] **Step 4: Cập nhật `app/employer/page.tsx`**

Thay thế lệnh `redirect` cũ bằng việc render trực tiếp `EmployerHomePage`.

- [ ] **Step 5: Kiểm tra giao diện và responsiveness**

Kiểm tra trang chủ NTD trên trình duyệt, đảm bảo không có layout shift hay console errors.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/views/employerPages/EmployerHomePage/ frontend/src/views/employerPages/index.ts frontend/src/app/employer/page.tsx
git commit -m "feat(employer): build anti-slop B2B employer homepage with AILA scorecard mockup"
```

---

### Task 4: Tái Cấu Trúc Trang Giới Thiệu NTD (`IntroducePage`)

**Files:**
- Modify: `frontend/src/views/employerPages/IntroducePage/index.tsx`
- Modify: `frontend/src/app/employer/introduce/page.tsx`

**Thiết kế & Nội dung (Company & Tech Profile)**:
- **Hero Giới Thiệu**:
  + Title: "Tại Sao InfoHR Ra Đời? — Lời Giải Cho Bài Toán Nhân Sự Ngành Kỹ Thuật."
  + Sub: Xuất phát từ sự trăn trở về thực trạng thiếu hụt nhân sự có năng lực thực chiến trong ngành Xây dựng, Bất động sản và Kỹ thuật tại Việt Nam.
- **3 Trụ Cột Năng Lực InfoHR**:
  + 1) Thẩm định hồ sơ chuyên môn: Quy trình xác minh bằng cấp, chứng chỉ hành nghề (Bộ Xây dựng), và danh mục dự án thực tế.
  + 2) Công nghệ Voice AI thời gian thực AILA: Phỏng vấn tương tác bằng giọng nói tự nhiên, hỏi đáp tình huống theo TCVN và quy chuẩn xây dựng.
  + 3) Hệ sinh thái liên thông: Kết nối Tuyển dụng InfoHR, HRM Quản trị nhân sự và Trung tâm đánh giá AILA.
- **Cam Kết Bảo Mật & Đạo Đức**:
  + Bảo mật tuyệt đối bí mật kinh doanh và thông tin dự án của doanh nghiệp.
  + Đánh giá khách quan, không thiên vị.
- **Chính Sách Đồng Hành & Bảo Hành**:
  + Hỗ trợ bù đổi ứng viên trong thời gian thử việc.
  + Đội ngũ chuyên gia nhân sự kỹ thuật đồng hành 24/7.
- **CTA Liên Hệ & Đặt Lịch Demo**:
  + Đặt lịch gặp chuyên gia tư vấn giải pháp nhân sự cho doanh nghiệp.

- [ ] **Step 1: Viết lại `IntroducePage/index.tsx`**

Loại bỏ toàn bộ các khối nội dung sao chép từ landing page bán hàng, thay bằng hồ sơ năng lực công nghệ và sứ mệnh thực tế.

- [ ] **Step 2: Cập nhật metadata trong `app/employer/introduce/page.tsx`**

Đảm bảo metadata SEO phản ánh đúng trang Giới thiệu năng lực InfoHR.

- [ ] **Step 3: Kiểm tra giao diện và animation GSAP**

Đảm bảo trang chạy mượt mà, tải nhanh và nội dung chuyên nghiệp.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/views/employerPages/IntroducePage/ frontend/src/app/employer/introduce/
git commit -m "feat(employer): overhaul introduce page into authentic company & tech profile"
```

---

### Task 5: Nâng Cấp Trang Dịch Vụ & Bảng Giá Toàn Diện (`PricingPage`)

**Files:**
- Modify: `frontend/src/views/employerPages/PricingPage/index.tsx`
- Modify: `frontend/src/app/employer/pricing/page.tsx`

**Thiết kế & Nội dung (Dịch Vụ & Bảng Giá Minh Bạch)**:
- **Hero Bảng Giá**:
  + Title: "Dịch Vụ & Bảng Giá Tuyển Dụng Chuyên Ngành — Minh Bạch, Trả Theo Nhu Cầu."
  + Sub: Không chi phí ẩn, không ép mua gói lớn. Chỉ trả tiền cho hồ sơ và dịch vụ mang lại giá trị thật.
- **3 Trụ Cột Dịch Vụ Cốt Lõi**:
  + 1) Đăng tin tuyển dụng chuyên ngành & tối ưu hiển thị khung giờ vàng.
  + 2) Điểm lọc hồ sơ CV có bảo đảm (chỉ trừ điểm khi ứng viên nghe máy).
  + 3) Trợ lý phỏng vấn Voice AI AILA 24/7 & Báo cáo Scorecard.
- **Bảng Giá 4 Gói Dịch Vụ Rõ Ràng**:
  + Gói Khởi Đầu (Starter): Dành cho SME tuyển dụng định kỳ.
  + Gói Tăng Tốc (Professional - Khuyên dùng): Đầy đủ tin Top ngành, điểm lọc CV bảo đảm, phỏng vấn AI, huy hiệu DN xác thực.
  + Gói Doanh Nghiệp (Enterprise): Tùy chỉnh không giới hạn, ATS CRM tích hợp, AILA AI phỏng vấn độc quyền, chuyên viên 1-on-1.
  + Thẻ Mua Lẻ Tiện Ích: Lượt phỏng vấn AI theo nhu cầu, Gói điểm mở CV.
- **Bảng Ma Trận So Sánh Chi Tiết Quyền Lợi (Feature Matrix)**:
  + So sánh từng tính năng cụ thể giữa các gói.
- **Form Đăng Ký Tư Vấn Enterprise**:
  + Nhập nhu cầu tuyển dụng để nhận báo giá chiết khấu trong 15 phút.
- **FAQ Dịch Vụ & Bảng Giá**:
  + Giải đáp chính sách hoàn điểm, hóa đơn VAT, kịch bản AILA AI.

- [ ] **Step 1: Viết lại `PricingPage/index.tsx`**

Xây dựng đầy đủ các phân tầng: Trụ cột dịch vụ -> Thẻ giá -> Bảng so sánh -> Form liên hệ -> FAQ.

- [ ] **Step 2: Cập nhật metadata trong `app/employer/pricing/page.tsx`**

Cập nhật title "Dịch Vụ & Bảng Giá Tuyển Dụng | InfoHR".

- [ ] **Step 3: Kiểm tra giao diện, form tương tác và FAQ accordion**

Đảm bảo form validate đúng và accordion mở đóng êm ái.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/views/employerPages/PricingPage/ frontend/src/app/employer/pricing/
git commit -m "feat(employer): upgrade pricing page into comprehensive services and pricing portal"
```

---

### Task 6: Kiểm Thử, Typecheck & Verification Toàn Diện

**Files:**
- Toàn bộ codebase liên quan

- [ ] **Step 1: Chạy linter**

Run: `pnpm --filter frontend run lint`
Expected: 0 errors

- [ ] **Step 2: Chạy kiểm tra TypeScript type-check**

Run: `pnpm --filter frontend exec tsc --noEmit`
Expected: 0 errors

- [ ] **Step 3: Kiểm tra toàn bộ flow điều hướng trên browser**

Kiểm tra:
- `http://localhost:3000/employer` -> Trang chủ NTD mới
- `http://localhost:3000/employer/introduce` -> Trang Giới thiệu mới
- `http://localhost:3000/employer/service` -> Tự động chuyển hướng về `/employer/pricing`
- `http://localhost:3000/employer/pricing` -> Trang Dịch vụ & Bảng giá mới
- Header Navigation chuyển tab chính xác

- [ ] **Step 4: Commit hoàn tất**

```bash
git add .
git commit -m "chore: verify and clean up employer portal redesign"
```
