# Employer Job Management & Candidate Pipeline Architecture

## 1. Employer Dashboard Architecture
- **Metrics Aggregation**: Backend-driven via `EmployerStatisticViewSet.general_statistics` (`GET /api/v1/jobs/employer-statistics/?type=general`).
- **Authorization & Multi-Tenancy**: Data filtered by `request.user.active_company` preventing multi-tenant data leakage.
- **Authoritative KPIs**:
  - `totalJobPost`: Active company job post count.
  - `totalJobPostingPendingApproval`: Job posts awaiting administrator approval (`status=PENDING`).
  - `totalJobPostExpired`: Job posts where `deadline < today`.
  - `totalApply`: Applications submitted to company job posts (`JobPostActivity.is_deleted=False`).
  - `totalInterviews` & `totalInterviewsCompleted`: Interview sessions scheduled for company jobs.
  - `avgAiOverallScore`: Mean score computed from completed interviews with AI evaluation.
  - `conversionRate`: Percentage ratio of interviews to total applications.

## 2. Job Post Lifecycle & Mutations
```
1. Job Creation:
   Employer Form Submission
   → POST /api/v1/jobs/private/ (JobPostService.create_job)
   → Validates company.is_verified == True (rejects unverified recruiters with 400)
   → Creates relational Location entity in locations_location
   → Sets status = APPROVED (if auto-approve enabled) or PENDING
   → Invalides ['employerJobPosts', 'jobPostOptions'] React Query caches

2. Job Update:
   Employer Edit Submission
   → PATCH / PUT /api/v1/jobs/private/{slug}/ (JobPostService.update_job)
   → Updates Location and JobPost fields atomically
   → If core review fields change (salary, position, requirements), transitions to PENDING (if required)
   → Invalidates React Query cache

3. Job Deletion:
   Employer Delete Confirmation
   → DELETE /api/v1/jobs/private/{slug}/
   → Soft-deletes or purges JobPost and emits audit log entry
```

## 3. Application Pipeline & Candidate Lifecycle
```
State Machine Transitions:
   (1) PENDING_CONFIRMATION (Chờ xác nhận)
        ├──► (2) CONTACTED (Đã liên hệ)
        └──► (6) NOT_SELECTED (Không phù hợp / Từ chối)
   
   (2) CONTACTED (Đã liên hệ)
        ├──► (3) TESTED (Đã làm bài test)
        └──► (6) NOT_SELECTED (Không phù hợp / Từ chối)
   
   (3) TESTED (Đã làm bài test)
        ├──► (4) INTERVIEWED (Đã phỏng vấn)
        └──► (6) NOT_SELECTED (Không phù hợp / Từ chối)
   
   (4) INTERVIEWED (Đã phỏng vấn)
        ├──► (5) HIRED (Đã tuyển dụng -> HRM Onboarding)
        └──► (6) NOT_SELECTED (Không phù hợp / Từ chối)
   
   (5) HIRED & (6) NOT_SELECTED
        └── Terminal States (No further forward transitions allowed)
```

## 4. HRM Candidate Onboarding Integration
- When candidate reaches stage `4 (INTERVIEWED)` or `5 (HIRED)`, recruiter can trigger `onCreateEmployee`.
- Opens `EmployeeFromApplicationDialog`, serializing candidate profile info to `hrmService.onboardCandidate`.
- Automatically links `hrmEmployeeId` and updates status badge in `AppliedResumeTable`.
