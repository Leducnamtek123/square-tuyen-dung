# 📄 Feature Spec: [Feature Title]

> **Feature Slug**: `YYYY-MM-DD-feature-name`  
> **Status**: [DRAFT | REVIEW | APPROVED | IN PROGRESS | COMPLETE]  
> **Author**: [Author / Team]  
> **Target Release**: [vX.Y.Z]

---

## 1. 🎯 Problem Statement & Executive Summary

[Describe the user problem, pain point, or business opportunity. Why does this feature matter? What happens if we do not build it?]

---

## 2. 🚀 Goals & Non-Goals

### Goals
* [Goal 1: Measurable outcome]
* [Goal 2: Measurable outcome]

### Non-Goals (Out of Scope)
* [Non-goal 1: Explicitly what will NOT be done in this iteration]
* [Non-goal 2: Explicitly what will NOT be done in this iteration]

---

## 3. 👥 User Personas & User Stories

| Persona | Story | Value |
| :--- | :--- | :--- |
| **Job Seeker** | As a candidate, I want to [...] | So that I can [...] |
| **Employer** | As a recruiter, I want to [...] | So that I can [...] |
| **Admin** | As a system moderator, I want to [...] | So that I can [...] |

---

## 4. 📐 Functional Requirements & Acceptance Criteria

### Requirement 1: [Name]
- **Given** [pre-condition]
- **When** [user action / event]
- **Then** [expected system behavior]

---

## 5. 🗄️ Technical Architecture & Data Model

### Database Changes
```text
Table: [table_name]
- id (BigAutoField, PK)
- [field_name] ([type], [constraints])
```

### API Contracts
* **Endpoint**: `POST /api/v1/[resource]/`
* **Auth**: Required (`Bearer <JWT>`)
* **Request Payload**:
  ```json
  {
    "example_field": "string"
  }
  ```
* **Response Payload (201 Created)**:
  ```json
  {
    "id": 1,
    "status": "success"
  }
  ```

---

## 6. 🛡️ Security, Privacy & Compliance

* RBAC role required: `[SUPERADMIN | EMPLOYER | CANDIDATE]`
* Rate limiting policy: `[e.g. 60 requests / minute]`
* Personal Identifiable Information (PII) handling: `[Data encryption, S3 ACL]`
