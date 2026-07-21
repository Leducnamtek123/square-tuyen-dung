
from django.apps import AppConfig

class JobsConfig(AppConfig):

    default_auto_field = 'django.db.models.BigAutoField'

    name = 'apps.jobs'
    label = 'job'
    verbose_name = 'Jobs'

    def ready(self):
        """Connect Elasticsearch sync signals after the app registry is ready."""
        try:
            from .signals import connect_signals
            connect_signals()
        except Exception as exc:
            import logging
            logging.getLogger(__name__).warning(
                "Could not connect Jobs ES signals: %s", exc
            )
