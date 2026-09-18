# Kế Hoạch Triển Khai Phân Hệ Chấm Công (Time & Attendance)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Xây dựng phân hệ Chấm công trực thuộc Quản lý nhân sự (HRM) theo chuẩn MISA AMIS với Workspace Top Sub-Navbar, quản lý ca làm việc, phân ca, log máy chấm công, bảng chấm công chi tiết 1–31, bảng tổng hợp tháng kèm tính năng Khóa công và Chuyển tính lương, cùng trung tâm Quản lý đơn từ 2 cấp duyệt.

**Architecture:** 
- Backend Django REST Framework mở rộng `api/apps/hrm`: các models `WorkShift`, `ShiftAssignment`, `BiometricPunchLog`, `AttendanceRequest`, `MonthlyAttendanceSummary`, liên kết trực tiếp với `AttendanceRecord` và `MonthlyPayrollRecord`.
- Frontend Next.js / Material-UI: Cung cấp `AttendanceWorkspaceLayout` (Top Sub-Navbar gồm 6 menu chính/phụ) bao bọc toàn bộ các trang con trong `/employer/hrm/attendances/*`.

**Tech Stack:** Django 4.2, Python 3.10/3.12, Celery, Redis, Next.js 14, React 18, Material-UI 5, TypeScript.

**Spec:** `docs/superpowers/specs/2026-09-10-time-attendance-design.md`

## Global Constraints
- Bố cục điều hướng phải tuân theo mô hình Workspace Top Sub-Navbar đặt dưới Quản lý nhân sự (HRM).
- Không phá vỡ các model nhân sự hiện có (`Employee`, `Department`, `MonthlyPayrollRecord`, `LeaveType`).
- Quy trình duyệt đơn từ bắt buộc tuân theo cơ chế 2 cấp (Quản lý trực tiếp ➔ HR/Admin).
- Tích hợp chuẩn xác hành động "Chuyển tính lương" để cập nhật dữ liệu ngày công vào `MonthlyPayrollRecord`.

---

### Task 1: Backend Data Models & Migrations (`apps/hrm/models.py`)

**Files:**
- Modify: `api/apps/hrm/models.py`
- Modify: `api/apps/hrm/tests.py`

**Interfaces:**
- Produces: `WorkShift`, `ShiftAssignment`, `BiometricPunchLog`, `AttendanceRequest`, `MonthlyAttendanceSummary` models.

- [ ] **Step 1: Write test for new HRM models**
Trong `api/apps/hrm/tests.py`, thêm test kiểm tra khởi tạo `WorkShift`, `ShiftAssignment`, `AttendanceRequest`, và `MonthlyAttendanceSummary`.

- [ ] **Step 2: Run test to verify it fails**
Run: `docker exec tuyendung-studio-backend python manage.py test apps.hrm.tests.HRMAttendanceModelTests`
Expected: FAIL (models chưa được định nghĩa)

- [ ] **Step 3: Define models in `api/apps/hrm/models.py`**
Thêm các class `WorkShift`, `ShiftAssignment`, `BiometricPunchLog`, `AttendanceRequest`, `MonthlyAttendanceSummary` và cập nhật trường cho `AttendanceRecord` theo đúng đặc tả spec.

- [ ] **Step 4: Create and apply migrations**
Run: `docker exec tuyendung-studio-backend python manage.py makemigrations hrm`
Run: `docker exec tuyendung-studio-backend python manage.py migrate`

- [ ] **Step 5: Run test to verify it passes**
Run: `docker exec tuyendung-studio-backend python manage.py test apps.hrm.tests.HRMAttendanceModelTests`
Expected: PASS

- [ ] **Step 6: Commit**
```bash
git add api/apps/hrm/models.py api/apps/hrm/migrations/ api/apps/hrm/tests.py
git commit -m "feat(hrm): add WorkShift, ShiftAssignment, AttendanceRequest and MonthlyAttendanceSummary models"
```

---

### Task 2: Shift Management & Assignment APIs (`apps/hrm`)

**Files:**
- Modify: `api/apps/hrm/serializers.py`
- Modify: `api/apps/hrm/views.py`
- Modify: `api/apps/hrm/urls.py`
- Modify: `api/apps/hrm/tests.py`

**Interfaces:**
- Produces: `WorkShiftViewSet`, `ShiftAssignmentViewSet` với action batch-assign theo dải ngày.

- [ ] **Step 1: Write tests for Shift & Assignment endpoints**
Trong `api/apps/hrm/tests.py`, thêm test CRUD `WorkShift` và phân ca hàng loạt cho nhân viên theo dải ngày (`POST /api/v1/hrm/shift-assignments/batch/`).

- [ ] **Step 2: Run test to verify it fails**
Run: `docker exec tuyendung-studio-backend python manage.py test apps.hrm.tests.ShiftAPITests`
Expected: FAIL

- [ ] **Step 3: Implement Serializers and Views**
Tạo `WorkShiftSerializer`, `ShiftAssignmentSerializer`, và `ShiftAssignmentBatchSerializer`. Tạo ViewSet trong `views.py` và đăng ký router trong `urls.py`.

- [ ] **Step 4: Run test to verify it passes**
Run: `docker exec tuyendung-studio-backend python manage.py test apps.hrm.tests.ShiftAPITests`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add api/apps/hrm/serializers.py api/apps/hrm/views.py api/apps/hrm/urls.py api/apps/hrm/tests.py
git commit -m "feat(hrm): implement WorkShift and ShiftAssignment CRUD and batch assign APIs"
```

---

### Task 3: 2-Stage Approval Attendance Request Center API (`apps/hrm`)

**Files:**
- Modify: `api/apps/hrm/serializers.py`
- Modify: `api/apps/hrm/views.py`
- Modify: `api/apps/hrm/urls.py`
- Modify: `api/apps/hrm/tests.py`

**Interfaces:**
- Produces: `AttendanceRequestViewSet` hỗ trợ 5 loại đơn (`LEAVE`, `REGULARISATION`, `BUSINESS_TRIP`, `OVERTIME`, `LATE_EARLY`), actions: `approve_stage_1`, `approve_stage_2`, `reject`.

- [ ] **Step 1: Write tests for 2-stage request approval**
Viết test kiểm tra nhân viên tạo đơn ➔ Quản lý trực tiếp duyệt cấp 1 ➔ HR duyệt cấp 2 ➔ Ngày công trong `AttendanceRecord` được cập nhật tương ứng.

- [ ] **Step 2: Run test to verify it fails**
Run: `docker exec tuyendung-studio-backend python manage.py test apps.hrm.tests.AttendanceRequestTests`
Expected: FAIL

- [ ] **Step 3: Implement AttendanceRequest serializers & workflow views**
Tạo `AttendanceRequestSerializer`, action `approve_stage_1`, `approve_stage_2`, `reject`, tự động bù công vào `AttendanceRecord` khi duyệt cấp 2.

- [ ] **Step 4: Run test to verify it passes**
Run: `docker exec tuyendung-studio-backend python manage.py test apps.hrm.tests.AttendanceRequestTests`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add api/apps/hrm/serializers.py api/apps/hrm/views.py api/apps/hrm/urls.py api/apps/hrm/tests.py
git commit -m "feat(hrm): implement 2-stage approval AttendanceRequest API with auto-compensation"
```

---

### Task 4: Ingestion Engine & Timecard Calculation (`apps/hrm/services.py`)

**Files:**
- Create/Modify: `api/apps/hrm/services.py`
- Modify: `api/apps/hrm/views.py`
- Modify: `api/apps/hrm/urls.py`
- Modify: `api/apps/hrm/tests.py`

**Interfaces:**
- Produces: `BiometricPunchLogViewSet`, API `/api/v1/hrm/attendances/biometric-punch/`, `import_excel_punches()`, `calculate_daily_attendance()`.

- [ ] **Step 1: Write tests for punch ingestion & timecard calculation**
Viết test: gửi 2 bản ghi punch (in & out) ➔ service đối chiếu với ca làm việc ➔ tính chính xác số phút đi muộn, về sớm, và số giờ làm thực tế.

- [ ] **Step 2: Run test to verify it fails**
Run: `docker exec tuyendung-studio-backend python manage.py test apps.hrm.tests.AttendanceCalculationTests`
Expected: FAIL

- [ ] **Step 3: Implement calculation service & punch ingestion API**
Xây dựng logic so khớp giờ quẹt thẻ và ca làm việc trong `services.py`, API tiếp nhận punch log và import Excel.

- [ ] **Step 4: Run test to verify it passes**
Run: `docker exec tuyendung-studio-backend python manage.py test apps.hrm.tests.AttendanceCalculationTests`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add api/apps/hrm/services.py api/apps/hrm/views.py api/apps/hrm/urls.py api/apps/hrm/tests.py
git commit -m "feat(hrm): implement punch log ingestion and daily timecard calculation engine"
```

---

### Task 5: Monthly Timesheet Summary, Lock & Push to Payroll API (`apps/hrm`)

**Files:**
- Modify: `api/apps/hrm/views.py`
- Modify: `api/apps/hrm/urls.py`
- Modify: `api/apps/hrm/tests.py`

**Interfaces:**
- Produces: `MonthlyAttendanceSummaryViewSet` với action `lock`, `unlock`, `push_to_payroll`.

- [ ] **Step 1: Write test for monthly rollup and push to payroll**
Viết test: tổng hợp công tháng ➔ Khóa bảng công ➔ Bấm `push_to_payroll` ➔ Kiểm tra bản ghi `MonthlyPayrollRecord` được tạo/cập nhật với đúng ngày công chuẩn và thực tế.

- [ ] **Step 2: Run test to verify it fails**
Run: `docker exec tuyendung-studio-backend python manage.py test apps.hrm.tests.MonthlyTimesheetPayrollTests`
Expected: FAIL

- [ ] **Step 3: Implement MonthlyAttendanceSummaryViewSet**
Triển khai logic tổng hợp ngày công tháng, action khóa/mở khóa và đẩy số liệu sang `MonthlyPayrollRecord`.

- [ ] **Step 4: Run test to verify it passes**
Run: `docker exec tuyendung-studio-backend python manage.py test apps.hrm.tests.MonthlyTimesheetPayrollTests`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add api/apps/hrm/views.py api/apps/hrm/urls.py api/apps/hrm/tests.py
git commit -m "feat(hrm): implement MonthlyAttendanceSummary with Lock and Push-to-Payroll endpoints"
```

---

### Task 6: Frontend Routes & AttendanceWorkspaceLayout (Top Sub-Navbar)

**Files:**
- Modify: `frontend/src/configs/constants.ts`
- Create: `frontend/src/layouts/components/employers/AttendanceWorkspaceLayout/index.tsx`
- Modify: `frontend/src/layouts/components/employers/Sidebar/EmployerMenu.tsx`
- Modify: `frontend/src/i18n/locales/vi/employer.json`

**Interfaces:**
- Produces: `AttendanceWorkspaceLayout` component hiển thị thanh Top Sub-Navbar gồm 6 menu: Tổng quan, Chấm công ▾, Ca làm việc ▾, Quản lý đơn ▾, Báo cáo, Thiết lập.

- [ ] **Step 1: Add new routes to `constants.ts` & i18n keys**
Khai báo đường dẫn `ROUTES.EMPLOYER.HRM_ATTENDANCES_*` trong `constants.ts` và bản dịch trong `employer.json`.

- [ ] **Step 2: Create `AttendanceWorkspaceLayout`**
Xây dựng component layout chứa thanh điều hướng ngang chuyên biệt, các dropdown Popper / Menu cho `Chấm công`, `Ca làm việc`, `Quản lý đơn`.

- [ ] **Step 3: Update `EmployerMenu.tsx`**
Cập nhật link `hrmAttendances` trỏ vào route mặc định của Workspace Chấm công (`/employer/hrm/attendances`).

- [ ] **Step 4: Verify layout in browser/build**
Run: `npm run build` hoặc check router compilation trong frontend.
Expected: Build thành công không có lỗi type.

- [ ] **Step 5: Commit**
```bash
git add frontend/src/configs/constants.ts frontend/src/layouts/ frontend/src/i18n/
git commit -m "feat(frontend): create AttendanceWorkspaceLayout with MISA AMIS-style Top Sub-Navbar"
```

---

### Task 7: Frontend Shift Management & Shift Matrix Pages

**Files:**
- Create: `frontend/src/views/hrmPages/AttendancePages/ShiftListPage/index.tsx`
- Create: `frontend/src/views/hrmPages/AttendancePages/ShiftMatrixPage/index.tsx`
- Create: `frontend/src/app/employer/hrm/attendances/shifts/list/page.tsx`
- Create: `frontend/src/app/employer/hrm/attendances/shifts/matrix/page.tsx`

**Interfaces:**
- Produces: Trang Danh sách ca làm việc và Bảng ma trận phân ca tổng hợp theo tuần/tháng.

- [ ] **Step 1: Build `ShiftListPage`**
Giao diện quản lý danh sách ca: bảng dữ liệu, modal thêm/sửa ca (giờ bắt đầu, kết thúc, nghỉ trưa, công quy đổi).

- [ ] **Step 2: Build `ShiftMatrixPage`**
Ma trận phân ca: bảng với cột là các ngày trong tuần/tháng, hàng là nhân viên; click vào ô để gán ca hoặc xóa phân ca.

- [ ] **Step 3: Hook pages to App Router**
Tạo file `page.tsx` tương ứng trong `src/app/employer/hrm/attendances/shifts/`.

- [ ] **Step 4: Verify rendering and interaction**
Kiểm tra UI và tương tác gán ca trên giao diện.

- [ ] **Step 5: Commit**
```bash
git add frontend/src/views/hrmPages/AttendancePages/ frontend/src/app/employer/hrm/attendances/shifts/
git commit -m "feat(frontend): implement ShiftListPage and ShiftMatrixPage under Attendance workspace"
```

---

### Task 8: Frontend Centralized Request Center (Quản lý đơn từ 5 loại)

**Files:**
- Create: `frontend/src/views/hrmPages/AttendancePages/RequestManagementPage/index.tsx`
- Create: `frontend/src/app/employer/hrm/attendances/requests/[type]/page.tsx`

**Interfaces:**
- Produces: Trang Quản lý đơn từ hỗ trợ tab chuyển đổi 5 loại đơn, bộ lọc trạng thái duyệt, modal gửi đơn mới và modal duyệt 2 cấp.

- [ ] **Step 1: Build `RequestManagementPage`**
Bảng hiển thị đơn từ: cột thông tin người gửi, loại đơn, thời gian, lý do, trạng thái duyệt cấp 1 và cấp 2.

- [ ] **Step 2: Build Create Request Modal**
Modal gửi đơn linh hoạt theo loại: Đơn xin nghỉ, Đề nghị cập nhật công, Đề nghị công tác, Đơn làm thêm giờ, Đơn đi muộn về sớm.

- [ ] **Step 3: Build Approval Modal for Managers & HR**
Nút Duyệt / Từ chối với quyền phân cấp rõ ràng.

- [ ] **Step 4: Hook page into App Router**
Tạo dynamic route `requests/[type]/page.tsx` hoặc tab view.

- [ ] **Step 5: Commit**
```bash
git add frontend/src/views/hrmPages/AttendancePages/RequestManagementPage/ frontend/src/app/employer/hrm/attendances/requests/
git commit -m "feat(frontend): implement RequestManagementPage with 2-stage approval workflow"
```

---

### Task 9: Frontend Detailed Timesheet Matrix & Summary Timesheet (Chuyển tính lương)

**Files:**
- Create: `frontend/src/views/hrmPages/AttendancePages/DetailedTimesheetPage/index.tsx`
- Create: `frontend/src/views/hrmPages/AttendancePages/SummaryTimesheetPage/index.tsx`
- Create: `frontend/src/app/employer/hrm/attendances/timesheets/detailed/page.tsx`
- Create: `frontend/src/app/employer/hrm/attendances/timesheets/summary/page.tsx`

**Interfaces:**
- Produces:
  - `DetailedTimesheetPage`: Lưới ma trận ngày 1–31 với ký hiệu công, popup xem chi tiết quẹt thẻ và hiệu chỉnh công thủ công.
  - `SummaryTimesheetPage`: Bảng tổng kết số công, nút **Khóa công** và nút **Chuyển tính lương**.

- [ ] **Step 1: Build `DetailedTimesheetPage`**
Bảng ma trận ngày 1–31, hiển thị mã ký hiệu công (`X`, `V`, `P`, `O`, `L`), tooltip chi tiết giờ vào/ra.

- [ ] **Step 2: Build `SummaryTimesheetPage`**
Bảng tổng hợp công tháng, cột công chuẩn, công thực tế, nghỉ phép, nghỉ không lương, giờ OT. Nút "Khóa công" và "Chuyển tính lương" với hộp thoại xác nhận.

- [ ] **Step 3: Hook pages into App Router**
Tạo file `page.tsx` tương ứng trong `src/app/employer/hrm/attendances/timesheets/`.

- [ ] **Step 4: Verify integration with Payroll**
Test bấm "Chuyển tính lương", kiểm tra dữ liệu xuất hiện bên module Bảng lương.

- [ ] **Step 5: Commit**
```bash
git add frontend/src/views/hrmPages/AttendancePages/DetailedTimesheetPage/ frontend/src/views/hrmPages/AttendancePages/SummaryTimesheetPage/ frontend/src/app/employer/hrm/attendances/timesheets/
git commit -m "feat(frontend): implement DetailedTimesheetPage and SummaryTimesheetPage with Push-to-Payroll"
```

---

### Task 10: Frontend Biometric Punch Logs & Overview Dashboard

**Files:**
- Create: `frontend/src/views/hrmPages/AttendancePages/BiometricLogsPage/index.tsx`
- Create: `frontend/src/views/hrmPages/AttendancePages/AttendanceOverviewPage/index.tsx`
- Create: `frontend/src/app/employer/hrm/attendances/biometric-logs/page.tsx`
- Create: `frontend/src/app/employer/hrm/attendances/overview/page.tsx`

**Interfaces:**
- Produces: Trang xem log máy chấm công thô kèm modal Import Excel, và Dashboard tổng quan chuyên cần trong ngày.

- [ ] **Step 1: Build `BiometricLogsPage`**
Danh sách log quẹt thẻ từ ZKTeco/Excel, bộ lọc theo nhân viên, thiết bị, ngày, modal Import file Excel.

- [ ] **Step 2: Build `AttendanceOverviewPage`**
Dashboard tổng quan: KPI cards (Tỷ lệ đi làm, đi muộn, vắng mặt), danh sách đơn chờ duyệt, biểu đồ chuyên cần tuần.

- [ ] **Step 3: Hook pages into App Router**
Tạo các `page.tsx` tương ứng.

- [ ] **Step 4: Final verification & E2E smoke test**
Kiểm tra toàn bộ luồng điều hướng giữa 6 tab và các chức năng con của Workspace Chấm công.

- [ ] **Step 5: Commit & Push**
```bash
git add frontend/src/views/hrmPages/AttendancePages/ frontend/src/app/employer/hrm/attendances/
git commit -m "feat(frontend): complete Attendance Overview Dashboard and Biometric Logs pages"
git push origin dev
```
