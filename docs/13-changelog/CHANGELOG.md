# Nhat Ky Thay Doi Phien Ban (Changelog)

All notable changes to the Square Tuyen Dung (InfoHR) platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]
### Added
- Comprehensive 14-section standardized documentation hierarchy under `docs/` (`00-project` through `13-changelog`, `static/`, `roadmap.md`, `naming-conventions.md`).
- Multi-portal unified design system guidelines aligned with the core Square brand (`square.vn`).
- Cleaned root repository and removed obsolete temporary certificate artifacts.

### Changed
- Refactored documentation index to serve as a high-density, role-based developer navigation portal.

---

## [1.1.0] - 2026-10-06
### Added
- Enterprise Native HRM remediation package resolving 16 financial, attendance, and concurrency defects.
- Added `dependents_count` to `Employee` model and serializer with automatic 4.4M VND PIT tax relief calculations.
- Implemented `@media print` CSS for professional A4 Payslip printing and CSV/Excel payroll ledger export.
- Two-tier leave balance concurrency locking using database pessimistic locks (`select_for_update`).
- Automated contract status transition: past contracts automatically transition to `EXPIRED` upon activation of a new contract.

### Fixed
- Fixed double deduction bug in `payroll_engine.py` where unpaid leave days were deducted twice from gross salary.
- Fixed overnight shift grouping (`is_overnight`) in attendance service where shifts spanning past midnight were erroneously split across days.
- Corrected month-boundary query bug in `AttendanceRecordViewSet.timesheet()`.

---

## [1.0.0] - 2026-10-01
### Added
- Integrated WebRTC Voice AI interview center powered by LiveKit SFU, Whisper STT, and Vieneu/Edge TTS.
- Real-time talking-head avatar lip-sync engine with WHEP stream delivery.
- Elasticsearch 7 dual-persistence integration with automated Celery re-indexing pipeline.
- S3-compatible MinIO object storage with pre-signed URLs for CVs, audio recordings, and scorecard PDFs.
- Production-grade monitoring infrastructure: Prometheus, Grafana, Loki, Promtail, Node Exporter, and Alertmanager.
- ModSecurity Web Application Firewall (WAF) reverse proxy with OWASP Core Rule Set.
- Automated daily MySQL database and MinIO media backup with Telegram alert dispatcher.
