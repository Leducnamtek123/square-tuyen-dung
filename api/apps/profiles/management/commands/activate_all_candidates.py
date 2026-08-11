from django.core.management.base import BaseCommand
from apps.profiles.models import Resume, JobSeekerProfile


class Command(BaseCommand):
    help = "Kích hoạt is_active=True cho toàn bộ CV và is_seeking_job=True cho toàn bộ hồ sơ ứng viên"

    def handle(self, *args, **options):
        resume_updated = Resume.objects.filter(is_active=False).update(is_active=True)
        profile_updated = JobSeekerProfile.objects.filter(is_seeking_job=False).update(is_seeking_job=True)

        total_resumes = Resume.objects.count()
        total_active_resumes = Resume.objects.filter(is_active=True).count()
        total_profiles = JobSeekerProfile.objects.count()
        total_seeking_profiles = JobSeekerProfile.objects.filter(is_seeking_job=True).count()

        self.stdout.write(
            self.style.SUCCESS(
                f"Đã kích hoạt {resume_updated} CV chưa active và {profile_updated} profile ứng viên.\n"
                f"Tổng số CV active: {total_active_resumes}/{total_resumes}\n"
                f"Tổng số profile bật nhận việc: {total_seeking_profiles}/{total_profiles}"
            )
        )
