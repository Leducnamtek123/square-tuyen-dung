# STEP 1: Exhaustive Feature Inventory

This document lists 100% of user-accessible features grouped by module across the application (`square-tuyen-dung`).

---

## 1. Authentication & Onboarding Module

- **Pages**:
  - Candidate Login (`/login`) — [login/page.tsx](file:///c:/Users/WIN10/Documents/square-tuyen-dung/frontend/src/app/login/page.tsx)
  - Employer / Candidate Register (`/register`) — [register/page.tsx](file:///c:/Users/WIN10/Documents/square-tuyen-dung/frontend/src/app/register/page.tsx)
  - Forgot Password (`/forgot-password`) — [forgot-password/page.tsx](file:///c:/Users/WIN10/Documents/square-tuyen-dung/frontend/src/app/forgot-password/page.tsx)
  - Reset Password (`/reset-password`) — [reset-password/page.tsx](file:///c:/Users/WIN10/Documents/square-tuyen-dung/frontend/src/app/reset-password/page.tsx)
  - Email Verification Required (`/email-verification-required`)
  - Onboarding Flow (`/onboarding`) — [onboarding/page.tsx](file:///c:/Users/WIN10/Documents/square-tuyen-dung/frontend/src/app/onboarding/page.tsx)
- **Dialogs & Modals**:
  - Social Auth Google / Facebook Consent Modal
  - Password Reset Sent Success Modal
- **Widgets & Reusable Components**:
  - `LoginForm` — [auths/LoginForm](file:///c:/Users/WIN10/Documents/square-tuyen-dung/frontend/src/views/components/auths/LoginForm)
  - `RegisterForm` — [auths/RegisterForm](file:///c:/Users/WIN10/Documents/square-tuyen-dung/frontend/src/views/components/auths/RegisterForm)
- **Navigation & Shortcuts**:
  - Quick role switch tab (Candidate vs Employer)

---

## 2. Employer Management Module

- **Pages**:
  - Employer Dashboard (`/employer/dashboard`) — [employer/dashboard](file:///c:/Users/WIN10/Documents/square-tuyen-dung/frontend/src/app/employer/dashboard)
  - Job Posts Management (`/employer/job-posts`) — [employer/job-posts](file:///c:/Users/WIN10/Documents/square-tuyen-dung/frontend/src/app/employer/job-posts)
  - Applied Resumes Pipeline (`/employer/applied-resumes`) — [ProfileAppliedPage](file:///c:/Users/WIN10/Documents/square-tuyen-dung/frontend/src/views/employerPages/ProfileAppliedPage)
  - Saved Resumes Database (`/employer/saved-resumes`) — [SavedProfilePage](file:///c:/Users/WIN10/Documents/square-tuyen-dung/frontend/src/views/employerPages/SavedProfilePage)
  - Company Profile Management (`/employer/company`) — [CompanyPage](file:///c:/Users/WIN10/Documents/square-tuyen-dung/frontend/src/views/employerPages/CompanyPage)
  - Company Verification (`/employer/verification`) — [VerificationPage](file:///c:/Users/WIN10/Documents/square-tuyen-dung/frontend/src/views/employerPages/VerificationPage)
- **Drawers & Modals**:
  - `AIAnalysisDrawer` — [AIAnalysisDrawer](file:///c:/Users/WIN10/Documents/square-tuyen-dung/frontend/src/views/components/employers/AIAnalysisDrawer)
  - `AiCandidateRecommendationModal` — [AiCandidateRecommendationModal.tsx](file:///c:/Users/WIN10/Documents/square-tuyen-dung/frontend/src/views/components/employers/AiCandidateRecommendationModal.tsx)
  - `EmployeeFromApplicationDialog` — [EmployeeFromApplicationDialog.tsx](file:///c:/Users/WIN10/Documents/square-tuyen-dung/frontend/src/views/components/employers/EmployeeFromApplicationDialog.tsx)
  - `ManualCandidateForm` Drawer — [ManualCandidateForm](file:///c:/Users/WIN10/Documents/square-tuyen-dung/frontend/src/views/components/employers/ManualCandidateForm)
  - `SendMailCard` Modal — [SendMailCard](file:///c:/Users/WIN10/Documents/square-tuyen-dung/frontend/src/views/components/employers/SendMailCard)
- **Table & Toolbar Actions**:
  - Job Posts Table (`JobPostsTable`): Edit, Delete, View AI Candidates, Urgent Tag, Filter by Status, Sorting
  - Applied Resume Kanban (`AppliedResumeKanban`): Drag-and-drop candidate stage transition (Applied → Screening → Interview → Offered → Hired → Rejected)
  - Batch Actions: Multi-select delete, multi-select export to Excel/CSV

---

## 3. Candidate / Job Seeker Module

- **Pages**:
  - Job Search & Discovery (`/jobs`) — [jobs/page.tsx](file:///c:/Users/WIN10/Documents/square-tuyen-dung/frontend/src/app/jobs/page.tsx)
  - Online Resume Builder (`/online-profile`) — [OnlineProfilePage](file:///c:/Users/WIN10/Documents/square-tuyen-dung/frontend/src/views/jobSeekerPages/OnlineProfilePage)
  - Attached Resume Manager (`/attached-profile`) — [AttachedProfilePage](file:///c:/Users/WIN10/Documents/square-tuyen-dung/frontend/src/views/jobSeekerPages/AttachedProfilePage)
  - My Applied Jobs (`/job-seeker/dashboard`) — [DashboardPage](file:///c:/Users/WIN10/Documents/square-tuyen-dung/frontend/src/views/jobSeekerPages/DashboardPage)
  - My Company Followed (`/my-company`) — [MyCompanyPage](file:///c:/Users/WIN10/Documents/square-tuyen-dung/frontend/src/views/jobSeekerPages/MyCompanyPage)
- **Dialogs & Drawers**:
  - Experience / Education / Certificate Add/Edit Modal
  - Resume Upload File Modal (PDF / DOCX dropzone)
  - Direct Application Confirmation Modal

---

## 4. AI Voice Interview Module

- **Pages**:
  - AI Interview Room (`/interview/[sessionId]`) — [InterviewRoomPage](file:///c:/Users/WIN10/Documents/square-tuyen-dung/frontend/src/views/jobSeekerPages/InterviewRoomPage)
  - Voice AI Redirect Gateway — [VoiceAiInterviewRedirectPage.tsx](file:///c:/Users/WIN10/Documents/square-tuyen-dung/frontend/src/views/jobSeekerPages/VoiceAiInterviewRedirectPage.tsx)
  - Interview Results & Analytics — [InterviewDetailCard](file:///c:/Users/WIN10/Documents/square-tuyen-dung/frontend/src/views/components/employers/InterviewDetailCard)
- **Widgets & Live Controls**:
  - LiveKit Audio/Video Stream Widget
  - SSE Real-time Question/Answer Streamer (`interview_event_stream`)
  - AI Voice Profile Selector Widget

---

## 5. Native HRM Subsystem

- **Pages**:
  - HRM Dashboard (`/employer/hrm`) — [HrmDashboardPage](file:///c:/Users/WIN10/Documents/square-tuyen-dung/frontend/src/views/hrmPages/HrmDashboardPage)
  - Employee List (`/employer/hrm/employees`) — [EmployeeListPage](file:///c:/Users/WIN10/Documents/square-tuyen-dung/frontend/src/views/hrmPages/EmployeeListPage)
  - Department List (`/employer/hrm/departments`) — [DepartmentListPage](file:///c:/Users/WIN10/Documents/square-tuyen-dung/frontend/src/views/hrmPages/DepartmentListPage)
  - Contracts Management (`/employer/hrm/contracts`) — [ContractListPage](file:///c:/Users/WIN10/Documents/square-tuyen-dung/frontend/src/views/hrmPages/ContractListPage)
  - Leave Requests (`/employer/hrm/leaves`) — [LeaveListPage](file:///c:/Users/WIN10/Documents/square-tuyen-dung/frontend/src/views/hrmPages/LeaveListPage)
- **Dialogs**:
  - Employee Add/Edit Dialog
  - Department Create Modal

---

## 6. Admin Control Center

- **Pages**:
  - Admin Dashboard (`/admin/dashboard`)
  - Company Verifications Management (`/admin/company-verifications`)
  - Trust Reports Moderate (`/admin/trust-reports`)
  - User Accounts Management (`/admin/users`)
  - Master Settings & Banner Control (`/admin/banners`, `/admin/settings`)
  - Components Design System Showcase — [ComponentsDesignSystemPage.tsx](file:///c:/Users/WIN10/Documents/square-tuyen-dung/frontend/src/views/adminPages/ComponentsDesignSystemPage.tsx)
