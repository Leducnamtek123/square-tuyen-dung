# STEP 2: Exhaustive UI Actions Matrix

This document inspects every clickable component, submit button, search input, filter dropdown, and batch action across all views.

---

## Employer Module Actions

| Feature | UI Component | Handler | State Change | Expected Result | Current Result | Evidence File | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **Job Post Search** | `JobPostFilterForm` Input | `onSearchChange(val)` | Updates `search` state string | Filtered job post table rows | Triggers debounced API fetch | [JobPostFilterForm](file:///c:/Users/WIN10/Documents/square-tuyen-dung/frontend/src/views/components/employers/JobPostFilterForm) | ✅ Pass |
| **Job Post Delete** | `DeleteIconButton` | `handleDelete(id)` | Sets target job ID in state | Opens confirmation modal & deletes on confirm | Calls `jobService.deleteJobPost` | [JobPostsTable/index.tsx](file:///c:/Users/WIN10/Documents/square-tuyen-dung/frontend/src/views/components/employers/JobPostsTable/index.tsx#L280) | ✅ Pass |
| **Job Post Edit** | `EditIconButton` | `handleUpdate(id)` | Navigates to edit form route | Pre-fills form fields for editing | Opens form drawer | [JobPostsTable/index.tsx](file:///c:/Users/WIN10/Documents/square-tuyen-dung/frontend/src/views/components/employers/JobPostsTable/index.tsx#L268) | ✅ Pass |
| **AI Candidate Recommendation** | `AIRecommendedBadge` | `onOpenAiRecommendation(job)` | Opens `AiCandidateRecommendationModal` | Fetches AI ranked candidate list | Opens modal & calls API | [JobPostsTable/index.tsx](file:///c:/Users/WIN10/Documents/square-tuyen-dung/frontend/src/views/components/employers/JobPostsTable/index.tsx#L95) | ✅ Pass |
| **Convert Application to Employee** | `EmployeeFromApplicationDialog` | `onSubmit(data)` | Dispatches create employee action | Converts candidate to HRM record | Calls `hrmService.createEmployee` | [EmployeeFromApplicationDialog.tsx](file:///c:/Users/WIN10/Documents/square-tuyen-dung/frontend/src/views/components/employers/EmployeeFromApplicationDialog.tsx#L85) | ✅ Pass |
| **Drag & Drop Kanban Candidate** | `AppliedResumeKanban` | `onDragEnd(result)` | Optimistic stage update | Updates candidate application status | Calls `jobPostActivityService.updateStatus` | [AppliedResumeKanban](file:///c:/Users/WIN10/Documents/square-tuyen-dung/frontend/src/views/components/employers/AppliedResumeKanban) | ✅ Pass |

---

## Candidate Module Actions

| Feature | UI Component | Handler | State Change | Expected Result | Current Result | Evidence File | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **Job Application Submission** | `ApplyButton` | `handleApplyJob()` | Triggers loading state & modal | Submits resume to employer | Calls `jobPostActivityService.applyJob` | [JobDetailView](file:///c:/Users/WIN10/Documents/square-tuyen-dung/frontend/src/views/jobSeekerPages/JobDetailView) | ✅ Pass |
| **Resume PDF Upload** | `ResumeUploadDropzone` | `onDrop(files)` | Uploads file & sets presigned URL | Stores PDF URL in user profile | Calls `mediaService.uploadFile` | [AttachedProfilePage](file:///c:/Users/WIN10/Documents/square-tuyen-dung/frontend/src/views/jobSeekerPages/AttachedProfilePage) | ✅ Pass |
| **Experience Add** | `ExperienceFormModal` | `handleSaveExperience(data)` | Updates local list & sends API | Adds experience record to online CV | Calls `experienceDetailService.create` | [OnlineProfilePage](file:///c:/Users/WIN10/Documents/square-tuyen-dung/frontend/src/views/jobSeekerPages/OnlineProfilePage) | ✅ Pass |
| **AI Interview Session Launch** | `StartInterviewButton` | `handleLaunchSession()` | Connects WebRTC & SSE | Starts voice AI interview room | Navigates to `/interview/[id]` | [VoiceAiInterviewRedirectPage.tsx](file:///c:/Users/WIN10/Documents/square-tuyen-dung/frontend/src/views/jobSeekerPages/VoiceAiInterviewRedirectPage.tsx) | ✅ Pass |

---

## Design System & Admin Actions

| Feature | UI Component | Handler | State Change | Expected Result | Current Result | Evidence File | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **Design System Demo Buttons** | `SampleButton` | `onClick={() => {}}` | None | Demo visual state change | No action executed (Empty Callback) | [ComponentsDesignSystemPage.tsx](file:///c:/Users/WIN10/Documents/square-tuyen-dung/frontend/src/views/adminPages/ComponentsDesignSystemPage.tsx#L176) | 🔴 Warning |
| **Empty State Card Add Button** | `EmptyCard` Button | `onClick={() => {}}` | None | Triggers creation flow | No action executed | [ComponentsDesignSystemPage.tsx](file:///c:/Users/WIN10/Documents/square-tuyen-dung/frontend/src/views/adminPages/ComponentsDesignSystemPage.tsx#L211) | 🔴 Warning |
| **Send SMS Download App** | `SmsDownloadButton` | None | None | Sends app link via SMS | No UI trigger component exists | [content/urls.py](file:///c:/Users/WIN10/Documents/square-tuyen-dung/api/apps/content/urls.py#L46) | 🔴 Missing |
