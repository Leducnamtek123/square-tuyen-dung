from django.core.management.base import BaseCommand

from apps.accounts.models import User
from apps.locations.models import City, District, Location
from apps.profiles.models import Company
from shared.configs import variable_system as var_sys


class Command(BaseCommand):
    help = "Seed sample users for the Square company"

    def handle(self, *args, **options):
        self.stdout.write("Bắt đầu tạo các tài khoản mẫu...")

        admin_email = "admin2@project.com"
        if not User.objects.filter(email=admin_email).exists():
            User.objects.create_superuser(
                email=admin_email,
                full_name="System Admin 2",
                password="Password123!"
            )
            self.stdout.write(self.style.SUCCESS(f"✓ Created admin: {admin_email}"))
        else:
            self.stdout.write(f"  Skipped (exists): {admin_email}")

        employer_email = "ceohub.hostmaster@gmail.com"
        if not User.objects.filter(email=employer_email).exists():
            emp_user = User.objects.create_user_with_role_name(
                email=employer_email,
                full_name="Square Group HR",
                password="Password123!",
                role_name=var_sys.EMPLOYER
            )
            emp_user.has_company = True
            emp_user.is_onboarded = True
            emp_user.onboarding_step = 4
            emp_user.is_active = True
            emp_user.is_verify_email = True
            emp_user.save()

            city, _ = City.objects.get_or_create(name="Hồ Chí Minh")
            district, _ = District.objects.get_or_create(name="Quận 1", city=city)
            loc, _ = Location.objects.get_or_create(
                city=city,
                district=district,
                address="1 Lê Duẩn, Bến Nghé, Quận 1",
                defaults={"lat": 10.781, "lng": 106.700},
            )
            Company.objects.update_or_create(
                user=emp_user,
                defaults={
                    "company_name": "Square Construction & Design",
                    "company_email": employer_email,
                    "company_phone": "0901234567",
                    "tax_code": "0312345678",
                    "employee_size": 200,
                    "location": loc,
                    "field_operation": "Bất động sản, Xây dựng, Nội thất, Kiến trúc",
                },
            )
            self.stdout.write(self.style.SUCCESS(f"✓ Created employer: {employer_email}"))
        else:
            self.stdout.write(f"  Skipped (exists): {employer_email}")

        self.stdout.write(self.style.SUCCESS("Done! Đã tạo xong."))
