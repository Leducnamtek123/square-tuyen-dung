# Candidate Resume Domain Lifecycle & Architecture Map

## 1. Resume Lifecycle State Machine
```text
CREATE (Online CV / Upload PDF/DOCX)
  │
  ├── In-Memory Form / Template Picker (/online-profile/[slug] or Modal)
  │     ├── Select layout template (TemplateClassic, TemplateModern, TemplateExecutive)
  │     └── Fill candidate details, experience, skills, education
  │
  ├── SAVE / DRAFT MUTATION (POST/PATCH /api/v1/resumes/)
  │     ├── Saves JSON schema & metadata to resume-service
  │     └── Returns unique resume slug
  │
  ├── VIEW & EDIT (/online-profile/[slug] & /(candidate)/profile)
  │     ├── Real-time section navigation with usePreventUnsavedChanges
  │     └── Primary active resume syncs bio & skills to candidate dashboard
  │
  ├── ATTACH / APPLY (Job Application Gateway)
  │     ├── Select active website resume or attached PDF
  │     └── Submits application payload to /api/v1/job-post-activities/
  │
  └── DELETE / ARCHIVE
        └── Soft delete or unpublish from employer discovery
```

---

## 2. Profile ↔ Resume Synchronization Model
- **Canonical Identity**: The `User` and `JobSeekerProfile` entities own primary candidate demographic data (name, phone, email, date of birth, gender, marital status, location).
- **Resume Entity**: The `Resume` entity represents a specialized CV artifact (supporting both `WEBSITE` generated CVs and `ATTACHED` file uploads). It contains document-level fields (title, summary, skillsSummary, advancedSkills, academicLevel, workExperience).
- **Cross-Sync Behavior**: When editing the candidate profile in `ProfilePage`, mutations update `jobSeekerProfileService` and propagate `title` & `bio` updates to the active primary resume (`resumeService.updateResume`) to prevent model desynchronization.