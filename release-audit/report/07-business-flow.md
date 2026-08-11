# STEP 9: QA Customer Journey Walkthrough & Release Blockers

This document evaluates the system from an end-user customer perspective, walking through 4 core business flows.

---

## Journey 1: Candidate Search → Apply → Interview → Onboarding

```
[Candidate Views Job] ➔ [Submits Resume PDF] ➔ [Employer Reviews in Kanban] ➔ [Invites to Voice AI Interview] ➔ [Converts to Employee]
```

- **Step 1**: Candidate views `/jobs`, filters by city and career. (✅ PASS)
- **Step 2**: Candidate submits PDF resume. File uploads via S3 presigned URL. (✅ PASS)
- **Step 3**: Employer sees new candidate in `AppliedResumeTable`, moves card in Kanban. (✅ PASS)
- **Step 4**: Employer clicks "Convert to Employee", fills `EmployeeFromApplicationDialog`. (✅ PASS)
- **Journey Status**: ✅ **100% COMPLETE & PASS**

---

## Journey 2: Automated AI Voice Interview Session

```
[Candidate Receives Room Link] ➔ [Redirect Gateway] ➔ [LiveKit Audio Connect] ➔ [SSE Question Stream] ➔ [AI Evaluation Report]
```

- **Step 1**: Candidate receives interview link `/interview/123`. (✅ PASS)
- **Step 2**: Navigates to `VoiceAiInterviewRedirectPage`, checks microphone. (✅ PASS)
- **Step 3**: Candidate starts room. Audio streams via LiveKit, questions arrive via SSE (`interview_event_stream`). (✅ PASS)
- **Step 4**: **Blocker Point**: If SSE connection drops, user is stranded in room without auto-reconnect option.
- **Journey Status**: 🟡 **PARTIAL / NEEDS RECONNECT GUARD**

---

## Journey 3: Employer Job Creation & Urgent Listing

```
[Employer Dashboard] ➔ [Create Job Post Form] ➔ [Set Salary & Urgent Tag] ➔ [Publish] ➔ [Public Job Listing]
```

- **Step 1**: Employer clicks "Post Job". (✅ PASS)
- **Step 2**: Fills title, career, salary range, description, sets `isUrgent: true`. (✅ PASS)
- **Step 3**: Form submits to `POST /api/v1/job/web/private-job-posts/`. (✅ PASS)
- **Step 4**: Job appears immediately in candidate search results with red URGENT badge. (✅ PASS)
- **Journey Status**: ✅ **100% COMPLETE & PASS**
