# Employer AI Interviews & Question Bank Architecture

## 1. Interview Session Lifecycle & Security
- **Authentication & Multi-Tenancy**:
  - `InterviewSessionViewSet` (`apps.interviews.views.py`) verifies recruiter permissions via `user_has_company_permission(user, "manage_interviews", company)`.
  - Non-owner recruiters are forbidden from accessing sessions created under other companies.
- **Session State Transitions**:
  ```
  DRAFT -> SCHEDULED -> CALIBRATION -> IN_PROGRESS -> PROCESSING -> COMPLETED / CANCELLED / INTERRUPTED
  ```
- **LiveKit Real-Time Integration**:
  - `POST /api/v1/interviews/web/sessions/{id}/livekit-token/` issues JWT auth tokens for participant roles:
    - Candidate: Participant with audio/video publish permissions.
    - Recruiter/Observer: Silent observer token (`create_observer_livekit_token`) or HR presence token.
    - AI Interviewer Agent: Validated via HMAC signature headers (`X-Timestamp`, `X-Signature`).

## 2. Question Bank & Question Set Architecture
- **Multi-Tenant Question Scoping**:
  - System standard questions (`company_id IS NULL`): Available globally across all companies.
  - Custom company questions (`company_id == user.active_company`): Created and maintained privately by company recruiters.
- **Question Groups / Sets**:
  - Pre-assembled packages of questions structured by difficulty, career domain, and target seniority.
  - Linked to `InterviewSession` to dynamically construct prompt contexts for the AI interview agent (`build_interview_context`).

## 3. Saved Candidate Profiles
- **Bookmark Architecture**:
  - `ResumeSavedViewSet` (`api/apps/profiles/views/web_views.py`) manages saved candidates under `company_id`.
  - Frontend optimistic mutation via `useToggleSaveResumeOptimistic` delivers immediate 0ms UI feedback while asynchronously synchronizing state with backend endpoint `POST /api/v1/resumes/{slug}/resume-saved/`.
  - Triggers asynchronous in-app notifications to candidate resume owners without blocking API response times.
