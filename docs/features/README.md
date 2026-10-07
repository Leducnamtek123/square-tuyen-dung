# 🚀 Feature Specifications & Implementation Directory

> **Ecosystem**: Square Tuyển Dụng (InfoHR)  
> **Location**: `docs/features/`  
> **Standard**: Spec-Driven Feature Development

---

## 1. 📌 Overview

This directory houses all feature specifications, design decision logs, and implementation plans for InfoHR. Every significant feature starts here with a `spec.md`, `questions.md`, and `plan.md` before code is committed to a feature branch.

---

## 2. 📁 Structure & Conventions

```text
docs/features/
├── _template/                         # Blueprint to copy when starting a new feature
│   ├── spec.md                        # Functional specs, acceptance criteria, API contracts
│   ├── questions.md                   # Ambiguity resolution, open questions, assumptions
│   └── plan.md                        # Phased task breakdown and DoD checklist
├── 2026-10-02-mvp-bootstrap/           # Foundation MVP bootstrap feature package
│   ├── spec.md
│   ├── questions.md
│   └── plan.md
├── EXAMPLE_WORKFLOW.md                # End-to-end lifecycle guide from spec to release
└── README.md                          # This index file
```

---

## 3. 🏷️ Naming Rules

Feature folders must follow the naming pattern:
```text
YYYY-MM-DD-<kebab-case-feature-name>
```
* Example: `2026-10-02-mvp-bootstrap`
* Example: `2026-10-15-webrtc-telemetry-panel`

---

## 4. 📚 Feature Registry

| Feature Folder | Description | Target Subsystems | Status |
| :--- | :--- | :--- | :--- |
| [2026-10-02-mvp-bootstrap](file:///c:/Users/WIN10/Documents/square-tuyen-dung/docs/features/2026-10-02-mvp-bootstrap/spec.md) | Core ecosystem bootstrap: Job Seeker, Employer, Voice AI, Admin | `all` | **IN PROGRESS** |

---

## 5. 🛠️ Getting Started

To propose and begin building a new feature:
1. Review [EXAMPLE_WORKFLOW.md](file:///c:/Users/WIN10/Documents/square-tuyen-dung/docs/features/EXAMPLE_WORKFLOW.md).
2. Copy `_template/` into a new date-stamped folder.
3. Complete `spec.md` and log ambiguities in `questions.md`.
