
import pytest
from django.contrib.auth.hashers import check_password
from django.core.exceptions import ImproperlyConfigured
from django.core.management import call_command
from django.utils import timezone
from oauth2_provider.models import Application
from rest_framework.test import APIClient

from apps.files.models import File
from common.models import AuditLog, Career
from shared.configs.env_validation import validate_required_settings


@pytest.mark.django_db
def test_admin_career_create_writes_audit_log(admin_user):
    client = APIClient()
    client.force_authenticate(user=admin_user)

    response = client.post(
        "/api/v1/common/admin/careers/",
        {"name": "Audit Career", "appIconName": "audit", "isHot": True},
        format="json",
    )

    assert response.status_code in (200, 201)
    career = Career.objects.get(name="Audit Career")
    log = AuditLog.objects.filter(
        actor=admin_user,
        action=AuditLog.ACTION_CREATE,
        resource_type="common.Career",
        resource_id=str(career.id),
    ).first()
    assert log is not None
    assert log.request_path.endswith("/api/v1/common/admin/careers/")


@pytest.mark.django_db
def test_audit_log_endpoint_is_admin_read_only(admin_user):
    AuditLog.objects.create(
        actor=admin_user,
        actor_email=admin_user.email,
        action=AuditLog.ACTION_UPDATE,
        resource_type="config.SystemSettings",
    )
    client = APIClient()
    client.force_authenticate(user=admin_user)

    response = client.get("/api/v1/common/admin/audit-logs/")

    assert response.status_code == 200
    payload = response.json()
    results = payload.get("data", payload).get("results", payload.get("results", []))
    assert any(item["action"] == AuditLog.ACTION_UPDATE for item in results)


@pytest.mark.django_db
def test_audit_log_endpoint_filters_by_actor_resource_and_date(admin_user):
    matching = AuditLog.objects.create(
        actor=admin_user,
        actor_email=admin_user.email,
        action=AuditLog.ACTION_UPDATE,
        resource_type="accounts.User",
        resource_id="42",
    )
    AuditLog.objects.create(
        actor=admin_user,
        actor_email="other@example.com",
        action=AuditLog.ACTION_UPDATE,
        resource_type="jobs.JobPost",
        resource_id="99",
    )
    client = APIClient()
    client.force_authenticate(user=admin_user)

    response = client.get(
        "/api/v1/common/admin/audit-logs/",
        {
            "actorEmail": admin_user.email,
            "resourceType": "accounts",
            "resourceId": "42",
            "dateFrom": timezone.localtime(matching.create_at).date().isoformat(),
            "dateTo": timezone.localtime(matching.create_at).date().isoformat(),
        },
    )

    assert response.status_code == 200
    payload = response.json()
    results = payload.get("data", payload).get("results", payload.get("results", []))
    assert [item["id"] for item in results] == [matching.id]


@pytest.mark.django_db
def test_audit_log_export_returns_csv_and_records_export(admin_user):
    AuditLog.objects.create(
        actor=admin_user,
        actor_email=admin_user.email,
        action=AuditLog.ACTION_UPDATE,
        resource_type="accounts.User",
        resource_id="42",
    )
    client = APIClient()
    client.force_authenticate(user=admin_user)

    response = client.get(
        "/api/v1/common/admin/audit-logs/export/",
        {"resourceType": "accounts.User"},
    )

    assert response.status_code == 200
    assert response["Content-Type"].startswith("text/csv")
    content = response.content.decode("utf-8-sig")
    assert "actor_email" in content
    assert admin_user.email in content
    assert AuditLog.objects.filter(actor=admin_user, action=AuditLog.ACTION_EXPORT).exists()


@pytest.mark.django_db
def test_presign_rejects_anonymous_private_cv_path():
    response = APIClient().get("/api/v1/common/presign/", {"publicId": "cv/private.pdf"})

    assert response.status_code == 403


@pytest.mark.django_db
def test_presign_allows_public_asset_path(monkeypatch):
    class FakePresignClient:
        def presigned_get_object(self, bucket, object_path, expires):
            return f"https://cdn.example.test/{bucket}/{object_path}?X-Amz-Signature=test"

    monkeypatch.setattr(
        "common.views.CloudinaryService._get_presign_client",
        lambda: FakePresignClient(),
    )

    response = APIClient().get("/api/v1/common/presign/", {"publicId": "logo/company.webp"})

    assert response.status_code == 200
    assert response.json()["data"]["url"].endswith("logo/company.webp?X-Amz-Signature=test")


@pytest.mark.django_db
def test_presign_allows_resume_owner_for_cv_file(monkeypatch, job_seeker_user, resume):
    class FakePresignClient:
        def presigned_get_object(self, bucket, object_path, expires):
            return f"https://cdn.example.test/{bucket}/{object_path}?X-Amz-Signature=test"

    cv_file = File.objects.create(
        public_id="cv/owner.pdf",
        format="pdf",
        resource_type="raw",
        file_type=File.CV_TYPE,
        uploaded_at=timezone.now(),
    )
    resume.file = cv_file
    resume.save(update_fields=["file", "update_at"])

    monkeypatch.setattr(
        "common.views.CloudinaryService._get_presign_client",
        lambda: FakePresignClient(),
    )
    client = APIClient()
    client.force_authenticate(user=job_seeker_user)

    response = client.get("/api/v1/common/presign/", {"publicId": "cv/owner.pdf"})

    assert response.status_code == 200
    assert "X-Amz-Signature=test" in response.json()["data"]["url"]


@pytest.mark.django_db
def test_presign_allows_employer_for_submitted_inactive_cv(
    monkeypatch,
    employer_user,
    job_seeker_user,
    job_post,
    resume,
):
    from apps.jobs.models import JobPostActivity

    class FakePresignClient:
        def presigned_get_object(self, bucket, object_path, expires):
            return f"https://cdn.example.test/{bucket}/{object_path}?X-Amz-Signature=test"

    cv_file = File.objects.create(
        public_id="cv/submitted-inactive.pdf",
        format="pdf",
        resource_type="raw",
        file_type=File.CV_TYPE,
        uploaded_at=timezone.now(),
    )
    resume.file = cv_file
    resume.is_active = False
    resume.save(update_fields=["file", "is_active", "update_at"])
    JobPostActivity.objects.create(
        job_post=job_post,
        user=job_seeker_user,
        resume=resume,
        is_deleted=False,
    )

    monkeypatch.setattr(
        "common.views.CloudinaryService._get_presign_client",
        lambda: FakePresignClient(),
    )
    client = APIClient()
    client.force_authenticate(user=employer_user)

    response = client.get("/api/v1/common/presign/", {"publicId": "cv/submitted-inactive.pdf"})

    assert response.status_code == 200
    assert "X-Amz-Signature=test" in response.json()["data"]["url"]


def test_validate_env_rejects_production_placeholders():
    with pytest.raises(ImproperlyConfigured, match="Invalid production secret settings"):
        validate_required_settings(
            {
                "APP_ENV": "production",
                "DEBUG": False,
                "SECRET_KEY": "django-insecure-square-tuyen-dung-local-only",
                "DATABASES": {
                    "default": {
                        "ENGINE": "django.db.backends.mysql",
                        "NAME": "square_db",
                        "USER": "root",
                        "PASSWORD": "CHANGE_ME",
                        "HOST": "db",
                        "PORT": "3306",
                    }
                },
                "EMAIL_HOST": "smtp.example.com",
                "EMAIL_PORT": "587",
                "EMAIL_HOST_USER": "ops@example.com",
                "EMAIL_HOST_PASSWORD": "CHANGE_ME",
                "LIVEKIT_PUBLIC_URL": "wss://example.com/livekit",
                "MINIO_ACCESS_KEY": "CHANGE_ME",
                "MINIO_SECRET_KEY": "CHANGE_ME",
                "CLIENT_SECRET": "CHANGE_ME",
                "LIVEKIT_API_KEY": "devkey",
                "LIVEKIT_API_SECRET": "secret",
                "INTERVIEW_AGENT_AUTH_REQUIRED": True,
                "INTERVIEW_AGENT_SHARED_SECRET": "short",
            }
        )


def test_validate_env_requires_agent_secret_in_production(monkeypatch):
    monkeypatch.delenv("INTERVIEW_AGENT_SHARED_SECRET", raising=False)

    with pytest.raises(ImproperlyConfigured, match="INTERVIEW_AGENT_SHARED_SECRET"):
        validate_required_settings(
            {
                "APP_ENV": "production",
                "DEBUG": False,
                "SECRET_KEY": "x" * 64,
                "DATABASES": {
                    "default": {
                        "ENGINE": "django.db.backends.mysql",
                        "NAME": "square_db",
                        "USER": "app_user",
                        "PASSWORD": "db-" + ("x" * 40),
                        "HOST": "db",
                        "PORT": "3306",
                    }
                },
                "EMAIL_HOST": "smtp.example.com",
                "EMAIL_PORT": "587",
                "EMAIL_HOST_USER": "ops@example.com",
                "EMAIL_HOST_PASSWORD": "mail-" + ("x" * 40),
                "LIVEKIT_PUBLIC_URL": "wss://example.com/livekit",
                "MINIO_ACCESS_KEY": "minio-access",
                "MINIO_SECRET_KEY": "minio-" + ("x" * 40),
                "CLIENT_SECRET": "client-" + ("x" * 40),
                "LIVEKIT_API_KEY": "lk-api-key",
                "LIVEKIT_API_SECRET": "lk-" + ("x" * 40),
                "INTERVIEW_AGENT_AUTH_REQUIRED": False,
                "INTERVIEW_AGENT_SHARED_SECRET": "",
                "FRAPPE_HR_ADMIN_PASSWORD": "frappe-admin-" + ("x" * 40),
                "FRAPPE_HR_DB_ROOT_PASSWORD": "frappe-root-" + ("x" * 40),
            }
        )


def test_validate_env_requires_agent_auth_enabled_in_production():
    with pytest.raises(ImproperlyConfigured, match="INTERVIEW_AGENT_AUTH_REQUIRED"):
        validate_required_settings(
            {
                "APP_ENV": "production",
                "DEBUG": False,
                "SECRET_KEY": "x" * 64,
                "DATABASES": {
                    "default": {
                        "ENGINE": "django.db.backends.mysql",
                        "NAME": "square_db",
                        "USER": "app_user",
                        "PASSWORD": "db-" + ("x" * 40),
                        "HOST": "db",
                        "PORT": "3306",
                    }
                },
                "EMAIL_HOST": "smtp.example.com",
                "EMAIL_PORT": "587",
                "EMAIL_HOST_USER": "ops@example.com",
                "EMAIL_HOST_PASSWORD": "mail-" + ("x" * 40),
                "LIVEKIT_PUBLIC_URL": "wss://example.com/livekit",
                "MINIO_ACCESS_KEY": "minio-access",
                "MINIO_SECRET_KEY": "minio-" + ("x" * 40),
                "CLIENT_SECRET": "client-" + ("x" * 40),
                "LIVEKIT_API_KEY": "lk-api-key",
                "LIVEKIT_API_SECRET": "lk-" + ("x" * 40),
                "INTERVIEW_AGENT_AUTH_REQUIRED": False,
                "INTERVIEW_AGENT_SHARED_SECRET": "agent-" + ("x" * 40),
                "FRAPPE_HR_ADMIN_PASSWORD": "frappe-admin-" + ("x" * 40),
                "FRAPPE_HR_DB_ROOT_PASSWORD": "frappe-root-" + ("x" * 40),
            }
        )


def test_validate_env_requires_livekit_webhook_strict_in_production():
    with pytest.raises(ImproperlyConfigured, match="LIVEKIT_WEBHOOK_STRICT"):
        validate_required_settings(
            {
                "APP_ENV": "production",
                "DEBUG": False,
                "SECRET_KEY": "x" * 64,
                "DATABASES": {
                    "default": {
                        "ENGINE": "django.db.backends.mysql",
                        "NAME": "square_db",
                        "USER": "app_user",
                        "PASSWORD": "db-" + ("x" * 40),
                        "HOST": "db",
                        "PORT": "3306",
                    }
                },
                "EMAIL_HOST": "smtp.example.com",
                "EMAIL_PORT": "587",
                "EMAIL_HOST_USER": "ops@example.com",
                "EMAIL_HOST_PASSWORD": "mail-" + ("x" * 40),
                "LIVEKIT_PUBLIC_URL": "wss://example.com/livekit",
                "MINIO_ACCESS_KEY": "minio-access",
                "MINIO_SECRET_KEY": "minio-" + ("x" * 40),
                "CLIENT_SECRET": "client-" + ("x" * 40),
                "LIVEKIT_API_KEY": "lk-api-key",
                "LIVEKIT_API_SECRET": "lk-" + ("x" * 40),
                "LIVEKIT_WEBHOOK_STRICT": False,
                "INTERVIEW_AGENT_AUTH_REQUIRED": True,
                "INTERVIEW_AGENT_SHARED_SECRET": "agent-" + ("x" * 40),
                "FRAPPE_HR_ADMIN_PASSWORD": "frappe-admin-" + ("x" * 40),
                "FRAPPE_HR_DB_ROOT_PASSWORD": "frappe-root-" + ("x" * 40),
            }
        )


def test_validate_env_accepts_production_secrets_from_database_settings():
    validate_required_settings(
        {
            "APP_ENV": "production",
            "DEBUG": False,
            "SECRET_KEY": "x" * 64,
            "DATABASES": {
                "default": {
                    "ENGINE": "django.db.backends.mysql",
                    "NAME": "square_db",
                    "USER": "app_user",
                    "PASSWORD": "db-" + ("x" * 40),
                    "HOST": "db",
                    "PORT": "3306",
                }
            },
            "EMAIL_HOST": "smtp.example.com",
            "EMAIL_PORT": "587",
            "EMAIL_HOST_USER": "ops@example.com",
            "EMAIL_HOST_PASSWORD": "mail-" + ("x" * 40),
            "LIVEKIT_PUBLIC_URL": "wss://example.com/livekit",
            "MINIO_ACCESS_KEY": "minio-access",
            "MINIO_SECRET_KEY": "minio-" + ("x" * 40),
            "CLIENT_SECRET": "client-" + ("x" * 40),
            "LIVEKIT_API_KEY": "lk-api-key",
            "LIVEKIT_API_SECRET": "lk-" + ("x" * 40),
            "LIVEKIT_WEBHOOK_STRICT": True,
            "INTERVIEW_AGENT_AUTH_REQUIRED": True,
            "INTERVIEW_AGENT_SHARED_SECRET": "agent-" + ("x" * 40),
            "FRAPPE_HR_ADMIN_PASSWORD": "frappe-admin-" + ("x" * 40),
            "FRAPPE_HR_DB_ROOT_PASSWORD": "frappe-root-" + ("x" * 40),
        }
    )


def test_validate_env_allows_public_oauth_client_without_client_secret(monkeypatch):
    monkeypatch.delenv("CLIENT_SECRET", raising=False)

    validate_required_settings(
        {
            "APP_ENV": "production",
            "DEBUG": False,
            "OAUTH_CLIENT_TYPE": "public",
            "SECRET_KEY": "x" * 64,
            "DATABASES": {
                "default": {
                    "ENGINE": "django.db.backends.mysql",
                    "NAME": "square_db",
                    "USER": "app_user",
                    "PASSWORD": "db-" + ("x" * 40),
                    "HOST": "db",
                    "PORT": "3306",
                }
            },
            "EMAIL_HOST": "smtp.example.com",
            "EMAIL_PORT": "587",
            "EMAIL_HOST_USER": "ops@example.com",
            "EMAIL_HOST_PASSWORD": "mail-" + ("x" * 40),
            "LIVEKIT_PUBLIC_URL": "wss://example.com/livekit",
            "MINIO_ACCESS_KEY": "minio-access",
            "MINIO_SECRET_KEY": "minio-" + ("x" * 40),
            "LIVEKIT_API_KEY": "lk-api-key",
            "LIVEKIT_API_SECRET": "lk-" + ("x" * 40),
            "LIVEKIT_WEBHOOK_STRICT": True,
            "INTERVIEW_AGENT_AUTH_REQUIRED": True,
            "INTERVIEW_AGENT_SHARED_SECRET": "agent-" + ("x" * 40),
            "FRAPPE_HR_ADMIN_PASSWORD": "frappe-admin-" + ("x" * 40),
            "FRAPPE_HR_DB_ROOT_PASSWORD": "frappe-root-" + ("x" * 40),
        }
    )


@pytest.mark.django_db
def test_sync_oauth_client_updates_secret_from_environment(monkeypatch, admin_user):
    monkeypatch.setenv("CLIENT_ID", "sync-test-client")
    monkeypatch.setenv("CLIENT_SECRET", "sync-test-secret-1")
    monkeypatch.setenv("OAUTH_CLIENT_NAME", "sync-test-app")
    monkeypatch.setenv("OAUTH_CLIENT_TYPE", "confidential")

    Application.objects.create(
        user=admin_user,
        client_id="sync-test-client",
        client_secret="old-secret",
        client_type=Application.CLIENT_CONFIDENTIAL,
        authorization_grant_type=Application.GRANT_PASSWORD,
        name="sync-test-app",
    )

    call_command("sync_oauth_client")

    app = Application.objects.get(client_id="sync-test-client")
    assert app.hash_client_secret is True
    assert check_password("sync-test-secret-1", app.client_secret)


@pytest.mark.django_db
def test_sync_oauth_client_supports_public_web_client_without_secret(monkeypatch, admin_user):
    monkeypatch.setenv("CLIENT_ID", "sync-public-client")
    monkeypatch.delenv("CLIENT_SECRET", raising=False)
    monkeypatch.setenv("OAUTH_CLIENT_NAME", "sync-public-app")
    monkeypatch.setenv("OAUTH_CLIENT_TYPE", "public")

    call_command("sync_oauth_client")

    app = Application.objects.get(client_id="sync-public-client")
    assert app.client_type == Application.CLIENT_PUBLIC
    assert app.authorization_grant_type == Application.GRANT_PASSWORD
    assert app.hash_client_secret is False
    assert app.client_secret == ""
