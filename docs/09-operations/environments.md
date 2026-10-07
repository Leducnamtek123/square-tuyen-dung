# Quan Ly Bien Moi Truong & Bi Mat (Environment Variables & Secrets)

> **Phan he**: 09-operations  
> **Tai lieu**: environments.md  
> **Nguyen tac**: 12-Factor App & Strict Secret Hygiene

---

## 1. Nguyen Tac Quan Ly Bi Mat (Zero Secrets in Git)

Tuyet doi khong luu tru thong tin nhay cam (Mat khau DB, Secret Keys, API Keys, Private Certificates) trong bat ky commit nao.
He thong quan ly cau hinh thong qua file `.env` duoc doc boi thu vien `python-decouple` (Backend) va bien moi truong `process.env` (Next.js).

---

## 2. Danh Sach Bien Moi Truong Cot Loi

### 2.1. Backend API (`.env`)
```bash
# General
DJANGO_SETTINGS_MODULE=config.settings
DEBUG=False
SECRET_KEY=change-this-in-production-very-long-secret-key
ALLOWED_HOSTS=infohr.vn,employer.infohr.vn,admin.infohr.vn,hrm.infohr.vn,backend,localhost

# Database (MySQL 8)
DB_HOST=mysql
DB_PORT=3306
DB_NAME=square_db
DB_USER=square_user
DB_PASSWORD=secret_db_password

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# Elasticsearch
ELASTICSEARCH_DSL_AUTOSYNC=True
ELASTICSEARCH_HOST=elasticsearch:9200

# MinIO S3
MINIO_ENDPOINT=minio:9000
MINIO_ACCESS_KEY=minio_admin_user
MINIO_SECRET_KEY=minio_admin_password
MINIO_BUCKET_NAME=square-storage
MINIO_USE_SSL=False

# LiveKit SFU
LIVEKIT_URL=http://livekit:7880
LIVEKIT_API_KEY=devkey
LIVEKIT_API_SECRET=secret_livekit_key
```

### 2.2. Frontend (`frontend/.env`)
```bash
# Server-side API Target
BACKEND_INTERNAL_URL=http://backend:8000

# Client-side Public Variables (Chi them prefix NEXT_PUBLIC_ khi thuc su can cho browser)
NEXT_PUBLIC_API_URL=https://infohr.vn/api/v1
NEXT_PUBLIC_LIVEKIT_WS_URL=wss://infohr.vn/livekit
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
```

---

## 3. Quy Trinh Thay Doi Khoa Bi Mat (Secret Rotation)

1. **Chu ky thay doi**: Tat ca cac secret keys tren production phai duoc doi dinh ky moi **90 ngay** hoac ngay lap tuc neu nghi ngo bi ro ri.
2. **Quy trinh rotation zero-downtime**:
   - Cap nhat khoa tren file `.env.prod`.
   - Khoi dong lai cac worker Celery de nhan khoa moi.
   - Thuc hien rolling restart cho cac container API.
   - Vo hieu hoa token cu sau khi nguoi dung cu dang nhap lai.
