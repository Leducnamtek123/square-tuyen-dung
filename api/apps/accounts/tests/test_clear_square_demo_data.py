import pytest
from django.core.management import call_command

from apps.accounts.models import User
from apps.profiles.models import Company, JobSeekerProfile, Resume
from shared.configs import variable_system as var_sys


@pytest.mark.django_db
def test_clear_square_demo_data_keeps_admin_and_keep_email_and_removes_demo_candidates(
    admin_user,
    location,
    career,
):
    keep_user = User.objects.create_user_with_role_name(
        email="ceohub.hostmaster@gmail.com",
        full_name="Square Group HR",
        role_name=var_sys.EMPLOYER,
        password="Squaretuyendung@2026",
        is_active=True,
        is_verify_email=True,
    )
    Company.objects.create(
        user=keep_user,
        company_name="Square Construction & Design",
        company_email="ceohub.hostmaster@gmail.com",
        company_phone="0901234567",
        tax_code="0312345678",
        location=location,
        field_operation="Bất động sản, Xây dựng, Nội thất, Kiến trúc",
    )

    demo_user = User.objects.create_user_with_role_name(
        email="candidate2@project.com",
        full_name="Active Candidate 2",
        role_name=var_sys.JOB_SEEKER,
        password="Password123!",
        is_active=True,
        is_verify_email=True,
    )
    demo_profile = JobSeekerProfile.objects.create(user=demo_user, phone="0123456782", location=location)
    Resume.objects.create(
        job_seeker_profile=demo_profile,
        user=demo_user,
        type=var_sys.CV_WEBSITE,
        title="Architect",
        career=career,
    )

    call_command("clear_square_demo_data", keep_email="ceohub.hostmaster@gmail.com")

    assert User.objects.filter(id=admin_user.id).exists()
    assert User.objects.filter(email="ceohub.hostmaster@gmail.com").exists()
    assert not User.objects.filter(email="candidate2@project.com").exists()
    assert not JobSeekerProfile.objects.filter(user__email="candidate2@project.com").exists()
    assert not Resume.objects.filter(user__email="candidate2@project.com").exists()
