"""
Account Seeder
Tạo tài khoản Admin, Employer (Square Construction & Design), và 20 ứng viên mẫu
trong ngành Xây dựng & Thiết kế — mỗi ứng viên có avatar thật upload lên MinIO.
"""
import logging
import os
import random
from datetime import date

from django.conf import settings
from decouple import config
from faker import Faker
from oauth2_provider.models import Application

from apps.accounts.models import User
from apps.files.models import File
from apps.locations.models import City, Location
from apps.profiles.models import Company, JobSeekerProfile
from shared.configs import variable_system as var_sys
from shared.helpers.cloudinary_service import CloudinaryService


logger = logging.getLogger(__name__)

fake = Faker("vi_VN")

# ---------------------------------------------------------------------------
# Avatar seed images
# ---------------------------------------------------------------------------
_AVATAR_DIR = os.path.normpath(
    os.path.join(
        os.path.dirname(os.path.abspath(__file__)),
        "..", "..", "..", "..", "..", "data", "seed_images", "avatars"
    )
)

# 8 avatar thật (4 nam kỹ sư/kiến trúc sư, 4 nữ thiết kế/PM/HR)
AVATAR_FILES = [
    "avatar_1.png",  # nam - kỹ sư xây dựng
    "avatar_2.png",  # nam - kiến trúc sư
    "avatar_3.png",  # nữ - thiết kế nội thất
    "avatar_4.png",  # nam - kỹ sư M&E
    "avatar_5.png",  # nữ - HR
    "avatar_6.png",  # nam - chỉ huy công trường
    "avatar_7.png",  # nữ - project manager
    "avatar_8.png",  # nam - kỹ sư kết cấu
]

# Dữ liệu ứng viên mẫu ngành xây dựng & thiết kế
CANDIDATE_PROFILES = [
    {"full_name": "Nguyễn Minh Tuấn",    "gender": "M", "age": (26, 30)},
    {"full_name": "Trần Thị Lan Anh",    "gender": "F", "age": (25, 29)},
    {"full_name": "Lê Hoàng Phúc",       "gender": "M", "age": (28, 34)},
    {"full_name": "Phạm Thị Thu Hương",  "gender": "F", "age": (27, 32)},
    {"full_name": "Vũ Đức Mạnh",         "gender": "M", "age": (30, 38)},
    {"full_name": "Hoàng Thị Mai",       "gender": "F", "age": (24, 28)},
    {"full_name": "Đặng Văn Bình",       "gender": "M", "age": (32, 40)},
    {"full_name": "Ngô Thị Phương",      "gender": "F", "age": (26, 31)},
    {"full_name": "Bùi Xuân Hùng",       "gender": "M", "age": (28, 35)},
    {"full_name": "Lý Thị Thanh Thúy",  "gender": "F", "age": (25, 30)},
    {"full_name": "Đinh Quốc Toàn",      "gender": "M", "age": (29, 36)},
    {"full_name": "Trương Thị Kim Ngân", "gender": "F", "age": (27, 33)},
    {"full_name": "Phan Văn Khoa",       "gender": "M", "age": (31, 39)},
    {"full_name": "Võ Thị Hồng Nhung",  "gender": "F", "age": (24, 29)},
    {"full_name": "Huỳnh Minh Quân",     "gender": "M", "age": (26, 32)},
    {"full_name": "Đỗ Thị Yến Nhi",     "gender": "F", "age": (25, 30)},
    {"full_name": "Cao Việt Dũng",       "gender": "M", "age": (33, 42)},
    {"full_name": "Lưu Thị Bảo Châu",   "gender": "F", "age": (28, 34)},
    {"full_name": "Tô Thanh Hải",        "gender": "M", "age": (27, 35)},
    {"full_name": "Phùng Thị Diễm My",  "gender": "F", "age": (24, 28)},
]


def _upload_avatar(avatar_filename: str, username_slug: str) -> "File | None":
    """Upload avatar từ local lên MinIO, trả về File instance."""
    path = os.path.join(_AVATAR_DIR, avatar_filename)
    if not os.path.exists(path):
        return None
    try:
        result = CloudinaryService.upload_image(
            path, folder="avatars", public_id=f"avatar_{username_slug}"
        )
        if not result:
            return None
        from datetime import datetime, timezone
        return File.objects.create(
            public_id=result["public_id"],
            version=result.get("version", ""),
            format=result.get("format", "webp"),
            resource_type=result.get("resource_type", "image"),
            file_type=File.AVATAR_TYPE,
            uploaded_at=datetime.now(timezone.utc),
            metadata=result,
        )
    except Exception as e:
        logger.warning(f"  ⚠  Upload avatar thất bại ({avatar_filename}): {e}")
        return None


def seed_accounts():
    """
    Seed tài khoản hệ thống: Admin, Employer (Square Construction & Design),
    và 20 ứng viên mẫu ngành xây dựng/thiết kế với avatar thật.
    """
    logger.info("Bắt đầu sinh dữ liệu tài khoản và cấu hình OAuth2...")

    # 0. OAuth2 Application
    client_id = config("CLIENT_ID", default="qDZFCwY3yuN5mVNHqVVz8cAcREy5iQuGOTtQthjS")
    client_secret = config("CLIENT_SECRET", default="project_secret_client_key_2024")

    admin_user = User.objects.filter(is_superuser=True).first()
    app, created = Application.objects.get_or_create(
        client_id=client_id,
        defaults={
            "user": admin_user,
            "client_type": "confidential",
            "authorization_grant_type": "password",
            "client_secret": client_secret,
            "name": "Square Tuyen Dung Portal",
        },
    )
    if created:
        logger.info(f"Đã tạo OAuth2 Application: {client_id}")
    else:
        app.client_secret = client_secret
        app.save()
        logger.info(f"Đã cập nhật OAuth2 Application: {client_id}")

    # 1. Đảm bảo City & Location
    city = City.objects.first()
    if not city:
        city = City.objects.create(name="Hồ Chí Minh")
    location, _ = Location.objects.get_or_create(
        city=city,
        address=fake.address(),
        defaults={"lat": 10.8, "lng": 106.7},
    )

    # 2. Admin
    admin_user, _ = User.objects.get_or_create(
        email="admin@gmail.com",
        defaults={
            "full_name": "Square System Admin",
            "is_active": True,
            "is_verify_email": True,
            "is_staff": True,
            "is_superuser": True,
            "role_name": var_sys.ADMIN,
        },
    )
    admin_user.set_password("Squaretuyendung@2026")
    admin_user.save()
    logger.info("Đã cấu hình Admin: admin@gmail.com / Squaretuyendung@2026")

    # 3. Employer — Square Construction & Design
    employer_user, _ = User.objects.get_or_create(
        email="ceohub.hostmaster@gmail.com",
        defaults={
            "full_name": "Square Group HR",
            "is_active": True,
            "is_verify_email": True,
            "role_name": var_sys.EMPLOYER,
        },
    )
    employer_user.set_password("Squaretuyendung@2026")
    employer_user.save()
    logger.info("Đã cấu hình Employer: ceohub.hostmaster@gmail.com / Squaretuyendung@2026")

    company, created = Company.objects.update_or_create(
        user=employer_user,
        defaults={
            "company_name": "Square Construction & Design",
            "company_email": "ceohub.hostmaster@gmail.com",
            "company_phone": "0901234567",
            "tax_code": "0312345678",
            "location": location,
            "field_operation": "Xây dựng và Thiết kế nội thất",
        },
    )
    logger.info(f"{'Tạo mới' if created else 'Cập nhật'} công ty: {company.company_name}")

    # 4. Ứng viên mẫu với tên thật & avatar thật
    candidate_count = 0
    for i, profile_data in enumerate(CANDIDATE_PROFILES):
        email = f"ungvien{i+1:02d}@squaretuyendung.vn"
        name = profile_data["full_name"]
        gender = profile_data["gender"]
        min_age, max_age = profile_data["age"]

        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                "full_name": name,
                "is_active": True,
                "is_verify_email": True,
                "role_name": var_sys.JOB_SEEKER,
            },
        )
        if created:
            user.set_password("Abc@1234")
            user.save()

            # Upload avatar thật (vòng qua 8 avatars)
            avatar_filename = AVATAR_FILES[i % len(AVATAR_FILES)]
            slug = email.split("@")[0]
            avatar_file = _upload_avatar(avatar_filename, slug)
            if avatar_file:
                user.avatar = avatar_file
                user.save()
                logger.info(f"  ✓ Tạo ứng viên: {name} — avatar: {avatar_filename}")
            else:
                logger.info(f"  ✓ Tạo ứng viên: {name} (không có avatar)")

            birthday = fake.date_of_birth(minimum_age=min_age, maximum_age=max_age)
            JobSeekerProfile.objects.create(
                user=user,
                phone=fake.phone_number(),
                location=location,
                gender=gender,
                birthday=birthday,
            )
            candidate_count += 1

    logger.info(
        f"\nThành công! Tạo công ty '{company.company_name}' "
        f"và {candidate_count} ứng viên ngành xây dựng & thiết kế."
    )
