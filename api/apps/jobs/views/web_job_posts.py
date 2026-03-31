import datetime

from django.db.models import Count, F, Prefetch
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics, permissions as perms_sys, status, viewsets
from rest_framework.decorators import action
from rest_framework.filters import SearchFilter
from rest_framework.response import Response

from apps.accounts import permissions as perms_custom
from apps.profiles.models import Resume
from shared import pagination as paginations
from shared import renderers
from shared.configs import table_export
from shared.configs import variable_response as var_res
from shared.configs import variable_system as var_sys
from shared.helpers import helper, utils

from ..filters import AliasedOrderingFilter, JobPostFilter
from ..models import JobPost, JobPostActivity, SavedJobPost
from ..serializers import JobPostSerializer


class PrivateJobPostViewSet(
    viewsets.ViewSet,
    generics.ListAPIView,
    generics.CreateAPIView,
    generics.UpdateAPIView,
    generics.DestroyAPIView,
):
    queryset = JobPost.objects.select_related(
        'company',
        'company__logo',
        'company__cover_image',
        'company__user',
        'location',
        'location__city',
        'career',
    ).annotate(
        applied_total=Count('peoples_applied', distinct=True),
    ).order_by("-create_at", "-update_at", "-id")
    serializer_class = JobPostSerializer
    renderer_classes = [renderers.MyJSONRenderer]
    pagination_class = paginations.CustomPagination
    permission_classes = [perms_custom.JobPostOwnerPerms]
    filterset_class = JobPostFilter
    filter_backends = [DjangoFilterBackend, AliasedOrderingFilter]
    lookup_field = "slug"
    ordering_fields = (
        ('jobName', 'job_name'),
        ('createAt', 'create_at'),
        ('deadline', 'deadline'),
        ('viewedTotal', 'views'),
        ('appliedTotal', 'applied_total'),
    )

    def get_permissions(self):
        if self.action in ["get_suggested_job_posts"]:
            return [perms_sys.IsAuthenticated()]
        return [perms_custom.JobPostOwnerPerms()]

    @action(methods=["get"], detail=False, url_path="job-posts-options", url_name="job-posts-options")
    def get_job_post_options(self, request):
        user = request.user
        queryset = self.queryset.filter(user=user, company=user.company)
        serializer = JobPostSerializer(
            queryset,
            many=True,
            fields=[
                "id",
                "jobName",
            ],
        )
        return var_res.response_data(data=serializer.data)

    @action(methods=["get"], detail=False, url_path="suggested-job-posts", url_name="suggested-job-posts")
    def get_suggested_job_posts(self, request):
        resumes = Resume.objects.filter(user=request.user).values_list("career", "city")
        careers_id = [x[0] for x in resumes]
        cities_id = [x[1] for x in resumes]

        queryset = (
            JobPost.objects.select_related(
                'company',
                'company__logo',
                'company__cover_image',
                'company__user',
                'location',
                'location__city',
                'career',
            )
            .filter(
                status=var_sys.JobPostStatus.APPROVED,
                deadline__gte=datetime.datetime.now().date(),
            )
            .filter(career__in=careers_id, location__city__in=cities_id)
            .prefetch_related(
                Prefetch(
                    'savedjobpost_set',
                    queryset=SavedJobPost.objects.filter(user=request.user)
                    if request.user.is_authenticated
                    else SavedJobPost.objects.none(),
                ),
                Prefetch(
                    'jobpostactivity_set',
                    queryset=JobPostActivity.objects.filter(user=request.user)
                    if request.user.is_authenticated
                    else JobPostActivity.objects.none(),
                ),
            )
            .order_by("-create_at", "-update_at")
        )

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(
                page,
                many=True,
                fields=[
                    'id',
                    'slug',
                    'companyDict',
                    "salaryMin",
                    "salaryMax",
                    'jobName',
                    'isHot',
                    'isUrgent',
                    'salary',
                    'city',
                    'deadline',
                    'locationDict',
                ],
            )
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return var_res.response_data(data=serializer.data)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        from ..services import JobPostService
        job_post = JobPostService.create_job(
            user=request.user,
            validated_data=serializer.validated_data
        )

        response_serializer = self.get_serializer(job_post)
        return var_res.response_data(status=status.HTTP_201_CREATED, data=response_serializer.data)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()

        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)

        from ..services import JobPostService
        updated_instance = JobPostService.update_job(
            user=request.user,
            job_post=instance,
            validated_data=serializer.validated_data
        )

        if getattr(updated_instance, '_prefetched_objects_cache', None):
            updated_instance._prefetched_objects_cache = {}

        response_serializer = self.get_serializer(updated_instance)
        return var_res.response_data(data=response_serializer.data)

    def list(self, request, *args, **kwargs):
        queryset = (
            self.filter_queryset(
                self.get_queryset()
                .filter(user=request.user, company=request.user.company)
                .order_by('-update_at', '-create_at')
            )
        )

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(
                page,
                many=True,
                fields=[
                    "id",
                    "slug",
                    "jobName",
                    "createAt",
                    "deadline",
                    "appliedNumber",
                    "views",
                    "isUrgent",
                    "status",
                    "isExpired",
                ],
            )
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return var_res.response_data(data=serializer.data)

    @action(methods=["get"], detail=False, url_path="export", url_name="job-posts-export")
    def export_job_posts(self, request):
        queryset = (
            self.filter_queryset(
                self.get_queryset()
                .filter(
                    status=var_sys.JobPostStatus.APPROVED,
                    user=request.user,
                    company=request.user.company,
                )
                .order_by('update_at', 'create_at')
            )
        )

        serializer = self.get_serializer(
            queryset,
            many=True,
            fields=[
                "id",
                "jobName",
                "views",
                "createAt",
                "deadline",
                "appliedNumber",
            ],
        )

        result_data = utils.convert_data_with_en_key_to_vn_kew(
            serializer.data, table_export.JOB_POSTS_EXPORT_FIELD
        )
        return var_res.response_data(data=result_data)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(
            instance,
            fields=[
                "id",
                "slug",
                "jobName",
                "academicLevel",
                "deadline",
                "quantity",
                "genderRequired",
                "jobDescription",
                "jobRequirement",
                "benefitsEnjoyed",
                "career",
                'status',
                "position",
                "typeOfWorkplace",
                "experience",
                "jobType",
                "salaryMin",
                "salaryMax",
                "isUrgent",
                "contactPersonName",
                "contactPersonPhone",
                "contactPersonEmail",
                "location",
            ],
        )
        return var_res.response_data(data=serializer.data)


class JobPostViewSet(viewsets.GenericViewSet, generics.ListAPIView, generics.RetrieveAPIView):
    queryset = JobPost.objects.select_related(
        'company',
        'company__logo',
        'company__cover_image',
        'company__user',
        'location',
        'location__city',
        'career',
    ).filter(
        status=var_sys.JobPostStatus.APPROVED,
        deadline__gte=datetime.datetime.now().date(),
    ).order_by("-create_at", "-update_at", "-id")
    serializer_class = JobPostSerializer
    renderer_classes = [renderers.MyJSONRenderer]
    pagination_class = paginations.CustomPagination
    permission_classes = [perms_sys.AllowAny]
    filterset_class = JobPostFilter
    filter_backends = [DjangoFilterBackend, AliasedOrderingFilter]
    lookup_field = "slug"
    ordering_fields = (
        ('jobName', 'job_name'),
        ('createAt', 'create_at'),
        ('deadline', 'deadline'),
        ('viewedTotal', 'views'),
    )

    def list(self, request, *args, **kwargs):
        # Cache logic
        from shared.helpers.redis_service import RedisService
        import hashlib
        from urllib.parse import parse_qsl, urlencode

        redis_obj = RedisService()
        raw_query_str = request.GET.urlencode()
        filtered_query = [
            (k, v) for k, v in parse_qsl(raw_query_str, keep_blank_values=False) if v != ""
        ]
        filtered_query.sort()
        query_str = urlencode(filtered_query)
        query_hash = hashlib.md5(query_str.encode("utf-8")).hexdigest()
        cache_key = f'job_list_{query_hash}_{request.user.id if request.user.is_authenticated else 0}'

        try:
            cached_res = redis_obj.get_json(cache_key)
            if cached_res:
                return var_res.response_data(data=cached_res)
        except Exception as e:
            helper.print_log_error("Get cache list job post", e)

        queryset = self.filter_queryset(
            self.get_queryset()
            .prefetch_related(
                Prefetch(
                    'savedjobpost_set',
                    queryset=SavedJobPost.objects.filter(user=request.user)
                    if request.user.is_authenticated
                    else SavedJobPost.objects.none(),
                ),
                Prefetch(
                    'jobpostactivity_set',
                    queryset=JobPostActivity.objects.filter(user=request.user)
                    if request.user.is_authenticated
                    else JobPostActivity.objects.none(),
                ),
            )
        )

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(
                page,
                many=True,
                fields=[
                    'id',
                    'slug',
                    'companyDict',
                    "salaryMin",
                    "salaryMax",
                    'jobName',
                    'isHot',
                    'isUrgent',
                    'salary',
                    'city',
                    'deadline',
                    'locationDict',
                ],
            )
            paginated_response = self.get_paginated_response(serializer.data)
            try:
                redis_obj.set_json(cache_key, paginated_response.data, 300)
            except Exception as e:
                helper.print_log_error("Set cache list job post", e)
            return paginated_response

        serializer = self.get_serializer(queryset, many=True)
        return var_res.response_data(data=serializer.data)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        try:
            JobPost.objects.filter(pk=instance.pk).update(views=F('views') + 1)
            instance.refresh_from_db()
        except Exception as ex:
            helper.print_log_error("save views", ex)

        serializer = self.get_serializer(
            instance,
            fields=[
                'id',
                'slug',
                'jobName',
                'deadline',
                'quantity',
                'genderRequired',
                'jobDescription',
                'jobRequirement',
                'benefitsEnjoyed',
                'career',
                'position',
                'typeOfWorkplace',
                'experience',
                'academicLevel',
                'jobType',
                'salaryMin',
                'salaryMax',
                'contactPersonName',
                'contactPersonPhone',
                'contactPersonEmail',
                'location',
                'createAt',
                'isSaved',
                'isApplied',
                'companyDict',
                'views',
            ],
        )
        return var_res.response_data(data=serializer.data)

    @action(methods=["get"], detail=False, url_path="job-posts-saved", url_name="job-posts-saved")
    def get_job_posts_saved(self, request):
        user = request.user
        queryset = (
            user.saved_job_posts.filter(status=var_sys.JobPostStatus.APPROVED)
            .select_related(
                'company',
                'company__logo',
                'company__cover_image',
                'company__user',
                'location',
                'location__city',
                'career',
            )
            .prefetch_related(
                Prefetch('savedjobpost_set', queryset=SavedJobPost.objects.filter(user=user)),
                Prefetch('jobpostactivity_set', queryset=JobPostActivity.objects.filter(user=user)),
            )
            .order_by('update_at', 'create_at')
        )

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(
                page,
                many=True,
                fields=[
                    'id',
                    'slug',
                    'companyDict',
                    "salaryMin",
                    "salaryMax",
                    'jobName',
                    'isHot',
                    'isUrgent',
                    'isApplied',
                    'salary',
                    'city',
                    'deadline',
                    'locationDict',
                ],
            )
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return var_res.response_data(data=serializer.data)

    @action(methods=["post"], detail=True, url_path="save", url_name="save")
    def save_job(self, request, slug):
        from ..services import JobActivityService
        is_saved = JobActivityService.toggle_save_job(
            user=request.user,
            job_post=self.get_object()
        )
        return var_res.response_data(data={"isSaved": is_saved})


class AdminJobPostViewSet(viewsets.ModelViewSet):
    queryset = JobPost.objects.select_related('user', 'company', 'career', 'location').all().order_by(
        "-create_at", "-update_at", "-id"
    )
    serializer_class = JobPostSerializer
    permission_classes = [perms_custom.IsAdminUser]
    filter_backends = [DjangoFilterBackend, AliasedOrderingFilter, SearchFilter]
    filterset_class = JobPostFilter
    search_fields = ['job_name', 'company__company_name']
    ordering_fields = ['create_at', 'deadline', 'views']

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(
                page,
                many=True,
                fields=[
                    'id',
                    'slug',
                    'companyDict',
                    'salaryMin',
                    'salaryMax',
                    'jobName',
                    'isHot',
                    'isUrgent',
                    'status',
                    'createAt',
                    'deadline',
                    'locationDict',
                ],
            )
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return var_res.response_data(data=serializer.data)

    @action(detail=True, methods=['patch'], url_path='approve')
    def approve_job(self, request, pk=None):
        job_post = self.get_object()
        job_post.status = var_sys.JobPostStatus.APPROVED
        job_post.save()
        return var_res.response_data(data=JobPostSerializer(job_post).data)

    @action(detail=True, methods=['patch'], url_path='reject')
    def reject_job(self, request, pk=None):
        job_post = self.get_object()
        job_post.status = var_sys.JobPostStatus.REJECTED
        job_post.save()
        return var_res.response_data(data=JobPostSerializer(job_post).data)
