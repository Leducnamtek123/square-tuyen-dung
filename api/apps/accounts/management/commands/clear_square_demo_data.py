from django.core.management.base import BaseCommand
from django.db import transaction

from apps.accounts.models import User
from apps.jobs.models import JobPost, JobPostActivity, JobPostNotification, SavedJobPost
from apps.profiles.models import (
    Company,
    CompanyFollowed,
    CompanyMember,
    ContactProfile,
    JobSeekerProfile,
    Resume,
    ResumeSaved,
    ResumeViewed,
)
from shared.configs import variable_system as var_sys


class Command(BaseCommand):
    help = "Clear jobs and remove non-Square companies"

    def add_arguments(self, parser):
        parser.add_argument(
            "--keep-email",
            action="append",
            dest="keep_email",
            default=[],
            help="Additional account email to keep while clearing demo data.",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        self.stdout.write("Clearing job-related data...")
        keep_emails_option = options.get("keep_email", [])
        if isinstance(keep_emails_option, str):
            keep_emails_option = [keep_emails_option]
        keep_emails = {email.strip().lower() for email in keep_emails_option if email}
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

        JobPostNotification.objects.all().delete()
        SavedJobPost.objects.all().delete()
        JobPostActivity.objects.all().delete()
        JobPost.objects.all().delete()

        square_ids = list(Company.objects.filter(company_name__icontains="Square").values_list("id", flat=True))
        if square_ids:
            self.stdout.write("Removing companies that are not Square...")
            Company.objects.exclude(id__in=square_ids).delete()
            CompanyFollowed.objects.exclude(company_id__in=square_ids).delete()
            CompanyMember.objects.exclude(company_id__in=square_ids).delete()
            ResumeViewed.objects.exclude(company_id__in=square_ids).delete()
            ResumeSaved.objects.exclude(company_id__in=square_ids).delete()
            ContactProfile.objects.exclude(company_id__in=square_ids).delete()
        else:
            self.stdout.write("No Square company found, removing all companies...")
            Company.objects.all().delete()

        if keep_user_ids:
            self.stdout.write("Removing demo users and candidate profiles...")
            Resume.objects.exclude(user_id__in=keep_user_ids).delete()
            JobSeekerProfile.objects.exclude(user_id__in=keep_user_ids).delete()
            User.objects.exclude(id__in=keep_user_ids).delete()

        self.stdout.write(self.style.SUCCESS("Done: cleared jobs and kept only Square companies."))
