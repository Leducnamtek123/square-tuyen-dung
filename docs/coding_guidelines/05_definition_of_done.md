# ✅ Definition of Done (DoD) Checklist

> **Ecosystem**: Square Tuyển Dụng (InfoHR)  
> **Standard**: Production-Grade Verification & Sign-off  
> **Applies to**: All Feature Work, Bug Fixes, Refactoring, and Releases

---

## 1. 📌 What is the Definition of Done?

In InfoHR, a task, user story, or bug fix is considered **DONE** and ready for merge only when it meets all the criteria in this document. Self-claiming completion without empirical verification is strictly prohibited.

---

## 2. 📋 The Universal 7-Pillar DoD Checklist

Every Pull Request must satisfy all 7 pillars before receiving code approval:

### Pillar 1: Code Quality & Architecture
- [ ] Code adheres strictly to subsystem rules (`frontend/`, `api/`, `voice-ai/`).
- [ ] No duplicated logic (DRY principle applied).
- [ ] Backend adheres to Service Layer / Selector pattern (thin controllers).
- [ ] Frontend adheres to Server vs. Client component boundaries.
- [ ] No commented-out dead code or unused imports left behind.
- [ ] Vietnamese domain comments and docstrings are preserved.

### Pillar 2: Automated Verification & Testing
- [ ] **Frontend**: `pnpm run lint` passes with 0 errors and 0 warnings.
- [ ] **Frontend**: `pnpm run build` succeeds without type errors.
- [ ] **Backend**: `ruff check .` and `ruff format --check .` pass.
- [ ] **Backend**: `pytest` passes with all relevant unit/integration tests green.
- [ ] New features include automated regression tests covering positive, negative, and edge cases.

### Pillar 3: Security & Secret Hygiene
- [ ] **Zero Secrets in Git**: No `.env` files, API keys, JWT secrets, MinIO credentials, or certificates committed.
- [ ] All inputs validated via DRF serializers (backend) or Zod / React Hook Form (frontend).
- [ ] Database queries are parameterized (zero raw SQL string concatenation).
- [ ] Authorization / permissions checked on every mutating endpoint (RBAC enforced).

### Pillar 4: Database & Performance Standards
- [ ] Backend queries inspected: zero N+1 query regressions (`select_related` / `prefetch_related` applied).
- [ ] Database migrations tested forward and backward; no destructive table locks without review.
- [ ] Asynchronous tasks dispatched through Celery; payloads contain only IDs.
- [ ] Frontend bundle size not bloated; images use `next/image` with explicit dimensions.

### Pillar 5: Cross-Subsystem Contract Synchronization
- [ ] When DRF serializers change, corresponding TypeScript interfaces in `frontend/src/types/` are updated.
- [ ] Interactive OpenAPI / Swagger (`/swagger/`) reflects updated schemas and parameters.
- [ ] Voice AI agent data channel payloads match frontend WebRTC event handlers.

### Pillar 6: Cross-Browser & Responsive Design
- [ ] Tested across desktop (1440px), laptop (1024px), tablet (768px), and mobile (375px).
- [ ] Layout renders correctly on Chromium, Firefox, and WebKit (Safari).
- [ ] Dark mode and light mode tested with sufficient contrast (WCAG AA).

### Pillar 7: Documentation & Traceability
- [ ] Significant architectural changes accompanied by an ADR in `docs/decisions/`.
- [ ] Feature implementation follows the corresponding spec in `docs/features/`.
- [ ] Commit history is clean, atomic, and follows Conventional Commits.
- [ ] PR description includes test evidence, screenshots/recordings for UI changes.

---

## 3. 🎯 Subsystem Specific DoD Quick-Cards

### Frontend PR Checklist
```bash
# Must pass before opening PR
pnpm run lint
pnpm run build
pnpm exec playwright test # if UI flow changed
```

### Backend PR Checklist
```bash
# Must pass before opening PR
ruff check api/
ruff format --check api/
pytest api/
python manage.py makemigrations --check --dry-run
```

### Voice AI PR Checklist
```bash
# Must pass before opening PR
ruff check voice-ai/
python -m pytest voice-ai/tests/ # if tests present
```
