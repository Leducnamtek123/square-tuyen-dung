"""
Service Layer for the Accounts app.
Encapsulates business logic separate from views/serializers.
Following the pattern established in interviews/services.py.
"""
import datetime
import logging

import pytz
from django.conf import settings
from django.db import transaction
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode

from django_otp.oath import TOTP

from shared.configs import variable_system as var_sys
from shared.configs.messages import ERROR_MESSAGES, SUCCESS_MESSAGES, SYSTEM_MESSAGES
from shared.helpers import helper

from console.jobs import queue_mail

from .models import User, ForgotPasswordToken
from .tokens_custom import email_verification_token

logger = logging.getLogger(__name__)


# ──────────────────────────────────────────────
#  Custom Exceptions
# ──────────────────────────────────────────────

class UserNotFoundError(Exception):
    pass


class CooldownActiveError(Exception):
    """Raised when password reset is requested too soon."""
    pass


class InvalidTokenError(Exception):
    pass


class TokenExpiredError(Exception):
    pass


# ──────────────────────────────────────────────
#  Password Reset Service
# ──────────────────────────────────────────────

class PasswordResetService:
    """Handles forgot-password and reset-password flows."""

    @staticmethod
    def request_reset(email: str, platform: str) -> None:
        """
        Request a password reset for the given email.
        Raises UserNotFoundError, CooldownActiveError on failure.
        """
        user = User.objects.filter(email=email).first()
        if not user:
            raise UserNotFoundError(ERROR_MESSAGES["EMAIL_NOT_REGISTERED"])

        now = datetime.datetime.now(tz=pytz.utc)

        # Check cooldown
        active_tokens = ForgotPasswordToken.objects.filter(
            user=user, is_active=True, platform=platform, expired_at__gte=now
        )
        if active_tokens.exists():
            token = active_tokens.first()
            elapsed = (now - token.create_at).total_seconds()
            if elapsed < settings.PROJECT_AUTH["TIME_REQUIRED_FORGOT_PASSWORD"]:
                raise CooldownActiveError(
                    ERROR_MESSAGES["PASSWORD_RESET_EMAIL_COOLDOWN"]
                )

        with transaction.atomic():
            # Deactivate old tokens
            ForgotPasswordToken.objects.filter(
                user=user, is_active=True, platform=platform
            ).update(is_active=False)

            expired_at = now + datetime.timedelta(
                seconds=settings.PROJECT_AUTH["RESET_PASSWORD_EXPIRE_SECONDS"]
            )

            if platform == "WEB":
                PasswordResetService._send_web_reset(user, expired_at)
            elif platform == "APP":
                PasswordResetService._send_app_reset(user, expired_at)

    @staticmethod
    def _send_web_reset(user: User, expired_at) -> None:
        access_token = urlsafe_base64_encode(force_bytes(user.pk))

        if user.role_name == var_sys.JOB_SEEKER:
            domain = settings.DOMAIN_CLIENT["job_seeker"]
        else:
            domain = settings.DOMAIN_CLIENT["employer"]

        reset_password_url = f"{domain}cap-nhat-mat-khau/{access_token}"

        ForgotPasswordToken.objects.create(
            user=user,
            expired_at=expired_at,
            token=access_token,
            platform="WEB",
        )

        queue_mail.send_email_reset_password_for_web_task.delay(
            to=[user.email],
            reset_password_url=reset_password_url,
        )

    @staticmethod
    def _send_app_reset(user: User, expired_at) -> None:
        totp = TOTP(settings.SECRET_KEY.encode())
        code = totp.token()

        new_token = ForgotPasswordToken.objects.create(
            user=user,
            expired_at=expired_at,
            code=code,
            platform="APP",
        )

        queue_mail.send_email_reset_password_for_app_task.delay(
            to=[user.email],
            full_name=user.full_name,
            code=new_token.code,
        )


# ──────────────────────────────────────────────
#  Email Verification Service
# ──────────────────────────────────────────────

class EmailVerificationService:
    """Handles email verification activation logic."""

    @staticmethod
    def verify_user(encoded_data: str, token: str) -> tuple:
        """
        Verify user email from encoded data + token.
        Returns (user, error_key) — error_key is None on success.
        """
        uid, expiration_time = helper.urlsafe_base64_decode_with_encoded_data(
            encoded_data
        )

        if uid is None or expiration_time is None:
            return None, "INVALID_EMAIL_VERIFICATION"

        try:
            user = User.objects.get(pk=uid)
        except User.DoesNotExist:
            return None, "INVALID_EMAIL_VERIFICATION"

        if not helper.check_expiration_time(expiration_time):
            return user, "EMAIL_VERIFICATION_EXPIRED"

        if not email_verification_token.check_token(user, token):
            return user, "INVALID_EMAIL_VERIFICATION"

        # Activate user
        user.is_active = True
        user.is_verify_email = True
        user.save()

        # Send welcome notification
        noti_title = SYSTEM_MESSAGES["WELCOME_JOBSEEKER"]
        if user.role_name == var_sys.EMPLOYER:
            noti_title = SYSTEM_MESSAGES["WELCOME_EMPLOYER"]

        helper.add_system_notifications(
            "Chào mừng bạn!",
            noti_title,
            [user.id],
        )

        return user, None

    @staticmethod
    def get_domain_type(user) -> str:
        """Return domain type based on user role."""
        if user and user.role_name == var_sys.EMPLOYER:
            return "employer"
        return "job_seeker"
