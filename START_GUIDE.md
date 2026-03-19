# 🚀 Hướng dẫn vận hành Dự án Square Tuyển Dụng

Tài liệu này tổng hợp các lệnh quan trọng để khởi động, reset dữ liệu và quản lý hệ thống mà không cần phải nhớ qua nhiều lệnh phức tạp.

---

## 1. Khởi động dự án (Docker)

Mở Terminal tại thư mục gốc của dự án và chạy:

```powershell
# Khởi động toàn bộ các dịch vụ (Backend, Frontend, DB, Redis, v.v.)
docker compose up -d

# Xem trạng thái các container
docker compose ps

# Xem log của Backend (để debug)
docker logs tuyendung-studio-backend -f
```

---

## 2. Reset toàn bộ dữ liệu (Làm mới từ đầu)

Dùng khi bạn muốn xóa sạch Database, xóa sạch Migration và tạo lại mọi thứ như mới:

### Bước A: Xóa sạch Container và Volume (Dữ liệu DB)
```powershell
docker compose down -v
```

### Bước B: Xóa các file Migration cũ (Chạy trong Powershell)
```powershell
Get-ChildItem -Recurse -Path .\api -Include 0*.py | Where-Object { $_.DirectoryName -like "*\migrations" } | Remove-Item -Force
```

### Bước C: Khởi động lại và tạo Migration mới
```powershell
# Khởi động lại
docker compose up -d

# Chờ khoảng 10-20 giây cho DB sẵn sàng, sau đó chạy:
docker exec tuyendung-studio-backend python manage.py makemigrations
docker exec tuyendung-studio-backend python manage.py migrate --noinput --fake-initial
```

---

## 3. Nạp dữ liệu mẫu (Seeding)

Sau khi đã có Database trống và đã chạy Migrate, hãy nạp dữ liệu chuẩn (bao gồm 63 tỉnh thành Việt Nam):

```powershell
# Nạp toàn bộ dữ liệu (Location chuẩn, Careers, Accounts, Jobs, Interviews)
docker exec tuyendung-studio-backend python manage.py run_seeding --type all
```

*Lưu ý: Quá trình nạp Location có thể mất 1-2 phút do dữ liệu địa lý Việt Nam rất lớn.*

---

## 4. Thông tin tài khoản mặc định (Sau khi Seed)

Sau khi chạy lệnh Seed ở mục 3, bạn có thể dùng các tài khoản sau:

| Vai trò | Email | Mật khẩu |
| :--- | :--- | :--- |
| **Admin** | `admin@gmail.com` | `Squaretuyendung@2026` |
| **Employer** | `ceohub.hostmaster@gmail.com` | `Squaretuyendung@2026` |
| **Candidate** | (Xem trong log seeder) | `Abc@1234` |

**OAuth2 Config (Cần cho Frontend):**
- **Client ID**: `qDZFCwY3yuN5mVNHqVVz8cAcREy5iQuGOTtQthjS`
- **Client Secret**: `project_secret_client_key_2024`

---

## 5. Các lệnh hữu ích khác

```powershell
# Vào shell của Backend để chạy lệnh Python trực tiếp
docker exec -it tuyendung-studio-backend python manage.py shell

# Tạo tài khoản Admin thủ công
docker exec -it tuyendung-studio-backend python manage.py createsuperuser
```
