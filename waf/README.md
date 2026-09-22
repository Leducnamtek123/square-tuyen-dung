# 🛡️ InfoHR Web Application Firewall (WAF) — OWASP ModSecurity Core Rule Set

Hệ thống WAF tự host (Self-hosted WAF Container) cho **Square Tuyển Dụng (InfoHR)** sử dụng hình ảnh chuẩn `owasp/modsecurity-crs:nginx-alpine`. WAF đóng vai trò là chốt chặn đầu tiên (Edge Shield) đứng trước `nginx-gateway` nhằm ngăn ngừa các cuộc tấn công tầng ứng dụng thuộc danh mục **OWASP Top 10**.

---

## 1. 🌐 Vị trí trong Kiến trúc Hệ thống

```
Client (Web / App / LiveKit)
         │
         ▼
┌─────────────────────────────────┐
│     waf (OWASP ModSec CRS)      │  :8080 (hoặc :80/:443)
│   - Kiểm tra SQLi, XSS, RCE     │
│   - Lọc Bad Bots & LFI/RFI      │
│   - Inspection limit 100MB      │
└────────────────┬────────────────┘
                 │ Clean HTTP Traffic
                 ▼
┌─────────────────────────────────┐
│          nginx-gateway          │  :80 (nội bộ proxy-net)
│   - Subdomain routing           │
│   - Static asset caching        │
│   - Rate limiting, WebSocket    │
└─────────────────────────────────┘
```

---

## 2. ⚙️ Cấu hình Biến Môi trường (`.env`)

Bạn có thể điều khiển chế độ hoạt động của WAF trong file `.env` mà không cần build lại image:

| Biến | Giá trị khuyến nghị (Giai đoạn đầu) | Giá trị Production (Sau 3–5 ngày) | Mô tả |
| :--- | :--- | :--- | :--- |
| `WAF_RULE_ENGINE` | `DetectionOnly` | `On` | `DetectionOnly`: Ghi log cảnh báo, không chặn (Audit). `On`: Chặn ngay (HTTP 403) khi phát hiện tấn công. |
| `WAF_PARANOIA` | `1` | `1` | Mức độ cảnh báo từ 1–4. Khuyến nghị giữ mức 1 để tránh chặn nhầm tiếng Việt. |
| `NGINX_PORT` | `8080` (hoặc `80`) | `80` | Cổng HTTP đối ngoại máy chủ host giao cho WAF quản lý. |

---

## 3. 📁 Cấu trúc Thư mục

```text
waf/
├── rules/
│   ├── REQUEST-900-EXCLUSION-RULES-BEFORE-CRS.conf   # Exclusions cho LiveKit, file upload CV 100MB, tiếng Việt UTF-8
│   └── RESPONSE-999-EXCLUSION-RULES-AFTER-CRS.conf   # Ẩn banner server, cấu hình định dạng log
├── logs/                                             # ModSecurity audit logs (được mount tự động từ container)
│   └── modsec_audit.log
└── README.md                                         # Tài liệu này
```

---

## 4. 🔍 Tra cứu Log & Giám sát Tấn công

### Xem log thời gian thực của container WAF:
```bash
docker compose logs -f waf
```

### Tra cứu các bản ghi vi phạm bị ghi nhận trong audit log:
```bash
docker exec -it tuyendung-studio-waf tail -n 100 /var/log/modsec/modsec_audit.log
```

### Kiểm thử phát hiện tấn công:
```bash
# Giả lập payload SQL Injection
curl -i "http://localhost:8080/api/jobs/?search=' OR 1=1 --"

# Giả lập payload XSS
curl -i "http://localhost:8080/api/jobs/?search=<script>alert(1)</script>"
```
Khi đang ở chế độ `DetectionOnly`, request vẫn sẽ trả về kết quả bình thường nhưng log trong container `waf` sẽ ghi nhận chi tiết Rule ID vi phạm (ví dụ `942100` cho SQLi hoặc `941100` cho XSS).
