from django.core.management.base import BaseCommand
from django.db import transaction

from apps.jobs.models import JobPost, JobPostActivity, JobPostNotification, SavedJobPost
from apps.profiles.models import Company, CompanyFollowed, CompanyMember, ContactProfile, ResumeSaved, ResumeViewed


class Command(BaseCommand):
    help = "Clear jobs and remove non-Square companies"

    @transaction.atomic
    def handle(self, *args, **options):
        self.stdout.write("Clearing job-related data...")
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

        self.stdout.write(self.style.SUCCESS("Done: cleared jobs and kept only Square companies."))
