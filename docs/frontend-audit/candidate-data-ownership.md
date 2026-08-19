# Candidate Portal Data Ownership & Zero Fake Data Audit Matrix

## 1. Data Ownership Matrix across Candidate Routes
| Route / Component | Displayed Field / Feature | Source & Classification | Ownership Verification |
| :--- | :--- | :--- | :--- |
| `/(candidate)/dashboard` | Applied Jobs KPI Count | `BACKEND DATA` | Fetched via `jobPostActivityService.getJobPostActivity({ pageSize: 1 })`. |
| `/(candidate)/dashboard` | Saved Jobs KPI Count | `BACKEND DATA` | Fetched via `useSavedJobs({ pageSize: 1 })`. |
| `/(candidate)/dashboard` | Followed Companies Count | `BACKEND DATA` | Fetched via `useCompaniesFollowed({ pageSize: 1 })`. |
| `/(candidate)/dashboard` | Resume Views Count | `BACKEND DATA` | Fetched via `useResumeViewed({ pageSize: 1 })`. |
| `/(candidate)/dashboard` | CV Health Circular Progress | `DERIVED DATA` | Formatted mathematically: `min(viewedCount * 20, 100)` for visual metric scale. |
| `/(candidate)/dashboard` | AI Job Recommendations | `BACKEND DATA` | Vector match API querying active CV recommendations. |
| `/(candidate)/profile` | Personal Info & Contact | `BACKEND DATA` | Synced from `jobSeekerProfileService.getProfile()` & `userSlice`. |
| `/(candidate)/profile` | Avatar & Cover URL | `BACKEND DATA` | Stored on server; uploaded via `authService.updateAvatar`. |
| `/(candidate)/profile` | Skills & Bio | `BACKEND DATA` | Synced from active web resume (`resumeService`). |
| `/(candidate)/account` | Email & Phone Security | `BACKEND DATA` | Mutated via `authService.updateUser` and `jobSeekerProfileService.updateProfile`. |
| `/(candidate)/account` | Notification Toggles | `LOCAL UI STATE` | Stored in `localStorage` (`sq_notify_email`, `sq_notify_sms`, `sq_notify_jobs`). |
| `/(candidate)/account` | Language Preference | `LOCAL UI STATE` | Bound to `i18next` language cookie/localStorage. |
| `/(candidate)/my-jobs` | Saved Jobs List | `BACKEND DATA` | Fetched via `jobPostActivityService.getSavedJobs`. |
| `/(candidate)/my-jobs` | Applied Jobs & Status | `BACKEND DATA` | Fetched via `jobPostActivityService.getJobPostActivity`. Status enum from backend. |
| `/(candidate)/my-jobs` | Search Alerts | `BACKEND DATA` | Fetched & saved via `jobPostNotificationService`. |
| `/(candidate)/my-interviews` | Interview Sessions | `BACKEND DATA` | Fetched via `interviewService.getMyInterviews`; normalized via `transformInterviewSession`. |
| `/(candidate)/my-interviews` | Empty State Copy | `STATIC / I18N` | Fully localized via `jobSeeker:myInterviews.emptyTitle` & `emptySubtitle`. |

---

## 2. Zero Fake Business Data Audit Verification
- **Candidate Dashboard**: 0 mock arrays. All 4 KPIs bind directly to server pagination totals (`res.count`).
- **Candidate Profile**: Stale mock storage code removed (`localStorage.removeItem("sq_user_profile_data")`). All fields bind to backend DTO.
- **My Jobs**: Real application activity logs with verified backend status badges.
- **My Interviews**: Real interview sessions mapped from backend session objects with invite tokens for WebRTC LiveKit joining.
- **Result**: **0 FAKE BUSINESS DATA FOUND** across all 5 candidate portal core routes.