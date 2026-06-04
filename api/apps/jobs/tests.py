"""
Unit tests for the Jobs app — services, models, and API endpoints.
"""
import pytest
from datetime import timedelta
from unittest.mock import patch, MagicMock

from django.utils import timezone
from django.test import TestCase
from django.core.cache import cache
from rest_framework.test import APIClient, APIRequestFactory

from apps.jobs.models import JobPost, JobPostActivity
from apps.jobs.serializers import JobPostSerializer, JobSeekerJobPostActivitySerializer
from apps.jobs.services import JobPostService, JobActivityService
from apps.jobs.exceptions import CompanyNotVerifiedError
from apps.jobs.ai_scoring_service import _fallback_scoring, build_scoring_prompt
from apps.jobs.recommendation_service import get_recommended_jobs
from apps.content.models import SystemSetting
from common.serializers import LocationSerializer
from shared.configs import variable_system as var_sys


# ==================== Model Tests ====================

@pytest.mark.django_db
class TestJobPostModel:
    """Tests for the JobPost model."""

    def test_job_post_creation(self, job_post):
        """Job post should be created with correct fields."""
        assert job_post.job_name == 'Senior Python Developer'
        assert job_post.status == var_sys.JobPostStatus.APPROVED
        assert job_post.quantity == 2

    def test_job_post_str(self, job_post):
        """String representation should return job name."""
        assert str(job_post) is not None

    def test_job_post_deadline_in_future(self, job_post):
        """Deadline should be in the future."""
        assert job_post.deadline > timezone.now().date()


# ==================== Admin API Tests ====================

@pytest.mark.django_db
def test_admin_job_posts_filter_expired_returns_only_approved_expired(
    admin_user,
    job_post,
    employer_user,
    company,
    career,
    location,
):
    job_post.status = var_sys.JobPostStatus.APPROVED
    job_post.deadline = timezone.now().date() - timedelta(days=1)
    job_post.save(update_fields=["status", "deadline"])

    JobPost.objects.create(
        job_name="Pending Expired Job",
        deadline=timezone.now().date() - timedelta(days=1),
        quantity=1,
        job_description="<p>Pending job</p>",
        position=4,
        type_of_workplace=1,
        experience=2,
        academic_level=2,
        job_type=1,
        salary_min=10000000,
        salary_max=20000000,
        contact_person_name="HR",
        contact_person_phone="0901234567",
        contact_person_email="hr@test.com",
        status=var_sys.JobPostStatus.PENDING,
        user=employer_user,
        company=company,
        career=career,
        location=location,
    )
    JobPost.objects.create(
        job_name="Approved Future Job",
        deadline=timezone.now().date() + timedelta(days=30),
        quantity=1,
        job_description="<p>Future job</p>",
        position=4,
        type_of_workplace=1,
        experience=2,
        academic_level=2,
        job_type=1,
        salary_min=10000000,
        salary_max=20000000,
        contact_person_name="HR",
        contact_person_phone="0901234567",
        contact_person_email="hr@test.com",
        status=var_sys.JobPostStatus.APPROVED,
        user=employer_user,
        company=company,
        career=career,
        location=location,
    )

    client = APIClient()
    client.force_authenticate(user=admin_user)

    response = client.get("/api/v1/job/web/admin-job-posts/", {"isExpired": "true"})

    assert response.status_code == 200
    payload = response.json()
    results = payload.get("data", payload).get("results", payload.get("results", []))
    assert [item["id"] for item in results] == [job_post.id]


@pytest.mark.django_db
def test_public_job_posts_exclude_unverified_company(job_post):
    job_post.company.is_verified = False
    job_post.company.save(update_fields=["is_verified", "update_at"])

    client = APIClient()
    response = client.get("/api/v1/job/web/job-posts/", {"cacheBust": job_post.id})

    assert response.status_code == 200
    payload = response.json()
    data = payload.get("data", payload)
    results = data.get("results", data if isinstance(data, list) else [])
    assert job_post.id not in [item["id"] for item in results]


@pytest.mark.django_db
def test_salary_insight_uses_market_fallback_and_excludes_current_job(
    employer_user,
    company,
    career,
    job_post,
):
    from apps.locations.models import City, Location

    other_city = City.objects.create(name="Ha Noi", code="HN-SALARY")
    other_location = Location.objects.create(city=other_city, address="Ha Noi")

    def create_salary_job(name, salary_min, salary_max, job_location):
        return JobPost.objects.create(
            job_name=name,
            deadline=timezone.now().date() + timedelta(days=30),
            quantity=1,
            job_description="<p>Market job</p>",
            job_requirement="<p>Requirement</p>",
            benefits_enjoyed="<p>Benefits</p>",
            position=4,
            type_of_workplace=1,
            experience=2,
            academic_level=2,
            job_type=1,
            salary_min=salary_min,
            salary_max=salary_max,
            contact_person_name="HR",
            contact_person_phone="0901234567",
            contact_person_email="hr@test.com",
            status=var_sys.JobPostStatus.APPROVED,
            user=employer_user,
            company=company,
            career=career,
            location=job_location,
        )

    create_salary_job("Same career other city 1", 10000000, 20000000, other_location)
    create_salary_job("Same career other city 2", 12000000, 22000000, other_location)
    create_salary_job("Same career other city 3", 14000000, 24000000, other_location)

    client = APIClient()
    response = client.get(f"/api/v1/job/web/job-posts/{job_post.slug}/salary-insight/")

    assert response.status_code == 200
    payload = response.json()
    data = payload.get("data", payload)
    assert data["scope"] == "sameCareer"
    assert data["count"] == 3
    assert data["medianSalary"] == 17000000
    assert data["p25Salary"] == 16000000
    assert data["p75Salary"] == 18000000
    assert data["salaryPosition"] == "above"
    assert job_post.slug not in [item["slug"] for item in data["relatedJobs"]]


@pytest.mark.django_db
def test_job_post_serializer_allows_today_deadline_and_rejects_past_deadline():
    today_serializer = JobPostSerializer(
        data={"deadline": timezone.localdate()},
        partial=True,
    )
    past_serializer = JobPostSerializer(
        data={"deadline": timezone.localdate() - timedelta(days=1)},
        partial=True,
    )

    assert today_serializer.is_valid(), today_serializer.errors
    assert not past_serializer.is_valid()
    assert "deadline" in past_serializer.errors


@pytest.mark.django_db
def test_job_post_serializer_allows_job_name_up_to_model_limit():
    valid_serializer = JobPostSerializer(
        data={"jobName": "a" * 255},
        partial=True,
    )
    invalid_serializer = JobPostSerializer(
        data={"jobName": "a" * 256},
        partial=True,
    )

    assert valid_serializer.is_valid(), valid_serializer.errors
    assert not invalid_serializer.is_valid()
    assert "jobName" in invalid_serializer.errors


@pytest.mark.django_db
def test_job_post_serializer_validates_partial_salary_against_existing_values(job_post):
    min_above_existing_max = JobPostSerializer(
        job_post,
        data={"salaryMin": job_post.salary_max + 1},
        partial=True,
    )
    max_below_existing_min = JobPostSerializer(
        job_post,
        data={"salaryMax": job_post.salary_min - 1},
        partial=True,
    )
    negative_min = JobPostSerializer(
        job_post,
        data={"salaryMin": -1},
        partial=True,
    )
    negative_max = JobPostSerializer(
        job_post,
        data={"salaryMax": -1},
        partial=True,
    )

    assert not min_above_existing_max.is_valid()
    assert "salaryMax" in min_above_existing_max.errors
    assert not max_below_existing_min.is_valid()
    assert "salaryMax" in max_below_existing_min.errors
    assert not negative_min.is_valid()
    assert "salaryMin" in negative_min.errors
    assert not negative_max.is_valid()
    assert "salaryMax" in negative_max.errors


@pytest.mark.django_db
def test_location_serializer_allows_manual_address_without_coordinates(city):
    from apps.locations.models import District

    district = District.objects.create(name="Quan 1", code="Q1-CONTRACT", city=city)
    serializer = LocationSerializer(
        data={
            "city": city.id,
            "district": district.id,
            "address": "123 Nguyen Trai",
        },
    )

    assert serializer.is_valid(), serializer.errors
    assert "lat" not in serializer.validated_data
    assert "lng" not in serializer.validated_data


@pytest.mark.django_db
def test_location_serializer_requires_city_and_district_for_writes(city):
    from apps.locations.models import District

    district = District.objects.create(name="Quan 1", code="Q1-REQUIRED-CONTRACT", city=city)
    missing_city = LocationSerializer(
        data={
            "district": district.id,
            "address": "123 Nguyen Trai",
        },
    )
    missing_district = LocationSerializer(
        data={
            "city": city.id,
            "address": "123 Nguyen Trai",
        },
    )

    assert missing_city.is_valid() is False
    assert "city" in missing_city.errors
    assert missing_district.is_valid() is False
    assert "district" in missing_district.errors


@pytest.mark.django_db
def test_location_serializer_rejects_district_outside_selected_city(city):
    from apps.locations.models import City, District

    other_city = City.objects.create(name="Ha Noi", code="HN-LOCATION-CONTRACT")
    other_district = District.objects.create(name="Ba Dinh", code="BD-LOCATION-CONTRACT", city=other_city)

    serializer = LocationSerializer(
        data={
            "city": city.id,
            "district": other_district.id,
            "address": "123 Nguyen Trai",
        },
    )

    assert serializer.is_valid() is False
    assert "district" in serializer.errors


@pytest.mark.django_db
def test_location_serializer_rejects_ward_outside_selected_district(city):
    from apps.locations.models import District, Ward

    selected_district = District.objects.create(name="Quan 1", code="Q1-WARD-CONTRACT", city=city)
    other_district = District.objects.create(name="Quan 3", code="Q3-WARD-CONTRACT", city=city)
    other_ward = Ward.objects.create(name="Phuong 1", code="P1-WARD-CONTRACT", district=other_district)

    serializer = LocationSerializer(
        data={
            "city": city.id,
            "district": selected_district.id,
            "ward": other_ward.id,
            "address": "123 Nguyen Trai",
        },
    )

    assert serializer.is_valid() is False
    assert "ward" in serializer.errors


@pytest.mark.django_db
def test_location_serializer_validates_partial_update_against_existing_location(location, city):
    from apps.locations.models import City, District

    existing_district = District.objects.create(name="Quan 1", code="Q1-PARTIAL-CONTRACT", city=city)
    other_city = City.objects.create(name="Ha Noi", code="HN-PARTIAL-CONTRACT")
    other_district = District.objects.create(name="Ba Dinh", code="BD-PARTIAL-CONTRACT", city=other_city)
    location.city = city
    location.district = existing_district
    location.save(update_fields=["city", "district", "update_at"])

    serializer = LocationSerializer(
        location,
        data={"district": other_district.id},
        partial=True,
    )

    assert serializer.is_valid() is False
    assert "district" in serializer.errors


@pytest.mark.django_db
def test_job_seeker_statistics_excludes_soft_deleted_applications(job_seeker_user, job_post, resume):
    JobPostActivity.objects.create(
        user=job_seeker_user,
        job_post=job_post,
        resume=resume,
        is_deleted=False,
    )
    JobPostActivity.objects.create(
        user=job_seeker_user,
        job_post=job_post,
        resume=resume,
        is_deleted=True,
    )
    client = APIClient()
    client.force_authenticate(user=job_seeker_user)

    response = client.get("/api/v1/job/web/statistics/job-seeker/", {"type": "general"})

    assert response.status_code == 200
    assert response.data["data"]["totalApply"] == 1


@pytest.mark.django_db
def test_recommended_jobs_uses_active_resumes_and_rechecks_cached_public_filters(job_seeker_user, job_post, resume):
    cache.clear()

    resume.is_active = False
    resume.save(update_fields=["is_active", "update_at"])

    assert list(get_recommended_jobs(job_seeker_user)) == []

    resume.is_active = True
    resume.save(update_fields=["is_active", "update_at"])
    first_ids = list(get_recommended_jobs(job_seeker_user).values_list("id", flat=True))
    assert job_post.id in first_ids

    job_post.company.is_verified = False
    job_post.company.save(update_fields=["is_verified", "update_at"])

    second_ids = list(get_recommended_jobs(job_seeker_user).values_list("id", flat=True))
    assert job_post.id not in second_ids


@pytest.mark.django_db
def test_recommended_jobs_orders_by_combined_relevance(job_seeker_user, employer_user, company, job_post, resume, career):
    from apps.locations.models import City, Location

    cache.clear()
    other_city = City.objects.create(name="Da Nang", code="DNG")
    other_location = Location.objects.create(city=other_city, address="Other city")
    weaker_job = JobPost.objects.create(
        job_name="Career Only Match",
        deadline=timezone.now().date() + timedelta(days=30),
        quantity=1,
        job_description="<p>Career only</p>",
        job_requirement="<p>Requirement</p>",
        benefits_enjoyed="<p>Benefits</p>",
        position=4,
        type_of_workplace=1,
        experience=9,
        academic_level=2,
        job_type=1,
        salary_min=1000000,
        salary_max=2000000,
        contact_person_name="HR",
        contact_person_phone="0901234567",
        contact_person_email="hr@test.com",
        status=var_sys.JobPostStatus.APPROVED,
        user=employer_user,
        company=company,
        career=career,
        location=other_location,
    )

    ids = list(get_recommended_jobs(job_seeker_user, limit=10).values_list("id", flat=True))

    assert job_post.id in ids
    assert weaker_job.id in ids
    assert ids.index(job_post.id) < ids.index(weaker_job.id)


@pytest.mark.django_db
def test_employer_can_add_manual_candidate_to_applied_profiles(employer_user, job_post):
    client = APIClient()
    client.force_authenticate(user=employer_user)

    response = client.post(
        "/api/v1/job/web/employer-job-posts-activity/manual-candidates/",
        {
            "jobPost": job_post.id,
            "fullName": "Nguyen Van A",
            "email": "candidate@example.com",
            "phone": "0909000000",
            "title": "Frontend Developer",
            "note": "Nguon tu HR tu nhap",
        },
        format="json",
    )

    assert response.status_code == 201
    created = response.data["data"]
    assert created["fullName"] == "Nguyen Van A"
    assert created["email"] == "candidate@example.com"
    assert created["jobName"] == job_post.job_name
    assert created["title"] == "Frontend Developer"
    assert created["userId"] is None
    assert created["resumeSlug"] is None
    assert created["isManualCandidate"] is True

    activity = JobPostActivity.objects.get(id=created["id"])
    assert activity.job_post == job_post
    assert activity.user is None
    assert activity.resume is None
    assert activity.manual_candidate_profile.full_name == "Nguyen Van A"

    list_response = client.get("/api/v1/job/web/employer-job-posts-activity/")
    results = list_response.data["results"]
    list_item = next(item for item in results if item["id"] == created["id"])
    assert list_item["jobPostDict"]["id"] == job_post.id
    assert list_item["jobPostDict"]["jobName"] == job_post.job_name

    export_response = client.get("/api/v1/job/web/employer-job-posts-activity/export/")
    assert export_response.status_code == 200
    assert export_response.data["data"]

    chat_response = client.get("/api/v1/job/web/employer-job-posts-activity/chat/")
    assert chat_response.status_code == 200
    assert created["id"] not in [item["id"] for item in chat_response.data["results"]]


@pytest.mark.django_db
def test_private_job_post_options_returns_active_company_jobs_only(
    employer_user,
    company,
    job_post,
    career,
    location,
):
    from apps.accounts.models import User
    from apps.profiles.models import Company

    other_owner = User.objects.create_user_with_role_name(
        email="other-options-owner@test.com",
        full_name="Other Options Owner",
        role_name=var_sys.EMPLOYER,
        password="pass123",
        is_active=True,
        is_verify_email=True,
        has_company=True,
    )
    other_company = Company.objects.create(
        company_name="Other Options Company",
        company_email="other-options-company@test.com",
        company_phone="0914000001",
        tax_code="OPTIONS0001",
        user=other_owner,
        location=location,
        is_verified=True,
    )
    other_job_post = JobPost.objects.create(
        job_name="Other Company Option Job",
        deadline=timezone.now().date() + timedelta(days=30),
        quantity=1,
        job_description="<p>Other job</p>",
        position=4,
        type_of_workplace=1,
        experience=2,
        academic_level=2,
        job_type=1,
        salary_min=10000000,
        salary_max=20000000,
        contact_person_name="Other HR",
        contact_person_phone="0914000002",
        contact_person_email="other-options-hr@test.com",
        status=var_sys.JobPostStatus.APPROVED,
        user=other_owner,
        company=other_company,
        career=career,
        location=location,
    )

    client = APIClient()
    client.force_authenticate(user=employer_user)

    response = client.get("/api/v1/job/web/private-job-posts/job-posts-options/")

    assert response.status_code == 200
    options = response.data["data"]
    assert {"id": job_post.id, "jobName": job_post.job_name} in options
    assert other_job_post.id not in [item["id"] for item in options]
    assert all(set(item.keys()) == {"id", "jobName"} for item in options)


@pytest.mark.django_db
def test_manual_candidate_serializer_rejects_non_pdf_file():
    from django.core.files.uploadedfile import SimpleUploadedFile
    from apps.profiles.serializers import EmployerCandidateProfileSerializer

    serializer = EmployerCandidateProfileSerializer(
        data={
            "fullName": "Nguyen Van B",
            "title": "Backend Developer",
            "file": SimpleUploadedFile("candidate.txt", b"not a pdf", content_type="text/plain"),
        },
    )

    assert serializer.is_valid() is False
    assert "file" in serializer.errors


@pytest.mark.django_db
def test_manual_candidate_serializer_rejects_salary_over_model_limit():
    from apps.profiles.serializers import EmployerCandidateProfileSerializer

    serializer = EmployerCandidateProfileSerializer(
        data={
            "fullName": "Nguyen Van C",
            "title": "Backend Developer",
            "salaryMin": 10_000_000_000_000,
        },
    )

    assert serializer.is_valid() is False
    assert "salaryMin" in serializer.errors


@pytest.mark.django_db
def test_manual_candidate_serializer_rejects_explicit_zero_max_below_min():
    from apps.profiles.serializers import EmployerCandidateProfileSerializer

    serializer = EmployerCandidateProfileSerializer(
        data={
            "fullName": "Nguyen Van D",
            "title": "Backend Developer",
            "salaryMin": 10_000_000,
            "salaryMax": 0,
        },
    )

    assert serializer.is_valid() is False
    assert "salaryMax" in serializer.errors


@pytest.mark.django_db
def test_employer_cannot_add_manual_candidate_to_other_company_job(
    employer_user,
    career,
    location,
):
    from apps.accounts.models import User
    from apps.profiles.models import Company

    other_owner = User.objects.create_user_with_role_name(
        email="other-manual-owner@test.com",
        full_name="Other Owner",
        role_name=var_sys.EMPLOYER,
        password="testpass123",
        is_active=True,
        is_verify_email=True,
        has_company=True,
    )
    other_company = Company.objects.create(
        company_name="Other Manual Company",
        company_email="other-manual-company@test.com",
        company_phone="0908000000",
        tax_code="MANUAL-OTHER",
        user=other_owner,
        location=location,
        is_verified=True,
    )
    other_job_post = JobPost.objects.create(
        job_name="Other Company Job",
        deadline=timezone.now().date() + timedelta(days=30),
        quantity=1,
        job_description="<p>Other job</p>",
        position=4,
        type_of_workplace=1,
        experience=2,
        academic_level=2,
        job_type=1,
        salary_min=10000000,
        salary_max=20000000,
        contact_person_name="Other HR",
        contact_person_phone="0908000001",
        contact_person_email="other-hr@test.com",
        status=var_sys.JobPostStatus.APPROVED,
        user=other_owner,
        company=other_company,
        career=career,
        location=location,
    )

    client = APIClient()
    client.force_authenticate(user=employer_user)

    response = client.post(
        "/api/v1/job/web/employer-job-posts-activity/manual-candidates/",
        {
            "jobPost": other_job_post.id,
            "fullName": "Wrong Company Candidate",
            "title": "Backend Developer",
        },
        format="json",
    )

    assert response.status_code == 403
    assert JobPostActivity.objects.filter(job_post=other_job_post).count() == 0


@pytest.mark.django_db
def test_job_post_serializer_scopes_interview_template_to_active_company(employer_user, company):
    from apps.accounts.models import User
    from apps.interviews.models import QuestionGroup
    from apps.profiles.models import Company

    global_group = QuestionGroup.objects.create(name="Global template")
    own_group = QuestionGroup.objects.create(name="Own template", company=company)
    other_owner = User.objects.create_user_with_role_name(
        email="other-template-owner@test.com",
        full_name="Other Template Owner",
        role_name=var_sys.EMPLOYER,
        password="pass123",
        is_active=True,
        has_company=True,
    )
    other_company = Company.objects.create(
        company_name="Other Template Company",
        company_email="other-template-company@test.com",
        company_phone="0913000001",
        tax_code="TPL000001",
        user=other_owner,
    )
    other_group = QuestionGroup.objects.create(name="Other template", company=other_company)
    request = APIRequestFactory().post("/")
    request.user = employer_user

    serializer = JobPostSerializer(context={"request": request})
    queryset = serializer.fields["interviewTemplate"].queryset

    assert global_group in queryset
    assert own_group in queryset
    assert other_group not in queryset


# ==================== Service Tests ====================

@pytest.mark.django_db
class TestJobService:
    """Tests for the JobService business logic."""

    def test_get_active_jobs_returns_active_only(self, job_post):
        """Should only return active, non-expired jobs."""
        jobs = JobPostService.get_active_jobs()
        assert job_post in jobs

    def test_get_active_jobs_excludes_expired(self, job_post):
        """Should exclude expired jobs."""
        job_post.deadline = timezone.now().date() - timedelta(days=1)
        job_post.save()

        jobs = JobPostService.get_active_jobs()
        assert job_post not in jobs

    def test_get_active_jobs_excludes_inactive_status(self, job_post):
        """Should exclude jobs with non-active status."""
        job_post.status = var_sys.JobPostStatus.PENDING
        job_post.save()

        jobs = JobPostService.get_active_jobs()
        assert job_post not in jobs

    def test_get_active_jobs_excludes_unverified_company(self, job_post):
        job_post.company.is_verified = False
        job_post.company.save(update_fields=["is_verified", "update_at"])

        jobs = JobPostService.get_active_jobs()

        assert job_post not in jobs

    def test_get_active_jobs_filter_by_career(self, job_post, career):
        """Should filter by career_id."""
        jobs = JobPostService.get_active_jobs(filters={'career_id': career.id})
        assert job_post in jobs

        jobs = JobPostService.get_active_jobs(filters={'career_id': 99999})
        assert job_post not in jobs

    def test_get_active_jobs_filter_by_keyword(self, job_post):
        """Should filter by keyword in job name or company name."""
        jobs = JobPostService.get_active_jobs(filters={'keyword': 'Python'})
        assert job_post in jobs

        jobs = JobPostService.get_active_jobs(filters={'keyword': 'nonexistent'})
        assert job_post not in jobs

    def test_create_job_creates_location_from_nested_payload(self, employer_user, company, career, city):
        from apps.locations.models import District, Location

        company.is_verified = True
        company.save(update_fields=["is_verified", "update_at"])
        district = District.objects.create(name="Quan 1", code="Q1", city=city)

        job = JobPostService.create_job(
            user=employer_user,
            validated_data={
                "job_name": "Nested Location Job",
                "deadline": timezone.now().date() + timedelta(days=30),
                "quantity": 1,
                "job_description": "<p>Description</p>",
                "job_requirement": "<p>Requirement</p>",
                "benefits_enjoyed": "<p>Benefits</p>",
                "position": 4,
                "type_of_workplace": 1,
                "experience": 2,
                "academic_level": 2,
                "job_type": 1,
                "salary_min": 10000000,
                "salary_max": 20000000,
                "contact_person_name": "HR",
                "contact_person_phone": "0901234567",
                "contact_person_email": "hr@test.com",
                "career": career,
                "location": {
                    "city": city,
                    "district": district,
                    "address": "123 Test",
                    "lat": 10.7,
                    "lng": 106.7,
                },
            },
        )

        assert isinstance(job.location, Location)
        assert job.location.city == city
        assert job.location.district == district
        assert job.location.address == "123 Test"

    def test_update_job_updates_existing_location_from_nested_payload(self, employer_user, job_post, city):
        from apps.locations.models import District

        district = District.objects.create(name="Quan 3", code="Q3", city=city)
        original_location_id = job_post.location_id

        updated = JobPostService.update_job(
            user=employer_user,
            job_post=job_post,
            validated_data={
                "location": {
                    "city": city,
                    "district": district,
                    "address": "456 Updated",
                    "lat": 10.8,
                    "lng": 106.8,
                },
            },
        )

        updated.refresh_from_db()
        assert updated.location_id == original_location_id
        assert updated.location.city == city
        assert updated.location.district == district
        assert updated.location.address == "456 Updated"

    def test_apply_to_job_success(self, job_seeker_user, job_post, resume):
        """Should successfully create an application."""
        validated_data = {
            'job_post': job_post,
            'resume': resume,
            'fullName': 'Test Name',
            'email': 'test@test.com'
        }
        activity = JobActivityService.apply_to_job(
            user=job_seeker_user,
            validated_data=validated_data,
        )
        assert activity is not None
        assert activity.user == job_seeker_user
        assert activity.job_post == job_post

    def test_apply_serializer_accepts_camel_case_job_post(self, job_post, resume):
        serializer = JobSeekerJobPostActivitySerializer(data={
            'jobPost': job_post.id,
            'resume': resume.id,
            'fullName': 'Test Name',
            'email': 'test@test.com',
            'phone': '0901234567',
        })

        assert serializer.is_valid(), serializer.errors
        assert serializer.validated_data['job_post'] == job_post

    def test_apply_to_job_duplicate_reuses_existing_application(self, job_seeker_user, job_post, resume):
        """Should not create duplicate applications on double submit."""
        validated_data = {
            'job_post': job_post,
            'resume': resume,
            'fullName': 'Test Name',
            'email': 'test@test.com'
        }
        first = JobActivityService.apply_to_job(job_seeker_user, validated_data)
        second = JobActivityService.apply_to_job(job_seeker_user, validated_data)

        assert first.id == second.id
        assert JobPostActivity.objects.filter(user=job_seeker_user, job_post=job_post, is_deleted=False).count() == 1
        return
        
        with pytest.raises(ValueError, match="đã ứng tuyển"):
            JobActivityService.apply_to_job(job_seeker_user, validated_data)

    def test_application_status_state_machine_blocks_skip_and_terminal_changes(self, job_seeker_user, job_post, resume):
        activity = JobPostActivity.objects.create(
            user=job_seeker_user,
            job_post=job_post,
            resume=resume,
            status=var_sys.ApplicationStatus.PENDING_CONFIRMATION,
        )

        with pytest.raises(ValueError):
            JobActivityService.change_application_status(activity, var_sys.ApplicationStatus.HIRED)

        activity = JobActivityService.change_application_status(activity, var_sys.ApplicationStatus.CONTACTED)
        assert activity.status == var_sys.ApplicationStatus.CONTACTED

        activity = JobActivityService.change_application_status(activity, var_sys.ApplicationStatus.NOT_SELECTED)
        assert activity.status == var_sys.ApplicationStatus.NOT_SELECTED

        with pytest.raises(ValueError):
            JobActivityService.change_application_status(activity, var_sys.ApplicationStatus.CONTACTED)

    def test_advance_application_to_interviewed_uses_valid_status_path(self, job_seeker_user, job_post, resume):
        activity = JobPostActivity.objects.create(
            user=job_seeker_user,
            job_post=job_post,
            resume=resume,
            status=var_sys.ApplicationStatus.PENDING_CONFIRMATION,
        )

        with patch("shared.helpers.helper.add_apply_status_notifications"):
            activity = JobActivityService.advance_application_to_interviewed(activity)

        activity.refresh_from_db()
        assert activity.status == var_sys.ApplicationStatus.INTERVIEWED

    def test_apply_to_job_expired_rejected(self, job_seeker_user, job_post, resume):
        """Should reject applications to expired jobs."""
        job_post.deadline = timezone.now().date() - timedelta(days=1)
        job_post.save()

        validated_data = {
            'job_post': job_post,
            'resume': resume,
            'fullName': 'Test Name',
            'email': 'test@test.com'
        }
        with pytest.raises(ValueError, match="hết hạn"):
            JobActivityService.apply_to_job(job_seeker_user, validated_data)

    def test_apply_to_job_inactive_rejected(self, job_seeker_user, job_post, resume):
        """Should reject applications to inactive jobs."""
        job_post.status = var_sys.JobPostStatus.PENDING
        job_post.save()

        validated_data = {
            'job_post': job_post,
            'resume': resume,
            'fullName': 'Test Name',
            'email': 'test@test.com'
        }
        with pytest.raises(ValueError, match="không còn hoạt động"):
            JobActivityService.apply_to_job(job_seeker_user, validated_data)

    def test_apply_to_job_unverified_company_rejected(self, job_seeker_user, job_post, resume):
        job_post.company.is_verified = False
        job_post.company.save(update_fields=["is_verified", "update_at"])

        validated_data = {
            'job_post': job_post,
            'resume': resume,
            'fullName': 'Test Name',
            'email': 'test@test.com'
        }
        with pytest.raises(CompanyNotVerifiedError):
            JobActivityService.apply_to_job(job_seeker_user, validated_data)

    def test_soft_deleted_application_can_be_reapplied_multiple_times(self, job_seeker_user, job_post, resume):
        validated_data = {
            'job_post': job_post,
            'resume': resume,
            'fullName': 'Test Name',
            'email': 'test@test.com'
        }

        first = JobActivityService.apply_to_job(job_seeker_user, validated_data)
        first.is_deleted = True
        first.save(update_fields=["is_deleted", "update_at"])

        second = JobActivityService.apply_to_job(job_seeker_user, validated_data)
        second.is_deleted = True
        second.save(update_fields=["is_deleted", "update_at"])

        third = JobActivityService.apply_to_job(job_seeker_user, validated_data)

        assert third.id != first.id
        assert JobPostActivity.objects.filter(user=job_seeker_user, job_post=job_post, is_deleted=False).count() == 1
        assert JobPostActivity.objects.filter(user=job_seeker_user, job_post=job_post, is_deleted=True).count() == 2

    def test_apply_wrong_resume_owner(self, employer_user, job_post, resume):
        """Should reject if resume doesn't belong to applicant."""
        validated_data = {
            'job_post': job_post,
            'resume': resume,
            'fullName': 'Test Name',
            'email': 'test@test.com'
        }
        with pytest.raises(ValueError, match="không thuộc về bạn"):
            JobActivityService.apply_to_job(employer_user, validated_data)

    def test_get_employer_job_stats(self, company, job_post):
        """Should return correct employer stats."""
        stats = JobActivityService.get_employer_job_stats(company)
        assert stats['total_jobs'] == 1
        assert stats['active_jobs'] == 1
        assert stats['total_applications'] == 0

    def test_create_job_auto_approves_when_setting_enabled(self, employer_user, company, career, location):
        SystemSetting.objects.create(key="autoApproveJobs", value="true")
        company.is_verified = True
        company.save(update_fields=["is_verified"])

        job = JobPostService.create_job(
            user=employer_user,
            validated_data={
                "job_name": "Auto Approved Job",
                "deadline": timezone.now().date() + timedelta(days=30),
                "quantity": 1,
                "job_description": "<p>Job description</p>",
                "job_requirement": "<p>Requirement</p>",
                "benefits_enjoyed": "<p>Benefits</p>",
                "position": 4,
                "type_of_workplace": 1,
                "experience": 2,
                "academic_level": 2,
                "job_type": 1,
                "salary_min": 10000000,
                "salary_max": 20000000,
                "contact_person_name": "HR",
                "contact_person_phone": "0901234567",
                "contact_person_email": "hr@test.com",
                "career": career,
                "location": location,
            },
        )

        assert job.status == var_sys.JobPostStatus.APPROVED

    def test_create_job_requires_verified_company(self, employer_user, company, career, location):
        with pytest.raises(CompanyNotVerifiedError, match="chưa được xác thực"):
            JobPostService.create_job(
                user=employer_user,
                validated_data={
                    "job_name": "Blocked Job",
                    "deadline": timezone.now().date() + timedelta(days=30),
                    "quantity": 1,
                    "job_description": "<p>Job description</p>",
                    "job_requirement": "<p>Requirement</p>",
                    "benefits_enjoyed": "<p>Benefits</p>",
                    "position": 4,
                    "type_of_workplace": 1,
                    "experience": 2,
                    "academic_level": 2,
                    "job_type": 1,
                    "salary_min": 10000000,
                    "salary_max": 20000000,
                    "contact_person_name": "HR",
                    "contact_person_phone": "0901234567",
                    "contact_person_email": "hr@test.com",
                    "career": career,
                    "location": location,
                },
            )

    def test_apply_to_job_skips_email_when_email_notifications_disabled(self, job_seeker_user, job_post, resume):
        SystemSetting.objects.create(key="emailNotifications", value="false")
        validated_data = {
            'job_post': job_post,
            'resume': resume,
            'fullName': 'Test Name',
            'email': 'test@test.com'
        }

        with patch("console.jobs.queue_mail.send_email_confirm_application.delay") as send_email:
            JobActivityService.apply_to_job(job_seeker_user, validated_data)

        send_email.assert_not_called()


# ==================== AI Scoring Tests ====================

class TestAIScoringFallback:
    """Tests for the rule-based fallback scoring."""

    def test_fallback_returns_valid_structure(self):
        """Should return a valid scoring structure."""
        resume = {'title': 'Python Dev', 'experience': 3, 'salary_min': 15000000, 'salary_max': 25000000}
        job = {'job_name': 'Python Developer', 'experience': 2, 'salary_min': 20000000, 'salary_max': 35000000}

        result = _fallback_scoring(resume, job)
        assert 'overall_score' in result
        assert 0 <= result['overall_score'] <= 100
        assert 'skill_match' in result
        assert 'experience_match' in result
        assert 'salary_match' in result

    def test_fallback_experience_match_bonus(self):
        """Should give bonus when resume experience >= job requirement."""
        resume = {'title': 'Dev', 'experience': 5, 'salary_min': 0, 'salary_max': 0}
        job = {'job_name': 'Dev', 'experience': 3, 'salary_min': 0, 'salary_max': 0}

        result = _fallback_scoring(resume, job)
        assert result['overall_score'] >= 70  # base 50 + exp 20

    def test_fallback_salary_overlap(self):
        """Should give bonus when salary ranges overlap."""
        resume = {'title': '', 'experience': 0, 'salary_min': 15000000, 'salary_max': 25000000}
        job = {'job_name': '', 'experience': 0, 'salary_min': 20000000, 'salary_max': 35000000}

        result = _fallback_scoring(resume, job)
        assert result['salary_match'] == 80

    def test_fallback_no_salary_overlap(self):
        """Should penalize when salary ranges don't overlap."""
        resume = {'title': '', 'experience': 0, 'salary_min': 50000000, 'salary_max': 60000000}
        job = {'job_name': '', 'experience': 0, 'salary_min': 10000000, 'salary_max': 20000000}

        result = _fallback_scoring(resume, job)
        assert result['salary_match'] == 40

    def test_build_prompt_includes_data(self):
        """Prompt should include resume and job data."""
        resume = {'title': 'Backend Dev', 'skills': 'Python, Django', 'experience': 3}
        job = {'job_name': 'Senior Dev', 'description': 'Need Python expert'}

        prompt = build_scoring_prompt(resume, job)
        assert 'Backend Dev' in prompt
        assert 'Senior Dev' in prompt
        assert 'Python, Django' in prompt
