# Square Recruitment Platform - Database Backup & Restore

Bản sao lưu cơ sở dữ liệu mẫu (`db_backup_latest.sql.gz`) được tích hợp sẵn trong kho mã nguồn để cho phép triển khai nhanh chóng đầy đủ dữ liệu khi clone dự án sang máy tính hoặc máy chủ mới.

---

## 📦 File sao lưu
- **File**: `backups/db_backup_latest.sql.gz`
- **Database**: `square_db`
- **Format**: MySQL 8.0 gzip compressed SQL dump (single transaction, routines, triggers, events)

---

## ⚡ Hướng dẫn Khôi phục Dữ liệu (Restore)

Sau khi clone dự án và khởi động các container Docker (`docker compose up -d`):

### 1. Trên Linux / macOS
```bash
chmod +x ./scripts/restore_db.sh
./scripts/restore_db.sh
```

### 2. Trên Windows (PowerShell)
```powershell
./scripts/restore_db.ps1
```

### 3. Hoặc chạy thủ công qua Docker CLI (Mọi hệ điều hành)
```bash
# 1. Copy file backup vào container MySQL
docker cp backups/db_backup_latest.sql.gz tuyendung-studio-db:/tmp/restore.sql.gz

# 2. Giải nén và nạp trực tiếp vào cơ sở dữ liệu square_db
docker exec tuyendung-studio-db bash -c "gzip -dc /tmp/restore.sql.gz | mysql -u root -p5Dg-UfRnuEvcqJ9mkhrpaPccoijdKlQCIQKHEA-zaPHn-4vECYIVUNWJOi8XTJFV square_db && rm -f /tmp/restore.sql.gz"
```
