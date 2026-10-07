# 📋 Implementation Plan: [Feature Title]

> **Feature Slug**: `YYYY-MM-DD-feature-name`  
> **Related Spec**: [spec.md](spec.md)  
> **Questions & Decisions**: [questions.md](questions.md)  
> **Status**: [PLANNING | IN PROGRESS | VERIFICATION | COMPLETED]

---

## 1. 🎯 Summary & Execution Strategy

[High-level summary of the implementation strategy. How do we phase this delivery to maintain continuous integration and keep PRs small and reviewable?]

---

## 2. 🏗️ Phased Task Breakdown

### Phase 1: Database Schema & Contracts
- [ ] **Task 1.1**: Define Django models in `api/apps/<module>/models.py`.
- [ ] **Task 1.2**: Generate and inspect migration (`python manage.py makemigrations`).
- [ ] **Task 1.3**: Define DRF serializers in `api/apps/<module>/serializers.py`.
- [ ] **Task 1.4**: Synchronize TypeScript interfaces in `frontend/src/types/<module>.ts`.

### Phase 2: Backend Logic & Service Layer
- [ ] **Task 2.1**: Implement mutating business logic in `api/apps/<module>/services.py`.
- [ ] **Task 2.2**: Implement optimized read queries in `api/apps/<module>/selectors.py`.
- [ ] **Task 2.3**: Wire ViewSets / Views and configure URL routes.
- [ ] **Task 2.4**: Write unit & integration tests (`pytest api/apps/<module>/tests/`).

### Phase 3: Frontend Implementation
- [ ] **Task 3.1**: Create TanStack Query API callers in `frontend/src/services/<module>Service.ts`.
- [ ] **Task 3.2**: Build UI presentation components in `frontend/src/components/<module>/`.
- [ ] **Task 3.3**: Assemble pages / layouts in `frontend/src/app/<route>/`.
- [ ] **Task 3.4**: Verify responsive layouts across desktop, tablet, and mobile.

### Phase 4: Integration & E2E Verification
- [ ] **Task 4.1**: Execute end-to-end user journey manually in Docker environment.
- [ ] **Task 4.2**: Add Playwright E2E automation test script.
- [ ] **Task 4.3**: Check network requests and verify zero N+1 queries.

---

## 3. 🛡️ Verification Commands

```bash
# Backend lint & tests
cd api && ruff check . && pytest

# Frontend lint & build
cd frontend && pnpm run lint && pnpm run build
```

---

## 4. ✅ Definition of Done Sign-off
- [ ] All checklist items in [05_definition_of_done.md](file:///c:/Users/WIN10/Documents/square-tuyen-dung/docs/coding_guidelines/05_definition_of_done.md) satisfied.
- [ ] Verified by: `[Engineer Name / Date]`
