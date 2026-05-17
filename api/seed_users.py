import datetime
import os

import django
from django.utils import timezone

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from apps.accounts.models import User
from apps.jobs.models import JobPost, JobPostActivity
from apps.interviews.models import InterviewSession, Question, QuestionGroup
from apps.locations.models import City, District, Location
from apps.profiles.models import Company, JobSeekerProfile, Resume
from common.models import Career
from oauth2_provider.models import Application
from shared.configs import variable_system as var_sys


def required_env(name):
    value = os.environ.get(name)
    if not value:
        raise RuntimeError(f"{name} is required before creating OAuth2 application seed data.")
    return value


print("Creating common data...")
city, _ = City.objects.get_or_create(name="Hồ Chí Minh")
district, _ = District.objects.get_or_create(name="Quận 1", city=city)
loc, _ = Location.objects.get_or_create(
    city=city,
    district=district,
    address="1 Lê Duẩn, Bến Nghé, Quận 1",
    defaults={"lat": 10.781, "lng": 106.700},
)

career, _ = Career.objects.get_or_create(name="Kiến trúc")

print("Creating Administrative User...")
admin_user, _ = User.objects.get_or_create(
    email="admin@project.com",
    defaults={
        "full_name": "System Admin",
        "role_name": var_sys.ADMIN,
        "is_active": True,
        "is_verify_email": True,
        "is_staff": True,
        "is_superuser": True,
    },
)
admin_user.set_password("Password123!")
admin_user.save()

print("Creating Employer User...")
employer_email = "ceohub.hostmaster@gmail.com"
emp_user, _ = User.objects.get_or_create(
    email=employer_email,
    defaults={
        "full_name": "Square Group HR",
        "role_name": var_sys.EMPLOYER,
        "is_active": True,
        "is_verify_email": True,
    },
)
emp_user.set_password("Password123!")
emp_user.save()
emp_user.has_company = True
emp_user.is_active = True
emp_user.is_verify_email = True
emp_user.save()

company, _ = Company.objects.update_or_create(
    user=emp_user,
    defaults={
        "company_name": "Square Construction & Design",
        "company_email": employer_email,
        "company_phone": "0901234567",
        "tax_code": "0312345678",
        "employee_size": 100,
        "location": loc,
        "field_operation": "Bất động sản, Xây dựng, Nội thất, Kiến trúc",
    },
)

print("Creating Job Seeker User...")
js_email = "candidate@project.com"
js_user, _ = User.objects.get_or_create(
    email=js_email,
    defaults={
        "full_name": "Active Candidate",
        "role_name": var_sys.JOB_SEEKER,
        "is_active": True,
        "is_verify_email": True,
    },
)
js_user.set_password("Password123!")
js_user.save()
js_user.is_active = True
js_user.is_verify_email = True
js_user.save()

profile, _ = JobSeekerProfile.objects.get_or_create(user=js_user, defaults={"phone": "0123456789"})
resume, _ = Resume.objects.get_or_create(
    job_seeker_profile=profile,
    user=js_user,
    type=var_sys.CV_WEBSITE,
    title="Architect"
)

print("Creating Job Post...")
job_post, _ = JobPost.objects.get_or_create(
    job_name="Kiến trúc sư",
    defaults={
        "deadline": timezone.now().date() + datetime.timedelta(days=30),
        "quantity": 2,
        "job_description": "<p>Làm việc với các dự án nhà ở, thương mại và nội thất.</p>",
        "job_requirement": "<p>Tối thiểu 3 năm kinh nghiệm.</p>",
        "benefits_enjoyed": "<p>Lương thưởng hấp dẫn, môi trường chuyên nghiệp.</p>",
        "position": 4,
        "type_of_workplace": 2,
        "experience": 5,
        "academic_level": 2,
        "job_type": 1,
        "salary_min": 15000000,
        "salary_max": 30000000,
        "status": 3,
        "contact_person_name": "HR Manager",
        "contact_person_phone": "0901234567",
        "contact_person_email": "hr@square.vn",
        "career": career,
        "location": loc,
        "user": emp_user,
        "company": company,
    },
)

print("Candidate applying for job...")
JobPostActivity.objects.get_or_create(
    job_post=job_post,
    user=js_user,
    defaults={
        "resume": resume,
        "full_name": js_user.full_name,
        "email": js_user.email,
        "phone": "0123456789",
        "status": 4,
    },
)

print("Creating Question Bank and Interview...")
q1, _ = Question.objects.get_or_create(
    text="Trình bày quy trình triển khai concept kiến trúc đến hồ sơ kỹ thuật.",
    defaults={
        "difficulty": 2,
        "career": career,
        "author": emp_user,
        "company": company,
    },
)
q2, _ = Question.objects.get_or_create(
    text="Bạn xử lý thế nào khi phương án thiết kế cần điều chỉnh theo hiện trạng công trình?",
    defaults={
        "difficulty": 2,
        "career": career,
        "author": emp_user,
        "company": company,
    },
)

q_group, _ = QuestionGroup.objects.get_or_create(
    name="Interview kiến trúc",
    defaults={
        "description": "Bộ câu hỏi phỏng vấn chuẩn cho ngành kiến trúc",
        "author": emp_user,
        "company": company,
    },
)
q_group.questions.add(q1, q2)

interview, _ = InterviewSession.objects.get_or_create(
    candidate=js_user,
    job_post=job_post,
    defaults={
        "created_by": emp_user,
        "question_group": q_group,
        "status": "scheduled",
        "type": "mixed",
        "scheduled_at": timezone.now() + datetime.timedelta(days=2),
        "duration": 1800,
    },
)
interview.questions.add(q1, q2)

print("Creating OAuth2 Application...")
Application.objects.create(
    user=admin_user,
    client_type=Application.CLIENT_CONFIDENTIAL,
    authorization_grant_type=Application.GRANT_PASSWORD,
    name='project_web_app',
    client_id=required_env('CLIENT_ID'),
    client_secret=required_env('CLIENT_SECRET')
)
print("Done. Square-only seed complete.")
