# ❓ MVP Bootstrap: Clarifications, Questions & Decisions Log

> **Feature Slug**: `2026-10-02-mvp-bootstrap`  
> **Related Spec**: [spec.md](spec.md)  
> **Standard**: [06_clarification_and_question_protocol.md](file:///c:/Users/WIN10/Documents/square-tuyen-dung/docs/coding_guidelines/06_clarification_and_question_protocol.md)

---

## 1. ✅ Resolved Key Architectural Decisions

### Q-01: Database Strategy for Mixed OLTP & Candidate Search
* **Context**: Need relational ACID consistency for applications/HRM but instant text search across hundreds of thousands of candidate resumes and job postings.
* **Options Considered**:
  - *Option A*: PostgreSQL full-text search.
  - *Option B*: Dual-persistence: MySQL 8.0 (primary ACID) + Elasticsearch 7 (secondary search engine).
* **Resolution**: **Option B** selected. Documented in [ADR-0001](file:///c:/Users/WIN10/Documents/square-tuyen-dung/docs/decisions/0001-monorepo-dual-persistence.md).

### Q-02: Frontend Architecture for 5 Distinct Portals
* **Context**: We have Job Seeker, Employer, Admin, Voice AI, and HRM portals. Should they be separate repositories or unified?
* **Options Considered**:
  - *Option A*: 3-5 separate React/Vite SPAs.
  - *Option B*: Single Next.js 16 App Router with subdomain routing (`infohr.vn`, `employer.infohr.vn`, `admin.infohr.vn`, `hrm.infohr.vn`).
* **Resolution**: **Option B** selected. Documented in [ADR-0002](file:///c:/Users/WIN10/Documents/square-tuyen-dung/docs/decisions/0002-admin-dashboard-stack.md). Shared components, zero contract drift.

### Q-03: WebRTC Audio Streaming Engine
* **Context**: Candidates require conversational real-time response (< 1.5s) with automated AI interviewer.
* **Options Considered**:
  - *Option A*: Browser WebSockets transmitting raw PCM chunks.
  - *Option B*: LiveKit WebRTC SFU Server with Python LiveKit Agent SDK.
* **Resolution**: **Option B (LiveKit WebRTC)**. LiveKit handles jitter buffers, packet loss concealment, WebRTC NAT traversal (STUN/TURN), and bidirectional data channels.

### Q-04: Automated Evaluation Scorecard PDF Generation
* **Context**: Employers need downloadable PDF scorecards summarizing the AI interview.
* **Options Considered**:
  - *Option A*: Client-side `html2pdf.js` in candidate browser.
  - *Option B*: Asynchronous Celery worker running `weasyprint` / ReportLab with HTML templates, uploading PDF to MinIO S3.
* **Resolution**: **Option B (Celery Worker + Weasyprint + MinIO S3)**. Guarantees deterministic rendering, server-verified scores, and tamper-proof storage.

---

## 2. ⚠️ Operational Assumptions

1. **Assumption 1**: All audio exchanges during MVP are conducted in Vietnamese. (Multi-language interview scripts reserved for Phase 2).
2. **Assumption 2**: Candidate camera video is recorded and stored directly in MinIO S3 buckets for employer review.
3. **Assumption 3**: Authentication tokens use shared domain cookies (`.infohr.vn`) allowing cross-subdomain API authorization.
