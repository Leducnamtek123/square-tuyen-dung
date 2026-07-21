# AI Recruitment Automation Roadmap Design

## Goal

Build a 3-6 month AI automation roadmap for Square Tuyen Dung that helps both employers and job seekers without turning the system into an unsafe autonomous actor. AI should reduce repetitive work, create high-quality drafts, perform search/matching/scoring, and guide users through workflows. Any action that creates, updates, sends, schedules, or changes business state must be previewed and confirmed before it is committed.

This design is grounded in the current codebase:

- The floating chatbot currently sends messages to `POST /api/ai/chat/`.
- The AI chat backend already supports OpenAI-compatible function calling.
- Existing AI tools only cover candidate search and interview invitation creation.
- Existing employer job APIs already create/update job posts through `job/web/private-job-posts/`.
- Existing interview features include AI/voice interview sessions, question groups, transcript evaluation, and auto-scheduling from job templates.
- Existing resume/job analysis includes AI resume-job scoring and job salary insight.
- Existing manual candidate work introduces private employer-owned candidate records.

## Non-Goals

This roadmap does not make AI silently operate the platform on behalf of users. It does not auto-send emails, auto-change application statuses, auto-create job posts, or auto-publish candidate data without explicit user confirmation.

It also does not replace existing form-based workflows. AI becomes a copilot layer that can generate and prefill drafts, but existing pages and APIs remain the authoritative operational surface.

## Core Product Principles

1. **Preview before write**: Every mutating AI action returns a draft/preview first.
2. **Confirm before commit**: The user must explicitly approve the draft before DB write, email send, interview invite, or status update.
3. **Use existing domain APIs**: AI tools call the same service layer used by normal UI flows where possible.
4. **Permission-first**: Every tool checks authentication, role, active company, and company permissions before running.
5. **Traceable automation**: Every AI tool run is auditable, including prompt intent, extracted fields, user, company, draft, tool result, and final commit.
6. **Structured output only**: Tool inputs/outputs use JSON schemas and validators, not free-form text parsing inside business logic.
7. **Vietnamese-first UX**: Prompts, errors, confirmations, and generated content support Vietnamese well; English can remain secondary.

## High-Level Architecture

Add an AI Orchestrator layer behind `POST /api/ai/chat/`.

The orchestrator is responsible for:

- Detecting the portal context: employer, job seeker, admin, public.
- Routing user intent to the correct tool group.
- Providing the LLM only the tools allowed for the current user and context.
- Validating all tool arguments before execution.
- Creating drafts for mutating actions.
- Returning UI-friendly confirmation payloads.
- Committing drafts only after explicit user confirmation.
- Writing audit logs for every AI-assisted workflow.

The frontend chatbot remains the entry point, but it must learn to render structured AI action cards:

- Draft job post card.
- Candidate shortlist card.
- CV improvement card.
- Interview invitation draft card.
- Email draft card.
- Application status change proposal.
- Salary insight/market comparison card.

These cards should have clear commands such as `Apply to form`, `Create draft`, `Confirm`, `Edit`, `Cancel`, and `Open page`.

## Backend Components

### AI Tool Registry

Create a registry of tool definitions, each with:

- `name`
- `description`
- `portal_scope`
- `required_role`
- `required_company_permission`
- `input_schema`
- `output_schema`
- `dry_run_handler`
- `commit_handler` when applicable
- `audit_event_type`

Existing tools should be moved into this registry instead of being defined inline in `integrations.ai.views`.

Initial tool groups:

- `employer_job_tools`
- `employer_candidate_tools`
- `employer_interview_tools`
- `job_seeker_profile_tools`
- `job_seeker_search_tools`
- `communication_tools`
- `analytics_tools`

### AI Drafts

Add a durable draft model for mutating workflows.

Suggested fields:

- `id`
- `user`
- `company` nullable
- `portal`
- `action_type`
- `status`: `draft`, `confirmed`, `committed`, `cancelled`, `expired`, `failed`
- `input_summary`
- `payload`
- `validation_errors`
- `commit_result`
- `expires_at`
- timestamps

Draft examples:

- `create_job_post`
- `update_job_post`
- `create_manual_candidate`
- `create_interview_invitation`
- `send_candidate_email`
- `update_application_status`
- `create_question_group`
- `update_resume_profile`

### AI Audit Log

Add audit records for:

- User message intent classification.
- Tool availability decision.
- Tool dry-run.
- Draft creation.
- Confirmation.
- Commit success/failure.
- Rejected/cancelled action.

The audit log should never store plaintext secrets. User-provided candidate/job data can be stored as payload snapshots, but future privacy policy should define retention.

### Permission Guard

Fix the current role mismatch before extending AI tools. The app stores roles as uppercase constants such as `EMPLOYER`, `ADMIN`, and `JOB_SEEKER`; tool permission checks must use the same constants. Company-scoped tools must also verify `request.user.active_company` and company membership permissions.

Employer tool examples:

- Create/update job post: requires employer/admin and `manage_job_posts`.
- Search candidates/manual candidates: requires employer/admin and `manage_candidates`.
- Schedule interview/question bank: requires employer/admin and `manage_interviews` or `manage_question_bank`.
- Send emails/status changes: requires employer/admin and `manage_candidates`.

Job seeker tool examples:

- Update profile/resume: requires authenticated owner.
- Apply to job: requires authenticated job seeker and confirmation.
- Generate cover letter: read-only until user confirms usage.

## Employer AI Automation

### 1. Conversational Job Post Creation

User example:

> Tôi muốn tuyển Senior React Developer, lương 25-35 triệu, hybrid ở HCM, cần 3 năm kinh nghiệm.

AI extracts:

- `jobName`
- `salaryMin`
- `salaryMax`
- `typeOfWorkplace`
- `location.city`
- `experience`
- possible `career`
- possible `position`

AI asks for missing required fields:

- deadline
- job type
- quantity
- academic level
- gender requirement if still required by schema
- job description
- job requirement
- benefits
- contact person information
- full address/district if required

After enough data is available, AI creates a `create_job_post` draft. User can:

- Review generated JD.
- Edit fields in chat or open the existing job post form with the draft prefilled.
- Confirm creation.

Commit uses `JobPostService.create_job()` through the existing domain logic so company verification, auto approval, and validation remain consistent.

### 2. JD Optimization

AI can improve existing job posts or drafts:

- Rewrite job description.
- Rewrite requirements.
- Suggest benefits.
- Improve title clarity.
- Detect vague requirements.
- Detect unrealistic salary vs requirements.
- Compare salary against salary insight data.

This should be read-only until the user chooses `Apply changes to draft` or confirms an update.

### 3. Candidate Search and Shortlisting

AI supports natural-language searches:

> Tìm 10 ứng viên backend Python, 2-4 năm kinh nghiệm, lương dưới 30 triệu, ưu tiên đã từng làm Django.

Tool behavior:

- Search public resumes and employer private/manual candidates when permitted.
- Use filters first, semantic scoring second.
- Return shortlist with reasons, expected salary fit, skill fit, and next recommended action.

Shortlist results should link to candidate detail or manual candidate record. AI must not expose private candidates across companies.

### 4. Resume-Job Fit Scoring

Use and harden the current resume-job scoring service:

- Validate structured JSON output.
- Cache per resume/job pair.
- Show score breakdown: skills, experience, salary, education, location.
- Show strengths, gaps, interview questions to verify gaps.

Employers can ask:

> Chấm 20 hồ sơ mới nhất cho tin Senior React và xếp hạng giúp tôi.

AI creates a ranked view, not a destructive update. If scores are persisted, store them as analysis metadata with timestamp/model/source.

### 5. Application Pipeline Assistant

AI can propose next actions:

- Move candidate to contacted/tested/interviewed/hired/not selected.
- Draft status-change email.
- Identify stale applications.
- Summarize why candidates were rejected or advanced.

Status changes and emails require confirmation.

### 6. Interview Scheduling

AI can schedule interviews from natural language:

> Mời ứng viên Nguyễn Văn A phỏng vấn cho tin Backend Python vào 10h sáng thứ Sáu.

Tool flow:

- Resolve candidate and job post.
- Ask for missing date/time/timezone if ambiguous.
- Create interview invitation draft.
- Confirm before creating session and sending email.

This extends the existing interview invitation tool but must fix role checks, company scoping, candidate ownership/application membership, and error handling first.

### 7. Question Bank Generation

AI can generate:

- Question groups from JD.
- Technical questions.
- Behavioral questions.
- Scoring rubric.
- Follow-up questions.

Commit requires confirmation and uses existing question/question-group APIs.

### 8. AI Interview Reports

Current interview evaluation can be extended with:

- Better structured output schema.
- Hiring recommendation with confidence.
- Risk flags.
- Follow-up question suggestions.
- Comparison against job requirements.
- Email-ready summary for HR.

Reports remain advisory and should clearly say AI output needs HR review.

### 9. Manual Candidate AI Intake

When an employer uploads an outside CV:

- AI parses contact info, title, skills, education, experience, salary, notes.
- AI creates a manual candidate draft.
- AI checks possible duplicates by email/phone/name.
- User confirms before saving.

This should integrate with the current manual candidate model/API and avoid creating fake job seeker accounts.

### 10. Recruitment Analytics Copilot

AI can answer:

- Which jobs are underperforming?
- Which job has too many candidates stuck in pending?
- Which salary range is not competitive?
- Which source has better candidates?
- What should HR do today?

This tool group is read-only by default and relies on existing statistics endpoints plus salary insight.

## Job Seeker AI Automation

### 1. CV/Profile Builder

AI guides the user through profile completion:

- Parse uploaded CV.
- Identify missing fields.
- Generate better summary/title/skills.
- Create draft profile/resume updates.

Commit requires confirmation and uses existing profile/resume APIs.

### 2. CV Review

AI reviews a resume for:

- Clarity.
- ATS keywords.
- Missing achievements.
- Formatting/content gaps.
- Role alignment.
- Salary expectation consistency.

It can produce an improvement checklist and optional draft rewrite.

### 3. Job Search by Conversation

User example:

> Tìm việc frontend remote, lương trên 20 triệu, không yêu cầu tiếng Nhật, ưu tiên công ty ở HCM.

AI translates this into job search filters and returns matching jobs with reasons. It should never fabricate unavailable jobs.

### 4. Job Fit Explanation

On a job detail page, user can ask:

- Tôi có phù hợp không?
- Tôi thiếu kỹ năng gì?
- Nên ứng tuyển không?
- Lương này có hợp lý với profile của tôi không?

AI uses resume data plus job post data and returns fit score, strengths, gaps, and recommended next steps.

### 5. Cover Letter and Application Message

AI drafts:

- Cover letter.
- Short application message.
- Follow-up message after applying.
- Response to employer message.

Sending or applying requires user confirmation.

### 6. Application Tracker

AI helps track:

- Applications by status.
- Follow-up timing.
- Interview preparation reminders.
- Jobs that match saved preferences.

Notifications should be opt-in and visible in notification settings.

### 7. Mock Interview and Coaching

AI generates mock interviews from a selected job:

- Technical questions.
- Behavioral questions.
- STAR feedback.
- Voice interview practice if LiveKit flow is available.
- Score and improvement plan.

### 8. Career Coach

AI suggests:

- Skill roadmap.
- Salary expectation.
- Roles to target next.
- CV gaps for desired role.
- Learning plan.

This is advisory only and should not guarantee outcomes.

## Frontend UX Design

### Chatbot Action Cards

The chatbot needs structured cards instead of plain Markdown only.

Core card types:

- `DraftJobPostCard`
- `CandidateShortlistCard`
- `ResumeScoreCard`
- `InterviewInviteDraftCard`
- `EmailDraftCard`
- `ProfileUpdateDraftCard`
- `QuestionGroupDraftCard`
- `AnalyticsInsightCard`

Each card should support:

- Clear status: draft, needs info, ready to confirm, committed, failed.
- Field-level validation messages.
- Edit/open form actions.
- Confirm/cancel actions.
- Link to created records after commit.

### Existing Page Integrations

AI should be available contextually:

- Employer job post list/form: create or improve JD.
- Employer applied profiles: summarize, score, email, schedule interview.
- Employer candidates/manual candidates: parse CV, shortlist, compare.
- Employer interviews/question bank: generate questions and reports.
- Job seeker profile/resume page: complete profile and review CV.
- Job search/job detail: match explanation and cover letter.
- My jobs/applications: tracker and follow-up assistant.

## Roadmap

### Phase 0: AI Safety and Foundation, 2-3 Weeks

Deliverables:

- Fix AI tool role checks to use existing uppercase role constants.
- Introduce AI tool registry.
- Add tool argument validators and typed output schemas.
- Add AI draft model.
- Add AI audit log.
- Add confirmation endpoints.
- Add chatbot action-card response envelope.
- Add tests for tool permission, validation, dry-run, commit, and fallback.

Success criteria:

- Existing chatbot still works.
- Candidate search tool works only for permitted employer/admin users.
- Mutating tool cannot commit without confirmation.
- Unauthorized users never receive restricted tools.

### Phase 1: Employer Copilot, 4-6 Weeks

Deliverables:

- Conversational job post draft/create.
- JD optimization.
- Candidate search/shortlist.
- Resume-job scoring hardening.
- Interview invitation draft/create.
- Email draft for candidate communication.
- Question group generation from JD.

Success criteria:

- Employer can create a job post draft from a Vietnamese natural-language request.
- Employer can confirm the draft and create a job post through existing domain service.
- Employer can search and shortlist candidates through chat.
- All mutating actions show preview and require confirmation.

### Phase 2: Job Seeker Copilot, 4-6 Weeks

Deliverables:

- CV/profile draft update from chat.
- CV review and rewrite suggestions.
- Conversational job search.
- Job fit explanation.
- Cover letter/application message drafting.
- Application tracker assistant.
- Mock interview prep.

Success criteria:

- Job seeker can ask for jobs in natural language and receive real matching jobs.
- Job seeker can review fit against a job based on their resume.
- AI can draft profile/CV improvements without committing until user confirms.

### Phase 3: Automation and Analytics, 6-8 Weeks

Deliverables:

- Recruitment pipeline recommendations.
- Bulk candidate scoring/reporting.
- Stale application detection.
- Salary competitiveness insights.
- Auto-screening workflow improvements.
- Employer daily action summary.
- Job seeker reminder/recommendation workflows.

Success criteria:

- Employer dashboard can show AI-generated prioritized actions.
- HR can review and apply recommended workflow changes.
- Job seekers receive useful, opt-in reminders and recommendations.

## Testing and Quality Gates

### Backend Tests

Required for every tool:

- Permission denied for anonymous users.
- Permission denied for wrong role.
- Permission denied for wrong company.
- Permission denied for missing company permission.
- Valid dry-run creates draft.
- Invalid input returns validation errors.
- Commit requires existing draft and explicit confirmation.
- Commit is transactional.
- Audit log is written.
- Tool output conforms to schema.

### Frontend Tests

Required for each action card:

- Renders draft data.
- Shows validation errors.
- Confirm button disabled when draft invalid.
- Confirm sends correct payload.
- Cancel works.
- Created record link appears after success.
- Error state does not hide user data.

### Playwright Smoke Flows

Required smoke coverage:

- Employer creates AI job draft and confirms.
- Employer searches candidates through chatbot.
- Employer drafts interview invitation.
- Job seeker gets job recommendations from natural language.
- Job seeker receives CV improvement suggestions.

### AI Eval Cases

Maintain a small Vietnamese eval set:

- Create job post with enough fields.
- Create job post with missing fields.
- Reject unsafe/unauthorized action.
- Search candidates with constraints.
- Review CV against JD.
- Ambiguous interview time.
- Salary parsing in VND and "triệu".
- User attempts to make AI bypass confirmation.

## Risk Management

### Hallucinated Data

AI must not invent job IDs, candidate IDs, or company data. Tools must resolve records from the database and return explicit ambiguity when multiple records match.

### Wrong Mutating Action

All mutating actions require preview and confirmation. Drafts expire. Commit must re-check permission and validation at commit time.

### Privacy Leaks

Company-owned/manual candidates are only visible to their company. Job seeker profile updates are only available to the owner. AI logs must avoid secrets and respect retention policy.

### Prompt Injection

System prompts and tool registry rules must state that user messages cannot override permission checks, confirmation requirements, or data visibility. Backend guards enforce this regardless of model output.

### Model Failure

If LLM is unavailable or output is invalid, the system returns a useful fallback and never commits changes.

## Implementation Order

1. Fix existing AI permission bug and add tests.
2. Move current AI tool definitions into a registry.
3. Add draft/audit models.
4. Add confirmation flow.
5. Add employer job post draft/create tool.
6. Add chatbot action-card rendering.
7. Add candidate search/shortlist hardening.
8. Add resume-job scoring improvements.
9. Add job seeker CV/job matching tools.
10. Add analytics and bulk workflows.

## Acceptance Criteria

The roadmap is complete when:

- A reviewed implementation plan exists for each phase.
- Phase 0 foundation is implemented before any new mutating AI tool ships.
- Each shipped AI tool has schema validation, permission checks, audit logs, dry-run, confirmation, and tests.
- No AI workflow can write business data without explicit confirmation.
- Existing non-AI workflows keep working through their current APIs.
- Employer and job seeker chatbot behavior is covered by backend tests and at least one Playwright smoke flow per major workflow.

