import os
import json
import random
import string
import django
from django.utils import timezone
from datetime import timedelta
from django.utils.text import slugify

# Lấy các dependencies Model
from apps.accounts.models import User
from apps.profiles.models import Company
from common.models import Career
from apps.locations.models import Location
from apps.jobs.models import JobPost
from shared.configs import variable_system as var_sys

def generate_random_string(length=10):
    letters_and_digits = string.ascii_letters + string.digits
    return ''.join(random.choice(letters_and_digits) for _ in range(length))

def generate_random_phone():
    return '09' + ''.join(random.choice(string.digits) for _ in range(8))

def generate_random_tax_code():
    return ''.join(random.choice(string.digits) for _ in range(10))

def seed_scraped_jobs():
    print("Bắt đầu đọc file JSON data cào từ TopCV...")
    file_path = '/app/scripts/jobs_data.json' # Đọc trực tiếp từ thư mục app trong Docker
    
    if not os.path.exists(file_path):
        print(f"❌ Không tìm thấy file data: {file_path}")
        return

    with open(file_path, 'r', encoding='utf-8') as f:
        jobs_data = json.load(f)

    # Lấy Career & Location mặc định làm chuẩn
    all_careers = list(Career.objects.all())
    location = Location.objects.first()

    if not all_careers or not location:
        print("❌ Lỗi: Database của bạn chưa có Master Data (Career / Location). Hãy add ít nhất 1 Career!")
        return

    deadline = timezone.now().date() + timedelta(days=60)
    success_count = 0

    print(f"👉 Tìm thấy {len(jobs_data)} công việc trong JSON. Bắt đầu xử lý mapping Ghost Companies...")

    for job in jobs_data:
        company_name = job.get('company', 'Công ty Ẩn Danh')
        title = job.get('title', 'Không rõ vị trí')
        salary_str = job.get('salary', 'Thỏa thuận')
        job_url = job.get('url', '#')

        # 1. Tra cứu hoặc Sinh Dummy Company
        company = Company.objects.filter(company_name=company_name).first()
        
        if not company:
             # Tạo User trước vì Company yêu cầu OneToOneField(User)
             slug_name = slugify(company_name) or generate_random_string(8)
             dummy_email = f"hr.{slug_name[:15]}.{generate_random_string(4)}@dummy.com"
             
             # Chống trùng lặp email nếu create
             if User.objects.filter(email=dummy_email).exists():
                 dummy_email = f"{generate_random_string(10)}@dummy.com"

             # Create user
             user = User.objects.create_user_with_role_name(
                 email=dummy_email,
                 full_name=company_name[:100],
                 role_name=var_sys.EMPLOYER,
                 password=f"DummyPass@{generate_random_string(5)}"
             )

             # Create Company
             company = Company.objects.create(
                 user=user,
                 company_name=company_name,
                 tax_code=generate_random_tax_code(),
                 company_email=dummy_email,
                 company_phone=generate_random_phone(),
                 employee_size=1, # Under 10 employees
                 description=f"<p>Công ty tự động cào từ TopCV.</p>"
             )
             print(f"✅ Đã tạo Ghost Company: {company_name}")
        else:
             user = company.user

        # Xử lý parse lương cơ bản
        salary_min = 10000000
        salary_max = 20000000
        
        # Ngẫu nhiên gán is_urgent (~30%) và is_hot (~20%)
        is_urgent = random.random() < 0.3
        is_hot = random.random() < 0.2

        # 2. Tạo JobPost với Company đó
        # Kiểm tra chống trùng tên job trong cùng 1 công ty
        if not JobPost.objects.filter(job_name=title, company=company).exists():
            JobPost.objects.create(
                job_name=title,
                quantity=1,
                deadline=deadline,
                job_description=f"<p>Job gốc từ TopCV: <a href='{job_url}'>{job_url}</a></p><p>Mức lương: {salary_str}</p>",
                position=5, # Staff / Employee
                type_of_workplace=1, # Office-based
                experience=1, # No experience
                academic_level=3, # College
                job_type=1, # Full-time Permanent
                salary_min=salary_min,
                salary_max=salary_max,
                is_urgent=is_urgent,
                is_hot=is_hot,
                status=var_sys.JobPostStatus.APPROVED,
                contact_person_name="HR Tự Động",
                contact_person_phone="0999999999",
                contact_person_email="hr@dummy.com",
                career=random.choice(all_careers),
                location=location,
                user=user,
                company=company
            )
            tag = ''
            if is_urgent: tag += ' 🔥URGENT'
            if is_hot: tag += ' ⭐HOT'
            success_count += 1
            print(f"   -> Đăng Job: {title}{tag}")
        else:
            JobPost.objects.filter(job_name=title, company=company).update(
                career=random.choice(all_careers),
                is_urgent=is_urgent,
                is_hot=is_hot
            )
            tag = ''
            if is_urgent: tag += ' 🔥URGENT'
            if is_hot: tag += ' ⭐HOT'
            print(f"   -> Update Job: {title}{tag}")

    print(f"🎉 HOÀN TẤT! Đã đẩy thành công {success_count} công việc thực tế vào Database dự án.")

seed_scraped_jobs()
