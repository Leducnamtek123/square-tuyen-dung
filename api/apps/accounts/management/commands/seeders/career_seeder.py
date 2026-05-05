import logging

from common.models import Career

logger = logging.getLogger(__name__)


def seed_careers():
    """Seed only the 4 target industries."""
    target_careers = [
        {
            "name": "Bất động sản",
            "app_icon_name": "apartment",
        },
        {
            "name": "Xây dựng",
            "app_icon_name": "engineering",
        },
        {
            "name": "Nội thất",
            "app_icon_name": "weekend",
        },
        {
            "name": "Kiến trúc",
            "app_icon_name": "architecture",
        },
    ]

    logger.info("Bắt đầu nạp danh mục ngành nghề giới hạn...")

    Career.objects.exclude(name__in=[career["name"] for career in target_careers]).delete()

    created_count = 0
    updated_count = 0

    for career_data in target_careers:
        _, created = Career.objects.update_or_create(
            name=career_data["name"],
            defaults={
                "is_hot": True,
                "app_icon_name": career_data["app_icon_name"],
            },
        )
        if created:
            created_count += 1
        else:
            updated_count += 1

    logger.info(
        "Thành công! "
        f"Đã tạo mới {created_count} ngành nghề, cập nhật {updated_count} ngành nghề."
    )
