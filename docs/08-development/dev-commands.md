# So Tay Lenh Phat Trien (Development Commands Cheat Sheet)

> **Phan he**: 08-development  
> **Tai lieu**: dev-commands.md  
> **Ecosystem**: Square Tuyen Dung (InfoHR)

---

## 1. Docker Compose Toan He Thong

```bash
# Khoi dong toan bo he sinh thai trong background
docker compose up -d

# Khoi dong chi cac dich vu ha tang (DB, Redis, S3, LiveKit)
docker compose up -d mysql redis elasticsearch minio livekit

# Xem logs thoi gian thuc cua mot dich vu
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f voice-ai

# Khoi dong lai mot dich vu sau khi thay doi cau hinh
docker compose restart backend
docker compose restart frontend

# Dung toan bo he thong
docker compose down
```

---

## 2. Frontend Web (`frontend/`)

```bash
cd frontend

# Chay Next.js dev server (Webpack mode, port 3000)
pnpm run dev

# Chay dev server voi du lieu mock
pnpm run dev:mock

# Kiem tra loi type TypeScript (Typecheck)
pnpm run typecheck

# Kiem tra cu phap va quy tac ESLint
pnpm run lint

# Build production bundle
pnpm run build

# Chay kiem thu E2E bang Playwright
pnpm exec playwright test
pnpm exec playwright show-report
```

---

## 3. Backend API (`api/`)

```bash
cd api

# Kich hoat Virtual Environment (Windows)
.\venv\Scripts\Activate.ps1

# Chay Django dev server tai port 8000
python manage.py runserver 0.0.0.0:8000

# Chay migration co so du lieu
python manage.py makemigrations
python manage.py migrate

# Chay Celery Worker xu ly tac vu nen
celery -A config worker -l info --pool=threads --concurrency=4

# Chay Celery Beat lap lich dinh ky
celery -A config beat -l info

# Kiem tra va format code bang Ruff
ruff check .
ruff format .

# Chay toan bo Unit Tests bang pytest
pytest
# Chay chi cac test HRM
pytest apps/hrm/tests.py -v
```

---

## 4. Voice AI Service (`voice-ai/`)

```bash
cd voice-ai

# Chay LiveKit Python Agent o che do dev
python -m livekit_agent.main dev

# Chay server Talking-Head Avatar
cd talking-head
python app.py
```
