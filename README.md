# 🚀 Square Tuyển Dụng (InfoHR)

<div align="center">

**Hệ sinh thái Tuyển dụng Thông minh & Nền tảng Phỏng vấn AI bằng Giọng nói (Voice AI Interviewer) Thời gian thực**

[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2016-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/UI-React%2019%20%2B%20MUI%206%20%2B%20Tailwind%20v4-blue?style=flat-square&logo=react)](https://react.dev/)
[![Django](https://img.shields.io/badge/Backend-Django%204.2%2B%20%2F%20DRF-092E20?style=flat-square&logo=django)](https://www.djangoproject.com/)
[![LiveKit](https://img.shields.io/badge/WebRTC-LiveKit%20Server%20%26%20Agent-00ADD8?style=flat-square&logo=webrtc)](https://livekit.io/)
[![MySQL](https://img.shields.io/badge/Database-MySQL%208.0-4479A1?style=flat-square&logo=mysql)](https://www.mysql.com/)
[![Elasticsearch](https://img.shields.io/badge/Search-Elasticsearch%207.17-005571?style=flat-square&logo=elasticsearch)](https://www.elastic.co/)
[![MinIO](https://img.shields.io/badge/Storage-MinIO%20S3-C72C48?style=flat-square&logo=minio)](https://min.io/)
[![Docker](https://img.shields.io/badge/Orchestration-Docker%20Compose-2496ED?style=flat-square&logo=docker)](https://www.docker.com/)

</div>

---

## 📋 Mục Lục

1. [Giới Thiệu Chung](#-giới-thiệu-chung)
2. [Hệ Thống Cổng Dịch Vụ (Portals & URLs)](#-hệ-thống-cổng-dịch-vụ-portals--urls)
3. [Kiến Trúc Hệ Thống (System Architecture)](#-kiến-trúc-hệ-thống-system-architecture)
4. [Bảng Công Nghệ Chi Tiết (Tech Stack)](#-bảng-công-nghệ-chi-tiết-tech-stack)
5. [Cấu Trúc Thư Mục Dự Án](#-cấu-trúc-thư-mục-dự-án)
6. [Các Tính Năng Trọng Tâm](#-các-tính-năng-trọng-tâm)
7. [Hệ Thống Phỏng Vấn Voice AI & Pipeline](#-hệ-thống-phỏng-vấn-voice-ai--pipeline)
8. [Hướng Dẫn Cài Đặt & Triển Khai](#-hướng-dẫn-cài-đặt--triển-khai)
   - [Yêu Cầu Môi Trường](#yêu-cầu-môi-trường)
   - [Triển Khai Bằng Docker Compose (Khuyên dùng)](#1-triển-khai-bằng-docker-compose-khuyên-dùng)
   - [Phát Triển Môi Trường Local (Non-Docker)](#2-phát-triển-môi-trường-local-non-docker)
9. [Cấu Hình Biến Môi Trường (.env)](#-cấu-hình-biến-môi-trường-env)
10. [Vận Hành, Sao Lưu & Bảo Trì](#-vận-hành-sao-lưu--bảo-trì)
11. [Tài Liệu Chi Tiết Bổ Sung](#-tài-liệu-chi-tiết-bổ-sung)
12. [Bản Quyền](#-bản-quyền)

---

## 🌟 Giới Thiệu Chung

**Square Tuyển Dụng** (thương hiệu **InfoHR**) là nền tảng tuyển dụng việc làm thế hệ mới, tối ưu hóa quy trình kết nối giữa Ứng viên (Job Seeker) và Nhà tuyển dụng (Employer). 

Điểm đột phá của hệ thống là **Phòng phỏng vấn AI bằng giọng nói thời gian thực (Real-time Voice AI Interviewer)** ứng dụng công nghệ WebRTC (LiveKit) kết hợp các mô hình ngôn ngữ lớn (LLM), tổng hợp giọng nói tiếng Việt tự nhiên (TTS), nhận dạng giọng nói tức thời (STT) và tự động xuất báo cáo đánh giá năng lực ứng viên định dạng PDF.

---

## 🌐 Hệ Thống Cổng Dịch Vụ (Portals & URLs)

| Cổng Dịch Vụ | Tên Miền / Đường Dẫn | Chức Năng Chính |
|--------------|----------------------|-----------------|
| **Ứng Viên (Job Seeker)** | `https://infohr.vn` | Tìm việc, nộp CV, tạo CV online, luyện tập & tham gia phỏng vấn AI |
| **Nhà Tuyển Dụng (Employer)** | `https://employer.infohr.vn` <br>*(hoặc `https://infohr.vn/employer/`)* | Đăng tin tuyển dụng, quản lý hồ sơ ứng viên, cấu hình kịch bản phỏng vấn AI, xem báo cáo phỏng vấn |
| **Quản Trị Viên (Admin)** | `https://admin.infohr.vn` <br>*(hoặc `https://infohr.vn/admin/`)* | Quản lý người dùng, duyệt tin, phân quyền, cấu hình hệ thống, kiểm duyệt |
| **Nền Tảng Phỏng Vấn AI** | `https://aila.infohr.vn` | Trung tâm phỏng vấn tự động hóa giọng nói & video AI |
| **Quản Trị Nhân Sự (HRM)** | `https://hrm.infohr.vn` | Quản lý nhân sự nội bộ, tính lương (Payroll Engine), theo dõi nhân sự |
| **MinIO S3 Object Storage** | `https://s3.infohr.vn:4433` | Lưu trữ tập trung CV, hình ảnh, video ghi hình và file ghi âm phỏng vấn |
| **MinIO Admin Console** | `https://infohr.vn/minio-console/` | Giao diện web quản lý bucket S3 |
| **Tài Liệu API (Swagger / ReDoc)** | `https://infohr.vn/swagger/` <br> `https://infohr.vn/redoc/` | OpenAPI Documentation tương tác trực tiếp |

---

## 🏗️ Kiến Trúc Hệ Thống (System Architecture)

```
                              ┌────────────────────────┐
                              │     Internet Clients   │
                              │ (Browser / Mobile Web) │
                              └───────────┬────────────┘
                                          │ HTTPS (:443) / WSS (:443)
                                          ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           NGINX GATEWAY CONTAINER (:80)                         │
│   • SSL Termination          • Subdomain Routing           • Rate Limiting      │
│   • Security Headers (HSTS)  • MinIO Console Proxy         • WebRTC WS Upgrade  │
└───────┬───────────────────┬───────────────────┬───────────────────┬─────────────┘
        │                   │                   │                   │
        │ HTTP              │ HTTP (:8000)      │ WS/WebRTC (:7880) │ HTTP (:9000/9001)
        ▼                   ▼                   ▼                   ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Frontend   │    │   Backend    │    │   LiveKit    │    │    MinIO     │
│   (Next.js)  │    │  (Gunicorn)  │    │    Server    │    │ (S3 Storage) │
└──────────────┘    └───────┬──────┘    └───────┬──────┘    └───────▲──────┘
                            │                   │                   │
                ┌───────────┴───────────┐       │                   │
                │        Celery         │       │ Egress (Recording)│
                │    Worker & Beat      │       └─────────┬─────────┘
                └───────────┬───────────┘                 │
                            │                             │
    ┌───────────────────────┼─────────────────────────────┴────────┐
    ▼                       ▼                                      ▼
┌─────────────────────────────────────────┐             ┌─────────────────────┐
│               Data Layer                │             │  LiveKit Egress     │
│ ┌─────────────┐ ┌─────────┐ ┌─────────┐ │             │ Ghi hình/âm tự động │
│ │  MySQL 8.0  │ │ Redis 7 │ │  ES 7   │ │             │ đẩy lên S3 MinIO    │
│ └──────┬──────┘ └─────────┘ └─────────┘ │             └─────────────────────┘
│        │                                │
│ ┌──────▼──────┐                         │
│ │  DB Backup  │ (mysqldump gzip tự động)│
│ └─────────────┘                         │
└─────────────────────────────────────────┘
                            │
                            │ Internal RPC / REST
                            ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            AI & VOICE PIPELINE                                  │
│                                                                                 │
│   ┌────────────────────────┐                   ┌────────────────────────────┐   │
│   │   LiveKit Agent        │                   │    Cloud AI Providers      │   │
│   │ (square-ai-interviewer)│ ◄─ STT/TTS API ─► │ MetaConnect (TTS/STT-vi)   │   │
│   │ Python LiveKit SDK     │                   │ OpenAI-compatible LLM      │   │
│   └───────────┬────────────┘                   └────────────────────────────┘   │
│               │                                                                 │
│               │ Optional Fallback (profile: local-gpu)                          │
│               ▼                                                                 │
│   ┌────────────────────────┐                   ┌────────────────────────────┐   │
│   │ Faster-Whisper Large v3│                   │ VieNeu-TTS v3 Turbo        │   │
│   │ (STT cục bộ trên GPU)  │                   │ (TTS giọng nói tự nhiên)   │   │
│   └────────────────────────┘                   └────────────────────────────┘   │
│                                                                                 │
│   ┌────────────────────────┐                                                    │
│   │ NotebookLM MCP Service │ (Model Context Protocol kết nối tài liệu tri thức) │
│   └────────────────────────┘                                                    │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Bảng Công Nghệ Chi Tiết (Tech Stack)

### 1. Frontend Web App
- **Framework**: **Next.js 16** (App Router, tối ưu SSR và Client Components)
- **UI & Styling**: **React 19**, **Material UI 6**, **Tailwind CSS v4** (`@tailwindcss/postcss`), **Emotion**, **Sonner** (Toast)
- **Animation & Motion**: **GSAP 3**, **Framer Motion** (`motion`), **Swiper**
- **State Management**: **Redux Toolkit**, **TanStack React Query v5** (Server State Caching), **TanStack Table v8**
- **WebRTC & Real-time**: **LiveKit Client v2**, `@livekit/components-react`, **Firebase Realtime Database & FCM**
- **Forms & Validation**: **React Hook Form**, **Yup**
- **Bản đồ & Địa chỉ**: **Leaflet**, **Goong API** (Bản đồ số Việt Nam)
- **Đa ngôn ngữ**: **i18next**, **react-i18next** (Hỗ trợ Tiếng Việt & Tiếng Anh)
- **Kiểm thử**: **Jest**, **Playwright** E2E, Testing Library

### 2. Backend API
- **Ngôn ngữ & Framework**: **Python 3.11+**, **Django 4.2+ / 5.x**, **Django REST Framework (DRF)**
- **WSGI / Server**: **Gunicorn** tích hợp worker **Gevent** (High Concurrency)
- **Tác vụ nền & Lập lịch**: **Celery 5**, **Celery Beat** (`django-celery-beat` với DatabaseScheduler)
- **Xác thực & Bảo mật**: **OAuth 2.0** (`django-oauth-toolkit`, `drf-social-oauth2`), **JWT**, **OTP** (`django-otp`), Google Sign-In, Facebook Login
- **Tài liệu API**: **drf-yasg** (Swagger 2.0 & ReDoc tương thích OpenAPI)
- **Xử lý tài liệu & PDF**: **PyMuPDF (fitz)**, **python-docx**, **Pillow**, xuất báo cáo đánh giá phỏng vấn tự động

### 3. Dữ Liệu & Lưu Trữ
- **Cơ sở dữ liệu chính**: **MySQL 8.0** (`utf8mb4_unicode_ci`)
- **Tự động sao lưu**: Dịch vụ `tuyendung-studio-db-backup` (chạy định kỳ 24h, zero-downtime mysqldump, nén gzip, tự xóa bản lưu > 30 ngày)
- **Bộ nhớ đệm & Broker**: **Redis 7** (Caching response, session, rate-limit, Celery broker)
- **Công cụ tìm kiếm**: **Elasticsearch 7.17** (`django-elasticsearch-dsl`) tối ưu tìm kiếm việc làm, địa điểm, từ khóa
- **Lưu trữ đối tượng (Object Storage)**: **MinIO** (Chuẩn tương thích AWS S3)

### 4. Voice AI & Xử Lý Âm Thanh
- **WebRTC Server**: **LiveKit Server** (phân phối luồng âm thanh/video p2p và SFU)
- **LiveKit Egress**: Container chuyên dụng ghi hình phiên phỏng vấn và xuất trực tiếp lên MinIO
- **Voice Agent**: Python LiveKit Agent (`square-ai-interviewer`) điều phối luồng hỏi đáp, ngắt lời (VAD), lắng nghe ứng viên và phản hồi bằng giọng nói
- **STT (Speech-to-Text)**: MetaConnect Cloud (`asr-vi`) hoặc Faster-Whisper Large v3 Turbo (Local GPU)
- **TTS (Text-to-Speech)**: MetaConnect Cloud (`tts-vi` - Giọng Trúc Ly,...) hoặc VieNeu-TTS v3 Turbo
- **Tri thức AI**: **NotebookLM MCP Service** phục vụ truy xuất thông tin ngữ cảnh ứng viên và tiêu chuẩn tuyển dụng

---

## 📁 Cấu Trúc Thư Mục Dự Án

```
square-tuyen-dung/
├── api/                         # Backend Django REST Framework
│   ├── apps/                    # Các module ứng dụng chính
│   │   ├── accounts/            # Quản lý tài khoản, OAuth, OTP, phân quyền
│   │   ├── agent_assistants/    # Cấu hình AI Assistant, Planner, Tool Registry
│   │   ├── chatbot/             # Luồng chat AI tư vấn ứng viên & nhà tuyển dụng
│   │   ├── common/              # Models, mixins, serializers dùng chung
│   │   ├── content/             # Quản lý bài viết, tin tức, banner, FAQ
│   │   ├── cv_builder/          # Hệ thống tạo & xuất mẫu CV trực tuyến
│   │   ├── exchange/            # Trao đổi & kết nối ứng viên - nhà tuyển dụng
│   │   ├── files/               # Quản lý file, presigned URL MinIO S3
│   │   ├── hrm/                 # Phân hệ HRM: quản lý nhân sự, payroll engine
│   │   ├── interviews/          # Quản lý phiên phỏng vấn AI, chấm điểm, xuất PDF
│   │   ├── jobs/                # Quản lý tin tuyển dụng, ngành nghề, ứng tuyển
│   │   ├── locations/           # Tỉnh thành, quận huyện, tích hợp Goong API
│   │   ├── operations/          # Ghi log vận hành, kiểm toán hệ thống
│   │   └── profiles/            # Hồ sơ ứng viên, thông tin doanh nghiệp
│   ├── config/                  # Cấu hình dự án Django, settings, urls, celery
│   ├── integrations/            # Tích hợp ngoại vi (AI, LiveKit, NotebookLM MCP)
│   ├── scripts/                 # Scripts tiện ích & seed dữ liệu
│   ├── shared/                  # Utilities, permissions, helpers
│   ├── Dockerfile               # Dockerfile môi trường development
│   └── Dockerfile.prod          # Dockerfile tối ưu production
├── frontend/                    # Ứng dụng Next.js 16 + React 19
│   ├── src/
│   │   ├── app/                 # Next.js App Router (Multi-portal: candidate, employer, admin)
│   │   ├── components/          # Reusable UI Components
│   │   ├── configs/             # Cấu hình biến môi trường, constants
│   │   ├── hooks/               # Custom React Hooks
│   │   ├── i18n/                # Cấu hình đa ngôn ngữ (vi, en)
│   │   ├── redux/               # Quản lý Global State Redux
│   │   ├── services/            # Tầng giao tiếp API Backend
│   │   ├── types/               # TypeScript interfaces & types
│   │   └── views/               # Giao diện chi tiết theo từng màn hình
│   ├── public/                  # Tài nguyên tĩnh, sitemap.xml, robots.txt
│   ├── Dockerfile               # Dockerfile development
│   └── Dockerfile.prod          # Dockerfile multi-stage production
├── voice-ai/                    # Phân hệ Voice AI & Phỏng vấn trực tuyến
│   ├── inference/               # Model inference cục bộ (Whisper, VieNeu-TTS)
│   ├── livekit_agent/           # LiveKit Voice Agent (Python)
│   ├── livekit-configs/         # Cấu hình LiveKit Server & Redis
│   └── docker-compose.gpu.yml   # Compose mở rộng dành cho máy chủ GPU
├── nginx-gateway/               # Nginx Reverse Proxy Gateway
│   ├── nginx.conf               # Định tuyến đa tên miền, bảo mật, caching
│   └── Dockerfile               # Nginx container
├── notebooklm-mcp/              # MCP Server kết nối Google NotebookLM
├── backups/                     # Thư mục lưu trữ các file backup DB tự động (.sql.gz)
├── docs/                        # Tài liệu hệ thống chi tiết
│   ├── ENVIRONMENT_AUDIT.md     # Báo cáo kiểm định biến môi trường
│   ├── MIGRATIONS.md            # Hướng dẫn xử lý migration cơ sở dữ liệu
│   └── START_GUIDE.md           # Hướng dẫn khởi động nhanh cho lập trình viên
├── docker-compose.yml           # File điều phối chính toàn bộ hệ thống (Single Source of Truth)
└── README.md                    # Tài liệu hướng dẫn chính
```

---

## ✨ Các Tính Năng Trọng Tâm

### 1. Dành cho Ứng viên (Job Seeker)
- **Tìm kiếm thông minh**: Lọc việc làm theo ngành nghề, địa điểm (tỉnh/thành, quận/huyện), mức lương, cấp bậc, loại hình công việc với Elasticsearch.
- **Trình tạo CV Trực Tuyến (CV Builder)**: Chọn mẫu thiết kế chuyên nghiệp, điền thông tin trực quan, kéo thả bố cục và xuất file PDF chuẩn hóa.
- **Phòng Phỏng Vấn AI Trực Tuyến (AILA)**:
  - Nhận link tham gia phòng phỏng vấn AI với Token an toàn.
  - Phỏng vấn 1-1 bằng giọng nói với AI Interviewer (WebRTC có độ trễ cực thấp).
  - Tự động nhận diện câu trả lời bằng giọng nói và hiển thị câu hỏi linh hoạt.
  - Xem lại điểm đánh giá năng lực, ưu điểm, nhược điểm và nhận xét chuyên sâu từ AI.
- **Luyện tập phỏng vấn (Practice Mode)**: Cho phép ứng viên tự luyện phản xạ và nhận góp ý trước khi bước vào phỏng vấn chính thức.
- **Quản lý ứng tuyển**: Theo dõi trạng thái hồ sơ (đã nộp, được duyệt, mời phỏng vấn, trúng tuyển).

### 2. Dành cho Nhà tuyển dụng (Employer)
- **Đăng tin tuyển dụng**: Soạn thảo JD với trình soạn thảo phong phú, tích hợp gợi ý AI.
- **Cấu hình kịch bản Phỏng Vấn AI**:
  - Tùy biến bộ câu hỏi phỏng vấn theo vị trí.
  - Cấu hình tiêu chí chấm điểm (Rubrics) chi tiết cho từng câu hỏi.
  - Chọn giọng đọc AI phù hợp (nam/nữ, ngữ điệu, tốc độ đọc).
- **Quản lý Ứng viên & Báo cáo Đánh giá**:
  - Xem video/audio ghi hình lại toàn bộ buổi phỏng vấn (lưu trên MinIO S3).
  - Xem bản ghi chép cuộc hội thoại (Transcript) có dấu thời gian.
  - Tải báo cáo đánh giá ứng viên (Evaluation Report PDF) được chấm điểm tự động theo tiêu chí.
- **Hệ thống Quản lý Nhân sự (Native HRM)**: Quản lý hồ sơ nhân viên nội bộ, nấc thang lương và công cụ tính lương (Payroll Engine).

### 3. Dành cho Quản trị viên (Admin)
- Quản trị toàn bộ danh mục ngành nghề, kỹ năng, bài viết blog, banner trang chủ.
- Kiểm duyệt tin đăng tuyển dụng và hồ sơ doanh nghiệp.
- Theo dõi log hoạt động, nhật ký hệ thống (Operations Log) và kiểm soát tài nguyên GPU.
- Cấu hình hệ thống linh hoạt thông qua giao diện Quản trị.

---

## 🎙️ Hệ Thống Phỏng Vấn Voice AI & Pipeline

```
[Ứng viên nói vào Mic] 
         │ 
         ▼ (WebRTC Audio Stream)
[LiveKit Server] 
         │ 
         ▼ (Audio Frame)
[LiveKit Voice Agent] ──(Silero VAD)──► [Phát hiện bắt đầu / ngừng nói]
         │
         ├──► [Speech-to-Text: MetaConnect / Whisper] ──► [Văn bản câu trả lời]
         │
         ├──► [Backend API: /interview/compat/.../context] 
         │         │ (Phân tích câu trả lời với tiêu chí JD/Rubric)
         │         ▼
         ├──► [LLM: Qwen / GPT / MetaConnect] ──► [Câu phản hồi & Câu hỏi tiếp theo]
         │
         └──► [Text-to-Speech: MetaConnect / VieNeu-TTS] ──► [Audio giọng nói AI]
         │
         ▼ (WebRTC Audio Stream ngược về trình duyệt)
[Ứng viên nghe AI phỏng vấn viên nói]
```

- **LiveKit Egress**: Chạy ngầm độc lập ghi lại video/audio của ứng viên, tự động đồng bộ lên MinIO S3 khi phiên kết thúc.
- **Độ trễ thấp (Low-latency)**: Thiết kế luồng stream tối ưu dưới 1.5 giây giữa khi ứng viên kết thúc câu nói và khi AI bắt đầu phản hồi.

---

## 🚀 Hướng Dẫn Cài Đặt & Triển Khai

### Yêu Cầu Môi Trường
- **Hệ điều hành**: Linux (Ubuntu 22.04+ khuyên dùng cho Production) hoặc Windows 10/11 (WSL2), macOS.
- **Docker & Docker Compose**: Docker Engine v24+, Docker Compose v2.20+.
- **Phần cứng đề xuất**:
  - Tối thiểu: 4 Cores CPU, 8GB RAM, 50GB ổ cứng trống.
  - Khuyên dùng (có local Voice AI): 8 Cores CPU, 16GB+ RAM, NVIDIA GPU (RTX 3060 / A10 / T4 hoặc cao hơn) có cài sẵn NVIDIA Container Toolkit.

---

### 1. Triển Khai Bằng Docker Compose (Khuyên Dùng)

#### Bước 1: Clone Repository
```bash
git clone https://github.com/Leducnamtek123/square-tuyen-dung.git
cd square-tuyen-dung
```

#### Bước 2: Cấu hình biến môi trường
```bash
# Tạo file .env từ file mẫu
cp .env.example .env
```
> Mở file `.env` và cập nhật các thông số bảo mật: `DB_PASSWORD`, `SECRET_KEY`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, thông tin S3 và API Key AI.

#### Bước 3: Khởi động hệ thống
```bash
# Build và chạy ngầm toàn bộ các containers
docker compose up -d --build
```

#### Bước 4: Chạy Migration và Seed dữ liệu mẫu (lần đầu)
```bash
# Chạy migration
docker compose run --rm migrate

# Khởi tạo dữ liệu mẫu cho hệ thống
docker compose exec backend python manage.py seed_all
```

#### Bước 5: Kiểm tra trạng thái các dịch vụ
```bash
docker compose ps
```
Tất cả các container chính (`nginx-gateway`, `frontend`, `backend`, `db`, `redis`, `elasticsearch`, `minio`, `livekit`, `livekit-agent`, `db-backup`) phải ở trạng thái **healthy** hoặc **running**.

---

### 2. Phát Triển Môi Trường Local (Non-Docker)

Dành cho lập trình viên muốn phát triển code trực tiếp trên máy cá nhân:

#### A. Khởi động các dịch vụ phụ trợ (DB, Redis, S3, ES)
```bash
# Chỉ chạy các container dữ liệu
docker compose up -d db redis elasticsearch minio minio-init
```

#### B. Chạy Backend (Django)
```bash
cd api

# Tạo và kích hoạt virtual environment
python -m venv venv
# Trên Windows:
venv\Scripts\activate
# Trên Linux/macOS:
source venv/bin/activate

# Cài đặt dependencies
pip install -r requirements.txt

# Chạy migration
python manage.py migrate

# Khởi động server Django (mặc định port 8000)
python manage.py runserver 0.0.0.0:8000
```

#### C. Chạy Frontend (Next.js)
```bash
cd frontend

# Cài đặt thư viện bằng pnpm (hoặc npm)
pnpm install

# Khởi động dev server
pnpm dev
```
Truy cập giao diện tại: `http://localhost:3000`

---

## ⚙️ Cấu Hình Biến Môi Trường (.env)

Hệ thống sử dụng một file `.env` duy nhất tại thư mục gốc làm **Single Source of Truth** cho toàn bộ docker-compose:

| Nhóm Cấu Hình | Biến Quan Trọng | Ý Nghĩa / Giá Trị Mẫu |
|---------------|-----------------|------------------------|
| **Cơ sở dữ liệu** | `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST` | Thông số kết nối MySQL (`square_db`, `root`) |
| **Bảo mật Django** | `SECRET_KEY`, `DEBUG`, `ALLOWED_HOSTS` | Khóa bí mật Django, chế độ gỡ lỗi và danh sách host cho phép |
| **Object Storage (MinIO)** | `MINIO_ROOT_USER`, `MINIO_ROOT_PASSWORD`, `MINIO_BUCKET` | Thông tin tài khoản MinIO S3 (`square`) |
| **WebRTC (LiveKit)** | `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, `LIVEKIT_URL` | Khóa xác thực kết nối LiveKit Server |
| **Google OAuth 2.0** | `NEXT_PUBLIC_GOOGLE_CLIENT_ID`, `SOCIAL_AUTH_GOOGLE_OAUTH2_KEY`, `SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET` | Client ID cho frontend và backend để đăng nhập Google |
| **AI Cloud Services** | `AI_TTS_BASE_URL`, `AI_TTS_API_KEY`, `AI_STT_BASE_URL`, `AI_STT_API_KEY` | Thông số kết nối Cloud STT / TTS (MetaConnect) |
| **LiveKit Agent Secret** | `INTERVIEW_AGENT_SHARED_SECRET` | Khóa bí mật chia sẻ giữa Django Backend và LiveKit Agent container |
| **Firebase** | `NEXT_PUBLIC_FIREBASE_*`, `FIREBASE_CREDENTIALS_PATH` | Cấu hình thông báo đẩy và kết nối Firebase Realtime DB |
| **Bản đồ Goong** | `NEXT_PUBLIC_GOONGAPI_KEY` | Khóa API định vị địa chỉ Việt Nam |

> ⚠️ **Lưu ý về Google OAuth**: Khi triển khai tên miền mới (ví dụ: `https://infohr.vn` và `https://www.infohr.vn`), bắt buộc phải thêm cả 2 địa chỉ vào mục **Authorized JavaScript origins** và **Authorized redirect URIs** trên [Google Cloud Console](https://console.cloud.google.com/apis/credentials) để tránh lỗi `origin_mismatch`.

---

## 🛡️ Vận Hành, Sao Lưu & Bảo Trì

### 1. Tự Động Sao Lưu Cơ Sở Dữ Liệu (Daily DB Backup)
Container `tuyendung-studio-db-backup` được cấu hình tự động:
- Thực hiện dump database không làm gián đoạn dịch vụ (`--single-transaction --quick`).
- Tự động nén định dạng `.sql.gz` và lưu vào thư mục `./backups/`.
- Tự động dọn dẹp các bản backup cũ hơn **30 ngày**.

**Lệnh phục hồi (Restore) thủ công khi cần:**
```bash
# Giải nén và import vào database
gunzip < backups/db_backup_square_YYYY-MM-DD_HHMMSS.sql.gz | docker compose exec -T db mysql -u root -p<DB_PASSWORD> square_db
```

### 2. Quản Lý & Tái Lập Chỉ Mục Elasticsearch
Khi cập nhật dữ liệu việc làm hàng loạt hoặc cấu hình trường tìm kiếm mới:
```bash
docker compose exec backend python manage.py search_index --rebuild -f
```

### 3. Kiểm Tra Sức Khỏe Toàn Diện (Healthcheck)
```bash
# Kiểm tra backend healthcheck
curl -k https://infohr.vn/api/common/health/

# Kiểm tra log LiveKit Agent
docker compose logs -f livekit-agent

# Kiểm tra log Nginx Gateway
docker compose logs -f nginx-gateway
```

---

## 📚 Tài Liệu Chi Tiết Bổ Sung

Để tìm hiểu sâu hơn về từng phân hệ, vui lòng tham khảo các tài liệu chuyên đề:
- 📖 [Tài liệu Backend API chi tiết](api/README.md)
- 💻 [Tài liệu Frontend Next.js chi tiết](frontend/README.md)
- 🎙️ [Tài liệu Kiến trúc Voice AI](voice-ai/README.md)
- 🔍 [Báo cáo Kiểm định Biến Môi Trường (Environment Audit)](docs/ENVIRONMENT_AUDIT.md)
- 🗃️ [Quy trình Quản lý Migration DB](docs/MIGRATIONS.md)
- 🧭 [Hướng dẫn Bắt đầu Nhanh (Start Guide)](docs/START_GUIDE.md)

---

## 📄 Bản Quyền

Bản quyền thuộc về **Square Group Vietnam** (© 2026). Mọi quyền được bảo lưu.
