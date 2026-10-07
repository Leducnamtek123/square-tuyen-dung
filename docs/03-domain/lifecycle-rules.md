# Quy Tac Trang Thai & Rang Buoc Bat Bien (Lifecycle Rules & Invariants)

> **Phan he**: 03-domain  
> **Tai lieu**: lifecycle-rules.md  
> **Tieu chuan**: Data Integrity & Domain Invariants

---

## 1. Cac Quy Tac Bat Bien Cot Loi (Domain Invariants)

Moi thao tac ghi hoac cap nhat tren co so du lieu bat buoc phai thoa man cac quy tac bat bien sau day. Bat ky hanh dong nao vi pham phai bi chan ngay lap tuc tai tang Domain/Service va nem ngoai le (DomainException):

### 1.1. Invariant 1: Chi Mot Phien Phong Van Hoat Dong Cho Moi Ho So
- Mot ho so ung tuyen (`Application`) chi duoc phep co toi da **1 phien phong van duy nhat** o trang thai hoat dong (`CONNECTED_IN_ROOM` hoac `INTERVIEWING`).
- Neu mot phien moi duoc yeu cau khoi tao trong khi phien cu chua dong, he thong phai tu choi hoac bat buoc dong phien cu truoc.

### 1.2. Invariant 2: Tinh Bat Bien Cua Phieu Danh Gia (Immutable Scorecards)
- Khi `InterviewScorecard` da duoc tao lap va ghi vao co so du lieu, tat ca cac chi so diem (`technical_score`, `communication_score`, `total_score`) khong duoc phep ghi de hoac chinh sua truc tiep.
- Moi thay doi danh gia tu phia con nguoi (Moderator / Hiring Manager) phai duoc ghi thanh ban ghi override rieng biet trong bang `ScorecardAuditLog`.

### 1.3. Invariant 3: Khoa Cung Bang Luong Da Duyet (Payroll Lock Protection)
- Cac ban ghi bang luong (`PayrollLedger`) da chuyen sang trang thai `APPROVED` (Da duyet) hoac `PAID` (Da chi tra) **tuyet doi khong duoc phep tinh lai** hoac ghi de bang lenh `update_or_create`.
- Lenh tinh toan lai chi co hieu luc voi cac bang luong o trang thai `DRAFT` hoac `CALCULATED`.

### 1.4. Invariant 4: Chong Am Quy Phep (Leave Balance Non-Negative Invariant)
- Khi nhan vien nop don xin nghi phep co luong, tong so ngay nghi (`total_days`) bat buoc phai nho hon hoac bang so ngay phep con lai (`remaining_days`).
- Giao dich nhat thiet phai su dung khoa bi quan `select_for_update` tren bang `EmployeeLeaveBalance` de tranh xung dot race condition khi gui nhieu don dong thoi.

### 1.5. Invariant 5: Co Lap Du Lieu Da Doanh Nghiep (Tenant Company Isolation)
- Nguoi dung thuoc cong ty A khong bao gio duoc xem, sua hoac truy van ung vien, tin tuyen dung, phien phong van hoac du lieu cham cong/tinh luong cua cong ty B.
- Moi truy van qua Selectors phai luon duoc gan bo loc `company_id = request.user.company_id`.

---

## 2. Quy Tac Vong Doi Hop Dong Lao Dong (Contract Lifecycle Rules)

1. **Tu dong het han hop dong cu**: Khi mot hop dong moi cua nhan vien duoc tao voi trang thai `ACTIVE`, tat ca cac hop dong truoc do cua nhan vien do phai tu dong chuyen sang trang thai `EXPIRED`.
2. **Dong bo ho ten nhan su**: Khi cap nhat `first_name` hoac `last_name` cua `Employee`, he thong phai tu dong cap nhat truong `full_name` de dam bao tinh nhat quan tren toan bo he thong in an phieu luong va hop dong.
