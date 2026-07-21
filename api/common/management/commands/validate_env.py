from django.conf import settings
from django.core.management.base import BaseCommand, CommandError

from shared.configs.env_validation import validate_required_settings


class Command(BaseCommand):
    help = "Validate required environment settings before starting services."

    def handle(self, *args, **options):
        try:
            validate_required_settings(settings)
        except Exception as exc:
            raise CommandError(str(exc)) from exc

        self.stdout.write(self.style.SUCCESS("Environment validation passed."))
