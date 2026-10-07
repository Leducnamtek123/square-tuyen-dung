# 🤝 Contributing to Square Tuyển Dụng (InfoHR)

Thank you for investing your time and effort in contributing to the **InfoHR** platform! To maintain code health, security, and developer velocity across our monorepo, all contributors must follow the established guidelines below.

---

## 🧭 Engineering Guidelines & Standards

Before writing code or opening a Pull Request, please familiarize yourself with our core standards:

1. **Git Branching Strategy**: Follow [docs/coding_guidelines/01_git_branching.md](file:///c:/Users/WIN10/Documents/square-tuyen-dung/docs/coding_guidelines/01_git_branching.md).
   - Base all feature branches off `dev`: `git checkout -b feature/<feature-name> dev`.
   - Never push directly to `main` or `dev`.
2. **Commit Messages**: Follow [docs/coding_guidelines/02_git_commit_messages.md](file:///c:/Users/WIN10/Documents/square-tuyen-dung/docs/coding_guidelines/02_git_commit_messages.md) (Conventional Commits 1.0.0).
3. **Backend Standards (Django & DRF)**: Follow [docs/coding_guidelines/03_backend_guidelines.md](file:///c:/Users/WIN10/Documents/square-tuyen-dung/docs/coding_guidelines/03_backend_guidelines.md).
4. **Frontend Standards (Next.js 16 & React 19)**: Follow [docs/coding_guidelines/04_frontend_guidelines.md](file:///c:/Users/WIN10/Documents/square-tuyen-dung/docs/coding_guidelines/04_frontend_guidelines.md).
5. **Definition of Done (DoD)**: Review the verification checklist in [docs/coding_guidelines/05_definition_of_done.md](file:///c:/Users/WIN10/Documents/square-tuyen-dung/docs/coding_guidelines/05_definition_of_done.md).
6. **Handling Ambiguities**: When requirements are unclear, follow [docs/coding_guidelines/06_clarification_and_question_protocol.md](file:///c:/Users/WIN10/Documents/square-tuyen-dung/docs/coding_guidelines/06_clarification_and_question_protocol.md).
7. **Admin Portal Standards**: Follow [docs/coding_guidelines/07_admin_guidelines.md](file:///c:/Users/WIN10/Documents/square-tuyen-dung/docs/coding_guidelines/07_admin_guidelines.md).

---

## 🚀 Proposing a New Feature

All non-trivial features must be planned in `docs/features/`:
1. Review the workflow in [docs/features/EXAMPLE_WORKFLOW.md](file:///c:/Users/WIN10/Documents/square-tuyen-dung/docs/features/EXAMPLE_WORKFLOW.md).
2. Copy `docs/features/_template/` to `docs/features/YYYY-MM-DD-<feature-name>/`.
3. Fill out `spec.md`, `questions.md`, and `plan.md`.

---

## 🏛️ Proposing Architectural Changes

If your proposal changes the tech stack, data storage model, or public API boundary, write an Architectural Decision Record (ADR):
- Copy [docs/decisions/template.md](file:///c:/Users/WIN10/Documents/square-tuyen-dung/docs/decisions/template.md).
- Follow the guidelines in [docs/decisions/README.md](file:///c:/Users/WIN10/Documents/square-tuyen-dung/docs/decisions/README.md).

---

## 🛡️ Pre-PR Verification Commands

Before submitting a Pull Request, run the local verification suite:

```bash
# Frontend checks
cd frontend
pnpm run lint
pnpm run build

# Backend checks
cd ../api
ruff check .
ruff format --check .
pytest
```

---

## 🔒 Security Notice

**Never commit sensitive credentials, API tokens, `.env` files, or private keys to git.** If you discover a security vulnerability, please refer to our [SECURITY.md](file:///c:/Users/WIN10/Documents/square-tuyen-dung/SECURITY.md).
