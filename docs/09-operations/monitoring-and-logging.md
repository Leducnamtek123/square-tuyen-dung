# Giam Sat He Thong & Quan Ly Nhat Ky (Monitoring & Logging)

> **Phan he**: 09-operations  
> **Tai lieu**: monitoring-and-logging.md  
> **Stack**: Prometheus, Grafana, Loki, Promtail, Alertmanager, ModSecurity WAF

---

## 1. Kien Truc Giam Sat & Thu Thap Logs Tap Trung

```text
┌────────────────────────────────────────────────────────┐
│               Docker Containers Log Stream             │
│      (backend, frontend, gateway, voice-ai, mysql)     │
└──────────────────────────┬─────────────────────────────┘
                           │ Thu thap log qua Promtail
                           ▼
┌────────────────────────────────────────────────────────┐
│                   Grafana Loki (:3100)                 │
│         (Luu tru & Chi muc toan bo log tap trung)      │
└──────────────────────────┬─────────────────────────────┘
                           │ Hien thi & Truy van (LogQL)
                           ▼
┌────────────────────────────────────────────────────────┐
│                  Grafana Dashboard (:3001)             │
│          (Truc quan hoa Metrics & Nhat ky loi)         │
└──────────────────────────▲─────────────────────────────┘
                           │ Truy van so lieu (PromQL)
┌──────────────────────────┴─────────────────────────────┐
│                   Prometheus (:9090)                   │
│         (Thu thap CPU, RAM, Disk, QPS, WebRTC)         │
└────────────────────────────────────────────────────────┘
```

---

## 2. Cac Chi So Quan Trong Can Theo Doi (Key Metrics & SLAs)

1. **Ty le loi HTTP (Error Rate)**: Ty le ma loi 5xx tren tong so requests phai luon **< 0.1%**.
2. **Thoi gian phan hoi API (Latency p95)**: Thoi gian phan hoi cua cac endpoint REST phai luon **< 200ms**.
3. **Phien phong van WebRTC LiveKit**:
   - So luong phong hoat dong dong thoi.
   - Packet Loss Rate (phai < 2% de dam bao chat luong giong noi).
4. **Hang doi Celery (Task Queue Length)**:
   - Do tre dong bo giua MySQL va Elasticsearch (khong qua 5 giay).

---

## 3. Tuong Lua Ung Dung Web (ModSecurity WAF)

Thu muc `waf/` chua toan bo quy tac kiem soat truy cap lop 7 cua ModSecurity ket hop bo quy tac tieu chuan OWASP Core Rule Set (CRS):
- Ngan chan cac cuoc tan cong pho bien: SQL Injection, Cross-Site Scripting (XSS), Local/Remote File Inclusion, Command Injection.
- Nhat ky tan cong duoc ghi vao `waf/logs/modsec_audit.log` va duoc Promtail day thang ve Loki de canh bao tuc thi.
