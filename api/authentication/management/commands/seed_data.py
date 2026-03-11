import random
import os
from datetime import date, timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from authentication.models import User
from common.models import City, District, Location, Career, File
from info.models import Company, JobSeekerProfile, Resume
from job.models import JobPost, JobPostActivity
from interview.models import Question, QuestionGroup, InterviewSession
from configs import variable_system as var_sys
from django.db import transaction
from oauth2_provider.models import Application

class Command(BaseCommand):
    help = 'Seed initial data for development'

    @transaction.atomic
    def handle(self, *args, **options):
        try:
            self.stdout.write('Seeding data...')
            
            # 1. Cities & Districts
            city, _ = City.objects.get_or_create(name='Hồ Chí Minh')
            District.objects.get_or_create(name='Quận 1', city=city)
            district_q7, _ = District.objects.get_or_create(name='Quận 7', city=city)
            
            location, _ = Location.objects.get_or_create(
                city=city,
                district=district_q7,
                address='Số 1 Võ Văn Ngân',
                lat=10.8507,
                lng=106.7719
            )

            # 2. Careers
            it_career, _ = Career.objects.get_or_create(name='Công nghệ thông tin')
            Career.objects.get_or_create(name='Kinh doanh / Bán hàng')
            Career.objects.get_or_create(name='Marketing')

            # 2.5. OAuth Application
            client_id = os.getenv('CLIENT_ID', 'qDZFCwY3yuN5mVNHqVVz8cAcREy5iQuGOTtQthjS')
            client_secret = os.getenv('CLIENT_SECRET', 'myjob_secret_client_key_2024')

            admin_user = User.objects.filter(is_superuser=True).first()
            if not admin_user:
                # Create a temporary admin if none exists yet, will be fixed by step 3
                admin_user = User.objects.create_superuser(
                    email='admin_temp@myjob.com',
                    full_name='System Admin',
                    password='Abc@1234'
                )

            app, created = Application.objects.get_or_create(
                client_id=client_id,
                defaults={
                    'client_type': Application.CLIENT_CONFIDENTIAL,
                    'authorization_grant_type': Application.GRANT_PASSWORD,
                    'name': 'MyJob Web App',
                    'user': admin_user
                }
            )
            app.client_secret = client_secret
            app.user = admin_user
            app.save()
            self.stdout.write(self.style.SUCCESS('Seeded OAuth Application'))

            # 3. Admin User
            admin_user = User.objects.filter(email='admin@myjob.com').first()
            if not admin_user:
                admin_user = User.objects.create_superuser(
                    email='admin@myjob.com',
                    full_name='System Admin',
                    password='Abc@1234'
                )
                self.stdout.write(self.style.SUCCESS('Created Admin: admin@myjob.com'))
            else:
                admin_user.set_password('Abc@1234')
                admin_user.save()
                self.stdout.write(self.style.SUCCESS('Updated Admin password: admin@myjob.com'))

            # 4. Employer & Company
            employer_user = User.objects.filter(email='employer@myjob.com').first()
            if not employer_user:
                employer_user = User.objects.create_user_with_role_name(
                    email='employer@myjob.com',
                    full_name='HR Manager',
                    role_name=var_sys.EMPLOYER,
                    password='Abc@1234',
                    is_active=True,
                    is_verify_email=True,
                    has_company=True
                )
                self.stdout.write(self.style.SUCCESS('Created Employer: employer@myjob.com'))
            else:
                employer_user.set_password('Abc@1234')
                employer_user.save()
                self.stdout.write(self.style.SUCCESS('Updated Employer password: employer@myjob.com'))

            company, _ = Company.objects.get_or_create(
                user=employer_user,
                defaults={
                    'company_name': 'MyJob Technology Solutions',
                    'company_email': 'hr@myjobtech.com',
                    'company_phone': '0123456789',
                    'tax_code': 'ABC123456',
                    'location': location,
                    'employee_size': 2, # 10-150
                    'field_operation': 'Software Development'
                }
            )

            # 5. Job Seeker & Profile
            seeker_user = User.objects.filter(email='jobseeker@myjob.com').first()
            if not seeker_user:
                seeker_user = User.objects.create_user_with_role_name(
                    email='jobseeker@myjob.com',
                    full_name='Nguyen Van Ung Vien',
                    role_name=var_sys.JOB_SEEKER,
                    password='Abc@1234',
                    is_active=True,
                    is_verify_email=True
                )
                self.stdout.write(self.style.SUCCESS('Created Job Seeker: jobseeker@myjob.com'))
            else:
                seeker_user.set_password('Abc@1234')
                seeker_user.save()
                self.stdout.write(self.style.SUCCESS('Updated Job Seeker password: jobseeker@myjob.com'))

            profile, _ = JobSeekerProfile.objects.get_or_create(
                user=seeker_user,
                defaults={
                    'phone': '0987654321',
                    'location': location,
                    'gender': 'M'
                }
            )

            # 6. Content: Job Post & Resume
            job_post, _ = JobPost.objects.get_or_create(
                job_name='Senior Python Developer (Django)',
                company=company,
                user=employer_user,
                defaults={
                    'deadline': date.today() + timedelta(days=30),
                    'quantity': 5,
                    'job_description': '<p>Tuyển gấp Backend Python Developer...</p>',
                    'position': 5, # Chuyên viên
                    'type_of_workplace': 1, # Văn phòng
                    'experience': 4, # 2 năm
                    'academic_level': 2, # Đại học
                    'job_type': 1, # Toàn thời gian
                    'salary_min': 20000000,
                    'salary_max': 40000000,
                    'career': it_career,
                    'location': location,
                    'contact_person_name': 'HR Manager',
                    'contact_person_phone': '0123456789',
                    'contact_person_email': 'hr@myjobtech.com',
                    'status': 3 # Đã duyệt
                }
            )

            resume, _ = Resume.objects.get_or_create(
                user=seeker_user,
                job_seeker_profile=profile,
                defaults={
                    'title': 'Senior Fullstack Developer CV',
                    'salary_min': 25000000,
                    'salary_max': 50000000,
                    'position': 5,
                    'experience': 5,
                    'academic_level': 2,
                    'type_of_workplace': 2,
                    'city': city,
                    'career': it_career,
                    'is_active': True
                }
            )

            # 7. Application (JobPostActivity)
            activity, _ = JobPostActivity.objects.get_or_create(
                job_post=job_post,
                user=seeker_user,
                defaults={
                    'resume': resume,
                    'full_name': seeker_user.full_name,
                    'email': seeker_user.email,
                    'phone': '0987654321',
                    'status': 1 # Chờ xác nhận
                }
            )

            # 8. Interview Questions & Session
            q1, _ = Question.objects.get_or_create(
                text='Explain the difference between a list and a tuple in Python.',
                author=employer_user
            )
            q2, _ = Question.objects.get_or_create(
                text='What are decorators in Python and how do they work?',
                author=employer_user
            )
            q3, _ = Question.objects.get_or_create(
                text='Describe a difficult situation you faced at work and how you handled it.',
                author=employer_user
            )

            group, _ = QuestionGroup.objects.get_or_create(
                name='Python Backend Interview Group',
                author=employer_user
            )
            group.questions.add(q1, q2, q3)

            interview, _ = InterviewSession.objects.get_or_create(
                candidate=seeker_user,
                job_post=job_post,
                defaults={
                    'status': 'scheduled',
                    'type': 'technical',
                    'scheduled_at': timezone.now() + timedelta(days=1),
                    'created_by': employer_user,
                    'question_group': group
                }
            )
            interview.questions.add(q1, q2, q3)

            self.stdout.write(self.style.SUCCESS('Successfully seeded all data!'))
        except Exception as e:
            self.stderr.write(self.style.ERROR(f'Error seeding data: {str(e)}'))
            import traceback
            self.stderr.write(traceback.format_exc())
