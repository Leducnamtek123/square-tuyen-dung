"""
Banner Seeder
Tạo dữ liệu mẫu cho Banner. Ảnh placeholder được download tự động từ
picsum.photos rồi upload lên MinIO — không cần file thực.
"""
from datetime import datetime, timezone

from apps.content.models import Banner
from apps.files.models import File
from shared.configs import variable_system as var_sys
from shared.helpers.cloudinary_service import CloudinaryService


# ---------------------------------------------------------------------------
# Placeholder image sources — picsum.photos trả về ảnh ngẫu nhiên theo kích thước
# ---------------------------------------------------------------------------
WEB_IMAGES = [
    "https://picsum.photos/seed/banner1/1200/400",
    "https://picsum.photos/seed/banner2/1200/400",
    "https://picsum.photos/seed/banner3/1200/400",
    "https://picsum.photos/seed/banner4/1200/400",
    "https://picsum.photos/seed/banner5/1200/400",
]

MOBILE_IMAGES = [
    "https://picsum.photos/seed/mob1/600/400",
    "https://picsum.photos/seed/mob2/600/400",
    "https://picsum.photos/seed/mob3/600/400",
    "https://picsum.photos/seed/mob4/600/400",
    "https://picsum.photos/seed/mob5/600/400",
]

BANNERS_DATA = [
    {
        "id": 1,
        "description": "Tìm việc làm phù hợp — Hàng nghìn cơ hội mỗi ngày",
        "button_text": "Tìm việc ngay",
        "button_link": "/viec-lam",
        "is_show_button": True,
        "platform": var_sys.Platform.WEB,
        "type": var_sys.BannerType.HOME,
        "description_location": var_sys.DescriptionLocation.BOTTOM_LEFT,
        "is_active": True,
        "web_img_url": WEB_IMAGES[0],
        "mobile_img_url": MOBILE_IMAGES[0],
    },
    {
        "id": 2,
        "description": "Đăng tin tuyển dụng — Tiếp cận hàng triệu ứng viên",
        "button_text": "Đăng tin ngay",
        "button_link": "/nha-tuyen-dung",
        "is_show_button": True,
        "platform": var_sys.Platform.WEB,
        "type": var_sys.BannerType.MAIN_JOB_RIGHT,
        "description_location": var_sys.DescriptionLocation.BOTTOM_RIGHT,
        "is_active": True,
        "web_img_url": WEB_IMAGES[1],
        "mobile_img_url": MOBILE_IMAGES[1],
    },
    {
        "id": 3,
        "description": "IT & Công nghệ — Cơ hội tốt nhất cho kỹ sư phần mềm",
        "button_text": "Xem việc IT",
        "button_link": "/viec-lam?career=2",
        "is_show_button": True,
        "platform": var_sys.Platform.WEB,
        "type": var_sys.BannerType.HOME,
        "description_location": var_sys.DescriptionLocation.TOP_LEFT,
        "is_active": True,
        "web_img_url": WEB_IMAGES[2],
        "mobile_img_url": MOBILE_IMAGES[2],
    },
    {
        "id": 4,
        "description": "Ứng viên chất lượng cao — Giải pháp tuyển dụng thông minh",
        "button_text": "Tìm ứng viên",
        "button_link": "/nha-tuyen-dung/tim-ung-vien",
        "is_show_button": True,
        "platform": var_sys.Platform.APP,
        "type": var_sys.BannerType.HOME,
        "description_location": var_sys.DescriptionLocation.BOTTOM_LEFT,
        "is_active": True,
        "web_img_url": WEB_IMAGES[3],
        "mobile_img_url": MOBILE_IMAGES[3],
    },
    {
        "id": 5,
        "description": "Sự kiện tuyển dụng tháng 4 — Kết nối nhà tuyển dụng & ứng viên",
        "button_text": "Xem sự kiện",
        "button_link": "/su-kien",
        "is_show_button": True,
        "platform": var_sys.Platform.WEB,
        "type": var_sys.BannerType.HOME,
        "description_location": var_sys.DescriptionLocation.TOP_RIGHT,
        "is_active": False,           # inactive — banner hết hạn
        "web_img_url": WEB_IMAGES[4],
        "mobile_img_url": MOBILE_IMAGES[4],
    },
]


def _upload_placeholder(url: str, folder: str, object_name: str, file_type: str) -> File | None:
    """Download ảnh từ URL rồi upload lên MinIO, trả về File instance."""
    try:
        result = CloudinaryService.upload_image(url, folder, public_id=object_name)
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
        print(f"  ⚠  Không upload được ảnh placeholder: {e}")
        return None


def seed_banners():
    """Seed dữ liệu Banner mẫu với ảnh placeholder từ picsum.photos."""
    print("Bắt đầu nạp dữ liệu Banner...")
    created_count = 0
    updated_count = 0

    for data in BANNERS_DATA:
        bid = data["id"]
        existing = Banner.objects.filter(id=bid).first()

        if existing:
            # Cập nhật các trường text
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
            print(f"  Cập nhật Banner #{bid}: {data['description'][:50]}...")
            continue

        # Tạo mới — upload ảnh trước
        print(f"  Đang upload ảnh cho Banner #{bid}...")
        web_file = _upload_placeholder(
            data["web_img_url"],
            folder="banners/web",
            object_name=f"banner_{bid}_web",
            file_type=File.WEB_BANNER_TYPE,
        )
        mobile_file = _upload_placeholder(
            data["mobile_img_url"],
            folder="banners/mobile",
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
        print(f"  ✓ Tạo Banner #{bid}: {data['description'][:50]}...")

    print(
        f"Thành công! Đã tạo {created_count} banner mới, cập nhật {updated_count} banner."
    )
