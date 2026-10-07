# ADR-0001: Monorepo Architecture with Dual-Persistence Data Layer

> **Status**: ACCEPTED  
> **Date**: 2026-10-02  
> **Deciders**: Architecture Team, Backend Lead, DevOps  
> **Consulted**: Voice AI Team, Frontend Lead  
> **Informed**: All Engineering Staff

---

## 1. 📋 Context & Problem Statement

InfoHR (Square Tuyển Dụng) combines traditional job recruitment, automated enterprise HRM (payroll, time attendance), and real-time Voice AI WebRTC candidate interviews. This presents divergent data workload profiles:

1. **Transactional Integrity (OLTP)**: Users, applications, companies, subscription tiers, payroll ledger, and attendance records require strict ACID transactions, foreign key constraints, and zero tolerance for balance discrepancies.
2. **High-Dimensional Candidate & Job Search**: Matching candidate resumes (CV parsing, skills, experience, location) against millions of job postings requires high-throughput tokenized full-text search and fuzzy filtering.
3. **Large Binary Media Storage**: Candidate CVs (PDF), real-time WebRTC audio/video recordings, and generated evaluation scorecards require scalable S3-compatible blob storage.
4. **Fast Synchronization & Cache**: Voice interview state, LiveKit room tokens, and background task queues require sub-millisecond retrieval.

We need an overarching architecture that avoids repository fragmentation while providing optimized persistence for each workload.

---

## 2. 🎯 Decision Drivers

* **Cross-Service Contract Velocity**: Rapid iteration between frontend types, backend serializers, and Voice AI agent schemas.
* **ACID Transactions**: Reliable financial and payroll calculations.
* **Sub-100ms Search Queries**: Instant candidate/job filtering with Vietnamese diacritic tolerance.
* **Storage Cost Efficiency**: Self-hostable S3-compatible storage with automated lifecycle policies.

---

## 3. 🔍 Considered Options

* **Option 1: Monorepo + Dual-Persistence (MySQL 8 + Elasticsearch 7 + MinIO S3 + Redis 7)**
* **Option 2: Polyrepo with PostgreSQL-only (Postgres + pgvector/tsvector + AWS S3)**
* **Option 3: Microservices with Distributed Document Database (MongoDB + S3)**

---

## 4. ⚖️ Decision Outcome

**Chosen Option**: **Option 1 (Monorepo + Dual-Persistence)**.

### Rationale:
1. **Single Source of Truth Monorepo**: All subsystems (`frontend/`, `api/`, `voice-ai/`, `nginx-gateway/`) reside in a unified git repository, allowing atomic PRs that synchronize API serializers with TypeScript interfaces and Voice AI event schemas.
2. **Dual-Persistence Separation**:
   - **MySQL 8.0**: Authoritative primary database for all relational transactional models (Django ORM).
   - **Elasticsearch 7.17**: Secondary inverted-index engine populated asynchronously via Celery signals for ultra-fast job and candidate resume search.
   - **MinIO S3**: Self-hosted S3 object storage for CV files, audio chunks, and video recordings, accessible via pre-signed URLs.
   - **Redis 7**: High-speed memory store for caching, session management, and Celery broker.

---

## 5. 📊 Pros & Cons of the Options

### Option 1: Monorepo + Dual-Persistence (Chosen)
* **Good**: Synchronized releases; zero contract drift between frontend and backend.
* **Good**: MySQL delivers rock-solid ACID guarantees for HRM and billing.
* **Good**: Elasticsearch handles heavy search load without degrading primary database IOPS.
* **Good**: MinIO keeps media self-contained and S3-API compatible.
* **Bad**: Requires Celery synchronization pipeline between MySQL and Elasticsearch.

### Option 2: Polyrepo + PostgreSQL-only
* **Good**: Single database engine to maintain.
* **Bad**: Full-text search and vector scaling inside PostgreSQL can bottleneck during heavy transactional load.
* **Bad**: Polyrepo creates contract drift and high coordination overhead between teams.

### Option 3: MongoDB Microservices
* **Good**: Flexible schema for varied candidate profile formats.
* **Bad**: Weak relational enforcement for complex HRM payroll and role hierarchies.

---

## 6. 🛡️ Compliance & Validation Plan

* Sync scripts in `api/apps/jobs/tasks.py` guarantee that every `JobPost` and `CandidateProfile` update re-indexes into Elasticsearch within 5 seconds.
* Docker Compose healthchecks ensure MySQL, Redis, Elasticsearch, and MinIO are healthy before application servers boot.
