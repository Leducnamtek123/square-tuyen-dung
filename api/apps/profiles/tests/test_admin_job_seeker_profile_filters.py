import pytest
from rest_framework.test import APIClient

from apps.accounts.models import User
from apps.locations.models import City, Location
from apps.profiles.models import JobSeekerProfile, Resume
from apps.common.models import Career
from shared.configs import variable_system as var_sys


@pytest.mark.django_db
def test_admin_job_seeker_profile_list_filters_by_resume_and_profile_fields(admin_user, job_seeker_user, job_seeker_profile, resume, city, career):
    job_seeker_profile.gender = 'M'
    job_seeker_profile.marital_status = var_sys.MaritalStatus.SINGLE
    job_seeker_profile.save(update_fields=['gender', 'marital_status', 'update_at'])

    resume.position = 4
    resume.experience = 3
    resume.academic_level = 2
    resume.type_of_workplace = 1
    resume.job_type = 1
    resume.save(update_fields=['position', 'experience', 'academic_level', 'type_of_workplace', 'job_type', 'update_at'])

    Resume.objects.create(
        title='Backup Backend Developer',
        description='A second matching resume for the same candidate',
        salary_min=14000000,
        salary_max=26000000,
        experience=3,
        position=4,
        academic_level=2,
        type_of_workplace=1,
        job_type=1,
        is_active=True,
        user=job_seeker_user,
        job_seeker_profile=job_seeker_profile,
        career=career,
        city=city,
    )

    other_city = City.objects.create(name='Ha Noi', code='HN-ADMIN-PROFILE-FILTER')
    other_location = Location.objects.create(city=other_city, address='Different location')
    other_career = Career.objects.create(name='Design')
    other_user = User.objects.create_user_with_role_name(
        email='filter-other@test.com',
        full_name='Other Candidate',
        role_name=var_sys.JOB_SEEKER,
        password='testpass123',
        is_active=True,
        is_verify_email=True,
    )
    other_profile = JobSeekerProfile.objects.create(
        user=other_user,
        phone='0900000002',
        location=other_location,
        gender='F',
        marital_status=var_sys.MaritalStatus.MARRIED,
    )
    Resume.objects.create(
        title='Different Candidate Resume',
        description='Should not match the admin filters',
        salary_min=10000000,
        salary_max=15000000,
        experience=1,
        position=1,
        academic_level=1,
        type_of_workplace=2,
        job_type=2,
        is_active=True,
        user=other_user,
        job_seeker_profile=other_profile,
        career=other_career,
        city=other_city,
    )

    client = APIClient()
    client.force_authenticate(user=admin_user)
    response = client.get(
        '/api/v1/info/web/admin/job-seeker-profiles/',
        {
            'cityId': city.id,
            'careerId': career.id,
            'experienceId': 3,
            'positionId': 4,
            'academicLevelId': 2,
            'typeOfWorkplaceId': 1,
            'jobTypeId': 1,
            'genderId': 'M',
            'maritalStatusId': var_sys.MaritalStatus.SINGLE,
        },
    )

    assert response.status_code == 200
    payload = response.json()
    results = payload.get('data', payload).get('results', payload.get('results', []))
    assert [item['id'] for item in results] == [job_seeker_profile.id]
