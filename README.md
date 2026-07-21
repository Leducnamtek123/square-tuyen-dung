# Square Tuyển Dụng

Nền tảng tuyển dụng thông minh với AI phỏng vấn tự động — xây dựng cho ngành Xây dựng & Thiết kế.

## Kiến Trúc Tổng Quan

```
┌─────────────────────────────────────────────────────────┐
│                   Nginx Gateway (:80)                   │
│              (SSL termination, routing)                 │
├────────────┬────────────┬───────────┬───────────────────┤
│  Frontend  │  Backend   │  LiveKit  │  MinIO (S3)       │
│ React/Vite │ Django/DRF │  WebRTC   │  Object Storage   │
│   (:80)    │  (:8000)   │  (:7880)  │  (:9000/:9001)    │
└─────┬──────┴─────┬──────┴─────┬─────┴───────────────────┘
      │            │            │
      │     ┌──────┴──────┐    │
      │     │   Celery     │    │
      │     │ Worker+Beat  │    │
      │     └──────┬──────┘    │
      │            │            │
┌─────┴────────────┴────────────┴─────┐
│            Data Layer               │
│  MySQL 8.0 │ Redis 7 │ Elasticsearch│
└─────────────────────────────────────┘
      │
┌─────┴──────────────────────────┐
│         AI Pipeline (GPU)      │
│  llama.cpp │ Whisper │ TTS     │
│  (Qwen2.5) │  (STT)  │(ViệtNam)│
│            │         │         │
│       LiveKit Agent            │
│   (Voice Interview Bot)       │
└────────────────────────────────┘
```

## Tech Stack

| Layer | Công nghệ |
|-------|-----------|
| **Frontend** | React 18, Vite 8, MUI 6, Redux Toolkit, TypeScript |
| **Backend** | Django 4.x, DRF, Celery, drf-social-oauth2 |
| **Database** | MySQL 8.0, Redis 7, Elasticsearch 7.17 |
| **AI** | Qwen 2.5-14B (llama.cpp), Whisper Large v3, ViệtNam TTS |
| **Realtime** | LiveKit (WebRTC), Firebase Realtime DB |
| **Storage** | MinIO (S3-compatible) |
| **Infra** | Docker Compose, Nginx, GitHub Actions CI |

## Yêu Cầu Hệ Thống

- Docker & Docker Compose v2+
- NVIDIA GPU + CUDA drivers (cho AI services)
- Tối thiểu 16GB RAM, 50GB disk
- Domain với SSL certificate (production)

## Cấu Trúc Thư Mục

```
├── api/                    # Django backend
│   ├── apps/               # Django apps (accounts, jobs, profiles, interviews, ...)
│   ├── config/             # Settings, URLs, Celery, Admin
│   ├── common/             # Shared models, serializers
│   ├── shared/             # Utilities, permissions, helpers
│   └── integrations/       # AI & LiveKit integrations
├── frontend/               # React SPA
│   └── src/
│       ├── components/     # Reusable UI components
│       ├── pages/          # Page-level components
│       ├── services/       # API service layer
│       ├── redux/          # State management
│       └── routes/         # Routing configuration
├── voice-ai/               # AI voice interview services
│   ├── inference/          # Whisper, TTS model servers
│   └── livekit_agent/      # LiveKit voice agent
├── nginx-gateway/          # Nginx reverse proxy config
├── docker-compose.yml      # Production orchestration
└── .github/workflows/      # CI/CD pipelines
```

## Khởi Chạy Nhanh

### 1. Clone & cấu hình

```bash
git clone <repo-url>
cd square-tuyen-dung

# Copy và chỉnh sửa file .env
cp api/.env.example .env
# Sửa các giá trị: DB_PASSWORD, SECRET_KEY, MINIO_*, ...
```

### 2. Chạy với Docker Compose

```bash
# Build và khởi động tất cả services
docker compose up -d --build

# Chạy migrations (lần đầu)
docker compose run --rm migrate

# Seed dữ liệu mẫu
docker compose exec backend python manage.py seed_all
```

### 3. Development (không Docker)

```bash
# Backend
cd api
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

# Frontend
cd frontend
npm install
npm run start
```

## Portals

| Portal | URL (Production) | Mô tả |
|--------|-------------------|--------|
| Job Seeker | `https://infohr.vn` | Tìm việc, nộp CV, phỏng vấn AI |
| Employer | `https://infohr.vn/employer/` | Đăng tin, quản lý ứng viên |
| Admin | `https://infohr.vn/admin/` | Quản trị hệ thống |
| API Docs | `https://infohr.vn/swagger/` | Swagger UI |
| MinIO Console | `https://infohr.vn/minio-console/` | Object storage UI |

## CI/CD

- **Lint**: flake8 + isort (backend), ESLint (frontend)
- **Test**: pytest + coverage (backend), vitest (frontend)
- **Build**: Docker image build verification
- **Migration Check**: `makemigrations --check --dry-run`

## Tài Liệu Bổ Sung

- [Backend API README](api/README.md)
- [Frontend README](frontend/README.md)
- [Voice AI README](voice-ai/README.md)
- [LiveKit Agent Docs](LIVIKIT_AGENTS_DOCS.md)
- [Migration Guide](MIGRATIONS.md)
- [Start Guide](START_GUIDE.md)

## License

Proprietary — © Square Group Vietnam
