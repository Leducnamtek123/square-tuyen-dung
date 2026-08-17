# Tasks: Sửa lỗi & Chuẩn hóa Giao diện 3 Cổng InfoHR

## Phase 1: Nhà Tuyển Dụng (Employer Portal)
- [x] **Task 1.1**: Fix Toast Container Offset & Header Collision (`frontend/src/app/ClientAppRoot.tsx`)
- [x] **Task 1.2**: Fix Sidebar Text Truncation & Menu Localization Clarity (`frontend/src/i18n/locales/vi/employer.json`, `frontend/src/layouts/components/employers/Sidebar/EmployerMenu.tsx`)
- [x] **Task 1.3**: Neutralize Form Labels & Nâng cấp Giao diện Hồ sơ công ty (`frontend/src/views/components/employers/CompanyForm/CompanyFormFields.tsx`, `frontend/src/views/components/employers/CompanyCard/index.tsx`)
- [x] **Task 1.4**: Tái cấu trúc Bento Grid 5 biểu đồ Dashboard (`frontend/src/views/employerPages/DashboardPage/index.tsx`)
- [x] **Task 1.5**: Fix Grid lãng phí 60% & CSS Text Gradient Bug (`frontend/src/views/employerPages/SettingPage/index.tsx`, `frontend/src/views/employerPages/AccountPage/index.tsx`)

## Phase 2: Ứng Viên & Phòng Phỏng Vấn (Candidate Portal)
- [x] **Task 2.1**: Sửa Icon mục "Chứng chỉ" trong CV Builder (`frontend/src/views/jobSeekerPages/OnlineProfilePage/index.tsx`)
- [x] **Task 2.2**: Bổ sung ScrollSpy IntersectionObserver cho Attached Profile (`frontend/src/views/jobSeekerPages/AttachedProfilePage/index.tsx`)
- [x] **Task 2.3**: Nâng cấp UX hướng dẫn cấp quyền Mic/Cam tại Preflight Room (`frontend/src/views/interviewPages/PreflightRoom.tsx`)

## Phase 3: Quản Trị Viên (Admin Portal)
- [x] **Task 3.1**: Tinh gọn Submenu Tuyển dụng & Dọn dẹp prop icon thừa (`frontend/src/layouts/components/employers/Sidebar/AdminMenu.tsx`)
- [x] **Task 3.2**: Thêm Sticky Header cho bảng Audit Logs & Trust Reports (`frontend/src/views/adminPages/AuditLogsPage`, `frontend/src/views/adminPages/TrustReportsPage`)

## Phase 4: Kiểm thử Toàn diện
- [x] **Task 4.1**: Chạy `npm run build` xác thực toàn bộ hệ thống (114/114 trang hoàn tất, Exit Code 0)
