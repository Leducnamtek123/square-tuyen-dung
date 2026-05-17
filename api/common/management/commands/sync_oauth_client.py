import os

from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import check_password
from django.core.management.base import BaseCommand, CommandError
from oauth2_provider.models import Application


class Command(BaseCommand):
    help = "Create or update the password-grant OAuth client from CLIENT_ID/CLIENT_SECRET."

    def handle(self, *args, **options):
        client_id = os.getenv("CLIENT_ID", "").strip()
        client_secret = os.getenv("CLIENT_SECRET", "")
        app_name = os.getenv("OAUTH_CLIENT_NAME", "project_web_app")

        if not client_id or not client_secret:
            raise CommandError("CLIENT_ID and CLIENT_SECRET are required.")

        app = Application.objects.filter(client_id=client_id).first()
        created = False
        if not app:
            app = Application.objects.filter(name=app_name).first()

        if not app:
            admin_user = get_user_model().objects.filter(is_superuser=True).first()
            app = Application(
                user=admin_user,
                name=app_name,
            )
            created = True

        changed = created
        if app.client_id != client_id:
            app.client_id = client_id
            changed = True
        if app.name != app_name:
            app.name = app_name
            changed = True
        if app.client_type != Application.CLIENT_CONFIDENTIAL:
            app.client_type = Application.CLIENT_CONFIDENTIAL
            changed = True
        if app.authorization_grant_type != Application.GRANT_PASSWORD:
            app.authorization_grant_type = Application.GRANT_PASSWORD
            changed = True
        if not app.hash_client_secret:
            app.hash_client_secret = True
            changed = True
        if not app.client_secret or not check_password(client_secret, app.client_secret):
            app.client_secret = client_secret
            changed = True

        if changed:
            app.save()
            self.stdout.write(self.style.SUCCESS("OAuth client synced."))
        else:
            self.stdout.write("OAuth client already in sync.")
