"""
Service Layer for the Accounts app.
Encapsulates business logic separate from views/serializers.
Following the pattern established in interviews/services.py.
"""
import datetime
import logging
import secrets

import pytz
from django.conf import settings
from django.db import transaction
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode

from django_otp.oath import TOTP

from shared.configs import variable_system as var_sys
from shared.configs.messages import ERROR_MESSAGES, SUCCESS_MESSAGES, SYSTEM_MESSAGES
from shared.helpers import helper

from console.jobs import queue_mail

from .models import User, ForgotPasswordToken
from .tokens_custom import email_verification_token

from apps.profiles.models import (
    JobSeekerProfile, 
    Resume,
    Company,
    CompanyMember
)
from apps.locations.models import Location
from apps.files.models import File
from shared.helpers.cloudinary_service import CloudinaryService
from console.jobs import queue_auth

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
        access_token = secrets.token_urlsafe(32)

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

    @staticmethod
    def reset_password(data: dict) -> dict:
        """
        Verify token/code and reset user password.
        Returns data for the response (e.g., redirect URL).
        Raises InvalidTokenError, TokenExpiredError.
        """
        now = datetime.datetime.now(tz=pytz.utc)
        platform = data.get("platform")
        new_password = data.get("newPassword")

        if platform == "WEB":
            token = data.get("token")
            try:
                user_id = force_str(urlsafe_base64_decode(token))
            except Exception:
                raise InvalidTokenError(ERROR_MESSAGES["INVALID_PASSWORD_RESET_LINK"])

            token_obj = ForgotPasswordToken.objects.filter(
                token=token, user_id=user_id, is_active=True
            ).first()

            if not token_obj:
                raise InvalidTokenError(ERROR_MESSAGES["INVALID_PASSWORD_RESET_LINK"])

            if token_obj.expired_at < now:
                raise TokenExpiredError(ERROR_MESSAGES["PASSWORD_RESET_LINK_EXPIRED"])

            with transaction.atomic():
                user = token_obj.user
                user.set_password(new_password)
                user.save()

                token_obj.is_active = False
                token_obj.save()

                return {"redirectLoginUrl": f"/{settings.REDIRECT_LOGIN_CLIENT}"}

        else:  # APP
            code = data.get("code")
            token_obj = ForgotPasswordToken.objects.filter(code=code).first()

            if not token_obj:
                raise InvalidTokenError(ERROR_MESSAGES["INVALID_PASSWORD_RESET_CODE"])

            if token_obj.expired_at < now or not token_obj.is_active:
                raise TokenExpiredError(ERROR_MESSAGES["PASSWORD_RESET_CODE_EXPIRED"])

            with transaction.atomic():
                user = token_obj.user
                user.set_password(new_password)
                user.save()

                token_obj.is_active = False
                token_obj.save()

                return {}


# ──────────────────────────────────────────────
#  User Avatar Service
# ──────────────────────────────────────────────

class AvatarService:
    """Handles user avatar upload and deletion."""

    @staticmethod
    def update_avatar(user: User, avatar_file) -> str:
        """
        Upload new avatar and update user.
        Returns the new avatar URL.
        """
        public_id = None
        if user.avatar:
            path_list = user.avatar.public_id.split('/')
            public_id = path_list[-1] if path_list else None

        avatar_upload_result = CloudinaryService.upload_image(
            avatar_file,
            settings.CLOUDINARY_DIRECTORY["avatar"],
            public_id=public_id
        )

        if not avatar_upload_result:
            raise Exception(ERROR_MESSAGES["CLOUDINARY_UPLOAD_ERROR"])

        with transaction.atomic():
            user.avatar = File.update_or_create_file_with_cloudinary(
                user.avatar,
                avatar_upload_result,
                File.AVATAR_TYPE
            )
            user.save()

            if not user.has_company:
                queue_auth.update_avatar.delay(user.id, user.avatar.get_full_url())

        return user.avatar.get_full_url()

    @staticmethod
    def delete_avatar(user: User) -> str:
        """
        Delete user avatar from Cloudinary and DB.
        Returns the default avatar URL.
        """
        if not user.avatar:
            return var_sys.AVATAR_DEFAULT["AVATAR"]

        with transaction.atomic():
            is_destroy_success = CloudinaryService.delete_image(user.avatar.public_id)
            if not is_destroy_success:
                logger.warning(f"Failed to delete avatar from Cloudinary for user {user.id}")

            user.avatar.delete()
            user.avatar = None
            user.save()

            if not user.has_company:
                queue_auth.update_avatar.delay(user.id, var_sys.AVATAR_DEFAULT["AVATAR"])

        return var_sys.AVATAR_DEFAULT["AVATAR"]


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


# ──────────────────────────────────────────────
#  Registration Service
# ──────────────────────────────────────────────

class RegistrationService:
    """Handles User registration for Employers and Job Seekers."""

    @staticmethod
    def register_employer(validated_data: dict) -> User:
        """
        Creates an Employer user along with their Company and Location.
        """
        try:
            with transaction.atomic():
                # Extract nested data
                company_data = validated_data.pop("company")
                location_data = company_data.pop("location")

                # 1. Create Location
                location_obj = Location.objects.create(**location_data)

                # 2. Create User
                # Ensure fields not in create_user_with_role_name are removed
                validated_data.pop("confirmPassword", None)
                validated_data.pop("platform", None)

                user = User.objects.create_user_with_role_name(
                    **validated_data,
                    is_active=False,
                    has_company=True,
                    role_name=var_sys.EMPLOYER
                )

                # 3. Create Company
                Company.objects.create(
                    user=user, 
                    **company_data, 
                    location=location_obj
                )

                return user
        except Exception as ex:
            helper.print_log_error("RegistrationService.register_employer", ex)
            raise

    @staticmethod
    def register_job_seeker(validated_data: dict) -> User:
        """
        Creates a Job Seeker user along with their Profile and default Resume.
        """
        try:
            with transaction.atomic():
                # Extract data
                validated_data.pop("confirmPassword", None)
                validated_data.pop("platform", None)

                # 1. Create User
                user = User.objects.create_user_with_role_name(
                    **validated_data,
                    is_active=False,
                    role_name=var_sys.JOB_SEEKER
                )

                # 2. Create Profile
                job_seeker_profile = JobSeekerProfile.objects.create(user=user)

                # 3. Create Default Resume
                Resume.objects.create(
                    job_seeker_profile=job_seeker_profile, 
                    user=user,
                    type=var_sys.CV_WEBSITE
                )

                return user
        except Exception as ex:
            helper.print_log_error("RegistrationService.register_job_seeker", ex)
            raise


# ──────────────────────────────────────────────
#  Account Service
# ──────────────────────────────────────────────

class AccountService:
    """Handles general account management tasks."""

    @staticmethod
    def toggle_active(user_id: int, request_user: User) -> User:
        """
        Toggles the is_active status of a user.
        Prevents users from toggling their own account.
        Raises UserNotFoundError if user doesn't exist.
        Raises PermissionError if user attempts to toggle themselves.
        """
        try:
            user = User.objects.get(pk=user_id)
            
            if user == request_user:
                raise PermissionError("Bạn không thể tự khóa tài khoản của chính mình.")

            user.is_active = not user.is_active
            user.save()
            return user
        except User.DoesNotExist:
            raise UserNotFoundError(f"User with ID {user_id} not found.")
        except Exception as ex:
            if not isinstance(ex, PermissionError):
                helper.print_log_error("AccountService.toggle_active", ex)
            raise

    @staticmethod
    def update_password(user: User, old_password: str, new_password: str) -> None:
        """
        Updates the user's password after verifying the old one.
        Raises ValueError if old password is incorrect.
        """
        if not user.check_password(old_password):
            raise ValueError("Mật khẩu cũ không chính xác.")

        try:
            user.set_password(new_password)
            user.save()
        except Exception as ex:
            helper.print_log_error("AccountService.update_password", ex)
            raise
