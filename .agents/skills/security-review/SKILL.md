---
name: security-review
description: Perform intelligent, context-aware AI security code reviews to detect vulnerabilities (OWASP Top 10, Injection, Auth bypass, XSS, Secret exposure, RBAC flaws) and filter false positives.
---

# Security Review Skill (InfoHR Security Analyzer)

Khi nhận được yêu cầu thực hiện **`/security-review`** hoặc kiểm tra bảo mật code, hãy thực hiện quy trình quét bảo mật 4 bước dưới đây để phân tích toàn bộ thay đổi trong codebase (Backend Django & Frontend Next.js).

---

## 🔍 Step 1: Scope & Diff Identification
Xác định phạm vi các file bị thay đổi (Git Diff) hoặc các file được yêu cầu kiểm tra.
- **Backend (Python / Django)**: `api/apps/`, `api/shared/`, `api/config/`
- **Frontend (TypeScript / Next.js)**: `frontend/src/app/`, `frontend/src/views/`, `frontend/src/layouts/`, `frontend/src/services/`, `frontend/src/utils/`

---

## 🛡️ Step 2: Vulnerability Analysis Checklist

### 1. Injection Attacks
- **SQL / Django ORM Injection**: Kiểm tra các hàm `raw()`, `extra()`, hoặc nối chuỗi SQL thủ công thay vì dùng ORM tham số hóa.
- **Command / Eval Injection**: Kiểm tra việc dùng `eval()`, `exec()`, `subprocess.Popen(..., shell=True)`.

### 2. Authentication & Authorization (Xác thực & Phân quyền)
- **Protected Route Bypass (Frontend)**: Đảm bảo không trang Protected nào (`/employer/*`, `/admin/*`) render giao diện hoặc gọi API trước khi xác thực thành công.
- **RBAC Flaws**: Kiểm tra API Backend có decorator `@permission_classes` chuẩn chưa (Employer vs Admin vs Candidate).
- **Open Redirect Vulnerability**: Mọi tham số `redirect` hoặc `next` trong trang Login/Register phải được validate nghiêm ngặt (chỉ chấp nhận URL nội bộ bắt đầu bằng `/` đơn, tuyệt đối cấm `//` hoặc `http://`).

### 3. Data Exposure & Secrets (Lộ bí mật & Dữ liệu nhạy cảm)
- **Hardcoded Secrets**: Quét API Key, Secret Key, Token, Mật khẩu hardcode trong code.
- **Sensitive Data Logging**: Kiểm tra `console.log` hoặc `print()` làm lộ mật khẩu, JWT token, hoặc PII (Email, SĐT, Thông tin cá nhân).

### 4. Cross-Site Scripting (XSS) & HTML Sanitization
- **Dangerous HTML Rendering**: Kiểm tra các nơi dùng `dangerouslySetInnerHTML`, `HtmlContent`, hoặc `innerHTML`. Mọi nội dung HTML từ người dùng/AI phải chạy qua `sanitizeHtml`.

### 5. Session & Cookie Security
- **JWT & Token Handling**: Đảm bảo token được lưu trữ an toàn trong HttpOnly Cookies với flag `SameSite` và `Secure`.

---

## 🧪 Step 3: False Positive Filtering
Tự động lọc bỏ các cảnh báo nhiễu (Low-impact / Noise) để tập trung vào lỗ hổng nghiêm trọng:
- Bỏ qua các cảnh báo DoS / Rate-limiting trừ khi có khả năng gây sập hệ thống trực tiếp.
- Bỏ qua các mock adapter chỉ dùng trong môi trường test local (`initMockAdapter`).
- Bỏ qua các đường dẫn tĩnh công khai (`public.ecr.aws`, CDN).

---

## 📝 Step 4: Security Finding Report Format
Trình bày kết quả đánh giá bảo mật theo định dạng Markdown chuẩn:

```markdown
### 🚨 [Severity: CRITICAL / HIGH / MEDIUM / LOW] - [Tên lỗ hổng]
- **File bị ảnh hưởng**: [filename](file:///path/to/file#L10-L20)
- **Mô tả lỗ hổng**: [Chi tiết lỗ hổng và rủi ro bị khai thác]
- **Cách khắc phục (Remediation)**:
```code
// Đoạn code đã được sửa an toàn
```
```
