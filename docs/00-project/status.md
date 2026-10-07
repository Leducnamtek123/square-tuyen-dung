# Trang Thai He Thong (System Status)

> **Phan he**: 00-project  
> **Tai lieu**: status.md  
> **Cap nhat luc**: 2026-10-07  
> **Trang thai tong the**: PRODUCTION READY / ACTIVE DEVELOPMENT

---

## 1. Tinh Trang Cac Phan He (Module Readiness Matrix)

| Module / Phan he | Cong nghe & Vi tri ma nguon | Muc do hoan thien | Ghi chu van hanh |
| :--- | :--- | :--- | :--- |
| **Job Seeker Portal** | `frontend/src/app/(job-seeker)` | 95% | Tim kiem viec lam, loc Elasticsearch, CV builder PDF, nop ho so 1-click hoat dong on dinh. |
| **Employer ATS Portal** | `frontend/src/app/employer` | 95% | Kanban pipeline keo tha, thiet lap kich ban phong van, xem scorecard va danh gia ung vien. |
| **Voice AI Interview** | `voice-ai/` & `frontend/src/app/interview` | 90% | Phong WebRTC LiveKit, pipeline STT/TTS tieng Viet <1.5s, avatar lipsync talking-head va ghi am egress. |
| **Admin Portal** | `frontend/src/app/admin` & `api/config/admin.py` | 90% | Tham dinh giay phep, khoa tai khoan, kiem duyet tin dang va quan ly cau hinh he thong. |
| **Native HRM Core** | `api/apps/hrm/` & `frontend/src/app/employer/hrm` | 95% | 16/16 loi tiem an da khac phuc, engine tinh luong thue TNCN & BHXH Viet Nam, ca dem, quy phep. |
| **Backend REST API** | `api/apps/` | 95% | Django 4.2+, DRF, Service Layer Pattern, xac thuc JWT cookie/bearer, Swagger OpenAPI san sang. |
| **Data & Storage** | MySQL 8.0, ES 7.17, Redis 7, MinIO S3 | 98% | Dual-persistence on dinh, backup tu dong qua Telegram, health check xanh. |
| **Security & Gateway** | Nginx Gateway, ModSecurity WAF | 90% | HTTPS Let's Encrypt, routing subdomain, rule chan tan cong WAF OWASP CRS. |
| **Observability** | Prometheus, Grafana, Loki, Promtail | 95% | Metrics, dashboards, alert rules va log aggregation hoat dong day du. |

---

## 2. Thong So Chat Luong & Kiem Thu (Quality & Test Suite)

- **Backend Pytest Suite**: 
  - Toan bo test suite tai `api/apps/hrm/tests.py` va `api/shared/tests.py` da pass 100% (32/32 tests cho HRM payroll, attendance, contract).
  - Kiem tra chat che truong hop tinh thue luy tien, giam tru 4.4tr/nguoi phu thuoc, ca lam viec qua dem.
- **Frontend Type Safety & Linting**:
  - `pnpm run build` va `pnpm run typecheck` khong co loi TypeScript bi chan.
  - Next.js 16 App Router phan tach ro rang Server Components va Client Components.
- **E2E Smoke Tests**:
  - Test suites Playwright cho dang nhap, dang ky, route guards, ATS Kanban keo tha, phong LiveKit phong van san sang.

---

## 3. Danh Sach Ranh Gioi Kiem Soat Rui Ro (Risk Controls)

1. **Bao ve Khoa Bang Luong**: Bieu ghi bang luong da o trang thai `APPROVED` hoac `PAID` duoc khoa cung cap database/service, ngan chan viec tinh toan lai lam sai lech so sach tai chinh.
2. **Chong Am Quy Phep**: Nop don nghi phep su dung `select_for_update` o tang co so du lieu, dam bao khong xay ra race condition khi nhieu yeu cau duoc gui dong thoi.
3. **Co lap Da Doanh Nghiep (Multi-Tenancy)**: Query set o cac Selectors va ViewSets luon buoc phai filter theo `company_id` cua nguoi dung hien tai, ngan chan hoan toan ro ri du lieu giua cac cong ty.
