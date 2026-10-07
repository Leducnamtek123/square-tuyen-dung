# 🏛️ Architecture Decision Records (ADRs)

> **Ecosystem**: Square Tuyển Dụng (InfoHR)  
> **Location**: `docs/decisions/`  
> **Format**: Lightweight MADR Standard

---

## 1. 📌 Overview

Architecture Decision Records (ADRs) capture significant architectural choices, technical trade-offs, and historical context across the InfoHR monorepo. They document the *why* behind critical engineering decisions to prevent endless re-debating and assist future engineers and AI assistants.

---

## 2. 📚 Registered Decisions

| ADR | Title | Status | Date | Decision Summary |
| :--- | :--- | :--- | :--- | :--- |
| [0001-monorepo-dual-persistence.md](file:///c:/Users/WIN10/Documents/square-tuyen-dung/docs/decisions/0001-monorepo-dual-persistence.md) | Monorepo Architecture with Dual-Persistence Data Layer | **ACCEPTED** | 2026-10-02 | Adopt monorepo with MySQL 8 (OLTP) + Elasticsearch 7 (Search) + MinIO S3 (Media) + Redis 7 (Cache). |
| [0002-admin-dashboard-stack.md](file:///c:/Users/WIN10/Documents/square-tuyen-dung/docs/decisions/0002-admin-dashboard-stack.md) | Admin Dashboard Architecture & Tech Stack | **ACCEPTED** | 2026-10-02 | Integrate Admin portal into Next.js 16 App Router using subdomain rewriting and shared Shadcn/Tailwind v4 components. |

---

## 3. 🔄 ADR Lifecycle

```text
[PROPOSED] ──► [ACCEPTED] ──► [SUPERSEDED by ADR-YYYY]
                    │
                    └──► [DEPRECATED]
```

- **PROPOSED**: Under active review by architecture leads and team members.
- **ACCEPTED**: Approved and binding for all current and future implementations.
- **SUPERSEDED**: Replaced by a newer decision (the old ADR remains as historical record).
- **DEPRECATED**: The decision is no longer relevant or enforced.

---

## 4. ✍️ How to Propose a New ADR

1. Copy the template from [template.md](file:///c:/Users/WIN10/Documents/square-tuyen-dung/docs/decisions/template.md).
2. Number it sequentially (e.g. `0003-<short-slug>.md`).
3. Fill in context, considered options, decision drivers, and trade-offs.
4. Open a Pull Request for architectural review with status `PROPOSED`.
