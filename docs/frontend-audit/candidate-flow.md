# Candidate Portal Business Flow & Architecture Map

## 1. Candidate Dashboard Flow
```text
Candidate enters /(candidate)/dashboard
  │
  ├── Auth & Workspace Guard (JobSeekerLayout)
  │     ├── Token check -> tokenService.getAccessTokenFromCookie()
  │     ├── Role verification -> canAccessJobSeekerPortal(user)
  │     ├── Onboarding check -> if isOnboarded === false -> /onboarding/candidate
  │     └── Workspace resolution -> setActiveWorkspace("job_seeker")
  │
  ├── Metrics Aggregation (React Query + REST API)
  │     ├── Applied Jobs Count: jobPostActivityService.getJobPostActivity({ pageSize: 1 })
  │     ├── Saved Jobs Count: jobPostActivityService.getSavedJobs({ pageSize: 1 })
  │     ├── Followed Companies Count: companyService.getCompaniesFollowed({ pageSize: 1 })
  │     └── Profile Viewed Count: resumeService.getResumeViewed({ pageSize: 1 })
  │
  ├── AI Job Recommendation Hub
  │     ├── AiRecommendedJobsSection (vector-based match with active CV)
  │     └── CandidateRecommendedJobsCard (career-based recommendation fallback)
  │
  └── CV Health & Activity Trend Card
        └── Real employer views visualization and profile improvement CTA
```

---

## 2. Profile Management & Online CV Builder Flow
```text
Candidate enters /(candidate)/profile
  │
  ├── Data Synchronization
  │     ├── Profile Metadata: jobSeekerProfileService.getProfile()
  │     ├── Primary Resume: useResumes(profileId, { resumeType: "WEBSITE" })
  │     └── Active User Account: Redux currentUser
  │
  ├── Mutations & CRUD Operations
  │     ├── Toggle Job Seeking Status: jobSeekerProfileService.updateProfile({ isJobSeeking })
  │     ├── Avatar Upload: authService.updateAvatar(FormData) -> updates Redux user
  │     ├── Cover Photo Upload: authService.updateUser({ coverUrl })
  │     ├── Personal Info Edit: CandidateEditProfileModal -> jobSeekerProfileService.updateProfile + authService.updateUser
  │     └── Skills & Bio Sync: resumeService.updateResume(slug, { title, description })
  │
  └── Applied Resume Management
        └── Upload new PDF/DOCX or select active default web profile
```

---

## 3. Account Settings & Security Flow
```text
Candidate enters /(candidate)/account
  │
  ├── Security Settings
  │     ├── Update Email: authService.updateUser({ email }) -> dispatch getUserInfo()
  │     ├── Update Phone: jobSeekerProfileService.updateProfile({ phone })
  │     └── Change Password: authService.changePassword({ oldPassword, newPassword, confirmPassword })
  │
  ├── Notification Preferences (Client Persisted)
  │     ├── Email Notifications (localStorage "sq_notify_email")
  │     ├── SMS Notifications (localStorage "sq_notify_sms")
  │     └── Job Alert Notifications (localStorage "sq_notify_jobs")
  │
  └── System Actions
        ├── Language Switch: i18n.changeLanguage(selectedLang)
        └── Logout: tokenService.removeCookie() + dispatch removeUserInfo() -> /login
```

---

## 4. My Jobs (Saved & Applied Jobs Hub) Flow
```text
Candidate enters /(candidate)/my-jobs
  │
  ├── Tab 1: Saved Jobs (SavedJobCard)
  │     ├── API: jobPostActivityService.getSavedJobs
  │     └── Action: Unsave job post (mutates backend bookmark state)
  │
  ├── Tab 2: Applied Jobs (AppliedJobCard)
  │     ├── API: jobPostActivityService.getJobPostActivity
  │     └── Displays application timeline, status badges, employer contact
  │
  └── Tab 3: Job Alerts / Notifications (JobPostNotificationCard)
        ├── API: jobPostNotificationService.getJobPostNotifications
        └── Action: Create / Edit / Delete frequency & career filters
```

---

## 5. My Interviews & LiveKit / AI Integration Flow
```text
Candidate enters /(candidate)/my-interviews
  │
  ├── Query Scheduled Interviews
  │     ├── Hook: useMyInterviews({ pageSize: 50 }) -> interviewService.getMyInterviews
  │     └── Transformer: transformInterviewSession() standardizes backend session schema
  │
  ├── State Classification
  │     ├── Empty State: Localized guidance with find jobs CTA
  │     └── Active Session List: Displays company, job title, schedule date, status chip
  │
  └── Action: Join Interview
        └── Router push to /interview-room/:inviteToken (LiveKit WebRTC session)
```