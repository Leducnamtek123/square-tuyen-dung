from django.core.management.base import BaseCommand
from django.db import transaction

from apps.common.models import Career


TARGET_CAREERS = [
    {"name": "Bất động sản", "app_icon_name": "apartment"},
    {"name": "Xây dựng", "app_icon_name": "engineering"},
    {"name": "Nội thất", "app_icon_name": "weekend"},
    {"name": "Kiến trúc", "app_icon_name": "architecture"},
]


class Command(BaseCommand):
    help = "Ensure the 4 target career groups exist without removing any other career data."

    @transaction.atomic
    def handle(self, *args, **options):
        created_count = 0
        updated_count = 0

        for item in TARGET_CAREERS:
            career, created = Career.objects.update_or_create(
                name=item["name"],
                defaults={
                    "is_hot": True,
                    "app_icon_name": item["app_icon_name"],
                },
            )

            if created:
                created_count += 1
            else:
                updated_count += 1

            self.stdout.write(
                f"- {career.name}: {'created' if created else 'updated'}"
            )

        self.stdout.write(
            self.style.SUCCESS(
                f"Done: {created_count} created, {updated_count} updated."
            )
        )
