import os
import django
import datetime
from django.utils import timezone

# Setup Django 
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myjob_api.settings')
django.setup()

from authentication.models import User
from info.models import JobSeekerProfile, Resume, Company
from common.models import Location, City, District, Career
from job.models import JobPost, JobPostActivity
from interview.models import Question, QuestionGroup, InterviewSession
from oauth2_provider.models import Application
from configs import variable_system as var_sys

print("Removing ALL users...")
User.objects.all().delete()
print("All users deleted.")

print("Removing common data (Career, City, Location, etc.)...")
Career.objects.all().delete()
City.objects.all().delete()
District.objects.all().delete()
Location.objects.all().delete()

# -----------------
# 1. COMMON DATA
# -----------------
print("Creating common data...")
city = City.objects.create(name="Hồ Chí Minh")
district = District.objects.create(name="Quận 1", city=city)

loc = Location.objects.create(
    city=city,
    district=district,
    address="1 Lê Duẩn, Bến Nghé, Quận 1",
    lat=10.781,
    lng=106.700
)

career = Career.objects.create(name="Công nghệ thông tin (IT)")


# -----------------
# 2. USERS
# -----------------
print("Creating Administrative User...")
admin_user = User.objects.create_superuser(
    email="admin@myjob.com",
    full_name="System Admin",
    password="Password123!"
)

print("Creating Employer User...")
employer_email = "employer@myjob.com"
emp_user = User.objects.create_user_with_role_name(
    email=employer_email,
    full_name="Great Employer",
    password="Password123!",
    role_name=var_sys.EMPLOYER
)
emp_user.has_company = True
emp_user.is_active = True
emp_user.is_verify_email = True
emp_user.save()

company = Company.objects.create(
    user=emp_user,
    company_name="Tech Solutions Corp",
    company_email=employer_email,
    company_phone="0987654321",
    tax_code="0101010101",
    employee_size=100,
    location=loc
)

print("Creating Job Seeker User...")
js_email = "candidate@myjob.com"
js_user = User.objects.create_user_with_role_name(
    email=js_email,
    full_name="Active Candidate",
    password="Password123!",
    role_name=var_sys.JOB_SEEKER
)
js_user.is_active = True
js_user.is_verify_email = True
js_user.save()

profile = JobSeekerProfile.objects.create(user=js_user, phone="0123456789")
resume = Resume.objects.create(job_seeker_profile=profile, user=js_user, type=var_sys.CV_WEBSITE, title="Frontend Developer")


# -----------------
# 3. JOB POST & ACTIVITY
# -----------------
print("Creating Job Post...")
job_post = JobPost.objects.create(
    job_name="Senior Frontend Developer (React)",
    deadline=timezone.now().date() + datetime.timedelta(days=30),
    quantity=2,
    job_description="<p>Làm việc với ReactJS, NextJS</p>",
    job_requirement="<p>Ít nhất 3 năm kinh nghiệm</p>",
    benefits_enjoyed="<p>Lương thưởng hấp dẫn, hybrid</p>",
    position=4, # Chuyên gia
    type_of_workplace=2, # Hybrid
    experience=5, # 3 năm
    academic_level=2, # Đại học
    job_type=1, # Toàn thời gian cố định
    salary_min=1500,
    salary_max=3000,
    status=3, # Đã duyệt
    contact_person_name="HR Manager",
    contact_person_phone="0987654321",
    contact_person_email="hr@techsolutions.com",
    career=career,
    location=loc,
    user=emp_user,
    company=company
)

print("Candidate applying for job...")
application = JobPostActivity.objects.create(
    job_post=job_post,
    user=js_user,
    resume=resume,
    full_name=js_user.full_name,
    email=js_user.email,
    phone="0123456789",
    status=4, # Đã phỏng vấn
)


# -----------------
# 4. INTERVIEW CONFIGS
# -----------------
print("Creating Question Bank and Interview...")
q1 = Question.objects.create(
    text="Trình bày vòng đời của một component trong React từ khi mount đến unmount.",
    difficulty=2,
    career=career,
    author=emp_user,
    company=company
)
q2 = Question.objects.create(
    text="Bạn giải quyết conflict nội bộ với đồng nghiệp như thế nào khi deadline đang cận kề?",
    difficulty=2,
    career=career,
    author=emp_user,
    company=company
)

q_group = QuestionGroup.objects.create(
    name="Frontend Developer Interview",
    description="Bộ câu hỏi phỏng vấn chuẩn cho Frontend",
    author=emp_user,
    company=company
)
q_group.questions.add(q1, q2)

interview = InterviewSession.objects.create(
    candidate=js_user,
    job_post=job_post,
    created_by=emp_user,
    question_group=q_group,
    status='scheduled',
    type='mixed',
    scheduled_at=timezone.now() + datetime.timedelta(days=2),
    duration=1800 # 30 mins
)
interview.questions.add(q1, q2)


# -----------------
# 5. OAUTH2 APP
# -----------------
Application.objects.create(
    user=admin_user,
    client_type=Application.CLIENT_CONFIDENTIAL,
    authorization_grant_type=Application.GRANT_PASSWORD,
    name='myjob_web_app',
    client_id=os.environ.get('CLIENT_ID', 'qDZFCwY3yuN5mVNHqVVz8cAcREy5iQuGOTtQthjS'),
    client_secret=os.environ.get('CLIENT_SECRET', 'myjob_secret_client_key_2024')
)
print("- OAuth2 Application created.")

print("Done. Full seed complete.")
