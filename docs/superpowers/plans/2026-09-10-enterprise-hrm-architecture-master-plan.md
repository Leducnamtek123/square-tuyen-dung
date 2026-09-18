# Kế Hoạch Tổng Thể Tái Cấu Trúc Toàn Diện Hệ Thống Quản Trị Nhân Sự (Enterprise HRM Master Architecture Plan)

> **Mục tiêu**: Nâng cấp toàn diện phân hệ Quản lý Nhân sự (HRM) từ mức sơ sài/đơn lẻ lên chuẩn Enterprise Multi-Tenant & Multi-Branch. Hỗ trợ đa trụ sở/chi nhánh, quản lý cụm thiết bị máy chấm công độc lập, xử lý lọc trùng dữ liệu (Deduplication), ca kíp phức tạp (ca gãy, ca đêm), lịch sử biến động nhân sự, ma trận duyệt đơn linh hoạt, cấu trúc lương động và phân quyền dữ liệu theo phạm vi (Row-level RBAC).
> **Trạng thái**: Đang triển khai tuần tự từng giai đoạn
> **Quy trình thực thi**: Thực hiện từng phần chi tiết ➔ Đánh dấu hoàn thành vào file tổng ➔ Kiểm thử /testing-qa ➔ Đánh giá /brainstorming.

---

## Danh Sách Các Hạng Mục Thực Thi Tuần Tự

### [ ] GIAI ĐOẠN 1: Hạ Tầng Đa Chi Nhánh & Quản Trị Danh Mục Thiết Bị Chấm Công (Multi-Location & Biometric Device Fleet)
- [ ] **1.1. Backend Data Modeling (Chi nhánh & Thiết bị)**
  - [ ] Tạo model `WorkLocation` trong `api/apps/hrm/models.py`: Mã chi nhánh, Tên chi nhánh, Địa chỉ, Tọa độ GPS, Bán kính geofence, Múi giờ, Dải IP mạng nội bộ.
  - [ ] Tạo model `BiometricDevice`: Tên thiết bị, Mã thiết bị, Hãng/Giao thức (`ZKTECO_PULL`, `ZKTECO_PUSH`, `HIKVISION`, `CAMERA_AI`), Địa chỉ IP/DDNS, Cổng thiết bị, Cổng dịch vụ, Mật mã kết nối (`comm_key`), Chi nhánh trực thuộc (`work_location` FK), Hướng quẹt (`IN`, `OUT`, `AUTO`), Trạng thái hoạt động (`ONLINE`, `OFFLINE`, `ERROR`), Thống kê lần sync cuối và tổng bản ghi.
  - [ ] Nâng cấp model `Employee`: Thêm khóa ngoại `work_location = models.ForeignKey(WorkLocation, ...)`.
  - [ ] Nâng cấp model `BiometricPunchLog`: Thêm khóa ngoại `device = models.ForeignKey(BiometricDevice, ...)`, `location = models.ForeignKey(WorkLocation, ...)`.
  - [ ] Tạo và chạy migration Django cho các model mới.
- [ ] **1.2. Backend APIs & Serializers**
  - [ ] Tạo serializers cho `WorkLocation` và `BiometricDevice` trong `api/apps/hrm/serializers.py`.
  - [ ] Tạo `WorkLocationViewSet` và `BiometricDeviceViewSet` trong `api/apps/hrm/views.py`.
  - [ ] Bổ sung các custom action cho thiết bị:
    - [ ] `POST /api/native-hrm/biometric-devices/{id}/test-connection/`: Kiểm tra kết nối TCP socket / ping tới thiết bị.
    - [ ] `POST /api/native-hrm/biometric-devices/{id}/sync/`: Kích hoạt đồng bộ kéo log tức thì cho thiết bị đó.
  - [ ] Đăng ký router endpoints trong `api/apps/hrm/urls.py`.
- [ ] **1.3. Frontend Quản lý Chi nhánh & Thiết bị**
  - [ ] Bổ sung API client methods trong `frontend/src/services/hrmService.ts` cho `WorkLocation` và `BiometricDevice`.
  - [ ] Bổ sung React Query hooks trong `frontend/src/views/hrmPages/hooks/useHrmQueries.ts`.
  - [ ] Xây dựng trang mới: `DeviceListPage` (`frontend/src/views/hrmPages/AttendancePages/DeviceListPage/index.tsx`):
    - [ ] Thẻ thống kê tổng quan thiết bị (Tổng số máy, Online, Offline, Cần kiểm tra).
    - [ ] Bộ lọc máy theo Chi nhánh / Trụ sở, Loại thiết bị, Trạng thái.
    - [ ] Bảng danh sách thiết bị với badge trạng thái thời gian thực, nút Kiểm tra kết nối từng máy, nút Kéo log thủ công, nút Sửa/Xóa.
    - [ ] Dialog Thêm/Sửa thiết bị với đầy đủ thông số kết nối (Chi nhánh, Tên máy, IP/DDNS, Port, Comm Key, Giao thức, Hướng quẹt).
    - [ ] Dialog Thêm/Sửa Chi nhánh / Trụ sở (`WorkLocation`).
  - [ ] Đăng ký route Next.js: `/employer/hrm/attendances/devices` và alias `/nha-tuyen-dung/hrm/cham-cong/thiet-bi`.
  - [ ] Cập nhật thanh điều hướng phụ trong `AttendanceWorkspaceLayout` để có menu "Thiết bị chấm công".
  - [ ] Tinh gọn trang `AttendanceSettingsPage`: Dọn sạch cấu hình thiết bị phần cứng, chỉ lưu các quy tắc nghiệp vụ chấm công (giờ đi muộn, làm tròn, duyệt đơn, chốt công).

---

### [ ] GIAI ĐOẠN 2: Bộ Đệm Tiếp Nhận & Lọc Trùng Log Chấm Công (Ingestion & Deduplication Pipeline)
- [ ] **2.1. Backend Deduplication Engine**
  - [ ] Xây dựng cơ chế chống quẹt trùng lặp thông minh (Deduplication Window) trong `api/apps/hrm/services.py`:
    - Nếu cùng 1 nhân viên quẹt thẻ trong khoảng thời gian cửa sổ (mặc định 2 phút) tại cùng một máy hoặc hai máy khác nhau, hệ thống tự động gom lại thành 1 sự kiện quẹt hợp lệ duy nhất, lưu lại lịch sử thô để kiểm toán.
  - [ ] Bổ sung trường `is_duplicate`, `deduplicated_with` trong `BiometricPunchLog`.
- [ ] **2.2. Nâng cấp Thuật toán Ghép Ca Đa Chiều (Shift Matching Engine)**
  - [ ] Hỗ trợ ca làm việc xuyên đêm (`is_overnight`): Gom quẹt thẻ từ đêm hôm trước tới sáng hôm sau về đúng 1 ca làm việc của ngày bắt đầu ca.
  - [ ] Hỗ trợ ca làm việc nhiều đoạn (Ca gãy): Tách biệt rõ đoạn làm việc sáng/chiều/tối thay vì chỉ lấy First-In Last-Out.
  - [ ] Phát hiện và gắn nhãn ngoại lệ thông minh:
    - [ ] `MISSED_IN`: Có quẹt về nhưng không có quẹt vào.
    - [ ] `MISSED_OUT`: Có quẹt vào nhưng không có quẹt về.
    - [ ] `ANOMALY`: Quẹt ngoài khung giờ làm việc đã phân ca.
- [ ] **2.3. Frontend Nâng cấp Nhật ký Quẹt Thẻ**
  - [ ] Cập nhật `BiometricLogsPage`: Hiển thị rõ tên Chi nhánh, tên Máy chấm công quẹt thẻ, Hướng quẹt (Vào/Ra), Trạng thái xử lý (Hợp lệ, Quẹt trùng, Bất thường).
  - [ ] Bộ lọc nâng cao theo Chi nhánh và theo từng Thiết bị.

---

### [ ] GIAI ĐOẠN 3: Lịch Sử Biến Động Nhân Sự & Số Hóa Hồ Sơ (Employee Master Data & Digital Documents)
- [ ] **3.1. Backend Career History & Document Vault**
  - [ ] Tạo model `EmployeeCareerHistory`: Nhân viên, Ngày hiệu lực, Phòng ban cũ/mới, Chức danh cũ/mới, Quản lý cũ/mới, Mức lương cũ/mới, Loại biến động (Bổ nhiệm, Thuyên chuyển, Tăng lương, Miễn nhiệm), Quyết định đính kèm.
  - [ ] Tạo model `EmployeeDocument`: Nhân viên, Loại tài liệu (CCCD, Hợp đồng lao động, Bằng cấp, Chứng chỉ, Giấy khám sức khỏe), Đường dẫn file, Ngày cấp, Ngày hết hạn văn bản, Cờ nhắc nhở sắp hết hạn.
  - [ ] Serializers, ViewSets và API endpoints tương ứng.
- [ ] **3.2. Frontend Hồ sơ Nhân viên Nâng cao**
  - [ ] Nâng cấp màn hình Chi tiết Nhân viên trong `EmployeeListPage`:
    - [ ] Tab "Lịch sử công tác": Dòng thời gian trực quan (Timeline) về mọi sự thay đổi vị trí, phòng ban, thăng chức.
    - [ ] Tab "Hồ sơ tài liệu số": Quản lý tải lên, xem trước, tải về các tài liệu đính kèm kèm cảnh báo giấy tờ sắp hết hạn.

---

### [ ] GIAI ĐOẠN 4: Ma Trận Phê Duyệt Đơn Từ Động & Cơ Chế Ủy Quyền (Flexible Approval Matrix & Delegation)
- [ ] **4.1. Backend Dynamic Approval Matrix**
  - [ ] Tạo model `ApprovalDelegation`: Người ủy quyền, Người nhận ủy quyền, Loại đơn áp dụng, Thời gian bắt đầu, Thời gian kết thúc, Lý do ủy quyền.
  - [ ] Nâng cấp logic phê duyệt đơn trong `AttendanceRequest`: Hỗ trợ phê duyệt 1 cấp, 2 cấp hoặc 3 cấp tùy theo loại đơn và số ngày nghỉ. Cho phép người được ủy quyền duyệt thay hợp lệ.
- [ ] **4.2. Frontend Trung Tâm Phê Duyệt**
  - [ ] Cập nhật `RequestManagementPage`: Hiển thị rõ các cấp phê duyệt, người duyệt thực tế (hoặc người duyệt thay theo ủy quyền).
  - [ ] Thêm Dialog "Ủy quyền phê duyệt" cho cấp quản lý.

---

### [ ] GIAI ĐOẠN 5: Cấu Trúc Lương Động & Tham Số Thuế/Bảo Hiểm (Dynamic Payroll Engine)
- [ ] **5.1. Backend Salary Structure & Legal Parameters**
  - [ ] Tạo model `SalaryComponent`: Tên khoản, Mã khoản, Loại (`EARNING`, `DEDUCTION`, `EMPLOYER_CONTRIBUTION`), Có chịu thuế TNCN, Có đóng bảo hiểm.
  - [ ] Tạo model `PayrollConfig`: Lưu trữ các tham số mức giảm trừ bản thân (11 triệu), mức giảm trừ người phụ thuộc (4.4 triệu), mức trần đóng BHXH, tỷ lệ đóng bảo hiểm để có thể cấu hình động mà không cần sửa code.
  - [ ] Nâng cấp engine tính lương hàng tháng để tự động tổng hợp các thành phần lương từ kết quả chấm công thực tế.
- [ ] **5.2. Frontend Bảng Lương Động**
  - [ ] Nâng cấp `PayrollListPage`: Bảng tính lương hiển thị linh hoạt theo các cột thành phần lương động, hỗ trợ xuất phiếu lương (Payslip) chuẩn định dạng.

---

### [ ] GIAI ĐOẠN 6: Phân Quyền Dữ Liệu Theo Phạm Vi (Row-Level RBAC) & Nhật Ký Kiểm Toán (HRM Audit Log)
- [ ] **6.1. Backend Audit Log & Data Scoping**
  - [ ] Tạo model `HRMAuditLog`: Người thực hiện, Hành động (`CREATE`, `UPDATE`, `DELETE`, `LOCK`, `PAYROLL_PUSH`), Phân hệ, ID bản ghi, Dữ liệu trước khi sửa, Dữ liệu sau khi sửa, Địa chỉ IP mạng, Thời gian.
  - [ ] Cài đặt middleware / permission scoping: Giới hạn truy vấn dữ liệu (Row-level) theo quyền hạn: Cá nhân (`SELF`), Phòng ban (`DEPARTMENT`), Chi nhánh (`LOCATION`), Toàn công ty (`GLOBAL`).
- [ ] **6.2. Frontend Role-based Scoping**
  - [ ] Trải nghiệm giao diện tự động ẩn/hiện dữ liệu và bộ lọc theo phạm vi quyền hạn của người dùng đang đăng nhập.

---

### [ ] GIAI ĐOẠN 7: Kiểm Thử Toàn Diện & Đảm Bảo Chất Lượng (/testing-qa)
- [ ] Viết bộ kiểm thử Unit Tests và Integration Tests cho các models và services mới (`test_work_locations.py`, `test_biometric_devices.py`, `test_deduplication.py`, `test_shift_matching.py`).
- [ ] Chạy `npm run typecheck` xác nhận không có lỗi TypeScript trong frontend.
- [ ] Kiểm thử luồng E2E: Thêm Chi nhánh ➔ Thêm Thiết bị ➔ Mô phỏng bắn log quẹt thẻ từ nhiều máy ➔ Kiểm tra chống quẹt trùng ➔ Khớp ca ➔ Tổng hợp công ➔ Chốt lương.

---

### [ ] GIAI ĐOẠN 8: Đánh Giá Kiến Trúc & Độ Ổn Định Cuối Cùng (/brainstorming)
- [ ] Thực hiện review kiến trúc toàn diện theo tiêu chuẩn Senior/Principal Architect.
- [ ] Đánh giá khả năng chịu tải, tính chịu lỗi khi mất mạng tại chi nhánh, và tính toàn vẹn dữ liệu.
- [ ] Bàn giao walkthrough và tài liệu vận hành hoàn chỉnh cho người dùng.
