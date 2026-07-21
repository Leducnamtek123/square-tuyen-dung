from pathlib import Path
import logging
from datetime import datetime, timezone

from common.models import Career
from apps.files.models import File
from shared.helpers.cloudinary_service import CloudinaryService

logger = logging.getLogger(__name__)

CAREER_ROOT = Path(__file__).resolve().parents[5] / 'data' / 'seed_images' / 'articles'
CAREER_IMAGE_BY_NAME = {
    'Bất động sản': CAREER_ROOT / 'real_estate.jpg',
    'Xây dựng': CAREER_ROOT / 'construction.jpg',
    'Nội thất': CAREER_ROOT / 'interior.jpg',
    'Kiến trúc': CAREER_ROOT / 'architecture.jpg',
}


def _upload_career_icon(image_path: Path | None, public_id: str) -> File | None:
    if not image_path or not image_path.exists():
        return None

    result = CloudinaryService.upload_image(str(image_path), 'career_image', public_id=public_id)
    if not result:
        return None

    file_record, _ = File.objects.update_or_create(
        public_id=result['public_id'],
        defaults={
            'version': result.get('version', ''),
            'format': result.get('format', 'png'),
            'resource_type': result.get('resource_type', 'image'),
            'file_type': File.CAREER_IMAGE_TYPE,
            'uploaded_at': result.get('created_at') or datetime.now(timezone.utc),
            'metadata': result,
        },
    )
    return file_record


def seed_careers():
    """Seed only the 4 target industries and attach matching artwork."""
    target_careers = [
        {
            'name': 'Bất động sản',
            'app_icon_name': 'apartment',
        },
        {
            'name': 'Xây dựng',
            'app_icon_name': 'engineering',
        },
        {
            'name': 'Nội thất',
            'app_icon_name': 'weekend',
        },
        {
            'name': 'Kiến trúc',
            'app_icon_name': 'architecture',
        },
    ]

    logger.info('Bắt đầu nạp danh mục ngành nghề giới hạn...')

    Career.objects.exclude(name__in=[career['name'] for career in target_careers]).delete()

    created_count = 0
    updated_count = 0

    for career_data in target_careers:
        career, created = Career.objects.update_or_create(
            name=career_data['name'],
            defaults={
                'is_hot': True,
                'app_icon_name': career_data['app_icon_name'],
            },
        )

        image_path = CAREER_IMAGE_BY_NAME.get(career_data['name'])
        if image_path:
            icon = _upload_career_icon(image_path, public_id=f"career_image/{career_data['name']}")
            if icon and career.icon_id != icon.id:
                career.icon = icon
                career.save(update_fields=['icon'])

        if created:
            created_count += 1
        else:
            updated_count += 1

    logger.info(
        'Thành công! '
        f'Đã tạo mới {created_count} ngành nghề, cập nhật {updated_count} ngành nghề.'
    )
