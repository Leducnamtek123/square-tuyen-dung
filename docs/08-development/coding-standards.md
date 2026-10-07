# Chuan Muc Lap Trinh (Coding Standards & Guidelines)

> **Phan he**: 08-development  
> **Tai lieu**: coding-standards.md  
> **Quy tac**: Clean Code & Domain Integrity

---

## 1. Tieu Chuan Backend Python & Django

1. **Service Layer Pattern**:
   - `views.py` phai mong (Thin Controllers), chi xu ly xac thuc, kiem tra quyen va dieu phoi.
   - Toan bo logic nghiep vu lam thay doi du lieu phai nam trong `services.py`.
   - Cac cau truy van phuc tap chi doc phai nam trong `selectors.py`.
2. **Khong bao gio de xay ra N+1 Queries**:
   - Bat buoc dung `select_related()` cho Foreign Key va One-to-One.
   - Bat buoc dung `prefetch_related()` cho Many-to-Many va Reverse Foreign Key.
3. **Bao ve tinh toan ven giao dich**:
   - Cac thao tac ghi nhieu bang bat buoc duoc boc trong `transaction.atomic()`.
   - Side effects (Celery tasks, gui email, webhook) chi duoc kich hoat ben trong `transaction.on_commit()`.
4. **Bao ton Docstrings & Comments tieng Viet**:
   - Giu nguyen cac giai thich nghiep vu, comment luu y dac thu ve Luat Lao dong, thue TNCN va cac chu thich nghiep vu hien co trong code.
5. **Format & Linting**:
   - Tuan thu PEP 8 thong qua cong cu `ruff`. Chay `ruff check .` va `ruff format .` truoc khi commit.

---

## 2. Tieu Chuan Frontend TypeScript & React

1. **Server vs. Client Boundaries**:
   - Mac dinh giu cac component la Server Components (RSC) de toi uu SEO va hieu nang load trang.
   - Chi dat `'use client'` o cac leaf components thuc su can tuong tac, hook state hoac WebRTC.
2. **Type Safety Tuyet Doi (Zero `any`)**:
   - Khong duoc phep su dung `any` trong code TypeScript.
   - Luon dong bo types trong `frontend/src/types/` khi backend serializer thay doi.
3. **Quan ly trang thai dung cap do**:
   - Du lieu can luu lai qua F5 / chia se URL phai nam tren URL Search Params.
   - Du lieu API phai qua TanStack Query v5.
   - Chi luu vao Redux session nguoi dung va telemetry phong WebRTC.
4. **Validation chat che**:
   - Toan bo bieu mau bat buoc validate qua Zod schema va React Hook Form.

---

## 3. An Toan Bao Mat (Security Hygiene)

1. **Zero Secrets in Git**: Tuyet doi khong commit file `.env`, khoa bi mat RSA/SSH, private key, mat khau co so du lieu hoac API keys vao Git.
2. **Xac thuc da lop**: Khong tin tuong du lieu tu Client gui len, luon validate o tang Serializer va kiem tra Object-Level Permission o tang Service.
