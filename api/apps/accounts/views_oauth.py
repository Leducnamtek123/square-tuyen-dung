import copy
import json
import logging
import re

import requests
from django.db import transaction

from datetime import timedelta

from django.conf import settings
from django.core.exceptions import BadRequest
from django.http import QueryDict
from django.utils import timezone

from rest_framework import status
from rest_framework.response import Response

from drf_social_oauth2.views import TokenView, ConvertTokenView, RevokeTokenView

from oauth2_provider.models import (
    get_access_token_model,
    get_refresh_token_model,
    get_application_model,
)
from oauthlib.common import generate_token

from social_django.models import UserSocialAuth

from shared.configs import variable_system as var_sys
from shared.configs.messages import ERROR_MESSAGES
from shared.configs.variable_response import response_data
from shared.helpers import helper

from common.firebase import verify_id_token

from .models import User

logger = logging.getLogger(__name__)


def _phone_digits(value):
    return re.sub(r"\D", "", str(value or ""))


def _normalize_phone_key(value):
    digits = _phone_digits(value)
    if not digits:
        return ""
    if digits.startswith("84") and len(digits) >= 10:
        return f"84{digits[2:]}"
    if digits.startswith("0") and len(digits) >= 10:
        return f"84{digits[1:]}"
    return digits


def _phone_lookup_values(phone_number):
    digits = _phone_digits(phone_number)
    values = {str(phone_number or "").strip(), digits}
    if digits.startswith("84") and len(digits) >= 10:
        national = f"0{digits[2:]}"
        values.update({f"+{digits}", national})
    elif digits.startswith("0") and len(digits) >= 10:
        e164_digits = f"84{digits[1:]}"
        values.update({f"+{e164_digits}", e164_digits})
    return {value for value in values if value}


def _national_phone_from_e164(phone_number):
    digits = _phone_digits(phone_number)
    if digits.startswith("84") and len(digits) >= 10:
        return f"0{digits[2:]}"
    return digits or str(phone_number or "").strip()


def _build_oauth_request(request, payload):
    oauth_request = copy.copy(request._request)
    post_data = QueryDict("", mutable=True)
    for key, value in payload.items():
        if isinstance(value, list):
            post_data.setlist(key, value)
        else:
            post_data[key] = str(value)
    oauth_request.POST = post_data
    oauth_request.method = "POST"
    return oauth_request


def _can_login_as_role(user, role_name_input):
    if not role_name_input:
        return True

    if user.role_name == role_name_input:
        return True

    if role_name_input == var_sys.EMPLOYER:
        try:
            from apps.profiles.models import CompanyMember

            return CompanyMember.objects.filter(
                user=user,
                is_active=True,
                status=CompanyMember.STATUS_ACTIVE,
            ).exists()
        except Exception:
            return False

    return False


class CustomTokenView(TokenView):
    def post(self, request, *args, **kwargs):
        mutable_data = request.data.copy()

        role_name_input = mutable_data.get("role_name", None)

        grant_type = mutable_data.get("grant_type")
        if grant_type == "password" and not role_name_input:
            return response_data(status=status.HTTP_400_BAD_REQUEST)

        oauth_request = _build_oauth_request(request, mutable_data)
        url, headers, body, stt = self.create_token_response(oauth_request)

        if stt == status.HTTP_200_OK:
            if grant_type == "password":
                body_data = json.loads(body)

                access_token = body_data.get("access_token")

                if access_token is not None:
                    token = get_access_token_model().objects.get(token=access_token)

                    allow_login = _can_login_as_role(token.user, role_name_input)
                            
                    # C5 Fix: If a non-admin tries to login as ADMIN, log it and block explicitly
                    if role_name_input == var_sys.ADMIN and not allow_login:
                        logger.warning(
                            "Suspicious ADMIN login attempt from non-admin user ID: %s", 
                            token.user.id
                        )

                    if not allow_login:
                        return response_data(
                            status=status.HTTP_400_BAD_REQUEST,
                            errors={"errorMessage": ["TÃ i khoáº£n hoáº·c máº­t kháº©u khÃ´ng chÃ­nh xÃ¡c."]}
                        )

            return response_data(status=stt, data=json.loads(body))

        if stt == status.HTTP_400_BAD_REQUEST:
            email = mutable_data.get("username", None)

            password = mutable_data.get("password", "")

            user = User.objects.filter(email=email).first()

            if not user:
                return response_data(
                    status=stt,
                    errors={"errorMessage": [ERROR_MESSAGES["INVALID_EMAIL"]]},
                )

            if not user.is_active:
                return response_data(
                    status=stt,
                    errors={"errorMessage": [ERROR_MESSAGES["ACCOUNT_DISABLED"]]},
                )

            if not user.check_password(password):
                return response_data(
                    status=stt,
                    errors={"errorMessage": [ERROR_MESSAGES["INCORRECT_PASSWORD"]]},
                )

            return response_data(
                status=stt,
                errors={"errorMessage": [ERROR_MESSAGES["LOGIN_ERROR"]]},
            )

        return response_data(status=stt)


class CustomConvertTokenView(ConvertTokenView):
    def _normalize_redirect_uri(self, value):
        if not value:
            return None
        return str(value).strip().rstrip("/")

    def _get_allowed_redirect_uris(self):
        allowed = []
        for candidate in (
            getattr(settings, "WEB_JOB_SEEKER_CLIENT_URL", None),
            getattr(settings, "WEB_EMPLOYER_CLIENT_URL", None),
        ):
            normalized = self._normalize_redirect_uri(candidate)
            if normalized:
                allowed.append(normalized)
        return allowed

    def get_google_access_token(self, code, redirect_uri=None, request_origin=None):
        """
        Get access token from Google OAuth2 by authorization code
        """
        try:
            normalized_redirect_uri = self._normalize_redirect_uri(redirect_uri)
            allowed_redirect_uris = self._get_allowed_redirect_uris()

            normalized_request_origin = self._normalize_redirect_uri(request_origin)
            if normalized_request_origin and normalized_request_origin not in allowed_redirect_uris:
                if normalized_request_origin.startswith(("http://localhost", "https://localhost", "http://127.0.0.1", "https://127.0.0.1")):
                    allowed_redirect_uris.append(normalized_request_origin)

            if normalized_redirect_uri:
                if normalized_redirect_uri not in allowed_redirect_uris:
                    raise BadRequest("redirect_uri invalid")
                redirect_uri_value = normalized_redirect_uri
            elif normalized_request_origin and normalized_request_origin in allowed_redirect_uris:
                redirect_uri_value = normalized_request_origin
            else:
                redirect_uri_value = settings.SOCIAL_AUTH_GOOGLE_OAUTH2_REDIRECT_URI

            # Send request to Google OAuth2 token endpoint
            data = {
                "code": code,
                "client_id": settings.SOCIAL_AUTH_GOOGLE_OAUTH2_KEY,
                "client_secret": settings.SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET,
                "redirect_uri": redirect_uri_value,
                "grant_type": "authorization_code",
            }

            response = requests.post(
                settings.SOCIAL_AUTH_GOOGLE_OAUTH2_TOKEN_URL,
                data=data,
            )

            # Check response status
            if response.status_code != 200:
                error_message = "Authentication failed"
                try:
                    response_json = response.json()
                    error_message = response_json.get("error_description") or response_json.get("error") or error_message
                except Exception:
                    raw_body = (response.text or "").strip()
                    if raw_body:
                        error_message = raw_body
                raise BadRequest(error_message)

            # Parse response JSON
            response_data = response.json()

            access_token = response_data.get("access_token")

            if not access_token:
                raise BadRequest("Authentication failed")

            return access_token

        except BadRequest:
            raise
        except Exception as ex:
            helper.print_log_error("get_google_access_token", ex)
            raise BadRequest("Authentication failed")

    def post(self, request, *args, **kwargs):
        try:
            mutable_data = request.data.copy()
            request_data = mutable_data.copy()
            redirect_uri = request_data.pop("redirect_uri", None)
            role_name_input = request_data.pop(
                "role_name",
                request_data.pop("roleName", None),
            )

            # If backend is google-oauth2, get access token from code
            # If Facebook doesn't need to get access token, because it's using access token
            if request_data.get("backend") == "google-oauth2":
                request_data["token"] = self.get_google_access_token(
                    request_data.get("token"),
                    redirect_uri=redirect_uri,
                    request_origin=request.headers.get("Origin"),
                )

            oauth_request = _build_oauth_request(request, request_data)
            url, headers, body, stt = self.create_token_response(oauth_request)

            if stt == status.HTTP_400_BAD_REQUEST:
                error_body = json.loads(body)

                error = error_body.get("error", "")

                error_description = error_body.get("error_description", "")

                if (
                    error == "invalid_grant"
                    and error_description == "User inactive or deleted."
                ):
                    return response_data(
                        status=stt,
                        errors={
                            "errorMessage": [
                                ERROR_MESSAGES["ACCOUNT_DEACTIVATED"]
                            ]
                        },
                    )

                return response_data(
                    status=stt,
                    errors={
                        "errorMessage": [
                            error_description or ERROR_MESSAGES["LOGIN_ERROR"]
                        ]
                    },
                )

            res_data = json.loads(body)

            if stt == status.HTTP_200_OK and role_name_input:
                access_token = res_data.get("access_token")
                if access_token:
                    token = get_access_token_model().objects.get(token=access_token)
                    allow_login = _can_login_as_role(token.user, role_name_input)

                    if role_name_input == var_sys.ADMIN and not allow_login:
                        logger.warning(
                            "Suspicious ADMIN social login attempt from non-admin user ID: %s",
                            token.user.id,
                        )

                    if not allow_login:
                        user_role = token.user.role_name
                        if user_role == var_sys.JOB_SEEKER and role_name_input == var_sys.EMPLOYER:
                            error_msg = "Tài khoản Google này đã đăng ký với vai trò Người tìm việc. Vui lòng đăng nhập với vai trò Người tìm việc."
                        elif user_role == var_sys.EMPLOYER and role_name_input == var_sys.JOB_SEEKER:
                            error_msg = "Tài khoản Google này đã đăng ký với vai trò Nhà tuyển dụng. Vui lòng đăng nhập với vai trò Nhà tuyển dụng."
                        else:
                            error_msg = ERROR_MESSAGES["LOGIN_ERROR"]

                        return response_data(
                            status=status.HTTP_400_BAD_REQUEST,
                            errors={
                                "errorMessage": [error_msg]
                            },
                        )

            res_data["backend"] = mutable_data["backend"]

            return response_data(status=stt, data=res_data)

        except BadRequest as ex:
            str_ex = str(ex)

            return response_data(
                status=status.HTTP_400_BAD_REQUEST,
                errors={"errorMessage": [str_ex]},
            )


class CustomRevokeTokenView(RevokeTokenView):
    def facebook_revoke_token(self, access_token):
        response = requests.delete(
            url=settings.SOCIAL_AUTH_FACEBOOK_OAUTH2_REVOKE_TOKEN_URL,
            headers={"Authorization": "Bearer {}".format(access_token)},
        )

        if response.status_code == status.HTTP_200_OK:
            logger.info("Revoke facebook token success.")

    def google_revoke_token(self, access_token):
        pass

    def post(self, request, *args, **kwargs):
        # Use the rest framework `.data` to fake the post body of the django request.
        mutable_data = request.data.copy()

        backend = mutable_data.pop("backend", None)

        oauth_request = _build_oauth_request(request, mutable_data)

        # revoke social token
        if backend and backend != "0" and backend != "undefined":
            social_auth_usersocialauth = UserSocialAuth.objects.filter(
                user=request.user, provider=backend
            ).first()
            if social_auth_usersocialauth:
                extra_data = social_auth_usersocialauth.extra_data

                if extra_data["expires"] is None:
                    social_access_token = extra_data["access_token"]

                    if backend == "facebook":
                        self.facebook_revoke_token(social_access_token)
                    elif backend == "google-oauth2":
                        self.google_revoke_token(social_access_token)

        url, headers, body, revoke_status = self.create_revocation_response(oauth_request)

        response = Response(
            data=json.loads(body) if body else "", status=revoke_status if body else 200
        )

        for k, v in headers.items():
            response[k] = v

        return response


class FirebaseLoginView(TokenView):
    # Only these roles are allowed via Firebase phone login
    ALLOWED_FIREBASE_ROLES = {var_sys.JOB_SEEKER, var_sys.EMPLOYER}

    def _find_existing_user_by_phone(self, phone_number, role_name):
        user = User.objects.filter(phone_number=phone_number).first()
        if user:
            return user, None

        phone_key = _normalize_phone_key(phone_number)
        if not phone_key:
            return None, None

        matched_users = []
        lookup_values = _phone_lookup_values(phone_number)

        if role_name == var_sys.JOB_SEEKER:
            from apps.profiles.models import JobSeekerProfile

            profiles = (
                JobSeekerProfile.objects.select_related("user")
                .filter(phone__in=lookup_values)
                .exclude(user__isnull=True)
            )
            for profile in profiles:
                if _normalize_phone_key(profile.phone) == phone_key:
                    matched_users.append(profile.user)

        if role_name == var_sys.EMPLOYER:
            from apps.profiles.models import Company

            companies = (
                Company.objects.select_related("user")
                .filter(company_phone__in=lookup_values)
                .exclude(user__isnull=True)
            )
            for company in companies:
                if _normalize_phone_key(company.company_phone) == phone_key:
                    matched_users.append(company.user)

        unique_users = {user.id: user for user in matched_users}
        if len(unique_users) > 1:
            return None, "Sá»‘ Ä‘iá»‡n thoáº¡i nÃ y Ä‘ang liÃªn káº¿t vá»›i nhiá»u tÃ i khoáº£n. Vui lÃ²ng Ä‘Äƒng nháº­p báº±ng email hoáº·c liÃªn há»‡ há»— trá»£."

        user = next(iter(unique_users.values()), None)
        if user and not user.phone_number:
            user.phone_number = phone_number
            user.save(update_fields=["phone_number"])

        return user, None

    def post(self, request, *args, **kwargs):
        id_token = request.data.get("token")
        role_name = request.data.get("role_name")
        client_id = request.data.get("client_id")

        if not id_token or not role_name:
            return response_data(
                status=status.HTTP_400_BAD_REQUEST,
                errors={"token": ["Token vÃ  role_name lÃ  báº¯t buá»™c."]},
            )

        # Validate role_name - NEVER allow ADMIN via Firebase login
        if role_name not in self.ALLOWED_FIREBASE_ROLES:
            logger.warning(
                "Firebase login attempt with disallowed role: %s", role_name
            )
            return response_data(
                status=status.HTTP_400_BAD_REQUEST,
                errors={"role_name": ["Role khÃ´ng há»£p lá»‡."]},
            )

        decoded_token = verify_id_token(id_token)
        if not decoded_token:
            return response_data(
                status=status.HTTP_400_BAD_REQUEST,
                errors={
                    "token": ["Token khÃ´ng há»£p lá»‡ hoáº·c Ä‘Ã£ háº¿t háº¡n."]
                },
            )

        phone_number = decoded_token.get("phone_number")
        if not phone_number:
            return response_data(
                status=status.HTTP_400_BAD_REQUEST,
                errors={"token": ["Token khÃ´ng chá»©a sá»‘ Ä‘iá»‡n thoáº¡i."]},
            )

        # Find or create user. Prefer linking phone login to an existing account
        # whose profile already owns this verified phone number.
        user, phone_lookup_error = self._find_existing_user_by_phone(phone_number, role_name)
        if phone_lookup_error:
            return response_data(
                status=status.HTTP_400_BAD_REQUEST,
                errors={"errorMessage": [phone_lookup_error]},
            )

        if not user:
            dummy_email = f"{phone_number.replace('+', '')}" + "@phone.auth"
            user = User.objects.filter(email=dummy_email).first()
            if not user:
                with transaction.atomic():
                    user = User.objects.create_user_with_role_name(
                        email=dummy_email,
                        full_name=f"User {phone_number}",
                        role_name=role_name,
                        phone_number=phone_number,
                        is_active=True,
                        is_verify_email=True,
                    )
                    # Create associated profile for JOB_SEEKER
                    if role_name == var_sys.JOB_SEEKER:
                        from apps.profiles.models import JobSeekerProfile, Resume
                        profile = JobSeekerProfile.objects.create(
                            user=user,
                            phone=_national_phone_from_e164(phone_number),
                        )
                        Resume.objects.create(
                            job_seeker_profile=profile,
                            user=user,
                            type=var_sys.CV_WEBSITE,
                        )

        if not user.is_active:
            return response_data(
                status=status.HTTP_400_BAD_REQUEST,
                errors={"errorMessage": [ERROR_MESSAGES["ACCOUNT_DISABLED"]]},
            )

        if not _can_login_as_role(user, role_name):
            return response_data(
                status=status.HTTP_400_BAD_REQUEST,
                errors={"errorMessage": [ERROR_MESSAGES["LOGIN_ERROR"]]},
            )

        # Identify Application
        Application = get_application_model()
        try:
            if client_id:
                application = Application.objects.get(client_id=client_id)
            else:
                application = Application.objects.first()
        except Application.DoesNotExist:
            return response_data(
                status=status.HTTP_400_BAD_REQUEST,
                errors={"client_id": ["Application khÃ´ng tá»“n táº¡i."]},
            )

        # Generate tokens
        AccessToken = get_access_token_model()
        RefreshToken = get_refresh_token_model()

        expires = timezone.now() + timedelta(
            seconds=settings.OAUTH2_PROVIDER["ACCESS_TOKEN_EXPIRE_SECONDS"]
        )
        access_token = AccessToken.objects.create(
            user=user,
            application=application,
            token=generate_token(),
            expires=expires,
            scope="read write",
        )

        refresh_token = RefreshToken.objects.create(
            user=user,
            application=application,
            token=generate_token(),
            access_token=access_token,
        )

        res_data = {
            "access_token": access_token.token,
            "refresh_token": refresh_token.token,
            "expires_in": settings.OAUTH2_PROVIDER["ACCESS_TOKEN_EXPIRE_SECONDS"],
            "token_type": "Bearer",
            "scope": "read write",
        }

        return response_data(status=status.HTTP_200_OK, data=res_data)

