from shared import pagination as paginations
from shared import renderers

from shared.configs import variable_system as var_sys
from shared.configs import variable_response as var_res
from shared.configs.messages import NOTIFICATION_MESSAGES, ERROR_MESSAGES

from django.db.models import Count, Q, Prefetch
from django.db import transaction
from django.utils import timezone

from django_filters.rest_framework import DjangoFilterBackend

from shared.helpers import helper
from shared.helpers.cloudinary_service import CloudinaryService

from .. import filters

from rest_framework import viewsets, generics, views
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import permissions as perms_sys
from rest_framework import status

from apps.accounts import permissions as perms_custom

from ..models import (
    Company,
    CompanyFollowed,
    CompanyImage,
    CompanyRole,
    CompanyMember,
)

from ..filters import CompanyFilter

from ..serializers import (
    CompanySerializer,
    CompanyFollowedSerializer,
    LogoCompanySerializer,
    CompanyCoverImageSerializer,
    CompanyImageSerializer,
    CompanyRoleSerializer,
    CompanyMemberSerializer,
)

from apps.jobs.models import JobPost
from apps.jobs import serializers as job_serializers

from .web_helpers import _get_user_company, _has_company_permission


class CompanyView(viewsets.ViewSet):

    def get_permissions(self):

        if self.action in ["get_company_info"]:

            return [perms_custom.IsEmployerUser()]

        return perms_sys.IsAuthenticated()

    def get_company_info(self, request):

        user = request.user

        try:

            company = Company.objects.get(user=user)

            company_serializer = CompanySerializer(company)

        except Exception as ex:

            helper.print_log_error("get_company_info", ex)

            return var_res.response_data(status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        else:

            return var_res.response_data(data=company_serializer.data)

    def get_job_post_detail(self, request, pk):

        try:

            user = request.user

            job_post_queryset = JobPost.objects.get(

                pk=pk, user=user, company=user.company)

            job_post_serializer = job_serializers \
                .JobPostSerializer(job_post_queryset,

                                   fields=["id", "jobName", "academicLevel", "deadline", "quantity", "genderRequired",

                                           "jobDescription", "jobRequirement", "benefitsEnjoyed", "career",

                                           "position", "typeOfWorkplace", "experience",

                                           "jobType", "salaryMin", "salaryMax", "isUrgent",

                                           "contactPersonName", "contactPersonPhone", "contactPersonEmail",

                                           "location"])

        except JobPost.DoesNotExist:

            return var_res.response_data(data=None)

        except Exception as ex:

            helper.print_log_error("get_job_post_detail", ex)

            return var_res.response_data(status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        else:

            return var_res.response_data(data=job_post_serializer.data)


class PrivateCompanyViewSet(viewsets.ViewSet,

                            generics.UpdateAPIView):

    queryset = Company.objects

    serializer_class = CompanySerializer

    permission_classes = [perms_custom.IsEmployerUser]

    renderer_classes = [renderers.MyJSONRenderer]

    @action(methods=["put"], detail=False,

            url_path="company-image-url", url_name="company-image-url")

    def update_company_image_url(self, request):

        files = request.FILES

        company = None
        if hasattr(request.user, "get_active_company"):
            company = request.user.get_active_company()
        if not company:
            company = getattr(request.user, "company", None)
        if not company:
            return var_res.response_data(status=status.HTTP_400_BAD_REQUEST)

        company_image_url_serializer = LogoCompanySerializer(

            company, data=files)

        if not company_image_url_serializer.is_valid():

            return var_res.response_data(status=status.HTTP_400_BAD_REQUEST)

        try:

            company_image_url_serializer.save()

        except Exception as ex:

            helper.print_log_error("update_company_image_url", ex)

            return var_res.response_data(status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        else:

            return var_res.response_data(status=status.HTTP_200_OK, data=company_image_url_serializer.data)

    @action(methods=["put"], detail=False,

            url_path="company-cover-image-url", url_name="company-cover-image-url")

    def update_company_cover_image_url(self, request):

        files = request.FILES

        company = None
        if hasattr(request.user, "get_active_company"):
            company = request.user.get_active_company()
        if not company:
            company = getattr(request.user, "company", None)
        if not company:
            return var_res.response_data(status=status.HTTP_400_BAD_REQUEST)

        company_cover_image_url_serializer = CompanyCoverImageSerializer(

            company, data=files)

        if not company_cover_image_url_serializer.is_valid():

            return var_res.response_data(status=status.HTTP_400_BAD_REQUEST)

        try:

            company_cover_image_url_serializer.save()

        except Exception as ex:

            helper.print_log_error("update_company_cover_image_url", ex)

            return var_res.response_data(status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        else:

            return var_res.response_data(status=status.HTTP_200_OK, data=company_cover_image_url_serializer.data)


class CompanyViewSet(viewsets.ViewSet,

                     generics.ListAPIView,

                     generics.RetrieveAPIView):

    queryset = Company.objects.select_related(
        'user', 'logo', 'cover_image', 'location', 'location__city'
    ).prefetch_related('company_images', 'company_images__image')

    serializer_class = CompanySerializer

    permission_classes = [perms_sys.AllowAny]

    renderer_classes = [renderers.MyJSONRenderer]

    pagination_class = paginations.CustomPagination

    filterset_class = CompanyFilter

    filter_backends = [DjangoFilterBackend, filters.AliasedOrderingFilter]

    ordering_fields = (('updateAt', 'update_at'), ('createAt', 'create_at'))

    lookup_field = "slug"

    def get_permissions(self):

        if self.action in ["followed"]:

            return [perms_custom.IsJobSeekerUser()]

        return [perms_sys.AllowAny()]

    def list(self, request, *args, **kwargs):
        try:
            from shared.helpers.redis_service import RedisService
            import hashlib
            from urllib.parse import parse_qsl, urlencode

            redis_obj = RedisService()
            raw_query_str = request.GET.urlencode()
            filtered_query = [(k, v) for k, v in parse_qsl(raw_query_str, keep_blank_values=False) if v != ""]
            filtered_query.sort()
            query_str = urlencode(filtered_query)
            query_hash = hashlib.md5(query_str.encode("utf-8")).hexdigest()
            cache_key = f'company_list_{query_hash}_{request.user.id if request.user.is_authenticated else 0}'
            cached_res = redis_obj.get_json(cache_key)
            if cached_res:
                return var_res.response_data(data=cached_res)

            queryset = self.filter_queryset(self.get_queryset())
            queryset = queryset.annotate(
                follow_count=Count('companyfollowed_set', distinct=True),
                active_job_post_count=Count(
                    'job_posts',
                    filter=Q(
                        job_posts__deadline__gte=timezone.now().date(),
                        job_posts__status=var_sys.JobPostStatus.APPROVED
                    ),
                    distinct=True
                ),
            )
            if request.user.is_authenticated:
                queryset = queryset.prefetch_related(
                    Prefetch('companyfollowed_set', queryset=CompanyFollowed.objects.filter(user=request.user))
                )
            queryset = queryset.order_by('-id', 'update_at', 'create_at')

            page = self.paginate_queryset(queryset)

            if page is not None:

                serializer = self.get_serializer(page, many=True, fields=[

                    'id', 'slug', 'companyName', 'companyImageUrl',

                    'companyCoverImageUrl',

                    'fieldOperation', 'employeeSize', 'locationDict',

                    'followNumber', 'jobPostNumber', 'isFollowed'

                ])

                paginated_response = self.get_paginated_response(serializer.data)
                redis_obj.set_json(cache_key, paginated_response.data, 300)
                return paginated_response

            serializer = self.get_serializer(queryset, many=True)

            return var_res.response_data(data=serializer.data)

        except Exception as ex:
            helper.print_log_error("CompanyViewSet__list", ex)
            return var_res.response_data(status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def retrieve(self, request, *args, **kwargs):

        instance = self.get_object()

        serializer = self.get_serializer(instance, fields=[

            'id', 'slug', 'taxCode', 'companyName',

            'employeeSize', 'fieldOperation', 'location',

            'since', 'companyEmail', 'companyPhone',

            'websiteUrl', 'facebookUrl', 'youtubeUrl',

            'linkedinUrl', 'description',

            'companyImageUrl', 'companyCoverImageUrl',

            'followNumber', 'isFollowed', 'companyImages'

        ])

        return var_res.response_data(data=serializer.data)

    @action(methods=["get"], detail=False,

            url_path="top", url_name="companies-top")

    def get_top_companies(self, request):

        try:

            queryset = Company.objects.annotate(num_follow=Count('companyfollowed'),

                                                num_job_post=Count('job_posts')

                                                ) \
                .order_by('-num_follow', '-num_job_post')[:10]

            serializer = CompanySerializer(queryset, many=True,

                                           fields=[

                                               'id', 'slug', 'companyName', 'companyImageUrl'

                                           ])

        except Exception as ex:

            helper.print_log_error("get_top_companies", ex)

            return var_res.response_data(status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return var_res.response_data(data=serializer.data)

    @action(methods=["post"], detail=True,

            url_path="followed", url_name="followed")

    def followed(self, request, slug):

        user = request.user

        company = self.get_object()

        is_followed = False

        companies_followed = CompanyFollowed.objects.filter(

            user=user, company=company)

        if companies_followed.exists():

            company_followed = companies_followed.first()

            company_followed.delete()

        else:

            CompanyFollowed.objects.create(

                user=request.user,

                company=self.get_object(),

            )

            is_followed = True

        # send notification

        notification_title = f"{user.full_name} - {user.email}"

        notification_content = NOTIFICATION_MESSAGES[

            "FOLLOW_NOTIFICATION"] if is_followed else NOTIFICATION_MESSAGES["UNFOLLOW_NOTIFICATION"]

        helper.add_company_followed_notifications(

            notification_title,

            notification_content,

            user.avatar.get_full_url(

            ) if user.avatar else var_sys.AVATAR_DEFAULT["AVATAR"],

            company.user_id

        )

        return var_res.response_data(data={

            "isFollowed": is_followed

        })


class CompanyFollowedAPIView(views.APIView):

    permission_classes = [perms_custom.IsJobSeekerUser]

    renderer_classes = [renderers.MyJSONRenderer]

    pagination_class = paginations.CustomPagination

    # The list company are following

    def get(self, request):

        user = request.user

        queryset = CompanyFollowed.objects.filter(user=user) \
            .order_by("-update_at", "-create_at")

        paginator = self.pagination_class()

        page = paginator.paginate_queryset(queryset, request)

        if page is not None:

            serializer = CompanyFollowedSerializer(page, many=True)

            return paginator.get_paginated_response(serializer.data)

        serializer = CompanyFollowedSerializer(queryset, many=True)

        return var_res.response_data(data=serializer.data)


class CompanyImageViewSet(viewsets.ViewSet,

                          generics.CreateAPIView,

                          generics.ListAPIView,

                          generics.DestroyAPIView):

    queryset = CompanyImage.objects

    serializer_class = CompanyImageSerializer

    pagination_class = paginations.CustomPagination

    renderer_classes = [renderers.MyJSONRenderer]

    permission_classes = [perms_custom.CompanyImageOwnerPerms]

    def get_queryset(self):

        queryset = self.queryset

        if self.request.user.is_authenticated:

            company = None
            if hasattr(self.request.user, "get_active_company"):
                company = self.request.user.get_active_company()
            if not company:
                company = getattr(self.request.user, "company", None)
            if not company:
                return queryset.none()

            queryset = queryset.filter(company=company) \
                .order_by('update_at', 'create_at')

        return queryset

    def create(self, request, *args, **kwargs):

        files = request.FILES

        serializer = self.get_serializer(data=files)

        serializer.is_valid(raise_exception=True)

        results = serializer.save()

        return var_res.response_data(status=status.HTTP_201_CREATED, data=results)

    def destroy(self, request, *args, **kwargs):

        instance = self.get_object()

        try:

            with transaction.atomic():

                image = instance.image

                if image:

                    is_destroy_success = CloudinaryService.delete_image(image.public_id)

                    if not is_destroy_success:

                        helper.print_log_error("CompanyImageViewSet__destroy", ERROR_MESSAGES["CLOUDINARY_UPLOAD_ERROR"])

                    image.delete()

                self.perform_destroy(instance)

        except Exception as ex:

            helper.print_log_error("destroy", ex)

            return var_res.response_data(status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        else:

            return var_res.response_data(status=status.HTTP_204_NO_CONTENT)


class CompanyRoleViewSet(viewsets.ModelViewSet):
    queryset = CompanyRole.objects.all()
    serializer_class = CompanyRoleSerializer
    permission_classes = [perms_sys.IsAuthenticated]
    renderer_classes = [renderers.MyJSONRenderer]

    def get_company(self):
        return _get_user_company(self.request.user)

    def get_queryset(self):
        company = self.get_company()
        if not company:
            return CompanyRole.objects.none()
        return self.queryset.filter(company=company).order_by("id")

    def create(self, request, *args, **kwargs):
        company = self.get_company()
        if not company:
            return var_res.response_data(
                status=status.HTTP_400_BAD_REQUEST,
                errors={"errorMessage": ["User is not associated with any company."]},
            )
        if not _has_company_permission(request.user, company, "manage_roles"):
            return var_res.response_data(status=status.HTTP_403_FORBIDDEN)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(company=company)
        return var_res.response_data(status=status.HTTP_201_CREATED, data=serializer.data)

    def update(self, request, *args, **kwargs):
        company = self.get_company()
        if not company:
            return var_res.response_data(
                status=status.HTTP_400_BAD_REQUEST,
                errors={"errorMessage": ["User is not associated with any company."]},
            )
        if not _has_company_permission(request.user, company, "manage_roles"):
            return var_res.response_data(status=status.HTTP_403_FORBIDDEN)

        instance = self.get_object()
        if instance.is_system and ("code" in request.data or "is_system" in request.data):
            return var_res.response_data(
                status=status.HTTP_400_BAD_REQUEST,
                errors={"errorMessage": ["System role cannot change code or system flag."]},
            )
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        company = self.get_company()
        if not company:
            return var_res.response_data(
                status=status.HTTP_400_BAD_REQUEST,
                errors={"errorMessage": ["User is not associated with any company."]},
            )
        if not _has_company_permission(request.user, company, "manage_roles"):
            return var_res.response_data(status=status.HTTP_403_FORBIDDEN)

        instance = self.get_object()
        if instance.is_system:
            return var_res.response_data(
                status=status.HTTP_400_BAD_REQUEST,
                errors={"errorMessage": ["System role cannot be deleted."]},
            )
        if instance.members.filter(is_active=True).exists():
            return var_res.response_data(
                status=status.HTTP_400_BAD_REQUEST,
                errors={"errorMessage": ["Role is assigned to active members."]},
            )
        return super().destroy(request, *args, **kwargs)


class CompanyMemberViewSet(viewsets.ModelViewSet):
    queryset = CompanyMember.objects.select_related("user", "role", "company")
    serializer_class = CompanyMemberSerializer
    permission_classes = [perms_sys.IsAuthenticated]
    renderer_classes = [renderers.MyJSONRenderer]
    pagination_class = paginations.CustomPagination

    def get_company(self):
        return _get_user_company(self.request.user)

    def get_queryset(self):
        company = self.get_company()
        if not company:
            return CompanyMember.objects.none()
        return self.queryset.filter(company=company).order_by("id")

    def list(self, request, *args, **kwargs):
        company = self.get_company()
        if not company:
            return var_res.response_data(
                status=status.HTTP_400_BAD_REQUEST,
                errors={"errorMessage": ["User is not associated with any company."]},
            )
        if not _has_company_permission(request.user, company, "manage_members"):
            return var_res.response_data(status=status.HTTP_403_FORBIDDEN)
        return super().list(request, *args, **kwargs)

    def create(self, request, *args, **kwargs):
        company = self.get_company()
        if not company:
            return var_res.response_data(
                status=status.HTTP_400_BAD_REQUEST,
                errors={"errorMessage": ["User is not associated with any company."]},
            )
        if not _has_company_permission(request.user, company, "manage_members"):
            return var_res.response_data(status=status.HTTP_403_FORBIDDEN)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        role = CompanyRole.objects.filter(
            id=serializer.validated_data["role_id"],
            company=company,
            is_active=True,
        ).first()
        if not role:
            return var_res.response_data(
                status=status.HTTP_400_BAD_REQUEST,
                errors={"roleId": ["Role is invalid for this company."]},
            )

        user_id = serializer.validated_data["user_id"]
        member = CompanyMember.objects.filter(company=company, user_id=user_id).first()
        if member:
            member.role = role
            member.status = serializer.validated_data.get("status", member.status)
            member.invited_email = serializer.validated_data.get("invited_email", member.invited_email)
            member.is_active = serializer.validated_data.get("is_active", member.is_active)
            if member.status == CompanyMember.STATUS_ACTIVE and member.joined_at is None:
                member.joined_at = timezone.now()
            member.save()
            return var_res.response_data(status=status.HTTP_200_OK, data=self.get_serializer(member).data)

        member = serializer.save(
            company=company,
            invited_by=request.user,
            joined_at=timezone.now(),
        )
        return var_res.response_data(status=status.HTTP_201_CREATED, data=self.get_serializer(member).data)

    def update(self, request, *args, **kwargs):
        company = self.get_company()
        if not company:
            return var_res.response_data(
                status=status.HTTP_400_BAD_REQUEST,
                errors={"errorMessage": ["User is not associated with any company."]},
            )
        if not _has_company_permission(request.user, company, "manage_members"):
            return var_res.response_data(status=status.HTTP_403_FORBIDDEN)

        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)

        if "role_id" in serializer.validated_data:
            role = CompanyRole.objects.filter(
                id=serializer.validated_data["role_id"],
                company=company,
                is_active=True,
            ).first()
            if not role:
                return var_res.response_data(
                    status=status.HTTP_400_BAD_REQUEST,
                    errors={"roleId": ["Role is invalid for this company."]},
                )

        serializer.save()
        return var_res.response_data(status=status.HTTP_200_OK, data=serializer.data)

    def destroy(self, request, *args, **kwargs):
        company = self.get_company()
        if not company:
            return var_res.response_data(
                status=status.HTTP_400_BAD_REQUEST,
                errors={"errorMessage": ["User is not associated with any company."]},
            )
        if not _has_company_permission(request.user, company, "manage_members"):
            return var_res.response_data(status=status.HTTP_403_FORBIDDEN)

        instance = self.get_object()
        if instance.user_id == company.user_id:
            return var_res.response_data(
                status=status.HTTP_400_BAD_REQUEST,
                errors={"errorMessage": ["Company owner membership cannot be deleted."]},
            )
        return super().destroy(request, *args, **kwargs)

    @action(methods=["get"], detail=False, url_path="me", url_name="company-member-me")
    def me(self, request):
        company = self.get_company()
        if not company:
            return var_res.response_data(data=None)

        member = CompanyMember.objects.select_related("role").filter(
            company=company,
            user=request.user,
            status=CompanyMember.STATUS_ACTIVE,
            is_active=True,
        ).first()
        if not member:
            if company.user_id == request.user.id:
                owner_role = CompanyRole.objects.filter(company=company, code="owner").first()
                if not owner_role:
                    return var_res.response_data(data=None)
                data = {
                    "role": CompanyRoleSerializer(owner_role).data,
                    "status": CompanyMember.STATUS_ACTIVE,
                    "isOwner": True,
                }
                return var_res.response_data(data=data)
            return var_res.response_data(data=None)

        data = CompanyMemberSerializer(member).data
        data["isOwner"] = company.user_id == request.user.id
        return var_res.response_data(data=data)
