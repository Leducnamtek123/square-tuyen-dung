"""
Management command: seed_jobs
Replaces the root-level seed_jobs.py script.
Usage: python manage.py seed_jobs
"""
from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.accounts.models import User
from apps.profiles.models import Company
from common.models import Career
from apps.locations.models import Location
from apps.jobs.models import JobPost
from shared.configs import variable_system as var_sys


JOBS_DATA = [
    {"name": "Thu mua (Chuyên viên)", "qty": 1},
    {"name": "Giám sát (GS)", "qty": 4},
    {"name": "Chỉ huy trưởng (CHT)", "qty": 2},
    {"name": "Project Manager (PM)", "qty": 1},
    {"name": "QS (Quantity Surveyor)", "qty": 1},
    {"name": "Sales Admin", "qty": 1},
    {"name": "Diễn họa 2D / Thiết kế kỹ thuật", "qty": 2},
    {"name": "Admin C&C", "qty": 1},
    {"name": "Điều phối dự án", "qty": 1},
]


class Command(BaseCommand):
    help = 'Seed sample job posts for the first employer company'

    def handle(self, *args, **options):
        user = User.objects.filter(role_name=var_sys.EMPLOYER).first()
        if not user:
            user = User.objects.filter(is_superuser=True).first()

        company = Company.objects.filter(user=user).first() if user else Company.objects.first()
        career = Career.objects.first()
        location = Location.objects.first()

        if not user or not company:
            self.stderr.write(self.style.ERROR("Không tìm thấy User hoặc Company."))
            return

        deadline = timezone.now().date() + timedelta(days=60)
        description = '<p>Vị trí tuyển dụng mẫu cho dự án 2026.</p>'

        self.stdout.write(f"Tạo {len(JOBS_DATA)} tin tuyển dụng cho {company.company_name}...")

        for item in JOBS_DATA:
            job = JobPost.objects.create(
                job_name=f"[TUYỂN GẤP 2026] {item['name']}",
                quantity=item['qty'],
                deadline=deadline,
                job_description=description,
                position=5,  # Staff/Employee
                type_of_workplace=1,  # Office
                experience=3,  # 1 year
                academic_level=3,  # College
                job_type=1,  # Full-time
                salary_min=10000000,
                salary_max=30000000,
                status=var_sys.JobPostStatus.APPROVED,
                contact_person_name="HR",
                contact_person_phone="0989242042",
                contact_person_email="tuyendung@square.vn",
                career=career,
                location=location,
                user=user,
                company=company,
            )
            self.stdout.write(self.style.SUCCESS(f"  ✓ {job.job_name}"))

        self.stdout.write(self.style.SUCCESS("Hoàn tất!"))
