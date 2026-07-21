import pytest
from rest_framework.test import APIClient

from apps.accounts.models import User
from apps.locations.models import District
from apps.profiles.models import JobSeekerProfile, ResumeImportJob
from shared.configs import variable_system as var_sys


@pytest.mark.django_db
def test_admin_resume_import_endpoint_queues_job(monkeypatch, admin_user, city):
    called = {}
    district = District.objects.create(name="Quan 1", code="Q1", city=city)

    def fake_delay(job_id, **kwargs):
        called["job_id"] = job_id
        called["kwargs"] = kwargs

    monkeypatch.setattr("apps.profiles.views.web_admin.transaction.on_commit", lambda fn: fn())
    monkeypatch.setattr("apps.profiles.tasks.run_vieclam24h_import.delay", fake_delay)

    client = APIClient()
    client.force_authenticate(user=admin_user)
    response = client.post(
        "/api/v1/info/web/admin/resumes/import-vieclam24h/",
        {
            "sourceUrl": "https://ntd.vieclam24h.vn/employer/search/seeker",
            "account": "hr@example.com",
            "password": "secret",
            "occupationIds": [31, 13],
            "destinationCityId": city.id,
            "destinationDistrictId": district.id,
        },
        format="json",
    )

    assert response.status_code == 202
    body = response.json()
    assert body["success"] is True
    job = body["data"]
    assert job["status"] == "pending"
    assert job["progress"] == 0
    assert job["sourceUrl"] == "https://ntd.vieclam24h.vn/employer/search/seeker"
    assert job["sourceAccount"] == "hr@example.com"
    assert job["targetCityId"] == city.id
    assert job["targetDistrictId"] == district.id
    assert called["job_id"] == job["id"]
    assert called["kwargs"]["source_url"] == "https://ntd.vieclam24h.vn/employer/search/seeker"
    assert ResumeImportJob.objects.filter(id=job["id"]).exists()

@pytest.mark.django_db
def test_admin_resume_import_endpoint_accepts_missing_destination_fields(monkeypatch, admin_user):
    called = {}

    def fake_delay(job_id, **kwargs):
        called["job_id"] = job_id
        called["kwargs"] = kwargs

    monkeypatch.setattr("apps.profiles.views.web_admin.transaction.on_commit", lambda fn: fn())
    monkeypatch.setattr("apps.profiles.tasks.run_vieclam24h_import.delay", fake_delay)

    client = APIClient()
    client.force_authenticate(user=admin_user)
    response = client.post(
        "/api/v1/info/web/admin/resumes/import-vieclam24h/",
        {
            "sourceUrl": "https://ntd.vieclam24h.vn/employer/search/seeker",
            "account": "hr@example.com",
            "password": "secret",
            "occupationIds": [31],
        },
        format="json",
    )

    assert response.status_code == 202
    job = response.json()["data"]
    assert job["targetCityId"] is None
    assert job["targetDistrictId"] is None
    assert called["kwargs"]["target_city_id"] is None
    assert called["kwargs"]["target_district_id"] is None

@pytest.mark.django_db
def test_resume_import_job_endpoint_returns_job_status(admin_user):
    job = ResumeImportJob.objects.create(
        status=ResumeImportJob.Status.PROCESSING,
        progress=42,
        source_url="https://ntd.vieclam24h.vn/employer/search/seeker",
        source_account="hr@example.com",
    )

    client = APIClient()
    client.force_authenticate(user=admin_user)
    response = client.get(f"/api/v1/info/web/admin/resume-import-jobs/{job.id}/")

    assert response.status_code == 200
    assert response.json()["data"]["id"] == job.id
    assert response.json()["data"]["status"] == "processing"
    assert response.json()["data"]["progress"] == 42

@pytest.mark.django_db
def test_vieclam24h_catalog_endpoint_returns_source_taxonomy(monkeypatch, admin_user):
    catalog = {
        "origin": "https://ntd.vieclam24h.vn",
        "occupations": [{"id": 31, "name": "Xây dựng", "isTop": True}],
        "topOccupations": [{"id": 31, "name": "Xây dựng", "isTop": True}],
        "provinces": [{"id": 122, "name": "Hà Nội"}],
        "provincesAll": [{"id": 122, "name": "Hà Nội"}],
        "recommendedOccupationIds": [31],
    }

    monkeypatch.setattr("apps.profiles.views.web_admin.get_vieclam24h_catalog", lambda source_url=None: catalog)

    client = APIClient()
    client.force_authenticate(user=admin_user)
    response = client.get("/api/v1/info/web/admin/resumes/vieclam24h-catalog/")

    assert response.status_code == 200
    assert response.json() == {
        "success": True,
        "data": catalog,
        "error": None,
    }


@pytest.mark.django_db
def test_admin_job_seeker_profile_bulk_delete_endpoint_deletes_selected_profiles(admin_user, city):
    user_1 = User.objects.create_user_with_role_name(
        email="bulk-1@test.com",
        full_name="Bulk One",
        role_name=var_sys.JOB_SEEKER,
        password="testpass123",
        is_active=True,
        is_verify_email=True,
    )
    user_2 = User.objects.create_user_with_role_name(
        email="bulk-2@test.com",
        full_name="Bulk Two",
        role_name=var_sys.JOB_SEEKER,
        password="testpass123",
        is_active=True,
        is_verify_email=True,
    )
    profile_1 = JobSeekerProfile.objects.create(user=user_1, phone="0900000001", location=city.locations.create(address="A"))
    profile_2 = JobSeekerProfile.objects.create(user=user_2, phone="0900000002", location=city.locations.create(address="B"))

    client = APIClient()
    client.force_authenticate(user=admin_user)
    response = client.post(
        "/api/v1/info/web/admin/job-seeker-profiles/bulk-delete/",
        {"ids": [profile_1.id, profile_2.id]},
        format="json",
    )

    assert response.status_code == 200
    assert response.json() == {
        "success": True,
        "data": {"deleted": 2},
        "error": None,
    }
    assert not JobSeekerProfile.objects.filter(id__in=[profile_1.id, profile_2.id]).exists()
