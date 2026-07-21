from django.conf import settings

from apps.accounts.tokens_custom import email_verification_token
from shared.configs import variable_system as var_sys

from .crypto_service import CryptoService


class EmailService:
    @staticmethod
    def get_full_client_url(path_fragment: str, domain_type: str) -> str:
        domain = settings.DOMAIN_CLIENT[domain_type]
        if not domain.endswith("/") and not path_fragment.startswith("/"):
            return f"{domain}/{path_fragment}"
        return f"{domain}{path_fragment}"

    @staticmethod
    def send_email_verify_email(request, user, platform):
        from console.jobs import queue_mail

        role_name = user.role_name
        redirect_login = settings.REDIRECT_LOGIN_CLIENT
        encoded_data = CryptoService.encode_with_expires(
            user.pk, settings.PROJECT_AUTH["VERIFY_EMAIL_LINK_EXPIRE_SECONDS"]
        )
        token = email_verification_token.make_token(user=user)

        func = f"api/auth/active-email/{encoded_data}/{token}/?redirectLogin={redirect_login}&platform=WEB"
        protocol = "https" if request.is_secure() else "http"
        domain = request.META["HTTP_HOST"]
        confirm_email_deeplink = None

        if role_name == var_sys.JOB_SEEKER and platform == "APP":
            confirm_email_deeplink = (
                f"{settings.DOMAIN_CLIENT['job_seeker']}active/{encoded_data}/{token}/APP"
            )

        data = {
            "confirm_email_url": f"{protocol}://{domain}/{func}",
            "confirm_email_deeplink": confirm_email_deeplink,
        }
        queue_mail.send_email_verify_email_task.delay(to=[user.email], data=data)

    @staticmethod
    def send_email_reply_to_job_seeker(to, subject, data):
        from console.jobs import queue_mail

        queue_mail.send_email_reply_job_seeker_task.delay(to=to, subject=subject, data=data)

