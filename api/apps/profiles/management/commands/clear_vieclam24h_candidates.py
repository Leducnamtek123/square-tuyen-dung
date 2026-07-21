from django.core.management.base import BaseCommand
from django.db import transaction

from apps.accounts.models import User
from apps.profiles.models import JobSeekerProfile, Resume
from shared.configs import variable_system as var_sys


class Command(BaseCommand):
    help = "Clear Vieclam24h imported candidates, resumes, and orphaned job seeker accounts."

    def add_arguments(self, parser):
        parser.add_argument(
            "--source-platform",
            default="vieclam24h",
            help="Source platform to clear. Defaults to vieclam24h.",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        source_platform = (options.get("source_platform") or "vieclam24h").strip()
        resumes = Resume.objects.filter(source_platform=source_platform)
        profile_ids = list(resumes.values_list("job_seeker_profile_id", flat=True).distinct())
        user_ids = list(resumes.values_list("user_id", flat=True).distinct())

        deleted_count, deleted_breakdown = resumes.delete()

        orphan_profiles = JobSeekerProfile.objects.filter(id__in=profile_ids, resumes__isnull=True)
        orphan_profile_count = orphan_profiles.count()
        orphan_profile_user_ids = list(orphan_profiles.values_list("user_id", flat=True))
        orphan_profiles.delete()

        orphan_users = User.objects.filter(
            id__in=user_ids + orphan_profile_user_ids,
            role_name=var_sys.JOB_SEEKER,
            resumes__isnull=True,
            job_seeker_profile__isnull=True,
        ).distinct()
        orphan_user_count = orphan_users.count()
        orphan_users.delete()

        self.stdout.write(
            self.style.SUCCESS(
                f"Cleared {deleted_count} records from source_platform={source_platform}, "
                f"removed {orphan_profile_count} orphan profiles and {orphan_user_count} orphan users."
            )
        )
