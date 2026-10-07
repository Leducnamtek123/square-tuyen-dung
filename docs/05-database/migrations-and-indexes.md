# Migrations & Chien Luoc Danh Chi Muc (Migrations & Indexes)

> **Phan he**: 05-database  
> **Tai lieu**: migrations-and-indexes.md  
> **Ecosystem**: Square Tuyen Dung (InfoHR)

---

## 1. Quy Trinh Quan Ly Migrations (Migration Discipline)

He thong ap dung quy trinh kiem soat migration nghiem ngat nham ngan ngua downtime va mat mat du lieu:

1. **Tao migration moi**:
   ```bash
   python manage.py makemigrations <app_name>
   ```
2. **Kiem tra cau lenh SQL duoc sinh ra**:
   ```bash
   python manage.py sqlmigrate <app_name> <migration_number>
   ```
   Kiem tra ky xem co lenh `DROP COLUMN` hoac `TABLE LOCK` nao co the gay tac nghen he thong hay khong.
3. **Chay migration tren moi truong dev/test truoc**:
   ```bash
   python manage.py migrate
   ```
4. **Quy tac bat bien ve migration**:
   - **Tuyet doi khong sua hoac xoa file migration da duoc merge vao nhanh `dev` hoac `main`**.
   - Neu can thay doi cau truc, bat buoc phai tao file migration moi de sua doi hoac rollback.
   - Tranh su dung `default` tinh toan dong (vi du: `timezone.now` truc tiep lam default gia tri khong goi callable).

---

## 2. Chien Luoc Danh Chi Muc (Indexing Strategy)

Co so du lieu MySQL 8 su dung InnoDB B-Tree indexes de toi uu hoa cac truy van doc pho bien:

### 2.1. Chi muc don (Single-column Indexes)
- `users(email)`: Unique index phuc vu dang nhap toc do cao O(1).
- `companies(tax_id)`: Unique index dam bao ma so thue duy nhat toan quoc.
- `job_posts(status)`: B-tree index ho tro loc nhanh cac tin dang hoat dong (`ACTIVE`).
- `job_posts(slug)`: Unique index cho URL SEO phia frontend.

### 2.2. Chi muc ket hop (Composite Indexes)
Cac truy van co bo loc phuc tap ket hop giua nhieu dieu kien bat buoc duoc toi uu bang Composite Indexes:
- `job_posts(company_id, status, created_at)`:
  - Phuc vu trang quan ly tin dang cua doanh nghiep: Loc theo cong ty, trang thai va sap xep theo ngay tao giam dan.
- `applications(job_post_id, status)`:
  - Phuc vu man hinh ATS Kanban Pipeline: Load nhanh danh sach ung vien theo tung cot trang thai cua mot tin dang cu the.
- `hrm_payroll_ledgers(company_id, month, year)`:
  - Toi uu man hinh danh sach bang luong toan cong ty theo ky luong.
- `hrm_attendance_records(employee_id, date)`:
  - Unique composite index dam bao moi nhan vien chi co 1 ban ghi cham cong tong hop moi ngay.

---

## 3. Quy Tac Tranh N+1 Query & Table Locking

- Tranh dat `null=False` kem them cot moi tren bang co hang trieu ban ghi tren production neu khong co gia tri mac dinh an toan.
- Luon su dung Selectors co chua `select_related` hoac `prefetch_related` de dam bao truy van khong bi nhan ban khi doc du lieu kem foreign keys.
