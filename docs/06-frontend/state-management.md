# Chien Luoc Quan Ly Trang Thai (State Management)

> **Phan he**: 06-frontend  
> **Tai lieu**: state-management.md  
> **Thu vien**: TanStack Query v5, Redux Toolkit, React URL SearchParams

---

## 1. Mo Hinh 3 Tang Quan Ly Trang Thai

Frontend InfoHR ap dung nguyen tac tach bach trang thai theo ban chat cua du lieu:

```text
┌────────────────────────────────────────────────────────┐
│ 1. Trang thai URL (URL Search Params)                 │
│    - Tab hien tai, trang so may, bo loc, tu khoa tim   │
├────────────────────────────────────────────────────────┤
│ 2. Trang thai Server (TanStack Query v5)               │
│    - Danh sach ung vien, chi tiet tin dang, bang luong │
├────────────────────────────────────────────────────────┤
│ 3. Trang thai Client toan cuc (Redux Toolkit)          │
│    - Thong tin dang nhap, token WebRTC, audio stream   │
└────────────────────────────────────────────────────────┘
```

---

## 2. Huong Dan Su Dung Tung Tang

### 2.1. Tang 1: URL State (Single Source of Truth cho Giao dien)
- Tat ca cac trang thai ma nguoi dung muon **chia se duong link** hoac **giu nguyen khi tai lai trang (F5)** deu phai dua len URL.
- Vi du trong trang tim viec:
  `https://infohr.vn/jobs?q=react&province=hanoi&salary_min=15000000&page=2`
- Su dung hook cua Next.js: `useSearchParams()`, `usePathname()`, `useRouter()`.

### 2.2. Tang 2: TanStack Query v5 (Server State)
- Su dung cho toan bo cac yeu cau doc va ghi du lieu tu Backend DRF API.
- Cac quy tac su dung:
  1. Dinh nghia Query Keys co cau truc he thong (Query Key Factory):
     ```typescript
     export const jobKeys = {
       all: ['jobs'] as const,
       lists: () => [...jobKeys.all, 'list'] as const,
       list: (filters: Record<string, any>) => [...jobKeys.lists(), filters] as const,
       details: () => [...jobKeys.all, 'detail'] as const,
       detail: (id: number | string) => [...jobKeys.details(), id] as const,
     };
     ```
  2. Su dung `useMutation` cho cac thao tac tao, sua, xoa va tu dong goi `queryClient.invalidateQueries()` de cap nhat danh sach moi nhat.
  3. Ap dung Optimistic Updates cho cac hanh dong keo tha tren ATS Kanban pipeline de giao dien phan hoi lap tuc truoc khi backend phan hoi thanh cong.

### 2.3. Tang 3: Redux Toolkit (Session & WebRTC State)
- Chi luu tru nhung du lieu bien dong lien tuc (High-frequency updates) hoac phien lam viec thoi gian thuc:
  - `authSlice`: Thong tin nguoi dung hien tai, quyen han, trang thai xac thuc.
  - `roomSlice`: Trang thai phong phong van WebRTC tren LiveKit, trang thai ket noi, thong so packet loss, trang thai bat/tat micro.
  - `avatarSlice`: Trang thai phat am thanh cua avatar tro ly ao, moc thoi gian lipsync.
