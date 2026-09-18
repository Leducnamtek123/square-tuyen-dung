# Implementation Plan: Auth UI Micro-Refinements & Pixel-Perfect Polish

## Overview
Tiếp tục hoàn thiện bộ trang Xác thực (Authentication) cho cả Nhà tuyển dụng (Employer) và Người tìm việc (Job Seeker) lên mức độ hoàn hảo 10/10 (Pixel-Perfect) dựa trên phản hồi thực tế từ bản build Docker.

---

## 📋 Task List

### Phase 1: Form & Input Polish (Độ ưu tiên: Cao)

#### Task 1: Fix màu nền Autofill của trình duyệt (Chrome/Safari Autofill)
**Description:** Ngăn chặn trình duyệt tự động đè màu nền xanh nhạt (`#E8F0FE`) lên các trường nhập liệu khi user chọn tài khoản lưu sẵn.
**Acceptance criteria:**
- [ ] Khi autofill tài khoản/mật khẩu, màu nền của input vẫn duy trì màu xám nhạt tự nhiên (`#F8FAFC`) và chữ màu xám đậm (`#0F172A`).
- [ ] Áp dụng đồng bộ cho cả Employer Login/Register và Candidate Login/Register.
**Files touched:**
- `src/components/Common/Controls/TextFieldCustom/index.tsx`
- `src/components/Common/Controls/PasswordTextFieldCustom/index.tsx`
- `src/views/components/auths/EmployerLoginForm/index.tsx`
- `src/views/components/auths/JobSeekerLoginForm/index.tsx`
**Verification:**
- Kiểm tra bằng mắt trên trình duyệt khi autofill thông tin đăng nhập.

---

### Phase 2: Layout & Visual Balance (Độ ưu tiên: Cao)

#### Task 2: Cân bằng chiều cao 2 cột trên Desktop (Equal Height Alignment)
**Description:** Trên màn hình Desktop (md+), đồng bộ chiều cao Card form bên trái và Showcase Panel bên phải để 2 cột có độ dài cân xứng, không bị lệch tỷ lệ.
**Acceptance criteria:**
- [ ] Grid container sử dụng `alignItems: 'stretch'`.
- [ ] Card form bên trái tự động co giãn chiều cao theo Showcase Panel bên phải với padding và khoảng cách phân bố đều đặn (`justifyContent: 'space-between'`).
**Files touched:**
- `src/views/authPages/EmployerLogin/index.tsx`
- `src/views/authPages/JobSeekerLogin/JobSeekerLoginView.tsx`
**Verification:**
- Mở trang `/employer/login` và `/login` trên desktop kiểm tra 2 cột có đường biên đáy thẳng hàng hoàn hảo.

---

### Phase 3: UX & Navigation (Độ ưu tiên: Trung bình)

#### Task 3: Bổ sung liên kết điều hướng thông minh giữa 2 phân hệ (Cross-Portal Navigation)
**Description:** Thêm liên kết tinh tế ở đầu hoặc cuối form giúp người dùng lỡ vào nhầm trang có thể chuyển đổi nhanh giữa Cổng Nhà tuyển dụng và Cổng Ứng viên.
**Acceptance criteria:**
- [ ] Trên trang Ứng viên: Hiển thị dòng chữ nhỏ *"Bạn là Nhà tuyển dụng? Đăng nhập cổng Doanh nghiệp"* kèm link sang `/employer/login`.
- [ ] Trên trang Nhà tuyển dụng: Hiển thị *"Bạn là Người tìm việc? Tìm việc làm ngay"* kèm link sang `/login`.
**Files touched:**
- `src/views/authPages/EmployerLogin/index.tsx`
- `src/views/authPages/EmployerSignUp/index.tsx`
- `src/views/authPages/JobSeekerLogin/JobSeekerLoginView.tsx`
- `src/views/authPages/JobSeekerSignUp/JobSeekerSignUpView.tsx`
**Verification:**
- Click thử liên kết để đảm bảo chuyển hướng chính xác đến đúng trang auth tương ứng.

---

## 🧪 Verification & Checkpoints
- [ ] Chạy Jest test suite: `npm test -- src/views/authPages/__tests__/EmployerLoginRoutes.test.ts`
- [ ] Chạy TypeScript typecheck: `npm run typecheck`
- [ ] Rebuild và verify trên Docker.
