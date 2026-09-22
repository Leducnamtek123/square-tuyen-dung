# 🏛️ Đặc Tả Kiến Trúc Phân Hệ Gói Dịch Vụ, Phân Quyền & Thanh Toán Tự Động (Pricing, Entitlements & SePay Billing)

> **Tài liệu**: Design Specification (`SPEC.md`)  
> **Dự án**: InfoHR (Square Tuyển Dụng)  
> **Phân hệ**: Gói cước (`apps/subscriptions`), Động cơ phân quyền (Entitlement Engine), Admin Portal & Employer Billing  
> **Mô hình tham chiếu**: Chuẩn Open-Source SaaS quốc tế ([Lago](https://github.com/getlago/lago), [Flexprice](https://github.com/flexprice/flexprice), SaaS Pegasus) kết hợp Cổng VietQR [SePay](https://sepay.vn)  
> **Ngày lập**: 2026-09-23  
> **Trạng thái**: Đã thống nhất thiết kế (Validated Design - Awaiting User Final Review)

---

## 1. 🎯 Tổng Quan & Mục Tiêu Nghiệp Vụ

### 1.1. Bối cảnh
InfoHR hiện tại là nền tảng tuyển dụng thông minh tích hợp WebRTC Voice AI AILA và phần mềm HRM. Tuy nhiên:
- Trang báo giá phía nhà tuyển dụng (`/employer/pricing`) hiện đang là dữ liệu tĩnh (hardcoded).
- Hệ thống chưa có cơ chế kiểm soát định mức (quota limits) như: số lượng tin tuyển dụng đang chạy song song, số lượt phỏng vấn Voice AI hàng tháng, số lượng tài khoản nhân sự trong công ty.
- Admin chưa có giao diện quản lý gói cước, cấu hình quyền hạn/định mức cho từng gói, và chưa thể gán gói linh hoạt cho doanh nghiệp.
- Chưa có luồng thanh toán tự động online qua mã VietQR ngân hàng.

### 1.2. Mục tiêu kiến trúc
1. **Module hóa sạch sẽ (Clean Architecture)**: Xây dựng Django app độc lập `api/apps/subscriptions/` quản lý toàn bộ vòng đời gói cước, quyền lợi, đơn hàng và lịch sử sử dụng.
2. **Entitlement & Quota Engine hiệu năng cao**: Tách biệt rõ 2 loại quyền (Boolean Feature & Metered Quota), cache Redis hạn chế truy vấn CSDL, kiểm soát chặt chẽ ở DRF View Layer.
3. **Admin Portal toàn năng**: Admin có thể tạo/sửa gói cước, cấu hình ma trận tính năng trực quan, gán gói thủ công cho công ty (B2B sales assisted), gia hạn nhanh và đối soát đơn hàng.
4. **Employer Real-time Checkout**: Doanh nghiệp chọn gói, hệ thống sinh mã VietQR SePay động, tự động nhận webhook ngân hàng và kích hoạt gói sau 1-2 giây.
5. **Mặc định Gói Miễn Phí & Hạ cấp mượt mà (Graceful Downgrade)**: Mọi doanh nghiệp mới đăng ký đều có Gói Miễn Phí; khi gói VIP hết hạn thì tự động đưa về Gói Miễn Phí mà không làm hỏng dữ liệu.

---

## 2. 🗄️ Thiết Kế Cơ Sở Dữ Liệu (Database Schema)

Tất cả các model được đặt tại `api/apps/subscriptions/models.py` và kế thừa từ `CommonBaseModel` (`create_at`, `update_at`).

```mermaid
erDiagram
    SubscriptionPlan ||--o{ PlanEntitlement : "has features"
    PlanFeature ||--o{ PlanEntitlement : "defined in"
    Company ||--o| CompanySubscription : "currently active"
    SubscriptionPlan ||--o{ CompanySubscription : "applied to"
    Company ||--o{ SubscriptionOrder : "orders"
    SubscriptionPlan ||--o{ SubscriptionOrder : "purchased"
    Company ||--o{ SubscriptionUsage : "tracks quota"

    SubscriptionPlan {
        int id PK
        string code UK "free, basic, pro, enterprise"
        string name "Gói Chuyên Nghiệp"
        string description "Mô tả gói"
        decimal price_monthly "Giá theo tháng (VNĐ)"
        decimal price_annually "Giá theo năm (VNĐ)"
        int discount_percentage "Tỷ lệ chiết khấu năm"
        boolean is_active "Bật/Tắt hiển thị"
        boolean is_default_free "Gói mặc định khi đăng ký"
        int sort_order "Thứ tự sắp xếp hiển thị"
        string badge_text "Ví dụ: Phổ biến nhất"
    }

    PlanFeature {
        int id PK
        string code UK "allow_voice_ai, max_active_jobs..."
        string name "Tên tính năng hiển thị"
        string description "Mô tả chi tiết quyền"
        string feature_type "BOOLEAN hoặc METERED"
        string category "RECRUITMENT, AI, HRM, GENERAL"
        string unit "tin, lượt, người..."
        int sort_order "Thứ tự hiển thị"
    }

    PlanEntitlement {
        int id PK
        int plan_id FK
        int feature_id FK
        boolean is_enabled "Có quyền hay không"
        int quota_limit "Hạn mức (null hoặc -1 = Không giới hạn)"
    }

    CompanySubscription {
        int id PK
        int company_id FK_UK "Quan hệ 1-1 với Company"
        int plan_id FK
        string status "ACTIVE, EXPIRED, CANCELLED"
        string billing_cycle "MONTHLY, ANNUALLY, LIFETIME"
        datetime started_at
        datetime expires_at "Hết hạn (null nếu gói Free vĩnh viễn)"
        int assigned_by_id FK "Null nếu tự thanh toán, có nếu Admin gán"
        text admin_notes "Ghi chú hợp đồng của Admin"
    }

    SubscriptionOrder {
        int id PK
        string order_code UK "Cú pháp SePay: SUB-2026-XXXX"
        int company_id FK
        int plan_id FK
        string billing_cycle "MONTHLY hoặc ANNUALLY"
        decimal amount "Số tiền thực tế thanh toán"
        string payment_method "SEPAY, ADMIN_MANUAL"
        string payment_status "PENDING, PAID, CANCELLED, EXPIRED"
        string sepay_transaction_id "Mã giao dịch từ SePay"
        datetime paid_at
        text qr_code_url "Link ảnh VietQR động"
        json raw_webhook_data "Dữ liệu webhook lưu lại"
    }

    SubscriptionUsage {
        int id PK
        int company_id FK
        string feature_code "max_active_jobs, max_ai_interviews..."
        date cycle_start "Bắt đầu chu kỳ tháng"
        date cycle_end "Kết thúc chu kỳ tháng"
        int used_amount "Lượng đã tiêu thụ"
    }
```

### 2.1. Danh mục Tính năng Hệ thống (Standard System Features)
Khi khởi tạo hệ thống (seed data), các tính năng sau sẽ được tạo trong `PlanFeature`:

| Mã tính năng (`code`) | Tên tính năng | Loại (`feature_type`) | Đơn vị (`unit`) | Phân loại (`category`) |
| :--- | :--- | :--- | :--- | :--- |
| `max_active_jobs` | Số tin tuyển dụng hiển thị cùng lúc | `METERED` | tin | `RECRUITMENT` |
| `max_ai_interviews` | Lượt phỏng vấn Voice AI AILA/tháng | `METERED` | lượt | `AI` |
| `max_company_members` | Số tài khoản thành viên HR công ty | `METERED` | người | `GENERAL` |
| `max_cv_views` | Lượt mở khóa hồ sơ ứng viên/tháng | `METERED` | lượt | `RECRUITMENT` |
| `allow_voice_ai` | Phỏng vấn trực tuyến Voice AI AILA | `BOOLEAN` | - | `AI` |
| `allow_hrm_suite` | Trọn bộ Quản lý Nhân sự HRM | `BOOLEAN` | - | `HRM` |
| `allow_ai_assistant` | Trợ lý tuyển dụng AI & Viết JD | `BOOLEAN` | - | `AI` |
| `allow_bulk_exchange` | Xuất / Nhập danh sách Excel | `BOOLEAN` | - | `GENERAL` |
| `highlight_job_posts` | Nhãn tin tuyển dụng Nổi bật / Ưu tiên | `BOOLEAN` | - | `RECRUITMENT` |

---

## 3. ⚙️ Động Cơ Phân Quyền & Kiểm Soát Quota (Entitlement Engine)

### 3.1. `EntitlementService` (`api/apps/subscriptions/services.py`)
Service tập trung xử lý mọi kiểm tra quyền và hạn mức với kiến trúc tối ưu Cache Redis:
- **Cache Key**: `company:entitlements:{company_id}` (TTL: 3600s, bị xóa ngay khi gán/nâng cấp gói).
- **Hàm `get_company_entitlements(company) -> dict`**:
  Lấy thông tin gói đang hoạt động của công ty và gom toàn bộ features thành một dictionary dạng `{ feature_code: { enabled: bool, limit: int | None } }`. Nếu công ty chưa có subscription hoặc gói đã hết hạn, tự động trả về quyền lợi của `Gói Miễn Phí (Default Free)`.
- **Hàm `can_access(company, feature_code) -> bool`**:
  Kiểm tra quyền đối với các tính năng `BOOLEAN`.
- **Hàm `check_quota(company, quota_code) -> QuotaResult`**:
  Kiểm tra hạn mức `METERED`:
  - `max_active_jobs`: Đếm trực tiếp `JobPost.objects.filter(company=company, status=JobPostStatus.APPROVED, is_active=True).count()`.
  - `max_ai_interviews`: Kiểm tra `used_amount` trong chu kỳ hiện tại của bảng `SubscriptionUsage`.
  - `max_company_members`: Đếm số thành viên kích hoạt `CompanyMember.objects.filter(company=company, is_active=True).count()`.
- **Hàm `consume_quota(company, quota_code, amount=1)`**:
  Cập nhật nguyên tử `F('used_amount') + amount` trong chu kỳ hiện tại.

### 3.2. DRF Permission Classes & Decorators
Bảo vệ API endpoints ngay tại tầng REST framework:

```python
# Permission class bảo vệ module boolean
class HasFeatureEntitlement(permissions.BasePermission):
    def __init__(self, feature_code: str):
        self.feature_code = feature_code

    def has_permission(self, request, view):
        company = request.user.active_company
        if not company:
            return False
        return EntitlementService.can_access(company, self.feature_code)

# Decorator kiểm tra quota trước khi thực thi action tạo mới
def enforce_quota(quota_code: str):
    def decorator(view_func):
        @wraps(view_func)
        def _wrapped_view(view_instance, request, *args, **kwargs):
            company = request.user.active_company
            quota_status = EntitlementService.check_quota(company, quota_code)
            if not quota_status.is_allowed:
                return Response({
                    "error": "quota_exceeded",
                    "feature_code": quota_code,
                    "limit": quota_status.limit,
                    "used": quota_status.used,
                    "message": f"Bạn đã đạt giới hạn {quota_status.limit} của gói cước hiện tại.",
                    "upgrade_url": "/employer/pricing"
                }, status=status.HTTP_403_FORBIDDEN)
            return view_func(view_instance, request, *args, **kwargs)
        return _wrapped_view
    return decorator
```

---

## 4. 💳 Tích Hợp Cổng Thanh Toán SePay VietQR & Webhook

### 4.1. Quy trình tạo đơn & mã VietQR
1. Khi nhà tuyển dụng chọn gói trên giao diện, gọi API: `POST /api/subscriptions/orders/` với body `{ "plan_id": 2, "billing_cycle": "MONTHLY" }`.
2. Backend tạo mã đơn hàng dạng: `SUB-YYYYMMDD-XXXX` (ví dụ `SUB-20260923-9F2B`).
3. Sinh link ảnh VietQR động theo chuẩn Napas 247:
   `https://qr.sepay.vn/img?acc={BANK_ACCOUNT}&bank={BANK_NAME}&amount={AMOUNT}&des={ORDER_CODE}`.
4. Trả về cho Frontend: `order_code`, `amount`, `qr_code_url`, `expires_at` (15 phút).

### 4.2. Xử lý Webhook SePay (`POST /api/subscriptions/webhooks/sepay/`)
1. **Xác thực bảo mật**:
   - Kiểm tra Header `Authorization: Apikey <SEPAY_WEBHOOK_API_KEY>`.
2. **Khớp đơn hàng**:
   - Quét nội dung chuyển khoản `content` để tìm mã đơn hàng `SUB-\d{8}-[A-Za-z0-9]+`.
   - Tìm `SubscriptionOrder` tương ứng đang có trạng thái `PENDING`.
3. **Kích hoạt gói dịch vụ trong 1 Database Transaction**:
   - Kiểm tra số tiền chuyển `transferAmount >= order.amount`.
   - Đổi `order.payment_status = PAID`, lưu `sepay_transaction_id = referenceCode`, `paid_at = now()`.
   - Cập nhật hoặc tạo mới `CompanySubscription`:
     - Gán `plan = order.plan`.
     - `status = ACTIVE`.
     - `started_at = now()`.
     - `expires_at = now() + 30 days` (hoặc 365 days).
   - Xóa cache Redis quyền hạn của công ty.
   - Bắn thông báo nội bộ (Notification) chúc mừng nâng cấp thành công.

---

## 5. 🎛️ Phân Hệ Quản Trị Dành Cho Admin (Admin Portal)

Bổ sung mục menu **"Gói Cước & Thuê Bao"** trong `AdminMenu.tsx`:

### 5.1. Trang 1: Quản lý Gói Dịch Vụ (`/admin/pricing-plans`)
- Bảng hiển thị danh sách các gói cước: Tên, Mã, Giá tháng, Giá năm, Badge nhãn, Số công ty đang dùng, Bật/Tắt, Gói mặc định.
- **Form Tạo / Chỉnh sửa Gói**:
  - Tab 1: Thông tin cơ bản (Tên, Mã code, Mô tả, Giá tháng, Giá năm, Nhãn nổi bật).
  - Tab 2: Ma trận phân quyền & hạn mức (Entitlements Matrix):
    - Nhập số hoặc tích *"Không giới hạn"* cho: `max_active_jobs`, `max_ai_interviews`, `max_company_members`, `max_cv_views`.
    - Checkbox bật/tắt cho: `allow_voice_ai`, `allow_hrm_suite`, `allow_ai_assistant`, `allow_bulk_exchange`, `highlight_job_posts`.

### 5.2. Trang 2: Quản lý Thuê Bao Doanh Nghiệp (`/admin/subscriptions`)
- Danh sách tất cả công ty kèm gói cước đang áp dụng.
- Cột trạng thái màu sắc: Xanh (*Đang hoạt động*), Vàng (*Sắp hết hạn < 7 ngày*), Đỏ (*Đã hết hạn*).
- Bộ lọc: Lọc theo gói, lọc theo trạng thái, tìm kiếm theo tên hoặc mã số thuế.
- **Modal Gán Gói Thủ Công (Assign Plan Modal)**:
  - Chọn công ty (Autocomplete).
  - Chọn gói dịch vụ.
  - Chọn thời hạn: `1 tháng`, `3 tháng`, `6 tháng`, `1 năm`, `Tùy chọn ngày`, `Vĩnh viễn`.
  - Ghi chú hợp đồng (Admin notes).
  - Bấm "Kích hoạt" $\rightarrow$ Kích hoạt gói tức thì.
- **Nút Thao Tác Nhanh**: Gia hạn `+30 ngày`, `+90 ngày`, hoặc Đưa về Gói Miễn Phí.

### 5.3. Trang 3: Lịch Sử Đơn Hàng & Giao Dịch (`/admin/subscription-orders`)
- Xem toàn bộ các giao dịch SePay và Admin gán gói.
- Hỗ trợ đối soát và nút **"Kích hoạt thủ công"** trong trường hợp khách chuyển khoản ghi sai cú pháp nhưng tiền đã vào tài khoản.

---

## 6. 💼 Trải Nghiệm Doanh Nghiệp (Employer Portal)

### 6.1. Trang Bảng Giá Động (`/employer/pricing`)
- Tải danh sách gói từ `GET /api/subscriptions/plans/`.
- Nút chuyển đổi chu kỳ: *Tháng* / *Năm* (hiển thị tag *"Tiết kiệm 20%"*).
- Highlight gói hiện tại đang dùng (viền xanh, badge *"Gói hiện tại"*, nút disabled *"Đang sử dụng"*).
- Nút **"Nâng cấp ngay"** mở modal thanh toán.
- Bảng so sánh tính năng (Feature comparison table) rõ ràng, trực quan.

### 6.2. Modal Thanh Toán VietQR SePay Tự Động
- Hiển thị mã QR VietQR Napas 247 tạo tự động.
- Thông tin số tài khoản, tên ngân hàng, số tiền, cú pháp chuyển khoản có nút **Sao chép (Copy)**.
- Đếm ngược 15 phút.
- Frontend polling kiểm tra trạng thái mỗi 3 giây: Khi nhận được trạng thái `PAID`, hiển thị hiệu ứng chúc mừng thành công và tự động chuyển về trang quản trị với quyền mới.

### 6.3. Widget Theo Dõi Quota (Header & Dashboard)
- Hiển thị trên thanh Header hoặc Dashboard:
  - Tên gói và thời hạn còn lại (vd: 👑 *Gói Pro - Còn 24 ngày*).
  - Thanh tiến trình quota:
    - 📄 Tin tuyển dụng: `3 / 10 tin`
    - 🎙️ Phỏng vấn AI: `12 / 50 lượt`
    - 👥 Thành viên: `4 / 10 người`
  - Nút nhanh *"Nâng cấp gói"*.

### 6.4. Chặn Quyền Thân Thiện (UI Gating)
- Component `<EntitlementGuard feature="allow_voice_ai" fallback={<UpgradeBanner />}>` ẩn hoặc hiển thị banner nâng cấp thân thiện khi công ty chưa có quyền.
- Dialog thông báo vượt quá quota đăng tin: Nhắc nhở nâng cấp thay vì báo lỗi hệ thống.

---

## 7. ⏰ Tác Vụ Định Kỳ & Hạ Cấp Mượt Mà (Celery Beat Task)

Tác vụ `subscriptions.tasks.process_subscription_lifecycle`:
1. Chạy hàng ngày vào lúc `00:05` UTC+7.
2. Tìm các `CompanySubscription` có `expires_at < timezone.now()` và `status = 'ACTIVE'`.
3. Đổi trạng thái sang `EXPIRED`.
4. Gán công ty về `Gói Miễn Phí (is_default_free=True)`.
5. Tạo thông báo trong hệ thống gửi đến Employer thông báo gói cước đã hết hạn và chuyển về gói miễn phí.

---

## 8. 🧪 Kế Hoạch Kiểm Thử & Đảm Bảo Chất Lượng (Verification & QA)

1. **Unit & API Tests (Pytest DRF)**:
   - Test CRUD gói dịch vụ & ma trận entitlements bởi Admin.
   - Test `EntitlementService.can_access()` và `check_quota()`.
   - Test bảo vệ API (trả về 403 khi hết quota hoặc chưa có quyền).
   - Test Webhook SePay (xác thực token, khớp cú pháp, kích hoạt gói, xử lý idempotency chống trùng lặp).
   - Test Admin gán gói thủ công và gia hạn ngày.
2. **Frontend Component & E2E Tests (Playwright)**:
   - Test luồng Admin tạo gói cước và gán gói cho công ty.
   - Test luồng Employer vào trang `/employer/pricing`, xem bảng giá động và mở modal VietQR.
   - Test hiển thị Widget Quota trên Dashboard Employer.
