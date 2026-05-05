from datetime import datetime, timezone
from pathlib import Path

from apps.content.models import Banner
from apps.files.models import File
from shared.configs import variable_system as var_sys
from shared.helpers.cloudinary_service import CloudinaryService


BANNER_ROOT = Path(__file__).resolve().parents[5] / "data" / "seed_images" / "banners"


def _img(filename: str) -> Path | None:
    path = BANNER_ROOT / filename
    return path if path.exists() else None


def _upload_local_image(filepath: Path | None, folder: str, object_name: str, file_type: str) -> File | None:
    if not filepath:
        return None

    result = CloudinaryService.upload_image(str(filepath), folder, public_id=object_name)
    if not result:
        return None

    return File.objects.update_or_create(
        public_id=result["public_id"],
        defaults={
            "version": result.get("version", ""),
            "format": result.get("format", "svg"),
            "resource_type": result.get("resource_type", "image"),
            "file_type": file_type,
            "uploaded_at": datetime.now(timezone.utc),
            "metadata": result,
        },
    )[0]


BANNERS_DATA = [
    {
        "id": 1,
        "description": "Bất động sản Square: tuyển đúng người cho đúng dự án",
        "button_text": "Khám phá việc làm",
        "button_link": "/viec-lam-theo-nganh-nghe",
        "is_show_button": True,
        "platform": var_sys.Platform.WEB,
        "type": var_sys.BannerType.HOME,
        "description_location": var_sys.DescriptionLocation.BOTTOM_LEFT,
        "is_active": True,
        "web_img": "home_real_estate.svg",
        "mobile_img": "home_real_estate.svg",
    },
    {
        "id": 2,
        "description": "Xây dựng & giám sát: chốt đội ngũ công trường vững tay",
        "button_text": "Xem cơ hội",
        "button_link": "/viec-lam-theo-nganh-nghe",
        "is_show_button": True,
        "platform": var_sys.Platform.WEB,
        "type": var_sys.BannerType.HOME,
        "description_location": var_sys.DescriptionLocation.BOTTOM_RIGHT,
        "is_active": True,
        "web_img": "home_construction.svg",
        "mobile_img": "home_construction.svg",
    },
    {
        "id": 3,
        "description": "Nội thất Square: tìm designer hiểu thẩm mỹ và thi công",
        "button_text": "Xem việc phù hợp",
        "button_link": "/viec-lam-theo-nganh-nghe",
        "is_show_button": True,
        "platform": var_sys.Platform.WEB,
        "type": var_sys.BannerType.HOME,
        "description_location": var_sys.DescriptionLocation.TOP_LEFT,
        "is_active": True,
        "web_img": "home_interior.svg",
        "mobile_img": "home_interior.svg",
    },
    {
        "id": 4,
        "description": "Kiến trúc & BIM: lọc ứng viên có tư duy triển khai",
        "button_text": "Khám phá ngành",
        "button_link": "/viec-lam-theo-nganh-nghe",
        "is_show_button": True,
        "platform": var_sys.Platform.WEB,
        "type": var_sys.BannerType.HOME,
        "description_location": var_sys.DescriptionLocation.TOP_RIGHT,
        "is_active": True,
        "web_img": "home_architecture.svg",
        "mobile_img": "home_architecture.svg",
    },
    {
        "id": 5,
        "description": "Square đang tuyển cho 4 ngành trọng điểm",
        "button_text": "Đăng tin tuyển dụng",
        "button_link": "/nha-tuyen-dung/register",
        "is_show_button": True,
        "platform": var_sys.Platform.WEB,
        "type": var_sys.BannerType.MAIN_JOB_RIGHT,
        "description_location": var_sys.DescriptionLocation.BOTTOM_LEFT,
        "is_active": True,
        "web_img": "right_hiring.svg",
        "mobile_img": "right_hiring.svg",
    },
]


def seed_banners():
    Banner.objects.all().delete()

    created_count = 0

    for data in BANNERS_DATA:
        web_path = _img(data["web_img"])
        mobile_path = _img(data["mobile_img"])

        web_file = _upload_local_image(
            web_path,
            folder="banners/web",
            object_name=f"banner_{data['id']}_web",
            file_type=File.WEB_BANNER_TYPE,
        )
        mobile_file = _upload_local_image(
            mobile_path,
            folder="banners/mobile",
            object_name=f"banner_{data['id']}_mobile",
            file_type=File.MOBILE_BANNER_TYPE,
        )

        Banner.objects.create(
            id=data["id"],
            description=data["description"],
            button_text=data["button_text"],
            button_link=data["button_link"],
            is_show_button=data["is_show_button"],
            platform=data["platform"],
            type=data["type"],
            description_location=data["description_location"],
            is_active=data["is_active"],
            image=web_file,
            image_mobile=mobile_file,
        )
        created_count += 1

    return created_count
