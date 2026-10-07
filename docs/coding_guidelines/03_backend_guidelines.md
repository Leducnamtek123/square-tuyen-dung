# 🐍 Backend Engineering Guidelines (Django & DRF)

> **Ecosystem**: Square Tuyển Dụng (InfoHR)  
> **Framework**: Python 3.10+, Django 4.2+, Django REST Framework  
> **Database & Cache**: MySQL 8.0 (ACID), Redis 7 (Broker/Cache), Elasticsearch 7 (Search)  
> **Task Queue**: Celery 5.3+

---

## 1. 🏛️ Architecture & Separation of Concerns

We enforce a strict **Service Layer Pattern** across all Django apps in `api/apps/`. Views and ViewSets must remain thin controllers.

```text
api/apps/<module>/
├── models.py         # Pure database schema & relationships (no heavy business logic)
├── serializers.py    # Request input validation & response data shaping
├── views.py          # HTTP controllers (auth, permissions, status codes)
├── services.py       # Mutating business logic (writes, transactions, external calls)
├── selectors.py      # Read-only database queries (filtering, joins, aggregations)
├── tasks.py          # Celery background tasks (asynchronous operations)
├── urls.py           # Endpoint route mappings
└── tests/            # Unit & integration tests
```

### 1.1. Thin Controllers, Thick Services
- **Views**: Handle HTTP request extraction, authentication, permission checking, serializer invocation, and response mapping.
- **Services**: Contain domain business rules, database transactions (`transaction.atomic()`), and event emission.
- **Selectors**: Encapsulate reusable, complex read queries with eager loading.

---

## 2. ⚡ Database & ORM Optimization

### 2.1. Eradicating N+1 Queries
- **`select_related`**: MUST be used for one-to-one and foreign key relationships.
- **`prefetch_related`**: MUST be used for many-to-many and reverse foreign key relationships.
- Always inspect queries using Django Debug Toolbar or Django's `connection.queries` in tests.

```python
# ❌ BAD: Causes N+1 queries when looping over applications
applications = Application.objects.all()
for app in applications:
    print(app.candidate.user.email)

# ✅ GOOD: Executes in a single joined query
applications = Application.objects.select_related(
    'candidate__user', 'job_post__company'
).prefetch_related('scores')
```

### 2.2. Transactions & Consistency
- Wrap multi-table mutation operations in `transaction.atomic()`.
- Place external side effects (sending emails, firing webhooks, dispatching Celery tasks) inside `transaction.on_commit()`.

```python
from django.db import transaction

def process_interview_completion(session_id: int) -> InterviewSession:
    with transaction.atomic():
        session = InterviewSession.objects.select_for_update().get(id=session_id)
        session.status = InterviewStatus.COMPLETED
        session.save(update_fields=['status', 'updated_at'])
        
        # Dispatch background task only AFTER commit succeeds
        transaction.on_commit(lambda: generate_evaluation_pdf_task.delay(session.id))
        
    return session
```

---

## 3. 📦 Database Migration Hygiene

1. **Never delete or modify committed migrations**: Once a migration is committed and pushed, it is immutable. Fix schema bugs with a new forward migration.
2. **Dedicated Migration Step**: In staging and production, always run migrations as an isolated job before booting application workers:
   ```bash
   docker compose -f docker-compose.yml -f docker-compose.prod.yml run --rm migrate
   ```
3. **Inspect Plan Before Execution**:
   ```bash
   python manage.py makemigrations
   python manage.py migrate --plan
   ```
4. **Zero Downtime Migrations**:
   - Adding a non-nullable field requires a default or `null=True`.
   - Renaming a column requires a multi-step release (add new -> dual write -> backfill -> remove old).

---

## 4. ⏳ Celery Background Tasks Best Practices

- **Pass Primitive IDs**: NEVER pass model instances or large binary payloads to Celery tasks. Always pass primary keys (`int`, `str`) and fetch inside the task.
- **Idempotency**: All tasks must be safe to run multiple times without causing duplicate entries or inconsistent state.
- **Task Retries**: Always configure explicit retry limits and exponential backoff for network-dependent tasks:

```python
from celery import shared_task
from celery.utils.log import get_task_logger

logger = get_task_logger(__name__)

@shared_task(
    bind=True,
    max_retries=3,
    default_retry_delay=60,
    autoretry_for=(ConnectionError, TimeoutError),
    retry_backoff=True
)
def upload_recording_to_s3_task(self, session_id: int):
    try:
        from apps.interviews.services import s3_service
        s3_service.upload_session_media(session_id)
    except Exception as exc:
        logger.error(f"Failed to upload recording for session {session_id}: {exc}")
        raise self.retry(exc=exc)
```

---

## 5. 🛡️ Verification, Linting & Testing

Before committing any backend code, run the following verification toolchain:

```bash
# Code style and import order
ruff check api/
ruff format api/

# Type checking
mypy api/

# Automated test suite
pytest api/
```
