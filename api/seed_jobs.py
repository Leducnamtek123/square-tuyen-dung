import os
from datetime import timedelta

import django
from django.utils import timezone

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from apps.jobs.models import JobPost
from apps.locations.models import Location
from apps.profiles.models import Company
from common.models import Career
from shared.configs import variable_system as var_sys


JOBS_DATA = [
    {"career": "Bất động sản", "name": "Chuyên viên Kinh doanh Bất động sản", "qty": 3},
    {"career": "Xây dựng", "name": "Kỹ sư Xây dựng / Giám sát công trình", "qty": 2},
    {"career": "Nội thất", "name": "Thiết kế Nội thất", "qty": 2},
    {"career": "Kiến trúc", "name": "Kiến trúc sư", "qty": 2},
]


company = Company.objects.filter(company_name__icontains="Square").order_by("id").first()
if not company:
    raise SystemExit("Không tìm thấy Square company. Hãy chạy seed_accounts trước.")

careers = Career.objects.filter(name__in=[item["career"] for item in JOBS_DATA])
location = company.location or Location.objects.first()
deadline = timezone.now().date() + timedelta(days=60)

JobPost.objects.all().delete()

for item in JOBS_DATA:
    career = careers.filter(name=item["career"]).first()
    if not career:
        continue

    JobPost.objects.create(
        job_name=f"[TUYỂN GẤP 2026] {item['name']}",
        quantity=item["qty"],
        deadline=deadline,
        job_description="<p>Vị trí tuyển dụng dành cho hệ sinh thái Square.</p>",
        position=5,
        type_of_workplace=1,
        experience=3,
        academic_level=3,
        job_type=1,
        salary_min=10000000,
        salary_max=30000000,
        status=var_sys.JobPostStatus.APPROVED,
        contact_person_name="HR",
        contact_person_phone="0901234567",
        contact_person_email="tuyendung@square.vn",
        career=career,
        location=location,
        user=company.user,
        company=company,
    )

print("Hoàn tất!")
