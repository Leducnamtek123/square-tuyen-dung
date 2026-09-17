# Báo cáo Toàn diện Kiểm thử Hệ thống Đa tác tử (Multi-Agent Audit Report)
**Dự án**: Square Tuyển Dụng (`http://localhost:8080`)  
**Ngày thực hiện**: 16/09/2026  
**Phương pháp**: Mô phỏng 3 Persona người dùng thực tế (Headless Chromium Playwright) kết hợp đối soát dữ liệu MySQL Backend  
**Người thực hiện**: Antigravity Multi-Agent Audit Framework  

---

## 1. Tóm tắt Điều hành (Executive Summary)

Đợt kiểm thử đã kích hoạt 3 tác tử độc lập đóng vai 3 đối tượng người dùng then chốt trong hệ sinh thái tuyển dụng:
1. **Ứng viên (Job Seeker)**: Tìm việc, lọc ngành nghề, xem chi tiết công việc, nộp hồ sơ trực tuyến, trải nghiệm phòng phỏng vấn AI WebRTC, tạo CV ATS và kiểm tra responsive trên thiết bị di động (iPhone viewport 390x844).
2. **Nhà tuyển dụng (Employer)**: Quản lý tin tuyển dụng, tạo mới bài đăng, xem danh sách ứng viên ứng tuyển, cấu hình ngân hàng câu hỏi và trợ lý AI phỏng vấn.
3. **Quản trị viên (Admin)**: Quản trị tin tuyển dụng, duyệt bài, kiểm tra danh mục nghề nghiệp, quản trị câu hỏi phỏng vấn, cấu hình giọng nói AI và quản lý người dùng toàn hệ thống.

Toàn bộ quá trình chạy qua hơn **129 thao tác thực tế**, ghi nhận **85 ảnh chụp màn hình bằng chứng**, giám sát toàn bộ **Console logs**, **Network traffic (HTTP status, duration)** và **Truy vấn đối soát trực tiếp vào MySQL database container**.

### Bảng điểm Đánh giá Sức khỏe Hệ thống (Health Scorecard)

| Tiêu chí Đánh giá | Điểm số | Đánh giá Trạng thái | Ghi chú Trọng tâm |
| :--- | :---: | :---: | :--- |
| **Độ ổn định Chức năng (Functional Stability)** | **7.5 / 10** | ⚠️ Cần khắc phục gấp | Luồng E2E cơ bản hoạt động tốt. Tuy nhiên API quản lý người dùng của Admin bị **Crash 500 Blocker**. |
| **Trải nghiệm & Giao diện (UI / UX Usability)** | **6.8 / 10** | ⚠️ Cần cải thiện | Giao diện hiện đại, sạch sẽ trên Desktop. Tuy nhiên CV Builder bị **vỡ layout trên Mobile**, Bản đồ bị **ô xám chết**, Modal nộp CV **chưa tự điền thông tin**. |
| **Hiệu năng & Mạng (Performance & Network)** | **8.2 / 10** | ✅ Tốt | 95% API phản hồi dưới 150ms. Chỉ có endpoint check credentials ban đầu và resume upload mất ~2s - 3.5s. |
| **Tính toàn vẹn Dữ liệu (Database Consistency)** | **9.5 / 10** | ✅ Rất Tốt | Dữ liệu việc làm, lương min-max, quan hệ công ty và tài khoản lưu trữ đồng bộ chính xác giữa DB và UI. |

---

## 2. Ma trận Lỗi & Điểm nghẽn Trải nghiệm (Bug Matrix)

```
+---------------------------------------------------------------------------------------+
| PHÂN CẤP ĐỘ NGHIÊM TRỌNG (SEVERITY MATRIX)                                            |
|                                                                                       |
|  [P0 - BLOCKER] Sập API Quản lý Người dùng Admin (500 Internal Server Error)          |
|  [P1 - HIGH]    Bản đồ Leaflet bị ô vuông xám chết (Dead Gray Box)                    |
|  [P1 - HIGH]    Vỡ bố cục CV Builder trên Mobile (390x844) che kín form nhập liệu     |
|  [P2 - MEDIUM]  Modal Ứng tuyển không tự động điền (Auto-fill) thông tin ứng viên     |
|  [P2 - MEDIUM]  Ký hiệu tiền tệ hiển thị lai tạp ("$ 18 - 30 triệu")                  |
|  [P2 - MEDIUM]  Đề xuất việc làm đã hết hạn trong box "Việc làm tương tự"             |
|  [P3 - LOW]     Dashboard Employer xuất hiện chuỗi "NaN / undefined" khi chưa có data |
+---------------------------------------------------------------------------------------+
```

### Chi tiết Các phát hiện:

### 🔴 [P0 - BLOCKER] Crash 500 Internal Server Error tại `/api/v1/auth/users/` (Admin User Management)
- **Vị trí**: `api/apps/accounts/views_users.py:643`
- **Mã phản hồi**: `HTTP 500 Internal Server Error` (lặp lại 4 lần liên tiếp)
- **Triệu chứng UI**: Khi Admin truy cập trang Quản lý Người dùng (`/admin/users`), hệ thống hiển thị thông báo lỗi đỏ *"Lỗi máy chủ. Vui lòng thử lại sau"*. Bảng danh sách rỗng (0 người dùng), Admin hoàn toàn không thể xem, tìm kiếm, khóa hay phân quyền tài khoản.
- **Bằng chứng Screenshot**: [`docs/audit_reports/screenshots/admin_admin_deepdive_users_1789493848834.png`](file:///c:/Users/WIN10/Documents/square-tuyen-dung/docs/audit_reports/screenshots/admin_admin_deepdive_users_1789493848834.png)
- **Nguyên nhân Kỹ thuật**:
  - Tại `views_users.py` dòng 643 có đoạn:
    ```python
    queryset = queryset.prefetch_related("companymember_set__role")
    ```
  - Trong khi đó, quan hệ giữa `User` và `CompanyMember` tại `api/apps/profiles/models.py:554` được khai báo:
    ```python
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="company_memberships")
    ```
  - Do `related_name="company_memberships"` đã ghi đè reverse manager mặc định `companymember_set`, Django ORM ném ra ngoại lệ `AttributeError: Cannot find 'companymember_set' on User object`, gây sập toàn bộ request với HTTP 500.

---

### 🟠 [P1 - HIGH] Bản đồ Leaflet/OpenStreetMap bị ô xám chết (Dead Gray Box)
- **Vị trí**: Trang Chi tiết Việc làm (`/viec-lam/:slug`)
- **Triệu chứng UI**: Khu vực "Vị trí việc làm" hiển thị một khung màu xám trơ trọi chỉ có icon Zoom In/Zoom Out và icon ghim, không tải được bản đồ đường phố.
- **Bằng chứng Screenshot**: [`docs/audit_reports/screenshots/job_seeker_05_seeker_job_detail_1789493794843.png`](file:///c:/Users/WIN10/Documents/square-tuyen-dung/docs/audit_reports/screenshots/job_seeker_05_seeker_job_detail_1789493794843.png)
- **Bằng chứng Log**: Console ghi nhận 14 lỗi mạng:
  `Failed to load resource: net::ERR_NAME_NOT_RESOLVED (https://a.tile.openstreetmap.org/15/...)`
- **Nguyên nhân Kỹ thuật**:
  - Frontend nạp map tiles trực tiếp từ máy chủ công cộng OpenStreetMap (`tile.openstreetmap.org`) mà không có cơ chế fallback, timeout handling, hoặc cached tile tĩnh. Khi môi trường mạng nội bộ hoặc DNS không phân giải được OSM quốc tế, component bị rơi vào trạng thái xám chết mà không có hình minh họa vị trí thay thế.

---

### 🟠 [P1 - HIGH] Vỡ bố cục CV Builder trên Mobile Viewport (390x844)
- **Vị trí**: Trang Tạo CV (`/cv-builder`)
- **Triệu chứng UI**:
  - Thanh công cụ điều hướng phía trên bị tràn ngang, các nút quan trọng như "Chỉnh sửa", "Xem trước", "Tải xuống PDF" bị cắt xén cụt lủn ("Chỉnh...", "Xem...").
  - Khung popover gợi ý "Chọn mẫu CV chuẩn ATS" nhảy đè lên toàn bộ nửa trên của màn hình, che khuất hoàn toàn các trường form nhập thông tin học vấn/kinh nghiệm. Người dùng trên điện thoại không thể cuộn hay thao tác được với form.
- **Bằng chứng Screenshot**: [`docs/audit_reports/screenshots/job_seeker_mobile_cv_builder_1789493919090.png`](file:///c:/Users/WIN10/Documents/square-tuyen-dung/docs/audit_reports/screenshots/job_seeker_mobile_cv_builder_1789493919090.png)

---

### 🟡 [P2 - MEDIUM] Modal Ứng tuyển không tự động điền thông tin Ứng viên (Auto-fill Friction)
- **Vị trí**: Modal "Nộp hồ sơ ứng tuyển" tại `/viec-lam/:slug`
- **Triệu chứng UI**: Ứng viên đã đăng nhập tài khoản và chọn tùy chọn "Sử dụng hồ sơ trực tuyến trên hệ thống", nhưng 3 trường nhập liệu cốt lõi:
  - *Họ và tên*
  - *Email liên hệ*
  - *Số điện thoại*
  đều bị bỏ trống hoàn toàn. Ứng viên buộc phải nhập thủ công lại toàn bộ thông tin cá nhân vốn dĩ hệ thống đã lưu sẵn.
- **Bằng chứng Screenshot**: [`docs/audit_reports/screenshots/job_seeker_06_seeker_apply_modal_1789493797963.png`](file:///c:/Users/WIN10/Documents/square-tuyen-dung/docs/audit_reports/screenshots/job_seeker_06_seeker_apply_modal_1789493797963.png)
- **Hệ quả UX**: Tạo ma sát lớn trong quá trình nộp đơn, làm tăng tỷ lệ bỏ dở (abandonment rate) của ứng viên.

---

### 🟡 [P2 - MEDIUM] Định dạng hiển thị tiền tệ lai tạp không chuyên nghiệp
- **Vị trí**: Thẻ việc làm tại Trang chủ, Trang danh sách việc làm (`/viec-lam`) và Trang chi tiết việc làm.
- **Triệu chứng UI**: Mức lương hiển thị dưới dạng:
  - `$ 18 - 30 triệu`
  - `$ 12 - 35 triệu`
- **Bằng chứng Screenshot**: [`docs/audit_reports/screenshots/job_seeker_03_seeker_jobs_portal_1789493788074.png`](file:///c:/Users/WIN10/Documents/square-tuyen-dung/docs/audit_reports/screenshots/job_seeker_03_seeker_jobs_portal_1789493788074.png)
- **Nguyên nhân**: Frontend hardcode ký hiệu dollar `$` làm prefix biểu tượng tiền tệ nhưng giá trị số lại được định dạng theo đơn vị tiếng Việt `triệu`. Chuẩn hiển thị đúng của thị trường Việt Nam phải là `18 - 30 triệu VNĐ` hoặc `18 - 30 Tr`.

---

### 🟡 [P2 - MEDIUM] Đề xuất việc làm đã hết hạn trong box "Việc làm tương tự"
- **Vị trí**: Sidebar bên phải của Trang chi tiết việc làm.
- **Triệu chứng UI**: Khi xem một công việc đang tuyển dụng, box "Việc làm tương tự" gợi ý các bài đăng có tag trạng thái màu đỏ `Hết hạn`.
- **Hệ quả UX**: Người dùng bấm vào tin được gợi ý nhưng không thể nộp hồ sơ, gây cảm giác dữ liệu rác, lỗi thời trên sàn tuyển dụng.

---

### 🔵 [P3 - LOW] Giao diện Dashboard Employer xuất hiện chuỗi "NaN / undefined"
- **Vị trí**: `/employer/dashboard`
- **Triệu chứng UI**: Trong một số khối thống kê khi tài khoản mới hoặc chưa phát sinh tương tác trong tháng, chỉ số hiển thị dạng thô `NaN%` hoặc `undefined` thay vì hiển thị `0%` hoặc dấu gạch ngang `-`.
- **Bằng chứng Screenshot**: [`docs/audit_reports/screenshots/employer_UX_Dữ_liệu_hiển_thị_NaN_1789493752288.png`](file:///c:/Users/WIN10/Documents/square-tuyen-dung/docs/audit_reports/screenshots/employer_UX_Dữ_liệu_hiển_thị_NaN_1789493752288.png)

---

## 3. Nhật ký Thử nghiệm Chi tiết theo Tác tử (Agent Telemetry Log)

### Tác tử 1: Nhà tuyển dụng (Employer Persona)
- **Tổng số hành động thực hiện**: 42 bước.
- **Các trang khảo sát**:
  1. `/employer/login`: Nhập email `ceohub.hostmaster@gmail.com`, mật khẩu `Password123!`.
  2. `/employer/dashboard`: Giao diện trực quan, bảng điều khiển KPI tổng thể hoạt động.
  3. `/employer/job-posts/create`: Form tạo tin tuyển dụng đầy đủ các trường nhập liệu (tiêu đề, địa điểm, yêu cầu, mức lương min/max).
  4. `/employer/applied-profiles`: Bảng quản lý ứng viên ứng tuyển hỗ trợ lọc và xem CV.
  5. Deep-dive mở rộng: Khảo sát thành công `/employer/question-bank`, `/employer/question-groups`, `/employer/ai-settings`, `/employer/agent-assistants`, `/employer/settings`, `/employer/pricing`.
- **Hiệu năng & Lỗi**:
  - Không có HTTP error 4xx/5xx nào từ backend dành cho Employer.
  - Thời gian phản hồi trang tạo tin: ~1.2s.

---

### Tác tử 2: Quản trị viên (Admin Persona)
- **Tổng số hành động thực hiện**: 34 bước.
- **Các trang khảo sát**:
  1. `/admin/login`: Nhập email `admin@project.com`, mật khẩu `Password123!`.
  2. `/admin/jobs`: Quản trị danh sách tin tuyển dụng, trạng thái kiểm duyệt hoạt động chính xác.
  3. `/admin/users`: **Gặp lỗi sập 500 (P0 Blocker)** do sai reverse relation trong Django ORM.
  4. Deep-dive mở rộng: Khảo sát thành công `/admin/questions`, `/admin/question-groups`, `/admin/voice-profiles`, `/admin/careers`, `/admin/cities`, `/admin/settings`. Tất cả đều render bảng biểu và form mượt mà.

---

### Tác tử 3: Ứng viên (Job Seeker Persona)
- **Tổng số hành động thực hiện**: 53 bước.
- **Các trang khảo sát**:
  1. `/login`: Đăng nhập ứng viên `candidate@project.com`.
  2. `/viec-lam`: Bộ lọc tìm kiếm theo từ khóa, ngành nghề, địa điểm và mức lương phản hồi nhanh (< 200ms).
  3. `/viec-lam/:slug`: Trang chi tiết tin hiển thị rõ mô tả công việc, quyền lợi, thông tin công ty. Bản đồ vị trí bị lỗi ô xám do tile OSM không resolve được.
  4. Modal Ứng tuyển: Nút ứng tuyển bật modal chuẩn xác, nhưng chưa auto-fill dữ liệu người dùng.
  5. `/practice`: Trang chuẩn bị và phỏng vấn AI WebRTC tương tác với LiveKit.
  6. Deep-dive mở rộng: Khảo sát `/cv-builder`, `/salary`, `/companies`, `/my-jobs`, `/profile`, `/notifications`.
  7. Khảo sát Responsive Mobile (Viewport 390x844): Trang chủ và trang tìm việc co giãn tốt; Trang `/cv-builder` bị vỡ layout và che khuất form.

---

## 4. Kế hoạch Sửa lỗi Đề xuất (Remediation Plan)

### Giai đoạn 1: Sửa lỗi Sập Máy chủ Nghiêm trọng (P0 Blocker)
- [ ] **Sửa Django ORM Prefetch tại `api/apps/accounts/views_users.py:643`**:
  - Đổi `.prefetch_related("companymember_set__role")` thành `.prefetch_related("company_memberships__role")`.
  - Test lại endpoint `/api/v1/auth/users/?page=1&pageSize=10` bằng curl/pytest để đảm bảo trả về `HTTP 200 OK` kèm đầy đủ danh sách users.

### Giai đoạn 2: Sửa lỗi Giao diện & Trải nghiệm Người dùng (P1 & P2 UX)
- [ ] **Khắc phục Bản đồ Leaflet (P1)**:
  - Bổ sung `tileLayer` fallback hoặc cơ chế bắt sự kiện `tileerror` trên Leaflet để render placeholder vị trí đẹp mắt, không để lại ô xám chết.
- [ ] **Tối ưu Responsive cho CV Builder trên Mobile (P1)**:
  - Cấu hình lại thanh header của CV Builder: sử dụng menu dropdown hoặc icon rút gọn cho các nút "Chỉnh sửa", "Xem trước", "Tải xuống" trên màn hình `< 768px`.
  - Chuyển đổi Popover "Chọn mẫu CV chuẩn ATS" thành Drawer vuốt từ dưới lên (Bottom Sheet) hoặc modal có thể thu gọn, tránh che khuất toàn bộ form nhập liệu.
- [ ] **Bổ sung Tự động Điền (Auto-fill) cho Modal Ứng tuyển (P2)**:
  - Khi người dùng đã đăng nhập, hook dữ liệu từ `useAuth()` / profile state vào các ô "Họ và tên", "Email", "Số điện thoại" trong form Apply.
- [ ] **Chuẩn hóa Định dạng Tiền tệ (P2)**:
  - Thay thế biểu tượng `$` bằng định dạng tiếng Việt chuẩn: `18 - 30 triệu VNĐ` (hoặc `Thỏa thuận` nếu không có lương).
- [ ] **Lọc Tin Tuyển Dụng Hết Hạn trong Khối Đề Xuất (P2)**:
  - Thêm điều kiện lọc `status = ACTIVE` và `deadline >= today` trong query lấy "Việc làm tương tự".
- [ ] **Khắc phục Hiển thị NaN / undefined trên Dashboard Employer (P3)**:
  - Bổ sung helper `formatPercent(val) => Number.isFinite(val) ? \`${val}%\` : '0%'`.

### Giai đoạn 3: Tái kiểm thử & Xác nhận (Verification & Regression Run)
- [ ] Chạy lại toàn bộ `scripts/audit_agents/run_multi_agent_audit.py`.
- [ ] Xác nhận:
  - Console errors = 0
  - Network errors = 0
  - Bảng User của Admin hiển thị danh sách người dùng đầy đủ.
  - Chụp ảnh bằng chứng nghiệm thu (Before vs After).

---

## 5. Kết luận & Khuyến nghị

Hệ thống **Square Tuyển Dụng** có nền tảng kiến trúc backend và frontend rất vững chắc, các tính năng độc đáo như Phỏng vấn AI LiveKit WebRTC và CV Builder ATS vận hành ổn định trên desktop. Tuy nhiên, việc tồn tại lỗi P0 sập API Admin User Management và các hạt sạn UI/UX trên mobile và trang chi tiết việc làm làm giảm đáng kể tính chuyên nghiệp của sản phẩm.

Toàn bộ các lỗi trên đều có nguyên nhân gốc rễ rõ ràng và có thể xử lý triệt để trong **3 giai đoạn khắc phục** nêu trên.
