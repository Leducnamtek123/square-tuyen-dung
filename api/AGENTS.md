# 🐍 Backend API Agent Rules — Square Tuyển Dụng (InfoHR)

> **Subsystem**: `api/`  
> **Parent Governance**: Inherits all global rules from [../AGENTS.md](../AGENTS.md)  
> **Tech Stack**: Python 3.10+, Django 4.2+ LTS, Django REST Framework (DRF), Celery, Redis, MySQL 8.0, Elasticsearch 7, MinIO S3.

---

## ⚡ Critical Rules (Always Follow)

- **NEVER** run queries inside loops (Zero N+1 Policy) — **ALWAYS** use `select_related()` for FK/OneToOne and `prefetch_related()` for ManyToMany/reverse relations.
- **NEVER** place complex domain logic or external API requests in ViewSets or Serializers — **ALWAYS** delegate to `apps/*/services/`.
- **NEVER** pass full Django model instances into Celery task arguments — **ALWAYS** pass primitive IDs (`candidate_id: int`).
- **ALWAYS** wrap multi-table database writes in `transaction.atomic()`.
- **ALWAYS** use `.exists()` or `.count()` instead of loading querysets into memory or calling `len(queryset)`.
- **ALWAYS** format API responses using the standardized envelope: `{ success: true/false, data/error: ... }`.

---

## 1. 🏛️ Layered Architecture & Separation of Concerns

All backend code in `api/apps/` MUST follow a clean three-tier separation of concerns:

```text
[HTTP Request]
       │
       ▼
1. View / ViewSet         --> Handles routing, query params, auth permissions, HTTP status codes
       │
       ▼
2. Serializer             --> Validates input shape, casts types, serializes output DTOs
       │
       ▼
3. Service / Domain Layer --> Executes core business logic, DB transactions, external API calls
       │
       ▼
[Django ORM / Models]
```

### Directives:
1. **Thin ViewSets**: ViewSets and APIViews must NOT contain raw business logic or direct multi-step database mutations. Delegate to dedicated services (e.g., `apps/jobs/services/job_service.py`).
2. **Serializers for Data Contract**: Keep serializers focused on validation and transformation. Avoid triggering external HTTP calls or deep business side effects inside `Serializer.save()` or `validate()`.
3. **Pure Service Layer**: Encapsulate domain logic inside standalone service functions or classes. Services must be easily testable without requiring a mocked HTTP request.

---

## 2. ⚡ ORM Performance & Zero N+1 Policy

N+1 queries degrade database performance under production load. All agents MUST strictly enforce query optimization:

### Query Optimization Rules
1. **Always Preload Relationships**:
   - Use **`select_related()`** for single-valued relationships (`ForeignKey`, `OneToOneField`).
   - Use **`prefetch_related()`** for multi-valued relationships (`ManyToManyField`, reverse ForeignKey lookups).
   ```python
   # ❌ BAD: Causes N+1 query in loops or serializer field serialization
   jobs = Job.objects.filter(is_active=True)

   # ✅ GOOD: Pre-fetches company and skills in constant queries
   jobs = (
       Job.objects.filter(is_active=True)
       .select_related('company', 'category')
       .prefetch_related('skills', 'benefits')
   )
   ```
2. **Lean Querysets**:
   - Use `.only('id', 'title', 'slug')` or `.defer('detailed_description')` when querying large tables for list views.
   - Use `.values()` or `.values_list(..., flat=True)` when only specific primitives are needed.
3. **Efficient Aggregation**:
   - Use `.exists()` instead of `if queryset:` or `if queryset.count() > 0:`.
   - Use `.count()` instead of `len(queryset)`.
4. **Bulk Mutations**:
   - Use `bulk_create()` and `bulk_update()` with a defined `batch_size` (e.g. `batch_size=500`) instead of calling `.save()` in loops.
5. **Transactions**:
   - Wrap multi-table operations in `transaction.atomic()` to guarantee ACID data integrity.

---

## 3. ⏱️ Celery & Background Asynchronous Tasks

- **Task Idempotency**: Every Celery task must be designed to be safely re-run without causing duplicate data or corrupting states.
- **Task Declaration**: Always use `@shared_task` with explicit binding, max retries, and backoff:
  ```python
  from celery import shared_task
  import logging

  logger = logging.getLogger(__name__)

  @shared_task(
      bind=True,
      max_retries=3,
      default_retry_delay=60,
      autoretry_for=(Exception,),
      retry_backoff=True,
  )
  def send_interview_invitation_email(self, candidate_id: int, interview_id: int):
      try:
          # Business logic here
          pass
      except Exception as exc:
          logger.error(f"Failed to send email for candidate {candidate_id}: {exc}")
          raise
  ```
- **Lightweight Arguments**: Pass only entity IDs (e.g. `candidate_id: int`) into tasks. Never serialize whole Django model instances into Celery messages.

---

## 4. 🌐 API Standards, Status Codes & Error Handling

- **Consistent JSON Structure**:
  - Success responses:
    ```json
    {
      "success": true,
      "data": { ... },
      "message": "Operation completed successfully"
    }
    ```
  - Error responses:
    ```json
    {
      "success": false,
      "error": {
        "code": "INVALID_INPUT",
        "message": "Chi tiết lỗi bằng tiếng Việt",
        "details": { "email": ["Email đã tồn tại trong hệ thống"] }
      }
    }
    ```
- **Standard HTTP Codes**:
  - `200 OK`: Successful read or update.
  - `201 Created`: Successful resource creation.
  - `204 No Content`: Successful deletion.
  - `400 Bad Request`: Validation failure.
  - `401 Unauthorized`: Missing or invalid JWT authentication.
  - `403 Forbidden`: Insufficient permissions or role mismatch.
  - `404 Not Found`: Resource does not exist.
  - `422 Unprocessable Entity`: Business logic invariant violation.

---

## 5. 🔍 Elasticsearch & MinIO S3 Guidelines

- **Elasticsearch**:
  - Sync updates using Django signals or Celery jobs via `django-elasticsearch-dsl`.
  - Maintain index mappings and analyzers in corresponding `documents.py`.
- **MinIO S3**:
  - Use secure, structured bucket paths:
    - CVs: `cvs/{candidate_id}/{uuid}.pdf`
    - Audio recordings: `recordings/audio/{interview_id}/{session_id}.mp3`
    - Video recordings: `recordings/video/{interview_id}/{session_id}.mp4`
  - Always generate presigned URLs with reasonable expiration times for private assets.

---

## 6. 📏 Code Style & Naming Conventions

- Follow **PEP 8**:
  - Variables, functions, methods: `snake_case`.
  - Classes, Models, Serializers: `PascalCase`.
  - Constants & Configuration keys: `UPPER_SNAKE_CASE`.
- **Type Annotations**: Use Python type hints (`typing` or Python 3.10+ native pipe `int | None`) for service functions and helper methods.
- **Ruff & Linter**: Ensure code conforms to rules defined in `ruff.toml` and `.pylintrc`.

---

## 7. 🧪 Testing & Verification Gate

Before concluding backend tasks, execute:
```bash
# Run Ruff linting check
ruff check .

# Check code formatting
ruff format --check .

# Run Mypy static type check
mypy .

# Execute Pytest test suite
pytest -v
```
