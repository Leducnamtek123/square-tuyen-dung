
import logging

logger = logging.getLogger(__name__)


def _coerce_bool(value):
    if isinstance(value, bool):
        return value
    if isinstance(value, (int, float)):
        return bool(value)
    if isinstance(value, str):
        normalized = value.strip().lower()
        if normalized in {"true", "1", "yes", "on"}:
            return True
        if normalized in {"false", "0", "no", "off", ""}:
            return False
    raise ValueError("isActive must be a boolean value.")

from shared import pagination as paginations
from shared import renderers
from shared.permissions import PermissionActionMapMixin
from shared.configs import app_setting, variable_response as var_res, variable_system as var_sys

from shared.configs.messages import ERROR_MESSAGES

from shared.helpers import helper

from django.utils import timezone

from django.db.models import F, Count, Prefetch
from django.db import IntegrityError

from django.db.models.functions import ACos, Cos, Radians, Sin

from django_filters.rest_framework import DjangoFilterBackend

from rest_framework import viewsets, generics

from rest_framework.decorators import action

from rest_framework import permissions as perms_sys

from apps.accounts import permissions as perms_custom

from rest_framework.response import Response

from rest_framework import status

from apps.profiles.models import Resume

from ..models import (

    JobPost,

    SavedJobPost,

    JobPostActivity,

    JobPostNotification

)

from ..filters import (

    JobPostFilter,
    AliasedOrderingFilter,

)

from ..exceptions import (
    JobsDomainError,
)

from ..serializers import (

    JobPostSerializer,

    JobPostAroundFilterSerializer,

    JobPostAroundSerializer,

    JobSeekerJobPostActivitySerializer,

    JobPostNotificationSerializer

)

class JobPostViewSet(PermissionActionMapMixin, viewsets.ViewSet,

                     generics.ListAPIView,

                     generics.RetrieveAPIView):

    queryset = JobPost.objects.select_related(
        'company', 'company__logo', 'company__cover_image', 'company__user',
        'location', 'location__city', 'career'
    ).all().order_by("-create_at", "-update_at", "-id")

    serializer_class = JobPostSerializer

    renderer_classes = [renderers.MyJSONRenderer]

    pagination_class = paginations.CustomPagination

    permission_classes = [perms_sys.AllowAny]

    filterset_class = JobPostFilter

    filter_backends = [DjangoFilterBackend, AliasedOrderingFilter]
    ordering_fields = (
        ('jobName', 'job_name'),
        ('createAt', 'create_at'),
        ('deadline', 'deadline'),
        ('viewedTotal', 'views'),
        'salary_min', 'salary_max'
    )

    permission_action_map = {
        "get_job_posts_saved": [perms_custom.IsJobSeekerUser],
        "get_job_posts_applied": [perms_custom.IsJobSeekerUser],
        "save_job": [perms_custom.IsJobSeekerUser],
        "get_suggested_job_posts": [perms_custom.IsJobSeekerUser],
    }
    default_permission_classes = [perms_sys.AllowAny]

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(
            self.get_queryset()
            .filter(
                status=var_sys.JobPostStatus.APPROVED,
                deadline__gte=timezone.localdate()
            )
            .prefetch_related(
                Prefetch(
                    'savedjobpost_set',
                    queryset=SavedJobPost.objects.filter(user=request.user) if request.user.is_authenticated else SavedJobPost.objects.none(),
                ),
                Prefetch(
                    'jobpostactivity_set',
                    queryset=JobPostActivity.objects.filter(user=request.user) if request.user.is_authenticated else JobPostActivity.objects.none(),
                ),
            )
        )

        page = self.paginate_queryset(queryset)

        if page is not None:

            serializer = self.get_serializer(page, many=True, fields=[

                'id', 'companyDict', "salaryMin", "salaryMax",

                'jobName', 'isHot', 'isUrgent',

                'career', 'position', 'experience', 'academicLevel',

                'city', 'jobType', 'typeOfWorkplace', 'deadline',

                'locationDict', 'updateAt', 'isSaved'

            ])

            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)

        return var_res.response_data(data=serializer.data)

    @action(methods=["get"], detail=False,

            url_path="suggested-job-posts", url_name="suggested-job-posts")

    def get_suggested_job_posts(self, request):

        resumes = Resume.objects.filter(user=request.user) \
            .values_list("career", "city")

        careers_id = [x[0] for x in resumes]

        cities_id = [x[1] for x in resumes]

        queryset = (
            JobPost.objects.select_related(
                'company', 'company__logo', 'company__cover_image', 'company__user',
                'location', 'location__city', 'career'
            )
            .filter(status=var_sys.JobPostStatus.APPROVED, deadline__gte=timezone.localdate())
            .filter(career__in=careers_id, location__city__in=cities_id)
            .prefetch_related(
                Prefetch(
                    'savedjobpost_set',
                    queryset=SavedJobPost.objects.filter(user=request.user) if request.user.is_authenticated else SavedJobPost.objects.none(),
                ),
                Prefetch(
                    'jobpostactivity_set',
                    queryset=JobPostActivity.objects.filter(user=request.user) if request.user.is_authenticated else JobPostActivity.objects.none(),
                ),
            )
            .order_by("-create_at", "-update_at")
        )

        page = self.paginate_queryset(queryset)

        if page is not None:

            serializer = self.get_serializer(page, many=True, fields=[

                'id', 'companyDict', "salaryMin", "salaryMax",

                'jobName', 'isHot', 'isUrgent',

                'career', 'position', 'experience', 'academicLevel',

                'city', 'jobType', 'typeOfWorkplace', 'deadline',

                'locationDict', 'updateAt', 'isSaved'

            ])

            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)

        return var_res.response_data(data=serializer.data)

    def retrieve(self, request, *args, **kwargs):

        instance = self.get_object()

        serializer = self.get_serializer(instance, fields=[

            'id', 'slug', 'jobName', 'deadline', 'quantity', 'genderRequired',

            'jobDescription', 'jobRequirement', 'benefitsEnjoyed', 'career',

            'position', 'typeOfWorkplace', 'experience', 'academicLevel',

            'jobType', 'salaryMin', 'salaryMax', 'contactPersonName',

            'contactPersonPhone', 'contactPersonEmail',

            'location', 'createAt',

            'isSaved', 'isApplied', 'mobileCompanyDict', 'views'

        ])

        return var_res.response_data(data=serializer.data)

    @action(methods=["get"], detail=False,

            url_path="job-posts-saved", url_name="job-posts-saved")

    def get_job_posts_saved(self, request):

        user = request.user

        queryset = (
            user.saved_job_posts
            .filter(status=var_sys.JobPostStatus.APPROVED)
            .select_related(
                'company', 'company__logo', 'company__cover_image', 'company__user',
                'location', 'location__city', 'career'
            )
            .prefetch_related(
                Prefetch('savedjobpost_set', queryset=SavedJobPost.objects.filter(user=user)),
                Prefetch('jobpostactivity_set', queryset=JobPostActivity.objects.filter(user=user)),
            )
            .order_by('update_at', 'create_at')
        )

        page = self.paginate_queryset(queryset)

        if page is not None:

            serializer = self.get_serializer(page, many=True, fields=[

                'id', 'companyDict', "salaryMin", "salaryMax",

                'jobName', 'isHot', 'isUrgent',

                'career', 'position', 'experience', 'academicLevel',

                'city', 'jobType', 'typeOfWorkplace', 'deadline',

                'locationDict', 'updateAt', 'isSaved'

            ])

            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)

        return var_res.response_data(data=serializer.data)

    @action(methods=["post"], detail=True, url_path="save", url_name="save", permission_classes=[perms_custom.IsJobSeekerUser])
    def save_job(self, request, pk):
        from ..services import JobActivityService
        try:
            is_saved = JobActivityService.toggle_save_job(
                user=request.user,
                job_post=self.get_object()
            )
            return var_res.response_data(data={"isSaved": is_saved})
        except JobsDomainError as e:
            return var_res.response_data(status=status.HTTP_400_BAD_REQUEST, errors={"errorMessage": [str(e)]})

    @action(methods=["get"], detail=False,

            url_path="count-job-posts-by-job-type", url_name="count-job-posts-by-job-type")

    def count_job_posts_by_job_type(self, request):
        data = JobPost.objects.values(typeOfWorkplace=F('type_of_workplace')).annotate(total=Count('id')).order_by()

        return var_res.response_data(data=data)

    @action(methods=["post"], detail=False,

            url_path="job-posts-around", url_name="job-posts-around")

    def get_job_posts_around(self, request):

        data = request.data

        filter_serializer = JobPostAroundFilterSerializer(data=data)

        if not filter_serializer.is_valid():

            logger.warning("BAD REQUEST get_job_posts_around: %s", filter_serializer.errors)

            return var_res.response_data(status=status.HTTP_400_BAD_REQUEST)

        filter_data = filter_serializer.data

        # latitude truyền vào

        lat = filter_data.get('currentLatitude')

        # longitude truyền vào

        lng = filter_data.get('currentLongitude')

        # bán kính truyền vào (đơn vị km)

        radius = filter_data.get("radius")

        # Chuyển đổi vị trí truyền vào thành radian

        lat_radian = Radians(lat)

        lng_radian = Radians(lng)

        # Tính toán khoảng cách và filter các dòng thỏa mãn

        queryset = self.filter_queryset(self.get_queryset()

                                        .filter(status=var_sys.JobPostStatus.APPROVED, deadline__gte=timezone.localdate()

                                                ).annotate(

            lat_radian=Radians('location__lat'),

            lng_radian=Radians('location__lng'),

            cos_lat_radian=Cos(Radians('location__lat')),

            sin_lat_radian=Sin(Radians('location__lat')),

            cos_lng_radian=Cos(Radians('location__lng')),

            sin_lng_radian=Sin(Radians('location__lng')),

            distance=6367.0 * ACos(

                Cos(lat_radian) * F('cos_lat_radian') * Cos(lng_radian - F('lng_radian')) +

                Sin(lat_radian) * F('sin_lat_radian')

            )

        ).filter(distance__lte=radius).order_by('update_at', 'create_at'))

        is_pagination = request.query_params.get("isPagination", None)

        if is_pagination and is_pagination == "OK":

            page = self.paginate_queryset(queryset)

            if page is not None:

                serializer = JobPostAroundSerializer(page, many=True)

                return self.get_paginated_response(serializer.data)

        serializer = JobPostAroundSerializer(queryset, many=True)

        return var_res.response_data(data=serializer.data)

class JobSeekerJobPostActivityViewSet(viewsets.ViewSet,

                                      generics.ListAPIView,

                                      generics.CreateAPIView):

    queryset = JobPostActivity.objects.select_related('job_post', 'job_post__company', 'job_post__location', 'resume')

    serializer_class = JobSeekerJobPostActivitySerializer

    permission_classes = [perms_custom.IsJobSeekerUser]

    renderer_classes = [renderers.MyJSONRenderer]

    pagination_class = paginations.CustomPagination

    def create(self, request, *args, **kwargs):

        serializer = self.get_serializer(data=request.data)

        serializer.is_valid(raise_exception=True)

        from rest_framework.exceptions import ValidationError
        from ..services import JobActivityService
        try:
            job_post_activity = JobActivityService.apply_to_job(
                user=request.user,
                validated_data=serializer.validated_data
            )
        except IntegrityError:
            raise ValidationError({"errorMessage": ["Bạn đã ứng tuyển vào vị trí này rồi."]})
        except JobsDomainError as e:
            raise ValidationError({"errorMessage": [str(e)]})

        response_serializer = self.get_serializer(job_post_activity)
        headers = self.get_success_headers(response_serializer.data)

        return var_res.response_data(status=status.HTTP_201_CREATED, data=response_serializer.data, headers=headers)

    def list(self, request, *args, **kwargs):

        user = request.user

        queryset = user.jobpostactivity_set \
            .order_by('-create_at', '-update_at')

        page = self.paginate_queryset(queryset)

        if page is not None:

            serializer = self.get_serializer(page, many=True, fields=[

                "id", "createAt", "mobileJobPostDict", "resumeDict"

            ])

            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)

        return var_res.response_data(data=serializer.data)

class JobPostNotificationViewSet(viewsets.ViewSet,

                                 generics.CreateAPIView,

                                 generics.ListAPIView,

                                 generics.UpdateAPIView,

                                 generics.DestroyAPIView):

    def get_queryset(self):
        return JobPostNotification.objects.filter(user=self.request.user)

    serializer_class = JobPostNotificationSerializer

    renderer_classes = [renderers.MyJSONRenderer]

    pagination_class = paginations.CustomPagination

    permission_classes = [perms_custom.IsJobSeekerUser]

    def list(self, request, *args, **kwargs):

        user = request.user

        queryset = self.get_queryset().filter(user=user).order_by('-is_active', '-update_at')

        page = self.paginate_queryset(queryset)

        if page is not None:

            serializer = self.get_serializer(page, many=True, fields=[

                "id", "jobName", "position", "experience", "salary",

                "frequency", "isActive", "career", "city"

            ])

            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)

        return var_res.response_data(data=serializer.data)

    def retrieve(self, request, *args, **kwargs):

        instance = self.get_object()

        serializer = self.get_serializer(instance, fields=[

            "id", "jobName", "position", "experience",

            "salary", "frequency", "career", "city"

        ])

        return var_res.response_data(data=serializer.data)

    def destroy(self, request, *args, **kwargs):

        instance = self.get_object()

        self.perform_destroy(instance)

        return var_res.response_data(status=status.HTTP_200_OK)

    def _apply_active_change(self, request, job_post_notification):
        user = request.user
        desired = request.data.get("isActive", request.data.get("is_active", None))
        if desired is None:
            desired = not job_post_notification.is_active
        else:
            try:
                desired = _coerce_bool(desired)
            except ValueError as ex:
                return var_res.response_data(
                    status=status.HTTP_400_BAD_REQUEST,
                    errors={"errorMessage": [str(ex)]},
                )

        if desired and not job_post_notification.is_active:
            active_count = JobPostNotification.objects.filter(user=user, is_active=True).exclude(
                id=job_post_notification.id
            ).count()
            if active_count >= app_setting.MAX_ACTIVE_JOB_NOTIFICATIONS:
                return var_res.response_data(
                    status=status.HTTP_400_BAD_REQUEST,
                    data={"errorMessage": [ERROR_MESSAGES["MAX_ACTIVE_JOB_NOTIFICATIONS"]]},
                )

        job_post_notification.is_active = desired
        job_post_notification.save(update_fields=["is_active", "update_at"])
        return var_res.response_data(data={"isActive": job_post_notification.is_active})

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        if "isActive" in request.data or "is_active" in request.data:
            return self._apply_active_change(request, instance)
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        if not request.data or "isActive" in request.data or "is_active" in request.data:
            return self._apply_active_change(request, instance)
        return super().partial_update(request, *args, **kwargs)

