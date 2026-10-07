# Huong Dan Thiet Lap Moi Truong Phat Trien (Environment Setup)

> **Phan he**: 08-development  
> **Tai lieu**: environment-setup.md  
> **Ecosystem**: Square Tuyen Dung (InfoHR)

---

## 1. Yeu Cau He Thong Toi Thieu (Prerequisites)

- **He dieu hanh**: Windows 10/11 (WSL2 duoc khuyen nghi neu chay full stack nang), macOS (Apple Silicon / Intel), hoac Ubuntu 22.04 LTS.
- **Node.js**: Phien ban `>= 20.x` (khuyen nghi LTS 20.18+ hoac 22.x).
- **Package Manager**: `pnpm` phien ban `>= 9.x` (Cai dat bang `npm install -g pnpm`).
- **Python**: Phien ban `>= 3.10` va `< 3.12` (Python 3.10 hoac 3.11).
- **Docker & Docker Compose**: Docker Desktop hoac Docker Engine `>= 24.x`.
- **Git**: `>= 2.38`.

---

## 2. Cac Buoc Thiet Lap Du An Tu Zero

### Buoc 1: Clone kho ma nguon
```bash
git clone https://github.com/Leducnamtek123/square-tuyen-dung.git
cd square-tuyen-dung
```

### Buoc 2: Khoi tao bien moi truong (.env)
Sao chep file cau hinh mau tai goc thu muc:
```bash
cp .env.example .env
cp frontend/.env.example frontend/.env
cp voice-ai/livekit_agent/.env.example voice-ai/livekit_agent/.env
```
*Luu y quan trong*: Tuyet doi khong commit file `.env` thuc chua thong tin bi mat len Git!

### Buoc 3: Khoi dong cac dich vu ha tang bang Docker
```bash
# Khoi dong MySQL, Redis, Elasticsearch, MinIO, LiveKit
docker compose up -d mysql redis elasticsearch minio livekit
```

### Buoc 4: Cai dat va khoi tao Backend (`api/`)
```bash
cd api
python -m venv venv

# Windows PowerShell:
.\venv\Scripts\Activate.ps1
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
cd ..
```

### Buoc 5: Cai dat Frontend (`frontend/`)
```bash
cd frontend
pnpm install
cd ..
```

---

## 3. Kiem Tra Sau Khi Thiet Lap (Sanity Check)

1. Truy cap co so du lieu: `mysql -u root -p -h 127.0.0.1 -P 3306`
2. Kiem tra MinIO Console: `http://localhost:9001` (user/pass trong `.env`)
3. Kiem tra Elasticsearch: `curl http://localhost:9200`
4. Kiem tra LiveKit SFU: `curl http://localhost:7880`
