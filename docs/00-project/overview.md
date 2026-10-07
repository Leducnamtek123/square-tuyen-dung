# Tong Quan Du An: Square Tuyen Dung (InfoHR)

> **Ten he sinh thai**: Square Tuyen Dung (Thuong hieu thuong mai: InfoHR)  
> **Mo hinh van hanh**: Monorepo (`frontend`, `api`, `voice-ai`, `nginx-gateway`, `monitoring`, `waf`)  
> **Phan hang thi truong**: Nen tang Tuyen dung Thong minh & Phong van Tieng noi AI thoi gian thuc (Real-time Voice AI ATS & HRM)  
> **Trang thai**: Dang van hanh va phat trien tich hop

---

## 1. Gioi Thieu Chung

**Square Tuyen Dung (InfoHR)** la he thong nen tang tuyen dung the he moi, ung dung tri tue nhan tao (AI) va cong nghe truyen thong thoi gian thuc WebRTC de tu dong hoa toan bo quy trinh tu luc tim kiem ung vien, phong van so loai bang giong noi tieng Viet, cham diem nang luc da chieu, cho den quan tri nhan su noi bo (HRM Recruit-to-Retire).

He thong giai quyet cac diem nghen lon cua quy trinh tuyen dung truyen thong tai Viet Nam va khu vuc Dong Nam A:
- **Rut ngan chu ky tuyen dung**: Giam thoi gian sang loc ban dau tu 25 - 45 ngay xuong con duoi 7 ngay thong qua tro ly AI phong van tu dong.
- **Tieu chuan hoa danh gia ung vien**: AI danh gia khach quan dua tren 4 tieu chi nang luc chinh (Chuyen mon, Giao tiep, Tu duy giai quyet van de, Do luu loat ngon ngu) va xuat phieu danh gia scorecard PDF chuan.
- **Lien thong tuyen dung va quan tri nhan su**: Ung vien khi duoc cap nhan (Hired) se duoc tu dong tao ho so nhan vien (Employee) tren phan he Native HRM de phan ca, cham cong va tinh luong.

---

## 2. Cong Nghe Cot Loi (Core Tech Stack)

He thong duoc kien truc theo mo hinh Monorepo voi su phan dinh tach bach ro rang giua cac tang:

| Phan he / Dich vu | Cong nghe chinh | Vai tro trong he thong |
| :--- | :--- | :--- |
| **Frontend Web** | Next.js 16 (App Router), React 19, Tailwind CSS v4, TypeScript 5, Redux Toolkit, TanStack Query v5, Shadcn UI | Giao dien da cong (Multi-portal) cho Ung vien, Nha tuyen dung, Quan tri vien va HRM. |
| **Backend API** | Python 3.10+, Django 4.2+, Django REST Framework (DRF), Celery 5.3+, Gunicorn/Uvicorn | RESTful API, xu ly nghiep vu (Service Layer), xac thuc JWT, xu ly tac vu nen. |
| **Co so du lieu quan he** | MySQL 8.0 (InnoDB, utf8mb4) | Co so du lieu giao dich ACID chinh (Users, Jobs, Applications, HRM Ledger). |
| **Cong cu tim kiem** | Elasticsearch 7.17 | Tim kiem toan van (Full-text search), tim kiem mo, loc da tieu chi viec lam va ung vien voi toc do duoi 100ms. |
| **Bo nho dem & Hang doi** | Redis 7.0 | Caching tang cao, session store, Celery task broker va quan ly trang thai phong LiveKit. |
| **Luu tru doi tuong** | MinIO S3 Object Storage | Luu tru file PDF CV ung vien, avatar, ban ghi am/ghi hinh phong van WebRTC. |
| **Voice AI & WebRTC** | LiveKit SFU, LiveKit Python Agent, Whisper STT, Vieneu/Edge TTS, Talking-Head Lipsync Engine | Phong hop thoai thoi gian thuc, tong hop va nhan dang giong noi tieng Viet voi do tre cuc thap (<1.5s). |
| **Gateway & Reverse Proxy** | Nginx Gateway, ModSecurity WAF | Dieu huong subdomain, SSL Termination (Let's Encrypt), bao ve WAF lop 7. |
| **Giam sat & Vanh dai** | Prometheus, Grafana, Loki, Promtail, Alertmanager | Giam sat he thong toan dien, thu thap logs tap trung va canh bao qua Telegram/Email. |

---

## 3. Ban Do 5 Cong Dich Vu (Ecosystem Portals)

He thong tich hop 5 cong dich vu tren cung mot ha tang dong nhat thong qua co che Subdomain Routing:

1. **Job Seeker Portal (`https://infohr.vn`)**:
   - Cung cap cong cu tim kiem viec lam thong minh, tao CV online tuong tac, nop ho so 1-click va phong luyen tap phong van thu nghiem voi AI.
2. **Employer Portal (`https://employer.infohr.vn`)**:
   - Cung cap bang dieu khien quan tri tuyen dung, quan ly chien dich, pipeline ung vien dang Kanban ATS, tuy bien bo cau hoi phong van AI va xem bao cao scorecard.
3. **Voice AI Interview Center (`https://aila.infohr.vn`)**:
   - Phong phong van truc tuyen WebRTC voi tro ly ao AILA (hoac avatar talking-head), tu dong dat cau hoi, lang nghe phan hoi ung vien va ghi am/ghi hinh giam sat.
4. **Admin Portal (`https://admin.infohr.vn`)**:
   - Cong quan tri he thong: Tham dinh giay phep kinh doanh cua doanh nghiep, kiem duyet tin tuyen dung, quan ly goi dich vu va nhat ky kiem toan he thong.
5. **Internal HRM Portal (`https://hrm.infohr.vn`)**:
   - Phan he quan tri nhan su noi bo: Quan ly ho so nhan su, phan ca, bang cham cong chi tiet, don nghi phep va engine tinh luong chuan Luat Lao dong Viet Nam.

---

## 4. Lien Ket Tai Lieu Quan Trong

- [Muc tieu va Pham vi](file:///c:/Users/WIN10/Documents/square-tuyen-dung/docs/00-project/goals-and-scope.md)
- [Tu dien Thuat ngu Ubiquitous Language](file:///c:/Users/WIN10/Documents/square-tuyen-dung/docs/00-project/glossary.md)
- [Trang thai He thong](file:///c:/Users/WIN10/Documents/square-tuyen-dung/docs/00-project/status.md)
- [Tong quan Kien truc](file:///c:/Users/WIN10/Documents/square-tuyen-dung/docs/02-architecture/system-architecture.md)
