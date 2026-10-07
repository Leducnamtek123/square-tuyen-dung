# Thu Vien Thanh Phan Giao Dien (UI Component Library)

> **Phan he**: 07-design  
> **Tai lieu**: components.md  
> **Thu vien**: Radix UI, Shadcn UI, Phosphor Icons, FontAwesome

---

## 1. Cac Thanh Phan Co Ban (Basic Primitives)

### 1.1. Buttons (`components/ui/button.tsx`)
- **Bien the (Variants)**:
  - `default`: Mau cam Square Orange (`bg-primary text-white hover:bg-primary/90`)
  - `secondary`: Mau xam trung tinh (`bg-slate-100 text-slate-900 hover:bg-slate-200`)
  - `outline`: Vien mong (`border border-slate-300 hover:bg-slate-50`)
  - `ghost`: Trong suot (`hover:bg-slate-100`)
  - `destructive`: Mau do canh bao nguy hiem (`bg-red-600 text-white hover:bg-red-700`)
- **Kich thuoc (Sizes)**: `sm` (32px), `default` (40px), `lg` (48px), `icon` (40x40px).

### 1.2. Input & Textarea (`components/ui/input.tsx`)
- Ho tro hien thi icon o dau (Leading Icon) hoac cuoi (Trailing Icon / Password Eye toggle).
- Border mau `border-slate-300`, chuyen sang `ring-2 ring-primary border-primary` khi duoc focus.
- Hien thi vien do `border-red-500` khi co loi validation.

---

## 2. Cac Thanh Phan Nghiep Vu Phu Hop Dac Thu (Domain Widgets)

### 2.1. Bang Dieu Khien ATS Kanban (`views/employerPages/CandidateKanban/`)
- Keo tha ung vien muot ma bang thu vien `@hello-pangea/dnd`.
- 6 cot trang thai voi mau badge dinh danh:
  - `Applied`: Xam
  - `Screening`: Xanh duong nhat
  - `AI Interview`: Cam Square
  - `Offered`: Tim nhe
  - `Hired`: Xanh la cay (Success)
  - `Rejected`: Do nhe (Muted Red)
- The ung vien hien thi: Avatar, Ten ung vien, Vi tri ung tuyen, Diem AI Scorecard, Ngay nop va nut hanh dong nhanh.

### 2.2. Bang Du Lieu Quan Tri (`components/Common/AdminDataGrid/`)
- Ho tro sap xep theo cot (Sort by column), loc nhanh (Quick filter), chon hang loat (Batch selection), va phan trang tu dong.
- Co toolbar xuat file Excel va nut hanh dong theo lo.

### 2.3. Khung Phong Van Voice AI (`views/interviewPages/`)
- Hien thi khung video avatar Talking-Head o trung tam.
- Song am thanh (Audio Waveform Visualizer) the hien muc am luong thoi gian thuc cua ung vien va AI.
- Nut thao tac: Bat/tat micro, Bat/tat camera, Xem transcript tro chuyen, Ket thuc cuoc phong van.
