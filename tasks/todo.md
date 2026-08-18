# Task Checklist: API Contract & Service Consistency Remediation

## Phase 1: P0 Fixes (Missing Backend Endpoints)
- [x] **Task 1: Add `GET common/popular-keywords/`**
  - [x] Add `get_popular_keywords` view in `api/common/views.py`
  - [x] Register route in `api/common/urls.py`
  - [x] Verify HTTP 200 response with keyword list
- [x] **Task 2: Add `GET content/web/article-categories/`**
  - [x] Add `get_article_categories` view in `api/apps/content/views.py` from `Article.CATEGORY_CHOICES`
  - [x] Register route in `api/apps/content/urls.py`
  - [x] Verify category payload matches `ArticleCategoryInfo[]`
- [x] **Task 3: Add `POST content/send-noti-demo/`**
  - [x] Add `send_notification_demo` view in `api/apps/content/views.py` with `IsAdminUser` permission
  - [x] Register route in `api/apps/content/urls.py`
  - [x] Verify demo notification returns 200 OK

## Checkpoint 1
- [x] Run backend sanity for `common` and `apps.content`
- [x] Verify all 3 endpoints return 200 OK

## Phase 2: P1 Fixes (Clean Up Dead & Duplicate Services)
- [x] **Task 4: Remove `adminService.ts` & consolidate tests**
  - [x] Delete `frontend/src/services/adminService.ts`
  - [x] Remove export from `frontend/src/services/index.ts`
  - [x] Migrate test cases into `frontend/src/services/__tests__/userService.test.ts`
  - [x] Delete `frontend/src/services/__tests__/adminService.test.ts`
- [x] **Task 5: Harden Voice Assistant Sandbox Token Resolver**
  - [x] Add guard check for `process.env.NEXT_PUBLIC_CONN_DETAILS_ENDPOINT` in `frontend/src/components/Features/VoiceAssistant/utils.ts`

## Checkpoint 2
- [x] Run `npx tsc --noEmit` in `frontend/` to confirm zero type errors

## Phase 3: P2 Contract Alignments
- [x] **Task 6: Normalize `hrmService.onboardCandidate` payload**
  - [x] Accept both `applicationId` and `job_application_id` in `frontend/src/services/hrmService.ts`
- [x] **Task 7: Optimize `commonService.getAllCareers`**
  - [x] Replace recursive fetch loop with single request in `frontend/src/services/commonService.ts`

## Final Verification Checkpoint
- [x] Run `npx jest src/services/__tests__` in `frontend/` (152 tests passed across 22 test suites)
- [x] Run `npm run typecheck` (0 errors)
- [x] Run Django system check and view sanity verification (0 issues)
