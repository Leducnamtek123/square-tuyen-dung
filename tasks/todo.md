# Todo Checklist: Backend Forensic Remediation & Frontend Design Taste

- [x] **Phase 1: Security & Validation Foundation**
  - [x] 1.1 Secure Phone Verification State Machine with OTP [CRIT-01]
  - [x] 1.2 Add Session Auth / Invite Token to Proctoring & ICS endpoints [CRIT-02]
  - [x] 1.3 Fix Onboarding Draft Schema & eliminate fake TAX/email strings [CRIT-03]
- [x] **Phase 2: Data Integrity & API Contract Restoration**
  - [x] 2.1 Remove arbitrary city guess `.first()` in candidate scraper [CRIT-04]
  - [x] 2.2 Remove silent exception masking `except Exception: return []` [CRIT-05]
  - [x] 2.3 Fix REST 404 contract in `get_job_post_detail` [HIGH-03, HIGH-04]
- [x] **Phase 3: Performance & Infrastructure Cleanup**
  - [x] 3.1 Convert sync LLM scoring in `ai_recommended_candidates` to async/cache [HIGH-01]
  - [x] 3.2 Replace unmanaged raw threads with Celery tasks in resume views [HIGH-05]
  - [x] 3.3 Clean up personal developer links and domain fallbacks [HIGH-02, MED-01, MED-02]
- [x] **Phase 4: Frontend UI/UX Elevation & Design Taste Polish**
  - [x] 4.1 Polish `HomeSearch` and Hero viewport mechanics & contrast
  - [x] 4.2 Elevate `NotFoundPage` with clean typography, contrast & brand copy
- [ ] **Phase 5: Full Verification & Checkpoints**
  - [ ] 5.1 Run backend test suite (In progress)
  - [ ] 5.2 Run frontend typecheck and build validation (In progress)
