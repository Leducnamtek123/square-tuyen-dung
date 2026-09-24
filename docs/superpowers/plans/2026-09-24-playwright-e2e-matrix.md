# 🚀 Kế Hoạch Triển Khai: Ma Trận Kiểm Thử Tự Động E2E Playwright Cho Toàn Bộ Hệ Thống InfoHR

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Xây dựng toàn bộ hạ tầng kiểm thử E2E chuẩn mực bằng Playwright gồm Page Object Model (POM), modular mock fixtures, và triển khai đầy đủ ma trận 80+ test cases bao phủ 7 phân hệ nghiệp vụ theo chiến lược phân tầng kép (Dual-Tier).

**Architecture:** Sử dụng kiến trúc Domain-Driven POM phân tách UI locators khỏi logic kiểm thử. Tầng 1 (Fast Mocked E2E) sử dụng mạng network route interception modular chạy 4 workers trên CI; Tầng 2 (Live E2E) chạy chu trình liên thông khép kín trên Docker Compose thật (Django + MySQL + MinIO S3 + LiveKit).

**Tech Stack:** Playwright Test 1.40+, TypeScript 5+, Next.js 16 App Router, LiveKit Client Fake Media, GitHub Actions CI.

**Spec:** [docs/superpowers/specs/2026-09-24-playwright-e2e-matrix-design.md](file:///c:/Users/WIN10/Documents/square-tuyen-dung/docs/superpowers/specs/2026-09-24-playwright-e2e-matrix-design.md)

## Global Constraints
- Tuân thủ nghiêm ngặt `frontend/AGENTS.md` và root `AGENTS.md`.
- Tuyệt đối không xóa hay làm hỏng các file test hoặc helper đang hoạt động hiện có trong `frontend/tests/`.
- Luôn giữ nguyên các chú thích bằng tiếng Việt và thuật ngữ miền nghiệp vụ của InfoHR.
- Mọi test case phải độc lập, tự dọn dẹp hoặc khởi tạo session riêng biệt qua fixtures, không phụ thuộc thứ tự chạy.
- Selector ưu tiên dùng `data-testid`, `getByRole`, `getByText`, hoặc các thuộc tính name/id ngữ nghĩa; cấm dùng XPath dài hoặc class CSS ngẫu nhiên.

---

### Task 1: Hạ Tầng Khung Kiểm Thử & Modular Mocks (Core Infrastructure & Modular Mocks)

**Files:**
- Create: `frontend/tests/pages/base.page.ts`
- Create: `frontend/tests/mocks/index.ts`
- Create: `frontend/tests/mocks/mock-auth.ts`
- Create: `frontend/tests/mocks/mock-jobs.ts`
- Create: `frontend/tests/mocks/mock-employer.ts`
- Create: `frontend/tests/mocks/mock-voice-ai.ts`
- Create: `frontend/tests/mocks/mock-hrm.ts`
- Create: `frontend/tests/mocks/mock-admin.ts`
- Create: `frontend/tests/fixtures/auth.fixtures.ts`
- Create: `frontend/tests/fixtures/mock.fixtures.ts`

**Interfaces:**
- Produces: `BasePage` class với các utility: `waitForLoadingGone()`, `expectToastMessage(text)`, `closeModalIfOpen()`.
- Produces: `setupAllApiMocks(page: Page)`, `candidateContextFixture`, `employerContextFixture`, `adminContextFixture`.

- [ ] **Step 1: Tạo `BasePage` chứa các tác vụ UI dùng chung**
  Viết file `frontend/tests/pages/base.page.ts` đóng gói:
  - `page: Page`
  - `waitForLoadingGone()`: Chờ biến mất các selector loader `[data-testid="loading-spinner"]`, `.MuiCircularProgress-root`, `[data-testid="skeleton-loader"]`.
  - `expectToastMessage(text: string | RegExp)`: Xác nhận thông báo `div[role="alert"]`, `.MuiAlert-message` hoặc Sonner toast.
  - `closeModalIfOpen()`: Bấm nút ESC hoặc backdrop để đóng modal đang mở.

- [ ] **Step 2: Modular hóa bộ giả lập API từ `mockApi.ts` sang thư mục `frontend/tests/mocks/`**
  Tách các handlers từ file `frontend/tests/helpers/mockApi.ts`:
  - `mock-auth.ts`: Xử lý routes `/api/auth/login/`, `/api/auth/register/`, `/api/auth/refresh/`, `/api/auth/me/`, `/api/auth/logout/`.
  - `mock-jobs.ts`: Xử lý `/api/jobs/`, `/api/jobs/[slug]/`, `/api/common/configs/`, `/api/common/careers/`, `/api/common/cities/`.
  - `mock-employer.ts`: Xử lý `/api/employer/stats/`, `/api/employer/job-posts/`, `/api/employer/applications/`, `/api/employer/questions/`.
  - `mock-voice-ai.ts`: Xử lý `/api/interview/token/`, `/api/interview/sessions/`, `/api/interview/evaluation/`.
  - `mock-hrm.ts`: Xử lý `/api/hrm/employees/`, `/api/hrm/departments/`, `/api/hrm/leaves/`, `/api/hrm/payroll/`, `/api/hrm/shifts/`.
  - `mock-admin.ts`: Xử lý `/api/admin/jobs/`, `/api/admin/companies/`, `/api/admin/users/`, `/api/admin/audit-logs/`.
  - `index.ts`: Export hàm `setupAllApiMocks(page: Page)`.

- [ ] **Step 3: Tạo custom fixtures trong `frontend/tests/fixtures/`**
  - `auth.fixtures.ts`: Mở rộng `test` của Playwright để cung cấp sẵn `authenticatedCandidatePage`, `authenticatedEmployerPage`, `authenticatedAdminPage` với session cookie đã được inject tự động.
  - `mock.fixtures.ts`: Tự động gọi `setupAllApiMocks(page)` trước mỗi test case.

- [ ] **Step 4: Chạy smoke test xác nhận hạ tầng fixtures & mocks hoạt động**
  Chạy lệnh: `pnpm --filter frontend exec playwright test tests/e2e/auth/auth-login.spec.ts`
  Kỳ vọng: PASS 100%.

- [ ] **Step 5: Commit mã nguồn hạ tầng**
  ```bash
  git add frontend/tests/pages/base.page.ts frontend/tests/mocks/ frontend/tests/fixtures/
  git commit -m "feat(test): scaffold base POM and modular api mocks infrastructure"
  ```

---

### Task 2: Page Objects & Test Matrix Xác Thực & Phân Quyền (`01-auth/`)

**Files:**
- Create: `frontend/tests/pages/auth/login.page.ts`
- Create: `frontend/tests/pages/auth/register.page.ts`
- Create: `frontend/tests/pages/auth/forgot-password.page.ts`
- Create: `frontend/tests/e2e/01-auth/auth-login.spec.ts`
- Create: `frontend/tests/e2e/01-auth/auth-register.spec.ts`
- Create: `frontend/tests/e2e/01-auth/auth-password-recovery.spec.ts`
- Create: `frontend/tests/e2e/01-auth/auth-role-guards.spec.ts`

**Interfaces:**
- Consumes: `BasePage` từ `frontend/tests/pages/base.page.ts`, `setupAllApiMocks` từ `frontend/tests/mocks/index.ts`.
- Implements: Test cases `AUTH-01` đến `AUTH-09` trong tài liệu thiết kế.

- [ ] **Step 1: Viết các class Page Object cho Auth**
  - `login.page.ts`: Chứa methods `goto()`, `login(email, password)`, `expectLoginError(msg)`.
  - `register.page.ts`: Chứa methods `goto()`, `fillCandidateRegisterForm(data)`, `submit()`.
  - `forgot-password.page.ts`: Chứa methods `goto()`, `requestResetLink(email)`, `resetPassword(token, newPass)`.

- [ ] **Step 2: Viết test spec `auth-login.spec.ts` (`AUTH-02`, `AUTH-07`, `AUTH-09`)**
  - Test đăng nhập thành công với ứng viên, NTD, admin.
  - Test đăng nhập thất bại với sai mật khẩu (hiển thị alert lỗi).
  - Test đăng nhập tài khoản bị khóa `is_active: false` (hiển thị thông báo tài khoản bị khóa).

- [ ] **Step 3: Viết test spec `auth-register.spec.ts` (`AUTH-01`)**
  - Test đăng ký tài khoản Ứng viên mới, validation mật khẩu khớp nhau, redirect sang trang onboarding/home.
  - Test validation email trùng lặp.

- [ ] **Step 4: Viết test spec `auth-role-guards.spec.ts` (`AUTH-03`, `AUTH-04`, `AUTH-08`)**
  - Test tài khoản Ứng viên cố vào `/employer/dashboard` $\rightarrow$ Chuyển hướng `/forbidden` hoặc `/login`.
  - Test tài khoản không phải Admin cố vào `/admin/dashboard` $\rightarrow$ Chặn quyền.
  - Test silent token refresh khi access token hết hạn nhận mã 401.

- [ ] **Step 5: Viết test spec `auth-password-recovery.spec.ts` (`AUTH-05`, `AUTH-06`)**
  - Test gửi email reset mật khẩu.
  - Test đăng xuất an toàn xóa sạch cookies và session store.

- [ ] **Step 6: Chạy kiểm thử xác thực phân hệ 01-auth**
  Chạy lệnh: `pnpm --filter frontend exec playwright test tests/e2e/01-auth/`
  Kỳ vọng: PASS tất cả các test case.

- [ ] **Step 7: Commit mã nguồn phân hệ 01-auth**
  ```bash
  git add frontend/tests/pages/auth/ frontend/tests/e2e/01-auth/
  git commit -m "feat(test): implement POM and complete test suite for 01-auth"
  ```

---

### Task 3: Page Objects & Test Matrix Cổng Ứng Viên (`02-candidate/`)

**Files:**
- Create: `frontend/tests/pages/candidate/job-search.page.ts`
- Create: `frontend/tests/pages/candidate/job-detail.page.ts`
- Create: `frontend/tests/pages/candidate/apply-modal.page.ts`
- Create: `frontend/tests/pages/candidate/cv-builder.page.ts`
- Create: `frontend/tests/pages/candidate/online-profile.page.ts`
- Create: `frontend/tests/pages/candidate/my-jobs.page.ts`
- Create: `frontend/tests/e2e/02-candidate/job-search-filter.spec.ts`
- Create: `frontend/tests/e2e/02-candidate/job-apply-flow.spec.ts`
- Create: `frontend/tests/e2e/02-candidate/cv-builder-editor.spec.ts`
- Create: `frontend/tests/e2e/02-candidate/online-profile.spec.ts`
- Create: `frontend/tests/e2e/02-candidate/candidate-dashboard.spec.ts`
- Create: `frontend/tests/e2e/02-candidate/candidate-responsive-mobile.spec.ts`

**Interfaces:**
- Consumes: `BasePage`, `setupJobsApiMocks`, `setupCandidateProfileApiMocks`.
- Implements: Test cases `CAND-01` đến `CAND-12`.

- [ ] **Step 1: Viết các class Page Object cho Ứng viên**
  - `job-search.page.ts`: `searchKeyword()`, `filterByCity()`, `filterByCareer()`, `filterBySalary()`, `getJobCardsCount()`.
  - `job-detail.page.ts`: `openApplyModal()`, `bookmarkJob()`, `getJobTitle()`.
  - `apply-modal.page.ts`: `selectAttachedResume()`, `uploadNewResume(filePath)`, `fillCoverLetter()`, `submit()`.
  - `cv-builder.page.ts`: `selectTemplate()`, `fillPersonalInfo()`, `addExperience()`, `previewCV()`, `downloadPdf()`.
  - `online-profile.page.ts`: `updatePersonalInfo()`, `addSkills()`, `toggleLookingForJob()`.
  - `my-jobs.page.ts`: `getAppliedJobsList()`, `getJobStatusBadge(jobId)`.

- [ ] **Step 2: Viết test spec `job-search-filter.spec.ts` (`CAND-01`, `CAND-02`, `CAND-12`)**
  - Test tìm kiếm theo từ khóa, URL đồng bộ `?kw=...`.
  - Test lọc kết hợp Thành phố + Ngành nghề + Dải lương.
  - Test trạng thái offline và khôi phục khi có mạng.

- [ ] **Step 3: Viết test spec `job-apply-flow.spec.ts` (`CAND-03`, `CAND-04`, `CAND-05`)**
  - Test xem chi tiết tin tuyển dụng, mở modal ứng tuyển.
  - Test nộp hồ sơ chọn CV có sẵn thành công, badge chuyển sang "Đã ứng tuyển".
  - Test nộp hồ sơ upload file PDF mới lên MinIO S3.

- [ ] **Step 4: Viết test spec `cv-builder-editor.spec.ts` (`CAND-06`, `CAND-07`)**
  - Test chọn template mẫu, cập nhật học vấn/kinh nghiệm, xem trước thời gian thực (Live Preview).
  - Test xuất file PDF không lỗi layout font tiếng Việt.

- [ ] **Step 5: Viết test spec `online-profile.spec.ts` & `candidate-dashboard.spec.ts` (`CAND-08`, `CAND-09`, `CAND-10`)**
  - Test cập nhật thông tin cá nhân, bật/tắt trạng thái tìm việc.
  - Test theo dõi danh sách việc đã nộp `/my-jobs` với đủ các trạng thái.
  - Test duyệt bộ câu hỏi luyện tập và điều hướng phỏng vấn `/practice`.

- [ ] **Step 6: Viết test spec `candidate-responsive-mobile.spec.ts` (`CAND-11`)**
  - Thiết lập viewport iPhone 14 (390x844).
  - Test Drawer menu, Bottom Sheet filter, fixed CTA button không bị che khuất.

- [ ] **Step 7: Chạy kiểm thử phân hệ 02-candidate**
  Chạy lệnh: `pnpm --filter frontend exec playwright test tests/e2e/02-candidate/`
  Kỳ vọng: PASS tất cả các test case.

- [ ] **Step 8: Commit mã nguồn phân hệ 02-candidate**
  ```bash
  git add frontend/tests/pages/candidate/ frontend/tests/e2e/02-candidate/
  git commit -m "feat(test): implement POM and complete test suite for 02-candidate"
  ```

---

### Task 4: Page Objects & Test Matrix Nhà Tuyển Dụng & ATS (`03-employer/`)

**Files:**
- Create: `frontend/tests/pages/employer/employer-dashboard.page.ts`
- Create: `frontend/tests/pages/employer/job-post-editor.page.ts`
- Create: `frontend/tests/pages/employer/ats-kanban.page.ts`
- Create: `frontend/tests/pages/employer/question-bank.page.ts`
- Create: `frontend/tests/pages/employer/ai-scorecard.page.ts`
- Create: `frontend/tests/pages/employer/company-profile.page.ts`
- Create: `frontend/tests/e2e/03-employer/employer-dashboard-kpi.spec.ts`
- Create: `frontend/tests/e2e/03-employer/job-post-crud-lifecycle.spec.ts`
- Create: `frontend/tests/e2e/03-employer/ats-kanban-pipeline.spec.ts`
- Create: `frontend/tests/e2e/03-employer/question-bank-scripts.spec.ts`
- Create: `frontend/tests/e2e/03-employer/interview-scheduling.spec.ts`
- Create: `frontend/tests/e2e/03-employer/ai-scorecard-review.spec.ts`
- Create: `frontend/tests/e2e/03-employer/company-profile-verification.spec.ts`

**Interfaces:**
- Consumes: `BasePage`, `setupEmployerApiMocks`.
- Implements: Test cases `EMP-01` đến `EMP-11`.

- [ ] **Step 1: Viết các class Page Object cho Nhà tuyển dụng**
  - `employer-dashboard.page.ts`: `getKpiStats()`, `getRecentApplicants()`.
  - `job-post-editor.page.ts`: `fillJobPostForm(data)`, `submitJob()`, `closeJobPost(jobId)`.
  - `ats-kanban.page.ts`: `switchView(mode)`, `dragCandidate(id, col)`, `moveToHired(id)`, `exportExcel()`.
  - `question-bank.page.ts`: `createQuestion(data)`, `createQuestionGroup(name, questionIds)`.
  - `ai-scorecard.page.ts`: `getOverallScore()`, `playAudioRecording()`, `getTranscriptText()`.
  - `company-profile.page.ts`: `updateCompanyInfo(data)`, `uploadBusinessLicense(path)`.

- [ ] **Step 2: Viết test spec `job-post-crud-lifecycle.spec.ts` (`EMP-01`, `EMP-02`, `EMP-11`)**
  - Test đăng tin tuyển dụng mới với rich-text JD, lưu thành công ở trạng thái chờ duyệt hoặc hiển thị.
  - Test đóng tin tuyển dụng (Expired), mở lại tin.
  - Test xử lý hết hạn mức đăng tin gói dịch vụ (Quota exceeded modal).

- [ ] **Step 3: Viết test spec `ats-kanban-pipeline.spec.ts` & `interview-scheduling.spec.ts` (`EMP-03`, `EMP-04`, `EMP-09`)**
  - Test chuyển đổi xem Kanban / Table.
  - Test kéo thả card ứng viên qua các cột phễu tuyển dụng.
  - Test lên lịch phỏng vấn AI, chọn bộ câu hỏi và sinh `inviteToken`.
  - Test lọc ứng viên theo điểm AI $\ge 80$.

- [ ] **Step 4: Viết test spec `employer-dashboard-kpi.spec.ts` & `question-bank-scripts.spec.ts` (`EMP-05`, `EMP-06`, `EMP-07`)**
  - Test hiển thị chính xác các thẻ số liệu KPI tuyển dụng.
  - Test CRUD câu hỏi phỏng vấn kỹ thuật/văn hóa.
  - Test tạo bộ kịch bản phỏng vấn gộp câu hỏi.

- [ ] **Step 5: Viết test spec `ai-scorecard-review.spec.ts` & `company-profile-verification.spec.ts` (`EMP-08`, `EMP-10`)**
  - Test mở bảng điểm AI: Overall score, Radar chart, Audio player, Transcript bóc băng STT.
  - Test cập nhật hồ sơ doanh nghiệp và gửi file GPKD xác minh tích xanh.

- [ ] **Step 6: Chạy kiểm thử phân hệ 03-employer**
  Chạy lệnh: `pnpm --filter frontend exec playwright test tests/e2e/03-employer/`
  Kỳ vọng: PASS tất cả các test case.

- [ ] **Step 7: Commit mã nguồn phân hệ 03-employer**
  ```bash
  git add frontend/tests/pages/employer/ frontend/tests/e2e/03-employer/
  git commit -m "feat(test): implement POM and complete test suite for 03-employer"
  ```

---

### Task 5: Page Objects & Test Matrix Voice AI AILA WebRTC (`04-voice-ai/`)

**Files:**
- Create: `frontend/tests/pages/voice-ai/preflight.page.ts`
- Create: `frontend/tests/pages/voice-ai/livekit-room.page.ts`
- Create: `frontend/tests/pages/voice-ai/post-interview.page.ts`
- Create: `frontend/tests/e2e/04-voice-ai/preflight-device-checks.spec.ts`
- Create: `frontend/tests/e2e/04-voice-ai/livekit-room-connection.spec.ts`
- Create: `frontend/tests/e2e/04-voice-ai/in-call-hud-interactions.spec.ts`
- Create: `frontend/tests/e2e/04-voice-ai/media-controls-speech.spec.ts`
- Create: `frontend/tests/e2e/04-voice-ai/post-interview-processing.spec.ts`

**Interfaces:**
- Consumes: `BasePage`, `setupVoiceAiApiMocks`.
- Implements: Test cases `VOICE-01` đến `VOICE-10`.

- [ ] **Step 1: Viết các class Page Object cho Voice AI**
  - `preflight.page.ts`: `checkDevicePermissions()`, `isAudioMeterActive()`, `clickJoinRoom()`.
  - `livekit-room.page.ts`: `waitForConnected()`, `getCurrentQuestion()`, `toggleMute()`, `toggleCamera()`, `submitCurrentAnswer()`, `finishInterview()`.
  - `post-interview.page.ts`: `waitForAnalysisProgress()`, `expectCompletedState()`.

- [ ] **Step 2: Viết test spec `preflight-device-checks.spec.ts` (`VOICE-01`, `VOICE-08`)**
  - Test cấp quyền fake media stream, thanh Audio Level Meter dao động, nút vào phòng kích hoạt.
  - Test trường hợp bị từ chối quyền thiết bị (Permission Denied) hiển thị hướng dẫn mở quyền.

- [ ] **Step 3: Viết test spec `livekit-room-connection.spec.ts` & `in-call-hud-interactions.spec.ts` (`VOICE-02`, `VOICE-03`, `VOICE-04`)**
  - Test kết nối phòng LiveKit chuyển sang `connected`.
  - Test Question Card HUD hiển thị đúng số thứ tự câu hỏi và đồng hồ đếm ngược.
  - Test trả lời câu hỏi và chuyển câu tiếp theo.

- [ ] **Step 4: Viết test spec `media-controls-speech.spec.ts` & `post-interview-processing.spec.ts` (`VOICE-05`, `VOICE-06`, `VOICE-07`, `VOICE-09`, `VOICE-10`)**
  - Test bật/tắt Micro và Camera phản hồi icon chính xác.
  - Test hiệu ứng sóng âm phát biểu (Speaking Waveform).
  - Test ngắt kết nối dọn dẹp track và màn hình tổng hợp sau phỏng vấn.
  - Test chặn thi lại với link đã phỏng vấn hoàn thành.
  - Test mất kết nối mạng và khôi phục tự động (Reconnection banner).
  - Test giao diện phòng phỏng vấn trên viewport Mobile.

- [ ] **Step 5: Chạy kiểm thử phân hệ 04-voice-ai**
  Chạy lệnh: `pnpm --filter frontend exec playwright test tests/e2e/04-voice-ai/`
  Kỳ vọng: PASS tất cả các test case.

- [ ] **Step 6: Commit mã nguồn phân hệ 04-voice-ai**
  ```bash
  git add frontend/tests/pages/voice-ai/ frontend/tests/e2e/04-voice-ai/
  git commit -m "feat(test): implement POM and complete test suite for 04-voice-ai"
  ```

---

### Task 6: Page Objects & Test Matrix Quản Lý Nhân Sự HRM (`05-hrm/`)

**Files:**
- Create: `frontend/tests/pages/hrm/hrm-dashboard.page.ts`
- Create: `frontend/tests/pages/hrm/employee-directory.page.ts`
- Create: `frontend/tests/pages/hrm/leave-manager.page.ts`
- Create: `frontend/tests/pages/hrm/attendance-manager.page.ts`
- Create: `frontend/tests/pages/hrm/payroll-engine.page.ts`
- Create: `frontend/tests/e2e/05-hrm/employee-management.spec.ts`
- Create: `frontend/tests/e2e/05-hrm/org-chart-departments.spec.ts`
- Create: `frontend/tests/e2e/05-hrm/leave-request-approval.spec.ts`
- Create: `frontend/tests/e2e/05-hrm/attendance-shift-requests.spec.ts`
- Create: `frontend/tests/e2e/05-hrm/payroll-calculation-audit.spec.ts`

**Interfaces:**
- Consumes: `BasePage`, `setupHrmApiMocks`.
- Implements: Test cases `HRM-01` đến `HRM-09`.

- [ ] **Step 1: Viết các class Page Object cho HRM**
  - `employee-directory.page.ts`: `createEmployee(data)`, `searchEmployee(kw)`, `filterByDepartment(deptId)`.
  - `leave-manager.page.ts`: `createLeaveRequest(data)`, `approveLeave(id)`, `rejectLeave(id, reason)`, `getRemainingBalance()`.
  - `attendance-manager.page.ts`: `submitMissingCheckin(date, reason)`, `approveAttendanceRequest(id)`.
  - `payroll-engine.page.ts`: `generatePayroll(month, year)`, `verifyCalculations(empCode)`, `approvePayroll()`.

- [ ] **Step 2: Viết test spec `employee-management.spec.ts` & `org-chart-departments.spec.ts` (`HRM-01`, `HRM-02`, `HRM-07`)**
  - Test thêm mới nhân sự (EMP-xxx), validation trùng mã.
  - Test tìm kiếm, lọc theo phòng ban, cập nhật thông tin nhân viên.
  - Test tạo phòng ban mới và hiển thị sơ đồ tổ chức (Org Chart).

- [ ] **Step 3: Viết test spec `leave-request-approval.spec.ts` (`HRM-03`, `HRM-04`)**
  - Test nộp đơn xin nghỉ phép 2 ngày $\rightarrow$ Quản lý duyệt $\rightarrow$ Cấn trừ quỹ phép còn 10 ngày.
  - Test từ chối đơn nghỉ phép kèm lý do bắt buộc $\rightarrow$ Hoàn trả quỹ phép.

- [ ] **Step 4: Viết test spec `attendance-shift-requests.spec.ts` (`HRM-08`)**
  - Test nộp giải trình quên chấm công (`CHECKIN_MISSING`) và quản lý phê duyệt.

- [ ] **Step 5: Viết test spec `payroll-calculation-audit.spec.ts` (`HRM-05`, `HRM-06`, `HRM-09`)**
  - Test tính toán tự động Gross-to-Net: BHXH 8%, BHYT 1.5%, BHTN 1%, Thuế TNCN lũy tiến, Chi phí doanh nghiệp 21.5%.
  - Test phê duyệt bảng lương tháng từ `DRAFT` sang `APPROVED`.
  - Test phân quyền bảo mật dữ liệu lương (nhân viên chỉ xem phiếu lương của mình).

- [ ] **Step 6: Chạy kiểm thử phân hệ 05-hrm**
  Chạy lệnh: `pnpm --filter frontend exec playwright test tests/e2e/05-hrm/`
  Kỳ vọng: PASS tất cả các test case.

- [ ] **Step 7: Commit mã nguồn phân hệ 05-hrm**
  ```bash
  git add frontend/tests/pages/hrm/ frontend/tests/e2e/05-hrm/
  git commit -m "feat(test): implement POM and complete test suite for 05-hrm"
  ```

---

### Task 7: Page Objects & Test Matrix Quản Trị Hệ Thống Admin (`06-admin/`)

**Files:**
- Create: `frontend/tests/pages/admin/admin-dashboard.page.ts`
- Create: `frontend/tests/pages/admin/job-moderation.page.ts`
- Create: `frontend/tests/pages/admin/company-verify.page.ts`
- Create: `frontend/tests/pages/admin/user-rbac.page.ts`
- Create: `frontend/tests/e2e/06-admin/job-moderation-approval.spec.ts`
- Create: `frontend/tests/e2e/06-admin/company-verification.spec.ts`
- Create: `frontend/tests/e2e/06-admin/user-governance-rbac.spec.ts`
- Create: `frontend/tests/e2e/06-admin/system-taxonomies-config.spec.ts`
- Create: `frontend/tests/e2e/06-admin/audit-logs-inspection.spec.ts`

**Interfaces:**
- Consumes: `BasePage`, `setupAdminApiMocks`.
- Implements: Test cases `ADM-01` đến `ADM-07`.

- [ ] **Step 1: Viết các class Page Object cho Admin**
  - `job-moderation.page.ts`: `approveJob(jobId)`, `rejectJob(jobId, reason)`, `batchApprove(jobIds)`.
  - `company-verify.page.ts`: `viewLicenseFile(companyId)`, `verifyCompany(companyId)`.
  - `user-rbac.page.ts`: `toggleUserStatus(userId)`, `changeRole(userId, newRole)`.

- [ ] **Step 2: Viết test spec `job-moderation-approval.spec.ts` (`ADM-01`, `ADM-02`)**
  - Test phê duyệt tin tuyển dụng chờ duyệt $\rightarrow$ Trạng thái `APPROVED`, xuất hiện trên cổng tìm việc.
  - Test từ chối tin tuyển dụng có nội dung vi phạm kèm lý do.
  - Test duyệt hàng loạt (Batch approval).

- [ ] **Step 3: Viết test spec `company-verification.spec.ts` (`ADM-03`)**
  - Test xem file Giấy phép kinh doanh GPKD và duyệt cấp Tích xanh xác thực (Verified Badge).

- [ ] **Step 4: Viết test spec `user-governance-rbac.spec.ts` (`ADM-04`, `ADM-07`)**
  - Test khóa tài khoản vi phạm và thu hồi phiên đăng nhập tức thời.
  - Test bảo vệ route quản trị chặn người dùng không có quyền admin.

- [ ] **Step 5: Viết test spec `system-taxonomies-config.spec.ts` & `audit-logs-inspection.spec.ts` (`ADM-05`, `ADM-06`)**
  - Test thêm danh mục ngành nghề mới hiển thị ngay trên bộ lọc tìm việc.
  - Test nhật ký kiểm toán (Audit Logs) ghi nhận chính xác hành động, tên admin, thời gian và địa chỉ IP.

- [ ] **Step 6: Chạy kiểm thử phân hệ 06-admin**
  Chạy lệnh: `pnpm --filter frontend exec playwright test tests/e2e/06-admin/`
  Kỳ vọng: PASS tất cả các test case.

- [ ] **Step 7: Commit mã nguồn phân hệ 06-admin**
  ```bash
  git add frontend/tests/pages/admin/ frontend/tests/e2e/06-admin/
  git commit -m "feat(test): implement POM and complete test suite for 06-admin"
  ```

---

### Task 8: Luồng Tích Hợp Toàn Trình Live & Tự Động Hóa CI/CD (`07-cross-portal-live/`)

**Files:**
- Create: `frontend/tests/e2e/07-cross-portal-live/full-recruitment-lifecycle.spec.ts`
- Create: `.github/workflows/playwright-e2e.yml`

**Interfaces:**
- Consumes: Toàn bộ Page Objects từ Task 1 đến Task 7.
- Implements: Kịch bản liên thông 7 bước `LIVE-01`.

- [ ] **Step 1: Viết test spec liên thông toàn trình `full-recruitment-lifecycle.spec.ts` (`LIVE-01`)**
  Triển khai chu trình 7 bước:
  1. NTD đăng nhập tạo tin tuyển dụng "Senior AI Engineer 2026" kèm kịch bản phỏng vấn Voice AI.
  2. Admin đăng nhập phê duyệt tin tuyển dụng.
  3. Ứng viên tìm kiếm công việc và nộp file CV PDF thật.
  4. NTD nhận hồ sơ trên ATS Kanban, chuyển trạng thái và gửi lời mời phỏng vấn AI.
  5. Ứng viên mở phòng phỏng vấn, vượt qua preflight check, trả lời 3 câu hỏi với AI AILA.
  6. NTD xem bảng điểm AI Scorecard, đánh giá trúng tuyển.
  7. NTD bấm "Chuyển sang HRM" tự động tạo hồ sơ nhân viên mới trong HRM.

- [ ] **Step 2: Viết GitHub Actions CI Workflow `.github/workflows/playwright-e2e.yml`**
  Cấu hình:
  - Job 1: `fast-mocked-e2e` chạy song song 4 workers cho toàn bộ `tests/e2e/01-auth/` đến `06-admin/` trên mọi Pull Request.
  - Job 2: `live-fullstack-e2e` chạy với Docker Compose stack cho `tests/e2e/07-cross-portal-live/` định kỳ Nightly.
  - Tự động lưu Playwright HTML Report và Trace khi test thất bại.

- [ ] **Step 3: Chạy toàn bộ ma trận kiểm thử E2E Playwright**
  Chạy lệnh: `pnpm --filter frontend exec playwright test tests/e2e/01-auth tests/e2e/02-candidate tests/e2e/03-employer tests/e2e/04-voice-ai tests/e2e/05-hrm tests/e2e/06-admin --workers=4`
  Kỳ vọng: Toàn bộ test suite vượt qua (PASS 100%).

- [ ] **Step 4: Commit mã nguồn luồng toàn trình và CI workflow**
  ```bash
  git add frontend/tests/e2e/07-cross-portal-live/ .github/workflows/playwright-e2e.yml
  git commit -m "feat(ci): add live cross-portal lifecycle e2e spec and github actions pipeline"
  ```
