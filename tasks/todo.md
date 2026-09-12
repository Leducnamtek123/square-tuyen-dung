# Danh Sách Nhiệm Vụ Khắc Phục Lỗi HRM (HRM Remediation TODO)

## Giai đoạn 1: Nghiệp vụ Tính Lương & Toàn vẹn Tài chính (Financial Core)
- [x] **Task 1.1**: Sửa lỗi trừ lương 2 lần trong `payroll_engine.py` và `push_to_payroll`
- [x] **Task 1.2**: Sửa lỗi vắng mặt cả tháng vẫn hưởng 100% lương & đếm số ngày nghỉ không lương (`Sum('total_days')`)
- [x] **Task 1.3**: Bổ sung `dependents_count` vào `Employee` model, serializer và engine tính thuế TNCN
- [x] **Task 1.4**: Thêm cơ chế bảo vệ bảng lương đã duyệt (`APPROVED`) hoặc đã chi trả (`PAID`)

## Checkpoint 1: Xác minh tính đúng đắn của Bảng lương
- [x] Chạy `python -m pytest api/apps/hrm/tests.py -k test_payroll` kiểm tra các ca tính lương

---

## Giai đoạn 2: Chấm công, Ghép ca & Bảng công (Time & Attendance)
- [x] **Task 2.1**: Sửa thuật toán ghép ca trong `services.py` cho ca đêm (`is_overnight`) và phát hiện ngoại lệ `MISSED_IN` / `MISSED_OUT`
- [x] **Task 2.2**: Phân biệt nghỉ phép có lương (`paid_leave_days`) và không lương (`unpaid_leave_days`) trong `MonthlyAttendanceSummaryViewSet.recalculate()`
- [x] **Task 2.3**: Sửa lỗi lọc ngày vắt qua ranh giới tháng trong `AttendanceRecordViewSet.timesheet()`

## Checkpoint 2: Xác minh Chấm công & Ghép ca
- [x] Chạy `python -m pytest api/apps/hrm/tests.py -k "test_deduplication or test_overnight or test_shift"`

---

## Giai đoạn 3: Hợp đồng, Quỹ phép & Đồng bộ Hợp đồng API (Contracts & Data Integrity)
- [x] **Task 3.1**: Đồng bộ enum `CAREER_EVENT_CONFIG` và `DOCUMENT_TYPE_CONFIG` giữa frontend và backend
- [x] **Task 3.2**: Bổ sung trường `leave_type` vào modal Tạo đơn nghỉ phép trên `LeaveListPage`
- [x] **Task 3.3**: Thêm khóa `select_for_update` và kiểm tra `remaining_days >= total_days` để chống âm quỹ phép
- [x] **Task 3.4**: Bổ sung `perform_update` trong `EmployeeViewSet` tự động cập nhật `full_name`
- [x] **Task 3.5**: Tự động chuyển hợp đồng cũ sang `EXPIRED` khi tạo hợp đồng mới có trạng thái `ACTIVE`
- [x] **Task 3.6**: Trừ quỹ phép khi duyệt đơn nghỉ phép từ phân hệ `AttendanceRequest`

## Checkpoint 3: Xác minh Form & Ràng buộc toàn vẹn
- [x] Chạy `python -m pytest api/apps/hrm/tests.py -k "test_career or test_contract or test_leave"`

---

## Giai đoạn 4: Hoàn thiện Trải nghiệm UI/UX & Tiện ích Vận hành (UI/UX Polish)
- [x] **Task 4.1**: Tích hợp nút Xuất bảng lương ra Excel/CSV trên `PayrollListPage`
- [x] **Task 4.2**: Bổ sung CSS `@media print` cho phiếu lương in chuẩn A4
- [x] **Task 4.3**: Tối ưu bộ lọc trang Onboarding (`OnboardingPage`), chỉ hiển thị nhân sự mới tiếp nhận
- [x] **Task 4.4**: Bổ sung thông tin bảng công cá nhân vào cổng tự phục vụ nhân viên (`/me/`)

---

## Giai đoạn 5: Nâng Cấp Bố Cục, UI/UX & Luồng Vận Hành Chuẩn Odoo & Frappe HR
- [x] **Task 5.1**: `HrmDashboardPage`: Widget "Vắng mặt hôm nay (Who's Away Today)", Quick Actions nâng cao, bố cục Bento 3 cột
- [x] **Task 5.2**: `EmployeeListPage`: Bổ sung `dependents_count` vào Dialog Form & Drawer, phím tắt mở trực tiếp Lịch sử công tác & Tài liệu số
- [x] **Task 5.3**: `DetailedTimesheetPage`: Bổ sung thanh Legend chú thích mã chấm công đầy đủ, tinh chỉnh `zIndex` cố định headers tránh che khuất chữ
- [x] **Task 5.4**: `SummaryTimesheetPage`: Modal điều hướng tự động sang Bảng Lương (`/employer/hrm/payroll`) sau khi chốt công
- [x] **Task 5.5**: `LeaveListPage` & `RequestManagementPage`: Banner liên thông hai chiều giữa Đơn Nghỉ Phép & Cổng Quản Lý Đơn Từ Tập Trung
- [x] **Task 5.6**: `OrgChartPage`: Cây sơ đồ tổ chức hiển thị danh sách nhân sự trực thuộc từng phòng ban với khả năng thu gọn/mở rộng linh hoạt

## Checkpoint Toàn Diện: Nghiệm Thu Hoàn Tất
- [x] Toàn bộ test suite backend pass (32/32): `python -m pytest api/apps/hrm/tests.py`
- [x] Frontend typecheck pass hoàn toàn: `npm run typecheck`
