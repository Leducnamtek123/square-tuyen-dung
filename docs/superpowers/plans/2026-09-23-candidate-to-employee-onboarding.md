# Kế hoạch Triển khai: Hệ thống Quản trị Tiếp nhận Ứng viên thành Nhân viên (Candidate to Employee Onboarding Hub)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Xây dựng Trung tâm Quản trị Tiếp nhận (Onboarding Hub & State Machine) 5 chặng khép kín cho phân hệ HRM và kết nối trực tiếp từ lúc ứng viên ký nhận Thư mời làm việc (`JobOfferLetter`) đến khi hoàn tất thử việc thành nhân viên chính thức (`ACTIVE`).

**Architecture:** Sử dụng State Machine trên model `EmployeeOnboardingProcess` và `OnboardingTaskItem` trong Django REST Framework (`api/apps/hrm/`), tích hợp tự động vào `CandidateToEmployeeConverter`. Phía Frontend sử dụng Next.js 16 + React 19 + MUI 6 + TanStack Query tại `/employer/hrm/onboarding` với giao diện Dual-View (Table & Kanban), bộ thẻ chỉ số KPI và Drawer tương tác 5 chặng (xem trước CCCD, duyệt hồ sơ, xác nhận Day 1, đánh giá thử việc).

**Tech Stack:** Python 3.10+, Django 4.2+, DRF, MySQL 8.0, Next.js 16 (App Router), React 19, MUI 6, Tailwind CSS v4, TanStack Query, Pytest.

**Spec:** [docs/superpowers/specs/2026-09-23-candidate-to-employee-onboarding-design.md](file:///c:/Users/WIN10/Documents/square-tuyen-dung/docs/superpowers/specs/2026-09-23-candidate-to-employee-onboarding-design.md)

## Global Constraints
- **Zero Raw Secrets**: Không ghi đè hay làm lộ các biến môi trường nhạy cảm (`.env`).
- **TypeScript Synchronized**: Cập nhật đồng bộ các kiểu dữ liệu tại `frontend/src/types/` và `frontend/src/services/hrmService.ts` khớp với DRF Serializers.
- **Vietnamese Documentation**: Giữ nguyên toàn bộ ghi chú, docstring tiếng Việt chuyên ngành nhân sự và tuyển dụng.
- **Idempotency**: Đảm bảo an toàn không bao giờ tạo trùng lặp bản ghi `Employee` hay `EmployeeOnboardingProcess` khi người dùng gọi API nhiều lần.
- **Verification First**: Kiểm tra lint (`pnpm run lint`) và kiểm thử backend (`pytest`) trước khi xác nhận hoàn tất.

---

### Task 1: Backend Data Models & Database Migrations

**Files:**
- Create: `api/apps/hrm/migrations/0009_employeeonboardingprocess_onboardingtaskitem.py`
- Modify: `api/apps/hrm/models.py`
- Modify: `api/apps/hrm/admin.py`

**Interfaces:**
- Produces: `EmployeeOnboardingProcess`, `OnboardingTaskItem` models, `STAGE_CHOICES`, `TASK_CODE_CHOICES`.

- [ ] **Step 1: Định nghĩa model `EmployeeOnboardingProcess` và `OnboardingTaskItem` trong `api/apps/hrm/models.py`**
  Thêm các choices và model với đầy đủ quan hệ khóa ngoại tới `Company`, `Employee`, `JobOfferLetter`, `JobPostActivity`, `EmployeeDocument`, `User`.

- [ ] **Step 2: Đăng ký các model mới vào Django Admin (`api/apps/hrm/admin.py`)**
  Tạo `EmployeeOnboardingProcessAdmin` và `OnboardingTaskItemInline` để hỗ trợ tra cứu trong Django Admin backend.

- [ ] **Step 3: Chạy makemigrations tạo migration file `0009`**
  Run: `python manage.py makemigrations hrm`
  Expected: Tạo thành công file migration `0009_employeeonboardingprocess_onboardingtaskitem.py`.

- [ ] **Step 4: Chạy migrate và xác minh database schema**
  Run: `python manage.py migrate hrm`
  Expected: Tables `project_hrm_employee_onboarding_process` và `project_hrm_onboarding_task_item` được tạo thành công trên MySQL.

- [ ] **Step 5: Commit**
  ```bash
  git add api/apps/hrm/models.py api/apps/hrm/admin.py api/apps/hrm/migrations/0009*.py
  git commit -m "feat(hrm): add EmployeeOnboardingProcess and OnboardingTaskItem models"
  ```

---

### Task 2: Backend Onboarding Services & State Machine Transitions

**Files:**
- Modify: `api/apps/hrm/services.py`
- Test: `api/apps/hrm/tests_onboarding.py`

**Interfaces:**
- Consumes: `EmployeeOnboardingProcess`, `OnboardingTaskItem`, `CandidateToEmployeeConverter`.
- Produces:
  - `initialize_onboarding_process(employee, offer_letter=None, application=None) -> EmployeeOnboardingProcess`
  - `approve_preboarding_document(task_id, actor) -> OnboardingTaskItem`
  - `reject_preboarding_document(task_id, reason, actor) -> OnboardingTaskItem`
  - `complete_task_item(task_id, actor) -> OnboardingTaskItem`
  - `confirm_day_one_attendance(process_id, actor) -> EmployeeOnboardingProcess`
  - `submit_probation_evaluation(process_id, result, notes, actor) -> EmployeeOnboardingProcess`
  - `cancel_onboarding_process(process_id, reason, actor) -> EmployeeOnboardingProcess`

- [ ] **Step 1: Viết test case ban đầu kiểm tra khởi tạo và chuyển đổi trạng thái onboarding (`api/apps/hrm/tests_onboarding.py`)**
  Viết unit test kiểm thử:
  - Tạo `Employee` từ `CandidateToEmployeeConverter` tự động sinh `EmployeeOnboardingProcess` và các `OnboardingTaskItem` chuẩn.
  - Phê duyệt tài liệu tự động sinh `EmployeeDocument` và cập nhật thông tin ngân hàng/thuế.
  - Xác nhận Day 1 kích hoạt Hợp đồng `ACTIVE` và gán ca làm việc.
  - Đánh giá thử việc đạt chuyển `Employee.status = ACTIVE` và `stage = COMPLETED`.

- [ ] **Step 2: Chạy test để xác nhận fail**
  Run: `pytest api/apps/hrm/tests_onboarding.py -k test_initialize_onboarding -v`
  Expected: FAIL (Service methods chưa được định nghĩa).

- [ ] **Step 3: Triển khai các phương thức nghiệp vụ trong `api/apps/hrm/services.py`**
  Thực hiện logic chi tiết:
  - Tự động sinh 10 task chuẩn thuộc 4 chặng: Pre-boarding (CCCD, bằng cấp, STK, MST), Nội bộ (email, laptop, máy chấm công), Day 1 (có mặt, HĐLĐ, bàn giao tài sản), Thử việc (đánh giá 30 ngày, tổng kết 60 ngày).
  - Tích hợp `initialize_onboarding_process` vào cuối hàm `CandidateToEmployeeConverter.convert()`.
  - Triển khai logic duyệt/từ chối giấy tờ, xác nhận Day 1 và đánh giá thử việc.

- [ ] **Step 4: Chạy lại test suite dịch vụ**
  Run: `pytest api/apps/hrm/tests_onboarding.py -v`
  Expected: PASS toàn bộ các test cases.

- [ ] **Step 5: Commit**
  ```bash
  git add api/apps/hrm/services.py api/apps/hrm/tests_onboarding.py
  git commit -m "feat(hrm): implement onboarding state machine transitions and task automations"
  ```

---

### Task 3: Backend DRF Serializers, ViewSets & API Endpoints

**Files:**
- Modify: `api/apps/hrm/serializers.py`
- Modify: `api/apps/hrm/views.py`
- Modify: `api/apps/hrm/urls.py`

**Interfaces:**
- Consumes: Models & Services từ Task 1 & 2.
- Produces API Endpoints:
  - `GET /api/v1/native-hrm/onboarding-processes/` (danh sách tiến trình onboarding kèm bộ lọc)
  - `GET /api/v1/native-hrm/onboarding-processes/stats/` (bộ 4 chỉ số KPI)
  - `GET /api/v1/native-hrm/onboarding-processes/{id}/` (chi tiết tiến trình + nested tasks)
  - `POST /api/v1/native-hrm/onboarding-processes/{id}/tasks/{task_id}/approve-document/`
  - `POST /api/v1/native-hrm/onboarding-processes/{id}/tasks/{task_id}/reject-document/`
  - `POST /api/v1/native-hrm/onboarding-processes/{id}/tasks/{task_id}/complete/`
  - `POST /api/v1/native-hrm/onboarding-processes/{id}/confirm-day-one/`
  - `POST /api/v1/native-hrm/onboarding-processes/{id}/probation-evaluation/`
  - `POST /api/v1/native-hrm/onboarding-processes/{id}/cancel/`

- [ ] **Step 1: Viết test case API trong `api/apps/hrm/tests_onboarding.py`**
  Viết test kiểm tra request/response của endpoint stats, endpoint list và các action buttons.

- [ ] **Step 2: Chạy test API để xác nhận fail**
  Run: `pytest api/apps/hrm/tests_onboarding.py -k test_api_onboarding -v`
  Expected: FAIL (Endpoints chưa tồn tại 404).

- [ ] **Step 3: Định nghĩa Serializers trong `api/apps/hrm/serializers.py`**
  Tạo:
  - `OnboardingTaskItemSerializer`
  - `EmployeeOnboardingProcessSerializer` (kèm thông tin employee thu gọn, avatar, phòng ban)
  - `OnboardingStatsSerializer`
  - `ProbationEvaluationPayloadSerializer`
  - `RejectDocumentPayloadSerializer`

- [ ] **Step 4: Xây dựng `EmployeeOnboardingProcessViewSet` trong `api/apps/hrm/views.py`**
  Triển khai các actions với cơ chế bảo vệ phân quyền theo `_get_company_for_request(request)` và audit log.

- [ ] **Step 5: Đăng ký router trong `api/apps/hrm/urls.py`**
  Đăng ký `router.register(r'onboarding-processes', EmployeeOnboardingProcessViewSet, basename='onboarding-processes')`.

- [ ] **Step 6: Chạy test API để xác nhận pass**
  Run: `pytest api/apps/hrm/tests_onboarding.py -k test_api_onboarding -v`
  Expected: PASS 100%.

- [ ] **Step 7: Commit**
  ```bash
  git add api/apps/hrm/serializers.py api/apps/hrm/views.py api/apps/hrm/urls.py api/apps/hrm/tests_onboarding.py
  git commit -m "feat(hrm): add OnboardingProcess ViewSet, Serializers, and Action Endpoints"
  ```

---

### Task 4: Frontend Types, API Client & React Query Hooks

**Files:**
- Modify: `frontend/src/services/hrmService.ts`
- Modify: `frontend/src/views/hrmPages/hooks/useHrmQueries.ts`

**Interfaces:**
- Consumes: DRF API contracts từ Task 3.
- Produces:
  - Types: `OnboardingStage`, `NativeOnboardingTaskItem`, `NativeEmployeeOnboardingProcess`, `OnboardingStatsResponse`.
  - API methods: `getOnboardingProcesses`, `getOnboardingStats`, `getOnboardingProcessDetail`, `approveTaskDocument`, `rejectTaskDocument`, `completeTaskItem`, `confirmDayOne`, `evaluateProbation`, `cancelOnboarding`.
  - Query Hooks: `useHrmOnboardingProcesses`, `useHrmOnboardingStats`, `useHrmOnboardingProcessDetail`.
  - Mutation Hooks: `useHrmOnboardingMutations`.

- [ ] **Step 1: Khai báo Types trong `frontend/src/services/hrmService.ts`**
  Định nghĩa chính xác các interface và type union theo payload của DRF backend.

- [ ] **Step 2: Thêm các methods gọi API vào `hrmService`**
  Thực hiện các phương thức HTTP GET, POST tương ứng các endpoints đã tạo.

- [ ] **Step 3: Định nghĩa Query Keys và Hooks trong `frontend/src/views/hrmPages/hooks/useHrmQueries.ts`**
  Thêm `HRM_QUERY_KEYS.onboardingProcesses`, `HRM_QUERY_KEYS.onboardingStats`, và các React Query hooks với invalidation logic tự động cập nhật lại danh sách.

- [ ] **Step 4: Kiểm tra linting TypeScript**
  Run: `pnpm exec tsc --noEmit` hoặc `pnpm run lint`
  Expected: Không phát sinh lỗi type liên quan đến onboarding service.

- [ ] **Step 5: Commit**
  ```bash
  git add frontend/src/services/hrmService.ts frontend/src/views/hrmPages/hooks/useHrmQueries.ts
  git commit -m "feat(frontend): add onboarding types, API service methods, and React Query hooks"
  ```

---

### Task 5: Frontend Header & Thẻ Chỉ số KPI Tiếp nhận (Top KPI Cards)

**Files:**
- Create: `frontend/src/views/hrmPages/OnboardingPage/components/OnboardingKpiCards.tsx`
- Create: `frontend/src/views/hrmPages/OnboardingPage/components/OnboardingFilters.tsx`

**Interfaces:**
- Consumes: `useHrmOnboardingStats`, `useHrmDepartments`.
- Produces: `OnboardingKpiCards`, `OnboardingFilters` components.

- [ ] **Step 1: Xây dựng `OnboardingKpiCards.tsx`**
  Hiển thị 4 thẻ card trực quan:
  1. *Tổng nhân sự Onboarding* (icon Rocket, màu primary).
  2. *Chờ duyệt hồ sơ Pre-boarding* (icon Assignment/CCCD, màu warning cam, badge cảnh báo).
  3. *Sắp đến ngày nhận việc* (icon Event/Day 1, màu info xanh dương).
  4. *Cần đánh giá thử việc* (icon Gavel/Đánh giá, màu success xanh lá).

- [ ] **Step 2: Xây dựng `OnboardingFilters.tsx`**
  Thanh công cụ lọc:
  - Ô tìm kiếm theo tên hoặc mã nhân viên.
  - Dropdown lọc theo Chặng Onboarding (`stage`).
  - Dropdown lọc theo Phòng ban.
  - Nút chuyển đổi View Mode (Bảng chi tiết / Kanban Board).

- [ ] **Step 3: Kiểm tra hiển thị và tính toán state**
  Kiểm tra xem khi click đổi filter thì params query được truyền chuẩn xác.

- [ ] **Step 4: Commit**
  ```bash
  git add frontend/src/views/hrmPages/OnboardingPage/components/
  git commit -m "feat(frontend): create OnboardingKpiCards and OnboardingFilters components"
  ```

---

### Task 6: Frontend Dual-View Management (Table & Kanban Views)

**Files:**
- Create: `frontend/src/views/hrmPages/OnboardingPage/components/OnboardingTableView.tsx`
- Create: `frontend/src/views/hrmPages/OnboardingPage/components/OnboardingKanbanView.tsx`
- Modify: `frontend/src/views/hrmPages/OnboardingPage/index.tsx`

**Interfaces:**
- Consumes: `useHrmOnboardingProcesses`, `OnboardingKpiCards`, `OnboardingFilters`.
- Produces: Giao diện hoàn chỉnh danh sách tiếp nhận nhân sự.

- [ ] **Step 1: Xây dựng `OnboardingTableView.tsx`**
  Hiển thị bảng danh sách chuẩn với các cột:
  - Nhân sự (Avatar, Họ tên, Mã NV).
  - Vị trí & Phòng ban.
  - Quản lý trực tiếp.
  - Ngày nhận việc dự kiến / thực tế.
  - Chặng hiện tại (Chip màu trực quan).
  - Tiến độ % tasks (LinearProgress kèm số % hiển thị rõ nét).
  - Nút "Mở hồ sơ chi tiết".

- [ ] **Step 2: Xây dựng `OnboardingKanbanView.tsx`**
  Hiển thị 5 cột Kanban:
  - Chờ nộp hồ sơ (`PREBOARDING_DOCS`)
  - Chuẩn bị nội bộ (`INTERNAL_PREP`)
  - Ngày đầu nhận việc (`DAY_ONE_WELCOME`)
  - Đang thử việc (`PROBATION_EVALUATION`)
  - Hoàn tất chính thức (`COMPLETED`)
  Mỗi thẻ nhân viên hiển thị avatar, tiến độ checklist (ví dụ `3/5 việc`), thời hạn còn lại, và click để mở Drawer.

- [ ] **Step 3: Cập nhật `OnboardingPage/index.tsx` kết nối bộ lọc và chế độ xem**
  Tích hợp logic chuyển đổi view mode giữa Table và Kanban.

- [ ] **Step 4: Commit**
  ```bash
  git add frontend/src/views/hrmPages/OnboardingPage/
  git commit -m "feat(frontend): implement Dual-View Table and Kanban for Onboarding Hub"
  ```

---

### Task 7: Frontend Onboarding Action Drawer (Drawer 5 Chặng Tương tác)

**Files:**
- Create: `frontend/src/views/hrmPages/OnboardingPage/components/OnboardingDetailDrawer.tsx`
- Create: `frontend/src/views/hrmPages/OnboardingPage/components/DocumentLightboxModal.tsx`
- Create: `frontend/src/views/hrmPages/OnboardingPage/components/ProbationEvaluationModal.tsx`
- Modify: `frontend/src/views/hrmPages/OnboardingPage/index.tsx`

**Interfaces:**
- Consumes: `useHrmOnboardingProcessDetail`, `useHrmOnboardingMutations`.
- Produces: `OnboardingDetailDrawer` cho phép HR thao tác xử lý xuyên suốt 5 chặng.

- [ ] **Step 1: Xây dựng `DocumentLightboxModal.tsx`**
  Hỗ trợ HR bấm vào ảnh CCCD mặt trước/mặt sau, bằng cấp để xem phóng to với độ nét cao, xoay ảnh, tải xuống.

- [ ] **Step 2: Xây dựng `ProbationEvaluationModal.tsx`**
  Biểu mẫu đánh giá thử việc với điểm đánh giá, nhận xét chi tiết, và 3 nút quyết định: Đạt (Chính thức) / Gia hạn / Dừng hợp tác.

- [ ] **Step 3: Xây dựng `OnboardingDetailDrawer.tsx`**
  - **Header**: Avatar nhân viên, Mã NV, Họ tên, Phòng ban, Thanh Stepper 5 bước, Progress Bar %.
  - **Tab Chặng 1 (Offer)**: Xem trước tóm tắt Offer Letter đã ký, mức lương, ngày bắt đầu.
  - **Tab Chặng 2 (Hồ sơ số)**: Thẻ ảnh CCCD 2 mặt, bằng cấp; nút [Phê duyệt] tự động chuyển thành `EmployeeDocument` hoặc nút [Yêu cầu nộp lại] kèm lý do.
  - **Tab Chặng 3 (Chuẩn bị nội bộ)**: Danh sách checkbox cấp email, laptop, đăng ký mã máy chấm công biometric.
  - **Tab Chặng 4 (Day 1 Welcome)**: Nút hành động nổi bật [Xác nhận có mặt ngày đầu], kích hoạt HĐLĐ thử việc và gán ca làm việc.
  - **Tab Chặng 5 (Thử việc)**: Đếm ngược thời gian thử việc, nút mở modal [Đánh giá thử việc].

- [ ] **Step 4: Kết nối Drawer vào trang chính `OnboardingPage/index.tsx`**
  Xử lý đóng/mở Drawer khi click vào nhân viên từ Bảng hoặc Kanban Board.

- [ ] **Step 5: Commit**
  ```bash
  git add frontend/src/views/hrmPages/OnboardingPage/components/
  git commit -m "feat(frontend): create OnboardingDetailDrawer with 5-stage interactive workflows"
  ```

---

### Task 8: Verification & End-to-End System Polish

**Files:**
- Run Verification Tests across Backend & Frontend

- [ ] **Step 1: Chạy toàn bộ Unit Tests Backend**
  Run: `pytest api/apps/hrm/tests_onboarding.py -v`
  Expected: PASS toàn bộ test cases không có lỗi.

- [ ] **Step 2: Chạy linter & format backend**
  Run: `ruff check api/apps/hrm/`
  Expected: Không có cảnh báo linting.

- [ ] **Step 3: Chạy linter & type check frontend**
  Run: `pnpm run lint` tại thư mục `frontend/`
  Expected: Không phát sinh lỗi TypeScript hay ESLint.

- [ ] **Step 4: Kiểm thử thủ công toàn bộ luồng E2E**
  Xác thực:
  1. Ứng viên ký Offer -> tự động xuất hiện trên Onboarding Hub với mã NV.
  2. HR mở Drawer xem ảnh CCCD, bấm duyệt -> tự động lưu vào Hồ sơ nhân viên.
  3. Tích chọn chuẩn bị IT email & máy tính.
  4. Bấm xác nhận Day 1 -> HĐLĐ chuyển `ACTIVE`.
  5. Điền đánh giá thử việc Đạt -> Nhân viên trở thành `ACTIVE`.

- [ ] **Step 5: Commit**
  ```bash
  git commit --allow-empty -m "chore: verify end-to-end candidate onboarding workflow completion"
  ```
