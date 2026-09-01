# Implementation Plan: Backend Forensic Remediation & Frontend Design Taste

## Overview
Deconstruct and execute the remediation of 18 forensic audit findings (5 Critical, 6 High, 5 Medium, 2 Low) across Django backend and apply anti-slop frontend design standards (`design-taste-frontend`) on the Next.js application.

## Design Read & Dials
- **Design Read:** Modern Recruitment & AI-Powered Career Platform for Vietnamese job seekers & enterprise employers, clean editorial + high-trust B2B language, Tailwind v4 + Geist font + Radix/MUI custom tokens.
- **Dials:** `DESIGN_VARIANCE: 7`, `MOTION_INTENSITY: 5`, `VISUAL_DENSITY: 4`

## Task List

### Phase 1: Security & Validation Foundation
- [ ] Task 1.1: Phone OTP / Verification State Machine Remediation [CRIT-01]
- [ ] Task 1.2: Proctoring & ICS Session Authorization Guards [CRIT-02]
- [ ] Task 1.3: Onboarding Draft Schema & Fake String Elimination [CRIT-03]

### Checkpoint: Security & Validation
- [ ] Phone verification requires OTP token
- [ ] Proctoring endpoints reject unauthorized access
- [ ] Zero fake strings generated in onboarding

### Phase 2: Data Integrity & API Contract Restoration
- [ ] Task 2.1: Geographic Source of Truth in Candidate Import [CRIT-04]
- [ ] Task 2.2: Remove Silent Exception Masking on Catalog & Banner APIs [CRIT-05]
- [ ] Task 2.3: REST 404 Contract for Missing Resources [HIGH-03, HIGH-04]

### Checkpoint: API Reliability
- [ ] DB connectivity failures yield true 5xx error responses
- [ ] Missing resources return HTTP 404

### Phase 3: Performance & Infrastructure Cleanup
- [ ] Task 3.1: Asynchronous AI Candidate Matching [HIGH-01]
- [ ] Task 3.2: Celery Background Queue for Resume Save Notifications [HIGH-05]
- [ ] Task 3.3: Configuration Cleanup & Personal URL Removal [HIGH-02, MED-01, MED-02]

### Checkpoint: Performance & Config
- [ ] AI matching endpoint responds without blocking HTTP request loop
- [ ] Celery processes all async notifications
- [ ] Domain and social URLs 100% environment-driven

### Phase 4: Frontend UI/UX Elevation & Design Taste Polish
- [ ] Task 4.1: Home Search & Hero Visual Polish (`HomeSearch`, `homePage`)
- [ ] Task 4.2: 404 Not Found & Error Page Elevation (`NotFoundPage`)

### Checkpoint: Complete System Verification
- [ ] All automated tests pass
- [ ] Frontend builds with zero lint/typecheck errors
- [ ] Design taste pre-flight checklist verified
