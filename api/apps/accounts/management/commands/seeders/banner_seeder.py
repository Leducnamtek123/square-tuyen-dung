from datetime import datetime, timezone
from pathlib import Path

from apps.content.models import Banner, BannerType
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

    file_record, _ = File.objects.update_or_create(
        public_id=result["public_id"],
        defaults={
            "version": result.get("version", ""),
            "format": result.get("format", "webp"),
            "resource_type": result.get("resource_type", "image"),
            "file_type": file_type,
            "uploaded_at": result.get("created_at") or datetime.now(timezone.utc),
            "metadata": result,
        },
    )
    return file_record


def _ensure_banner_types() -> None:
    BannerType.objects.update_or_create(
        code="HOME",
        defaults={
            "name": "Home",
            "value": var_sys.BannerType.HOME,
            "web_aspect_ratio": "16:5",
            "mobile_aspect_ratio": "1:1",
            "is_active": True,
        },
    )
    BannerType.objects.update_or_create(
        code="MAIN_JOB_RIGHT",
        defaults={
            "name": "Main Job Right",
            "value": var_sys.BannerType.MAIN_JOB_RIGHT,
            "web_aspect_ratio": "1:1",
            "mobile_aspect_ratio": "1:1",
            "is_active": True,
        },
    )


BANNERS_DATA = [
    {
        "id": 1,
        "description": "Square kết nối ứng viên và nhà tuyển dụng trong các ngành dự án",
        "button_text": "Khám phá việc làm",
        "button_link": "/viec-lam",
        "is_show_button": True,
        "platform": var_sys.Platform.WEB,
        "type": var_sys.BannerType.HOME,
        "description_location": var_sys.DescriptionLocation.BOTTOM_LEFT,
        "is_active": True,
        "web_img": "home_square_recruitment_web.jpg",
        "mobile_img": "home_square_recruitment_mobile.jpg",
    },
    {
        "id": 2,
        "description": "Tuyển đội ngũ xây dựng, giám sát và vận hành công trường vững tay",
        "button_text": "Xem cơ hội",
        "button_link": "/viec-lam",
        "is_show_button": True,
        "platform": var_sys.Platform.WEB,
        "type": var_sys.BannerType.HOME,
        "description_location": var_sys.DescriptionLocation.BOTTOM_RIGHT,
        "is_active": True,
        "web_img": "home_construction_web.jpg",
        "mobile_img": "home_construction_mobile.jpg",
    },
    {
        "id": 3,
        "description": "Tìm ứng viên bất động sản, sales dự án và tư vấn khách hàng phù hợp",
        "button_text": "Tìm theo ngành",
        "button_link": "/viec-lam-theo-nganh-nghe",
        "is_show_button": True,
        "platform": var_sys.Platform.WEB,
        "type": var_sys.BannerType.HOME,
        "description_location": var_sys.DescriptionLocation.TOP_LEFT,
        "is_active": True,
        "web_img": "home_real_estate_web.jpg",
        "mobile_img": "home_real_estate_mobile.jpg",
    },
    {
        "id": 4,
        "description": "Nội thất Square giúp lọc designer hiểu thẩm mỹ và triển khai thực tế",
        "button_text": "Xem việc phù hợp",
        "button_link": "/viec-lam-theo-nganh-nghe",
        "is_show_button": True,
        "platform": var_sys.Platform.WEB,
        "type": var_sys.BannerType.HOME,
        "description_location": var_sys.DescriptionLocation.TOP_RIGHT,
        "is_active": True,
        "web_img": "home_interior_web.jpg",
        "mobile_img": "home_interior_mobile.jpg",
    },
    {
        "id": 5,
        "description": "Kiến trúc và BIM cần ứng viên biết đọc dự án, phối hợp đội nhóm",
        "button_text": "Khám phá ngành",
        "button_link": "/viec-lam-theo-nganh-nghe",
        "is_show_button": True,
        "platform": var_sys.Platform.WEB,
        "type": var_sys.BannerType.HOME,
        "description_location": var_sys.DescriptionLocation.BOTTOM_LEFT,
        "is_active": True,
        "web_img": "home_architecture_web.jpg",
        "mobile_img": "home_architecture_mobile.jpg",
    },
    {
        "id": 6,
        "description": "Square đang tuyển cho bất động sản, xây dựng, nội thất và kiến trúc",
        "button_text": "Đăng tin tuyển dụng",
        "button_link": "/nha-tuyen-dung/register",
        "is_show_button": True,
        "platform": var_sys.Platform.WEB,
        "type": var_sys.BannerType.MAIN_JOB_RIGHT,
        "description_location": var_sys.DescriptionLocation.BOTTOM_LEFT,
        "is_active": True,
        "web_img": "right_hiring_web.jpg",
        "mobile_img": "right_hiring_mobile.jpg",
    },
]


def seed_banners():
    _ensure_banner_types()

    upserted_count = 0

    for data in BANNERS_DATA:
        web_file = _upload_local_image(
            _img(data["web_img"]),
            folder="banners/web",
            object_name=f"square_{data['id']}_web",
            file_type=File.WEB_BANNER_TYPE,
        )
        mobile_file = _upload_local_image(
            _img(data["mobile_img"]),
            folder="banners/mobile",
            object_name=f"square_{data['id']}_mobile",
            file_type=File.MOBILE_BANNER_TYPE,
        )

        defaults = {
            "description": data["description"],
            "button_text": data["button_text"],
            "button_link": data["button_link"],
            "is_show_button": data["is_show_button"],
            "platform": data["platform"],
            "type": data["type"],
            "description_location": data["description_location"],
            "is_active": data["is_active"],
        }
        if web_file:
            defaults["image"] = web_file
        if mobile_file:
            defaults["image_mobile"] = mobile_file

        Banner.objects.update_or_create(id=data["id"], defaults=defaults)
        upserted_count += 1

    return upserted_count
