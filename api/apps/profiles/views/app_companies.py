import datetime

from shared import pagination as paginations
from shared import renderers

from shared.configs import variable_system as var_sys
from shared.configs import variable_response as var_res

from django.db.models import Count, Q, Prefetch

from django_filters.rest_framework import DjangoFilterBackend


from rest_framework import viewsets, generics, views
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import permissions as perms_sys
from rest_framework import status

from apps.accounts import permissions as perms_custom

from ..models import Company, CompanyFollowed

from ..filters import CompanyFilter, AliasedOrderingFilter

from ..serializers import CompanySerializer, CompanyFollowedSerializer


class CompanyViewSet(viewsets.ViewSet, generics.ListAPIView, generics.RetrieveAPIView):
    queryset = Company.objects.select_related(
        "user", "logo", "cover_image", "location", "location__city"
    ).prefetch_related("company_images", "company_images__image")

    serializer_class = CompanySerializer

    permission_classes = [perms_sys.AllowAny]

    renderer_classes = [renderers.MyJSONRenderer]

    pagination_class = paginations.CustomPagination

    filterset_class = CompanyFilter

    filter_backends = [DjangoFilterBackend, AliasedOrderingFilter]

    ordering_fields = (("updateAt", "update_at"), ("createAt", "create_at"))

    def get_permissions(self):
        if self.action in ["followed"]:
            return [perms_custom.IsJobSeekerUser()]

        return [perms_sys.AllowAny()]

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset()).annotate(
            follow_count=Count("companyfollowed", distinct=True),
            active_job_post_count=Count(
                "job_posts",
                filter=Q(
                    job_posts__deadline__gte=datetime.date.today(),
                    job_posts__status=var_sys.JobPostStatus.APPROVED,
                ),
                distinct=True,
            ),
        )
        if request.user.is_authenticated:
            queryset = queryset.prefetch_related(
                Prefetch(
                    "companyfollowed_set",
                    queryset=CompanyFollowed.objects.filter(user=request.user),
                )
            )
        queryset = queryset.order_by("-id", "update_at", "create_at")

        page = self.paginate_queryset(queryset)

        if page is not None:
            serializer = self.get_serializer(
                page,
                many=True,
                fields=["id", "companyName", "companyImageUrl", "followNumber", "jobPostNumber", "isFollowed"],
            )

            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)

        return var_res.response_data(data=serializer.data)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()

        serializer = self.get_serializer(
            instance,
            fields=[
                "id",
                "slug",
                "taxCode",
                "companyName",
                "employeeSize",
                "fieldOperation",
                "location",
                "since",
                "companyEmail",
                "companyPhone",
                "websiteUrl",
                "facebookUrl",
                "youtubeUrl",
                "linkedinUrl",
                "description",
                "companyImageUrl",
                "companyCoverImageUrl",
                "followNumber",
                "isFollowed",
                "companyImages",
            ],
        )

        return var_res.response_data(data=serializer.data)

    @action(methods=["get"], detail=False, url_path="top", url_name="companies-top")
    def get_top_companies(self, request):
        queryset = Company.objects.annotate(
            num_follow=Count("companyfollowed"),
            num_job_post=Count("job_posts"),
        ).order_by("-num_follow", "-num_job_post")[:10]

        serializer = CompanySerializer(
            queryset,
            many=True,
            fields=[
                "id",
                "companyName",
                "companyImageUrl",
                "followNumber",
                "jobPostNumber",
                "isFollowed",
            ],
            context={"request": request},
        )

        return var_res.response_data(data=serializer.data)

    @action(methods=["post"], detail=True, url_path="followed", url_name="followed")
    def followed(self, request, pk):
        is_followed = False

        companies_followed = CompanyFollowed.objects.filter(
            user=request.user, company=self.get_object()
        )

        if companies_followed.exists():
            company_followed = companies_followed.first()

            company_followed.delete()
        else:
            CompanyFollowed.objects.create(
                user=request.user,
                company=self.get_object(),
            )

            is_followed = True

        return var_res.response_data(data={"isFollowed": is_followed})


class CompanyFollowedAPIView(views.APIView):
    permission_classes = [perms_custom.IsJobSeekerUser]
    renderer_classes = [renderers.MyJSONRenderer]
    pagination_class = paginations.CustomPagination

    def get(self, request):
        user = request.user

        queryset = CompanyFollowed.objects.filter(user=user).order_by(
            "-update_at", "-create_at"
        )

        paginator = self.pagination_class()

        page = paginator.paginate_queryset(queryset, request)

        if page is not None:
            serializer = CompanyFollowedSerializer(
                page, many=True, context={"request": request}
            )

            return paginator.get_paginated_response(serializer.data)

        serializer = CompanyFollowedSerializer(
            queryset, many=True, context={"request": request}
        )

        return var_res.response_data(data=serializer.data)
