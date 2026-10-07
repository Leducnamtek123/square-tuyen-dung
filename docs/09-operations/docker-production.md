# Huong Dan Trien Khai Docker Production (Docker Production Guide)

> **Phan he**: 09-operations  
> **Tai lieu**: docker-production.md  
> **Cong cu**: Docker Compose, Multi-stage Builds, Container Hardening

---

## 1. Kien Truc Multi-Stage Dockerfile

Nham giam thieu toi da dung luong image va tang tinh bao mat trong moi truong Production, cac Dockerfile trong he thong su dung mo hinh **Multi-Stage Build**:

### 1.1. Frontend Multi-stage (`frontend/Dockerfile`)
- **Stage 1 (Deps)**: Chi cai dat cac dependencies can thiet de build tu `package.json` va `pnpm-lock.yaml`.
- **Stage 2 (Builder)**: Thuc hien build bundle Next.js sang thu muc `.next/standalone`.
- **Stage 3 (Runner)**: Su dung base image nhe `node:20-alpine`, tao non-root user `nextjs:nodejs`, chi copy artifacts tu standalone build, giam dung luong tu >1.5GB xuong con <180MB.

### 1.2. Backend Multi-stage (`api/Dockerfile`)
- **Stage 1 (Builder)**: Cai dat cac thu vien he thong (gcc, default-libmysqlclient-dev) de bien dich cac goi wheel Python.
- **Stage 2 (Final)**: Copy cac wheel da bien dich sang image `python:3.11-slim`, tao user khong co quyen root `appuser`, loai bo toan bo cong cu build khoi image production.

---

## 2. Quy Trinh Trien Khai Tren May Chu Production

```bash
# 1. Cap nhat ma nguon tu nhanh main
git checkout main
git pull origin main

# 2. Xac thuc cac file bien moi truong production
test -f .env.prod || echo "Thieu file .env.prod!"

# 3. Build lai cac container voi tham so no-cache neu co thay doi dependencies
docker compose -f docker-compose.yml build --pull

# 4. Khoi dong lai he thong voi che do zero-downtime rolling restart
docker compose up -d --remove-orphans

# 5. Chay migration co so du lieu tren container backend
docker compose exec -T backend python manage.py migrate --noinput

# 6. Thu thap file static cho Django
docker compose exec -T backend python manage.py collectstatic --noinput

# 7. Kiem tra tinh trang container
docker compose ps
```

---

## 3. Chien Luoc Bao Ve Tai Nguyen & Container Healthchecks

Moi service trong `docker-compose.yml` deu duoc gan gioi han tai nguyen (Resource limits) va bo kiem tra suc khoe (Healthcheck):
- **Restart Policy**: Luon dat `restart: unless-stopped` de tu dong phuc hoi khi bi crash.
- **Healthcheck**: Nginx gateway chi dinh tuyen traffic toi container khi healthcheck tra ve status code `200` (Vi du: `/health/` o backend va `/api/health` o frontend).
