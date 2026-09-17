# Kế Hoạch Triển Khai: Khắc Phục Lỗi Tiềm Ẩn & Chuẩn Hóa Hệ Thống HRM (Enterprise HRM Remediation Plan)

## Tổng Quan (Overview)
Kế hoạch hành động toàn diện nhằm xử lý triệt để 16 lỗi tiềm ẩn (5 Critical, 6 High, 5 Medium) đã được phát hiện trong quá trình kiểm duyệt mã nguồn, nghiệp vụ và UI/UX của phân hệ Square Native HRM (`api/apps/hrm` & `frontend/src/views/hrmPages`). Kế hoạch được chia thành 4 giai đoạn cắt dọc (vertical slices), đảm bảo kiểm thử và xác minh sau từng giai đoạn.

---

## Kiến Trúc & Quyết Định Kỹ Thuật (Architecture Decisions)
1. **Toàn vẹn Tài chính & Bảng lương (Payroll Integrity)**:
   - Thống nhất định nghĩa công: `actual_days` đại diện cho số ngày công thực tế đã làm việc (gồm cả ngày công và ngày nghỉ hưởng lương). `payroll_engine.py` không được trừ trùng `unpaid_leave_days` nếu `actual_days` đã là công thực.
   - Thêm trường `dependents_count` vào `Employee` để tính đúng giảm trừ gia cảnh thuế TNCN theo Luật Thuế Việt Nam (4.4tr/người phụ thuộc).
   - Bảo vệ trạng thái bảng lương: Không cho phép `update_or_create` ghi đè bảng lương đã ở trạng thái `APPROVED` hoặc `PAID`.
2. **Khử Bất Nhất Giữa Frontend & Backend (Contract Synchronization)**:
   - Đồng bộ 100% Enum choices giữa TypeScript và Django models cho `EmployeeCareerHistory` (`ONBOARDING`, `PROMOTION`, `TRANSFER`, `SALARY_ADJUSTMENT`, `ROLE_CHANGE`, `DEMOTION`, `RESIGNATION`) và `EmployeeDocument` (`IDENTITY_CARD`, `LABOR_CONTRACT`, `DEGREE_CERTIFICATE`, `HEALTH_CERTIFICATE`, `TAX_DOCUMENT`, `DECISION`, `OTHER`).
   - Bổ sung trường `leave_type` vào Form xin nghỉ phép trên giao diện `LeaveListPage`.
3. **Độ Chính Xác Chấm Công & Quản Lý Ca (Attendance & Shifts)**:
   - Sửa thuật toán phân loại quẹt thẻ ca đêm (`is_overnight`) trong `services.py`, so sánh thời gian quẹt với khung giờ ca thay vì mốc cố định 12:00.
   - Sửa query date range trong `AttendanceRecordViewSet.timesheet()` để bao quát các đơn xin nghỉ phép vắt qua ranh giới tháng.
   - Hợp nhất việc trừ quỹ phép `EmployeeLeaveBalance` khi duyệt đơn nghỉ phép qua `AttendanceRequest`.
4. **Trải Nghiệm UI/UX Thực Tế (UX Usability)**:
   - Viết CSS `@media print` cho phiếu lương A4 (ẩn thanh điều hướng, nút bấm, nền web khi in).
   - Bổ sung nút bấm xuất file bảng lương Excel/CSV.
   - Tinh chỉnh trang Onboarding chỉ hiển thị nhân sự mới gia nhập (trong 60 ngày hoặc đang thử việc).

---

## Danh Sách Tác Vụ (Task List)

### GIAI ĐOẠN 1: Nghiệp Vụ Tính Lương & Toàn Vẹn Tài Chính (Financial Core)
- [x] **Task 1.1**: Sửa lỗi trừ lương 2 lần trong `payroll_engine.py` và `push_to_payroll`.
- [x] **Task 1.2**: Khắc phục lỗ hổng vắng mặt cả tháng vẫn hưởng 100% lương & sửa hàm tính ngày nghỉ không lương (`Sum('total_days')` thay vì `.count()`).
- [x] **Task 1.3**: Bổ sung trường `dependents_count` vào model `Employee`, serializer, giao diện và engine tính thuế TNCN.
- [x] **Task 1.4**: Thêm cơ chế bảo vệ bảng lương đã duyệt (`APPROVED`) hoặc đã chi trả (`PAID`) trước các lệnh tính toán lại.

#### Checkpoint Giai đoạn 1
- Chạy `python -m pytest api/apps/hrm/tests.py` xác nhận toàn bộ test tính lương Gross-Net và khấu trừ bảo hiểm vượt qua với độ chính xác tuyệt đối.

---

### GIAI ĐOẠN 2: Chấm Công, Ghép Ca & Thuật Toán Bảng Công (Time & Attendance)
- [x] **Task 2.1**: Sửa thuật toán ghép ca trong `services.py` (`process_punch_logs_for_date`) cho ca đêm (`is_overnight`) và phát hiện ngoại lệ `MISSED_IN` / `MISSED_OUT`.
- [x] **Task 2.2**: Phân biệt rạch ròi giữa nghỉ phép có lương (`paid_leave_days`) và nghỉ không lương (`unpaid_leave_days`) trong `MonthlyAttendanceSummaryViewSet.recalculate()`.
- [x] **Task 2.3**: Sửa lỗi query ngày nghỉ phép vắt qua ranh giới tháng trong `AttendanceRecordViewSet.timesheet()`.

#### Checkpoint Giai đoạn 2
- Test case ca đêm (22:00 - 06:00), nhân sự xin nghỉ phép từ ngày 28 tháng này sang ngày 5 tháng sau hiển thị đúng trên Timesheet.

---

### GIAI ĐOẠN 3: Hợp Đồng, Quỹ Phép & Đồng Bộ Hợp Đồng API (Contracts & Data Integrity)
- [x] **Task 3.1**: Đồng bộ 100% enum `CAREER_EVENT_CONFIG` và `DOCUMENT_TYPE_CONFIG` giữa frontend và backend, triệt tiêu lỗi HTTP 400 Bad Request khi lưu hồ sơ.
- [x] **Task 3.2**: Thêm trường chọn `leave_type` vào modal Tạo đơn nghỉ phép trên `LeaveListPage/index.tsx`.
- [x] **Task 3.3**: Thêm khóa `select_for_update` và kiểm tra `remaining_days >= total_days` khi nộp đơn nghỉ phép để ngăn chặn âm quỹ phép.
- [x] **Task 3.4**: Bổ sung `perform_update` trong `EmployeeViewSet` tự động đồng bộ `full_name` khi thay đổi `first_name` hoặc `last_name`.
- [x] **Task 3.5**: Tự động chuyển hợp đồng cũ sang `EXPIRED` khi tạo hợp đồng mới có trạng thái `ACTIVE`.
- [x] **Task 3.6**: Trừ quỹ phép khi duyệt đơn nghỉ phép từ phân hệ `AttendanceRequest` (2-stage approval).

#### Checkpoint Giai đoạn 3
- Tạo mới và cập nhật biến động nhân sự, tài liệu số thành công mà không có lỗi HTTP 400. Nộp đơn nghỉ phép trừ quỹ phép chuẩn xác.

---

### GIAI ĐOẠN 4: Hoàn Thiện Trải Nghiệm UI/UX & Tiện Ích Vận Hành (UI/UX Polish)
- [x] **Task 4.1**: Tích hợp nút Xuất bảng lương ra Excel/CSV trên giao diện `PayrollListPage`.
- [x] **Task 4.2**: Bổ sung CSS `@media print` cho phiếu lương Payslip in chuẩn trang A4 chuyên nghiệp.
- [x] **Task 4.3**: Tối ưu bộ lọc trang Onboarding (`OnboardingPage`), chỉ hiển thị nhân sự mới tiếp nhận trong vòng 60 ngày hoặc đang thử việc.
- [x] **Task 4.4**: Bổ sung thông tin bảng công cá nhân vào cổng tự phục vụ nhân viên (`/me/`).

#### Checkpoint Hoàn Thành Toàn Diện
- Toàn bộ backend unit tests pass: `python -m pytest api/apps/hrm/tests.py`.
- Frontend compile sạch: `npm run build` hoặc `npm run typecheck` không có lỗi.
- Luồng kiểm thử E2E: Tuyển dụng ➔ Onboard ➔ Phân ca ➔ Chấm công ➔ Nghỉ phép ➔ Tổng hợp công ➔ Tính lương ➔ In phiếu lương / Xuất file hoạt động trơn tru.
