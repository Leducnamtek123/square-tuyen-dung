from django.core.management.base import BaseCommand
from django.db import transaction
from apps.jobs.models import JobPost, JobPostActivity, JobPostNotification, SavedJobPost
from apps.profiles.models import Company, CompanyFollowed, CompanyMember, ContactProfile, ResumeSaved, ResumeViewed
from .seeders.location_seeder import seed_locations
from .seeders.career_seeder import seed_careers
from .seeders.account_seeder import seed_accounts
from .seeders.job_seeder import seed_jobs
from apps.content.management.commands.seed_articles import seed_articles
from .seeders.interview_seeder import seed_interviews
from .seeders.banner_seeder import seed_banners
from .seeders.feedback_seeder import seed_feedbacks

class Command(BaseCommand):
    help = 'Master command to seed all data for Square Tuyen Dung'

    def add_arguments(self, parser):
        parser.add_argument(
            '--type',
            type=str,
            default='all',
            help='Type of data to seed: locations, careers, accounts, jobs, interviews, banners, feedbacks, articles, square, all',
        )

    @transaction.atomic
    def _clear_square_demo_data(self):
        square_ids = list(Company.objects.filter(company_name__icontains="Square").values_list("id", flat=True))

        JobPostNotification.objects.all().delete()
        SavedJobPost.objects.all().delete()
        JobPostActivity.objects.all().delete()
        JobPost.objects.all().delete()

        if square_ids:
            Company.objects.exclude(id__in=square_ids).delete()
            CompanyFollowed.objects.exclude(company_id__in=square_ids).delete()
            CompanyMember.objects.exclude(company_id__in=square_ids).delete()
            ResumeViewed.objects.exclude(company_id__in=square_ids).delete()
            ResumeSaved.objects.exclude(company_id__in=square_ids).delete()
            ContactProfile.objects.exclude(company_id__in=square_ids).delete()
        else:
            Company.objects.all().delete()

    def handle(self, *args, **options):
        seed_type = options['type']

        if seed_type == 'square':
            self._clear_square_demo_data()
            seed_accounts()
            seed_careers()
            seed_jobs()
            self.stdout.write(self.style.SUCCESS('✅ Seed command finished for: square'))
            return

        if seed_type in ['articles', 'all']:
            seed_articles(stdout=self.stdout, stderr=self.stderr)

        if seed_type in ['locations', 'all']:
            seed_locations()

        if seed_type in ['careers', 'all']:
            seed_careers()

        if seed_type in ['accounts', 'all']:
            seed_accounts()

        if seed_type in ['jobs', 'all']:
            seed_jobs()

        if seed_type in ['interviews', 'all']:
            seed_interviews()

        if seed_type in ['banners', 'all']:
            seed_banners()

        if seed_type in ['feedbacks', 'all']:
            seed_feedbacks()

        self.stdout.write(self.style.SUCCESS(f'✅ Seed command finished for: {seed_type}'))
