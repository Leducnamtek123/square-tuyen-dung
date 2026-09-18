# Báo Cáo Audit Frontend - Giai Đoạn 1: Static Analysis & Code Health

**Dự án:** `project-web-app` (Square Tuyển Dụng Frontend)  
**Công nghệ chính:** Next.js 16.2.6 (App Router) + React 19.2.4 + TypeScript 5.9.2 + MUI v6.1.1 + Tailwind CSS v4.2.1  
**Ngày thực hiện:** 30/08/2026  
**Trạng thái:** Hoàn thành quét giai đoạn 1  

---

## 1. Tổng quan Sức khỏe Codebase (Health Scorecard)

| Hạng mục kiểm tra | Công cụ | Trạng thái | Chi tiết |
| :--- | :--- | :---: | :--- |
| **TypeScript Typecheck** | `tsc --noEmit` |  **PASS (100%)** | 0 lỗi biên dịch nghiêm trọng (Strict Mode enabled). |
| **Linting & React Rules** | `eslint 9.31` |  **WARN (138 cảnh báo)** | 0 Error, 138 Warnings (Hooks missing deps, React 19 / MUI deprecations). |
| **Dead Code / File mồ côi** | `knip 6.33` |  **CẦN DỌN DẸP** | 35 unused files, 76 unused exports. |
| **Dependencies Health** | `knip` + `package.json` |  **CẦN DỌN DẸP** | 14 packages thừa, 4 packages thiếu khai báo trực tiếp (unlisted). |
| **Đa ngôn ngữ (i18n)** | `audit_i18n.cjs` |  **PASS (100%)** | 1268 files, 4119 calls, 0 missing keys EN/VI parity. |

---

## 2. Phân Tích Chi Tiết & Phân Loại Mức Độ

###  Mức độ Nghiêm Trọng / Rủi ro Runtime (Critical / High)

#### A. Lỗi `react-hooks/exhaustive-deps` (Nguy cơ stale closure & memory leak)
Một số hook quan trọng bị thiếu dependency array, dẫn đến việc dùng dữ liệu cũ (stale state) hoặc re-render vô tận / không kích hoạt cập nhật khi state thay đổi:

1. **`src/components/Common/LocationPicker/LocationPickerContent.tsx:248`**:
   - `useEffect` thiếu `address` và `position`.
   - *Rủi ro:* Bản đồ định vị không cập nhật lại khi người dùng thay đổi địa chỉ hoặc tọa độ GPS.
2. **`src/layouts/JobSeekerLayout/index.tsx:110`**:
   - `useEffect` thiếu `pathname`.
   - *Rủi ro:* Layout không phản hồi đúng khi chuyển trang trên layout ứng viên.
3. **`src/views/adminPages/JobsPage/index.tsx:290`**:
   - `useMemo` thiếu `handleOpenApprove` và `handleOpenReject`.
   - *Rủi ro:* Action buttons trong bảng quản trị tin tuyển dụng có thể gọi nhầm closure cũ.
4. **`src/views/adminPages/VoiceProfilesPage/index.tsx:413`**:
   - `useCallback` thiếu `getProfileReadyFlag`.
5. **`src/views/components/employers/AIAnalysisDrawer/index.tsx:273`**:
   - `useEffect` thiếu `i18n.language`.
   - *Rủi ro:* Drawer phân tích ứng viên bằng AI không tự động dịch lại khi chuyển ngôn ngữ.
6. **`src/components/agents-ui/react-shader-toy.tsx:924`**:
   - `useEffect` thiếu `mouseMove` và `onResize`.

#### B. Thư viện chưa khai báo trong `package.json` (Unlisted Dependencies)
Code đang import trực tiếp nhưng các package này chỉ có sẵn nhờ hoisting của package khác (nguy cơ lỗi build khi deploy trên CI/CD Docker):
1. `@mui/utils` (dùng trong `DataTableCustom/index.tsx`)
2. `mui-file-dropzone` (dùng trong `DropzoneDialogCustom/index.tsx`)
3. `@emotion/cache` (dùng trong `EmotionCache.tsx`)
4. `@livekit/components-core` (dùng trong `useInterviewMessages.ts`)

#### C. Lỗi Test Import hỏng (Unresolved Import)
- `src/redux/__tests__/slices.test.ts:24`: Import `../types/models` không tồn tại, khiến test suite có thể bị fail khi chạy `npm test`.

---

### ⚠️ Mức độ Trung bình (Medium - Chuẩn bị tương thích tương lai)

#### A. Cú pháp Event Deprecated trong React 19
Trong `@types/react` v19, `FormEvent` dạng generic event không tồn tại độc lập mà yêu cầu dùng sự kiện cụ thể:
- Thay `FormEvent` bằng `ChangeEvent<HTMLInputElement>`, `SubmitEvent`, hoặc `SyntheticEvent`.
- **Vị trí ảnh hưởng:**
  - `src/views/components/chats/ChatWindow/ChatWindowComposer.tsx`
  - `src/views/components/chats/ChatWindow/index.tsx`
  - `src/views/interviewPages/AIInterviewLayout.tsx`
  - `src/components/Features/VoiceAssistant/components/livekit/agent-control-bar/chat-input.tsx`
  - `src/views/employerPages/VerificationPage/index.tsx`
  - `src/views/defaultPages/StaticInfoPage/index.tsx`

#### B. Cú pháp Props Deprecated trong MUI v6 (Sẽ bị xoá ở MUI v7)
Hơn 120 vị trí trong code đang dùng cú pháp props cũ của MUI v5/v6 thay vì `slotProps`:
- `PaperProps` ➔ `slotProps.paper` (gặp ở Dialog, Drawer, Menu, Popover)
- `InputProps` / `inputProps` ➔ `slotProps.input` / `slotProps.htmlInput` (gặp ở TextField, Autocomplete)
- `primaryTypographyProps` ➔ `slotProps.primary` (gặp ở ListItemText)
- `backIconButtonProps` / `nextIconButtonProps` ➔ `slotProps.actions.previousButton` / `nextButton` (gặp ở TablePagination)

---

### 🧹 Mức độ Thấp / Tối ưu Dọn dẹp (Low - Code Cleanup)

#### A. 14 Packages thừa (Unused Dependencies) làm nặng `node_modules` và Docker Image
Các package này có trong `package.json` nhưng không được import ở bất kỳ đâu trong `src/`:
1. `@fontsource-variable/geist`
2. `@goongmaps/goong-map-react` (đã chuyển sang Leaflet / OpenStreetMap)
3. `@livekit/components-styles`
4. `@mui/base` (đã chuyển sang Radix UI / MUI Core)
5. `@testing-library/react` & `@testing-library/user-event` (trong dependencies runtime)
6. `@tippyjs/react`
7. `ai` (Vercel AI SDK thừa nếu dùng LiveKit/Axios)
8. `react-color`
9. `react-geolocated`
10. `react-to-print`
11. `reactjs-social-login`
12. `tw-animate-css`
13. `use-stick-to-bottom`

#### B. 35 Files code mồ côi (Unused Files)
Bao gồm các form cũ của CV Builder (`EducationForm.tsx`, `ExperienceForm.tsx`, `PersonalInfoForm.tsx`, `SkillsForm.tsx`), các Dashboard Cards cũ không còn route trỏ tới (`CandidateCVCard.tsx`, `CandidateHeroCard.tsx`, `TabBar/index.tsx`, `SubHeader/index.tsx`).

---

## 3. Danh Sách Đề Xuất Khắc Phục (Action Items)

| Ưu tiên | Hạng mục | Giải pháp |
| :---: | :--- | :--- |
| **P1** | **Fix React Hook Dependencies** | Bổ sung các biến phụ thuộc còn thiếu hoặc bọc `useCallback` phù hợp cho 6 vị trí hook. |
| **P1** | **Bổ sung Unlisted Packages** | Cài đặt rõ ràng `@mui/utils`, `@emotion/cache`, `mui-file-dropzone`, `@livekit/components-core` vào `package.json`. |
| **P1** | **Sửa import hỏng trong Test** | Cập nhật đường dẫn model trong `src/redux/__tests__/slices.test.ts`. |
| **P2** | **Loại bỏ 14 Packages thừa** | Chạy `npm uninstall` cho các package không sử dụng để giảm bundle & thời gian build. |
| **P2** | **Xóa 35 Unused Files** | Dọn dẹp các component mồ côi đã có phiên bản thay thế mới. |
| **P3** | **Chuẩn hóa React 19 & MUI v7 `slotProps`** | Chuyển đổi dần `PaperProps`/`InputProps` sang `slotProps.*` và đổi `FormEvent` sang `SyntheticEvent`/`SubmitEvent`. |
