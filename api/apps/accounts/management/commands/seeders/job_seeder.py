import logging
from datetime import date, timedelta

from faker import Faker

from apps.accounts.models import User
from apps.jobs.models import JobPost
from apps.locations.models import City
from apps.profiles.models import Company, Resume, JobSeekerProfile
from shared.configs import variable_system as var_sys
from common.models import Career

logger = logging.getLogger(__name__)

fake = Faker("vi_VN")


def seed_jobs():
    """Seed Square-only job posts and resumes."""
    logger.info("Start seeding Square jobs and resumes...")

    company = Company.objects.filter(company_name__icontains="Square").order_by("id").first()
    careers = Career.objects.filter(
        name__in=["Bất động sản", "Xây dựng", "Nội thất", "Kiến trúc"]
    ).order_by("name")
    cities = City.objects.all()
    candidates = User.objects.filter(role_name="JOB_SEEKER")

    if not company or not careers.exists():
        logger.error("Missing Square company or career seed data.")
        return

    JobPost.objects.all().delete()

    jobs_data = [
        {
            "career_name": "Xây dựng",
            "job_name": "[TUYỂN GẤP] Kỹ sư Giám sát công trình (GS XD - Site Supervisor)",
            "quantity": 3,
            "position": 3,
            "experience": 2,
            "salary_min": 16000000,
            "salary_max": 30000000,
            "type_of_workplace": 1,
            "is_hot": True,
            "is_urgent": True,
            "deadline_days": 14,
            "job_description": (
                "Giám sát thi công, kiểm tra tiến độ và chất lượng công trình, phối hợp "
                "nhà thầu để đảm bảo dự án vận hành đúng kế hoạch."
            ),
            "job_requirement": (
                "Nắm rõ quy trình thi công, có khả năng xử lý hiện trường và chịu được "
                "áp lực tiến độ."
            ),
            "benefits_enjoyed": (
                "Phụ cấp công trình, thưởng theo tiến độ và tham gia các dự án quy mô lớn."
            ),
        },
        {
            "career_name": "Xây dựng",
            "job_name": "[TUYỂN GẤP] Kỹ sư QA/QC Công trình (Quality Assurance / Quality Control)",
            "quantity": 3,
            "position": 4,
            "experience": 2,
            "salary_min": 16000000,
            "salary_max": 24000000,
            "type_of_workplace": 1,
            "is_hot": True,
            "is_urgent": True,
            "deadline_days": 18,
            "job_description": (
                "Kiểm soát chất lượng thi công, vật liệu đầu vào, lập hồ sơ nghiệm thu "
                "và quy trình QA/QC tại dự án."
            ),
            "job_requirement": (
                "Tốt nghiệp Kỹ sư Xây dựng/Cơ điện, 2-4 năm kinh nghiệm làm QA/QC."
            ),
            "benefits_enjoyed": (
                "Lương 16 - 24 triệu, thưởng theo tiến độ dự án, chế độ bảo hiểm đầy đủ."
            ),
        },
        {
            "career_name": "Kiến trúc",
            "job_name": "Kiến trúc sư triển khai",
            "quantity": 2,
            "position": 4,
            "experience": 3,
            "salary_min": 18000000,
            "salary_max": 32000000,
            "type_of_workplace": 1,
            "is_hot": False,
            "is_urgent": False,
            "deadline_days": 25,
            "job_description": (
                "Phụ trách triển khai hồ sơ bản vẽ, phối hợp thiết kế và hiện trường cho "
                "các dự án nhà ở, văn phòng và thương mại của Square."
            ),
            "job_requirement": (
                "Có kinh nghiệm triển khai hồ sơ kỹ thuật, đọc hiểu bản vẽ kiến trúc "
                "và phối hợp tốt với các bộ môn liên quan."
            ),
            "benefits_enjoyed": (
                "Lương cạnh tranh, tham gia trực tiếp các dự án thực tế và lộ trình "
                "phát triển rõ ràng."
            ),
        },
        {
            "career_name": "Nội thất",
            "job_name": "Thiết kế nội thất",
            "quantity": 2,
            "position": 4,
            "experience": 2,
            "salary_min": 15000000,
            "salary_max": 28000000,
            "type_of_workplace": 2,
            "is_hot": False,
            "is_urgent": False,
            "deadline_days": 30,
            "job_description": (
                "Thiết kế concept và triển khai bản vẽ nội thất cho căn hộ, nhà phố "
                "và không gian thương mại."
            ),
            "job_requirement": (
                "Thành thạo AutoCAD, SketchUp hoặc 3Ds Max, có gu thẩm mỹ tốt và ưu tiên "
                "ứng viên có portfolio."
            ),
            "benefits_enjoyed": (
                "Môi trường sáng tạo, cơ hội làm dự án đa dạng và đồng hành cùng đội ngũ "
                "thiết kế giàu kinh nghiệm."
            ),
        },
        {
            "career_name": "Bất động sản",
            "job_name": "Chuyên viên phát triển dự án",
            "quantity": 2,
            "position": 4,
            "experience": 3,
            "salary_min": 20000000,
            "salary_max": 36000000,
            "type_of_workplace": 1,
            "is_hot": False,
            "is_urgent": False,
            "deadline_days": 45,
            "job_description": (
                "Theo dõi danh mục dự án, phối hợp với các phòng ban để đảm bảo tiến độ "
                "và chất lượng sản phẩm đầu ra."
            ),
            "job_requirement": (
                "Có kinh nghiệm làm việc trong môi trường dự án, tư duy hệ thống và khả "
                "năng giao tiếp tốt."
            ),
            "benefits_enjoyed": (
                "Thưởng dự án rõ ràng, làm việc trực tiếp với các đầu việc chiến lược của công ty."
            ),
        },
    ]

    job_count = 0
    for item in jobs_data:
        career = careers.filter(name=item["career_name"]).first()
        if not career:
            career = careers.first()

        JobPost.objects.create(
            job_name=item["job_name"],
            company=company,
            user=company.user,
            career=career,
            location=company.location,
            deadline=date.today() + timedelta(days=item["deadline_days"]),
            quantity=item["quantity"],
            job_description=f"<p>{item['job_description']}</p>",
            job_requirement=f"<p>{item['job_requirement']}</p>",
            benefits_enjoyed=f"<p>{item['benefits_enjoyed']}</p>",
            salary_min=item["salary_min"],
            salary_max=item["salary_max"],
            position=item["position"],
            type_of_workplace=item["type_of_workplace"],
            experience=item["experience"],
            academic_level=2,
            job_type=1,
            status=var_sys.JobPostStatus.APPROVED,
            is_hot=item.get("is_hot", False),
            is_urgent=item.get("is_urgent", False),
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

    logger.info(
        f"Seeded {job_count} jobs and {resume_count} candidate resumes for Square demo data."
    )
