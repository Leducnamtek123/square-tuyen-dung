# Lo Trinh Phat Trien San Pham & Ky Thuat (Product & Engineering Roadmap)

> **Phan he**: docs-root  
> **Tai lieu**: roadmap.md  
> **Giai doan**: 2026 - 2027

---

## 1. Tong Quan Cac Giai Doan Chien Luoc

```text
2026 Q3 - Q4                     2027 Q1                        2027 Q2                        2027 Q3 - Q4
┌─────────────────────────┐    ┌─────────────────────────┐    ┌─────────────────────────┐    ┌─────────────────────────┐
│ Giai doan 1: Core MVP   │───►│ Giai doan 2: Voice AI   │───►│ Giai doan 3: Enterprise │───►│ Giai doan 4: Regional   │
│ - 5 Cong dich vu        │    │ - Mo rong LiveKit cluster│    │   Suite & Headhunter    │    │   Expansion (SEA)       │
│ - Dual-Persistence      │    │ - Giam do tre thoai <1s │    │ - AI Candidate Matching │    │ - Da ngon ngu (EN/JP/KR)│
│ - Native HRM Remediation│    │ - Avatar Lipsync HD     │    │ - Auto Payroll Banking  │    │ - Multi-region Cloud    │
└─────────────────────────┘    └─────────────────────────┘    └─────────────────────────┘    └─────────────────────────┘
```

---

## 2. Chi Tiet Cac Moc Lo Trinh

### Giai Doan 1: Core MVP & On Dinh Nen Tang (Q3 - Q4/2026) [HOAN THANH]
- [x] Dong nhat kien truc Monorepo (Next.js 16 + Django REST Framework + LiveKit + MySQL + Redis + Elasticsearch + MinIO).
- [x] Trien khai 5 cong dich vu qua Nginx Subdomain Gateway: Job Seeker, Employer ATS, Voice AI, Admin, Native HRM.
- [x] Xu ly triet de 16 loi tiem an trong phan he Native HRM (Payroll double deduction, ca dem, quy phep, giam tru gia canh).
- [x] Tich hop he thong giam sat toan dien Prometheus, Grafana, Loki, Promtail va tuong lua ModSecurity WAF.

### Giai Doan 2: Nang Cap & Mo Rong Voice AI (Q1/2027) [DANG TRIEN KHAI]
- [ ] Toi uu hoa pipeline nhan dang tieng noi (STT) va tong hop giong noi (TTS) de do tre phan hoi giam xuong duoi 1,000ms.
- [ ] Trien khai cum LiveKit SFU da may chu (Multi-node SFU Cluster) ho tro toi thieu 500 phong phong van dong thoi.
- [ ] Nhan dien cam xuc co ban qua am sac giong noi (Acoustic Sentiment Analysis).
- [ ] Che do phong van tieng Anh chuyen nghiep (English Interview Track) cho cac doanh nghiep IT va FDI.

### Giai Doan 3: Enterprise HRM Suite & AI Headhunter (Q2/2027) [KE HOACH]
- [ ] Tinh nang AI Headhunter: Tu dong quet kho CV va chu dong de xuat danh sach ung vien dat tren 85% do phu hop cho tin tuyen dung moi.
- [ ] Lien thong API chi tra luong tu dong voi cac ngan hang thuong mai tai Viet Nam (Open Banking API).
- [ ] Phan he quan ly ca lam viec thong minh (Smart Roster Scheduling) cho chuoi ban le va nha hang.

### Giai Doan 4: Mo Rong Thi Truong Dong Nam A (Q3 - Q4/2027) [TAM NHIN]
- [ ] Ho tro da ngon ngu toan dien: Tieng Anh, Tieng Nhat, Tieng Han, Tieng Thai.
- [ ] Tu dong thich ung luat thue va che do bao hiem xa hoi theo tung quoc gia tai khu vuc Dong Nam A.
- [ ] Trien khai he thong tren ha tang Cloud da vung (Multi-region Deployment).
