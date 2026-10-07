# 💼 Business Requirements Document (BRD) — InfoHR

> **Ecosystem**: Square Tuyển Dụng (Commercial Brand: InfoHR)  
> **Version**: 2.0 (Enterprise Recruitment & Voice AI Platform)  
> **Status**: APPROVED  
> **Target Market**: Vietnam & Southeast Asia

---

## 1. 🌟 Executive Summary & Value Proposition

Traditional recruitment workflows in Vietnam rely heavily on manual CV screening and asynchronous text/video assessments. This results in lengthy hiring cycles (averaging 25–45 days), high interviewer fatigue, and inconsistent evaluation standards.

**Square Tuyển Dụng (InfoHR)** is a smart recruitment and real-time WebRTC Voice AI platform that:
1. **Automates Initial Screening**: An AI interviewer conducts live, conversational spoken interviews with candidates in Vietnamese.
2. **Standardizes Candidate Evaluation**: Produces unbiased, objective dimension scorecards (Technical, Communication, Aptitude, English/Vietnamese fluency) in PDF.
3. **Bridges Recruitment to HRM**: Accepted candidates seamlessly transition from the applicant pool into the internal HRM employee directory and payroll ledger.

---

## 2. 🌐 The 5 Ecosystem Portals

| Portal | URL / Host | Target Users | Primary Business Capabilities |
| :--- | :--- | :--- | :--- |
| **Job Seeker Portal** | `https://infohr.vn` | Candidates, Job Seekers | AI-powered job search, interactive CV builder, 1-click application, candidate practice room. |
| **Employer Portal** | `https://employer.infohr.vn` | Recruiters, HR Managers | Job posting, candidate Kanban pipeline, AI interview script customizer, candidate scorecard review. |
| **Voice AI Interview Center** | `https://aila.infohr.vn` | Interview Candidates, AI Agent | Real-time WebRTC audio room, live conversational agent, video recording, telemetry monitoring. |
| **Admin Portal** | `https://admin.infohr.vn` | Platform Moderators, Ops | Employer business license approval, job post moderation, subscription billing control, audit logs. |
| **Internal HRM Portal** | `https://hrm.infohr.vn` | Enterprise HR Staff, Management | Employee profiles, time attendance, leave requests, basic payroll ledger. |

---

## 3. 👥 Key User Personas & Core Journeys

### 3.1. Job Seeker (Ứng Viên)
- **Search & Discovery**: Query jobs by title, location, salary range, and experience level with typo-tolerant search powered by Elasticsearch.
- **Application**: Upload PDF resume or generate online CV; submit application with one click.
- **AI Interview Participation**: Receive private room invitation link (`aila.infohr.vn/room/<token>`), test microphone/camera, and interact with the AI interviewer via voice.

### 3.2. Employer (Nhà Tuyển Dụng)
- **Job Creation**: Post open positions with required competencies, salary ranges, and benefits.
- **AI Interview Customization**: Choose pre-built interview scripts or author bespoke interview questions and evaluation criteria.
- **Candidate Evaluation**: Review candidate AI interview recordings, transcripts, and downloadable PDF reports.

### 3.3. System Administrator (Quản Trị Viên)
- **Verification**: Review company legal registrations before permitting public job postings.
- **Content Moderation**: Flag or suspend fraudulent job ads or spam applications.
- **System Monitoring**: Track concurrent LiveKit sessions, storage capacity, and error rates.

---

## 4. 💰 Business & Monetization Model

1. **Freemium Job Postings**: Employers get 3 free active job posts per month.
2. **AI Interview Credits**: Pay-per-interview credits or bundled monthly subscriptions for automated Voice AI candidate screenings.
3. **Enterprise HRM Tier**: Recurring monthly subscription for integrated employee onboarding, time attendance, and payroll features.

---

## 5. ⚡ Non-Functional Requirements (SLA)

| Metric | Target SLA | Strategy |
| :--- | :--- | :--- |
| **WebRTC Audio Latency** | < 1,500 ms (Round-trip) | Direct LiveKit SFU connection + optimized streaming TTS pipeline. |
| **API Response Time** | < 200 ms (p95) | Redis caching + database query optimization with `select_related`. |
| **System Uptime** | 99.9% availability | Redundant Docker containers, healthchecks, and Nginx reverse proxy failover. |
| **Media Persistence** | 99.999% durability | MinIO S3 storage with automated daily snapshots. |
