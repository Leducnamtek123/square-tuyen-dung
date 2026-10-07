# Sao Luu & Phuc Hoi Su Co (Backup & Disaster Recovery)

> **Phan he**: 09-operations  
> **Tai lieu**: backup-and-disaster-recovery.md  
> **Muc tieu RPO / RTO**: RPO < 24 gio, RTO < 2 gio

---

## 1. Chien Luoc Sao Luu Dinh Ky (Automated Backup Strategy)

He thong su dung cac script tu dong tai thu muc `scripts/` chay qua cronjob tren may chu:

1. **Sao luu Co so du lieu MySQL**:
   - Chay luc **02:00 sang** moi ngay.
   - Script su dung `mysqldump` voi tham so `--single-transaction --quick` de khong khoa bang.
   - File duoc nen dang `.sql.gz` va luu tai `backups/db_backup_square_<YYYY-MM-DD_HHMMSS>.sql.gz`.
   - File backup cu hon **30 ngay** se tu dong duoc don dep de tiet kiem o cung.
2. **Sao luu Du lieu Media MinIO S3**:
   - Toan bo du lieu file PDF CV, video, audio phien phong van duoc sao chep dong bo sang storage ngoai (Secondary Cold Storage).
3. **Thong bao Telegram Bot**:
   - Sau khi sao luu hoan tat, bot tu dong kiem tra dung luong file va gui tin nhan thong bao vao nhom Telegram DevOps.
   - Neu qua trinh dump DB gap loi, bot lap tuc ban alert muc do `CRITICAL`.

---

## 2. Kich Ban Phuc Hoi Du Lieu Khi Co Su Co (Disaster Recovery Runbook)

Khi co su co hong o cung, loi du lieu hoac thao tac xoa nham:

### Buoc 1: Dung cac container ghi du lieu
```bash
docker compose stop backend celery_worker
```

### Buoc 2: Chon ban backup gan nhat hop le
```bash
ls -lh backups/db_backup_square_*.sql.gz
```

### Buoc 3: Phuc hoi co so du lieu MySQL
```bash
# Giai nen va import truc tiep vao container MySQL
gunzip < backups/db_backup_square_latest.sql.gz | docker compose exec -T mysql mysql -u root -p"$DB_ROOT_PASSWORD" square_db
```

### Buoc 4: Tai dong bo lai Elasticsearch tu MySQL
```bash
docker compose exec backend python manage.py search_index --rebuild -f
```

### Buoc 5: Khoi dong lai cac container va kiem tra
```bash
docker compose start backend celery_worker
docker compose logs -f backend
```
