# Kien Truc Tong The He Thong (System Architecture)

> **Phan he**: 02-architecture  
> **Tai lieu**: system-architecture.md  
> **Mo hinh**: Monorepo with Dual-Persistence & Subdomain Gateway

---

## 1. Tong Quan Kien Truc Monorepo

He thong Square Tuyen Dung (InfoHR) duoc thiet ke theo triet ly Monorepo, tich hop toan bo cac phan he ung dung vao mot kho ma nguon duy nhat nhung tach biet hoan toan ve ranh gioi thuc thi (Containerized Service Isolation):

```text
square-tuyen-dung/
├── frontend/           # Next.js 16 App Router (Job Seeker, Employer, Admin, HRM)
├── api/                # Django REST Framework Backend, Celery Workers, Business Core
├── voice-ai/           # LiveKit SFU, LiveKit Python Agent, Talking-Head Engine
├── nginx-gateway/      # Reverse Proxy, SSL Termination, Subdomain Router
├── monitoring/         # Prometheus, Grafana, Loki, Promtail, Alertmanager
└── waf/                # ModSecurity Web Application Firewall
```

---

## 2. So Do Tong Quan Luong Mang & Dieu Huong (Traffic Routing Map)

Nguoi dung tu Internet truy cap vao he thong thong qua cong Reverse Proxy Nginx Gateway, duoc bao ve boi lop tuong lua ung dung ModSecurity WAF truoc khi phan phoi toi cac container noi bo:

```mermaid
graph TD
    Client[Nguoi dung / Trinh duyet Web] -->|HTTPS 443| Gateway[Nginx Gateway & ModSecurity WAF]

    Gateway -->|infohr.vn| FE[Frontend Next.js 16 :3000]
    Gateway -->|employer.infohr.vn| FE
    Gateway -->|admin.infohr.vn| FE
    Gateway -->|hrm.infohr.vn| FE
    Gateway -->|aila.infohr.vn| FE

    Gateway -->|/api/*| BE[Backend Django DRF :8000]
    Gateway -->|WebRTC 7880/7881| LK[LiveKit SFU Server]
    Gateway -->|/minio-console/*| MinIOConsole[MinIO Console :9001]

    FE -->|API Calls (JSON)| BE
    FE -->|WebRTC Audio/Video| LK

    BE -->|Giao dich ACID (InnoDB)| MySQL[(MySQL 8.0 Primary DB)]
    BE -->|Inverted Index Sync| ES[(Elasticsearch 7 Search Engine)]
    BE -->|Cache & Task Broker| Redis[(Redis 7 In-Memory Cache)]
    BE -->|S3 Upload/Download| MinIO[(MinIO S3 Object Storage)]

    LK -->|Dispatch Agent Room Event| VoiceAgent[LiveKit Python Voice Agent]
    VoiceAgent -->|STT / TTS Pipeline| VoiceInference[Whisper STT / Vieneu TTS]
    VoiceAgent -->|Ghi nhan ket qua| BE
    LK -->|Egress Video/Audio Recording| MinIO
```

---

## 3. Chien Luoc Luu Tru Kep (Dual-Persistence Strategy)

De toi uu hoa dong thoi ca hai yeu cau doi lap: (1) Tinh toan ven du lieu giao dich cao cap (ACID) va (2) Toc do tim kiem toan van duoi 100ms tren tap du lieu lon, he thong ap dung kien truc Dual-Persistence:

1. **MySQL 8.0 (Primary Relational Store)**:
   - Dong vai tro nguon du lieu goc (Single Source of Truth).
   - Chi chiu trach nhiem luu tru du lieu giao dich, quan he giua cac thuc the (User, Company, JobPost, Application, AttendanceRecord, PayrollLedger).
   - Su dung engine InnoDB voi `utf8mb4` dam bao ho tro tieng Viet co dau hoan hao.
2. **Elasticsearch 7.17 (Search & Analytics Engine)**:
   - Duoc dong bo bat dong bo tu MySQL thong qua cac Celery tasks va Django signals.
   - Luu tru inverted index cho cac model `JobPost` va `CandidateProfile`.
   - Cung cap tinh nang tim kiem toan van khong dau, fuzzy matching, sap xep theo do phu hop va khoang cach dia ly (Geo-distance).
3. **Redis 7.0 (Fast Memory Store)**:
   - Dong vai tro bo nho dem (Cache) giam tai cho MySQL.
   - Broker tin nhan cho Celery background tasks.
   - Quan ly phien lam viec va cache du lieu LiveKit room tokens.
4. **MinIO S3 (Blob & Media Storage)**:
   - Luu tru toan bo file nhi phan: File PDF CV ung vien, anh avatar, ban ghi am MP3/WAV, video MP4 cua buoi phong van, va file Scorecard PDF duoc tao tu dong.
   - Truy cap an toan thong qua co che Pre-signed URL co thoi han.
