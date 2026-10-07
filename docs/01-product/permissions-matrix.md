# Ma Tran Phan Quyen (Role-Based Access Control - RBAC Matrix)

> **Phan he**: 01-product  
> **Tai lieu**: permissions-matrix.md  
> **Ecosystem**: Square Tuyen Dung (InfoHR)

---

## 1. Dinh Nghia Cap Do Quyen Han

He thong ap dung co che RBAC ket hop Object-Level Permission (kiem tra quyen so huu tren tung ban ghi cong ty):

- **ANON**: Khach vang lai chua dang nhap
- **CANDIDATE**: Ung vien da dang nhap
- **RECRUITER**: Chuyen vien tuyen dung thuoc doanh nghiep
- **COMPANY_ADMIN**: Chu doanh nghiep hoac quan tri vien doanh nghiep
- **HRM_STAFF**: Chuyen vien phu trach C&B va nhan su noi bo
- **PLATFORM_ADMIN**: Quan tri vien he thong InfoHR / Square Tuyen Dung

---

## 2. Ma Tran Quyen Han Chi Tiet

| Tai nguyen / Hanh dong | ANON | CANDIDATE | RECRUITER | COMPANY_ADMIN | HRM_STAFF | PLATFORM_ADMIN |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Xem danh sach tin tuyen dung cong khai** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Tim kiem tin toan van Elasticsearch** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Tao & chinh sua CV truc tuyen (CV Builder)**| ❌ | ✅ (Cua minh)| ❌ | ❌ | ❌ | ❌ |
| **Nop ho so ung tuyen (Apply Job)** | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Xem lich su ung tuyen ca nhan** | ❌ | ✅ (Cua minh)| ❌ | ❌ | ❌ | ❌ |
| **Tham gia phong phong van Voice AI** | ❌ | ✅ (Co token) | ❌ | ❌ | ❌ | ❌ |
| **Dang & chinh sua tin tuyen dung** | ❌ | ❌ | ✅ (Cty minh) | ✅ (Cty minh) | ❌ | ✅ (Tat ca) |
| **Xem danh sach ung vien tren ATS Kanban** | ❌ | ❌ | ✅ (Cty minh) | ✅ (Cty minh) | ❌ | ✅ (Tat ca) |
| **Thay doi trang thai ung vien tren ATS** | ❌ | ❌ | ✅ (Cty minh) | ✅ (Cty minh) | ❌ | ✅ (Tat ca) |
| **Xem Scorecard, ghi am & video AI** | ❌ | ❌ | ✅ (Cty minh) | ✅ (Cty minh) | ❌ | ✅ (Tat ca) |
| **Tao & sua bo cau hoi phong van AI** | ❌ | ❌ | ✅ (Cty minh) | ✅ (Cty minh) | ❌ | ✅ (Tat ca) |
| **Quan ly thong tin doanh nghiep & GPKD** | ❌ | ❌ | 👁️ (Xem) | ✅ (Sua) | ❌ | ✅ (Tham dinh) |
| **Tiep nhan ung vien sang HRM (Onboard)** | ❌ | ❌ | ❌ | ✅ (Cty minh) | ✅ (Cty minh) | ✅ (Tat ca) |
| **Quan ly ho so nhan su & hop dong lao dong**| ❌ | ❌ | ❌ | ✅ (Cty minh) | ✅ (Cty minh) | ✅ (Tat ca) |
| **Quan ly ca lam viec & bang cham cong** | ❌ | ❌ | ❌ | ✅ (Cty minh) | ✅ (Cty minh) | ✅ (Tat ca) |
| **Duyet don xin nghi phep** | ❌ | ❌ | ❌ | ✅ (Cty minh) | ✅ (Cty minh) | ✅ (Tat ca) |
| **Chay Engine tinh luong & chot luong** | ❌ | ❌ | ❌ | ✅ (Cty minh) | ✅ (Cty minh) | ❌ |
| **In phieu luong Payslip & xuat Excel/CSV**| ❌ | ❌ | ❌ | ✅ (Cty minh) | ✅ (Cty minh) | ❌ |
| **Xem phieu luong ca nhan (/me/)** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ (Chinh chu NV)|
| **Kiem duyet tin dang & khoa tai khoan** | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Xem Audit Logs & thong so he thong** | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

*Chu thich*:
- `✅`: Toan quyen thuc hien
- `✅ (Cty minh)`: Chi thuc hien duoc tren du lieu thuoc doanh nghiep cua minh (Tenant Isolation)
- `👁️ (Xem)`: Chi co quyen doc, khong duoc phep thay doi
- `❌`: Bi he thong tu choi truy cap (HTTP 401 Unauthorized / HTTP 403 Forbidden)
