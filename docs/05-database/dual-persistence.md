# Kien Truc Luu Tru Kep: MySQL & Elasticsearch (Dual-Persistence Architecture)

> **Phan he**: 05-database  
> **Tai lieu**: dual-persistence.md  
> **Kien truc**: Dual-Persistence Pipeline (MySQL 8 + Elasticsearch 7 + MinIO S3)

---

## 1. Ly Do Thiet Ke Kien Truc Luu Tru Kep

Trong mot he thong tuyen dung quy mo lon, cac tac vu doc va ghi co dac tinh hoan toan trai nguoc nhau:
1. **Ghi giao dich (OLTP Transactional)**: Yeu cau tinh nhat quan cao, tuan thu chat che tinh chat ACID, khoa ngoai va toan ven so sach (bang luong, hop dong, don ung tuyen, tai khoan).
2. **Doc tim kiem toan van (Full-Text Search & Analytics)**: Yeu cau tim kiem nhanh chong tren hang van tin tuyen dung va CV ung vien voi tu khoa tieng Viet co dau hoac khong dau, loc da chieu (Muc luong, dia diem, kinh nghiem) voi do tre <100ms ma khong lam qua tai co so du lieu giao dich.

Giai phap: Tach bach ro rang giua **MySQL 8.0** lam kho du lieu giao dich goc va **Elasticsearch 7.17** lam bo may tim kiem chuyen dung.

---

## 2. Co Che Dong Bo Du Lieu (Synchronization Pipeline)

Du lieu tu MySQL duoc dong bo sang Elasticsearch thong qua co che **Celery Asynchronous Tasks & Django Signals**:

```text
┌───────────────────────┐
│     Client / User     │
└───────────┬───────────┘
            │ 1. POST / PATCH (Luu tin tuyen dung)
            ▼
┌───────────────────────┐
│   Backend ViewSet     │
└───────────┬───────────┘
            │ 2. Goi Service Layer
            ▼
┌───────────────────────┐       3. Ghi du lieu ACID
│      Service Layer    │────────────────────────────────► ┌───────────────────────┐
└───────────┬───────────┘                                  │       MySQL 8.0       │
            │ 4. transaction.on_commit()                   │  (Single Source Truth)│
            ▼                                              └───────────────────────┘
┌───────────────────────┐
│  Celery Task (Queue)  │
└───────────┬───────────┘
            │ 5. Doc du lieu & Format Document
            ▼
┌───────────────────────┐       6. Index Document (< 5s)
│  sync_job_to_es Task  │────────────────────────────────► ┌───────────────────────┐
└───────────────────────┘                                  │   Elasticsearch 7     │
                                                           │ (Inverted Search Index│
                                                           └───────────────────────┘
```

---

## 3. Cau Truc Index Elasticsearch Cho `JobPost`

Index `job_posts_index` duoc cau hinh voi Vietnamese Analyzer de ho tro tim kiem tieng Viet khong dau:

```json
{
  "settings": {
    "analysis": {
      "analyzer": {
        "vn_analyzer": {
          "tokenizer": "standard",
          "filter": ["lowercase", "asciifolding"]
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "id": { "type": "keyword" },
      "company_id": { "type": "keyword" },
      "company_name": { "type": "text", "analyzer": "vn_analyzer" },
      "title": { "type": "text", "analyzer": "vn_analyzer" },
      "description": { "type": "text", "analyzer": "vn_analyzer" },
      "salary_min": { "type": "double" },
      "salary_max": { "type": "double" },
      "province_id": { "type": "integer" },
      "status": { "type": "keyword" },
      "created_at": { "type": "date" }
    }
  }
}
```

---

## 4. Co Che Khac Phuc Loi Va Tuan Thu Du Lieu (Fault Tolerance)

1. **Tu dong Retry**: Khi ket noi toi Elasticsearch bi loi, Celery task duoc cau hinh tu dong thu lai sau 10 giay, 30 giay va 60 giay voi exponential backoff.
2. **Re-index dinh ky (Daily Integrity Reconciler)**: Mot cron task Celery Beat chay luc 02:00 sang hang ngay se quet toan bo bang `job_posts` co trang thai `ACTIVE` de doi chieu va bu dap cac ban ghi bi thieu sot hoac lech index tren Elasticsearch.
