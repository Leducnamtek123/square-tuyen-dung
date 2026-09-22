import pytest
from django.core.cache import cache
from rest_framework.test import APIClient

from apps.jobs.models import JobPost, JobPostDailyView


@pytest.mark.django_db
def test_job_retrieve_is_idempotent_and_does_not_increment_views(job_post):
    client = APIClient()
    initial_views = job_post.views

    # Call GET retrieve twice
    res1 = client.get(f"/api/v1/job/web/job-posts/{job_post.slug}/")
    assert res1.status_code == 200

    res2 = client.get(f"/api/v1/job/web/job-posts/{job_post.slug}/")
    assert res2.status_code == 200

    job_post.refresh_from_db()
    assert job_post.views == initial_views
    assert not JobPostDailyView.objects.filter(job_post=job_post).exists()


@pytest.mark.django_db
def test_track_view_increments_views_and_records_daily(job_post):
    cache.clear()
    client = APIClient()
    initial_views = job_post.views

    response = client.post(
        f"/api/v1/job/web/job-posts/{job_post.slug}/track-view/",
        HTTP_USER_AGENT="Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    )
    assert response.status_code == 200
    data = response.json().get("data")
    assert data["counted"] is True
    assert data["views"] == initial_views + 1

    job_post.refresh_from_db()
    assert job_post.views == initial_views + 1
    assert JobPostDailyView.objects.filter(job_post=job_post).exists()


@pytest.mark.django_db
def test_track_view_cooldown_deduplication(job_post):
    cache.clear()
    client = APIClient()
    initial_views = job_post.views

    # 1st call: counted
    res1 = client.post(
        f"/api/v1/job/web/job-posts/{job_post.slug}/track-view/",
        HTTP_USER_AGENT="Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    )
    assert res1.json()["data"]["counted"] is True

    # 2nd call from same client/IP/UA: should NOT be counted (cooldown)
    res2 = client.post(
        f"/api/v1/job/web/job-posts/{job_post.slug}/track-view/",
        HTTP_USER_AGENT="Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    )
    assert res2.status_code == 200
    assert res2.json()["data"]["counted"] is False
    assert res2.json()["data"]["views"] == initial_views + 1

    job_post.refresh_from_db()
    assert job_post.views == initial_views + 1


@pytest.mark.django_db
def test_track_view_filters_crawlers_and_bots(job_post):
    cache.clear()
    client = APIClient()
    initial_views = job_post.views

    # Bot UA
    response = client.post(
        f"/api/v1/job/web/job-posts/{job_post.slug}/track-view/",
        HTTP_USER_AGENT="Googlebot/2.1 (+http://www.google.com/bot.html)",
    )
    assert response.status_code == 200
    data = response.json().get("data")
    assert data["counted"] is False

    job_post.refresh_from_db()
    assert job_post.views == initial_views


@pytest.mark.django_db
def test_admin_general_statistics_includes_job_views(admin_user, job_post):
    cache.clear()
    client = APIClient()
    client.force_authenticate(user=admin_user)

    # Set some views and daily views
    JobPost.objects.filter(pk=job_post.pk).update(views=120)
    job_post.refresh_from_db()

    response = client.get("/api/v1/job/web/statistics/admin/?type=general")
    assert response.status_code == 200
    data = response.json().get("data")

    assert "totalJobPostViews" in data
    assert data["totalJobPostViews"] >= 120
    assert "newJobPostViews" in data
    assert "topViewedJobs" in data
    assert isinstance(data["topViewedJobs"], list)
    assert len(data["topViewedJobs"]) > 0
    top_job = data["topViewedJobs"][0]
    assert top_job["id"] == job_post.id
    assert top_job["views"] == 120
    assert "conversionRate" in top_job


@pytest.mark.django_db
def test_admin_trend_statistics_includes_job_views(admin_user, job_post):
    cache.clear()
    client = APIClient()
    client.force_authenticate(user=admin_user)

    response = client.get("/api/v1/job/web/statistics/admin/?type=trend&days=7")
    assert response.status_code == 200
    data = response.json().get("data")

    assert "jobViews" in data
    assert len(data["jobViews"]) == 7


@pytest.mark.django_db
def test_admin_job_posts_list_includes_views_field(admin_user, job_post):
    client = APIClient()
    client.force_authenticate(user=admin_user)

    response = client.get("/api/v1/job/web/admin-job-posts/")
    assert response.status_code == 200
    payload = response.json()
    data = payload.get("data")
    if isinstance(data, dict):
        results = data.get("results", [])
    elif isinstance(data, list):
        results = data
    else:
        results = payload.get("results", [])
    assert len(results) > 0
    first_item = results[0]
    assert "views" in first_item
