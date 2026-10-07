# Changelog

All notable changes to the Square Tuyển Dụng (InfoHR) platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added
- Standardized engineering documentation hierarchy under `docs/` (`coding_guidelines/`, `decisions/`, `features/`, `progress/`).
- Architecture Decision Records (ADRs) 0001 (Monorepo Dual-Persistence) and 0002 (Admin Dashboard Architecture).
- Feature specification, planning, and question protocols (`_template/` and `2026-10-02-mvp-bootstrap/`).
- Business Requirements Document (`docs/BUSINESS_REQUIREMENTS.md`) and Domain Model (`docs/domain.md`).
- Cleaned root repository documentation and synchronized contributor guidelines.

## [1.0.0] - 2026-10-01
### Added
- Integrated Prometheus, Grafana, Loki, Promtail, Node Exporter, and Alertmanager monitoring stack.
- Automated MySQL database and MinIO media backup with Telegram notification and integrity check.
- Production Readiness Checklist (`@marinjursic/prc`) automated scanning integration.
- WebRTC Voice AI interview platform with real-time proctoring and evaluation pipeline.
