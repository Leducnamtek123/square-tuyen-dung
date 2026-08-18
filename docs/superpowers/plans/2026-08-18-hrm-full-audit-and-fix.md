# Kế hoạch Thực hiện: Kiểm tra Toàn diện & Hoàn thiện Phân hệ HRM (Full Audit & Hardening)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Quét sạch toàn bộ các nguyên nhân gây trắng trang/runtime crash, hoàn thiện 100% CRUD và tối ưu UI/UX cho toàn bộ 7 module Quản lý Nhân sự (HRM).

**Architecture:** Sử dụng TanStack Query cho data fetching/cache invalidation, React ErrorBoundary & Defensive Null Safety trên toàn bộ UI components, cùng RESTful ModelViewSet multi-tenant ở backend Django.

**Tech Stack:** Next.js 16 (Turbopack, App Router), Material UI v6, TanStack Query v5, Django REST Framework, Docker Compose.

---

### Task 1: Khắc phục triệt để lỗi Blank Screen tại OrgChartPage & Nâng cấp Tree Visualization
**Files:**
- Modify: `frontend/src/views/hrmPages/OrgChartPage/index.tsx`
- Modify: `api/apps/hrm/views.py:200-240`

- [ ] **Step 1:** Thêm optional chaining an toàn (`node?.name?.charAt(0) || 'D'`) và kiểm tra dữ liệu null tại `OrgChartPage/index.tsx`.
- [ ] **Step 2:** Thêm nút Tạo phòng ban mới trực tiếp khi cây rỗng và bọc ErrorBoundary để luôn hiển thị giao diện đẹp.
- [ ] **Step 3:** Nâng cấp backend `org_chart` endpoint để xử lý trường hợp phòng ban không có parent rõ ràng.

### Task 2: Quét & Tăng cường Null Safety cho HrmDashboardPage & EmployeeListPage
**Files:**
- Modify: `frontend/src/views/hrmPages/HrmDashboardPage/index.tsx`
- Modify: `frontend/src/views/hrmPages/EmployeeListPage/index.tsx`

- [ ] **Step 1:** Kiểm tra và bọc an toàn toàn bộ các vị trí gọi string/array methods (`charAt`, `map`, `filter`, `slice`).
- [ ] **Step 2:** Đảm bảo tất cả modal/drawer mở và đóng mượt mà, không giật lag.

### Task 3: Quét & Hoàn thiện DepartmentListPage, ContractListPage, LeaveListPage, OnboardingPage
**Files:**
- Modify: `frontend/src/views/hrmPages/DepartmentListPage/index.tsx`
- Modify: `frontend/src/views/hrmPages/ContractListPage/index.tsx`
- Modify: `frontend/src/views/hrmPages/LeaveListPage/index.tsx`
- Modify: `frontend/src/views/hrmPages/OnboardingPage/index.tsx`

- [ ] **Step 1:** Kiểm tra toàn bộ các form nhập liệu, select options và bảng dữ liệu.
- [ ] **Step 2:** Xác minh các hành động CRUD (Thêm, Sửa, Xóa) phản hồi tức thì qua TanStack Query invalidation.

### Task 4: Kiểm tra Biên dịch & Rebuild Docker Container
**Files:**
- Command: `npm run build`
- Command: `docker compose up --build -d backend frontend`

- [ ] **Step 1:** Chạy `npx tsc --noEmit` và `npm run build` để đảm bảo 0 lỗi biên dịch.
- [ ] **Step 2:** Rebuild Docker container và xác nhận toàn bộ trang chạy hoàn hảo trên trình duyệt.
