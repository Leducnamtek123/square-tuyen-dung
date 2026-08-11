# STEP 5: Missing Frontend Integrations & Unused Endpoints

This document reports all backend API routes, views, or endpoints that are exposed in Django but never invoked by any frontend component or service.

---

## Exposed Unused Backend Endpoints

| Module | DRF Route | Controller / View | Recommendation |
| :--- | :--- | :--- | :--- |
| `content` | `POST /api/v1/content/send-noti-demo/` | `views.send_notification_demo` | 🔴 Remove demo endpoint before production release. |
| `content` | `POST /api/v1/content/web/sms-download-app/` | `views.send_sms_download_app` | 🟡 Build frontend download form widget or mark endpoint deprecated. |
| `interviews` | `GET /api/v1/interview/compat/voice-profiles/:id` | `interviews_compat_views.interview_voice_profile` | 🔵 Legacy voice profile compat route; remove once legacy voice agents migrate. |
| `config` | `ANY /api/*` | `path("api/", ...)` legacy wrapper | 🟡 Remove backward compatibility `/api/` fallback block in `config/urls.py`. |
