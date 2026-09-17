from __future__ import annotations

import logging
from django.core.management.base import BaseCommand
from apps.profiles.models import Resume
from apps.profiles.services.pdf_extraction import extract_and_apply_pdf_info

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = "Đồng bộ thông tin thực tế từ file PDF CV vào hồ sơ ứng viên"

    def add_arguments(self, parser):
        parser.add_argument(
            "--resume-id",
            type=int,
            default=None,
            help="ID Resume cụ thể cần đồng bộ",
        )

    def handle(self, *args, **options):
        resume_id = options.get("resume_id")
        if resume_id:
            resumes = Resume.objects.filter(id=resume_id, file__isnull=False)
        else:
            resumes = Resume.objects.filter(file__isnull=False)

        count = 0
        total = resumes.count()
        self.stdout.write(f"Bắt đầu đồng bộ thông tin PDF cho {total} hồ sơ...")

        for r in resumes.select_related("user", "job_seeker_profile", "file"):
            try:
                info = extract_and_apply_pdf_info(r)
                if info:
                    count += 1
                    self.stdout.write(
                        self.style.SUCCESS(
                            f"Đã đồng bộ Resume {r.id}: email={info.get('email')} phone={info.get('phone')} title={info.get('title')}"
                        )
                    )
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f"Lỗi đồng bộ Resume {r.id}: {e}")
                )

        self.stdout.write(
            self.style.SUCCESS(
                f"Hoàn thành đồng bộ {count}/{total} hồ sơ từ file PDF CV thành công."
            )
        )
