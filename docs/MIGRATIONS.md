# Migration Guide (Django + Docker)

## Mục tiêu
- Bảo đảm schema DB luôn khớp code.
- Migration rõ ràng, có lịch sử, không bị lệch giữa môi trường.
- Triển khai an toàn: migrate một lần, tránh nhiều container cùng chạy.

## Nguyên tắc bắt buộc
1. **Không xóa migration đã commit** (đặc biệt khi team/prod đã dùng).
2. **Chỉ chạy `makemigrations` ở dev**, commit file migration vào git.
3. **Deploy tách bước migrate**: chạy migrate một lần trước khi app start.
4. **Không dùng DB A chạy migration của code B** khi lệch lịch sử.
5. **Chỉ dùng `--fake-initial` một lần** khi DB đã có schema đúng nhưng thiếu lịch sử.

## Cấu trúc hiện tại của repo
- Backend: Django (thư mục `api`).
- Entry point hiện tại: `api/docker-entrypoint.sh` có chạy `python manage.py migrate --noinput --fake-initial`.
- Prod Compose: `docker-compose.prod.yml` dùng kèm `docker-compose.yml`.

Khuyến nghị: chạy migrate **một lần** như job riêng, sau đó mới `up` app.

## Quy trình chuẩn (khuyến nghị)

### 1) Dev: tạo migration
```bash
# Trong container dev
docker compose exec backend python manage.py makemigrations

# Kiểm tra kế hoạch migrate
docker compose exec backend python manage.py migrate --plan

# Áp dụng migration
docker compose exec backend python manage.py migrate --noinput
```

### 2) Prod: deploy
```bash
# Chạy migration một lần (job riêng)
docker compose -f docker-compose.yml -f docker-compose.prod.yml run --rm migrate

# (Tuỳ chọn) Seed dữ liệu
# docker compose -f docker-compose.yml -f docker-compose.prod.yml run --rm backend python manage.py run_seeding --type all

# Sau đó mới chạy toàn bộ app
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## Kiểm tra tình trạng migration
```bash
# Xem danh sách migration và trạng thái
docker compose exec backend python manage.py showmigrations

# Xem kế hoạch áp dụng (không chạy thật)
docker compose exec backend python manage.py migrate --plan
```

## Khi gặp lỗi lệch migration
### Triệu chứng phổ biến
- “Migration X đã applied nhưng file không tồn tại”.
- “Model/table đã có nhưng migration chưa chạy”.
- “DB khác schema so với code hiện tại”.

### Cách xử lý an toàn
1. **Đảm bảo DB đúng version code** (dump/restore từ đúng nhánh).
2. Nếu DB đã đúng schema nhưng thiếu lịch sử (thường do import DB trần):
   ```bash
   python manage.py migrate --fake-initial
   ```
   Lưu ý: chỉ dùng cho **initial migrations** và **một lần**.
3. Không tự xoá migration để “làm lại” nếu DB đã dùng ở môi trường khác.

## Best Practices (senior)
- Không chạy `makemigrations` trong container prod.
- Mỗi lần đổi model phải có migration đi kèm.
- Thường xuyên chạy `python manage.py makemigrations --check --dry-run` trong CI để đảm bảo không quên migration.
- Nếu migration quá dài: `python manage.py squashmigrations <app> <target>`.
- Tránh để nhiều backend/celery đồng thời chạy migrate.

## Ghi chú về entrypoint hiện tại
`api/docker-entrypoint.sh` chỉ chạy migrate khi `AUTO_MIGRATE=1`.
- Dev: backend đang bật `AUTO_MIGRATE=1` để tiện phát triển.
- Prod: backend tắt auto-migrate và dùng service `migrate` riêng.

Nếu muốn mình chỉnh code (tạo service migrate riêng, tách entrypoint, thêm CI check) thì nói rõ yêu cầu.
