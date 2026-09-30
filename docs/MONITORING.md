# 📊 Hướng Dẫn Vận Hành Hệ Thống Giám Sát & Sao Lưu (InfoHR Ops Guide)

> **Hệ thống**: Square Tuyển Dụng (InfoHR)  
> **Các phân hệ vận hành**:
> 1. **Prometheus & Alertmanager**: Thu thập số liệu định lượng và phát cảnh báo tự động (Telegram / Webhook).
> 2. **Grafana**: Trực quan hóa bảng điều khiển thời gian thực (WebRTC Voice AI, Hạ tầng máy chủ).
> 3. **Loki & Promtail**: Quản lý và tra cứu nhật ký (logs) tập trung toàn bộ container Docker.
> 4. **Automated Backup Service**: Sao lưu tự động toàn diện MySQL + MinIO Media với cơ chế xác thực dung lượng chống file hỏng.
> 5. **Sentry**: Bắt lỗi ứng dụng tức thì (Error Tracking & Crash Reporting).

---

## 1. 📈 Cổng Dịch Vụ Giám Sát & Vận Hành

| Dịch vụ | Cổng Host | Đường dẫn truy cập | Tài khoản / Bảo mật | Vai trò |
| :--- | :--- | :--- | :--- | :--- |
| **Grafana** | `3001` | `http://localhost:3001` | User: `admin`<br>Pass: `infohr_admin_2026` *(đổi bằng `GRAFANA_ADMIN_PASSWORD`)* | Giao diện Dashboard & Explore Logs |
| **Prometheus** | `9090` | `http://localhost:9090` | Đang chạy với TSDB Retention 15 ngày / 10GB | Engine thu thập metrics định kỳ 15s |
| **Alertmanager** | `9093` | `http://127.0.0.1:9093` | Cổng nội bộ | Điều phối và phát cảnh báo tới Telegram / Webhook |
| **Loki** | `3100` | `http://127.0.0.1:3100` | Cổng nội bộ | Cơ sở dữ liệu lưu trữ log tập trung |
| **Promtail** | `9080` | Nội bộ Docker | Đọc trực tiếp Docker Socket | Thu thập log container đẩy về Loki |
| **LiveKit Metrics**| `7889` | `http://livekit:7889/metrics` | Nội bộ Docker | Metrics WebRTC SFU (rooms, participants, packet loss) |
| **Node Exporter** | `9100` | `http://node-exporter:9100/metrics` | Nội bộ Docker | Tải CPU, RAM, Disk máy chủ |

---

## 2. 🖥️ Các Dashboard Trực Quan Hóa Trên Grafana

Truy cập `http://localhost:3001` -> Menu **Dashboards**:

1. **InfoHR — Giám Sát Hệ Thống & Voice AI (`infohr-overview`)**:
   - Số phòng phỏng vấn AI đang mở (`livekit_room_total`).
   - Số ứng viên & AI Agent đang kết nối (`livekit_participant_total`).
   - Trạng thái sống còn của LiveKit WebRTC (`up{job="livekit"}`).
   - Tải CPU máy chủ Xeon (%) và Tải RAM (%).

2. **InfoHR — LiveKit WebRTC Voice AI Quality (`infohr-livekit-quality`)**:
   - Tỷ lệ rớt gói tin âm thanh / video (*Packet Loss Rate*).
   - Băng thông WebRTC gửi và nhận (*Inbound / Outbound Bps*).
   - Số phiên ghi hình phỏng vấn đang chạy (*Active Egress Sessions*).

---

## 3. 🔍 Tra Cứu Nhật Ký Tập Trung Với Loki (Centralized Logging)

Không cần phải mở terminal gõ `docker logs` thủ công:
1. Vào Grafana `http://localhost:3001` -> Nhấp vào biểu tượng la bàn **Explore** (thanh bên trái).
2. Chọn Data source: **Loki**.
3. Ví dụ các câu truy vấn LogQL thông dụng:
   ```logql
   # Xem tất cả log của LiveKit Agent:
   {container="tuyendung-studio-livekit-agent"}

   # Lọc các dòng log có chứa chữ "error" hoặc "CRITICAL" trong Backend:
   {container="tuyendung-studio-backend"} |= "error"

   # Lọc log của hệ thống WAF ModSecurity:
   {container="tuyendung-studio-waf"}

   # Tìm log của một session phỏng vấn cụ thể:
   {container=~"tuyendung-studio-.*"} |= "interview_session_id"
   ```

---

## 4. 🚨 Cảnh Báo Sự Cố Tự Động (Prometheus & Alertmanager)

File quy tắc cảnh báo tại `monitoring/prometheus/alert.rules.yml` tự động giám sát các điều kiện:
*   **LiveKitServerDown**: SFU LiveKit rớt kết nối quá 1 phút -> Báo động mức **CRITICAL**.
*   **HostHighCpuUsage**: Tải CPU > 85% liên tục 5 phút -> Báo động mức **WARNING**.
*   **HostHighMemoryUsage**: RAM khả dụng còn dưới 10% -> Báo động mức **CRITICAL**.
*   **HostDiskFilling**: Ổ cứng còn trống dưới 15% -> Báo động mức **CRITICAL**.
*   **MonitoringTargetMissing**: Dịch vụ bị crash quá 2 phút -> Báo động mức **WARNING**.

### Cấu hình nhận tin nhắn Telegram:
Điền vào file `.env` trên máy chủ:
```env
BACKUP_TELEGRAM_BOT_TOKEN=123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ
BACKUP_TELEGRAM_CHAT_ID=-1001234567890
```

---

## 5. 💾 Dịch Vụ Sao Lưu Toàn Diện (Database & MinIO Media)

Container `tuyendung-studio-db-backup` chạy ngầm 24/7 theo script `scripts/backup-service-entrypoint.sh`:

1. **Sao lưu Cơ sở dữ liệu MySQL**:
   - Sử dụng `mysqldump` chế độ zero-downtime (`--single-transaction --quick --routines --triggers --events`).
   - **Xác thực toàn vẹn**: Bắt buộc kiểm tra kích thước file > 50 KB (loại bỏ hoàn toàn lỗi file rỗng 20-byte).
   - Tự động cập nhật liên kết tượng trưng `db_backup_latest.sql.gz`.
2. **Sao lưu MinIO Media (CV, Avatar, Video Phỏng vấn)**:
   - Tự động đóng gói nén toàn bộ thư mục `/minio_data/square` thành `minio_media_<TIMESTAMP>.tar.gz`.
   - Cập nhật `minio_media_latest.tar.gz`.
3. **Quản lý vòng đời lưu trữ (Retention)**:
   - Tự động dọn dẹp các bản backup cũ hơn 30 ngày (`RETENTION_DAYS=30`).
4. **Phục hồi khi có sự cố**:
   ```bash
   # Phục hồi trên Linux:
   ./scripts/restore_db.sh backups/db_backup_latest.sql.gz

   # Phục hồi trên Windows PowerShell:
   powershell -ExecutionPolicy Bypass -File ./scripts/restore_db.ps1
   ```

---

## 6. 🛠️ Các Lệnh Vận Hành Nhanh

```bash
# Khởi động hoặc cập nhật toàn bộ cụm Giám sát & Sao lưu
docker compose up -d prometheus alertmanager grafana loki promtail node-exporter db-backup

# Xem trạng thái backup thời gian thực
docker logs -f tuyendung-studio-db-backup

# Xem log của Promtail gom log Docker
docker logs -f tuyendung-studio-promtail

# Khởi động lại Grafana sau khi cập nhật dashboard
docker compose restart grafana
```
