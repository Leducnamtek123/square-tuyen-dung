# Hướng Dẫn Thiết Lập Tên Miền (Domain) Cho Nginx Khi Triển Khai Lên Môi Trường Thực Tế (Production)

Dựa trên cấu trúc mã nguồn của dự án Square Tuyển Dụng, khi chúng ta đưa hệ thống lên chạy thực tế (Production) bằng Nginx, dự án sẽ yêu cầu thiết lập **1 Tên miền chính (Domain) và 3 Tên miền phụ (Subdomains)**. Cụ thể chi tiết được liệt kê dưới đây.

---

## 1. Các Tên Miền Cho Frontend (React SPA)
Kiến trúc frontend đang dùng chung 1 mã nguồn (SPA) để phục vụ cho 3 portal khác nhau (Ứng viên, Nhà tuyển dụng, Quản trị viên). Hệ thống sẽ tự động chuyển đổi giao diện tương ứng dựa trên hostname định tuyến đến.

Vì vậy, bạn sẽ cần cấu hình DNS trỏ (A Record) các tên miền sau về IP của Frontend Server:

### 1.1 Tên Miền Chính Dành Cho Ứng Viên (Main Portal)
Đây là trang chủ mặc định cho ứng viên tìm kiếm việc làm.
*   **Biến môi trường tương ứng:** `VITE_MYJOB_HOST_NAME=localhost`
*   **Ví dụ Production:** `tuyendung.com`

### 1.2 Tên Miền Phụ Dành Cho Nhà Tuyển Dụng (Employer Portal)
Dành cho công ty đăng nhập, đăng tuyển dụng và quản lý CV.
*   **Biến môi trường tương ứng:** `VITE_EMPLOYER_MYJOB_HOST_NAME=employer.localhost`
*   **Ví dụ Production:** `employer.tuyendung.com`

### 1.3 Tên Miền Phụ Dành Cho Quản Trị Viên (Admin Portal)
Dành cho admin hệ thống quản lý danh mục, kiểm duyệt nhà tuyển dụng,...
*   **Biến môi trường tương ứng:** `VITE_ADMIN_MYJOB_HOST_NAME=admin.localhost`
*   **Ví dụ Production:** `admin.tuyendung.com`

> **Lưu ý cấu hình Nginx:**
> Bạn chỉ cần cấu hình 1 file `server` block trên Nginx để trỏ `root` tĩnh, và truyền tất cả tên miền vào `server_name` như sau:
> `server_name tuyendung.com employer.tuyendung.com admin.tuyendung.com;`
> Cấu hình bắt buộc phải có `try_files $uri $uri/ /index.html;` nhằm hỗ trợ React Router.

---

## 2. Server Của Công Nghệ Voice AI Phỏng Vấn (LiveKit)
Hệ thống AI Phỏng vấn (AI Interviewer) sử dụng LiveKit để làm máy chủ WebSocket/WebRTC (Gửi âm thanh thời gian thực).

### 2.1 Tên Miền Phụ Dành Cho Thực Thi LiveKit WebRTC
Giao thức WebRTC có yêu cầu khắt khe về bảo mật, bắt buộc phải có chứng chỉ số SSL (`wss://`, `https://`) khi chạy trên mạng diện rộng. Bạn sẽ không thể gộp proxy ngang hàng với backend/frontend theo đường dẫn `/livekit` được mà bắt buộc phải chạy riêng rẽ ra 1 cổng và tên miền khác.
*   **Biến môi trường tương ứng lúc Dev:** `VITE_LIVEKIT_URL=ws://localhost:7880`
*   **Ví dụ Production:** `livekit.tuyendung.com` (Được cấu hình HTTPS/SSL đầy đủ)

---

## 3. Server Dành Cho Backend API (Django)
*   **Không nhất thiết phải mua/tạo thêm Subdomain** (như `api.tuyendung.com`).
*   Trong trường hợp muốn tiết kiệm và tập trung thiết lập (giống như đang sử dụng ở Code), chúng ta có thể gọi chung Backend API trên miền chính thông qua proxy pass tiền tố `/api/` của Nginx.

> **Ví dụ Proxy Backend Trên Nginx:**
> Nằm chung thiết lập với Domain của Ứng viên (`tuyendung.com`):
> ```nginx
> location /api/ {
>     proxy_pass http://backend:8000/;
>     proxy_set_header Host $host;
>     proxy_set_header X-Real-IP $remote_addr;
> }
> ```

---

## Tóm Lược Cấu Hình DNS Cần Trỏ (A Records)

Giả sử `103.X.X.X` là địa chỉ IP Public của Máy Chủ chạy Nginx Server. Bạn cần vào trình quản trị của nhà cung cấp Domain (Mắt Bão, Tenten, Cloudflare...) tạo 4 bản ghi sau:

| Tên Host (Name)  | Loại (Type) | Giá Trị (Value) | Mô Tả |
| :--- | :--- | :--- | :--- |
| `@` (tuyendung.com) | A Record | `103.X.X.X` | Domain chính cho Ứng Viên và Backend API |
| `employer`         | A Record | `103.X.X.X` | Trang quản lý dành cho nhà tuyển dụng |
| `admin`            | A Record | `103.X.X.X` | Trang hệ thống dành riêng cho quản trị viên |
| `livekit`          | A Record | `103.X.X.X` | Máy chủ WebRTC xử lý AI Interviewer |
