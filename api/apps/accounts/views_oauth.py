import copy
import json
import logging

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

                    role_name = token.user.role_name
                    allow_login = role_name == role_name_input
                    
                    if role_name_input == var_sys.EMPLOYER and not allow_login:
                        try:
                            from apps.profiles.models import CompanyMember

                            allow_login = CompanyMember.objects.filter(
                                user=token.user,
                                is_active=True,
                                status=CompanyMember.STATUS_ACTIVE,
                            ).exists()
                        except Exception:
                            allow_login = False
                            
                    # C5 Fix: If a non-admin tries to login as ADMIN, log it and block explicitly
                    if role_name_input == var_sys.ADMIN and not allow_login:
                        logger.warning(
                            "Suspicious ADMIN login attempt from non-admin user ID: %s", 
                            token.user.id
                        )

                    if not allow_login:
                        return response_data(
                            status=status.HTTP_400_BAD_REQUEST,
                            errors={"errorMessage": ["Tài khoản hoặc mật khẩu không chính xác."]}
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

    def get_google_access_token(self, code, redirect_uri=None):
        """
        Get access token from Google OAuth2 by authorization code
        """
        try:
            normalized_redirect_uri = self._normalize_redirect_uri(redirect_uri)
            allowed_redirect_uris = self._get_allowed_redirect_uris()
            if normalized_redirect_uri:
                if normalized_redirect_uri not in allowed_redirect_uris:
                    raise BadRequest("redirect_uri khÃƒÂ´ng hÃƒÂ³p lÃ¡Â»â€¡")
                redirect_uri_value = normalized_redirect_uri
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
                raise BadRequest("XÃ¡c thá»±c tháº¥t báº¡i")

            # Parse response JSON
            response_data = response.json()

            access_token = response_data.get("access_token")

            if not access_token:
                raise BadRequest("XÃ¡c thá»±c tháº¥t báº¡i")

            return access_token

        except Exception as ex:
            helper.print_log_error("get_google_access_token", ex)
            raise BadRequest("XÃ¡c thá»±c tháº¥t báº¡i")

    def post(self, request, *args, **kwargs):
        try:
            mutable_data = request.data.copy()
            request_data = mutable_data.copy()
            redirect_uri = request_data.pop("redirect_uri", None)

            # If backend is google-oauth2, get access token from code
            # If Facebook doesn't need to get access token, because it's using access token
            if request_data.get("backend") == "google-oauth2":
                request_data["token"] = self.get_google_access_token(
                    request_data.get("token"),
                    redirect_uri=redirect_uri,
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

            res_data = json.loads(body)

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

    def post(self, request, *args, **kwargs):
        id_token = request.data.get("token")
        role_name = request.data.get("role_name")
        client_id = request.data.get("client_id")
        client_secret = request.data.get("client_secret")

        if not id_token or not role_name:
            return response_data(
                status=status.HTTP_400_BAD_REQUEST,
                errors={"token": ["Token và role_name là bắt buộc."]},
            )

        # Validate role_name - NEVER allow ADMIN via Firebase login
        if role_name not in self.ALLOWED_FIREBASE_ROLES:
            logger.warning(
                "Firebase login attempt with disallowed role: %s", role_name
            )
            return response_data(
                status=status.HTTP_400_BAD_REQUEST,
                errors={"role_name": ["Role không hợp lệ."]},
            )

        decoded_token = verify_id_token(id_token)
        if not decoded_token:
            return response_data(
                status=status.HTTP_400_BAD_REQUEST,
                errors={
                    "token": ["Token không hợp lệ hoặc đã hết hạn."]
                },
            )

        phone_number = decoded_token.get("phone_number")
        if not phone_number:
            return response_data(
                status=status.HTTP_400_BAD_REQUEST,
                errors={"token": ["Token không chứa số điện thoại."]},
            )

        # Find or create user
        user = User.objects.filter(phone_number=phone_number).first()
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
                        profile = JobSeekerProfile.objects.create(user=user)
                        Resume.objects.create(
                            job_seeker_profile=profile,
                            user=user,
                            type=var_sys.CV_WEBSITE,
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
