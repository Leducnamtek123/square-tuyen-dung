from django.core.management.base import BaseCommand
from django.db import transaction
from django.db.models import Q

from apps.accounts.models import User
from apps.profiles.models import JobSeekerProfile, Resume
from shared.configs import variable_system as var_sys


class Command(BaseCommand):
    help = "Clear non-Vieclam24h candidate profiles and resumes while keeping Vieclam24h imported candidates."

    @transaction.atomic
    def handle(self, *args, **options):
        # 1. Identify non-Vieclam24h resumes
        non_v24h_resumes = Resume.objects.exclude(source_platform="vieclam24h")
        resume_count = non_v24h_resumes.count()

        profile_ids = list(non_v24h_resumes.values_list("job_seeker_profile_id", flat=True).distinct())
        user_ids = list(non_v24h_resumes.values_list("user_id", flat=True).distinct())

        deleted_resumes, _ = non_v24h_resumes.delete()

        # 2. Clean orphaned profiles that have no remaining resumes (and are not Vieclam24h)
        orphan_profiles = JobSeekerProfile.objects.filter(
            Q(id__in=profile_ids) | Q(resumes__isnull=True)
        ).exclude(user__resumes__source_platform="vieclam24h").distinct()
        
        orphan_profile_count = orphan_profiles.count()
        orphan_user_ids = list(orphan_profiles.values_list("user_id", flat=True))
        orphan_profiles.delete()

        # 3. Clean orphaned candidate users that have no remaining profiles/resumes and are JOB_SEEKER
        orphan_users = User.objects.filter(
            id__in=user_ids + orphan_user_ids,
            role_name=var_sys.JOB_SEEKER,
            resumes__isnull=True,
            job_seeker_profile__isnull=True,
        ).exclude(is_superuser=True, is_staff=True).distinct()

        orphan_user_count = orphan_users.count()
        orphan_users.delete()

        v24h_remaining = Resume.objects.filter(source_platform="vieclam24h").count()

        self.stdout.write(
            self.style.SUCCESS(
                f"Successfully cleaned non-Vieclam24h candidate data:\n"
                f"- Deleted {deleted_resumes} non-Vieclam24h resumes\n"
                f"- Deleted {orphan_profile_count} orphaned candidate profiles\n"
                f"- Deleted {orphan_user_count} orphaned candidate users\n"
                f"- Kept {v24h_remaining} Vieclam24h candidates intact!"
            )
        )
