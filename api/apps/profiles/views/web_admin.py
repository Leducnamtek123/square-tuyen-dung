from rest_framework import viewsets
from django.db.models import Count, Q

from apps.accounts import permissions as perms_custom
from shared import pagination as paginations

from ..models import Company, JobSeekerProfile, Resume
from ..serializers import CompanySerializer, JobSeekerProfileSerializer, ResumeSerializer


def _apply_search_ordering(queryset, request, search_fields, ordering_map):
    search = request.query_params.get("kw") or request.query_params.get("search")
    if search:
        query = Q()
        for field in search_fields:
            query |= Q(**{f"{field}__icontains": search})
        queryset = queryset.filter(query)

    ordering = request.query_params.get("ordering")
    if ordering:
        is_desc = ordering.startswith("-")
        key = ordering[1:] if is_desc else ordering
        mapped = ordering_map.get(key)
        if mapped:
            queryset = queryset.order_by(f"-{mapped}" if is_desc else mapped)

    return queryset


class AdminCompanyViewSet(viewsets.ModelViewSet):

    queryset = Company.objects.all().order_by('id')

    serializer_class = CompanySerializer

    permission_classes = [perms_custom.IsAdminUser]

    pagination_class = paginations.CustomPagination

    def get_queryset(self):
        queryset = super().get_queryset().select_related("user", "logo", "cover_image", "location", "location__city")
        ordering = self.request.query_params.get("ordering", "")
        if "jobPostNumber" in ordering:
            queryset = queryset.annotate(active_job_post_count=Count("job_posts", distinct=True))
        if "followNumber" in ordering:
            queryset = queryset.annotate(follow_count=Count("companyfollowed", distinct=True))

        return _apply_search_ordering(
            queryset,
            self.request,
            ["company_name", "company_email", "company_phone", "tax_code", "field_operation"],
            {
                "id": "id",
                "companyName": "company_name",
                "companyEmail": "company_email",
                "companyPhone": "company_phone",
                "taxCode": "tax_code",
                "employeeSize": "employee_size",
                "fieldOperation": "field_operation",
                "jobPostNumber": "active_job_post_count",
                "followNumber": "follow_count",
                "createAt": "create_at",
                "updateAt": "update_at",
            },
        )

    def perform_create(self, serializer):
        serializer.save()


class AdminJobSeekerProfileViewSet(viewsets.ModelViewSet):

    queryset = JobSeekerProfile.objects.select_related("user", "user__avatar", "location").all().order_by('id')

    serializer_class = JobSeekerProfileSerializer

    permission_classes = [perms_custom.IsAdminUser]

    pagination_class = paginations.CustomPagination

    def get_queryset(self):
        return _apply_search_ordering(
            super().get_queryset(),
            self.request,
            ["phone", "user__full_name", "user__email"],
            {
                "id": "id",
                "phone": "phone",
                "createAt": "create_at",
                "updateAt": "update_at",
            },
        )


class AdminResumeViewSet(viewsets.ModelViewSet):

    queryset = Resume.objects.select_related("user", "user__avatar", "file", "city", "career").all().order_by('id')

    serializer_class = ResumeSerializer

    permission_classes = [perms_custom.IsAdminUser]

    pagination_class = paginations.CustomPagination

    lookup_field = 'id'

    def get_queryset(self):
        return _apply_search_ordering(
            super().get_queryset(),
            self.request,
            ["title", "description", "user__full_name", "user__email"],
            {
                "id": "id",
                "title": "title",
                "createAt": "create_at",
                "updateAt": "update_at",
                "isActive": "is_active",
            },
        )
