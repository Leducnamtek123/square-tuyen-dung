import logging
from datetime import date, timedelta

from faker import Faker

from apps.accounts.models import User
from apps.jobs.models import JobPost
from apps.locations.models import City
from apps.profiles.models import Company, Resume, JobSeekerProfile
from common.models import Career

logger = logging.getLogger(__name__)

fake = Faker("vi_VN")


def seed_jobs():
    """Seed Square-only job posts and resumes."""
    logger.info("Bắt đầu sinh dữ liệu tin tuyển dụng và CV...")

    company = Company.objects.filter(company_name__icontains="Square").order_by("id").first()
    careers = Career.objects.filter(
        name__in=["Bất động sản", "Xây dựng", "Nội thất", "Kiến trúc"]
    ).order_by("name")
    cities = City.objects.all()
    candidates = User.objects.filter(role_name="JOB_SEEKER")

    if not company or not careers.exists():
        logger.error("Lỗi: Cần chạy seed_accounts và seed_careers trước.")
        return

    JobPost.objects.all().delete()

    jobs_data = [
        {
            "career_name": "Bất động sản",
            "job_name": "Chuyên viên Kinh doanh Bất động sản",
            "quantity": 3,
            "position": 5,
            "experience": 2,
            "salary_min": 15000000,
            "salary_max": 30000000,
        },
        {
            "career_name": "Xây dựng",
            "job_name": "Kỹ sư Xây dựng / Giám sát công trình",
            "quantity": 2,
            "position": 5,
            "experience": 3,
            "salary_min": 18000000,
            "salary_max": 35000000,
        },
        {
            "career_name": "Nội thất",
            "job_name": "Thiết kế Nội thất",
            "quantity": 2,
            "position": 4,
            "experience": 2,
            "salary_min": 14000000,
            "salary_max": 28000000,
        },
        {
            "career_name": "Kiến trúc",
            "job_name": "Kiến trúc sư",
            "quantity": 2,
            "position": 4,
            "experience": 3,
            "salary_min": 18000000,
            "salary_max": 36000000,
        },
    ]

    job_count = 0
    for item in jobs_data:
        career = careers.filter(name=item["career_name"]).first()
        if not career:
            continue

        JobPost.objects.create(
            job_name=item["job_name"],
            company=company,
            user=company.user,
            career=career,
            location=company.location,
            deadline=date.today() + timedelta(days=45),
            quantity=item["quantity"],
            job_description=f"<p>{fake.text(max_nb_chars=300)}</p>",
            salary_min=item["salary_min"],
            salary_max=item["salary_max"],
            position=item["position"],
            type_of_workplace=1,
            experience=item["experience"],
            academic_level=2,
            job_type=1,
            status=3,
            contact_person_name=fake.name(),
            contact_person_phone=fake.phone_number(),
            contact_person_email=fake.company_email(),
        )
        job_count += 1

    resume_count = 0
    for candidate in candidates:
        profile = JobSeekerProfile.objects.filter(user=candidate).first()
        if profile:
            Resume.objects.create(
                user=candidate,
                job_seeker_profile=profile,
                title=f"CV {candidate.full_name} - {careers.first().name}",
                career=careers.first(),
                city=cities.first() if cities.exists() else None,
                salary_min=10000000,
                salary_max=20000000,
                position=5,
                experience=3,
                academic_level=2,
                type_of_workplace=1,
                is_active=True,
            )
            resume_count += 1

    logger.info(f"Thành công! Đã tạo {job_count} tin tuyển dụng và {resume_count} hồ sơ ứng viên.")
