
from django.apps import AppConfig

class CommonConfig(AppConfig):

    default_auto_field = 'django.db.models.BigAutoField'

    name = 'common'

    def ready(self):
        # Initialize Admin SDK only when service-account credentials are configured.
        from common.firebase import has_firebase_admin_credentials, initialize_firebase_app

        if has_firebase_admin_credentials():
            initialize_firebase_app()
