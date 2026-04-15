"""
Shared test fixtures for the entire project.
Usage: pytest automatically discovers conftest.py and makes fixtures available.
"""
import pytest
from django.utils import timezone
from datetime import timedelta


@pytest.fixture(autouse=True)
def disable_elasticsearch(monkeypatch):
    """Disable Elasticsearch signals during tests to avoid connection errors."""
    try:
        from django_elasticsearch_dsl.registries import registry
        monkeypatch.setattr(registry, 'update', lambda *a, **kw: None)
        monkeypatch.setattr(registry, 'delete', lambda *a, **kw: None)
    except ImportError:
        pass


@pytest.fixture
def job_seeker_user(db):
    """Create a job seeker user for testing."""
    from apps.accounts.models import User
    from shared.configs import variable_system as var_sys
    return User.objects.create_user_with_role_name(
        email='jobseeker@test.com',
        full_name='Test JobSeeker',
        role_name=var_sys.JOB_SEEKER,
        password='testpass123',
        is_active=True,
        is_verify_email=True,
    )


@pytest.fixture
def employer_user(db):
    """Create an employer user for testing."""
    from apps.accounts.models import User
    from shared.configs import variable_system as var_sys
    return User.objects.create_user_with_role_name(
        email='employer@test.com',
        full_name='Test Employer',
        role_name=var_sys.EMPLOYER,
        password='testpass123',
        is_active=True,
        is_verify_email=True,
        has_company=True,
    )


@pytest.fixture
def admin_user(db):
    """Create an admin user for testing."""
    from apps.accounts.models import User
    from shared.configs import variable_system as var_sys
    return User.objects.create_user_with_role_name(
        email='admin@test.com',
        full_name='Test Admin',
        role_name=var_sys.ADMIN,
        password='testpass123',
        is_active=True,
        is_verify_email=True,
        is_staff=True,
    )


@pytest.fixture
def career(db):
    """Create a test career/industry."""
    from common.models import Career
    return Career.objects.create(name='IT - Phần mềm')


@pytest.fixture
def city(db):
    """Create a test city."""
    from apps.locations.models import City
    return City.objects.create(name='Hồ Chí Minh', code='HCM')


@pytest.fixture
def location(db, city):
    """Create a test location."""
    from apps.locations.models import Location
    return Location.objects.create(
        city=city,
        address='123 Nguyễn Huệ'
    )


@pytest.fixture
def company(db, employer_user, location):
    """Create a test company."""
    from apps.profiles.models import Company
    return Company.objects.create(
        company_name='Test Company',
        company_email='company@test.com',
        company_phone='0901234567',
        tax_code='1234567890',
        user=employer_user,
        location=location,
    )


@pytest.fixture
def job_seeker_profile(db, job_seeker_user, location):
    """Create a job seeker profile."""
    from apps.profiles.models import JobSeekerProfile
    loc_obj = location
    return JobSeekerProfile.objects.create(
        user=job_seeker_user,
        phone='0909876543',
        location=loc_obj,
    )


@pytest.fixture
def resume(db, job_seeker_user, job_seeker_profile, career, city):
    """Create a test resume."""
    from apps.profiles.models import Resume
    return Resume.objects.create(
        title='Backend Developer',
        description='Experienced Python developer',
        salary_min=15000000,
        salary_max=25000000,
        experience=3,
        is_active=True,
        user=job_seeker_user,
        job_seeker_profile=job_seeker_profile,
        career=career,
        city=city,
    )


@pytest.fixture
def job_post(db, employer_user, company, career, location):
    """Create a test job post."""
    from apps.jobs.models import JobPost
    from shared.configs import variable_system as var_sys
    return JobPost.objects.create(
        job_name='Senior Python Developer',
        deadline=timezone.now().date() + timedelta(days=30),
        quantity=2,
        job_description='<p>We need a Python developer</p>',
        position=4,  # Specialist
        type_of_workplace=1,  # Office
        experience=2,
        academic_level=2,  # University
        job_type=1,  # Full-time
        salary_min=20000000,
        salary_max=35000000,
        contact_person_name='HR Manager',
        contact_person_phone='0901234567',
        contact_person_email='hr@test.com',
        status=var_sys.JobPostStatus.APPROVED,
        user=employer_user,
        company=company,
        career=career,
        location=location,
    )
