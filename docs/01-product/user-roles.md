# Vai Tro Nguoi Dung (User Roles & Personas)

> **Phan he**: 01-product  
> **Tai lieu**: user-roles.md  
> **Ecosystem**: Square Tuyen Dung (InfoHR)

---

## 1. Danh Sach Vai Tro He Thong (System Roles)

He thong phan dinh 6 vai tro nguoi dung chinh voi cac pham vi quyen han, hanh vi va muc tieu rieng biet:

```text
               ┌────────────────────────────────────────────────────────┐
               │                     User Account                       │
               └──────────────────────────┬─────────────────────────────┘
                                          │
       ┌──────────────────┬───────────────┴──────────────┬──────────────────┐
       ▼                  ▼                              ▼                  ▼
[Job Seeker]     [Employer Recruiter]             [HRM Specialist]    [System Admin]
       │                  │                              │                  │
       ▼                  ▼                              ▼                  ▼
[Candidate]       [Company Admin]                   [Employee]        [Super Admin]
```

---

## 2. Chi Tiet Ho So Vai Tro (Role Personas)

### 2.1. Job Seeker (Ung Vien)
- **Doi tuong**: Sinh vien moi ra truong, chuyen vien, nguoi lao dong dang tim kiem co hoi viec lam moi tai Viet Nam.
- **Diem dau (Pain Points)**:
  - Mat nhieu thoi gian nop ho so ma khong nhan duoc phan hoi.
  - Quy trinh phong van ban dau keo dai, kho chu dong thoi gian.
  - Thieu su danh gia khach quan va phan hoi sau phong van.
- **Hanh vi chu dao**:
  - Tim kiem tin tuyen dung theo vi tri, dia diem, dai luong.
  - Su dung cong cu CV Builder de tao CV chuan.
  - Nop don ung tuyen vao cac vi tri phu hop.
  - Nhan email moi tham gia phong van AI, kiem tra camera/micro va phong van voi tro ly giong noi.
  - Xem trang thai ho so ung tuyen tren trang ca nhan.

### 2.2. Employer Recruiter (Chuyen Vien Tuyen Dung)
- **Doi tuong**: HR Executive, Talent Acquisition Specialist lam viec tai cac doanh nghiep doi tac.
- **Diem dau (Pain Points)**:
  - Qua tai vi phai goi dien sang loc hang tram ho so ung vien moi tuan.
  - Kho sap xep lich phong van phu hop voi lich trinh cua ung vien va hiring manager.
  - Danh gia mang tinh chu quan, kho luu lai bang chung phan hoi cua ung vien.
- **Hanh vi chu dao**:
  - Soan thao va dang tin tuyen dung len cong he thong.
  - Thiet lap kich ban phong van AI va gan vao tin tuyen dung.
  - Quan ly tien do ung vien tren bang Kanban ATS.
  - Xem scorecard phan tich tu dong do AI cham, nghe lai audio tra loi va dua ra quyet dinh Pass/Fail.

### 2.3. Employer Owner / Company Admin (Chu Doanh Nghiep / Quan Tri Doanh Nghiep)
- **Doi tuong**: Giam doc, Truong phong Nhan su (HR Director), quan tri vien he thong phia doanh nghiep.
- **Diem dau (Pain Points)**:
  - Chi phi tuyen dung cao nhung hieu qua khong on dinh.
  - Khong co he thong quan tri dong bo tu luc tuyen dung den luc tinh luong nhan vien.
- **Hanh vi chu dao**:
  - Dang ky doanh nghiep, nop giay phep kinh doanh va xac thuc thong tin phap ly.
  - Mua goi dich vu dang tin, tin dung phong van AI (AI credits) hoac goi phan he HRM.
  - Phan quyen cho cac recruiter noi bo trong cong ty.
  - Theo doi bao cao tong the ve chi phi tuyen dung, ty le chuyen doi ung vien va hieu qua nhan su.

### 2.4. HRM Specialist (Chuyen Vien Nhan Su / C&B)
- **Doi tuong**: Chuyen vien quan ly ho so nhan su, chuyen vien cham cong va tinh luong (Compensation & Benefits).
- **Diem dau (Pain Points)**:
  - Nhap lieu thu cong thong tin nhan vien moi tu ho so tuyen dung gay sai sot.
  - Xu ly bang cham cong phuc tap voi ca dem, ca xoay, de nham lan giua nghi co luong va khong luong.
  - Tinh thue TNCN va bao hiem xa hoi ton nhieu thoi gian lap cong thuc Excel.
- **Hanh vi chu dao**:
  - Tiep nhan ung vien trungs tuyen tu ATS va mo ho so nhan vien moi tren HRM.
  - Thiet lap ca lam viec, kiem tra du lieu cham cong hang ngay va tong hop cong thang.
  - Duyet don xin nghi phep cua nhan vien, theo doi quy phep.
  - Chay engine tinh luong tu dong, kiem tra thue TNCN va khau tru bao hiem, xuat phieu luong va gui cho nhan vien.

### 2.5. Employee (Nhan Vien Noi Bo)
- **Doi tuong**: Nhan su dang lam viec tai doanh nghiep su dung phan he Native HRM.
- **Diem dau (Pain Points)**:
  - Kho theo doi so ngay phep con lai, phai hoi nhan su qua tin nhan.
  - Phieu luong nhan qua giay hoac email khong tien tra cuu lich su.
- **Hanh vi chu dao**:
  - Dang nhap cong tu phuc vu nhan vien (`/me/` hoac `/hrm/portal`).
  - Xem lich su cham cong, gio vao/ra thuc te theo ngay.
  - Tao don xin nghi phep va theo doi trang thai phe duyet cua quan ly.
  - Xem va tai phieu luong ca nhan hang thang.

### 2.6. System Admin / Platform Moderator (Quan Tri Vien He Thong)
- **Doi tuong**: Doi ngu van hanh nen tang InfoHR / Square Tuyen Dung.
- **Diem dau (Pain Points)**:
  - Phat hien va ngan chan cac tin tuyen dung lua dao, thu phi ung vien trai phap luat.
  - Theo doi tai nguyen he thong, phien phong van AI thoi gian thuc de xu ly su co kip thoi.
- **Hanh vi chu dao**:
  - Tham dinh giay phep kinh doanh cua doanh nghiep moi.
  - Kiem duyet noi dung tin dang, xu ly bao cao vi pham.
  - Quan ly danh sach nguoi dung, khoa cac tai khoan vi pham tieu chuan.
  - Theo doi he thong giam sat metrics, CPU, RAM, LiveKit SFU rooms, MinIO storage.
