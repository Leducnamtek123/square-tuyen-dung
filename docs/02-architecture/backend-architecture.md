# Kien Truc Backend (Django REST Framework)

> **Phan he**: 02-architecture  
> **Tai lieu**: backend-architecture.md  
> **Framework**: Python 3.10+, Django 4.2+, Django REST Framework (DRF)

---

## 1. Mo Hinh Service Layer Pattern

Tat ca cac ung dung trong `api/apps/` tuan thu chat che mo hinh **Service Layer Pattern** (Thin Controllers, Thick Services), tach biet ro rang giua tang giao tiep HTTP, tang xu ly nghiep vu va tang truy van co so du lieu:

```text
api/apps/<module>/
├── models.py       # Dinh nghia thuc the va cau truc bang DB (Khong chua nghiep vu nang)
├── serializers.py  # Validate du lieu dau vao va format du lieu tra ve cho Client
├── views.py        # Controller mong: Nhan request, kiem tra auth/permission, goi Service
├── services.py     # Nghiep vu chinh: Giao dich Database (atomic), tinh toan, goi ben ngoai
├── selectors.py    # Truy van chi doc (Read-only): Filter, select_related, prefetch_related
├── tasks.py        # Cac tac vu chay nen Celery (Gui mail, dong bo ES, tao PDF)
├── urls.py         # Khai bao endpoint URL cua module
└── tests/          # Unit test va integration test (pytest)
```

---

## 2. Phan Tach Trach Nhiem Chi Tiet

### 2.1. Views & ViewSets (Tang Giao Tiep HTTP)
- Chi lam nhiem vu dieu phoi:
  1. Trinh xac thuc (`authentication_classes`): Kiem tra JWT token hop le.
  2. Trinh phan quyen (`permission_classes`): Kiem tra quyen han nguoi dung (`IsAuthenticated`, `IsEmployer`, `IsAdmin`).
  3. Validate request payload bang Serializer.
  4. Goi ham nghiep vu tuong ung trong `services.py` hoac ham doc tu `selectors.py`.
  5. Tra ve HTTP Response voi status code phu hop (`200 OK`, `201 Created`, `400 Bad Request`, `404 Not Found`).

### 2.2. Services (Tang Xu Ly Nghiep Vu - Mutating Business Logic)
- Chuyen trach nhiem thuc hien cac hanh dong lam thay doi trang thai he thong (Create, Update, Delete, Transition).
- Su dung `transaction.atomic()` de dam bao tinh toan ven du lieu khi ghi vao nhieu bang lien quan.
- Day cac tac vu nang hoac side-effects (gui email, reindex Elasticsearch, goi webhook) vao `transaction.on_commit()` de chay tren Celery worker.

```python
from django.db import transaction
from apps.interviews.models import InterviewSession
from apps.interviews.tasks import generate_scorecard_pdf_task

def complete_interview_session(*, session: InterviewSession, evaluator_notes: dict) -> InterviewSession:
    with transaction.atomic():
        session.status = InterviewSession.Status.ROOM_COMPLETED
        session.evaluator_notes = evaluator_notes
        session.save(update_fields=['status', 'evaluator_notes', 'updated_at'])
        
        # Chi kich hoat task Celery khi transaction da commit thanh cong vao DB
        transaction.on_commit(lambda: generate_scorecard_pdf_task.delay(session.id))
        
    return session
```

### 2.3. Selectors (Tang Truy Van Chi Doc - Read Selectors)
- Tap trung hoa cac cau query phuc tap de tai su dung, tranh viec viet cau lenh ORM roi rac trong cac views.
- Bat buoc su dung `select_related()` cho cac quan he 1-1, Foreign Key va `prefetch_related()` cho cac quan he N-N, Reverse Foreign Key de loai bo hoan toan van de N+1 queries.

---

## 3. Hang Doi Tac Vu Nen Celery (Asynchronous Tasks)

He thong su dung Celery voi Redis broker de xu ly cac tac vu ton thoi gian:
1. **Dong bo Elasticsearch**: Khi tin tuyen dung hoac ho so ung vien duoc cap nhat, task `sync_job_to_elasticsearch` duoc day vao hang doi de cap nhat chi muc trong vong 5 giay.
2. **Sinh Scorecard PDF**: Sau khi buoi phong van ket thuc, task `generate_scorecard_pdf_task` doc ket qua cham diem, goi thu vien tao PDF va upload len MinIO S3.
3. **Dong bo Cham cong & Tinh luong**: Tinh toan cong thang va chay engine payroll cho toan bo nhan vien doanh nghiep.
4. **Gui Email & Thong bao**: Gui thu moi phong van, ket qua tuyen dung va thong bao bien dong he thong.
