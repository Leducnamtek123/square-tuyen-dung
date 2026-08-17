# Implementation Plan: Sửa lỗi & Chuẩn hóa Toàn diện Giao diện NTD, Ứng viên và Admin

## Overview
Dự án nhằm khắc phục toàn diện các lỗi UI/UX, bất hợp lý trong layout, màu sắc, font chữ và vi tương tác trên cả 3 phân hệ chính của hệ thống InfoHR: **Nhà tuyển dụng (NTD)**, **Ứng viên (Candidate)** và **Quản trị viên (Admin)** theo bộ quy chuẩn cao cấp **Design Taste Frontend v1**.

## Phase 1: Phân hệ Nhà Tuyển Dụng (NTD)
- [ ] Task 1.1: Fix Toast Container Offset & Header Collision (`frontend/src/app/ClientAppRoot.tsx`)
- [ ] Task 1.2: Fix Sidebar Text Truncation & Menu Localization Clarity (`frontend/src/i18n/locales/vi/employer.json`, `frontend/src/layouts/components/employers/Sidebar/EmployerMenu.tsx`)
- [ ] Task 1.3: Neutralize Form Labels & Nâng cấp Giao diện Hồ sơ công ty (`frontend/src/views/components/employers/CompanyForm/CompanyFormFields.tsx`, `frontend/src/views/components/employers/CompanyCard/index.tsx`)
- [ ] Task 1.4: Tái cấu trúc Bento Grid 5 biểu đồ Dashboard (`frontend/src/views/employerPages/DashboardPage/index.tsx`)
- [ ] Task 1.5: Fix Grid lãng phí 60% & CSS Text Gradient Bug (`frontend/src/views/employerPages/SettingPage/index.tsx`, `frontend/src/views/employerPages/AccountPage/index.tsx`)

## Phase 2: Phân hệ Ứng Viên & Phòng Phỏng Vấn (Candidate)
- [ ] Task 2.1: Sửa Icon mục "Chứng chỉ" trong CV Builder (`frontend/src/views/jobSeekerPages/OnlineProfilePage/index.tsx`)
- [ ] Task 2.2: Bổ sung ScrollSpy IntersectionObserver cho Attached Profile (`frontend/src/views/jobSeekerPages/AttachedProfilePage/index.tsx`)
- [ ] Task 2.3: Nâng cấp UX hướng dẫn cấp quyền Mic/Cam tại Preflight Room (`frontend/src/views/interviewPages/PreflightRoom.tsx`)

## Phase 3: Phân hệ Quản Trị Viên (Admin)
- [ ] Task 3.1: Tinh gọn Submenu Tuyển dụng & Dọn dẹp prop icon thừa (`frontend/src/layouts/components/employers/Sidebar/AdminMenu.tsx`)
- [ ] Task 3.2: Thêm Sticky Header cho bảng Audit Logs & Trust Reports (`frontend/src/views/adminPages/AuditLogsPage`, `frontend/src/views/adminPages/TrustReportsPage`)

## Phase 4: Toàn diện Kiểm thử & Quality Gate Verification
- [ ] Task 4.1: Chạy build verification `npm run build`
