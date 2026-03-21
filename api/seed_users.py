import os
import django

# Setup Django 
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.accounts.models import User
from apps.profiles.models import JobSeekerProfile, Resume, Company
from apps.locations.models import Location, City, District
from shared.configs import variable_system as var_sys

def create_users():
    print("Bắt đầu tạo thêm các tài khoản mẫu...")
    
    # 1. Admin
    admin_email = "admin2@project.com"
    if not User.objects.filter(email=admin_email).exists():
        print(f"[{admin_email}] Creating Administrative User...")
        User.objects.create_superuser(
            email=admin_email,
            full_name="System Admin 2",
            password="Password123!"
        )
    else:
        print(f"[{admin_email}] Đã tồn tại.")

    # 2. Employer
    employer_email = "employer2@project.com"
    if not User.objects.filter(email=employer_email).exists():
        print(f"[{employer_email}] Creating Employer User...")
        emp_user = User.objects.create_user_with_role_name(
            email=employer_email,
            full_name="Great Employer 2",
            password="Password123!",
            role_name=var_sys.EMPLOYER
        )
        emp_user.has_company = True
        emp_user.is_active = True
        emp_user.is_verify_email = True
        emp_user.save()
        
        # Get or create basic location for company
        city, _ = City.objects.get_or_create(name="Hồ Chí Minh")
        district, _ = District.objects.get_or_create(name="Quận 1", city=city)
        loc, _ = Location.objects.get_or_create(
            city=city, district=district, address="1 Lê Duẩn, Bến Nghé, Quận 1",
            defaults={"lat": 10.781, "lng": 106.700}
        )

        Company.objects.create(
            user=emp_user,
            company_name="Tech Solutions Corp 2",
            company_email=employer_email,
            company_phone="0987654322",
            tax_code="0101010102",
            employee_size=200,
            location=loc
        )
    else:
        print(f"[{employer_email}] Đã tồn tại.")

    # 3. Job Seeker
    js_email = "candidate2@project.com"
    if not User.objects.filter(email=js_email).exists():
        print(f"[{js_email}] Creating Job Seeker User...")
        js_user = User.objects.create_user_with_role_name(
            email=js_email,
            full_name="Active Candidate 2",
            password="Password123!",
            role_name=var_sys.JOB_SEEKER
        )
        js_user.is_active = True
        js_user.is_verify_email = True
        js_user.save()

        profile = JobSeekerProfile.objects.create(user=js_user, phone="0123456782")
        Resume.objects.create(job_seeker_profile=profile, user=js_user, type=var_sys.CV_WEBSITE, title="Backend Developer")
    else:
        print(f"[{js_email}] Đã tồn tại.")
        
    print("Done. Đã tạo xong.")

if __name__ == "__main__":
    create_users()
