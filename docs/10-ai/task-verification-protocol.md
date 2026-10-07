# Giao Thuc Xu Ly Task & Xac Minh (Task & Verification Protocol)

> **Phan he**: 10-ai  
> **Tai lieu**: task-verification-protocol.md  
> **Tuan thu**: Spec-driven Execution & Verification Before Completion

---

## 1. Quy Trinh 4 Buoc Xu Ly Task Chuan (4-Phase Protocol)

Khi nhan bat ky yeu cau lap trinh hoac sua loi nao tu nguoi dung, AI agent phai tuan thu 4 buoc nghiem ngat:

```text
┌─────────────────────────┐
│ GIAI DOAN 1: DIEU TRA   │ - Doc cac file lien quan trong codebase
│ (Investigation)         │ - Xac dinh ro rang models, views, components that
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│ GIAI DOAN 2: LAM RO     │ - Neu yeu cau mo ho, dat cau hoi lam ro ngay
│ (Clarification)         │ - Tranh viec tu y gia dinh roi code sai huong
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│ GIAI DOAN 3: TRIEN KHAI │ - Thay doi ma nguon theo tung khoi nho (Incremental)
│ (Implementation)        │ - Dong bo hop dong giua Frontend va Backend
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│ GIAI DOAN 4: XAC MINH   │ - Chay lenh kiem thu (pytest, ruff, pnpm typecheck)
│ (Verification)          │ - Chi bao hoan thanh khi da co bang chung ro rang
└─────────────────────────┘
```

---

## 2. Giao Thuc Dat Cau Hoi Khi Co Diem Mo Ho (Clarification Protocol)

- Neu yeu cau cua nguoi dung thieu thong tin quan trong ve:
  1. Pham vi quyen han (Ai co quyen goi endpoint nay?).
  2. Xu ly ngoai le (Khi loi thi tra ve ma HTTP nao, co rollback hay khong?).
  3. Format du lieu hien thi tren UI.
- AI **phai dat cau hoi lam ro** voi danh sach cac phuong an lua chon cu the thay vi tu y suy doan va trien khai ngam.

---

## 3. Danh Sach Kiem Tra Xac Minh Truoc Khi Hoan Thanh (Verification Checklist)

Truoc khi thong bao cho nguoi dung rang cong viec da xong:
- [ ] Da chay `ruff check .` tren backend khong con loi linting.
- [ ] Da chay `pytest` tren cac module lien quan va tat ca tests deu pass.
- [ ] Da chay `pnpm run typecheck` tren frontend khong co loi TypeScript.
- [ ] Da kiem tra khong de lai cac file tam, log debug thua hoac cert khong dung.
- [ ] Da trinh bay bang chung thuc te (output cua lenh test) trong phan bao cao.
