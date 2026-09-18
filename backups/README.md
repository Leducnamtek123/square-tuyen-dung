# Square Recruitment Platform - Full Backup & Restore Guide

Kho mã nguồn đã tích hợp sẵn trọn bộ dữ liệu để triển khai ngay khi clone sang máy tính hoặc máy chủ mới:
1. **Cơ sở dữ liệu MySQL**: `backups/db_backup_latest.sql.gz` (~670 KB)
2. **Hình ảnh, Media & CV MinIO (S3)**: `backups/minio_media_latest.tar.gz` (~81 MB)

---

## 📦 Các gói dữ liệu sao lưu
- **Database Dump**: `backups/db_backup_latest.sql.gz`
  - Chứa 113 bảng: Toàn bộ thông tin Công ty, Tin tuyển dụng, Ứng viên, Tài khoản, Chấm công, Bảng lương, v.v.
- **MinIO Media Archive**: `backups/minio_media_latest.tar.gz`
  - Chứa toàn bộ: Logo công ty (`logo/`), Ảnh bìa (`cover_image/`), Ảnh giới thiệu (`company_image/`, `vismarttech/`, `goldlotustravel/`), Banner Web & App (`banners/`), Avatar người dùng (`avatar/`), Giấy phép kinh doanh (`business_license/`), Bài viết tin tức (`articles/`), Biểu tượng nghề nghiệp (`career_image/`), Mẫu âm thanh phỏng vấn (`voice-profiles/`) và toàn bộ các tệp CV PDF đang hoạt động (`cv/`).

---

## ⚡ Hướng dẫn Khôi phục Toàn bộ Dữ liệu (1 Lệnh duy nhất)

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

*Lệnh trên sẽ tự động nạp toàn bộ cơ sở dữ liệu MySQL và giải nén toàn bộ hình ảnh/CV vào MinIO storage trong 1 thao tác.*
