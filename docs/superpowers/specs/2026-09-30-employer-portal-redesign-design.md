# Đặc Tả Kỹ Thuật: Tái Cấu Trúc Hệ Thống Trang Cổng Nhà Tuyển Dụng (ntd.infohr.vn)

- **Ngày tạo**: 2026-09-30  
- **Dự án**: Square Tuyển Dụng (InfoHR) — Employer Portal  
- **Trạng thái**: Bản thiết kế kiến trúc kỹ thuật (Design Spec)  
- **Phạm vi tác động**: `frontend/src/app/employer/`, `frontend/src/views/employerPages/`, `frontend/src/middleware.ts`, `frontend/src/layouts/`

---

## 1. Bối Cảnh & Vấn Đề Cần Giải Quyết

Hiện tại, cổng Nhà tuyển dụng (`ntd.infohr.vn`) đang gặp phải các bất cập về phân tầng nội dung và điều hướng:
1. **Trùng lặp route**: Cả URL Trang chủ (`/`) và Giới thiệu (`/gioi-thieu` / `/introduce`) đều đang cùng rewrite về một file duy nhất (`/employer/introduce`), khiến cổng NTD thiếu một trang chủ độc lập tối ưu phễu chuyển đổi tuyển dụng.
2. **Trang Giới thiệu thiếu chiều sâu**: Nội dung hiện tại mang hơi hướng landing page bán hàng hơn là hồ sơ năng lực (company profile), công nghệ và tầm nhìn chuyên sâu trong 4 khối ngành trọng điểm (Xây dựng, Bất động sản, Thiết kế nội thất, Kỹ thuật MEP).
3. **Phân mảnh Dịch vụ và Bảng giá**: Trang `Dịch vụ` (`/dich-vu` hay `ServicePage`) và `Bảng giá` (`/bao-gia` hay `PricingPage`) đang tách rời và đều ở dạng sơ sài. Doanh nghiệp khi xem dịch vụ cần biết ngay bảng giá và ngược lại.
4. **Header Navigation chưa tối ưu**: Menu cổng NTD còn gom "Giới thiệu & Dịch vụ" thành một mục (`/employer/introduce`), gây khó khăn cho trải nghiệm tìm kiếm thông tin của doanh nghiệp.

---

## 2. Mục Tiêu Thiết Kế

1. **Trang Chủ NTD (`ntd.infohr.vn/`)**: Là trang Landing Page chuyển đổi cao, tập trung vào:
   - Giá trị giải pháp tuyển dụng toàn diện InfoHR.
   - Thước đo hiệu quả (80% rút ngắn thời gian, 3.5x tỷ lệ tuyển thành công, 1.200+ doanh nghiệp tin dùng).
   - Showroom trung tâm điều hành tuyển dụng số hóa 3D.
   - Đột phá phỏng vấn Voice AI AILA 24/7 và AI Match Score.
   - Quy trình tuyển dụng 4 bước tinh gọn và phễu kêu gọi đăng ký tuyển dụng ngay.
2. **Trang Giới Thiệu NTD (`ntd.infohr.vn/gioi-thieu`)**: Là trang Hồ sơ năng lực & Tầm nhìn công nghệ tuyển dụng (Company & Tech Profile):
   - Sứ mệnh kiến tạo nền tảng nhân tài thông minh cho 4 khối ngành trọng điểm.
   - Giải pháp công nghệ cốt lõi: Voice AI Agent, Video Analysis & Smart AI Match Score.
   - Hệ sinh thái mở rộng: Tuyển dụng + HRM Quản trị nhân sự + AILA Phỏng vấn.
   - Đội ngũ chuyên gia, đối tác chiến lược và cam kết chất lượng dịch vụ.
3. **Trang Dịch Vụ & Bảng Giá (`ntd.infohr.vn/bao-gia`)**: Gộp toàn bộ Dịch vụ vào Bảng giá:
   - Phân tầng 1: Giới thiệu 3 trụ cột dịch vụ (Đăng tin tuyển dụng, Lọc CV chuyên ngành, Phỏng vấn AI AILA).
   - Phân tầng 2: Bảng giá chi tiết với các gói: Khởi đầu (Starter), Tăng tốc (Professional), Doanh nghiệp (Enterprise), Gói mua lẻ tiện ích.
   - Phân tầng 3: Bảng ma trận so sánh chi tiết tính năng (Comparison Matrix).
   - Phân tầng 4: Form nhận tư vấn báo giá Enterprise tùy chỉnh & FAQ giải đáp thắc mắc.
   - Tự động chuyển hướng (Redirect 301) từ `/dich-vu` và `/service` về `/bao-gia`.
4. **Chuẩn hóa Header Navigation**:
   - Menu cổng NTD gồm 5 mục: `[Trang chủ]` | `[Giới thiệu]` | `[Dịch vụ & Bảng giá]` | `[Tìm ứng viên]` | `[Hỗ trợ]`.

---

## 3. Kiến Trúc Kỹ Thuật & Cấu Trúc File

```
frontend/
├── src/
│   ├── app/
│   │   └── employer/
│   │       ├── page.tsx                  # Trang chủ NTD -> render EmployerHomePage
│   │       ├── introduce/
│   │       │   └── page.tsx              # Trang Giới thiệu NTD -> render IntroducePage mới
│   │       ├── pricing/
│   │       │   └── page.tsx              # Trang Dịch vụ & Bảng giá -> render PricingPage mới
│   │       └── service/
│   │           └── page.tsx              # Tự động redirect về /employer/pricing
│   ├── views/
│   │   └── employerPages/
│   │       ├── EmployerHomePage/         # View mới: Landing Page chuyển đổi NTD
│   │       │   ├── index.tsx
│   │       │   └── __tests__/
│   │       ├── IntroducePage/            # View tái cấu trúc: Hồ sơ năng lực & Công nghệ InfoHR
│   │       │   ├── index.tsx
│   │       │   └── __tests__/
│   │       └── PricingPage/              # View nâng cấp: Dịch vụ & Bảng giá toàn diện
│   │           ├── index.tsx
│   │           └── __tests__/
│   ├── layouts/
│   │   └── components/
│   │       └── commons/
│   │           ├── Header/
│   │           │   └── index.tsx         # Cập nhật menu HOST_NAME.EMPLOYER_PROJECT
│   │           └── LeftDrawer/
│   │               └── index.tsx         # Cập nhật menu mobile NTD
│   └── middleware.ts                     # Cập nhật EMPLOYER_EXACT_MAP & redirect /dich-vu -> /bao-gia
```

---

## 4. Chi Tiết Thiết Kế Từng Trang

### 4.1. Trang Chủ NTD (`EmployerHomePage`)
* **URL**: `https://ntd.infohr.vn/` (hoặc `/employer` trên localhost/main domain).
* **Mục tiêu**: Kích thích doanh nghiệp đăng ký tài khoản, đăng tin hoặc liên hệ trải nghiệm AI.
* **Các khối thành phần (Sections)**:
  1. **Hero Banner 3D**:
     - Chip: "GIẢI PHÁP TUYỂN DỤNG & AI MATCHING DOANH NGHIỆP".
     - H1: "Bứt Phá Hiệu Quả Tuyển Dụng Nhân Tài Cùng InfoHR".
     - Subtitle: Hệ sinh thái tuyển dụng thông minh cho 4 khối ngành trọng điểm và phỏng vấn sơ loại tự động AILA AI.
     - 4 Chips ngành: Xây dựng, Bất động sản, Kiến trúc/Nội thất, Kỹ thuật MEP.
     - Action Buttons: `[Đăng Ký Tuyển Dụng Ngay]` (trỏ `/dang-ky`), `[Xem Bảng Giá Dịch Vụ]` (trỏ `/bao-gia`).
     - 3D Showcase Image: Bảng điều hành tuyển dụng doanh nghiệp kèm 4 mini anchors (Đăng tuyển đa kênh, AI Match Score, AILA Voice AI, Doanh nghiệp xác thực).
  2. **Partner Logo Carousel**: Marquee các thương hiệu và tập đoàn đồng hành.
  3. **Thước Đo Hiệu Quả (Key Metrics)**:
     - 80% rút ngắn thời gian sơ tuyển.
     - 3.5x tăng tỷ lệ tuyển dụng thành công.
     - 95% độ chính xác thuật toán AI Match Score.
     - 1.200+ doanh nghiệp tin cậy đồng hành.
  4. **Hai Trụ Cột Giải Pháp Trọng Tâm**:
     - Trụ cột 1: Cổng đăng tin tuyển dụng chuẩn hóa & Bộ lọc ứng viên nâng cao.
     - Trụ cột 2: AILA Voice AI — Phỏng vấn & Chấm điểm ứng viên tự động 24/7.
  5. **Bento Grid: Vì Sao Doanh Nghiệp Chọn InfoHR**:
     - Kho ứng viên 4 khối ngành chuẩn xác thực.
     - AI So khớp năng lực & phỏng vấn khách quan không thiên vị.
     - ATS CRM theo dõi toàn bộ đường ống ứng viên trên một màn hình.
     - Chính sách bảo hành tuyển dụng & chuyên viên hỗ trợ 24/7.
  6. **Quy Trình Tuyển Dụng 4 Bước Tinh Gọn**:
     - Bước 1: Khởi tạo & Xác thực Doanh nghiệp uy tín.
     - Bước 2: Đăng tin tuyển dụng chuẩn SEO nhanh chóng.
     - Bước 3: AI Sàng lọc & Phỏng vấn tự động 24/7.
     - Bước 4: Tiếp nhận & Onboarding nhân tài.
  7. **Banner CTA Đáy Trang**: Kêu gọi đăng ký ngay, hiển thị 3 tín hiệu tin cậy (Tặng tin đăng trải nghiệm, Bảo mật chuẩn Quốc tế, Hỗ trợ 24/7).

### 4.2. Trang Giới Thiệu NTD (`IntroducePage` mới)
* **URL**: `https://ntd.infohr.vn/gioi-thieu` (hoặc `/employer/introduce`).
* **Mục tiêu**: Hồ sơ năng lực công nghệ và định vị uy tín thương hiệu InfoHR.
* **Các khối thành phần (Sections)**:
  1. **Hero Section**:
     - Chip: "VỀ CHÚNG TÔI — INFOHR ECOSYSTEM".
     - H1: "Kiến Tạo Chuẩn Mực Tuyển Dụng Mới Bằng Công Nghệ & Trí Tuệ Nhân Tạo".
     - Mô tả tầm nhìn chiến lược: Kết nối nguồn lực tinh hoa trong các ngành kinh tế kỹ thuật trọng điểm với các tập đoàn và doanh nghiệp tiên phong.
  2. **Sứ Mệnh & Tầm Nhìn (Mission & Vision)**:
     - Thẻ Sứ mệnh: Tối ưu hóa 90% chi phí và thời gian tuyển dụng cho doanh nghiệp thông qua AI và dữ liệu minh bạch.
     - Thẻ Tầm nhìn: Trở thành nền tảng tuyển dụng & đánh giá năng lực ứng viên bằng Voice AI hàng đầu khu vực.
     - Thẻ Giá trị cốt lõi: "Chính trực - Đột phá công nghệ - Lấy khách hàng làm trọng tâm - Bền vững".
  3. **Chuyên Môn Hóa 4 Khối Ngành Trọng Điểm**:
     - Giới thiệu sâu về giải pháp dữ liệu và nhân lực cho:
       * Khối Xây dựng (Kỹ sư công trường, Giám sát, Chỉ huy trưởng, Dự toán QS).
       * Khối Bất động sản (Quản lý dự án, Chuyên viên kinh doanh cao cấp, Thẩm định).
       * Khối Kiến trúc & Thiết kế nội thất (Kiến trúc sư chủ trì, Thiết kế 3D, Diễn họa).
       * Khối Cơ điện MEP & Kỹ thuật công trình (Kỹ sư MEP, HVAC, Hệ thống điện - nước).
  4. **Đột Phá Công Nghệ AILA AI**:
     - Giới thiệu công nghệ Voice AI thời gian thực (WebRTC + LLM + STT/TTS).
     - Thuật toán chấm điểm Match Score khách quan dựa trên JD và khung năng lực tiêu chuẩn.
     - Hệ sinh thái liên thông: InfoHR Portal + InfoHR HRM Engine + AILA AI Voice Center.
  5. **Cam Kết Chất Lượng & Bảo Mật Dữ Liệu**:
     - Cam kết bảo mật thông tin hồ sơ doanh nghiệp và ứng viên chuẩn mã hóa dữ liệu.
     - Chính sách hỗ trợ đổi ứng viên bảo hành nếu ứng viên không phù hợp trong thời gian thử việc.
  6. **Đội Ngũ Cố Vấn & Chuyên Gia Đồng Hành**: Khối giới thiệu chuyên môn và năng lực vận hành.
  7. **CTA Hợp Tác**: Đặt lịch tư vấn giải pháp tuyển dụng tùy chỉnh cho doanh nghiệp lớn.

### 4.3. Trang Dịch Vụ & Bảng Giá (`PricingPage` toàn diện)
* **URL**: `https://ntd.infohr.vn/bao-gia` (hoặc `/employer/pricing`).
* **Mục tiêu**: Minh bạch hóa toàn bộ các gói dịch vụ và bảng giá, giúp doanh nghiệp dễ dàng chọn gói hoặc gửi yêu cầu báo giá.
* **Các khối thành phần (Sections)**:
  1. **Hero Section**:
     - Chip: "BẢNG GIÁ & DỊCH VỤ MINH BẠCH".
     - H1: "Giải Pháp Dịch Vụ & Gói Tuyển Dụng Linh Hoạt Cho Doanh Nghiệp".
     - Subtitle: Lựa chọn gói đăng tin, lọc hồ sơ hoặc phỏng vấn AI tối ưu theo nhu cầu tuyển dụng thực tế.
  2. **Tổng Quan 3 Trụ Cột Dịch Vụ Cốt Lõi**:
     - Dịch vụ Đăng tin tuyển dụng Top 1 chuyên mục & Đẩy tin tự động.
     - Dịch vụ Lọc & Tiếp cận kho hồ sơ CV ứng viên đã xác thực bằng cấp.
     - Dịch vụ Trợ lý phỏng vấn Voice AI AILA 24/7 & Báo cáo đánh giá ứng viên.
  3. **Thẻ Các Gói Giá Tuyển Dụng (Pricing Cards)**:
     - **Gói Khởi Đầu (Starter)**: Phù hợp doanh nghiệp SME tuyển dụng định kỳ (3 tin đăng, 20 điểm lọc CV, hỗ trợ cơ bản).
     - **Gói Tăng Tốc (Professional - Gói Nổi Bật / Khuyên Dùng)**: Dành cho doanh nghiệp đang mở rộng quy mô (10 tin đăng Top 1, 100 điểm lọc CV chất lượng cao, 50 lượt phỏng vấn AILA AI, huy hiệu Xác thực doanh nghiệp uy tín).
     - **Gói Doanh Nghiệp (Enterprise)**: Dành cho tập đoàn (Không giới hạn tin đăng, tích hợp ATS CRM, kịch bản AILA AI thiết kế riêng, chuyên viên tư vấn tài khoản 1-on-1).
     - **Thẻ Mua Thêm Tiện Ích**: Gói mua thêm lượt phỏng vấn AI, Gói mở khóa xem CV theo điểm.
  4. **Bảng Ma Trận So Sánh Tính Năng (Feature Comparison Matrix)**:
     - Bảng so sánh chi tiết giữa các gói: Số lượng tin, Vị trí hiển thị, Lượt lọc CV, Phỏng vấn AI, Hỗ trợ kỹ thuật, Báo cáo chuyên sâu.
  5. **Form Đăng Ký Tư Vấn Doanh Nghiệp (Enterprise Inquiry Form)**:
     - Nhập tên doanh nghiệp, số điện thoại, quy mô tuyển dụng, nhu cầu cụ thể.
     - Cam kết liên hệ lại trong vòng 15 phút làm việc.
  6. **Câu Hỏi Thường Gặp (FAQ Accordion)**:
     - Quy trình thanh toán và xuất hóa đơn VAT điện tử.
     - Chính sách bảo hành tin đăng và bảo lưu số lượt lọc CV.
     - Cách thức hoạt động của AILA AI trong phỏng vấn sơ loại.
     - Doanh nghiệp có được dùng thử miễn phí không?

---

## 5. Quy Chuẩn Điều Hướng (Routing & Middleware)

Trong `frontend/src/middleware.ts`:
```ts
const EMPLOYER_EXACT_MAP: Record<string, string> = {
  '/': '/employer',                          // Trang chủ NTD -> /employer (EmployerHomePage)
  '/gioi-thieu': '/employer/introduce',      // Trang Giới thiệu NTD -> /employer/introduce (IntroducePage)
  '/introduce': '/employer/introduce',
  '/bao-gia': '/employer/pricing',           // Trang Dịch vụ & Bảng giá -> /employer/pricing (PricingPage)
  '/pricing': '/employer/pricing',
  // Redirect 301 tự động /dich-vu và /service về /bao-gia
  '/dich-vu': '/employer/pricing',
  '/service': '/employer/pricing',
  ...
};
```

Trong `frontend/src/app/employer/page.tsx`:
```tsx
import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import EmployerHomePage from '@/views/employerPages/EmployerHomePage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('employer.home');
}

export default function EmployerRootPage() {
  return <EmployerHomePage />;
}
```

Trong `frontend/src/app/employer/service/page.tsx`:
```tsx
import { redirect } from 'next/navigation';

export default function ServiceRedirectPage() {
  redirect('/employer/pricing');
}
```

Trong `Header/index.tsx` cho `HOST_NAME.EMPLOYER_PROJECT`:
```ts
[HOST_NAME.EMPLOYER_PROJECT]: [
  { id: '1', label: t('nav.home', 'Trang chủ'), path: localizeRoutePath('/', i18n.language) },
  { id: '2', label: t('nav.aboutUs', 'Giới thiệu'), path: localizeRoutePath(`/${ROUTES.EMPLOYER.INTRODUCE}`, i18n.language) },
  { id: '3', label: t('nav.servicesAndPricing', 'Dịch vụ & Bảng giá'), path: localizeRoutePath(`/${ROUTES.EMPLOYER.PRICING}`, i18n.language) },
  { id: '4', label: t('nav.findCandidates', 'Tìm ứng viên'), path: localizeRoutePath(`/${ROUTES.EMPLOYER.PROFILE}`, i18n.language), requireAuth: true, isHighlight: true },
  { id: '5', label: t('nav.support', 'Hỗ trợ'), path: localizeRoutePath(`/${ROUTES.EMPLOYER.SUPPORT}`, i18n.language) },
]
```

---

## 6. Kế Hoạch Kiểm Thử & Nghiệm Thu (Verification Plan)

1. **TypeScript & Linter**: Chạy `pnpm run lint` hoặc `tsc --noEmit` bảo đảm không có lỗi type.
2. **Next.js Build Check**: Chạy kiểm tra build khô (`next build` hoặc tương đương) không lỗi server component / client component.
3. **Route Check**:
   - Truy cập `ntd.infohr.vn/` -> Hiển thị Trang chủ NTD mới.
   - Truy cập `ntd.infohr.vn/gioi-thieu` -> Hiển thị Trang Giới thiệu mới (hồ sơ năng lực).
   - Truy cập `ntd.infohr.vn/dich-vu` -> Tự động chuyển hướng về `ntd.infohr.vn/bao-gia`.
   - Truy cập `ntd.infohr.vn/bao-gia` -> Hiển thị Trang Dịch vụ & Bảng giá toàn diện.
4. **Responsive & Animation**: Kiểm tra animation GSAP mượt mà trên cả desktop và mobile, không có hydration mismatch hay overflow ngang.
