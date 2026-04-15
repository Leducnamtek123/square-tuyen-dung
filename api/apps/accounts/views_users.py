import datetime
import logging
import time

import pytz

from django.conf import settings
from django.db import transaction
from django.db import connection, reset_queries
from django.http import HttpResponseRedirect, HttpResponseNotFound
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode

from django_otp.oath import TOTP

from django.db.models import Q, Prefetch

from rest_framework import status, viewsets, generics
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from shared import pagination as paginations
from shared import renderers

from shared.configs import variable_system as var_sys
from shared.configs.variable_response import response_data
from shared.configs.messages import ERROR_MESSAGES, SUCCESS_MESSAGES, SYSTEM_MESSAGES

from shared.helpers import helper
from shared.helpers.cloudinary_service import CloudinaryService

from console.jobs import queue_mail, queue_auth

from .tokens_custom import email_verification_token
from . import permissions as perms_custom
from .services import (
    PasswordResetService,
    EmailVerificationService,
    AvatarService,
    RegistrationService,
    AccountService,
    UserNotFoundError,
    CooldownActiveError,
    InvalidTokenError,
    TokenExpiredError,
)

from .models import User, ForgotPasswordToken
from apps.profiles.models import CompanyMember

from .serializers import (
    CheckCredsSerializer,
    ResendVerifyEmailSerializer,
    ForgotPasswordSerializer,
    UpdatePasswordSerializer,
    ResetPasswordSerializer,
    EmployerRegisterSerializer,
    JobSeekerRegisterSerializer,
    UserSerializer,
    AvatarSerializer,
    UserSettingSerializer,
)

logger = logging.getLogger(__name__)

USER_INFO_BASIC_FIELDS = (
    "id",
    "fullName",
    "email",
    "isActive",
    "isVerifyEmail",
    "avatarUrl",
    "roleName",
    "jobSeekerProfileId",
    "jobSeekerProfile",
)

USER_WORKSPACE_FIELDS = (
    "companyId",
    "company",
    "canAccessEmployerPortal",
    "employerRoleCode",
    "workspaces",
)


def _get_user_for_info(user_id, include_memberships=True):
    queryset = User.objects.select_related(
        "avatar",
        "job_seeker_profile",
        "company",
        "company__logo",
    )

    if include_memberships:
        memberships_qs = CompanyMember.objects.select_related(
            "company", "role", "company__logo"
        ).filter(
            status=CompanyMember.STATUS_ACTIVE,
            is_active=True,
        )
        queryset = queryset.prefetch_related(
            Prefetch(
                "company_memberships",
                queryset=memberships_qs,
                to_attr="_active_memberships",
            )
        )

    return queryset.get(pk=user_id)


def _log_user_info_perf(label, user_id, start_at):
    if not getattr(settings, "DEBUG", False):
        return
    duration = time.monotonic() - start_at
    query_count = len(connection.queries)
    logger.info(
        "user-info[%s] user=%s duration=%.3fs queries=%s",
        label,
        user_id,
        duration,
        query_count,
    )


@api_view(http_method_names=["post"])
@permission_classes([AllowAny])
def check_email_exists(request):
    data = request.data
    email = data.get("email")
    if not email:
        return response_data(
            status=status.HTTP_400_BAD_REQUEST,
            errors={"email": ["Email lÃƒÂ  bÃ¡ÂºÂ¯t buÃ¡Â»â„¢c."]},
        )
    exists = User.objects.filter(email__iexact=email).exists()
    return response_data(status=status.HTTP_200_OK, data={"exists": exists})


@api_view(http_method_names=["POST"])
@permission_classes([AllowAny])
def check_creds(request):
    data = request.data

    res_data = {
        "exists": False,
        "email": "",
        "email_verified": False,
    }

    check_creds_serializer = CheckCredsSerializer(data=data)

    if not check_creds_serializer.is_valid():
        return response_data(
            status=status.HTTP_400_BAD_REQUEST, errors=check_creds_serializer.errors
        )

    serializer_data = check_creds_serializer.data

    email = serializer_data["email"]
    role_name = serializer_data.get("roleName", None)

    user = helper.secure_check_creds(email, role_name)

    res_data["email"] = email

    if user:
        res_data["exists"] = True
        if user.is_verify_email:
            res_data["email_verified"] = True

    return response_data(data=res_data)


@api_view(http_method_names=["post"])
@permission_classes([AllowAny])
def send_verify_email(request):
    serializer = ResendVerifyEmailSerializer(data=request.data)
    if not serializer.is_valid():
        return response_data(
            status=status.HTTP_400_BAD_REQUEST, errors=serializer.errors
        )

    email = serializer.validated_data.get("email")
    platform = serializer.validated_data.get("platform", "WEB")

    user = User.objects.filter(email__iexact=email).first()
    if not user:
        return response_data(
            status=status.HTTP_400_BAD_REQUEST,
            errors={"errorMessage": [ERROR_MESSAGES["EMAIL_NOT_REGISTERED"]]},
        )

    if user.is_verify_email:
        return response_data(status=status.HTTP_200_OK, data={"emailVerified": True})

    helper.send_email_verify_email(request, user, platform=platform)

    return response_data(status=status.HTTP_200_OK, data={"emailVerified": False})


@api_view(http_method_names=["GET"])
@permission_classes([AllowAny])
def user_active(request, encoded_data, token):
    if "platform" not in request.GET:
        return HttpResponseNotFound()

    platform = request.GET.get("platform")
    if platform not in (var_sys.Platform.WEB, var_sys.Platform.APP):
        return HttpResponseNotFound()

    redirect_login = ""
    if platform == var_sys.Platform.WEB:
        if "redirectLogin" not in request.GET:
            return HttpResponseNotFound()
        redirect_login = request.GET.get("redirectLogin")
        if redirect_login != settings.REDIRECT_LOGIN_CLIENT:
            return HttpResponseNotFound()

    user, error_key = EmailVerificationService.verify_user(encoded_data, token)

    domain_type = EmailVerificationService.get_domain_type(user)

    if error_key:
        error_msg = ERROR_MESSAGES[error_key]
        if platform == var_sys.Platform.WEB:
            return HttpResponseRedirect(
                helper.get_full_client_url(
                    f"{redirect_login}/?errorMessage={error_msg}", domain_type
                )
            )
        return response_data(
            status=status.HTTP_400_BAD_REQUEST,
            errors={"errorMessage": [error_msg]},
        )

    # Success
    if platform == var_sys.Platform.WEB:
        return HttpResponseRedirect(
            helper.get_full_client_url(
                f"{redirect_login}/?successMessage={SUCCESS_MESSAGES['EMAIL_VERIFIED']}",
                domain_type,
            )
        )
    return response_data(status=status.HTTP_200_OK)




@api_view(http_method_names=["post"])
@permission_classes([AllowAny])
def forgot_password(request):
    serializer = ForgotPasswordSerializer(data=request.data)
    if not serializer.is_valid():
        return response_data(
            status=status.HTTP_400_BAD_REQUEST,
            errors=serializer.errors,
        )

    email = serializer.validated_data["email"]
    platform = serializer.validated_data["platform"]

    try:
        PasswordResetService.request_reset(email, platform)
        return response_data()
    except UserNotFoundError:
        return response_data(
            status=status.HTTP_400_BAD_REQUEST,
            errors={"errorMessage": [ERROR_MESSAGES["EMAIL_NOT_REGISTERED"]]},
        )
    except CooldownActiveError:
        return response_data(
            status=status.HTTP_400_BAD_REQUEST,
            errors={"errorMessage": [ERROR_MESSAGES["PASSWORD_RESET_EMAIL_COOLDOWN"]]},
        )


@api_view(http_method_names=["post"])
@permission_classes([AllowAny])
def reset_password(request):
    data = request.data

    serializer = ResetPasswordSerializer(data=data)

    if not serializer.is_valid():
        return response_data(
            status=status.HTTP_400_BAD_REQUEST, errors=serializer.errors
        )

    try:
        result = PasswordResetService.reset_password(serializer.validated_data)
        result["successMessage"] = SUCCESS_MESSAGES["PASSWORD_RESET_SUCCESS"]
        return response_data(status=status.HTTP_200_OK, data=result)
    except (InvalidTokenError, TokenExpiredError) as e:
        return response_data(
            status=status.HTTP_400_BAD_REQUEST,
            errors=e.args[0] if e.args else str(e)
        )


@api_view(http_method_names=["put"])
@permission_classes(permission_classes=[IsAuthenticated])
def change_password(request):
    data = request.data
    serializer = UpdatePasswordSerializer(
        request.user, data=data, context={"user": request.user}
    )

    if not serializer.is_valid():
        return response_data(
            status=status.HTTP_400_BAD_REQUEST, errors=serializer.errors
        )

    try:
        AccountService.update_password(
            user=request.user,
            old_password=serializer.validated_data.get("oldPassword"),
            new_password=serializer.validated_data.get("newPassword")
        )
    except ValueError as e:
        return response_data(
            status=status.HTTP_400_BAD_REQUEST,
            errors={"oldPassword": [str(e)]}
        )

    return response_data(status=status.HTTP_200_OK)


@api_view(http_method_names=["patch"])
@permission_classes(permission_classes=[IsAuthenticated])
def update_user_account(request):
    data = request.data

    user = request.user

    user_account_serializer = UserSerializer(
        user, data=data, partial=True, fields=["id", "fullName"]
    )

    if not user_account_serializer.is_valid():
        return response_data(
            status=status.HTTP_400_BAD_REQUEST,
            errors=user_account_serializer.errors,
        )

    user_account_serializer.save()

    user_info_serializer = UserSerializer(user)

    return response_data(
        status=status.HTTP_200_OK, data=user_info_serializer.data
    )


@api_view(http_method_names=["put", "delete"])
@permission_classes(permission_classes=[IsAuthenticated])
def avatar(request):
    if request.method == "PUT":
        files = request.FILES
        avatar_serializer = AvatarSerializer(request.user, data=files)

        if not avatar_serializer.is_valid():
            return response_data(
                status=status.HTTP_400_BAD_REQUEST, errors=avatar_serializer.errors
            )

        avatar_file = avatar_serializer.validated_data["file"]
        avatar_url = AvatarService.update_avatar(request.user, avatar_file)
        return response_data(
            status=status.HTTP_200_OK,
            data={"avatarUrl": avatar_url}
        )

    if request.method == "DELETE":
        avatar_url = AvatarService.delete_avatar(request.user)
        return response_data(
            status=status.HTTP_200_OK,
            data={"avatarUrl": avatar_url}
        )

    return response_data(status=status.HTTP_405_METHOD_NOT_ALLOWED)


@api_view(http_method_names=["post"])
@permission_classes([AllowAny])
def employer_register(request):
    data = request.data
    serializer = EmployerRegisterSerializer(data=data)

    if not serializer.is_valid():
        return response_data(
            status=status.HTTP_400_BAD_REQUEST, errors=serializer.errors
        )

    # Move business logic to RegistrationService
    user = RegistrationService.register_employer(serializer.validated_data)

    platform = serializer.validated_data.get("platform")
    if user:
        try:
            helper.send_email_verify_email(request, user, platform=platform)
        except Exception as ex:
            helper.print_log_error("employer_register.send_verify_email", ex)

    return response_data(status=status.HTTP_201_CREATED)


@api_view(http_method_names=["post"])
@permission_classes([AllowAny])
def job_seeker_register(request):
    data = request.data
    serializer = JobSeekerRegisterSerializer(data=data)

    if not serializer.is_valid():
        return response_data(
            status=status.HTTP_400_BAD_REQUEST, errors=serializer.errors
        )

    # Move business logic to RegistrationService
    user = RegistrationService.register_job_seeker(serializer.validated_data)

    platform = serializer.validated_data.get("platform")
    if user:
        try:
            helper.send_email_verify_email(request=request, user=user, platform=platform)
        except Exception as ex:
            helper.print_log_error("job_seeker_register.send_verify_email", ex)

    return response_data(status=status.HTTP_201_CREATED)


@api_view(http_method_names=["GET"])
@permission_classes(permission_classes=[IsAuthenticated])
def get_user_info(request):
    start_at = time.monotonic()
    if getattr(settings, "DEBUG", False):
        reset_queries()

    user_info = _get_user_for_info(request.user.id, include_memberships=True)
    user_info_serializer = UserSerializer(user_info)
    response = response_data(status=status.HTTP_200_OK, data=user_info_serializer.data)

    _log_user_info_perf("full", request.user.id, start_at)
    return response


@api_view(http_method_names=["GET"])
@permission_classes(permission_classes=[IsAuthenticated])
def get_user_info_basic(request):
    start_at = time.monotonic()
    if getattr(settings, "DEBUG", False):
        reset_queries()

    user_info = _get_user_for_info(request.user.id, include_memberships=False)
    user_info_serializer = UserSerializer(user_info, fields=USER_INFO_BASIC_FIELDS)
    response = response_data(status=status.HTTP_200_OK, data=user_info_serializer.data)

    _log_user_info_perf("basic", request.user.id, start_at)
    return response


@api_view(http_method_names=["GET"])
@permission_classes(permission_classes=[IsAuthenticated])
def get_user_workspaces(request):
    start_at = time.monotonic()
    if getattr(settings, "DEBUG", False):
        reset_queries()

    user_info = _get_user_for_info(request.user.id, include_memberships=True)
    user_info_serializer = UserSerializer(user_info, fields=USER_WORKSPACE_FIELDS)
    response = response_data(status=status.HTTP_200_OK, data=user_info_serializer.data)

    _log_user_info_perf("workspaces", request.user.id, start_at)
    return response


class UserSettingAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_setting = request.user

        user_info_serializer = UserSettingSerializer(user_setting)

        return response_data(status=status.HTTP_200_OK, data=user_info_serializer.data)

    def put(self, request):
        user_settings_serializer = UserSettingSerializer(
            request.user, data=request.data
        )

        if not user_settings_serializer.is_valid():
            return response_data(
                status=status.HTTP_400_BAD_REQUEST,
                errors=user_settings_serializer.errors,
            )

        user_settings_serializer.save()

        return response_data(
            data=user_settings_serializer.data, status=status.HTTP_200_OK
        )


class UserViewSet(
    viewsets.ViewSet,
    generics.ListAPIView,
    generics.UpdateAPIView,
    generics.DestroyAPIView,
):
    queryset = User.objects.all()

    serializer_class = UserSerializer

    permission_classes = [perms_custom.IsAdminUser]

    renderer_classes = [renderers.MyJSONRenderer]

    pagination_class = paginations.CustomPagination

    def get_queryset(self):
        queryset = User.objects.all().order_by("-id")
        role_name = self.request.query_params.get("roleName", None)
        if role_name:
            queryset = queryset.filter(role_name=role_name)

        search = self.request.query_params.get("search", None)

        if search:
            queryset = queryset.filter(
                Q(full_name__icontains=search) | Q(email__icontains=search)
            )

        return queryset

    def update(self, request, *args, **kwargs):
        if "roleName" in request.data and str(request.user.pk) == str(
            kwargs.get("pk")
        ):
            return response_data(
                status=status.HTTP_400_BAD_REQUEST,
                errors={
                    "detail": ERROR_MESSAGES.get(
                        "CANNOT_CHANGE_OWN_ROLE", "Cannot change your own role."
                    )
                },
            )
        return super().update(request, *args, **kwargs)

    @action(methods=["post"], detail=True, url_path="toggle-active", url_name="toggle-active")
    def toggle_active(self, request, pk=None):
        try:
            user = AccountService.toggle_active(pk, request.user)
            return response_data(data={"isActive": user.is_active})

        except PermissionError as e:
            return response_data(
                status=status.HTTP_400_BAD_REQUEST,
                errors={"detail": str(e)},
            )
        except UserNotFoundError as e:
            return response_data(
                status=status.HTTP_404_NOT_FOUND,
                errors={"detail": str(e)},
            )
