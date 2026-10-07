# Luong Cong Viec He Thong (System Workflows)

> **Phan he**: 01-product  
> **Tai lieu**: workflows.md  
> **Ecosystem**: Square Tuyen Dung (InfoHR)

---

## 1. Luong 1: Ung Vien Tim Viec & Nop Ho So 1-Click

```mermaid
sequenceDiagram
    autonumber
    actor U as Ung Vien (Job Seeker)
    participant FE as Frontend (infohr.vn)
    participant API as Backend DRF API
    participant ES as Elasticsearch 7
    participant S3 as MinIO S3

    U->>FE: Nhap tu khoa tim kiem & bo loc dia diem
    FE->>API: GET /api/v1/job/search/?q=...&province=...
    API->>ES: Truy van toan van fuzzy search
    ES-->>API: Danh sach Job IDs & Highlight
    API-->>FE: Danh sach tin tuyen dung phu hop
    U->>FE: Chon tin & nhan "Nop ho so ung tuyen"
    alt Su dung CV Online san co
        U->>FE: Chon CV Builder profile
    else Tai len CV moi
        U->>FE: Chon file PDF tu may tinh
        FE->>API: POST /api/v1/cv/upload/
        API->>S3: Luu tru ban ghi file PDF CV
        S3-->>API: URL tai lieu
    end
    FE->>API: POST /api/v1/job/apply/
    API-->>FE: HTTP 201 Created (Trang thai APPLIED)
    FE-->>U: Thong bao nop ho so thanh cong
```

---

## 2. Luong 2: Doanh Nghiep Dang Tin & Loc Ung Vien Tren ATS Kanban

```mermaid
sequenceDiagram
    autonumber
    actor HR as Recruiter (Nha Tuyen Dung)
    participant FE as Frontend (employer.infohr.vn)
    participant API as Backend DRF API
    participant DB as MySQL 8.0
    participant ES as Elasticsearch 7

    HR->>FE: Soan thao tin tuyen dung & chon bo cau hoi AI
    FE->>API: POST /api/v1/job/job-posts/
    API->>DB: Luu JobPost (Trang thai PENDING / ACTIVE)
    API->>ES: Celery Task: Reindex JobPost vao Elasticsearch
    API-->>FE: HTTP 201 Created
    HR->>FE: Mo man hinh ATS Kanban Pipeline
    FE->>API: GET /api/v1/job/applications/?job_id=...
    API-->>FE: Danh sach ung vien theo cac cot Kanban
    HR->>FE: Keo ung vien tu cot "Screening" sang "AI Interview"
    FE->>API: PATCH /api/v1/job/applications/{id}/status/
    API->>DB: Cap nhat trang thai sang AI_INTERVIEW_INVITED
    API-->>FE: HTTP 200 OK (Kich hoat email moi phong van tu dong)
```

---

## 3. Luong 3: Phong Van Voice AI Thoi Gian Thuc & Cham Diem Tu Dong

```mermaid
sequenceDiagram
    autonumber
    actor C as Ung Vien (Candidate)
    participant FE as Voice Portal (aila.infohr.vn)
    participant LK as LiveKit SFU (WebRTC)
    participant AG as Python Voice AI Agent
    participant API as Backend DRF API
    participant S3 as MinIO S3

    C->>FE: Mo link phong van tu Email
    FE->>API: POST /api/v1/interview/join-room/
    API-->>FE: Tra ve LiveKit Room Token & Script cau hoi
    FE->>LK: Ket noi WebRTC Audio/Video
    LK->>AG: Dispatch Python Agent tham gia phong
    AG->>LK: Phat giong chao hoi & dat cau hoi 1 (TTS)
    LK-->>C: Nghe tieng noi AI va thay avatar lipsync
    C->>LK: Noi cau tra loi
    LK->>AG: Luong am thanh ung vien
    AG->>AG: Whisper STT -> LLM Danh gia & Trich xuat y chinh
    AG->>LK: Phat cau hoi tiep theo
    Note over C,AG: Lap lai qua trinh cho den khi hoan tat kich ban
    AG->>API: POST /api/v1/interview/complete/ (Ghi nhan cau tra loi & diem)
    LK->>S3: LiveKit Egress xuat file ghi am & video len MinIO
    API->>API: Celery Task: Tao Scorecard PDF chi tiet
    API-->>FE: Cap nhat trang thai AI_INTERVIEW_COMPLETED
```

---

## 4. Luong 4: Kiem Duyet Giay Phep & Tin Dang Tren Admin Portal

1. **Doanh nghiep tai len ho so xac thuc**: Bao gom ten doanh nghiep, ma so thue va hinh anh/PDF Giay phep kinh doanh.
2. **He thong dua vao hang doi tham dinh**: Doanh nghiep chuyen trang thai `VERIFICATION_PENDING`.
3. **Quan tri vien kiem tra doi chieu**: Admin truy cap `admin.infohr.vn`, doi chieu ma so thue tren he thong Dang ky kinh doanh quoc gia.
4. **Phe duyet hoac Yeu cau bo sung**:
   - Neu hop le: Admin phe duyet, trang thai doanh nghiep tro thanh `VERIFIED`. Doanh nghiep duoc phep dang tin cong khai.
   - Neu khong hop le: Admin nhap ly do tu choi, he thong gui thong bao qua Email cho chu doanh nghiep.

---

## 5. Luong 5: Tuyen Dung Lien Thong HRM (Recruit-to-Retire)

```text
[Ung vien Trung Tuyen (Hired) tren ATS Kanban]
                 │
                 ▼
[Tao ban ghi Employee trong phan he Native HRM]
                 │
                 ├─► Gan Phong ban, Chuc vu, Quan ly truc tiep
                 ├─► Lap Hop dong lao dong (Thu viec / Chinh thuc)
                 └─► Khoi tao Quy phep nam (EmployeeLeaveBalance)
                 │
                 ▼
[Phan Ca & Cham Cong Hang Ngay (Time & Attendance)]
                 │
                 ├─► Nhan su quet the (Check-in / Check-out)
                 ├─► Thuat toan ghep ca tu dong (Ho tro ca dem is_overnight)
                 └─► Xu ly don nghi phep (Tru quy phep voi select_for_update)
                 │
                 ▼
[Tong Hop Cong & Tinh Luong Cuoi Thang (Payroll Engine)]
                 │
                 ├─► Tinh ngay cong thuc te, ngay nghi huong luong, nghi khong luong
                 ├─► Tinh luong Gross, phu cap, khau tru BHXH (8%), BHYT (1.5%), BHTN (1%)
                 ├─► Tinh giam tru gia canh ban than (11tr) + nguoi phu thuoc (4.4tr/nguoi)
                 ├─► Tinh thue TNCN theo bieu luy tien 7 bac cua Luat Thue Viet Nam
                 └─► Xuat Phieu luong A4 (@media print) & Khoa so luong (APPROVED / PAID)
```
