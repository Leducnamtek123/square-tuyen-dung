# Implementation Plan: Comprehensive Admin Portal Architecture & Feature Breakdown

## Overview
Kế hoạch hành động chi tiết phân rã toàn bộ hệ thống Quản trị (Admin Portal) thành 5 phân hệ cốt lõi với 14 vertical-sliced tasks độc lập, có tiêu chí nghiệm thu rõ ràng, quy trình kiểm thử tự động, và các mốc kiểm soát chất lượng (Checkpoints).

---

## Architecture Decisions
1. **Universal `AdminDataGrid` Component:** Chuẩn hóa một DataGrid duy nhất cho tất cả các trang quản trị (hỗ trợ server-side pagination, debounced filter, multi-column sort, row selection, bulk actions, CSV/Excel streaming export).
2. **Standardized Status & Action Feedback:** Mọi thao tác nhạy cảm (xóa, khóa tài khoản, từ chối duyệt) bắt buộc qua `AdminConfirmDialog` kèm nhập lý do và lưu vào Audit Trail.
3. **Redis Aggregation Caching for Metrics:** Dashboard và các biểu đồ KPI được cache theo interval 5 phút, có event-driven cache invalidation khi có thay đổi lớn.
4. **Granular RBAC & Signal-driven Audit Trail:** Backend áp dụng Permission Matrix phân cấp rõ ràng (`SUPER_ADMIN`, `MODERATOR`, `HR_ADMIN`, `SUPPORT_AGENT`) cùng hệ thống signals tự động ghi vết JSON Diff trước/sau khi cập nhật dữ liệu.
5. **Decoupled Vertical Slicing:** Mỗi task hoàn thiện trọn vẹn từ API/Schema -> Services -> UI/UX Component, đảm bảo code chạy được ngay và không gây vỡ giao diện/regression.

---

## Task Breakdown

### Phase 1: Core Architecture, Modern Design System & Unified AdminDataGrid (Foundation)

#### Task 1.1: Reusable `AdminDataGrid` Component with Multi-filter & Bulk Actions
- **Description:** Xây dựng component bảng dữ liệu chuẩn hóa tái sử dụng trên 30+ trang quản trị với đầy đủ tính năng tìm kiếm, lọc theo trạng thái, chọn nhiều dòng, thao tác hàng loạt (bulk actions), xuất dữ liệu.
- **Acceptance criteria:**
  - Hỗ trợ server-side pagination & sorting mượt mà.
  - Tích hợp thanh công cụ tìm kiếm debounced (300ms) và bộ lọc dropdown đa tiêu chí.
  - Hỗ trợ checkbox chọn hàng loạt và thanh action bar nổi khi có >= 1 hàng được chọn.
  - Tích hợp sẵn nút Export (CSV/Excel) và hiển thị Empty State/Loading Skeleton đồng bộ.
- **Verification:**
  - Tests pass: `npm test -- frontend/src/components/common/AdminDataGrid`
  - Build succeeds: `npm run typecheck`
  - Manual check: Test render thử trên trang Components Design System.
- **Dependencies:** None
- **Files likely touched:**
  - `frontend/src/components/common/AdminDataGrid/index.tsx`
  - `frontend/src/components/common/AdminDataGrid/TableToolbar.tsx`
  - `frontend/src/components/common/AdminDataGrid/TablePagination.tsx`
  - `frontend/src/components/common/AdminDataGrid/types.ts`
- **Estimated scope:** Medium (4 files)

#### Task 1.2: Admin Layout & Navigation Enhancement (Role-based Navigation & Quick Command Bar)
- **Description:** Nâng cấp Admin Master Layout với thanh Sidebar thu gọn linh hoạt (collapsed mode), Breadcrumbs điều hướng, thanh tìm kiếm nhanh Command Bar (`Ctrl+K`/`Cmd+K`), và badge thông báo real-time.
- **Acceptance criteria:**
  - Sidebar hỗ trợ mở rộng/thu gọn mượt mà, lưu trạng thái vào `localStorage`.
  - Phân quyền hiển thị menu sidebar theo role người dùng đăng nhập.
  - Tích hợp Breadcrumbs tự động bắt route hiện tại.
- **Verification:**
  - Tests pass: `npm test -- frontend/src/layouts/AdminLayout`
  - Build succeeds: `npm run typecheck`
  - Manual check: Chuyển đổi giữa các menu, kiểm tra trạng thái collapsed và hiển thị trên mobile drawer.
- **Dependencies:** None
- **Files likely touched:**
  - `frontend/src/layouts/AdminLayout/index.tsx`
  - `frontend/src/layouts/components/employers/Sidebar/AdminMenu.tsx`
  - `frontend/src/layouts/components/employers/Sidebar/MenuItem.tsx`
  - `frontend/src/layouts/components/employers/Header/index.tsx`
- **Estimated scope:** Medium (4 files)

#### Task 1.3: Unified Admin Alert, Badge & Confirmation Dialog System
- **Description:** Xây dựng hệ thống UI phản hồi thao tác chuẩn hóa: Badge trạng thái màu sắc chuẩn HSL, Dialog xác nhận thao tác nguy hiểm (yêu cầu nhập lý do), và Drawer chi tiết trượt từ phải (Side Drawer).
- **Acceptance criteria:**
  - `AdminStatusBadge` hỗ trợ đầy đủ các trạng thái chuẩn (`active`, `pending`, `rejected`, `verified`, `flagged`).
  - `AdminConfirmDialog` hỗ trợ variant nguy hiểm (Danger) với form nhập lý do bắt buộc trước khi xác nhận.
  - `AdminDetailDrawer` cung cấp khung xem chi tiết đồng bộ cho profile/job/verification mà không cần chuyển trang.
- **Verification:**
  - Tests pass: `npm test -- frontend/src/components/common/AdminConfirmDialog`
  - Build succeeds: `npm run typecheck`
- **Dependencies:** Task 1.1
- **Files likely touched:**
  - `frontend/src/components/common/AdminStatusBadge/index.tsx`
  - `frontend/src/components/common/AdminConfirmDialog/index.tsx`
  - `frontend/src/components/common/AdminDetailDrawer/index.tsx`
- **Estimated scope:** Small (3 files)

---

### 🏁 Checkpoint: Foundation (Phase 1)
- [ ] Tất cả unit tests cho `AdminDataGrid`, `AdminLayout`, `AdminConfirmDialog` pass 100%.
- [ ] `npm run typecheck` không có lỗi.
- [ ] UI component sẵn sàng làm chuẩn cho các trang nghiệp vụ.

---

### Phase 2: Executive Dashboard & Live Analytics (Monitoring & KPIs)

#### Task 2.1: Backend Analytics Aggregation & Redis Caching
- **Description:** Nâng cấp API tổng hợp dữ liệu Dashboard Admin với câu lệnh tối ưu, gom nhóm thống kê tăng trưởng (Jobs, Resumes, Companies, Interviews) và lưu cache Redis 5 phút.
- **Acceptance criteria:**
  - Trả về KPI cards: Tổng số người dùng mới, việc làm mới, đơn ứng tuyển, yêu cầu xác thực chờ duyệt, tỷ lệ phỏng vấn thành công.
  - Trả về chuỗi dữ liệu theo thời gian (7 ngày, 30 ngày, 12 tháng) cho biểu đồ.
  - Response time < 80ms nhờ Redis caching.
- **Verification:**
  - Tests pass: `pytest api/apps/jobs/tests/test_statistics.py`
  - Manual check: Test endpoint `GET /api/v1/jobs/admin-statistics/` trả về đúng format JSON.
- **Dependencies:** None
- **Files likely touched:**
  - `api/apps/jobs/views/web_statistics.py`
  - `api/apps/accounts/views/admin_stats.py`
  - `api/config/urls.py`
- **Estimated scope:** Small (3 files)

#### Task 2.2: Frontend Interactive Executive Dashboard Revamp
- **Description:** Tái cấu trúc trang Dashboard Admin với các chỉ số trực quan (Live Metric Cards có delta so với kỳ trước), biểu đồ tuyển dụng tương tác (Recharts/ApexCharts), và widget cảnh báo hệ thống.
- **Acceptance criteria:**
  - Metric cards hiển thị số liệu nổi bật và % tăng giảm so với tuần trước.
  - Biểu đồ đường & cột trực quan, cho phép lọc nhanh 7 ngày / 30 ngày / tùy chọn ngày.
  - Widget danh sách việc cần làm (Pending tasks: X tin chờ duyệt, Y doanh nghiệp chờ xác thực).
- **Verification:**
  - Tests pass: `npm test -- frontend/src/views/adminPages/DashboardPage`
  - Build succeeds: `npm run typecheck`
  - Manual check: Mở trang `/admin/dashboard`, chuyển đổi filter ngày và kiểm tra tương tác biểu đồ.
- **Dependencies:** Task 2.1, Task 1.1
- **Files likely touched:**
  - `frontend/src/views/adminPages/DashboardPage/index.tsx`
  - `frontend/src/views/adminPages/DashboardPage/components/StatCard.tsx`
  - `frontend/src/views/adminPages/DashboardPage/components/AnalyticsCharts.tsx`
  - `frontend/src/views/adminPages/DashboardPage/components/PendingActionWidget.tsx`
- **Estimated scope:** Medium (4 files)

---

### 🏁 Checkpoint: Dashboard (Phase 2)
- [ ] API trả về số liệu chính xác với cache Redis.
- [ ] Giao diện Dashboard hiển thị mượt mà, responsive, không giật lag.

---

### Phase 3: AI Moderation, KYC Verification & Trust Center (Trust & Moderation)

#### Task 3.1: Backend AI Moderation & Flagging Pipeline
- **Description:** Xây dựng luồng xử lý kiểm duyệt tin tuyển dụng với trạng thái rõ ràng (`PENDING`, `APPROVED`, `REJECTED`, `FLAGGED`) và chấm điểm AI Trust Score.
- **Acceptance criteria:**
  - Tự động gán cờ `FLAGGED` nếu tin tuyển dụng chứa từ khóa cấm hoặc spam.
  - Hỗ trợ API duyệt đơn lẻ hoặc duyệt hàng loạt (Bulk approve/reject) kèm lý do.
  - Gửi email thông báo tự động cho nhà tuyển dụng khi tin bị từ chối hoặc được phê duyệt.
- **Verification:**
  - Tests pass: `pytest api/apps/jobs/tests/test_moderation.py`
  - Manual check: Gọi API POST duyệt tin và kiểm tra trạng thái trong DB.
- **Dependencies:** None
- **Files likely touched:**
  - `api/apps/jobs/models.py`
  - `api/apps/jobs/views/web_job_posts.py`
  - `api/apps/jobs/serializers.py`
  - `api/apps/jobs/services/moderation_service.py`
- **Estimated scope:** Medium (4 files)

#### Task 3.2: Frontend Job Moderation Workspace & Trust Reports Management
- **Description:** Áp dụng `AdminDataGrid` vào trang Quản lý tin tuyển dụng và Báo cáo gian lận (Trust Reports), cho phép xem nhanh nội dung và duyệt/từ chối 1-click.
- **Acceptance criteria:**
  - Danh sách tin tuyển dụng hiển thị badge trạng thái kiểm duyệt và điểm tin cậy AI.
  - Bấm vào hàng mở Side Drawer xem toàn bộ mô tả tin, thông tin công ty và lý do AI gắn cờ.
  - Trang Trust Reports cho phép Admin xử lý tố cáo từ ứng viên, khóa tin vi phạm hoặc bỏ qua cảnh báo.
- **Verification:**
  - Tests pass: `npm test -- frontend/src/views/adminPages/JobsPage`
  - Tests pass: `npm test -- frontend/src/views/adminPages/TrustReportsPage`
  - Build succeeds: `npm run typecheck`
- **Dependencies:** Task 3.1, Task 1.1, Task 1.3
- **Files likely touched:**
  - `frontend/src/views/adminPages/JobsPage/index.tsx`
  - `frontend/src/views/adminPages/JobsPage/components/JobModerationDrawer.tsx`
  - `frontend/src/views/adminPages/TrustReportsPage/index.tsx`
  - `frontend/src/views/adminPages/TrustReportsPage/components/ReportResolutionDialog.tsx`
- **Estimated scope:** Medium (4 files)

#### Task 3.3: Company KYC Verification Management & Document Preview
- **Description:** Hoàn thiện trang Xác thực Doanh nghiệp (Company Verifications), hỗ trợ xem trực tiếp Giấy phép kinh doanh (PDF/Image) và cấp tích xanh "Verified Company".
- **Acceptance criteria:**
  - Xem tài liệu giấy phép kinh doanh dạng lightbox/preview nhúng ngay trên giao diện.
  - Nút cấp tích xanh tự động cập nhật trạng thái `is_verified` của Company và gửi email chúc mừng.
  - Nút từ chối yêu cầu nhập lý do chi tiết để doanh nghiệp tải lại hồ sơ.
- **Verification:**
  - Tests pass: `npm test -- frontend/src/views/adminPages/CompanyVerificationsPage`
  - Build succeeds: `npm run typecheck`
- **Dependencies:** Task 1.1, Task 1.3
- **Files likely touched:**
  - `frontend/src/views/adminPages/CompanyVerificationsPage/index.tsx`
  - `frontend/src/views/adminPages/CompanyVerificationsPage/components/VerificationDrawer.tsx`
  - `api/apps/profiles/views/company_verification_views.py`
  - `api/apps/profiles/serializers_pkg/company_serializers.py`
- **Estimated scope:** Medium (4 files)

---

### 🏁 Checkpoint: Moderation & Trust (Phase 3)
- [ ] Luồng kiểm duyệt tin tuyển dụng và báo cáo sai phạm hoạt động xuyên suốt.
- [ ] Luồng xác minh doanh nghiệp hiển thị tài liệu preview và cấp badge thành công.

---

### Phase 4: Granular RBAC, Security & Audit Trail (Security & Governance)

#### Task 4.1: Backend Granular RBAC Permissions & Signal-driven Audit Logging
- **Description:** Cung cấp ma trận phân quyền nâng cao cho tài khoản quản trị và tự động lưu vết mọi thao tác CRUD vào bảng `AuditLog` kèm snapshot dữ liệu trước/sau (Diff).
- **Acceptance criteria:**
  - Phân chia vai trò rõ ràng: `SUPER_ADMIN`, `MODERATOR`, `HR_ADMIN`, `SUPPORT_AGENT`.
  - Tự động ghi lại Actor, Action (`CREATE`, `UPDATE`, `DELETE`, `STATUS_CHANGE`), Target Model, IP, User Agent, và payload JSON Diff.
- **Verification:**
  - Tests pass: `pytest api/apps/accounts/tests/test_audit_logs.py`
- **Dependencies:** None
- **Files likely touched:**
  - `api/apps/accounts/models.py`
  - `api/apps/accounts/permissions.py`
  - `api/apps/accounts/signals.py`
  - `api/apps/accounts/views/audit_views.py`
- **Estimated scope:** Medium (4 files)

#### Task 4.2: Frontend User Management & Role Assignment Interface
- **Description:** Nâng cấp trang Quản lý Người dùng nội bộ và tài khoản hệ thống, cho phép phân quyền, khóa/mở tài khoản, và thu hồi phiên đăng nhập.
- **Acceptance criteria:**
  - DataGrid lọc người dùng theo Role, Trạng thái hoạt động, Ngày tạo.
  - Dialog gán quyền nhanh theo nhóm quyền có sẵn.
  - Nút khóa tài khoản khẩn cấp (kèm xác nhận bảo mật).
- **Verification:**
  - Tests pass: `npm test -- frontend/src/views/adminPages/UsersPage`
  - Build succeeds: `npm run typecheck`
- **Dependencies:** Task 4.1, Task 1.1
- **Files likely touched:**
  - `frontend/src/views/adminPages/UsersPage/index.tsx`
  - `frontend/src/views/adminPages/UsersPage/components/UserRoleModal.tsx`
  - `frontend/src/views/adminPages/UsersPage/components/UserDetailDrawer.tsx`
- **Estimated scope:** Small (3 files)

#### Task 4.3: Frontend Audit Logs Timeline & JSON Diff Viewer
- **Description:** Xây dựng trang Nhật ký Kiểm toán (Audit Logs) chuyên sâu với giao diện so sánh trước/sau (Visual JSON Diff) và bộ lọc theo nhân sự thao tác.
- **Acceptance criteria:**
  - Bảng Audit Logs lọc theo Thời gian, Nhân sự thực hiện, Loại hành động, và Đối tượng tác động.
  - Modal xem chi tiết Diff hiển thị trực quan phần thêm mới (màu xanh) và phần bị xóa/sửa (màu đỏ).
- **Verification:**
  - Tests pass: `npm test -- frontend/src/views/adminPages/AuditLogsPage`
  - Build succeeds: `npm run typecheck`
- **Dependencies:** Task 4.1, Task 1.1
- **Files likely touched:**
  - `frontend/src/views/adminPages/AuditLogsPage/index.tsx`
  - `frontend/src/views/adminPages/AuditLogsPage/components/AuditDiffModal.tsx`
  - `frontend/src/views/adminPages/AuditLogsPage/components/AuditFilterBar.tsx`
- **Estimated scope:** Small (3 files)

---

### 🏁 Checkpoint: Security & Governance (Phase 4)
- [ ] Phân quyền hoạt động chính xác, chặn truy cập trái phép.
- [ ] Mọi hành động nhạy cảm đều được ghi log chi tiết và có thể tra cứu diff.

---

### Phase 5: HRM & Extended Operations Management (Operations)

#### Task 5.1: HRM Interactive Organization Chart (OrgChart) & Department Management
- **Description:** Xây dựng sơ đồ cây phân cấp phòng ban tương tác (Interactive OrgChart) và trang quản lý cơ cấu phòng ban.
- **Acceptance criteria:**
  - Cây OrgChart hỗ trợ phóng to/thu nhỏ, mở rộng/thu gọn từng nhánh phòng ban, hiển thị Trưởng phòng và số lượng nhân sự.
  - Thao tác thêm/sửa/xóa phòng ban cập nhật tức thì lên sơ đồ cây.
- **Verification:**
  - Tests pass: `npm test -- frontend/src/views/hrmPages/OrgChartPage`
  - Tests pass: `npm test -- frontend/src/views/hrmPages/DepartmentListPage`
  - Build succeeds: `npm run typecheck`
- **Dependencies:** Task 1.1
- **Files likely touched:**
  - `frontend/src/views/hrmPages/OrgChartPage/index.tsx`
  - `frontend/src/views/hrmPages/OrgChartPage/components/OrgNode.tsx`
  - `frontend/src/views/hrmPages/DepartmentListPage/index.tsx`
  - `api/apps/hrm/views/department_views.py`
- **Estimated scope:** Medium (4 files)

#### Task 5.2: Employee Lifecycle, Contracts & Leave Requests Pipeline
- **Description:** Nâng cấp quản trị nhân sự toàn diện: Danh sách nhân viên, Cảnh báo hợp đồng sắp hết hạn, và luồng phê duyệt đơn nghỉ phép.
- **Acceptance criteria:**
  - Bảng Employee quản lý hồ sơ nhân viên đầy đủ, tìm kiếm theo phòng ban/vị trí.
  - Trang Contract cảnh báo các hợp đồng sắp hết hạn trong 30 ngày (badge màu vàng/đỏ).
  - Trang Leaves cho phép Admin/HR duyệt hoặc từ chối đơn xin nghỉ phép 1-click.
- **Verification:**
  - Tests pass: `npm test -- frontend/src/views/hrmPages/EmployeeListPage`
  - Tests pass: `npm test -- frontend/src/views/hrmPages/ContractListPage`
  - Tests pass: `npm test -- frontend/src/views/hrmPages/LeaveListPage`
  - Build succeeds: `npm run typecheck`
- **Dependencies:** Task 1.1, Task 1.3
- **Files likely touched:**
  - `frontend/src/views/hrmPages/EmployeeListPage/index.tsx`
  - `frontend/src/views/hrmPages/ContractListPage/index.tsx`
  - `frontend/src/views/hrmPages/LeaveListPage/index.tsx`
  - `frontend/src/views/hrmPages/OnboardingPage/index.tsx`
- **Estimated scope:** Medium (4 files)

#### Task 5.3: Master Categories, Banners & Content Management
- **Description:** Đồng bộ DataGrid mới cho toàn bộ các danh mục ngành nghề, địa giới hành chính 3 cấp (Tỉnh/Huyện/Xã), quản lý Banner và Bài viết tin tức.
- **Acceptance criteria:**
  - Cho phép bật/tắt nhanh trạng thái hiển thị của Banner và Bài viết.
  - Quản lý danh mục 3 cấp có cascade filter (chọn Tỉnh -> lọc Huyện -> lọc Xã).
  - Xuất dữ liệu danh mục ra Excel nhanh chóng.
- **Verification:**
  - Tests pass: `npm test -- frontend/src/views/adminPages/CareersPage`
  - Tests pass: `npm test -- frontend/src/views/adminPages/BannersPage`
  - Build succeeds: `npm run typecheck`
- **Dependencies:** Task 1.1
- **Files likely touched:**
  - `frontend/src/views/adminPages/CareersPage/index.tsx`
  - `frontend/src/views/adminPages/CitiesPage/index.tsx`
  - `frontend/src/views/adminPages/BannersPage/index.tsx`
  - `frontend/src/views/adminPages/ArticlesPage/index.tsx`
- **Estimated scope:** Medium (4 files)

---

### 🏁 Checkpoint: Full System Integration (Phase 5)
- [ ] Toàn bộ 5 phân hệ hoạt động liền mạch trên Admin Portal.
- [ ] Chạy toàn bộ test suite frontend & backend: 0 fail, 0 type errors.
- [ ] Build production sạch sẽ, không có bundle thừa hoặc memory leak.

---

## Risks and Mitigations
| Rủi ro | Mức độ | Biện pháp giảm thiểu |
|---|---|---|
| Xung đột kiểu dữ liệu khi chuẩn hóa 30+ trang sang `AdminDataGrid` | Vừa | Tạo adapter type cho từng model và có fallback default columns |
| Quá tải cơ sở dữ liệu khi tổng hợp số liệu Dashboard lớn | Cao | Tích hợp Redis Caching 5 phút và tối ưu query bằng Django ORM annotations |
| Ghi Audit Trail làm chậm tốc độ ghi dữ liệu chính | Vừa | Ghi audit log bất đồng bộ hoặc dùng Django signals tối ưu |
