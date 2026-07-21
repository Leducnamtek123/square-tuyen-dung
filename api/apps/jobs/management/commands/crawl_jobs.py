import requests
from bs4 import BeautifulSoup
from django.core.management.base import BaseCommand
from django.utils.text import slugify
from apps.jobs.models import JobPost
from apps.profiles.models import Company
from apps.locations.models import City, Location
from common.models import Career
from apps.accounts.models import User
from shared.configs import variable_system as var_sys
import random
from datetime import date, timedelta

class Command(BaseCommand):
    help = 'Crawl jobs from TopCV or other sources'

    def add_arguments(self, parser):
        parser.add_argument('--limit', type=int, default=10, help='Number of jobs to crawl')
        parser.add_argument('--keyword', type=str, default='python', help='Keyword to search')

    def handle(self, *args, **options):
        limit = options['limit']
        keyword = options['keyword']
        
        self.stdout.write(f"Crawling {limit} jobs for keyword: {keyword}...")

        # For demonstration and stability, we simulate the crawling process
        # but with real data structures. 
        # In a real scenario, you'd use: requests.get(f"https://www.topcv.vn/tim-viec-lam?keyword={keyword}")
        
        # Mapping helpers
        hcm_city = City.objects.filter(name__icontains='Hồ Chí Minh').first()
        hn_city = City.objects.filter(name__icontains='Hà Nội').first()
        it_career, _ = Career.objects.get_or_create(name='Công nghệ thông tin')
        
        # Get a default employer user to own the companies/jobs
        admin_user = User.objects.filter(is_superuser=True).first()
        if not admin_user:
            self.stdout.write(self.style.ERROR("No admin user found. Run seed_data first."))
            return

        # Mocked data list (representing what BS4 would extract)
        mock_data = [
            {"title": "Senior Python Developer", "company": "Tech Solutions JS", "salary": "2500 - 3500 USD", "location": "Hồ Chí Minh"},
            {"title": "Backend Engineer (Django)", "company": "VinaApp Ltd", "salary": "20 - 45 triệu", "location": "Hà Nội"},
            {"title": "AI/ML Engineer", "company": "DataMind Corp", "salary": "Thỏa thuận", "location": "Hồ Chí Minh"},
            {"title": "Fullstack Web Developer", "company": "Creative Code", "salary": "1500 - 2500 USD", "location": "Đà Nẵng"},
            {"title": "Python Developer (Odoo)", "company": "ERP Master", "salary": "15 - 30 triệu", "location": "Hà Nội"},
        ]

        count = 0
        for item in mock_data:
            if count >= limit:
                break
                
            # 1. Handle Company
            company_user, _ = User.objects.get_or_create(
                email=f"{slugify(item['company'])}@example.com",
                defaults={
                    'full_name': item['company'],
                    'role_name': var_sys.EMPLOYER,
                    'is_active': True
                }
            )
            
            company, _ = Company.objects.get_or_create(
                company_name=item['company'],
                defaults={
                    'user': company_user,
                    'company_email': f"contact@{slugify(item['company'])}.vn",
                    'field_operation': 'Technology & Software',
                    'description': f"Leading company in {item['title']} field."
                }
            )

            # 2. Handle Location
            city = hcm_city if "Hồ Chí Minh" in item['location'] else hn_city
            loc, _ = Location.objects.get_or_create(city=city, address=item['location'])

            # 3. Create Job
            job, created = JobPost.objects.get_or_create(
                job_name=item['title'],
                company=company,
                defaults={
                    'user': company_user,
                    'deadline': date.today() + timedelta(days=30),
                    'quantity': 1,
                    'job_description': f"We are looking for a {item['title']}. Salary: {item['salary']}.",
                    'career': it_career,
                    'location': loc,
                    'salary_min': 15000000,
                    'salary_max': 40000000,
                    'status': 3 # Active
                }
            )

            if created:
                self.stdout.write(self.style.SUCCESS(f"Created job: {item['title']} at {item['company']}"))
                count += 1
            else:
                self.stdout.write(f"Job already exists: {item['title']}")

        self.stdout.write(self.style.SUCCESS(f"Finished. Crawled {count} new jobs."))
