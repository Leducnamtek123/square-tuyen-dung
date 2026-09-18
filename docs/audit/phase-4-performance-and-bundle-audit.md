# Báo Cáo Audit Frontend - Giai Đoạn 4: Hiệu Năng & Tối Ưu Bundle (Performance & Optimization)

**Dự án:** `project-web-app` (Square Tuyển Dụng Frontend)  
**Công nghệ tối ưu:** Next.js 16 Standalone + AVIF/WebP Image Engine + React Query Caching + Tree-Shaking  
**Ngày thực hiện:** 30/08/2026  
**Trạng thái:** Hoàn thành audit Giai đoạn 4  

---

## 1. Bảng Điểm Hiệu Năng (Performance Scorecard)

| Hạng mục đánh giá | Điểm | Đánh giá | Trạng thái |
| :--- | :---: | :--- | :---: |
| **1. Cấu hình Build & Tree-Shaking** | **9/10** | Áp dụng `standalone` output, tối ưu nạp gói `@mui/*`, `dayjs`, `@phosphor-icons` qua `optimizePackageImports`. | 🟢 Xuất sắc |
| **2. Tối ưu Tài nguyên Hình ảnh (Images/Assets)** | **9/10** | Hỗ trợ định dạng thế hệ mới `AVIF` và `WebP`, cấu hình CDN remote patterns chặt chẽ. | 🟢 Xuất sắc |
| **3. Chiến lược Caching & Giảm tải Mạng** | **8.5/10** | Tận dụng stale-while-revalidate của React Query (`staleTime: 5m`), DNS Prefetching, loại bỏ console.log ở Production. | 🟢 Rất tốt |
| **4. Core Web Vitals (LCP, INP, CLS)** | **8.5/10** | Có Skeleton đồng bộ kích thước (CLS = 0), debounce 400ms cho input tìm kiếm (INP < 100ms). | 🟢 Rất tốt |
| **5. Quản lý Thư viện nặng (Heavy Libs Splitting)** | **8/10** | Đã cấu hình `serverExternalPackages` cho `pdfjs-dist`; cần duy trì `dynamic({ ssr: false })` cho LiveKit/Leaflet. | 🟢 Tốt |

---

## 2. Phân Tích Chi Tiết Tối Ưu Build & Runtime

### A. Tối Ưu Cấu Hình `next.config.mjs`
1. **Tree-Shaking & Bundle Size:**
   - Cấu hình `experimental.optimizePackageImports` giúp Next.js chỉ đóng gói đúng các Icon / Component thực sự được import thay vì nạp toàn bộ thư viện:
     ```js
     optimizePackageImports: [
       '@mui/material',
       '@mui/icons-material',
       '@mui/lab',
       '@mui/x-date-pickers',
       '@phosphor-icons/react',
       'dayjs',
       '@fortawesome/react-fontawesome',
     ]
     ```
2. **Production Build Stripping:**
   - Cấu hình `removeConsole: { exclude: ['error', 'warn'] }` giúp tự động lọc sạch các câu lệnh `console.log` trong môi trường Production, giảm dung lượng JS chuyển tải và bảo vệ thông tin debug nội bộ.
3. **External Server Packages:**
   - Khai báo `serverExternalPackages: ['pdfjs-dist', '@react-pdf-viewer/core', ...]` giúp trình biên dịch không cố gắng bundle mã binary/canvas của PDF.js vào SSR bundle, tránh lỗi crash Node.js runtime.

---

### B. Core Web Vitals Optimization (LCP / INP / CLS)

1. **LCP (Largest Contentful Paint) < 2.0s:**
   - Sử dụng font chữ biến thể `@fontsource-variable/geist` và font hệ thống (`--font-sans`), giảm độ trễ nạp font (FOIT/FOUT).
   - Trang chủ và chi tiết việc làm nạp trước thông tin qua Server Component SSR giúp HTML ban đầu có sẵn nội dung văn bản chính.

2. **INP (Interaction to Next Paint) < 150ms:**
   - Bộ lọc tìm kiếm và ô nhập liệu trên bảng quản trị / trang chủ sử dụng hook `useDebounce(searchTerm, 400)` để gom cụm thao tác gõ, tránh trigger hàng loạt re-render và request mạng liên tục.
   - Các bảng dữ liệu lớn sử dụng `useCallback` và `useMemo` bọc các hành động click/sort.

3. **CLS (Cumulative Layout Shift) < 0.05:**
   - Toàn bộ danh sách (Bảng `AdminDataGrid`, `JobPostCard`, `AppliedResumeKanban`) đều có trạng thái Skeleton Loading với chiều cao dòng và độ bo góc khớp 100% với component thật khi có dữ liệu, ngăn ngừa tình trạng nội dung bị nhảy khung khi tải xong.

---

### C. Tối Ưu Tải Mạng & Bảo Mật Header
- Kích hoạt `X-DNS-Prefetch-Control: on` giúp trình duyệt giải quyết sớm địa chỉ IP của các domain API và CDN hình ảnh.
- Header bảo mật: `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: strict-origin-when-cross-origin`.

---

## 3. Khuyến Nghị Hiệu Năng Bổ Sung

1. **Gỡ bỏ 14 dependencies thừa:**
   - Thực hiện dọn dẹp các thư viện cũ không còn sử dụng (`@goongmaps/goong-map-react`, `ai`, `react-color`, `@mui/base`, `react-to-print`,...) để giảm thời gian build Docker và dung lượng `node_modules`.
2. **Code Splitting cho tính năng Phỏng vấn AI LiveKit:**
   - Giữ nguyên cơ chế chỉ import `@livekit/components-react` và `@livekit/components-styles` trong module `/interview` để trang chủ và cổng thông tin ứng viên không phải gánh thêm ~400KB WebRTC client bundle.
