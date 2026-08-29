"""
Unit and Integration Tests for apps.cv_builder:
- Models (CVTemplate, CandidateCV, CVSuggestion)
- Serializers & Validation
- RESTful ViewSets & Endpoints
- Actions: duplicate, set_main, public web view, auto-save
"""
import pytest
from rest_framework.test import APIClient
from rest_framework import status
from apps.cv_builder.models import CVTemplate, CandidateCV, CVSuggestion
from apps.accounts.models import User
from shared.configs import variable_system as var_sys


# ==============================================================================
# Fixtures
# ==============================================================================

@pytest.fixture
def api_client():
    """Create a DRF APIClient fixture."""
    return APIClient()


@pytest.fixture
def sample_template(db):
    """Create a sample CVTemplate for testing."""
    return CVTemplate.objects.create(
        code="modern-navy",
        name="Modern Navy (Đảo Phú Quốc)",
        description="Bố cục 2 cột hiện đại, sidebar thanh lịch.",
        category="modern",
        category_name="Hiện đại",
        thumbnail_url="https://s3.infohr.vn/cv-templates/modern-navy.png",
        color_palettes=["#1e3a8a", "#0f766e", "#374151"],
        default_theme={
            "primaryColor": "#1e3a8a",
            "fontFamily": "Inter, sans-serif",
            "fontSize": "medium",
            "spacing": "normal",
            "showAvatar": True,
            "avatarShape": "rounded",
        },
        sample_data={
            "personalInfo": {"fullName": "Nguyễn Văn An", "title": "Developer"},
            "experiences": [],
            "educations": [],
            "skills": [],
        },
        is_active=True,
        is_popular=True,
        sort_order=1,
        use_count=10,
    )


@pytest.fixture
def sample_suggestion(db):
    """Create a sample CVSuggestion for testing."""
    return CVSuggestion.objects.create(
        industry="IT",
        industry_name="Công nghệ thông tin",
        suggestion_type="summary",
        title="Mục tiêu Senior Developer",
        content="Kỹ sư phần mềm 5+ năm kinh nghiệm...",
        skills_list=["React", "Node.js", "Python"],
        sort_order=1,
        is_active=True,
    )


@pytest.fixture
def sample_candidate_cv(db, job_seeker_user, sample_template):
    """Create a sample CandidateCV for testing."""
    return CandidateCV.objects.create(
        user=job_seeker_user,
        template=sample_template,
        template_code=sample_template.code,
        title="CV Lập Trình Viên ReactJS",
        theme_config=sample_template.default_theme,
        cv_data={
            "personalInfo": {
                "fullName": "Test JobSeeker",
                "email": "jobseeker@test.com",
                "title": "Senior Frontend Developer",
            },
            "experiences": [],
            "educations": [],
            "skills": [],
        },
        is_main_cv=True,
        is_public=True,
    )


@pytest.fixture
def other_job_seeker(db):
    """Create a second job seeker to test authorization isolation."""
    return User.objects.create_user_with_role_name(
        email="other_jobseeker@test.com",
        full_name="Other JobSeeker",
        role_name=var_sys.JOB_SEEKER,
        password="testpass123",
        is_active=True,
        is_verify_email=True,
    )


# ==============================================================================
# Model Tests
# ==============================================================================

@pytest.mark.django_db
class TestCVBuilderModels:
    def test_cv_template_str_and_properties(self, sample_template):
        assert str(sample_template) == "Modern Navy (Đảo Phú Quốc) (modern-navy)"
        assert sample_template.category == "modern"
        assert sample_template.use_count == 10

    def test_candidate_cv_str_and_slug(self, sample_candidate_cv):
        assert "jobseeker@test.com" in str(sample_candidate_cv)
        assert "CV Lập Trình Viên ReactJS" in str(sample_candidate_cv)
        assert sample_candidate_cv.slug is not None
        assert len(sample_candidate_cv.slug) > 0

    def test_cv_suggestion_str(self, sample_suggestion):
        assert "Công nghệ thông tin" in str(sample_suggestion)
        assert "Mục tiêu Senior Developer" in str(sample_suggestion)


# ==============================================================================
# CVTemplate API Tests
# ==============================================================================

@pytest.mark.django_db
class TestCVTemplateAPI:
    def test_list_templates_public(self, api_client, sample_template):
        response = api_client.get("/api/v1/cv/templates/")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        results = data.get("data", {}).get("results", [])
        assert len(results) >= 1
        assert results[0]["code"] == "modern-navy"

    def test_filter_templates_by_category(self, api_client, sample_template):
        response = api_client.get("/api/v1/cv/templates/?category=modern")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        results = data.get("data", {}).get("results", [])
        assert all(t["category"] == "modern" for t in results)

    def test_get_template_detail_by_code(self, api_client, sample_template):
        initial_views = sample_template.view_count
        response = api_client.get(f"/api/v1/cv/templates/{sample_template.code}/")
        assert response.status_code == status.HTTP_200_OK
        data = response.json().get("data", {})
        assert data["code"] == "modern-navy"
        assert data["default_theme"]["primaryColor"] == "#1e3a8a"

        # Verify view count increment
        sample_template.refresh_from_db()
        assert sample_template.view_count == initial_views + 1


# ==============================================================================
# CandidateCV API Tests (CRUD, Auto-Save, Duplicate, Set-Main)
# ==============================================================================

@pytest.mark.django_db
class TestCandidateCVAPI:
    def test_unauthenticated_cannot_access_candidate_cvs(self, api_client):
        response = api_client.get("/api/v1/cv/candidate-cvs/")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_list_candidate_cvs_authenticated(self, api_client, job_seeker_user, sample_candidate_cv):
        api_client.force_authenticate(user=job_seeker_user)
        response = api_client.get("/api/v1/cv/candidate-cvs/")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        results = data.get("data", {}).get("results", [])
        assert len(results) == 1
        assert results[0]["id"] == sample_candidate_cv.id
        assert results[0]["title"] == "CV Lập Trình Viên ReactJS"

    def test_user_cannot_see_other_users_cvs(self, api_client, other_job_seeker, sample_candidate_cv):
        api_client.force_authenticate(user=other_job_seeker)
        response = api_client.get("/api/v1/cv/candidate-cvs/")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        results = data.get("data", {}).get("results", [])
        assert len(results) == 0

    def test_create_candidate_cv_increments_template_use_count(self, api_client, job_seeker_user, sample_template):
        api_client.force_authenticate(user=job_seeker_user)
        initial_use_count = sample_template.use_count

        payload = {
            "template": sample_template.id,
            "template_code": sample_template.code,
            "title": "CV Fullstack Developer Mới",
            "theme_config": sample_template.default_theme,
            "cv_data": {
                "personalInfo": {"fullName": "Nguyen Van An", "email": "test@test.com"},
                "experiences": [],
            },
            "is_main_cv": True,
            "is_public": True,
        }

        response = api_client.post("/api/v1/cv/candidate-cvs/", payload, format="json")
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json().get("data", {})
        assert data["title"] == "CV Fullstack Developer Mới"
        assert data["slug"] is not None

        # Check template use_count increment
        sample_template.refresh_from_db()
        assert sample_template.use_count == initial_use_count + 1

    def test_update_candidate_cv_autosave(self, api_client, job_seeker_user, sample_candidate_cv):
        api_client.force_authenticate(user=job_seeker_user)
        update_payload = {
            "title": "CV Senior Lead ReactJS (Updated)",
            "theme_config": {"primaryColor": "#059669"},
            "cv_data": {
                "personalInfo": {"fullName": "Test JobSeeker", "title": "Lead Engineer"},
                "experiences": [{"company": "Tech Corp", "position": "Lead Developer"}],
            },
        }

        response = api_client.patch(
            f"/api/v1/cv/candidate-cvs/{sample_candidate_cv.id}/",
            update_payload,
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json().get("data", {})
        assert data["title"] == "CV Senior Lead ReactJS (Updated)"
        assert data["theme_config"]["primaryColor"] == "#059669"

        sample_candidate_cv.refresh_from_db()
        assert sample_candidate_cv.title == "CV Senior Lead ReactJS (Updated)"

    def test_duplicate_candidate_cv(self, api_client, job_seeker_user, sample_candidate_cv):
        api_client.force_authenticate(user=job_seeker_user)
        response = api_client.post(f"/api/v1/cv/candidate-cvs/{sample_candidate_cv.id}/duplicate/")
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json().get("data", {})
        assert "(Bản sao)" in data["title"]
        assert data["id"] != sample_candidate_cv.id
        assert data["is_main_cv"] is False

    def test_set_main_candidate_cv(self, api_client, job_seeker_user, sample_candidate_cv, sample_template):
        api_client.force_authenticate(user=job_seeker_user)

        # Create a second CV
        second_cv = CandidateCV.objects.create(
            user=job_seeker_user,
            template=sample_template,
            template_code=sample_template.code,
            title="CV Thứ Hai",
            theme_config={},
            cv_data={},
            is_main_cv=False,
        )

        assert sample_candidate_cv.is_main_cv is True

        # Set second_cv as main
        response = api_client.post(f"/api/v1/cv/candidate-cvs/{second_cv.id}/set-main/")
        assert response.status_code == status.HTTP_200_OK

        sample_candidate_cv.refresh_from_db()
        second_cv.refresh_from_db()

        assert second_cv.is_main_cv is True
        assert sample_candidate_cv.is_main_cv is False

    def test_delete_candidate_cv(self, api_client, job_seeker_user, sample_candidate_cv):
        api_client.force_authenticate(user=job_seeker_user)
        response = api_client.delete(f"/api/v1/cv/candidate-cvs/{sample_candidate_cv.id}/")
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert CandidateCV.objects.filter(id=sample_candidate_cv.id).count() == 0

    def test_ai_review_candidate_cv(self, api_client, job_seeker_user, sample_candidate_cv):
        api_client.force_authenticate(user=job_seeker_user)
        response = api_client.post(f"/api/v1/cv/candidate-cvs/{sample_candidate_cv.id}/ai-review/")
        assert response.status_code == status.HTTP_200_OK
        data = response.json().get("data", {})
        assert "score" in data
        assert data["score"] > 0
        assert "grade" in data
        assert "breakdown" in data
        assert "strengths" in data
        assert "suggestions" in data

        sample_candidate_cv.refresh_from_db()
        assert sample_candidate_cv.ai_score is not None
        assert sample_candidate_cv.ai_score == data["score"]


# ==============================================================================
# Public Web CV Tests
# ==============================================================================

@pytest.mark.django_db
class TestPublicCVAPI:
    def test_get_public_cv_by_slug(self, api_client, sample_candidate_cv):
        initial_views = sample_candidate_cv.views_count
        response = api_client.get(f"/api/v1/cv/public/{sample_candidate_cv.slug}/")
        assert response.status_code == status.HTTP_200_OK
        data = response.json().get("data", {})
        assert data["title"] == sample_candidate_cv.title
        assert data["candidate_name"] == "Test JobSeeker"

        sample_candidate_cv.refresh_from_db()
        assert sample_candidate_cv.views_count == initial_views + 1

    def test_private_cv_returns_404(self, api_client, sample_candidate_cv):
        sample_candidate_cv.is_public = False
        sample_candidate_cv.save()

        response = api_client.get(f"/api/v1/cv/public/{sample_candidate_cv.slug}/")
        assert response.status_code == status.HTTP_404_NOT_FOUND


# ==============================================================================
# CVSuggestions API Tests
# ==============================================================================

@pytest.mark.django_db
class TestCVSuggestionsAPI:
    def test_list_suggestions(self, api_client, sample_suggestion):
        response = api_client.get("/api/v1/cv/suggestions/")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        results = data.get("data", {}).get("results", [])
        assert len(results) >= 1
        assert results[0]["industry"] == "IT"

    def test_filter_suggestions_by_industry(self, api_client, sample_suggestion):
        response = api_client.get("/api/v1/cv/suggestions/?industry=IT")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        results = data.get("data", {}).get("results", [])
        assert all(s["industry"] == "IT" for s in results)
