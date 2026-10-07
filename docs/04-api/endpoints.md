# Danh Muc Chi Tiet API Endpoints (API Directory)

> **Phan he**: 04-api  
> **Tai lieu**: endpoints.md  
> **Tuan thu**: Django REST Framework Router Mappings

---

## 1. Phan He Tai Khoan & Xac Thuc (`/api/v1/auth/`)

| Method | Endpoint URI | Mo ta | Quyen truy cap |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register/` | Dang ky tai khoan ung vien hoac nha tuyen dung | Public |
| `POST` | `/api/v1/auth/token/` | Dang nhap lay cap Access/Refresh token JWT | Public |
| `POST` | `/api/v1/auth/token/refresh/` | Cap lai Access token tu Refresh token | Public |
| `POST` | `/api/v1/auth/convert-token/` | Dang nhap bang Google OAuth2 token | Public |
| `POST` | `/api/v1/auth/password/reset/`| Gui email yeu cau dat lai mat khau | Public |
| `POST` | `/api/v1/auth/password/confirm/`| Xac nhan mat khau moi voi reset token | Public |
| `GET`  | `/api/v1/auth/me/` | Lay thong tin tai khoan dang dang nhap | Authenticated |

---

## 2. Phan He Tin Tuyen Dung & Ung Tuyen (`/api/v1/job/`)

| Method | Endpoint URI | Mo ta | Quyen truy cap |
| :--- | :--- | :--- | :--- |
| `GET`  | `/api/v1/job/job-posts/` | Danh sach tin tuyen dung (co phan trang, loc) | Public |
| `GET`  | `/api/v1/job/job-posts/{slug}/`| Chi tiet tin tuyen dung theo slug | Public |
| `POST` | `/api/v1/job/job-posts/` | Doanh nghiep dang tin tuyen dung moi | Employer / Admin |
| `PUT/PATCH` | `/api/v1/job/job-posts/{id}/` | Cap nhat tin tuyen dung | Employer (Owner) |
| `DELETE`| `/api/v1/job/job-posts/{id}/` | Dong hoac xoa tin tuyen dung | Employer (Owner) |
| `GET`  | `/api/v1/job/search/` | Tim kiem tin toan van qua Elasticsearch | Public |
| `POST` | `/api/v1/job/apply/` | Ung vien nop ho so vao tin tuyen dung | Candidate |
| `GET`  | `/api/v1/job/applications/` | Danh sach ho so ung tuyen tren ATS Kanban | Employer (Owner) |
| `PATCH`| `/api/v1/job/applications/{id}/status/` | Thay doi trang thai ung vien ATS | Employer (Owner) |

---

## 3. Phan He Phong Van Voice AI (`/api/v1/interview/` & `/api/v1/interview-scripts/`)

| Method | Endpoint URI | Mo ta | Quyen truy cap |
| :--- | :--- | :--- | :--- |
| `GET`  | `/api/v1/interview-scripts/` | Danh sach kich ban phong van cua cong ty | Employer |
| `POST` | `/api/v1/interview-scripts/` | Tao kich ban phong van moi | Employer |
| `POST` | `/api/v1/interview/join-room/` | Tham gia phong phong van, sinh LiveKit token | Candidate / Employer |
| `POST` | `/api/v1/interview/complete/` | Ghi nhan ket thuc phong van va kich hoat cham | Voice Agent / System |
| `GET`  | `/api/v1/interview/scorecard/{session_id}/` | Xem scorecard danh gia chi tiet va link PDF | Employer (Owner) |
| `POST` | `/api/v1/livekit/webhook` | Webhook tiep nhan su kien tu LiveKit SFU | LiveKit Server |
| `GET`  | `/api/v1/interview/compat/{room_name}/context` | Lay context cau hoi cho Voice Agent | Internal Voice Agent |
| `POST` | `/api/v1/interview/compat/{room_name}/next-question` | Chuyen cau hoi tiep theo trong script | Internal Voice Agent |

---

## 4. Phan He Quan Tri Nhan Su Native HRM (`/api/v1/native-hrm/`)

| Method | Endpoint URI | Mo ta | Quyen truy cap |
| :--- | :--- | :--- | :--- |
| `GET/POST` | `/api/v1/native-hrm/employees/` | Danh sach & Tao ho so nhan vien | Employer / HRM |
| `GET/PATCH`| `/api/v1/native-hrm/employees/{id}/` | Chi tiet & Cap nhat ho so nhan su | Employer / HRM |
| `POST` | `/api/v1/native-hrm/onboarding/` | Onboard ung vien tu ATS sang nhan vien | Employer / HRM |
| `GET/POST` | `/api/v1/native-hrm/shifts/` | Danh sach & Tao ca lam viec | Employer / HRM |
| `GET`  | `/api/v1/native-hrm/attendance/timesheet/` | Bang cham cong chi tiet theo thang | Employer / HRM |
| `POST` | `/api/v1/native-hrm/attendance/punch/` | Quet the cham cong (Check-in / Check-out) | Employee |
| `GET/POST` | `/api/v1/native-hrm/leave-requests/` | Danh sach & Tao don xin nghi phep | Employee / HRM |
| `POST` | `/api/v1/native-hrm/leave-requests/{id}/approve/` | Duyet don nghi phep (Tru quy phep) | HRM / Manager |
| `GET`  | `/api/v1/native-hrm/payroll/` | Danh sach bang luong theo thang | Employer / HRM |
| `POST` | `/api/v1/native-hrm/payroll/calculate/` | Chay engine tinh luong tu dong toan cty | Employer / HRM |
| `POST` | `/api/v1/native-hrm/payroll/{id}/approve/` | Khoa so & Phe duyet bang luong | Employer / HRM |
| `GET`  | `/api/v1/native-hrm/payroll/{id}/payslip/` | Lay du lieu phieu luong de in A4 | Employee / HRM |
