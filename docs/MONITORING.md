# 📊 Hướng Dẫn Vận Hành Hệ Thống Giám Sát (Sentry + Prometheus + Grafana)

> **Hệ thống**: Square Tuyển Dụng (InfoHR)  
> **Các phân hệ giám sát**:
> 1. **Sentry**: Theo dõi, cảnh báo lỗi ứng dụng tức thì (Error Tracking & Crash Reporting).
> 2. **Prometheus**: Thu thập số liệu định lượng (Metrics Collection).
> 3. **Grafana**: Bảng điều khiển trực quan hóa thời gian thực (Dashboards & Visualization).

---

## 1. 🚨 Phân hệ Sentry (Error Tracking)

Sentry giúp phát hiện ngay lập tức các sự cố lỗi xảy ra với người dùng hoặc ứng viên đang phỏng vấn AI.

### 1.1. Cách cấu hình
1. Đăng ký tài khoản miễn phí tại [sentry.io](https://sentry.io).
2. Tạo 2 Projects:
   - **Django Backend**: Platform: `Django` -> Nhận được **DSN Backend**.
   - **Next.js Frontend**: Platform: `React` / `Next.js` -> Nhận được **DSN Frontend**.
3. Điền DSN vào file `.env` trên máy chủ:
   ```env
   # Sentry Backend (Django & Celery)
   SENTRY_DSN=https://your-backend-key@sentry.io/123456
   SENTRY_TRACES_SAMPLE_RATE=0.1

   # Sentry Frontend (Next.js)
   NEXT_PUBLIC_SENTRY_DSN=https://your-frontend-key@sentry.io/654321
   ```
4. Khi chưa điền DSN hoặc để trống, hệ thống sẽ tự động tắt Sentry một cách an toàn mà không làm gián đoạn bất kỳ chức năng nào.

### 1.2. Tính năng được tự động bảo vệ
- **Django Requests**: Mọi lỗi 500 unhandled exception đều gửi stack trace kèm request headers lên Sentry.
- **Celery Tasks**: Các tác vụ ngầm (chuyển đổi giọng nói TTS, bóc tách CV bằng AI, phân tích phỏng vấn) nếu thất bại sẽ gửi cảnh báo kèm tham số task.
- **React Frontend**: Mọi lỗi component crash được bắt tại `ErrorBoundary` sẽ tự động ghi nhận kèm component stack.

---

## 2. 📈 Phân hệ Prometheus & Grafana

### 2.1. Cổng Dịch Vụ & Tài Khoản

| Dịch vụ | Cổng Host | Đường dẫn truy cập | Tài khoản mặc định | Ghi chú |
| :--- | :--- | :--- | :--- | :--- |
| **Grafana** | `3001` | `http://localhost:3001` | User: `admin`<br>Pass: `infohr_admin_2026` | Trực quan hóa Dashboard. Tránh xung đột port 3000 của Next.js. |
| **Prometheus** | `9090` | `http://localhost:9090` | Không cần mật khẩu | Engine thu thập số liệu định kỳ mỗi 15s. |
| **LiveKit Metrics** | `7880` | `http://localhost:7880/metrics` | Nội bộ Docker | Số liệu phòng phỏng vấn WebRTC, bitrate, packet loss. |
| **Node Exporter** | `9100` | `http://localhost:9100/metrics` | Nội bộ Docker | Tải CPU, RAM, Disk, Network máy chủ. |

*(Lưu ý: Mật khẩu Grafana có thể thay đổi bằng biến `GRAFANA_ADMIN_PASSWORD` trong `.env`)*.

---

## 3. 🖥️ Các Dashboard Sẵn Có trong Grafana

Ngay khi khởi động container Grafana, hệ thống đã **tự động kết nối Prometheus** và nạp sẵn Dashboard **"InfoHR — Giám Sát Hệ Thống & Voice AI"** (`infohr-overview`):

1. **Số phòng Phỏng vấn AI đang mở (`livekit_room_total`)**: Theo dõi số phiên phỏng vấn Voice AI đang diễn ra đồng thời.
2. **Số ứng viên & Agent tham gia (`livekit_participant_total`)**: Theo dõi tổng số ứng viên và bot AI đang kết nối vào phòng.
3. **Trạng thái LiveKit Server (`up{job="livekit"}`)**: Cảnh báo tức thì nếu SFU WebRTC bị gián đoạn.
4. **Tải CPU máy chủ (`node_cpu_seconds_total`)**: Biểu đồ phần trăm CPU tiêu thụ theo thời gian thực.
5. **Tải RAM máy chủ (`node_memory_MemAvailable_bytes`)**: Biểu đồ dung lượng bộ nhớ đang sử dụng.

---

## 4. 🛠️ Các Lệnh Vận Hành

```bash
# Khởi động cụm giám sát
docker compose up -d prometheus grafana node-exporter

# Khởi động lại LiveKit để nhận cấu hình xuất metrics
docker compose restart livekit

# Xem log của Grafana
docker compose logs -f grafana

# Xem log của Prometheus
docker compose logs -f prometheus
```
