# Dinh Tuyen Subdomain & Middleware (Routing & Subdomains)

> **Phan he**: 06-frontend  
> **Tai lieu**: routing-and-subdomains.md  
> **Cong nghe**: Next.js 16 Middleware & Nginx Reverse Proxy

---

## 1. Co Che Subdomain Rewriting

Thay vi phai build 5 ung dung web rieng biet gay phan manh ma nguon va ton gap 5 lan tai nguyen may chu, InfoHR su dung **Next.js Middleware (`frontend/src/middleware.ts`)** de nhan dien hostname va rewrite URL den thu muc route tuong ung:

```text
Yeu cau tu trinh duyet:                  Next.js App Router noi bo:
https://infohr.vn/jobs              ──►  app/(job-seeker)/jobs/page.tsx
https://employer.infohr.vn/job-posts ──►  app/employer/job-posts/page.tsx
https://admin.infohr.vn/settings    ──►  app/admin/settings/page.tsx
https://hrm.infohr.vn/payroll       ──►  app/employer/hrm/payroll/page.tsx
https://aila.infohr.vn/interview/12 ──►  app/interview/[id]/page.tsx
```

---

## 2. Xu Ly Trong Middleware (`frontend/src/middleware.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get('host') || '';

  // 1. Xu ly cho domain Admin
  if (hostname.startsWith('admin.')) {
    return NextResponse.rewrite(new URL(`/admin${url.pathname}`, req.url));
  }

  // 2. Xu ly cho domain Employer
  if (hostname.startsWith('employer.')) {
    return NextResponse.rewrite(new URL(`/employer${url.pathname}`, req.url));
  }

  // 3. Xu ly cho domain HRM
  if (hostname.startsWith('hrm.')) {
    return NextResponse.rewrite(new URL(`/employer/hrm${url.pathname}`, req.url));
  }

  // 4. Xu ly cho domain Voice AI
  if (hostname.startsWith('aila.')) {
    return NextResponse.rewrite(new URL(`/interview${url.pathname}`, req.url));
  }

  // Mac dinh la Cong Ung vien (Job Seeker)
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

---

## 3. Bao Ve Tuyen Duong (Route Protection & Role Guards)

Cac route yeu cau xac thuc duoc bao ve ca o hai lop:
1. **Lop Middleware**: Kiem tra su ton tai cua cookie JWT token va cookie `user_role`. Neu chua dang nhap, chuyen huong ve trang `/login` kem tham so `?redirect=...`.
2. **Lop Component Guard**: Su dung hook `useAuth()` de doi chieu quyen han. Neu nguoi dung co vai tro `CANDIDATE` co tinh truy cap trang `/employer/dashboard`, he thong se hien thi thong bao 403 Forbidden hoac tu dong chuyen huong ve trang chu ung vien.
