from django.core.management.base import BaseCommand
from .seeders.location_seeder import seed_locations
from .seeders.career_seeder import seed_careers
from .seeders.account_seeder import seed_accounts
from .seeders.job_seeder import seed_jobs
from .seeders.interview_seeder import seed_interviews

class Command(BaseCommand):
    help = 'Master command to seed all data for Square Tuyen Dung'

    def add_arguments(self, parser):
        parser.add_argument('--type', type=str, help='Type of data to seed (locations, careers, accounts, jobs, interviews, all)', default='all')

    def handle(self, *args, **options):
        seed_type = options['type']

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

        self.stdout.write(self.style.SUCCESS(f'Seed command finished for: {seed_type}'))
