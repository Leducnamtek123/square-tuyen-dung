# Employer Manual Candidate Design

## Goal

Allow employers to add candidate profiles manually from the employer candidate page without creating fake job seeker accounts or publishing those profiles into the public candidate pool.

## Product Decision

Manual profiles are private company data. They belong to the employer's active company, are visible only to users with the company's `manage_candidates` permission, and stay separate from public `Resume` records that job seekers create and activate.

## User Flow

On `employer/candidates`, HR sees an `Add candidate` button near the candidate results header. The button opens a form for candidate name, email, phone, target position/title, classification fields, salary range, notes, skills summary, and optional CV upload. After submit, the manual profile appears in a company-owned manual candidate list on the same page.

## Backend Design

Create an `EmployerCandidateProfile` model under the profiles app. It stores the active company, creator, candidate contact details, resume-like fields, optional uploaded CV file, and timestamps. Add a `web/employer-candidates/` API with list, create, retrieve, update, and delete behavior guarded by `CanManageCandidates`.

## Frontend Design

Add `employerCandidateService` for API calls, React Query hooks for list/create/delete, and a compact `ManualCandidateCard` component rendered above public candidate search results. Reuse the existing config selects and common form controls.

## Non-Goals

Manual profiles will not be searchable by other companies, will not appear in public `ResumeViewSet`, and will not reuse the existing `employer/candidates/:slug` resume detail page in this iteration. Interview scheduling and AI analysis can be added later once manual candidates have a shared domain contract with application records.

## Testing

Backend tests cover employer create/list/delete, company scoping, and job seeker denial. Frontend verification covers typecheck and rendered form/list interaction where local app/API state allows.
