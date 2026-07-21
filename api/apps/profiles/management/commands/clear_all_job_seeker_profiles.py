from django.core.management.base import BaseCommand
from django.db import transaction

from apps.profiles.models import JobSeekerProfile, Resume


class Command(BaseCommand):
    help = "Clear all job seeker profiles and their resumes so the admin candidate list becomes empty."

    @transaction.atomic
    def handle(self, *args, **options):
        resume_count = Resume.objects.count()
        profile_count = JobSeekerProfile.objects.count()

        deleted_profiles, _ = JobSeekerProfile.objects.all().delete()

        self.stdout.write(
            self.style.SUCCESS(
                f"Deleted {deleted_profiles} records. "
                f"Profiles before delete: {profile_count}, resumes before delete: {resume_count}."
            )
        )
