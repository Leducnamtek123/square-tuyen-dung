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
            errors={"email": ["Email lÃ  báº¯t buá»™c."]},
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

    user = User.objects.filter(email__iexact=email)

    if role_name is not None:
        if role_name == var_sys.EMPLOYER:
            try:
                member_user_ids = CompanyMember.objects.filter(
                    is_active=True,
                    status=CompanyMember.STATUS_ACTIVE,
                ).values_list("user_id", flat=True)
                user = user.filter(Q(role_name=role_name) | Q(id__in=member_user_ids))
            except Exception:
                user = user.filter(role_name=role_name)
        else:
            user = user.filter(role_name=role_name)

    res_data["email"] = email

    if user.exists():
        user = user.first()

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

    try:
        helper.send_email_verify_email(request, user, platform=platform)
    except Exception as ex:
        helper.print_log_error("send_verify_email", ex)
        return response_data(status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return response_data(status=status.HTTP_200_OK, data={"emailVerified": False})


@api_view(http_method_names=["GET"])
@permission_classes([AllowAny])
def user_active(request, encoded_data, token):
    if "platform" not in request.GET:
        return HttpResponseNotFound()

    platform = request.GET.get("platform")

    if platform != var_sys.Platform.WEB and platform != var_sys.Platform.APP:
        return HttpResponseNotFound()

    redirect_login = ""

    if platform == var_sys.Platform.WEB:
        if "redirectLogin" not in request.GET:
            return HttpResponseNotFound()

        redirect_login = request.GET.get("redirectLogin")

        if redirect_login != settings.REDIRECT_LOGIN_CLIENT:
            return HttpResponseNotFound()

    try:
        uid, expiration_time = helper.urlsafe_base64_decode_with_encoded_data(
            encoded_data
        )

        if uid is None or expiration_time is None:
            if platform == var_sys.Platform.WEB:
                domain_type = "job_seeker"

                return HttpResponseRedirect(
                    helper.get_full_client_url(
                        f"{redirect_login}/?errorMessage={ERROR_MESSAGES['INVALID_EMAIL_VERIFICATION']}",
                        domain_type,
                    )
                )
            return response_data(
                status=status.HTTP_400_BAD_REQUEST,
                errors={"errorMessage": [ERROR_MESSAGES["INVALID_EMAIL_VERIFICATION"]]},
            )

        user = User.objects.get(pk=uid)

        if not helper.check_expiration_time(expiration_time):
            if platform == var_sys.Platform.WEB:
                domain_type = (
                    "job_seeker"
                    if user.role_name == var_sys.JOB_SEEKER
                    else "employer"
                )

                return HttpResponseRedirect(
                    helper.get_full_client_url(
                        f"{redirect_login}/?errorMessage={ERROR_MESSAGES['EMAIL_VERIFICATION_EXPIRED']}",
                        domain_type,
                    )
                )

            return response_data(
                status=status.HTTP_400_BAD_REQUEST,
                errors={
                    "errorMessage": [ERROR_MESSAGES["EMAIL_VERIFICATION_EXPIRED"]]
                },
            )

    except Exception as ex:
        user = None

        helper.print_log_error("user_active", ex)

    if user is not None and email_verification_token.check_token(user, token):
        user.is_active = True

        user.is_verify_email = True

        user.save()

        noti_title = SYSTEM_MESSAGES["WELCOME_JOBSEEKER"]

        if user.role_name == var_sys.EMPLOYER:
            noti_title = SYSTEM_MESSAGES["WELCOME_EMPLOYER"]

        # add notification welcome
        helper.add_system_notifications(
            "ChÃ o má»«ng báº¡n!",
            noti_title,
            [user.id],
        )

        if platform == var_sys.Platform.WEB:
            domain_type = (
                "job_seeker"
                if user.role_name == var_sys.JOB_SEEKER
                else "employer"
            )

            return HttpResponseRedirect(
                helper.get_full_client_url(
                    f"{redirect_login}/?successMessage={SUCCESS_MESSAGES['EMAIL_VERIFIED']}",
                    domain_type,
                )
            )

        return response_data(status=status.HTTP_200_OK)

    if platform == var_sys.Platform.WEB:
        domain_type = "job_seeker"

        if user:
            domain_type = (
                "job_seeker"
                if user.role_name == var_sys.JOB_SEEKER
                else "employer"
            )

        return HttpResponseRedirect(
            helper.get_full_client_url(
                f"{redirect_login}/?errorMessage={ERROR_MESSAGES['INVALID_EMAIL_VERIFICATION']}",
                domain_type,
            )
        )

    return response_data(
        status=status.HTTP_400_BAD_REQUEST,
        errors={"errorMessage": [ERROR_MESSAGES["INVALID_EMAIL_VERIFICATION"]]},
    )


@api_view(http_method_names=["post"])
@permission_classes([AllowAny])
def forgot_password(request):
    data = request.data

    forgot_password_serializer = ForgotPasswordSerializer(data=data)

    if not forgot_password_serializer.is_valid():
        return response_data(
            status=status.HTTP_400_BAD_REQUEST,
            errors=forgot_password_serializer.errors,
        )

    email = forgot_password_serializer.validated_data.get("email")

    platform = forgot_password_serializer.validated_data.get("platform")

    user = User.objects.filter(email=email).first()

    if user:
        try:
            now = datetime.datetime.now()

            now = now.astimezone(pytz.utc)

            tokens = ForgotPasswordToken.objects.filter(
                user=user,
                is_active=True,
                platform=platform,
                expired_at__gte=now,
            )

            if tokens.exists():
                token = tokens.first()

                token_created_at = token.create_at

                if (now - token_created_at).total_seconds() < settings.PROJECT_AUTH[
                    "TIME_REQUIRED_FORGOT_PASSWORD"
                ]:
                    return response_data(
                        status=status.HTTP_400_BAD_REQUEST,
                        errors={
                            "errorMessage": [
                                ERROR_MESSAGES["PASSWORD_RESET_EMAIL_COOLDOWN"]
                            ]
                        },
                    )

            with transaction.atomic():
                ForgotPasswordToken.objects.filter(
                    user=user, is_active=True, platform=platform
                ).update(is_active=False)

                expired_at = now + datetime.timedelta(
                    seconds=settings.PROJECT_AUTH["RESET_PASSWORD_EXPIRE_SECONDS"]
                )

                if platform == "WEB":
                    access_token = urlsafe_base64_encode(force_bytes(user.pk))

                    # Redirect to the domain of the role name
                    if user.role_name == var_sys.JOB_SEEKER:
                        domain = settings.DOMAIN_CLIENT["job_seeker"]
                    else:
                        domain = settings.DOMAIN_CLIENT["employer"]

                    func = f"cap-nhat-mat-khau/{access_token}"

                    reset_password_url = domain + func

                    ForgotPasswordToken.objects.create(
                        user=user,
                        expired_at=expired_at,
                        token=access_token,
                        platform=platform,
                    )

                    # send mail reset password cho website
                    queue_mail.send_email_reset_password_for_web_task.delay(
                        to=[user.email],
                        reset_password_url=reset_password_url,
                    )

                elif platform == "APP":
                    totp = TOTP(settings.SECRET_KEY.encode())

                    code = totp.token()

                    new_token = ForgotPasswordToken.objects.create(
                        user=user,
                        expired_at=expired_at,
                        code=code,
                        platform=platform,
                    )

                    # send mail reset password cho app
                    queue_mail.send_email_reset_password_for_app_task.delay(
                        to=[user.email],
                        full_name=user.full_name,
                        code=new_token.code,
                    )

        except Exception as ex:
            helper.print_log_error("forgot_password", ex)

            return response_data(status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return response_data()

    return response_data(
        status=status.HTTP_400_BAD_REQUEST,
        errors={"errorMessage": [ERROR_MESSAGES["EMAIL_NOT_REGISTERED"]]},
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
        now = datetime.datetime.now()

        now = now.astimezone(pytz.utc)

        platform = serializer.data.get("platform")

        new_password = serializer.data.get("newPassword")

        if platform == "WEB":
            token = serializer.data.get("token")

            user_id = force_str(urlsafe_base64_decode(token))

            forgot_password_tokens = ForgotPasswordToken.objects.filter(
                token=token, user_id=user_id, is_active=True
            )

            if not forgot_password_tokens.exists():
                return response_data(
                    status=status.HTTP_400_BAD_REQUEST,
                    errors={
                        "errorMessage": [
                            ERROR_MESSAGES["INVALID_PASSWORD_RESET_LINK"]
                        ]
                    },
                )

            forgot_password_token = forgot_password_tokens.first()

            if forgot_password_token.expired_at < now:
                return response_data(
                    status=status.HTTP_400_BAD_REQUEST,
                    errors={
                        "errorMessage": [
                            ERROR_MESSAGES["PASSWORD_RESET_LINK_EXPIRED"]
                        ]
                    },
                )

            with transaction.atomic():
                user = forgot_password_token.user

                user.set_password(new_password)

                user.save()

                forgot_password_token.is_active = False

                forgot_password_token.save()

                return response_data(
                    data={"redirectLoginUrl": f"/{settings.REDIRECT_LOGIN_CLIENT}"}
                )

        else:
            code = serializer.data.get("code")

            forgot_password_tokens = ForgotPasswordToken.objects.filter(code=code)

            if not forgot_password_tokens.exists():
                return response_data(
                    status=status.HTTP_400_BAD_REQUEST,
                    errors={
                        "code": [ERROR_MESSAGES["INVALID_PASSWORD_RESET_CODE"]]
                    },
                )

            forgot_password_token = forgot_password_tokens.first()

            if forgot_password_token.expired_at < now or not forgot_password_token.is_active:
                return response_data(
                    status=status.HTTP_400_BAD_REQUEST,
                    errors={
                        "code": [ERROR_MESSAGES["PASSWORD_RESET_CODE_EXPIRED"]]
                    },
                )

            with transaction.atomic():
                user = forgot_password_token.user

                user.set_password(new_password)

                user.save()

                forgot_password_token.is_active = False

                forgot_password_token.save()

                return response_data()

    except Exception as ex:
        helper.print_log_error("reset_password", ex)

        return response_data(status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(http_method_names=["put"])
@permission_classes(permission_classes=[IsAuthenticated])
def change_password(request):
    try:
        data = request.data

        user = request.user

        reset_pass_serializer = UpdatePasswordSerializer(
            user, data=data, context={"user": request.user}
        )

        if not reset_pass_serializer.is_valid():
            return response_data(
                status=status.HTTP_400_BAD_REQUEST, errors=reset_pass_serializer.errors
            )

        reset_pass_serializer.save()

    except Exception as ex:
        helper.print_log_error("change_password", ex)

        return response_data(status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return response_data(status=status.HTTP_200_OK)


@api_view(http_method_names=["patch"])
@permission_classes(permission_classes=[IsAuthenticated])
def update_user_account(request):
    try:
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

    except Exception as ex:
        helper.print_log_error("update_user_account", ex)

        return response_data(status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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

        try:
            avatar_serializer.save()

        except Exception as ex:
            helper.print_log_error("avatar", ex)

            return response_data(status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return response_data(status=status.HTTP_200_OK, data=avatar_serializer.data)

    if request.method == "DELETE":
        user = request.user

        try:
            if user.avatar:
                is_destroy_success = CloudinaryService.delete_image(
                    user.avatar.public_id
                )

                if not is_destroy_success:
                    helper.print_log_error(
                        "destroy_avatar_in_cloud",
                        ERROR_MESSAGES["CLOUDINARY_UPLOAD_ERROR"],
                    )

                # Delete file in DB
                user.avatar.delete()

                user.avatar = None

                user.save()

            # update in firebase
            if not user.has_company:
                queue_auth.update_avatar.delay(
                    user.id, var_sys.AVATAR_DEFAULT["AVATAR"]
                )

        except Exception as ex:
            helper.print_log_error("delete_avatar", ex)

            return response_data(status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return response_data(
            status=status.HTTP_200_OK,
            data={
                "avatarUrl": user.avatar.get_full_url()
                if user.avatar
                else var_sys.AVATAR_DEFAULT["AVATAR"]
            },
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

    try:
        user = serializer.save()

        platform = serializer.validated_data.get("platform")

        if user:
            helper.send_email_verify_email(request, user, platform=platform)

    except Exception as ex:
        helper.print_log_error("employer_register", ex)

        return response_data(status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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

    try:
        user = serializer.save()

        platform = serializer.validated_data.get("platform")

        if user:
            helper.send_email_verify_email(request=request, user=user, platform=platform)

    except Exception as ex:
        helper.print_log_error("job_seeker_register", ex)

        return response_data(status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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

        try:
            user_settings_serializer.save()

        except Exception as ex:
            helper.print_log_error("update_user_setting", ex)

            return response_data(status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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
            user = self.get_object()

            if user == request.user:
                return response_data(
                    status=status.HTTP_400_BAD_REQUEST,
                    errors={
                        "detail": "Báº¡n khÃ´ng thá»ƒ tá»± khÃ³a tÃ i khoáº£n cá»§a chÃ­nh mÃ¬nh."
                    },
                )

            user.is_active = not user.is_active

            user.save()

            return response_data(data={"isActive": user.is_active})

        except Exception as ex:
            helper.print_log_error("toggle_active", ex)

            return response_data(status=status.HTTP_500_INTERNAL_SERVER_ERROR)
