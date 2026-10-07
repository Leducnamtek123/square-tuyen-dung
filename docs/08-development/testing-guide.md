# Huong Dan Kiem Thu (Testing & QA Guide)

> **Phan he**: 08-development  
> **Tai lieu**: testing-guide.md  
> **Frameworks**: Pytest (Backend), Playwright (Frontend E2E), Jest/Vitest

---

## 1. Chien Luoc Kiem Thu He Thong (Testing Pyramid)

```text
               ▲
              / \
             /   \      E2E Tests (Playwright)
            /     \     - Luong nop CV, ATS Kanban, Room WebRTC
           /───────\
          /         \   Integration Tests
         /           \  - API Endpoints, Celery Sync, LiveKit Webhook
        /─────────────\
       /               \ Unit Tests (Pytest)
      /                 \- Payroll Engine, FSM Transitions, Models
     /───────────────────\
```

---

## 2. Kiem Thu Backend Voi Pytest

### 2.1. Chay Test Suite
```bash
cd api

# Chay toan bo test suite
pytest

# Chay test suite kem do phu coverage
pytest --cov=apps --cov-report=html

# Chay tap trung mot file test cu the
pytest apps/hrm/tests.py -v

# Chay chi cac test case lien quan den tinh luong
pytest apps/hrm/tests.py -k "payroll" -v
```

### 2.2. Cac Kich Ban Kiem Thu Bat Buoc (Critical Test Cases)
- **Payroll Precision**: Kiem tra tinh toan thue TNCN voi 0 nguoi phu thuoc, 1 nguoi phu thuoc (giam 4.4tr), va tren 2 nguoi phu thuoc.
- **Overnight Shifts**: Kiem tra ca dem bat dau tu 22:00 hom truoc den 06:00 sang hom sau khong bi tach thanh 2 ngay khac nhau.
- **Leave Balance Concurrency**: Kiem tra 2 request nop don nghi phep gui cung mot luc khong lam am so ngay phep con lai.
- **Immutability Protection**: Kiem tra lenh cap nhat bang luong da o trang thai `APPROVED` bi tu choi nem loi.

---

## 3. Kiem Thu Frontend E2E Voi Playwright

### 3.1. Chay Playwright Tests
```bash
cd frontend

# Chay tat ca E2E tests
pnpm exec playwright test

# Chay test o che do giao dien truc quan (UI Mode)
pnpm exec playwright test --ui

# Chay rieng test luong phong van AI
pnpm exec playwright test tests/e2e/03-employer/ai-scorecard.spec.ts
```

### 3.2. Pham Vi Kiem Thu E2E
1. **Auth & Route Guards**: Kiem tra nguoi dung chua dang nhap khong vao duoc cac trang yeu cau quyen; ung vien khong vao duoc trang nha tuyen dung.
2. **ATS Kanban Drag & Drop**: Kiem tra keo tha the ung vien giua cac cot trang thai va cap nhat trang thai that tren API.
3. **Audio Pre-flight Check**: Kiem tra cap quyen Micro/Camera va hien thi song am truoc khi vao phong phong van Voice AI.
