"""
Banner Seeder
Tạo dữ liệu mẫu cho Banner ngành Xây dựng & Thiết kế.
Ảnh thật được upload lên MinIO từ local file — không cần URL ngoài.
"""
import logging
import os
from datetime import datetime, timezone

from apps.content.models import Banner
from apps.files.models import File
from shared.configs import variable_system as var_sys
from shared.helpers.cloudinary_service import CloudinaryService


logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Đường dẫn thư mục chứa ảnh seed (relative to manage.py / BASE_DIR)
# ---------------------------------------------------------------------------
_SEED_IMG_DIR = os.path.normpath(os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "..", "..", "..", "..", "..", "data", "seed_images"
))


def _img(subfolder, filename):
    """Resolve đường dẫn tuyệt đối đến ảnh seed."""
    path = os.path.normpath(os.path.join(_SEED_IMG_DIR, subfolder, filename))
    return path if os.path.exists(path) else None


BANNERS_DATA = [
    {
        "id": 1,
        "description": "Tìm việc làm xây dựng phù hợp — Hàng nghìn cơ hội mỗi ngày",
        "button_text": "Tìm việc ngay",
        "button_link": "/viec-lam",
        "is_show_button": True,
        "platform": var_sys.Platform.WEB,
        "type": var_sys.BannerType.HOME,
        "description_location": var_sys.DescriptionLocation.BOTTOM_LEFT,
        "is_active": True,
        "web_img": "banner_1_web.png",
        "mobile_img": "banner_1_web.png",
    },
    {
        "id": 2,
        "description": "Đăng tin tuyển dụng ngành xây dựng — Tiếp cận hàng nghìn kỹ sư",
        "button_text": "Đăng tin ngay",
        "button_link": "/nha-tuyen-dung",
        "is_show_button": True,
        "platform": var_sys.Platform.WEB,
        "type": var_sys.BannerType.MAIN_JOB_RIGHT,
        "description_location": var_sys.DescriptionLocation.BOTTOM_RIGHT,
        "is_active": True,
        "web_img": "banner_2_web.png",
        "mobile_img": "banner_2_web.png",
    },
    {
        "id": 3,
        "description": "Kiến trúc & Kỹ thuật — Cơ hội tốt nhất cho kỹ sư & kiến trúc sư",
        "button_text": "Xem việc kiến trúc",
        "button_link": "/viec-lam?career=9",
        "is_show_button": True,
        "platform": var_sys.Platform.WEB,
        "type": var_sys.BannerType.HOME,
        "description_location": var_sys.DescriptionLocation.TOP_LEFT,
        "is_active": True,
        "web_img": "banner_3_web.png",
        "mobile_img": "banner_3_web.png",
    },
    {
        "id": 4,
        "description": "Thiết kế nội thất — Nhân tài sáng tạo không gian sống",
        "button_text": "Tìm việc thiết kế",
        "button_link": "/viec-lam?career=14",
        "is_show_button": True,
        "platform": var_sys.Platform.APP,
        "type": var_sys.BannerType.HOME,
        "description_location": var_sys.DescriptionLocation.BOTTOM_LEFT,
        "is_active": True,
        "web_img": "banner_4_web.png",
        "mobile_img": "banner_4_web.png",
    },
    {
        "id": 5,
        "description": "Ngày hội tuyển dụng ngành xây dựng — Kết nối nhà thầu & nhân tài",
        "button_text": "Xem sự kiện",
        "button_link": "/su-kien",
        "is_show_button": True,
        "platform": var_sys.Platform.WEB,
        "type": var_sys.BannerType.HOME,
        "description_location": var_sys.DescriptionLocation.TOP_RIGHT,
        "is_active": False,   # banner hết hạn
        "web_img": "banner_5_web.png",
        "mobile_img": "banner_5_web.png",
    },
]


def _upload_local_image(filepath: str, folder: str, object_name: str, file_type: str) -> "File | None":
    """Upload ảnh từ local file lên MinIO, trả về File instance."""
    if not filepath:
        logger.warning(f"  ⚠  Không tìm thấy file ảnh: {filepath}")
        return None
    try:
        result = CloudinaryService.upload_image(filepath, folder, public_id=object_name)
        if not result:
            return None
        return File.objects.create(
            public_id=result["public_id"],
            version=result.get("version", ""),
            format=result.get("format", "webp"),
            resource_type=result.get("resource_type", "image"),
            file_type=file_type,
            uploaded_at=datetime.now(timezone.utc),
            metadata=result,
        )
    except Exception as e:
        logger.warning(f"  ⚠  Upload thất bại ({object_name}): {e}")
        return None


def seed_banners():
    """Seed dữ liệu Banner ngành Xây dựng & Thiết kế với ảnh thật từ local."""
    logger.info("Bắt đầu nạp dữ liệu Banner (xây dựng & thiết kế)...")
    created_count = 0
    updated_count = 0

    for data in BANNERS_DATA:
        bid = data["id"]
        existing = Banner.objects.filter(id=bid).first()

        if existing:
            # Cập nhật các trường text, không đụng ảnh nếu đã có
            existing.description = data["description"]
            existing.button_text = data["button_text"]
            existing.button_link = data["button_link"]
            existing.is_show_button = data["is_show_button"]
            existing.platform = data["platform"]
            existing.type = data["type"]
            existing.description_location = data["description_location"]
            existing.is_active = data["is_active"]
            existing.save()
            updated_count += 1
            logger.info(f"  ↻ Cập nhật Banner #{bid}: {data['description'][:60]}")
            continue

        # Tạo mới — upload ảnh trước
        logger.info(f"  ↑ Đang upload ảnh cho Banner #{bid}...")
        web_path = _img("banners", data["web_img"])
        mobile_path = _img("banners", data["mobile_img"])

        web_file = _upload_local_image(
            web_path, folder="banners/web",
            object_name=f"banner_{bid}_web",
            file_type=File.WEB_BANNER_TYPE,
        )
        mobile_file = _upload_local_image(
            mobile_path, folder="banners/mobile",
            object_name=f"banner_{bid}_mobile",
            file_type=File.MOBILE_BANNER_TYPE,
        )

        Banner.objects.create(
            id=bid,
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
        logger.info(f"  ✓ Tạo Banner #{bid}: {data['description'][:60]}")

    logger.info(
        f"Thành công! Đã tạo {created_count} banner mới, cập nhật {updated_count} banner."
    )
