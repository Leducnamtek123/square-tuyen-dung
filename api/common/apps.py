
from django.apps import AppConfig

class CommonConfig(AppConfig):

    default_auto_field = 'django.db.models.BigAutoField'

    name = 'common'

    def ready(self):
        # Single initialization point for Firebase app lifecycle.
        from common.firebase import initialize_firebase_app

        initialize_firebase_app()
