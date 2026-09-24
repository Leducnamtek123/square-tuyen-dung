# 🎯 Tài liệu Thiết Kế Đặc Tả: Ma Trận Kiểm Thử E2E Toàn Diện Với Playwright Cho Hệ Thống InfoHR

- **Dự án**: Square Tuyển Dụng (InfoHR)
- **Ngày thiết lập**: 24/09/2026
- **Tác giả / Vai trò**: Antigravity Quality Engineering & Architecture
- **Mục tiêu**: Xây dựng kiến trúc khung kiểm thử Playwright tự động hóa toàn diện, ma trận test case phân tầng (Dual-Tier: Fast Mocked E2E & Fullstack Live Integration) bao phủ 5 phân hệ lớn: Ứng viên, Nhà tuyển dụng, Voice AI AILA, Quản lý nhân sự HRM và Quản trị Admin.

---

## 1. 🏗️ Kiến Trúc Khung Kiểm Thử (Framework Architecture)

### 1.1. Cấu Trúc Thư Mục Chuẩn Hóa
```text
frontend/tests/
├── e2e/                             # Test Specs phân theo từng Domain nghiệp vụ
│   ├── 01-auth/                     # Đăng ký, đăng nhập, reset password, role guards
│   ├── 02-candidate/                # Tìm việc, nộp CV, CV builder, hồ sơ trực tuyến
│   ├── 03-employer/                 # Dashboard KPI, đăng tin tuyển dụng, ATS Kanban
│   ├── 04-voice-ai/                 # Preflight check thiết bị, phòng phỏng vấn LiveKit AILA
│   ├── 05-hrm/                      # Sơ đồ tổ chức, nhân viên, nghỉ phép, chấm công, tính lương
│   ├── 06-admin/                    # Duyệt tin, xác minh doanh nghiệp, danh mục, audit logs
│   └── 07-cross-portal-live/        # Luồng liên thông sống toàn trình (Live Docker Backend)
│
├── pages/                           # Page Object Models (POM) - Đóng gói selector & hành vi UI
│   ├── base.page.ts                 # Base class: xử lý loader, toast message, dialog, navigation
│   ├── auth/                        # LoginPage, RegisterPage, ForgotPasswordPage
│   ├── candidate/                   # JobSearchPage, JobDetailPage, ApplyModal, CvBuilderPage
│   ├── employer/                    # EmployerDashboardPage, JobPostFormPage, AtsKanbanPage
│   ├── voice-ai/                    # PreflightPage, InterviewRoomPage, PostInterviewPage
│   ├── hrm/                         # HrmDashboardPage, LeavePage, AttendancePage, PayrollPage
│   └── admin/                       # AdminDashboardPage, JobApprovalPage, CompanyVerifyPage
│
├── fixtures/                        # Custom Playwright Fixtures
│   ├── auth.fixture.ts              # Auto-inject cookies session theo từng Role độc lập
│   └── mock.fixture.ts              # Tích hợp sẵn mock handlers theo domain cho từng page
│
└── mocks/                           # Modular hóa file mockApi.ts (thay thế file monolithic 4.1k dòng)
    ├── index.ts                     # Entrypoint đăng ký toàn bộ network route mocks
    ├── mock-auth.ts                 # Handlers: login, logout, refresh-token, profile me
    ├── mock-jobs.ts                 # Handlers: jobs list, job detail, apply CV, taxonomy
    ├── mock-employer.ts             # Handlers: employer stats, ATS candidates, job posts CRUD
    ├── mock-voice-ai.ts             # Handlers: session token, question sets, scorecard result
    ├── mock-hrm.ts                  # Handlers: employees, departments, leaves, payrolls, shifts
    └── mock-admin.ts                # Handlers: pending jobs, company verifications, system configs
```

### 1.2. Chiến Lược Phân Tầng Thực Thi (Dual-Tier Strategy)
1. **Tầng 1 - Fast Mocked E2E (80% Test Cases)**:
   - Dùng Playwright `page.route()` đánh chặn API responses.
   - Kiểm tra giao diện UI, form validations, bộ lọc tìm kiếm, phân quyền đường dẫn (Route Guards), loading states, và trạng thái biên lỗi mạng (400, 403, 500).
   - Tốc độ cực nhanh, chạy song song (4 workers), không phụ thuộc database, là chốt chặn bắt buộc trên mỗi Pull Request.
2. **Tầng 2 - Live Fullstack E2E (20% Critical Lifecycle Flows)**:
   - Chạy với toàn bộ hạ tầng Docker Compose thật (Django Backend, MySQL, Redis, MinIO S3, LiveKit).
   - Kế thừa và mở rộng từ `recruitment-flow-live.spec.ts` để kiểm tra upload file thực tế và stream WebRTC âm thanh/hình ảnh.
   - Chạy định kỳ Nightly hoặc trước khi xuất xưởng bản release.

---

## 2. 📋 Ma Trận Test Case Chi Tiết Từng Phân Hệ

### Phân Hệ 1: Xác Thực & Phân Quyền (Auth & RBAC)

| Mã Case | Mức Độ | Tên Kịch Bản | Tiền Điều Kiện | Các Bước Thực Hiện | Kết Quả Mong Đợi |
| :--- | :---: | :--- | :--- | :--- | :--- |
| `AUTH-01` | **P0** | Đăng ký tài khoản Ứng viên mới | Khách vãng lai, trang `/register` | Điền họ tên, email, mật khẩu hợp lệ $\rightarrow$ Submit | Chuyển hướng tới Onboarding/Trang cá nhân, lưu session |
| `AUTH-02` | **P0** | Đăng nhập tài khoản hợp lệ | Trang `/login` | Nhập email & password chính xác $\rightarrow$ Submit | Gán cookie `access_token`, redirect đúng Dashboard theo vai trò |
| `AUTH-03` | **P0** | Bảo vệ route & Chặn phân quyền trái phép | Đang đăng nhập tài khoản Ứng viên | Cố tình truy cập `/employer/dashboard` hoặc `/admin/dashboard` | Bị chặn bởi Middleware, chuyển hướng về `/forbidden` hoặc `/login` |
| `AUTH-04` | **P1** | Quên & Đặt lại mật khẩu | Trang `/forgot-password` | Nhập email $\rightarrow$ Gửi yêu cầu $\rightarrow$ Mở trang reset với token hợp lệ $\rightarrow$ Đổi mật khẩu | Hiển thị thông báo thành công, đăng nhập được bằng mật khẩu mới |
| `AUTH-05` | **P1** | Đăng xuất an toàn | Đã đăng nhập tài khoản | Bấm menu Avatar $\rightarrow$ Chọn "Đăng xuất" | Xóa sạch cookies xác thực và Redux store, trở về trang chủ |
| `AUTH-06` | **P2** | Tự động Refresh Token (Silent Refresh) | Access token hết hạn | Thao tác trên trang kích hoạt gọi API trả `401 Unauthorized` | Interceptor tự gọi `/auth/refresh/` lấy token mới, thao tác không bị gián đoạn |
| `AUTH-07` | **P2** | Xử lý lỗi đăng nhập thất bại | Trang `/login` | Nhập sai mật khẩu hoặc tài khoản bị khóa | Hiển thị alert/toast thông báo lỗi chi tiết, không crash ứng dụng |

---

### Phân Hệ 2: Ứng Viên (Job Seeker / Candidate)

| Mã Case | Mức Độ | Tên Kịch Bản | Tiền Điều Kiện | Các Bước Thực Hiện | Kết Quả Mong Đợi |
| :--- | :---: | :--- | :--- | :--- | :--- |
| `CAND-01` | **P0** | Tìm kiếm & Lọc việc làm nâng cao | Trang danh sách `/jobs` | Nhập từ khóa, chọn Thành phố, Ngành nghề, Mức lương $\rightarrow$ Tìm kiếm | Danh sách cập nhật đúng kết quả, URL đồng bộ query parameters |
| `CAND-02` | **P0** | Xem chi tiết việc làm & Nộp CV ứng tuyển | Đã đăng nhập tài khoản Ứng viên | Vào `/jobs/[slug]` $\rightarrow$ Bấm "Ứng tuyển ngay" $\rightarrow$ Chọn file CV PDF $\rightarrow$ Viết thư giới thiệu $\rightarrow$ Nộp | Modal đóng, hiển thị badge "Đã ứng tuyển", toast thông báo thành công |
| `CAND-03` | **P0** | Trình tạo CV trực tuyến (CV Builder) | Trang `/cv-builder` | Chọn Template mẫu $\rightarrow$ Nhập thông tin Học vấn, Kinh nghiệm, Kỹ năng $\rightarrow$ Xem Live Preview | Bản xem trước cập nhật thời gian thực, bấm Lưu & Xuất file PDF thành công |
| `CAND-04` | **P1** | Cập nhật Hồ sơ cá nhân (Online Profile) | Trang `/online-profile` | Thay đổi avatar, chức danh, dải lương kỳ vọng, bật toggle "Tìm việc" | Dữ liệu lưu thành công, hiển thị thanh tiến độ hoàn thiện hồ sơ |
| `CAND-05` | **P1** | Quản lý việc làm đã nộp & đã lưu | Đã nộp một số công việc | Vào `/my-jobs` xem danh sách việc đã nộp $\rightarrow$ Kiểm tra trạng thái hồ sơ | Hiển thị chính xác tiến độ: *Chờ xác nhận*, *Phù hợp*, *Phỏng vấn*, *Từ chối* |
| `CAND-06` | **P1** | Luyện tập phỏng vấn AI trên `/practice` | Đã đăng nhập tài khoản | Vào `/practice` $\rightarrow$ Chọn bộ câu hỏi $\rightarrow$ Bấm "Bắt đầu luyện tập" | Điều hướng an toàn sang phòng phỏng vấn trực tuyến `/interview/[id]` |
| `CAND-07` | **P2** | Trạng thái rỗng & Xử lý lỗi máy chủ | Trang danh sách `/jobs` | Tìm kiếm từ khóa không tồn tại $\rightarrow$ Giả lập API trả mã lỗi `500` | Hiển thị minh họa Empty State thân thiện; Giao diện Error Boundary có nút "Thử lại" |
| `CAND-08` | **P2** | Trải nghiệm Responsive Mobile Viewport | Viewport iPhone 14 (390x844) | Mở menu Hamburger, sử dụng bộ lọc Bottom Sheet, bấm CTA Ứng tuyển | Giao diện hiển thị chuẩn xác, nút CTA cố định đáy màn hình không che lấp nội dung |

---

### Phân Hệ 3: Nhà Tuyển Dụng & Tuyển Tuyển Dụng (Employer Portal & ATS)

| Mã Case | Mức Độ | Tên Kịch Bản | Tiền Điều Kiện | Các Bước Thực Hiện | Kết Quả Mong Đợi |
| :--- | :---: | :--- | :--- | :--- | :--- |
| `EMP-01` | **P0** | Tạo & Đăng tin tuyển dụng mới | Đã đăng nhập vai trò Nhà tuyển dụng | Điền form đa bước: Tiêu đề JD, ngành nghề, dải lương, mô tả rich-text, hạn nộp $\rightarrow$ Đăng tin | Tin hiển thị trong danh sách với trạng thái *"Chờ duyệt"* hoặc *"Đang hiển thị"* |
| `EMP-02` | **P0** | Quản lý phễu ứng viên (ATS Kanban & List) | Tin tuyển dụng đã có hồ sơ nộp | Mở trang `/employer/applied-profiles` $\rightarrow$ Đổi giữa dạng Bảng và Kanban $\rightarrow$ Kéo thả card ứng viên | Ứng viên chuyển mượt mà qua các cột: *Chờ xác nhận* $\rightarrow$ *Phù hợp* $\rightarrow$ *Mời phỏng vấn* $\rightarrow$ *Trúng tuyển* |
| `EMP-03` | **P0** | Lên lịch phỏng vấn Voice AI AILA | Ứng viên tại cột "Phù hợp" | Bấm "Tạo lịch phỏng vấn AI" $\rightarrow$ Chọn Bộ câu hỏi $\rightarrow$ Thiết lập deadline $\rightarrow$ Xác nhận | Sinh mã `inviteToken`, gửi thông báo và hiển thị trạng thái đã lên lịch |
| `EMP-04` | **P1** | Bảng điều khiển Dashboard & Báo cáo KPI | Trang `/employer/dashboard` | Tải trang dashboard | Hiển thị chính xác thẻ số liệu: *Tin đang đăng*, *Hồ sơ mới*, *Lượt phỏng vấn AI*, *Điểm AI trung bình* |
| `EMP-05` | **P1** | Quản lý Ngân hàng câu hỏi & Kịch bản phỏng vấn | Trang `/employer/question-bank` | Thêm câu hỏi phỏng vấn mới (tiêu đề, độ khó, thời lượng) $\rightarrow$ Gom vào Nhóm câu hỏi (Question Group) | Dữ liệu kịch bản lưu thành công, sẵn sàng gán cho tin tuyển dụng |
| `EMP-06` | **P1** | Đánh giá Bảng điểm phân tích AI (Scorecard) | Ứng viên đã hoàn thành phỏng vấn | Bấm xem chi tiết hồ sơ phỏng vấn | Hiển thị điểm Overall Score, điểm Kỹ thuật/Giao tiếp, Audio Player nghe lại ghi âm, và Transcript chi tiết |
| `EMP-07` | **P1** | Đóng / Mở lại tin tuyển dụng | Tin đang ở trạng thái hiển thị | Bấm nút "Đóng tin" $\rightarrow$ Xác nhận | Trạng thái tin chuyển sang *"Đã đóng/Hết hạn"*, không còn tìm thấy ở cổng ứng viên |
| `EMP-08` | **P1** | Hồ sơ doanh nghiệp & Gửi duyệt tích xanh | Trang `/employer/company` | Cập nhật thông tin công ty, logo, upload file Giấy phép kinh doanh (GPKD) $\rightarrow$ Gửi duyệt | Hiển thị trạng thái "Đang chờ Admin phê duyệt xác thực" |
| `EMP-09` | **P2** | Bộ lọc ứng viên nâng cao theo Điểm AI | Danh sách ATS có nhiều hồ sơ | Lọc ứng viên có điểm AI $\ge 80$, lọc theo kỹ năng, kiểm tra chuyển trang | Bảng danh sách lọc chính xác, phân trang hoạt động ổn định |
| `EMP-10` | **P2** | Xử lý vượt hạn mức gói tuyển dụng (Quota Limit) | Tài khoản hết số lượt đăng tin | Bấm tạo tin tuyển dụng mới | Hiển thị Modal thông báo nâng cấp gói dịch vụ (`/employer/pricing`), không văng lỗi hệ thống |

---

### Phân Hệ 4: Voice AI AILA & Phòng Phỏng Vấn Trực Tuyến (LiveKit WebRTC)

| Mã Case | Mức Độ | Tên Kịch Bản | Tiền Điều Kiện | Các Bước Thực Hiện | Kết Quả Mong Đợi |
| :--- | :---: | :--- | :--- | :--- | :--- |
| `VOICE-01` | **P0** | Kiểm tra tiền trạm thiết bị (Pre-flight Checks) | Vào trang `/interview/[inviteToken]` với cờ fake media stream | Trình duyệt cấp quyền micro & camera $\rightarrow$ Thanh Audio Level Meter dao động | Nút "Vào phòng phỏng vấn" kích hoạt, sẵn sàng kết nối |
| `VOICE-02` | **P0** | Kết nối phòng LiveKit & Khởi tạo phiên | Hoàn tất Pre-flight, bấm "Vào phòng" | Kết nối WebSocket tới LiveKit Server $\rightarrow$ Nhận room token | Trạng thái phòng chuyển sang `connected`, thẻ Question Card HUD hiển thị câu hỏi số 1 |
| `VOICE-03` | **P0** | Vòng lặp tương tác câu hỏi & Bộ đếm giờ | Đang trong phòng phỏng vấn | Theo dõi đồng hồ đếm ngược $\rightarrow$ Bấm "Chuyển câu tiếp theo" hoặc "Đã trả lời xong" | Question Card cập nhật sang câu hỏi kế tiếp, reset đồng hồ đếm giờ |
| `VOICE-04` | **P0** | Kết thúc phỏng vấn & Màn hình tổng hợp | Đã trả lời hết câu hỏi hoặc bấm Kết thúc | Bấm nút "Hoàn thành phỏng vấn" $\rightarrow$ Ngắt kết nối WebRTC track | Chuyển hướng tới màn hình xử lý sau phỏng vấn (*"AILA đang phân tích câu trả lời..."*), không rò rỉ audio stream |
| `VOICE-05` | **P1** | Điều khiển Micro & Camera trong phòng | Đang trong phòng phỏng vấn | Bấm nút Mute/Unmute Micro $\rightarrow$ Bấm nút Tắt/Bật Webcam | Track media đóng/mở chuẩn xác, icon trạng thái phản hồi tức thời |
| `VOICE-06` | **P1** | Chỉ báo sóng âm nói (Audio Waveform Indicator) | Khi AI hoặc Ứng viên phát biểu | Giả lập luồng âm thanh đầu vào | Avatar AILA hoặc thanh sóng âm hiển thị hiệu ứng xung động (waveform pulse) tương ứng |
| `VOICE-07` | **P1** | Khóa truy cập phòng phỏng vấn đã hoàn thành | Lượt phỏng vấn đã kết thúc | Cố tình truy cập lại vào URL `/interview/[inviteToken]` cũ | Hiển thị màn hình thông báo *"Phiên phỏng vấn này đã hoàn thành"*, ngăn chặn thi lại |
| `VOICE-08` | **P2** | Xử lý từ chối quyền thiết bị (Permission Denied) | Trình duyệt chặn quyền Microphone | Vào trang phỏng vấn | Hiển thị hướng dẫn mở quyền trong cài đặt trình duyệt, chặn nút vào phòng |
| `VOICE-09` | **P2** | Mất kết nối mạng & Khôi phục tự động | Đang trong phiên phỏng vấn | Ngắt mạng tạm thời (LiveKit state: `reconnecting`) $\rightarrow$ Khôi phục mạng | Banner cảnh báo kết nối lại xuất hiện, tự động hồi phục vào phòng mà không mất câu hỏi hiện tại |
| `VOICE-10` | **P2** | Giao diện phỏng vấn trên Mobile Web | Viewport di động (iPhone 14) | Vào phòng phỏng vấn trên điện thoại | Video webcam thu nhỏ góc màn hình, nút bấm to bản thao tác dễ dàng bằng một tay |

---

### Phân Hệ 5: Quản Lý Nhân Sự (HRM Subsystem)

| Mã Case | Mức Độ | Tên Kịch Bản | Tiền Điều Kiện | Các Bước Thực Hiện | Kết Quả Mong Đợi |
| :--- | :---: | :--- | :--- | :--- | :--- |
| `HRM-01` | **P0** | Thêm mới & Quản lý nhân viên (Employee CRUD) | Đã đăng nhập vai trò HR Manager | Vào `/employer/hrm/employees` $\rightarrow$ Bấm "Thêm nhân viên" $\rightarrow$ Điền mã NV, họ tên, email, phòng ban, lương | Nhân viên mới hiển thị trên danh sách, tìm kiếm và sửa thông tin thành công |
| `HRM-02` | **P0** | Quy trình tạo đơn & Phê duyệt nghỉ phép | Nhân viên đã có hạn mức phép năm | Tạo đơn xin nghỉ phép 2 ngày $\rightarrow$ Quản lý mở danh sách đơn $\rightarrow$ Bấm Phê duyệt (`APPROVED`) | Quỹ phép của nhân viên tự động giảm trừ 2 ngày, trạng thái đơn chuyển sang "Đã duyệt" |
| `HRM-03` | **P0** | Bảng tính lương tự động Gross-to-Net | Đến kỳ tính lương tháng | Vào `/employer/hrm/payroll` $\rightarrow$ Xem bảng lương | Các khoản trích đóng BHXH (8%), BHYT (1.5%), BHTN (1%), Thuế TNCN và Lương thực nhận tính toán chính xác; Phê duyệt chuyển `DRAFT` $\rightarrow$ `APPROVED` |
| `HRM-04` | **P1** | Sơ đồ cơ cấu tổ chức & Phòng ban | Trang `/employer/hrm/departments` | Tạo mới phòng ban, gán trưởng bộ phận, mở xem Sơ đồ tổ chức (Org Chart) | Sơ đồ cây hiển thị đúng phân cấp quản lý trực tiếp |
| `HRM-05` | **P1** | Quản lý Ca làm việc & Giải trình chấm công | Trang `/employer/hrm/attendances` | Nhân viên nộp giải trình quên chấm công (`CHECKIN_MISSING`) $\rightarrow$ Quản lý duyệt | Bản ghi chấm công ngày đó được cập nhật lại trạng thái hợp lệ |
| `HRM-06` | **P2** | Phân quyền bảo mật dữ liệu lương nhân sự | Đăng nhập tài khoản Nhân viên thường | Truy cập phân hệ bảng lương | Nhân viên chỉ xem được phiếu lương cá nhân của chính mình, bị chặn xem dữ liệu của đồng nghiệp |

---

### Phân Hệ 6: Quản Trị Hệ Thống (Admin Portal)

| Mã Case | Mức Độ | Tên Kịch Bản | Tiền Điều Kiện | Các Bước Thực Hiện | Kết Quả Mong Đợi |
| :--- | :---: | :--- | :--- | :--- | :--- |
| `ADM-01` | **P0** | Kiểm duyệt tin tuyển dụng (Job Moderation) | Có tin ở trạng thái `PENDING_APPROVAL` | Vào `/admin/jobs` $\rightarrow$ Xem nội dung chi tiết $\rightarrow$ Bấm "Phê duyệt" (hoặc "Từ chối" có lý do) | Tin chuyển trạng thái `APPROVED`, xuất hiện công khai trên trang chủ việc làm |
| `ADM-02` | **P0** | Xác minh doanh nghiệp & Cấp tích xanh | Có công ty gửi yêu cầu xác thực | Vào `/admin/company-verifications` $\rightarrow$ Tải xem file GPKD $\rightarrow$ Bấm "Xác minh" | Công ty nhận tích xanh uy tín (Verified Badge), kích hoạt quyền đăng tin không giới hạn |
| `ADM-03` | **P0** | Quản trị người dùng & Khóa tài khoản | Trang `/admin/users` | Tìm kiếm người dùng vi phạm $\rightarrow$ Bấm Khóa tài khoản (Deactivate) | Người dùng bị khóa không thể đăng nhập vào bất kỳ phân hệ nào của hệ thống |
| `ADM-04` | **P1** | Quản lý Danh mục Ngành nghề & Địa điểm | Trang `/admin/careers` & `/admin/cities` | Thêm ngành nghề mới, cập nhật tên quận/huyện | Danh mục mới lập tức hiển thị trên bộ lọc tìm kiếm việc làm của Ứng viên |
| `ADM-05` | **P1** | Nhật ký kiểm toán hệ thống (Audit Logs) | Admin thực hiện thay đổi dữ liệu | Vào `/admin/audit-logs` | Ghi nhận chi tiết: Hành vi, Thời gian, Tên Admin thực hiện và địa chỉ IP |
| `ADM-06` | **P2** | Bảo vệ tuyệt đối cổng Quản trị viên | Tài khoản không có cờ `is_staff` / `is_superuser` | Cố tình truy cập bất kỳ trang nào thuộc `/admin/*` | Bị từ chối truy cập và chuyển hướng về trang đăng nhập Admin |

---

### Phân Hệ 7: Luồng Liên Thông Toàn Trình (Cross-Portal Lifecycle Live Flow)

| Mã Case | Mức Độ | Tên Kịch Bản | Tiền Điều Kiện | Các Bước Thực Hiện | Kết Quả Mong Đợi |
| :--- | :---: | :--- | :--- | :--- | :--- |
| `LIVE-01` | **P0** | Chu trình tuyển dụng khép kín từ Đăng tuyển đến Onboarding HRM | Hạ tầng Docker Compose đang chạy (Backend, DB, S3, LiveKit) | 1. NTD đăng tin tuyển dụng mới.<br>2. Admin phê duyệt tin.<br>3. Ứng viên tìm tin và nộp file CV PDF.<br>4. NTD chọn ứng viên và gửi lịch phỏng vấn AI.<br>5. Ứng viên vào phòng LiveKit phỏng vấn thành công.<br>6. NTD xem bảng điểm AI và bấm "Trúng tuyển".<br>7. NTD bấm "Chuyển sang HRM" để tạo hồ sơ nhân viên mới. | Hồ sơ luân chuyển xuyên suốt 5 phân hệ không đứt gãy, dữ liệu đồng bộ chính xác từ đầu tới cuối trên DB thực tế |

---

## 3. ⚙️ Quy Hoạch Triển Khai (Implementation Roadmap)

1. **Giai đoạn 1: Chuẩn hóa Hạ tầng & Modular hóa Fixtures**
   - Tách file monolithic `helpers/mockApi.ts` thành các module độc lập trong `tests/mocks/`.
   - Xây dựng tầng Page Object Model cơ bản (`BasePage`, `LoginPage`, `JobSearchPage`, `AtsKanbanPage`, `VoiceAiRoomPage`).
   - Cấu hình custom fixtures inject session tự động cho từng Role.
2. **Giai đoạn 2: Triển khai Bộ Test P0 cho từng Phân hệ**
   - Triển khai kịch bản P0 cho Auth & Ứng viên (`01-auth/`, `02-candidate/`).
   - Triển khai kịch bản P0 cho Nhà tuyển dụng & Voice AI (`03-employer/`, `04-voice-ai/`).
   - Triển khai kịch bản P0 cho HRM & Admin (`05-hrm/`, `06-admin/`).
3. **Giai đoạn 3: Bổ sung Kịch bản P1, P2 (Edge cases & Mobile Viewport)**
   - Bổ sung kiểm thử đa thiết bị (Mobile web cho Ứng viên & Voice AI).
   - Thêm các kịch bản lỗi mạng, ngắt kết nối LiveKit tự động phục hồi.
4. **Giai đoạn 4: Tích hợp Kịch bản Live Toàn trình & Tối ưu CI/CD**
   - Hoàn thiện `07-cross-portal-live/recruitment-lifecycle.spec.ts`.
   - Cấu hình GitHub Actions workflow chia luồng: PR Fast Gate (Mocked) và Nightly Release Gate (Live Docker).
