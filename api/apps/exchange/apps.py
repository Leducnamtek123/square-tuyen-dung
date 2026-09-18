from django.apps import AppConfig


class ExchangeConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.exchange"
    verbose_name = "Data Exchange (Import/Export)"

    def ready(self):
        # Auto-discover and register entity exchange definitions
        from apps.exchange.registry import exchange_registry
        exchange_registry.autodiscover()
