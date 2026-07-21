from django.core.management.base import BaseCommand
from django.db import transaction

from apps.accounts.models import User
from apps.profiles.models import Resume
from shared.configs import variable_system as var_sys


DEFAULT_KEEP_EMAILS = {"ceohub.hostmaster@gmail.com"}


class Command(BaseCommand):
    help = "Remove imported Vieclam24h candidate data while keeping admin and host master accounts."

    def add_arguments(self, parser):
        parser.add_argument(
            "--keep-email",
            action="append",
            dest="keep_email",
            default=[],
            help="Additional account email to keep while clearing imported candidate data.",
        )
        parser.add_argument(
            "--dry-run",
            action="store_true",
            dest="dry_run",
            help="Show what would be removed without deleting anything.",
        )

    def _build_keep_user_ids(self, keep_emails: set[str]) -> set[int]:
        keep_user_ids = set(
            User.objects.filter(is_superuser=True).values_list("id", flat=True)
        )
        keep_user_ids.update(
            User.objects.filter(role_name=var_sys.ADMIN).values_list("id", flat=True)
        )
        if keep_emails:
            keep_user_ids.update(
                User.objects.filter(email__in=list(keep_emails)).values_list("id", flat=True)
            )
        return keep_user_ids

    @transaction.atomic
    def handle(self, *args, **options):
        keep_email_values = options.get("keep_email", []) or []
        if isinstance(keep_email_values, str):
            keep_email_values = [keep_email_values]
        keep_emails = {
            email.strip().lower()
            for email in [*DEFAULT_KEEP_EMAILS, *keep_email_values]
            if email
        }
        keep_user_ids = self._build_keep_user_ids(keep_emails)

        imported_resume_qs = Resume.objects.filter(source_platform="vieclam24h")
        imported_user_ids = set(imported_resume_qs.values_list("user_id", flat=True))

        users_with_other_resumes = set(
            Resume.objects.exclude(source_platform="vieclam24h")
            .filter(user_id__in=imported_user_ids)
            .values_list("user_id", flat=True)
        )

        removable_user_ids = sorted(
            user_id
            for user_id in imported_user_ids
            if user_id not in keep_user_ids and user_id not in users_with_other_resumes
        )

        self.stdout.write(
            f"Imported resumes: {imported_resume_qs.count()}, users to delete: {len(removable_user_ids)}"
        )

        if options["dry_run"]:
            self.stdout.write(self.style.WARNING("Dry run only; nothing was deleted."))
            return

        imported_resume_qs.delete()
        if removable_user_ids:
            User.objects.filter(id__in=removable_user_ids).delete()

        self.stdout.write(
            self.style.SUCCESS(
                f"Done: deleted imported Vieclam24h resumes and {len(removable_user_ids)} candidate accounts."
            )
        )
