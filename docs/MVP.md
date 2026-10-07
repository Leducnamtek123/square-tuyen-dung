# 🎯 MVP Specification & Release Scope (v1.0.0)

> **Ecosystem**: Square Tuyển Dụng (InfoHR)  
> **Milestone**: Version 1.0.0 — Minimum Viable Product  
> **Status**: ACTIVE EXECUTION

---

## 1. 📌 MVP Objective

The primary objective of the InfoHR MVP is to validate the automated Voice AI screening hypothesis:

> **Hypothesis**: Replacing preliminary manual phone screenings with an automated, real-time Vietnamese Voice AI interview reduces recruiter time-to-evaluate by 70% while improving candidate throughput and candidate satisfaction.

---

## 2. 🔍 Scope Boundary (In-Scope vs. Out-of-Scope)

| Feature Area | In-Scope for MVP (v1.0.0) | Out-of-Scope (Deferred to v2.0) |
| :--- | :--- | :--- |
| **Job Seeker Portal** | • Account creation & JWT login<br>• PDF resume upload to MinIO S3<br>• Elasticsearch job search & filtering<br>• 1-click application submission | • Social media profile import<br>• Salary benchmarking calculator<br>• In-app chat between candidates and recruiters |
| **Employer Portal** | • Company registration & profile<br>• Job post creation & publishing<br>• Application review Kanban board<br>• Select AI interview script templates | • Multi-seat team permissions & role delegations<br>• Integration with external ATS systems (Greenhouse, Lever) |
| **Voice AI Center** | • LiveKit WebRTC audio room<br>• Real-time Vietnamese conversation (<1.5s latency)<br>• Automated 4-dimension scoring<br>• Downloadable PDF scorecard | • Multi-language interviews (English, Japanese)<br>• Complex facial micro-expression sentiment analysis |
| **Admin Portal** | • Employer business license review queue<br>• Job post approval and suspension<br>• User account locking & audit logs | • Granular custom permission builder<br>• Automated bank reconciliation |
| **Internal HRM** | • Onboard hired candidate to Employee profile<br>• Basic time attendance check-in/out | • Advanced tax calculation rules<br>• Shift scheduling & leave management |

---

## 3. ⚙️ Local Development & Quick Start Matrix

### Port & Service Mapping
| Service | Container Name | Local Port | Internal Port | URL |
| :--- | :--- | :--- | :--- | :--- |
| **Frontend Web** | `tuyendung-studio-frontend` | `3000` | `3000` | `http://localhost:3000` |
| **Backend API** | `tuyendung-studio-backend` | `8000` | `8000` | `http://localhost:8000/api/` |
| **LiveKit SFU** | `tuyendung-studio-livekit` | `7880` | `7880` | `http://localhost:7880` |
| **MinIO Console** | `tuyendung-studio-minio-console` | `9001` | `9001` | `http://localhost:9001` |
| **Grafana** | `tuyendung-studio-grafana` | `3001` | `3000` | `http://localhost:3001` |

### Quick Start Commands
```bash
# 1. Start all infrastructure and services in background
docker compose up -d

# 2. Run initial database migration
docker compose exec backend python manage.py migrate

# 3. Create initial superuser (optional)
docker compose exec backend python manage.py createsuperuser

# 4. View real-time logs
docker compose logs -f backend
```

---

## 4. 🏁 MVP Launch Readiness Checklist

- [ ] All 5 portals accessible via local Nginx gateway or localhost ports.
- [ ] Candidate can complete a full 5-question voice interview with the AI agent.
- [ ] Evaluation scorecard PDF is generated and visible in the employer dashboard.
- [ ] Database backups and migrations execute reliably.
- [ ] Zero linting errors or type violations across frontend and backend.
