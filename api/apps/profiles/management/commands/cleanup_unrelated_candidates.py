from django.core.management.base import BaseCommand
from django.db import transaction
from django.db.models import Q

from apps.accounts.models import User
from apps.profiles.models import JobSeekerProfile, Resume
from apps.profiles.services.vieclam24h_import import _candidate_text, _match_career, DEFAULT_VIECLAM24H_CAREER_NAMES
from apps.common.models import Career
from shared.configs import variable_system as var_sys


class Command(BaseCommand):
    help = "Cleanup candidate profiles and resumes that do not match the target industries."

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Simulate the cleanup without deleting any data.",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        dry_run = options.get("dry_run", False)
        if dry_run:
            self.stdout.write(self.style.WARNING("Running in DRY-RUN mode. No changes will be saved to the database."))

        target_career_names = list(
            Career.objects.filter(is_hot=True).values_list("name", flat=True)
        ) or DEFAULT_VIECLAM24H_CAREER_NAMES

        all_resumes = Resume.objects.all().select_related("career", "user", "job_seeker_profile")
        unrelated_resume_ids = []
        unrelated_titles = []

        for resume in all_resumes:
            candidate_dict = {
                "title": resume.title or "",
                "skills_summary": resume.skills_summary or "",
                "description": resume.description or "",
                "full_name": resume.user.full_name if resume.user else "",
                "source_occupation_names": (resume.source_payload or {}).get("source_occupation_names") if isinstance(resume.source_payload, dict) else [],
            }

            matched_career = _match_career(candidate_dict, target_career_names)
            if matched_career is None:
                unrelated_resume_ids.append(resume.id)
                unrelated_titles.append(f"#{resume.id} [{resume.title or 'No Title'}] - {resume.user.full_name if resume.user else 'No User'}")

        self.stdout.write(f"Found {len(unrelated_resume_ids)} resumes that do not match target industries:")
        for sample in unrelated_titles[:15]:
            self.stdout.write(f"  - {sample}")
        if len(unrelated_titles) > 15:
            self.stdout.write(f"  ... and {len(unrelated_titles) - 15} more.")

        if not unrelated_resume_ids:
            self.stdout.write(self.style.SUCCESS("No unrelated candidate resumes found."))
            return

        resumes_to_delete = Resume.objects.filter(id__in=unrelated_resume_ids)
        profile_ids = list(resumes_to_delete.values_list("job_seeker_profile_id", flat=True).distinct())
        user_ids = list(resumes_to_delete.values_list("user_id", flat=True).distinct())

        if dry_run:
            self.stdout.write(self.style.SUCCESS(f"[DRY-RUN] Would delete {len(unrelated_resume_ids)} resumes."))
            return

        deleted_resumes_count, _ = resumes_to_delete.delete()

        # Clean orphaned profiles
        orphan_profiles_qs = JobSeekerProfile.objects.filter(
            Q(id__in=profile_ids) | Q(resumes__isnull=True)
        ).filter(resumes__isnull=True)

        orphan_profile_ids = list(orphan_profiles_qs.values_list("user_id", flat=True).distinct())
        orphan_profile_pks = list(orphan_profiles_qs.values_list("id", flat=True).distinct())
        deleted_profiles_count, _ = JobSeekerProfile.objects.filter(id__in=orphan_profile_pks).delete()

        # Clean orphaned candidate users
        orphan_user_ids = list(
            User.objects.filter(
                id__in=user_ids + orphan_profile_ids,
                role_name=var_sys.JOB_SEEKER,
                resumes__isnull=True,
                job_seeker_profile__isnull=True,
            ).exclude(is_superuser=True, is_staff=True).values_list("id", flat=True).distinct()
        )

        deleted_users_count, _ = User.objects.filter(id__in=orphan_user_ids).delete()

        remaining_resumes = Resume.objects.count()

        self.stdout.write(
            self.style.SUCCESS(
                f"\nCleanup complete:\n"
                f"- Deleted {deleted_resumes_count} non-target candidate resumes\n"
                f"- Deleted {deleted_profiles_count} orphaned candidate profiles\n"
                f"- Deleted {deleted_users_count} orphaned candidate user accounts\n"
                f"- Kept {remaining_resumes} target industry candidate resumes intact!"
            )
        )
