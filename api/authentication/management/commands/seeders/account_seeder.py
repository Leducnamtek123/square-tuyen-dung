from faker import Faker
from authentication.models import User
from info.models import Company, JobSeekerProfile
from common.models import City, Location
from configs import variable_system as var_sys
from oauth2_provider.models import Application
from django.conf import settings
from decouple import config
import random

fake = Faker('vi_VN')

def seed_accounts():
    """
    Seed initial system accounts (Admin, Square Employer, Sample Candidates) and OAuth2 Application
    """
    print("Bắt đầu sinh dữ liệu tài khoản và cấu hình OAuth2...")
    
    # 0. Cấu hình OAuth2 Application cho Frontend
    client_id = config('CLIENT_ID', default='qDZFCwY3yuN5mVNHqVVz8cAcREy5iQuGOTtQthjS')
    client_secret = config('CLIENT_SECRET', default='myjob_secret_client_key_2024')
    
    admin_user = User.objects.filter(is_superuser=True).first()
    
    app, created = Application.objects.get_or_create(
        client_id=client_id,
        defaults={
            'user': admin_user,
            'client_type': 'confidential',
            'authorization_grant_type': 'password',
            'client_secret': client_secret,
            'name': 'Square Tuyen Dung Portal'
        }
    )
    if created:
        print(f"Đã tạo OAuth2 Application với Client ID: {client_id}")
    else:
        # Đảm bảo secret luôn đúng
        app.client_secret = client_secret
        app.save()
        print(f"Đã cập nhật OAuth2 Application: {client_id}")

    # 1. Đảm bảo có ít nhất 1 thành phố và 1 location để gán cho profile
    city = City.objects.first()
    if not city:
        city = City.objects.create(name="Hồ Chí Minh")
    
    location, _ = Location.objects.get_or_create(
        city=city,
        address=fake.address(),
        defaults={'lat': 10.8, 'lng': 106.7}
    )

    # 2. Tạo Admin Superuser
    admin_user, created = User.objects.get_or_create(
        email='admin@gmail.com',
        defaults={
            'full_name': 'Square System Admin',
            'is_active': True,
            'is_verify_email': True,
            'is_staff': True,
            'is_superuser': True,
            'role_name': var_sys.ADMIN
        }
    )
    admin_user.set_password('Squaretuyendung@2026')
    admin_user.save()
    print(f"Đã cấu hình tài khoản Admin: admin@gmail.com / Squaretuyendung@2026")

    # 3. Tạo Employer mẫu (Square Group)
    employer_user, created = User.objects.get_or_create(
        email='ceohub.hostmaster@gmail.com',
        defaults={
            'full_name': 'Square Group HR',
            'is_active': True,
            'is_verify_email': True,
            'role_name': var_sys.EMPLOYER
        }
    )
    employer_user.set_password('Squaretuyendung@2026')
    employer_user.save()
    print(f"Đã cấu hình tài khoản Employer: ceohub.hostmaster@gmail.com / Squaretuyendung@2026")
        
    company, created = Company.objects.update_or_create(
        user=employer_user,
        defaults={
            'company_name': 'Square Construction & Design',
            'company_email': 'ceohub.hostmaster@gmail.com',
            'company_phone': '0901234567',
            'tax_code': '0312345678',
            'location': location,
            'field_operation': 'Xây dựng và Nội thất'
        }
    )
    if created:
        print(f"Đã tạo mới công ty: {company.company_name}")
    else:
        print(f"Đã cập nhật thông tin công ty: {company.company_name}")

    # 3. Tạo 20 ứng viên (Candidates) mẫu
    candidate_count = 0
    for _ in range(20):
        email = fake.unique.email()
        name = fake.name()
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'full_name': name,
                'is_active': True,
                'is_verify_email': True,
                'role_name': var_sys.JOB_SEEKER
            }
        )
        if created:
            user.set_password('Abc@1234')
            user.save()
            
            JobSeekerProfile.objects.create(
                user=user,
                phone=fake.phone_number(),
                location=location,
                gender=random.choice(['M', 'F', 'O']),
                birthday=fake.date_of_birth(minimum_age=20, maximum_age=50)
            )
            candidate_count += 1

    print(f"Thành công! Đã tạo công ty '{company.company_name}' và {candidate_count} ứng viên mẫu.")
