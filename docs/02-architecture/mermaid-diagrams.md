# Bo So Do Kien Truc Mermaid (Mermaid Diagrams)

> **Phan he**: 02-architecture  
> **Tai lieu**: mermaid-diagrams.md  
> **Ecosystem**: Square Tuyen Dung (InfoHR)

---

## 1. C4 Context Diagram: He Sinh Thai InfoHR

```mermaid
graph TD
    JobSeeker["Job Seeker (Ung Vien)"]
    Recruiter["Recruiter / Employer (Nha Tuyen Dung)"]
    HRStaff["HRM Specialist (Nhan Su Noi Bo)"]
    Admin["System Administrator (Quan Tri Vien)"]

    subgraph InfoHRSystem["Square Tuyen Dung (InfoHR Platform)"]
        FrontendPortal["Multi-Portal Frontend (Next.js 16)"]
        BackendCore["Backend Core API & Services (Django DRF)"]
        VoiceAIEngine["Voice AI WebRTC Center (LiveKit + Agent)"]
        NativeHRM["Native HRM Subsystem (Attendance & Payroll)"]
    end

    ThirdPartyAuth["Google OAuth2"]
    ThirdPartyStorage["MinIO S3 Compatible Storage"]
    Notifications["Telegram / Email Service"]

    JobSeeker -->|Tim viec, nop CV, phong van| FrontendPortal
    Recruiter -->|Dang tin, xem ATS, danh gia| FrontendPortal
    HRStaff -->|Cham cong, tinh luong, hop dong| FrontendPortal
    Admin -->|Kiem duyet, cau hinh he thong| FrontendPortal

    FrontendPortal --> BackendCore
    FrontendPortal -->|WebRTC Audio/Video| VoiceAIEngine
    BackendCore --> NativeHRM
    BackendCore --> ThirdPartyAuth
    BackendCore --> ThirdPartyStorage
    BackendCore --> Notifications
    VoiceAIEngine --> ThirdPartyStorage
```

---

## 2. Container Diagram: Cac Phan He Chuc Nang

```mermaid
graph LR
    subgraph ClientLayer["Lop Giao Dien Nguoi Dung"]
        WebJS["Cong Ung Vien (infohr.vn)"]
        WebEM["Cong Doanh Nghiep (employer.infohr.vn)"]
        WebAI["Cong Voice AI (aila.infohr.vn)"]
        WebHR["Cong HRM (hrm.infohr.vn)"]
        WebAD["Cong Quan Tri (admin.infohr.vn)"]
    end

    subgraph GatewayLayer["Lop Gateway & Bao Ve"]
        NginxGateway["Nginx Gateway & ModSecurity WAF"]
    end

    subgraph AppLayer["Lop Xu Ly Ung Dung"]
        NextServer["Next.js 16 App Server (:3000)"]
        DjangoAPI["Django DRF Core API (:8000)"]
        LiveKitSFU["LiveKit WebRTC Server (:7880)"]
        VoiceAgent["LiveKit Python Agent Worker"]
        CeleryWorker["Celery Background Worker"]
    end

    subgraph DataLayer["Lop Co So Du Lieu & Luu Tru"]
        MySQL[(MySQL 8.0 Primary DB)]
        Elasticsearch[(Elasticsearch 7 Search)]
        Redis[(Redis 7 Cache & Broker)]
        MinIO[(MinIO S3 Media Storage)]
    end

    WebJS & WebEM & WebAI & WebHR & WebAD -->|HTTPS| NginxGateway
    NginxGateway -->|Next.js SSR| NextServer
    NginxGateway -->|REST API| DjangoAPI
    NginxGateway -->|WebRTC| LiveKitSFU

    DjangoAPI --> MySQL
    DjangoAPI --> Elasticsearch
    DjangoAPI --> Redis
    DjangoAPI --> MinIO

    CeleryWorker --> Redis
    CeleryWorker --> MySQL
    CeleryWorker --> Elasticsearch
    CeleryWorker --> MinIO

    LiveKitSFU --> VoiceAgent
    VoiceAgent --> DjangoAPI
    VoiceAgent --> MinIO
```

---

## 3. Data Flow Diagram: Tien Trinh Tu Luc Nop CV Den Cham Diem AI

```mermaid
flowchart TD
    A["Ung vien nop CV (PDF / Builder)"] --> B["Backend nhan & luu file vao MinIO S3"]
    B --> C["Tao ban ghi Application (Trang thai: APPLIED)"]
    C --> D["Recruiter duyet ho so tren ATS Kanban"]
    D --> E["Chuyen trang thai sang AI_INTERVIEW_INVITED"]
    E --> F["He thong gui email moi kem ma Token phong van"]
    F --> G["Ung vien truy cap aila.infohr.vn va ket noi WebRTC"]
    G --> H["LiveKit SFU dispatch Voice AI Agent tham gia phong"]
    H --> I["AI Agent phong van theo bo cau hoi (STT -> LLM -> TTS)"]
    I --> J["Ghi lai audio & video dua vao MinIO S3"]
    J --> K["Celery Worker phan tich & tao Scorecard PDF"]
    K --> L["Cap nhat trang thai: AI_INTERVIEW_COMPLETED"]
    L --> M["Recruiter xem Scorecard va quyet dinh OFFER / REJECT"]
    M --> N["Khi ung vien nhan viec (HIRED) -> Tu dong tao Employee trong HRM"]
```
