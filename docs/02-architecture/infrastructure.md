# Ha Tang & Trien Khai (Infrastructure & Deployment)

> **Phan he**: 02-architecture  
> **Tai lieu**: infrastructure.md  
> **Ecosystem**: Square Tuyen Dung (InfoHR)

---

## 1. Tong Quan Ha Tang Container Hoa

Toan bo he thong InfoHR duoc dong goi va van hanh bang Docker Compose, dam bao tinh dong nhat giua moi truong Local Development, Staging va Production:

| Dich vu / Container | Image goc / Build | Cong Port (Host:Container) | Chuc nang |
| :--- | :--- | :--- | :--- |
| **`gateway`** | `nginx-gateway/Dockerfile` | `80:80`, `443:443` | Reverse proxy, SSL Let's Encrypt, dieu huong subdomain, WAF. |
| **`frontend`** | `frontend/Dockerfile` | `3000:3000` | Next.js 16 App Router Node server. |
| **`backend`** | `api/Dockerfile` | `8000:8000` | Django 4.2+ REST Framework API qua Gunicorn/Uvicorn. |
| **`celery_worker`**| `api/Dockerfile` | - | Worker thuc thi tac vu nen (Sync ES, tao PDF, gui mail). |
| **`celery_beat`**  | `api/Dockerfile` | - | Bo len lich dinh ky (Periodic task scheduler). |
| **`mysql`**        | `mysql:8.0` | `3306:3306` | Co so du lieu quan he InnoDB, utf8mb4. |
| **`elasticsearch`**| `elasticsearch:7.17.9`| `9200:9200` | Engine tim kiem toan van Job & CV. |
| **`redis`**        | `redis:7-alpine` | `6379:6379` | Bo nho dem, Celery broker va LiveKit token cache. |
| **`minio`**        | `minio/minio` | `9000:9000`, `9001:9001` | S3-compatible Object Storage va MinIO Web Console. |
| **`livekit`**      | `livekit/livekit-server`| `7880:7880`, `7881:7881`, `7882:7882/udp` | WebRTC SFU Server. |
| **`voice-ai`**     | `voice-ai/Dockerfile` | - | Python LiveKit Agent & Speech Processing. |
| **`prometheus`**   | `prom/prometheus` | `9090:9090` | Thu thap metrics he thong va ung dung. |
| **`grafana`**      | `grafana/grafana` | `3001:3000` | Dashboard truc quan hoa thong so he thong. |
| **`loki`**         | `grafana/loki` | `3100:3100` | Thu thap va chi muc nhat ky (Logs) tap trung. |
| **`promtail`**     | `grafana/promtail` | - | Agent day log tu Docker containers vao Loki. |

---

## 2. MinIO S3 Bucket Architecture

He thong luu tru doi tuong MinIO duoc phan chia thanh cac bucket doc lap voi quy che bao mat nghiem ngat:

1. **`candidate-cvs` (Private)**:
   - Chua cac file PDF CV do ung vien upload len hoac xuat tu CV Builder.
   - Chi truy cap duoc thong qua Backend API hoac Pre-signed URL co thoi han (Vi du: 15 phut).
2. **`company-assets` (Public Read)**:
   - Chua logo cong ty, hinh anh van phong, banner tin tuyen dung.
   - Cho phep doc truc tiep tu CDN hoac trinh duyet nguoi dung.
3. **`interviews` (Protected)**:
   - Chua file ghi am MP3/WAV va video MP4 cua cac phien phong van Voice AI xuat boi LiveKit Egress.
   - Chi Recruiter cua cong ty so huu tin tuyen dung moi co quyen lay Pre-signed URL de nghe/xem.
4. **`scorecards` (Protected)**:
   - Chua cac phieu danh gia nang luc PDF duoc he thong tu dong tao ra sau phong van.

---

## 3. He Thong Giam Sat & Canh Bao (Observability & Alerting)

- **Prometheus**: Thu thap metrics tu Node Exporter (CPU, RAM, Disk, Network), MySQL Exporter, Redis Exporter va Django Prometheus endpoints (`/metrics`).
- **Grafana**: Cung cap cac dashboard:
  - System Overview: Ti le tai nguyen server va trang thai container.
  - API Performance: So luong request/sec, ti le loi 4xx/5xx, thoi gian phan hoi p95/p99.
  - LiveKit WebRTC: So luong phong hoat dong, so luong track audio/video, packet loss rate.
- **Loki & Promtail**: Thu thap toan bo stdout/stderr cua cac container `backend`, `frontend`, `gateway`, `voice-ai` de de dang truy van va debug loi tap trung.
- **Alertmanager**: Gui thong bao ngay lap tuc qua kenh Telegram va Email quan tri vien khi co canh bao nguy hiem (Dung container, Disk day > 85%, loi 500 vuot nguong).
