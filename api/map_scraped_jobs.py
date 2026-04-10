import os
import json
import random
import string
import django
from django.utils import timezone
from datetime import timedelta, datetime
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

def parse_deadline(deadline_str):
    """Parse deadline từ string DD/MM/YYYY sang date object"""
    if not deadline_str:
        return timezone.now().date() + timedelta(days=60)
    try:
        return datetime.strptime(deadline_str, '%d/%m/%Y').date()
    except:
        return timezone.now().date() + timedelta(days=60)

def parse_experience(exp_str):
    """Map experience text sang choice value"""
    if not exp_str:
        return 1
    exp_lower = exp_str.lower()
    if 'không' in exp_lower or 'chưa' in exp_lower:
        return 1  # No experience
    elif 'dưới 1' in exp_lower or '< 1' in exp_lower:
        return 2  # Under 1 year
    elif '1 năm' in exp_lower:
        return 3
    elif '2 năm' in exp_lower:
        return 4
    elif '3 năm' in exp_lower:
        return 5
    elif '4 năm' in exp_lower:
        return 6
    elif '5 năm' in exp_lower:
        return 7
    elif 'trên 5' in exp_lower or '> 5' in exp_lower:
        return 8
    return 1

def seed_scraped_jobs():
    print("🚀 Bắt đầu import dữ liệu chi tiết từ TopCV...")
    file_path = '/app/scripts/jobs_data.json'
    
    if not os.path.exists(file_path):
        print(f"❌ Không tìm thấy file data: {file_path}")
        return

    with open(file_path, 'r', encoding='utf-8') as f:
        jobs_data = json.load(f)

    # Lấy Career & Location
    all_careers = list(Career.objects.all())
    all_locations = list(Location.objects.all())

    if not all_careers or not all_locations:
        print("❌ Lỗi: Database chưa có Master Data (Career / Location).")
        return

    default_deadline = timezone.now().date() + timedelta(days=60)
    success_count = 0
    update_count = 0

    print(f"👉 Tìm thấy {len(jobs_data)} công việc trong JSON. Bắt đầu xử lý...")
    print(f"📋 Careers: {len(all_careers)} | Locations: {len(all_locations)}")

    for idx, job in enumerate(jobs_data):
        company_name = job.get('company', 'Công ty Ẩn Danh')
        title = job.get('title', 'Không rõ vị trí')
        salary_str = job.get('salary', 'Thỏa thuận')
        job_url = job.get('url', '#')
        
        # Dữ liệu chi tiết mới
        description = job.get('description', '')
        requirement = job.get('requirement', '')
        benefits = job.get('benefits', '')
        deadline_str = job.get('deadline', '')
        experience_str = job.get('experience', '')
        salary_min = job.get('salaryMin', 10000000) or 10000000
        salary_max = job.get('salaryMax', 20000000) or 20000000
        
        # Parse deadline
        deadline = parse_deadline(deadline_str)
        if deadline < timezone.now().date():
            deadline = default_deadline  # Nếu deadline quá khứ thì dùng mặc định
        
        # Parse experience
        experience = parse_experience(experience_str)
        
        # Build mô tả đầy đủ
        if description:
            job_desc = description
        else:
            job_desc = f"<p>Job gốc từ TopCV: <a href='{job_url}'>{job_url}</a></p><p>Mức lương: {salary_str}</p>"
        
        job_req = requirement if requirement else None
        job_benefits = benefits if benefits else None

        # 1. Tra cứu hoặc Sinh Dummy Company
        company = Company.objects.filter(company_name=company_name).first()
        
        if not company:
             slug_name = slugify(company_name) or generate_random_string(8)
             dummy_email = f"hr.{slug_name[:15]}.{generate_random_string(4)}@dummy.com"
             
             if User.objects.filter(email=dummy_email).exists():
                 dummy_email = f"{generate_random_string(10)}@dummy.com"

             user = User.objects.create_user_with_role_name(
                 email=dummy_email,
                 full_name=company_name[:100],
                 role_name=var_sys.EMPLOYER,
                 password=f"DummyPass@{generate_random_string(5)}"
             )

             company = Company.objects.create(
                 user=user,
                 company_name=company_name,
                 tax_code=generate_random_tax_code(),
                 company_email=dummy_email,
                 company_phone=generate_random_phone(),
                 employee_size=random.choice([1, 2, 3, 4]),
                 description=f"<p>Công ty tự động cào từ TopCV.</p>"
             )
             print(f"  ✅ Tạo Company: {company_name}")
        else:
             user = company.user

        # Ngẫu nhiên gán is_urgent (~30%) và is_hot (~20%)
        is_urgent = random.random() < 0.3
        is_hot = random.random() < 0.2
        
        # Chọn career và location ngẫu nhiên
        career = random.choice(all_careers)
        location = random.choice(all_locations)

        # 2. Tạo hoặc Update JobPost
        existing = JobPost.objects.filter(job_name=title, company=company).first()
        
        if not existing:
            JobPost.objects.create(
                job_name=title,
                quantity=random.randint(1, 5),
                deadline=deadline,
                job_description=job_desc,
                job_requirement=job_req,
                benefits_enjoyed=job_benefits,
                position=random.choice([1, 2, 3, 4, 5]),
                type_of_workplace=random.choice([1, 2, 3]),
                experience=experience,
                academic_level=random.choice([1, 2, 3, 4, 5, 6]),
                job_type=random.choice([1, 2, 3, 4, 5, 6]),
                salary_min=salary_min,
                salary_max=salary_max,
                is_urgent=is_urgent,
                is_hot=is_hot,
                status=var_sys.JobPostStatus.APPROVED,
                contact_person_name="HR " + company_name[:30],
                contact_person_phone=generate_random_phone(),
                contact_person_email=f"hr@{slugify(company_name[:20]) or 'company'}.vn",
                career=career,
                location=location,
                user=user,
                company=company
            )
            tag = ''
            if is_urgent: tag += ' 🔥'
            if is_hot: tag += ' ⭐'
            success_count += 1
            has_detail = '📝' if description else '📄'
            print(f"  {has_detail} [{idx+1}] {title[:60]}...{tag}")
        else:
            # Update thông tin mới
            update_fields = {
                'career': career,
                'location': location,
                'is_urgent': is_urgent,
                'is_hot': is_hot,
                'salary_min': salary_min,
                'salary_max': salary_max,
                'deadline': deadline,
            }
            if description:
                update_fields['job_description'] = job_desc
            if requirement:
                update_fields['job_requirement'] = job_req
            if benefits:
                update_fields['benefits_enjoyed'] = job_benefits
                
            JobPost.objects.filter(pk=existing.pk).update(**update_fields)
            update_count += 1

    print(f"\n🎉 HOÀN TẤT!")
    print(f"   ✅ Tạo mới: {success_count} jobs")
    print(f"   🔄 Cập nhật: {update_count} jobs")
    print(f"   📊 Tổng trong DB: {JobPost.objects.count()} jobs")

seed_scraped_jobs()
