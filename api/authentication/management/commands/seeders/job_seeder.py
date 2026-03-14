from faker import Faker
from job.models import JobPost
from info.models import Company, Resume, JobSeekerProfile
from authentication.models import User
from common.models import Career, City, Location
import random
from datetime import date, timedelta

fake = Faker('vi_VN')

def seed_jobs():
    """
    Seed job posts and resumes for the portal using Faker
    """
    print("Bắt đầu sinh dữ liệu tin tuyển dụng và CV...")
    
    # 1. Lấy context dữ liệu
    companies = Company.objects.all()
    careers = Career.objects.all()
    cities = City.objects.all()
    candidates = User.objects.filter(role_name='JOB_SEEKER')

    if not companies.exists() or not careers.exists():
        print("Lỗi: Cần chạy seed_accounts và seed_careers trước.")
        return

    # 2. Tạo tin tuyển dụng mẫu (Jobs)
    job_count = 0
    for company in companies:
        for _ in range(random.randint(2, 5)):
            career = random.choice(careers)
            job = JobPost.objects.create(
                job_name=f"Tuyển {career.name} {fake.job()}",
                company=company,
                user=company.user,
                career=career,
                location=company.location,
                deadline=date.today() + timedelta(days=random.randint(15, 60)),
                quantity=random.randint(1, 10),
                job_description=f"<p>{fake.text(max_nb_chars=500)}</p>",
                salary_min=random.randint(8, 20) * 1000000,
                salary_max=random.randint(25, 50) * 1000000,
                experience=random.randint(0, 5),
                academic_level=random.randint(1, 4),
                job_type=random.randint(1, 3),
                status=3 # Active
            )
            job_count += 1

    # 3. Tạo CV mẫu cho ứng viên
    resume_count = 0
    for candidate in candidates:
        profile = JobSeekerProfile.objects.filter(user=candidate).first()
        if profile:
            resume = Resume.objects.create(
                user=candidate,
                job_seeker_profile=profile,
                title=f"CV {candidate.full_name} - {random.choice(careers).name}",
                career=random.choice(careers),
                city=random.choice(cities) if cities.exists() else None,
                salary_min=10000000,
                salary_max=20000000,
                experience=random.randint(1, 10),
                is_active=True
            )
            resume_count += 1

    print(f"Thành công! Đã tạo {job_count} tin tuyển dụng và {resume_count} hồ sơ ứng viên.")
