# Tu Dien Thuat Ngu (Ubiquitous Language)

> **Phan he**: 00-project  
> **Tai lieu**: glossary.md  
> **Tieu chuan**: Domain-Driven Design (DDD) Ubiquitous Language

---

## 1. Nguyen Tac Su Dung Thuat Ngu

Nham loai bo hoan toan su mo ho giua doi ngu phat trien Frontend, Backend, Voice AI, DevOps va cac tro ly lap trinh AI, tat ca cac tai lieu ky thuat, ten ham, ten model, endpoint API va giao dien nguoi dung phai tuan thu bang thuat ngu chuan duoi day:

---

## 2. Bang Thuat Ngu Chuan (EN - VN - Dinh Nghia)

| Thuat ngu Tieng Anh | Thuat ngu Tieng Viet | Dinh nghia Nghiep vu & Ky thuat |
| :--- | :--- | :--- |
| **Candidate** | Ung vien | Nguoi tim viec da dang ky tai khoan tren he thong, so huu ho so thong tin, kinh nghiem, CV va thuc hien ung tuyen. |
| **Employer** | Nha tuyen dung / Doanh nghiep | Phap nhan doanh nghiep hoac dai dien tuyen dung dang ky tai khoan de dang tin tuyen dung va quan ly ung vien. |
| **Job Post** | Tin tuyen dung | Vi tri viec lam dang mo do nha tuyen dung dang tai, chua thong tin vi tri, muc luong, dia diem, yeu cau va che do dai ngo. |
| **Application** | Ho so ung tuyen | Thuc the lien ket ung vien voi mot tin tuyen dung cu the, di kem CV va trang thai trong phan he ATS. |
| **Applicant Tracking System (ATS)** | He thong quan ly ung vien | Phan he quan ly tien trinh xu ly ho so ung vien tu khi nop don den khi duoc tuyen dung (hien thi dang Kanban). |
| **Interview Script** | Kich ban phong van | Tap hop co cau truc cac cau hoi phong van, tieu chi danh gia, thang diem va huong dan ma AI agent se su dung. |
| **Interview Session** | Phien phong van | Mot phong phong van WebRTC thoi gian thuc tren LiveKit giua ung vien va tro ly ao AI hoac nha tuyen dung. |
| **Scorecard** | Phieu danh gia / Bao cao ket qua | Bao cao danh gia nang luc da chieu do AI tu dong tong hop sau phien phong van, xuat ra dinh dang JSON va PDF. |
| **Proctoring Event** | Su kien giam sat | Du lieu do dac thu thap tu trinh duyet trong luc phong van: Chuyen doi tab, tat micro/camera, tieng on la, vang mat khoi khung hinh. |
| **Talking Head** | Avatar dong bo khau hinh | Mo hinh thi giac may tinh tao khuon mat AI tuong tac thoi gian thuc, dong bo chuyen dong moi theo am thanh phat ra. |
| **Employee** | Nhan vien | Nguoi lao dong chinh thuc trong doanh nghiep, duoc tiep nhan (onboard) tu ung vien trungs tuyen sang phan he Native HRM. |
| **Department** | Phong ban | Don vi to chuc co cau trong doanh nghiep (Vi du: Phong Ky thuat, Phong Nhan su, Phong Kinh doanh). |
| **Labor Contract** | Hop dong lao dong | Van ban phap ly giua doanh nghiep va nhan vien quy dinh muc luong, loai hop dong (Thu viec, Co thoi han, Khong thoi han). |
| **Shift** | Ca lam viec | Khung gio lam viec duoc quy dinh (Ca hanh chinh, Ca dem, Ca xoay), co the co tinh chat qua dem (`is_overnight`). |
| **Attendance Record** | Ban ghi cham cong | Du lieu cham cong hang ngay cua nhan vien (gio vao Check-in, gio ra Check-out, di muon, ve som, thoi gian lam thuc te). |
| **Leave Request** | Don xin nghi phep | Yeu cau nghi phep (Nghi co luong, Nghi khong luong, Nghi om, Nghi thai san) duoc tao boi nhan vien va cho quan ly phe duyet. |
| **Leave Balance** | Quy phep | So ngay phep duoc huong trong nam, so ngay da su dung va so ngay phep con lai cua nhan vien. |
| **Payroll Ledger** | Bang luong / So luong | Bang tong hop tinh toan luong hang thang dua tren ngay cong thuc te, phu cap, bao hiem, giam tru gia canh va thue TNCN. |
| **Payslip** | Phieu luong | Phieu chi tiet thu nhap ca nhan cua tung nhan vien trong mot ky tra luong, ho tro xem tren web va in A4. |

---

## 3. Quy Uoc Viet Tat Trong He Thong

- **ATS**: Applicant Tracking System (He thong theo doi ung vien)
- **HRM**: Human Resource Management (Quan tri nguon nhan luc)
- **STT**: Speech-to-Text (Nhan dang tieng noi thanh van ban)
- **TTS**: Text-to-Speech (Chuyen doi van ban thanh tieng noi)
- **SFU**: Selective Forwarding Unit (Bo dieu huong luong WebRTC)
- **TNCN**: Thue Thu Nhap Ca Nhan (Personal Income Tax - PIT)
- **BHXH**: Bao hiem Xa hoi (Social Insurance)
- **BHYT**: Bao hiem Y te (Health Insurance)
- **BHTN**: Bao hiem That nghiep (Unemployment Insurance)
- **RBAC**: Role-Based Access Control (Kiem soat truy cap theo vai tro)
