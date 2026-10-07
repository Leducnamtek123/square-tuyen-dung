# Yeu Cau San Pham (Product Requirements Document - PRD)

> **Phan he**: 01-product  
> **Tai lieu**: requirements.md  
> **Ecosystem**: Square Tuyen Dung (InfoHR Platform)  
> **Trang thai**: APPROVED

---

## 1. Yeu Cau Chuc Nang Chi Tiet Theo Phan He (Functional Requirements)

### 1.1. Cong Ung Vien (Job Seeker Portal - `https://infohr.vn`)
- **FR-JS-01: Quan ly tai khoan & Dinh danh**:
  - Ung vien co the dang ky bang Email, xac thuc qua OTP/Email link, hoac dang nhap nhanh bang Google OAuth2.
  - Cap nhat thong tin ca nhan, hoc van, kinh nghiem lam viec, ky nang, chung chi va muc luong ky vong.
- **FR-JS-02: Tim kiem & Kham pha viec lam**:
  - Tim kiem viec lam bang tu khoa, chuc danh, ten cong ty voi cong cu tim kiem toan van Elasticsearch (ho tro tieng Viet khong dau va sai chinh ta nhe).
  - Bo loc da tieu chi: Muc luong (Min-Max), Tinh/Thanh pho (chuan hoa 34 don vi hanh chinh), Loai hinh lam viec (Toan thoi gian, Ban thoi gian, Remote, Hybrid), Nganh nghe.
- **FR-JS-03: Trinh tao CV tuong tac (Online CV Builder)**:
  - Cung cap giao dien tao CV truc quan voi cac mau thiet ke chuan nganh nghe.
  - Cho phep keo tha, sap xep cac phan muc (Muc tieu, Kinh nghiem, Du an, Ky nang).
  - Ho tro xuat ban CV ra file PDF chuan in an va ho tro luu tru CV tren MinIO.
- **FR-JS-04: Nop don ung tuyen 1-Click (1-Click Apply)**:
  - Cho phep nop ho so vao tin tuyen dung bang CV truc tuyen hoac upload file PDF moi tu may tinh.
  - Gui thu gioi thieu (Cover Letter) di kem.
  - Theo doi tien do ho so trong phan "Lich su ung tuyen" (Da nop, Da xem, Moi phong van, Trung tuyen, Tu choi).
- **FR-JS-05: Phong luyen tap phong van AI (AI Practice Room)**:
  - Ung vien co the tham gia phong phong van gia lap voi tro ly AI de lam quen voi giong noi va cach tra loi cau hoi.

### 1.2. Cong Nha Tuyen Dung (Employer Portal - `https://employer.infohr.vn`)
- **FR-EM-01: Dang ky & Xac thuc phap ly doanh nghiep**:
  - Khai bao ten cong ty, ma so thue, dia chi tru so, quy mo, logo va banner thuong hieu.
  - Tai len giay phep dang ky kinh doanh (GPKD) de he thong kiem duyet truoc khi dang tin cong khai.
- **FR-EM-02: Quan ly tin tuyen dung (Job Post Management)**:
  - Tao, chinh sua, an/hien, dong hoac gia han tin tuyen dung.
  - Thiet lap tieu chi tuyen dung: Mo ta cong viec (JD), yeu cau ky nang, dai luong, dia diem lam viec va han chot nop ho so.
  - Gan kich ban phong van Voice AI phu hop cho tung tin dang.
- **FR-EM-03: Pipeline ung vien kieu Kanban ATS**:
  - Giao dien keo tha truc quan theo 6 cot trang thai: `Applied` -> `Screening` -> `AI Interview` -> `Offered` -> `Rejected` -> `Hired`.
  - Loc ung vien theo diem danh gia cua AI, kinh nghiem, ngay ung tuyen.
  - Xem chi tiet CV ung vien qua trinh xem PDF nhung truc tiep (`@react-pdf-viewer`).
- **FR-EM-04: Tuy bien kich ban phong van Voice AI**:
  - Ngan hang cau hoi phong van (Question Bank) theo nganh nghe va cap bac (Junior, Mid, Senior).
  - Tao bo cau hoi rieng voi trong so diem va thoi gian tra loi cho phep cho tung cau hoi.
- **FR-EM-05: Danh gia Scorecard & Bang chung phong van**:
  - Xem scorecard chi tiet tong hop boi AI: Diem tong the (thang 100), diem 4 chieu, tom tat danh gia diem manh/diem yeu va de xuat phu hop.
  - Nghe lai ban ghi am tung cau tra loi, xem video phong van va xem ban doc transcript trao doi.

### 1.3. Trung Tam Phong Van Voice AI (Voice AI Center - `https://aila.infohr.vn`)
- **FR-AI-01: Phong hop thoai thoi gian thuc WebRTC**:
  - Ket noi truc tiep vao phong LiveKit SFU thong qua JWT Room Token duoc ky boi backend.
  - Buoc kiem tra thiet bi (Device Pre-flight Check): Micro, Camera, Loa truoc khi bat dau phien.
- **FR-AI-02: Tuong tac hoi dap tieng Viet tu nhien**:
  - AI chu dong chao hoi, gioi thieu quy che phong van va lan luot neu cau hoi theo kich ban.
  - Ho tro co che ngat loi thong minh (Turn-taking & Barge-in handling).
  - Do tre phan hoi duoi 1.5s tu khi ung vien ngung noi den khi AI bat dau phat am thanh.
- **FR-AI-03: Avatar Talking-Head**:
  - Hien thi avatar video tro ly ao dong bo chuyen dong moi theo thoi gian thuc su dung mo hinh Lipsync Wav2Lip/Musetalk qua luong WHEP/WebRTC.
- **FR-AI-04: Ghi hinh, Ghi am & Giam sat (Proctoring & Recording)**:
  - Egress service ghi lai toan bo phien phong van (am thanh + hinh anh) va luu ve MinIO S3.
  - Phat hien va ghi nhan su kien giam sat: Ung vien chuyen tab, khong phat hien giong noi, tieng on dot bien.

### 1.4. Cong Quan Tri He Thong (Admin Portal - `https://admin.infohr.vn`)
- **FR-AD-01: Tham dinh doanh nghiep**:
  - Hang doi phe duyet giay phep kinh doanh cua doanh nghiep moi dang ky.
  - Tu choi va gui ly do hoac phe duyet kich hoat quyen dang tin tuyen dung.
- **FR-AD-02: Kiem duyet tin tuyen dung**:
  - Kiem tra noi dung tin tuyen dung, tam dung cac tin vi pham phap luat, tin lua dao hoac quang cao sai su that.
- **FR-AD-03: Quan ly nguoi dung & Phan quyen**:
  - Quan ly danh sach tai khoan (Ung vien, Doanh nghiep, Quan tri vien).
  - Khoa hoac mo khoa tai khoan vi pham dieu khoan dich vu.
- **FR-AD-04: Nhat ky kiem toan he thong (Audit Logs)**:
  - Ghi nhan toan bo cac hanh dong nhay cam cua quan tri vien va doanh nghiep (Duyet tin, thay doi diem, xem ho so, xuat bao cao).

### 1.5. Phan He Quan Tri Nhan Su (Native HRM - `https://hrm.infohr.vn`)
- **FR-HR-01: Tiep nhan ung vien (Onboarding)**:
  - Chuyen doi tu dong ung vien o trang thai `Hired` sang ban ghi `Employee` voi ma nhan vien tu dong sinh.
  - Thiet lap phong ban, chuc vu, quan ly truc tiep, loai hop dong va ngay bat dau lam viec.
- **FR-HR-02: Quan ly Ca & Cham cong (Time & Attendance)**:
  - Dinh nghia ca lam viec linh hoat (Ca hanh chinh, ca dem `is_overnight`, ca xoay).
  - Thu thap du lieu quet the / cham cong, ghep ca tu dong voi co che phat hien `MISSED_IN` / `MISSED_OUT`.
  - Lap bang cham cong chi tiet theo ngay va bang tong hop cong theo thang, phan biet ro ngay cong thuc te, ngay nghi huong luong va ngay nghi khong luong.
- **FR-HR-03: Quan ly Don tu & Quy phep (Leave Management)**:
  - Nhan vien tao don xin nghi phep theo loai (`ANNUAL`, `SICK`, `UNPAID`, `MATERNITY`).
  - Co che khoa `select_for_update` dam bao khong am quy phep khi nop don dong thoi.
  - Quy trinh phe duyet don 2 cap (Quan ly truc tiep -> Nhan su).
- **FR-HR-04: Tinh luong tu dong chuan Viet Nam (Payroll Engine)**:
  - Tinh toan luong tu dong theo cong thuc Gross - Net chuan Luat Lao dong va Luat Thue TNCN Viet Nam.
  - Tinh chinh xac muc giam tru gia canh ban than (11.000.000 VND) va nguoi phu thuoc (4.400.000 VND/nguoi).
  - Tinh khau tru BHXH (8%), BHYT (1.5%), BHTN (1%) theo tran quy dinh.
  - Ap dung bieu thue luy tien tung phan 7 bac (5% den 35%) cho thue TNCN.
  - Khoa cung trang thai bang luong khi da `APPROVED` hoac `PAID`.
  - In phieu luong Payslip A4 chuyen nghiep va xuat file Excel/CSV tong hop.

---

## 2. Yeu Cau Phi Chuc Nang (Non-Functional Requirements - NFR)

| Yeu to | Tieu chi chap nhan | Bien phap ky thuat dam bao |
| :--- | :--- | :--- |
| **Do tre thoai AI** | < 1,500 ms (Round-trip) | Ket noi WebRTC truc tiep qua LiveKit SFU, streaming STT va TTS tren GPU/ha tang toi uu. |
| **Thoi gian dap ung API** | p95 < 200 ms | Thiet ke Service Layer toi uu, cache Redis, ngan chan N+1 query bang `select_related`. |
| **Toc do tim kiem** | < 100 ms | Elasticsearch 7 index dong bo qua Celery signals. |
| **Kha nang san sang** | 99.9% Uptime | Multi-container Docker, healthcheck dinh ky va co che restart tu dong. |
| **An toan luu tru** | 99.999% Durability | MinIO S3 cluster voi co che snapshot backup tu dong hang ngay len vung luu tru ngoai. |
| **Bao mat mang** | OWASP Top 10 | ModSecurity WAF chan tan cong SQL Injection, XSS, Path Traversal; rate limiting Redis. |
