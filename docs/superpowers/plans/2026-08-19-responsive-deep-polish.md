# Kế Hoạch Triển Khai: Tinh Chỉnh Responsive Chuyên Sâu Frontend (Giai Đoạn 2)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tối ưu hóa triệt để trải nghiệm responsive trên các màn hình nhỏ (iPhone SE 320px, 375px) và mobile/tablet cho: Phòng chờ phỏng vấn PreflightRoom, Header trang chi tiết công ty, và thanh tiến trình Onboarding (Candidate & Employer Stepper).

**Architecture:** Áp dụng nguyên lý Responsive Craft: Intrinsic flex/stack wrapping, ẩn các khối không khả dụng trên mobile (QR code scanner), co giãn kích thước nút bấm và nhãn chữ linh hoạt theo viewport.

**Tech Stack:** Next.js 16, React 19, MUI v6 (@mui/material), Tailwind CSS v4, TypeScript.

---

### Task 1: Phòng Chờ Phỏng Vấn (PreflightRoom Action Buttons)

**Files:**
- Modify: `frontend/src/views/interviewPages/PreflightRoom.tsx:415-460`

**Interfaces:**
- Input: `onCancel`, `onJoin`, `starting`, `state.stream`, `state.error`
- Layout: Cụm nút hành động "Hủy bỏ" (`minWidth: 120px`) và "Tham gia phỏng vấn" (`minWidth: 180px`).

- [ ] **Step 1: Cập nhật Stack direction & button width**
Chuyển `<Stack direction="row" spacing={2} justifyContent="center">` thành:
```tsx
<Stack
  direction={{ xs: 'column-reverse', sm: 'row' }}
  spacing={1.5}
  justifyContent="center"
  alignItems="center"
  sx={{ pt: 1, width: '100%' }}
>
  <Button
    onClick={onCancel}
    disabled={starting}
    sx={{
      width: { xs: '100%', sm: 'auto' },
      minWidth: { xs: '100%', sm: '120px' },
      ...
    }}
  >
    {t('common:actions.cancel')}
  </Button>
  <Button
    onClick={onJoin}
    disabled={starting || !state.stream || !!state.error}
    sx={{
      width: { xs: '100%', sm: 'auto' },
      minWidth: { xs: '100%', sm: '180px' },
      ...
    }}
  >
    {t('liveRoom.join')}
  </Button>
</Stack>
```

- [ ] **Step 2: Kiểm tra TypeScript typecheck**
Run: `npm run typecheck --prefix frontend`
Expected: PASS

---

### Task 2: Header Chi Tiết Công Ty (CompanyHeader Responsive Polish)

**Files:**
- Modify: `frontend/src/views/defaultPages/CompanyDetailPage/CompanyHeader.tsx:130-175`

**Interfaces:**
- Input: `companyDetail`, `isAuthenticated`, `currentUser`, `handleFollow`, `setOpenSharePopup`, `setOpenReportPopup`

- [ ] **Step 1: Ẩn QR Code trên thiết bị di động & co giãn cụm nút**
```tsx
{/* QR Code chỉ hiển thị trên Desktop để người dùng dùng điện thoại quét */}
<Box sx={{ pt: 1, display: { xs: 'none', md: 'block' } }}>
  <QRCodeBox value={(typeof window !== 'undefined' ? window.location.href : '') || "-"} size={80} label={t("companyDetail.shareWithQr")} />
</Box>

{/* Cụm nút hành động co giãn theo màn hình */}
<Stack
  direction={{ xs: "row", sm: "row", md: "column" }}
  spacing={1.5}
  justifyContent="center"
  sx={{ width: { xs: '100%', md: 'auto' }, flexWrap: 'wrap' }}
>
  ...
</Stack>
```

- [ ] **Step 2: Kiểm tra TypeScript typecheck**
Run: `npm run typecheck --prefix frontend`
Expected: PASS

---

### Task 3: Thanh Tiến Trình Onboarding (Candidate & Employer Stepper)

**Files:**
- Modify: `frontend/src/views/onboardingPages/CandidateOnboardingPage/components/CandidateStepper.tsx:85-135`
- Modify: `frontend/src/views/onboardingPages/EmployerOnboardingPage/components/EmployerStepper.tsx:85-135`

**Interfaces:**
- Input: `activeStep`, `totalSteps`, `steps`

- [ ] **Step 1: Cập nhật CandidateStepper minWidth và text label hiển thị thông minh**
```tsx
<Stack
  key={stepLabel}
  alignItems="center"
  spacing={1}
  sx={{ zIndex: 1, minWidth: { xs: 48, sm: 80 }, cursor: 'default' }}
>
  ...
  <Typography
    variant="caption"
    sx={{
      fontWeight: isActive ? 700 : 500,
      color: isActive ? '#0F172A' : isCompleted ? '#10B981' : '#64748B',
      textAlign: 'center',
      maxWidth: { xs: 70, sm: 120 },
      lineHeight: 1.2,
      fontSize: { xs: '0.72rem', sm: '0.8125rem' },
      display: { xs: isActive ? 'block' : 'none', sm: 'block' },
    }}
  >
    {stepLabel}
  </Typography>
</Stack>
```

- [ ] **Step 2: Cập nhật tương tự cho EmployerStepper**
Áp dụng `minWidth: { xs: 48, sm: 80 }` và `display: { xs: isActive ? 'block' : 'none', sm: 'block' }`.

- [ ] **Step 3: Kiểm tra TypeScript typecheck**
Run: `npm run typecheck --prefix frontend`
Expected: PASS

---

### Task 4: Kiểm Thử Toàn Diện (Full Verification)

- [ ] **Step 1: Chạy typecheck toàn hệ thống**
Run: `npm run typecheck --prefix frontend`
Expected: Exit code 0 (100% sạch lỗi)
