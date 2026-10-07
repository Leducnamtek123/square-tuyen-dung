# Kien Truc Frontend Chi Tiet (Next.js 16 & React 19)

> **Phan he**: 06-frontend  
> **Tai lieu**: architecture.md  
> **Ecosystem**: Square Tuyen Dung (InfoHR)

---

## 1. To Chuc Thu Muc Frontend

Toan bo ma nguon frontend dat trong `frontend/src/` va duoc to chuc theo mo hinh module hoa:

```text
frontend/src/
├── app/                  # Cac route segment, pages, layouts va loading state
├── components/           # UI components dung chung
│   ├── ui/               # Radix UI + Tailwind primitives (Button, Dialog, Popover, Select, Table)
│   └── Common/           # Cac khoi giao dien ghep san (Header, Footer, AdminDataGrid)
├── views/                # Domain composite pages
│   ├── hrmPages/         # Cac view chuyen biet cho phan he HRM noi bo
│   ├── employerPages/    # Cac view cho Doanh nghiep tuyen dung
│   ├── candidatePages/   # Cac view cho Ung vien tim viec
│   └── interviewPages/   # Man hinh phong van AI WebRTC va tap luyen
├── hooks/                # Cac custom hook logic dung chung
├── redux/                # Redux Toolkit store va cac slice (auth, room, session)
├── services/             # Axios client va API fetcher functions
├── types/                # TypeScript interface declarations dong bo tu DRF
└── utils/                # Cac ham format tien, format thoi gian, helper
```

---

## 2. Nguyen Tac Kien Truc React 19 & Next.js 16

### 2.1. Server Components vs. Client Components
- **Server Components (RSC)**:
  - Cac file `page.tsx` va `layout.tsx` mac dinh la Server Components.
  - Chuyen fetch data o server de render HTML truc tiep, giup toi uu diem SEO va Core Web Vitals (LCP, FCP).
  - Khong chua cac su kien DOM (`onClick`, `onChange`) hoac React hooks (`useState`, `useEffect`).
- **Client Components (`'use client'`)**:
  - Chi khai bao o dau file khi component thuc su can tuong tac nguoi dung, hook state, hoac trinh duyet API (WebRTC, Canvas, Window).
  - Cac trang co nhieu form phuc tap (nhu ATS Kanban keo tha hoac Phong phong van AI) duoc bao boc trong mot client wrapper component rieng (vi du: `EmployerSectionClient.tsx`).

### 2.2. Toi Uu Hieu Nang (Performance Best Practices)
1. **Lazy Loading Chunks**: Su dung `next/dynamic` cho cac component nang nhu `@react-pdf-viewer`, `@hello-pangea/dnd`, va audio visualizer de khong lam phinh bundle JS ban dau.
2. **Hinh anh toi uu**: Su dung component `next/image` voi day du thuoc tinh `sizes`, `priority` (cho banner/hero) va ho tro dinh dang WebP tu dong.
3. **Font chu he thong**: Su dung `@fontsource-variable/geist` va cac bien font CSS duoc preload san de tranh CLS (Cumulative Layout Shift).
