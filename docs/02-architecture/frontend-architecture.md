# Kien Truc Frontend (Next.js 16 App Router & React 19)

> **Phan he**: 02-architecture  
> **Tai lieu**: frontend-architecture.md  
> **Tech Stack**: Next.js 16, React 19, Tailwind CSS v4, TypeScript 5, TanStack Query v5, Redux Toolkit, Shadcn UI

---

## 1. Cau Truc Thu Muc Tong The

Frontend duoc to chuc theo mo hinh **Next.js 16 App Router** voi su ho tro cua Route Groups va Middleware de phuc vu dong thoi ca 5 cong dich vu tren cung mot ung dung duy nhat:

```text
frontend/src/
├── app/                  # App Router: Dinh tuyen URL, Layouts va Pages
│   ├── (job-seeker)/     # Route group cho Cong Ung vien (infohr.vn)
│   ├── employer/         # Route group cho Cong Doanh nghiep (employer.infohr.vn)
│   ├── admin/            # Route group cho Cong Quan tri vien (admin.infohr.vn)
│   ├── interview/        # Route group cho Phong phong van Voice AI (aila.infohr.vn)
│   └── api/              # Next.js Route Handlers (BFF / Proxy endpoints)
├── components/           # UI Components tai su dung
│   ├── ui/               # Shadcn UI primitives (Button, Dialog, Dropdown, Table, Input)
│   └── Common/           # Cac widget dung chung (AdminDataGrid, FileUploader, Navbar)
├── views/                # Domain Composite Views (Man hinh nghiep vu lon)
│   ├── hrmPages/         # Cac trang Native HRM (Dashboard, Timesheet, Payroll, OrgChart)
│   ├── employerPages/    # Cac trang ATS Kanban, Danh sach ung vien, Kich ban phong van
│   ├── candidatePages/   # Trang tim viec, ho so, chi tiet cong viec
│   └── interviewPages/   # Man hinh phong van LiveKit WebRTC va phong tap luyen
├── hooks/                # Custom React Hooks (useAuth, useWebRTC, useLiveKitRoom)
├── services/             # API client functions (Axios / Fetch call toi DRF Backend)
├── redux/                # Redux Toolkit Slices & Store (Trang thai session toan cuc)
├── types/                # Dinh nghia kieu TypeScript dong bo voi Backend Serializers
└── utils/                # Cac tien ich xu ly ngay thang, format tien te, helper ham
```

---

## 2. Phan Dinh Ranh Gioi Server vs. Client Components

Next.js 16 mac dinh xem tat ca cac component trong thu muc `app/` la **React Server Components (RSC)**. Chung ta ap dung nguyen tac:

> **Nguyen tac**: Giu Server Components o cap cao nhat (Layouts, Pages) de fetch data truc tiep tu backend va day `'use client'` xuong tan cung nhanh la (Leaf components) can tuong tac.

- **Server Components (Default)**:
  - Lay du lieu ban dau (Initial Data Fetching) voi toc do cao va cache cap do server.
  - Render SEO metadata, schema markup cho trang tim viec va chi tiet tin dang.
  - Giam toi da kich thuoc file JavaScript gui xuong trinh duyet nguoi dung.
- **Client Components (`'use client'`)**:
  - Cac thanh phan can tuong tac DOM, su kien chuot/ban phim (`onClick`, `onChange`).
  - Su dung hooks cua React (`useState`, `useEffect`, `useReducer`, `useRef`).
  - Ket noi WebRTC (LiveKit Room, micro, camera, audio stream visualizer).
  - Bang keo tha Kanban ATS (`@hello-pangea/dnd`).

---

## 3. Mo Hinh Quan Ly Trang Thai 3 Tang (3-Tier State Management)

```text
┌────────────────────────────────────────────────────────┐
│ 1. URL State (Search Params & Path Segments)           │
│    - Du lieu tim kiem, so trang, tab dang chon, bo loc │
├────────────────────────────────────────────────────────┤
│ 2. Server Cache State (TanStack Query v5)              │
│    - Du lieu REST API, optimistic update, cache invalid│
├────────────────────────────────────────────────────────┤
│ 3. Global Volatile State (Redux Toolkit)               │
│    - Thong tin phien dang nhap, token WebRTC, audio/mic│
└────────────────────────────────────────────────────────┘
```

1. **URL State**: Cac thong tin can giu lai khi F5 hoac chia se duong link (vi du: `?page=2&province=HaNoi&salary_min=15000000`) bat buoc duoc luu tren URL thong qua `useSearchParams` va `useRouter`.
2. **TanStack Query v5**: Quan ly toan bo du lieu den tu Backend DRF. Khong tu y chep du lieu tu API vao Redux store neu chi de hien thi danh sach. Su dung `queryClient.invalidateQueries()` khi co dot bien du lieu.
3. **Redux Toolkit**: Chi luu tru trang thai phien lam viec thoi gian thuc khong nam tren URL: Phien phong van dang ket noi, trang thai bat/tat micro cua ung vien, telemetry luong am thanh WebRTC.
