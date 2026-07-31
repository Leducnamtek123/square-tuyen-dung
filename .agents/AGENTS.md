# InfoHR Repository Security Guidelines & Rules

## 1. Authentication & Route Protection Rules
- **Pre-mount Route Protection**: Mọi trang thuộc khu vực Quản trị/Bảo vệ (`/employer/*`, `/admin/*`) MUST được kiểm tra quyền truy cập trước khi layout hoặc component nội bộ được mount. Không bao giờ render Sidebar, Header hay dữ liệu protected trong trạng thái `loading` hoặc `unauthenticated`.
- **Open Redirect Protection**: Mọi tham số chuyển hướng (`redirect` / `next`) MUST được kiểm tra qua helper `getSafeRedirectPath()`. Chỉ cho phép các đường dẫn nội bộ bắt đầu bằng `/` đơn (tuyệt đối từ chối `//`, `\\`, hoặc chứa domain `http://`/`https://`).

## 2. API Authorization & Backend Security Rules
- **Backend Enforced Roles**: Không phụ thuộc hoàn toàn vào Frontend Route Guard. Mọi Endpoint API Django trong `api/apps/` MUST áp dụng `@permission_classes` hoặc `PermissionActionMapMixin` đúng vai trò (`IsEmployerUser`, `IsAdminUser`).
- **ORM Parameterization**: Luôn sử dụng Django ORM query phương thức tiêu chuẩn (`filter()`, `annotate()`, `Case/When`). Tuyệt đối không nối chuỗi thô (SQL concatenation).

## 3. Data Sanitization & XSS Prevention
- **HTML Sanitization**: Mọi dữ liệu HTML động render trên Frontend MUST đi qua `sanitizeHtml` để loại bỏ các thẻ script, iframe nguy hại trước khi hiển thị.
