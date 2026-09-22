# 🏛️ Kiến Trúc Hệ Thống — Square Tuyển Dụng (InfoHR)

> **Dự án**: Square Tuyển Dụng (Thương hiệu: InfoHR)  
> **Phiên bản**: 2.0 (Next.js 16 + Django 4.2 + LiveKit WebRTC Voice AI)  
> **Kiến trúc trực quan tương tác (Interactive Archify)**:
> - 🌐 **Bản đồ kiến trúc tổng thể**: [docs/architecture/system-architecture.html](architecture/system-architecture.html)
> - 🎙️ **Quy trình Phỏng vấn Voice AI thời gian thực**: [docs/architecture/voice-ai-interview.sequence.html](architecture/voice-ai-interview.sequence.html)

---

## 1. 🌐 Tổng Quan Kiến Trúc (Executive Architecture Overview)

**Square Tuyển Dụng (InfoHR)** là nền tảng tuyển dụng thông minh kết hợp hệ thống phỏng vấn ứng viên tự động thời gian thực bằng Voice AI (WebRTC). Hệ thống được đóng gói theo mô hình monorepo microservices/containerized với Docker Compose, phân tách rõ ràng giữa lớp Gateway, Frontend, Core Backend API, Voice AI WebRTC Media Server, Asynchronous Task Workers và Data/Object Storage.

```
                                    ┌────────────────────────┐
                                    │    Job Seekers & HR    │
                                    │ (Web & Mobile Clients) │
                                    └───────────┬────────────┘
                                                │ HTTPS / WSS
                                                ▼
                                    ┌────────────────────────┐
                                    │     Nginx Gateway      │
                                    │   (SSL & Subdomains)   │
                                    └─────┬────────────┬─────┘
                     HTTP /proxy (80)     │            │ WebRTC Signal (7880)
             ┌────────────────────────────┘            └───────────────────────────┐
             ▼                                                                     ▼
┌─────────────────────────┐                                           ┌─────────────────────────┐
│     Next.js 16 Web      │                                           │       LiveKit SFU       │
│  (Portals & App Router) │                                           │   (WebRTC Audio/Video)  │
└────────────┬────────────┘                                           └────────────┬────────────┘
             │ REST API (:8000)                                                    │ Room Audio Stream
             ▼                                                                     ▼
┌─────────────────────────┐       tasks (async)      ┌────────────────┐       ┌─────────────────────────┐
│     Django REST API     ├─────────────────────────►│ Celery Workers │       │     Voice AI Agent      │
│ (Core Business & Auth)  │                          │  (Beat & Tasks)│       │ (Python Interviewer SDK)│
└──┬──────┬──────┬──────┬─┘                          └───────┬────────┘       └────────────┬────────────┘
   │      │      │      │                                    │ S3 Upload                   │ STT/TTS & LLM
   │      │      │      │ cache                              ▼                             ▼
   │      │      │      └───────────►┌────────────────┐┌───────────┐          ┌─────────────────────────┐
   │      │      │                   │    Redis 7     ││ MinIO S3  │          │   Voice & LLM Cloud     │
   │      │      │                   │(Cache & Broker)││ (Storage) │          │  (MetaConnect / Gemini) │
   │      │      │                   └────────────────┘└───────────┘          └─────────────────────────┘
   │      │      │ SQL ORM
   │      │      └──────────────────►┌────────────────┐
   │      │                          │   MySQL 8.0    │
   │      │                          │  (Primary DB)  │
   │      │                          └────────────────┘
   │      │ Index & Search
   │      └─────────────────────────►┌────────────────┐
   │                                 │ Elasticsearch 7│
   │                                 │ (Job & CV Index│
   │                                 └────────────────┘
```

---

## 2. 🗺️ Bản Đồ Điều Phối Tên Miền & Cổng Dịch Vụ (Domain & Port Map)

Hệ thống được điều phối tập trung qua Nginx Gateway với các subdomain độc lập phục vụ từng nhóm đối tượng người dùng:

| Tên miền / URL | Dịch vụ đích | Cổng nội bộ | Vai trò chức năng chính |
| :--- | :--- | :--- | :--- |
| `https://infohr.vn` | `frontend` | `3000` (`:80`) | Cổng Ứng viên: Tìm kiếm việc làm, nộp CV, tạo CV online, luyện tập AI |
| `https://employer.infohr.vn` | `frontend` | `3000` (`:80`) | Cổng Nhà tuyển dụng: Đăng tin, quản lý hồ sơ, kịch bản phỏng vấn |
| `https://admin.infohr.vn` | `frontend` | `3000` (`:80`) | Cổng Quản trị hệ thống: Phê duyệt tin tuyển dụng, phân quyền, cấu hình |
| `https://aila.infohr.vn` | `frontend` + `voice-ai` | `3000` / `7880` | Phòng Phỏng vấn AI: Kết nối WebRTC âm thanh/hình ảnh thời gian thực |
| `https://hrm.infohr.vn` | `frontend` | `3000` (`:80`) | Phân hệ HRM nội bộ: Quản lý nhân sự, chấm công, bảng lương |
| `https://infohr.vn/api/` | `backend` | `8000` | REST API lõi (Django REST Framework, JWT Auth, Business logic) |
| `https://infohr.vn/swagger/` | `backend` | `8000` | Tài liệu đặc tả OpenAPI tương tác (drf-yasg) |
| `https://s3.infohr.vn:4433` | `minio` | `9000` | S3 API lưu trữ CV ứng viên, avatar, bản ghi âm/hình phỏng vấn |
| `https://infohr.vn/minio-console/` | `minio-console` | `9001` | Giao diện web quản trị bucket MinIO S3 |
| `wss://infohr.vn/livekit` | `livekit` | `7880` | WebRTC Signaling & Room Management |

---

## 3. 🧩 Chi Tiết Các Phân Hệ & Khối Chức Năng (Subsystem Breakdown)

### 3.1. Nginx Gateway (`nginx-gateway/`)
- **Vai trò**: Cổng biên (Edge Gateway) duy nhất mở ra Internet.
- **Nhiệm vụ**:
  - Chấm dứt SSL/TLS (Let's Encrypt / Wildcard Certificate).
  - Phân luồng reverse proxy theo Header `Host` (`infohr.vn`, `employer.infohr.vn`, `admin.infohr.vn`, `hrm.infohr.vn`).
  - Nâng cấp WebSocket/WSS an toàn cho LiveKit (`/livekit`) và Frontend HMR.
  - Forward đầy đủ các client headers (`X-Forwarded-For`, `X-Forwarded-Proto`, `Host`).

### 3.2. Frontend Application (`frontend/`)
- **Công nghệ**: Next.js 16, React 19, MUI 6, Tailwind CSS v4, TanStack Query v5, Redux Toolkit.
- **Kiến trúc giao diện**:
  - Tích hợp đa phân hệ (Multi-tenant portals) trên một codebase App Router duy nhất.
  - Server Components (RSC) cho các trang landing page công khai nhằm tối ưu SEO và Web Vitals.
  - Client Components cho các phòng phỏng vấn LiveKit WebRTC và bảng điều khiển quản trị tương tác cao.
  - Giao tiếp với API qua Axios interceptor tích hợp tự động gắn và làm mới token JWT.

### 3.3. Core Backend API (`api/`)
- **Công nghệ**: Python 3.10+, Django 4.2 LTS, Django REST Framework, Gunicorn + Gevent worker class.
- **Mô hình tổ chức**: Phân tầng Service Layer (`apps/*/services.py`, `apps/*/selectors.py`), tách biệt rõ rệt giữa Controller/View, Business Logic, và Data Access Layer.
- **Các module cốt lõi**:
  - `apps.accounts`: Xác thực người dùng, phân quyền RBAC, hồ sơ ứng viên & nhà tuyển dụng.
  - `apps.jobs`: Quản lý tin tuyển dụng, danh mục ngành nghề, bộ lọc tìm kiếm.
  - `apps.interviews`: Cấu hình phòng phỏng vấn, tạo Room Token LiveKit, lưu trữ kết quả đánh giá AI.
  - `apps.hrm`: Quản lý nhân sự, chấm công, hợp đồng và chính sách lương thưởng.
  - `apps.common`: Bộ nhớ đệm, kiểm tra sức khỏe hệ thống (`/api/common/health/`), upload file lên S3.

### 3.4. Voice AI Interview Subsystem (`voice-ai/`)
- **Công nghệ**: LiveKit Server (Go WebRTC SFU), LiveKit Python Agents SDK, Silero VAD, Egress Service.
- **Luồng xử lý thời gian thực**:
  1. **Ứng viên tham gia**: Frontend nhận JWT Room Token từ Django API và mở kênh WebRTC PeerConnection tới LiveKit SFU.
  2. **Tự động kích hoạt AI**: LiveKit Server phát sinh webhook/dispatch thông báo phòng mới cho `livekit-agent`.
  3. **Xử lý âm thanh**:
     - Silero VAD phát hiện giọng nói của ứng viên (Speech Start / End).
     - Luồng âm thanh Opus được truyền tới MetaConnect ASR (Tiếng Việt) để chuyển thành văn bản.
     - LLM Orchestrator (Google Gemini) đánh giá câu trả lời và sinh nội dung phản hồi tiếp theo.
     - MetaConnect TTS (giọng Trúc Ly) chuyển đổi phản hồi thành âm thanh tự nhiên theo cơ chế streaming phân tách dấu câu (`.`, `?`, `!`, `,`).
     - Thời gian phản hồi đạt mục tiêu **TTFA < 800ms**.
  4. **Barge-in (Ngắt lời AI)**: Khi phát hiện ứng viên cất lời trong lúc AI đang nói, hệ thống lập tức hủy tác vụ TTS/LLM đang chạy và nhường lượt nói cho ứng viên.
  5. **Ghi hình & Lưu trữ**: `livekit-egress` ghi lại toàn bộ phiên phỏng vấn và upload trực tiếp lên MinIO S3 (`interviews/{candidate_id}/{session_id}/recording.mp4`).

### 3.5. Asynchronous Workers & Scheduling (`celery-worker`, `celery-beat`)
- **Celery Worker**: Xử lý các tác vụ nặng chạy ngầm ngoài chu kỳ request-response:
  - Gửi email thông báo phỏng vấn, kết quả ứng tuyển.
  - Trích xuất văn bản từ CV PDF/DOCX và đánh chỉ mục lên Elasticsearch.
  - Đồng bộ hóa dữ liệu sao lưu định kỳ.
- **Celery Beat**: Sử dụng `DatabaseScheduler` để lập lịch các công việc định kỳ lưu trữ trong MySQL (quét hết hạn tin tuyển dụng, tổng hợp báo cáo ngày).

### 3.6. Dữ Liệu & Hạ Tầng Lưu Trữ (Data & Storage Layer)
- **MySQL 8.0**: Cơ sở dữ liệu quan hệ chính (ACID), mã hóa utf8mb4_unicode_ci, hỗ trợ tối đa 500 kết nối đồng thời. Kèm dịch vụ sao lưu tự động `db-backup` (mysqldump nén gz chạy 24h/lần, lưu trữ 30 ngày).
- **Redis 7**: Cache truy vấn, lưu trữ phiên đăng nhập, và đóng vai trò Message Broker cho Celery.
- **Elasticsearch 7.17**: Bộ máy tìm kiếm toàn văn chuyên dụng cho tin tuyển dụng và từ khóa trong hồ sơ ứng viên.
- **MinIO S3**: Kho lưu trữ đối tượng tương thích chuẩn Amazon S3 API, quản lý hồ sơ CV, ảnh đại diện, audio/video phỏng vấn bảo mật.

---

## 4. 📊 Bản Vẽ Kiến Trúc Tương Tác (Interactive Archify Blueprints)

Hệ thống được thiết kế và biên dịch bằng **Archify** thành các bản vẽ HTML độc lập hoàn chỉnh, tích hợp:
- Chế độ **Dark / Light theme**.
- Hoạt ảnh luồng tín hiệu thời gian thực (**Trace Motion**).
- Các chế độ xem có hướng dẫn (**Guided Views**).
- Khả năng phóng to, thu nhỏ và xuất ảnh vector SVG / PNG / WebP độ nét cao.

### 4.1. File Kiến Trúc Trong Hệ Thống

| Tệp tin | Định dạng | Mô tả |
| :--- | :--- | :--- |
| [`docs/architecture/system-architecture.html`](architecture/system-architecture.html) | Standalone HTML (832 KB) | **Bản vẽ kiến trúc tổng thể toàn bộ hệ thống Square Tuyển Dụng** |
| [`docs/architecture/system-architecture.json`](architecture/system-architecture.json) | Archify JSON Schema v1 | File đặc tả cấu trúc, vị trí node và kết nối của bản vẽ tổng thể |
| [`docs/architecture/voice-ai-interview.sequence.html`](architecture/voice-ai-interview.sequence.html) | Standalone HTML (817 KB) | **Biểu đồ trình tự thời gian thực phiên phỏng vấn Voice AI** |
| [`docs/architecture/voice-ai-interview.sequence.json`](architecture/voice-ai-interview.sequence.json) | Archify Sequence Schema v1 | File đặc tả luồng WebRTC, token, VAD, STT, LLM, TTS và S3 archive |

### 4.2. Cách Xem Bản Vẽ

Người dùng hoặc kỹ sư có thể mở trực tiếp các file HTML bằng bất kỳ trình duyệt web nào (Chrome, Edge, Firefox, Safari):

```bash
# Mở bản vẽ kiến trúc tổng thể trên trình duyệt mặc định
start docs/architecture/system-architecture.html

# Mở biểu đồ trình tự phỏng vấn Voice AI
start docs/architecture/voice-ai-interview.sequence.html
```

### 4.3. Các Chế Độ Xem (Guided Views) Trong Bản Vẽ Tổng Thể

1. **Recruitment & HRM Flow**: Theo dõi luồng dữ liệu từ Ứng viên / Nhà tuyển dụng qua Nginx Gateway, Next.js Web Portal vào Django REST API và ghi nhận vào MySQL 8.0.
2. **Real-time Voice AI Interview**: Tập trung vào phân hệ WebRTC Voice AI, từ phòng phỏng vấn LiveKit SFU đến Python Voice Agent và các dịch vụ AI Cloud (MetaConnect / Gemini).
3. **Async Workers & Storage**: Làm nổi bật hàng đợi Celery, bộ nhớ cache Redis, bộ máy tìm kiếm Elasticsearch và hệ thống lưu trữ đối tượng MinIO S3.

---

## 5. 🔒 Phân Vùng Mạng & Bảo Mật (Network Security Architecture)

Hệ thống thiết lập 3 mạng Docker bridge độc lập tuân thủ nguyên tắc cách ly tối đa:

```text
               Internet
                  │ :80, :443
                  ▼
         ┌─────────────────┐
         │  nginx-gateway  │
         └────────┬────────┘
                  │
        ┌─────────┴─────────┐
        │     proxy-net     │ ◄─── Chỉ cho phép Gateway giao tiếp với Frontend,
        └─────────┬─────────┘      Backend, MinIO S3 Console và LiveKit SFU.
                  │
        ┌─────────┴─────────┐
        │      app-net      │ ◄─── Mạng ứng dụng nội bộ kết nối Frontend, Backend,
        └─────────┬─────────┘      Celery Workers, LiveKit Agent và MCP Services.
                  │
        ┌─────────┴─────────┐
        │     data-net      │ ◄─── Mạng dữ liệu cách ly tuyệt đối với bên ngoài:
        └───────────────────┘      MySQL, Redis, Elasticsearch chỉ mở cổng cho
                                   Backend và Workers, không lộ cổng ra Internet.
```

- **Quy tắc tuyệt đối**:
  - Không mở port của MySQL (`3306`), Redis (`6379`), Elasticsearch (`9200`) ra ngoài host ở môi trường production.
  - Mọi giao tiếp nhạy cảm giữa `backend` và `livekit-agent` được bảo vệ bằng `INTERVIEW_AGENT_SHARED_SECRET` và token giới hạn thời gian (Max Skew 300s).
  - Khóa bí mật và API Keys luôn nạp qua tệp `.env`, không bao giờ commit vào Git.

---

## 6. 🚀 Hướng Dẫn Tái Biên Dịch Bản Vẽ (Regeneration with Archify)

Khi hệ thống bổ sung thêm dịch vụ hoặc thay đổi luồng tương tác, cập nhật file JSON đặc tả tương ứng trong `docs/architecture/` và chạy lệnh sau để cập nhật bản vẽ:

```bash
# Kiểm tra tính hợp lệ và tiêu chuẩn hiển thị (Showcase Quality Profile)
node archify/bin/archify.mjs validate architecture docs/architecture/system-architecture.json --quality showcase --json

# Biên dịch ra file HTML hoàn chỉnh
node archify/bin/archify.mjs deliver architecture docs/architecture/system-architecture.json docs/architecture/system-architecture.html --quality showcase --json
```

---

*Tài liệu kiến trúc hệ thống chính thức của Square Tuyển Dụng (InfoHR) — Biên soạn và cập nhật tự động bằng Archify.*
