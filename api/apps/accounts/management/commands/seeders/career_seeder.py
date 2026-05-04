import logging

from common.models import Career

logger = logging.getLogger(__name__)


def seed_careers():
    """Seed only the 4 target industries."""
    target_careers = [
        "Bất động sản",
        "Xây dựng",
        "Nội thất",
        "Kiến trúc",
    ]

    logger.info("Bắt đầu nạp danh mục ngành nghề giới hạn...")

    Career.objects.exclude(name__in=target_careers).delete()

    created_count = 0
    updated_count = 0

    for name in target_careers:
        _, created = Career.objects.update_or_create(
            name=name,
            defaults={},
        )
        if created:
            created_count += 1
        else:
            updated_count += 1

    logger.info(
        "Thành công! "
        f"Đã tạo mới {created_count} ngành nghề, cập nhật {updated_count} ngành nghề."
    )
