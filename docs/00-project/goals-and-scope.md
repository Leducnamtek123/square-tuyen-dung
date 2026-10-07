# Muc Tieu & Pham Vi Du An (Goals & Scope)

> **Phan he**: 00-project  
> **Tai lieu**: goals-and-scope.md  
> **Muc tieu phat hanh**: Phien ban v1.0.0 (MVP) toi v2.0.0 (Enterprise Suite)

---

## 1. Muc Tieu Chien Luoc (Strategic Goals)

Du an Square Tuyen Dung (InfoHR) duoc thiet ke nham dat duoc 4 muc tieu kinh doanh va ky thuat:

1. **Tu dong hoa quy trinh so loai phong van (Voice AI Screening)**:
   - Giam bot 70% thoi gian goi dien phong van so tuyen truyen thong cua nha tuyen dung.
   - Tro ly ao AI co kha nang tuong tac bang giong noi tieng Viet tu nhien, do tre round-trip duoi 1,500ms.
2. **Nang cao tinh minh bach va chuan hoa danh gia**:
   - Loai bo thien vi ca nhan trong khau phong van dau vao.
   - Cung cap Scorecard da chieu: Ky nang chuyen mon (Hard skills), Ky nang mem (Soft skills), Kha nang ngon ngu va Tinh trung thuc/Tu duy ung bien.
3. **Dong bo khep kin chu trinh Tuyen dung toi Nhan su (Recruit-to-Retire Pipeline)**:
   - Ket noi lien mach tu luc ung vien duoc danh gia dat yeu cau (Hired) den khi nhan viec, ky hop dong, cham cong va nhan luong tren phan he Native HRM.
4. **Hieu nang cao va do tin cay chuan Enterprise**:
   - Ho tro dong thoi hang tram phong phong van WebRTC voi LiveKit SFU.
   - API p95 < 200ms va kha nang tim kiem ho so/viec lam < 100ms nho Elasticsearch 7.

---

## 2. Pham Vi Chuc Nang (Feature Scope Boundaries)

### 2.1. Trong pham vi (In-Scope)
- **Job Seeker Portal**:
  - Dang ky, dang nhap tai khoan bang Email/Mat khau hoac Google OAuth2.
  - Tim kiem viec lam toan van, loc theo muc luong, dia diem (34 tinh thanh chuan hoa), nganh nghe.
  - Cong cu tao CV online (CV Builder) voi mau chuan, xuat file PDF.
  - Nop ho so 1-click su dung CV san co hoac upload CV moi len MinIO.
  - Cung cap phong phong van thu nghiem (AI Practice Room) giup ung vien lam quen voi AI.
- **Employer Portal**:
  - Dang ky thong tin doanh nghiep va nop ho so xac thuc giay phep kinh doanh.
  - Dang tin tuyen dung voi tieu chuan nang luc va che do dai ngo ro rang.
  - Quan ly ho so ung tuyen theo mo hinh Kanban ATS (Applied, Screening, AI Interview, Offered, Rejected, Hired).
  - Thiet lap kich ban phong van AI: Chon bo cau hoi mau hoac tao bo cau hoi rieng.
  - Xem bang danh gia Scorecard, nghe lai file ghi am phong van, xem video phien phong van.
- **Voice AI Center (`https://aila.infohr.vn`)**:
  - Phong phong van WebRTC voi LiveKit, kiem tra thiet bi (Micro, Camera, Loa) truoc khi vao.
  - Pipeline nhan dang giong noi (Whisper STT), LLM reasoning va tong hop giong noi tieng Viet (Vieneu / Edge / Azure TTS).
  - Talking-head avatar dong bo khau hinh (Lipsync Wav2Lip/Musetalk) theo audio phat ra.
  - Ghi am va ghi hinh toan bo phien phong van qua LiveKit Egress Service dua ve MinIO S3.
  - Proctoring giam sat co ban (theo doi su kien roi khoi tab, mat ket noi, mic tat).
- **Admin Portal**:
  - Hang doi tham dinh giay phep kinh doanh cua doanh nghiep truoc khi cho phep dang tin cong khai.
  - Kiem duyet, tam dung tin tuyen dung vi pham tieu chuan cong dong.
  - Quan ly tai khoan nguoi dung, phan quyen quan tri he thong va xem nhat ky kiem toan (Audit Logs).
- **Native HRM**:
  - Tiep nhan ung vien trungs tuyen (Onboarding) thanh nhan vien chinh thuc.
  - Quan ly ho so nhan su, danh sach phong ban, chuc vu, hop dong lao dong.
  - Quan ly ca lam viec, cham cong, bang cong chi tiet va bang cong tong hop theo thang.
  - Quan ly don nghi phep, quy phep nam voi khoa chong am quy.
  - Tinh toan bang luong tu dong (Gross - Net, BHXH/BHYT/BHTN, giam tru gia canh 4.4tr/nguoi phu thuoc, thue TNCN theo bieu luy tien tung phan cua Viet Nam).
  - In phieu luong chuan A4 (`@media print`) va xuat bao cao Excel/CSV.

### 2.2. Ngoai pham vi hien tai (Out-of-Scope / Deferred to Future)
- Phong van da ngon ngu phuc tap (Tieng Nhat, Tieng Han, Tieng Duc) - se ho tro o giai doan mo rong quoc te.
- Phan tich vi bieu cam khuon mat qua thi giac may tinh chuyen sau (Facial Micro-expression Emotion AI).
- Tich hop he thong dong bo ngan hang tu dong (Automated Bank Payroll API via Open Banking).
- Giai phap quan ly ca lam viec phuc tap theo kieu xep ca tu dong da diem (AI Shift Scheduling).

---

## 3. Cac Moc Phat Trien (Milestones)

| Milestone | Muc tieu chinh | Thoi gian | Trang thai |
| :--- | :--- | :--- | :--- |
| **M1: Foundation MVP** | Ha tang Docker, Nginx, Django API, Next.js Web, MySQL, MinIO, Auth JWT | Thang 09/2026 | Hoan thanh |
| **M2: Voice AI Engine** | LiveKit integration, Whisper STT, Vieneu TTS, phong phong van WebRTC | Thang 10/2026 | Hoan thanh |
| **M3: ATS & Scorecards** | Kanban pipeline, tu dong sinh scorecard PDF, danh gia da chieu | Thang 10/2026 | Hoan thanh |
| **M4: Native HRM** | Onboard ung vien, cham cong ca dem, quy phep, tinh thue TNCN va bao hiem | Thang 10/2026 | Hoan thanh |
| **M5: Enterprise Polish** | WAF ModSecurity, Prometheus/Grafana/Loki, kiem toan audit bao mat | Thang 11/2026 | Dang tien hanh |
