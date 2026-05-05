from django.core.management.base import BaseCommand

from apps.accounts.management.commands.seeders.banner_seeder import seed_banners


class Command(BaseCommand):
    help = "Seed Square banner data"

    def handle(self, *args, **options):
        created_count = seed_banners()
        self.stdout.write(self.style.SUCCESS(f"Seeded {created_count} banners for Square"))
