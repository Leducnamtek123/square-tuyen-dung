from django.db import transaction
from django.db.models import Count, Q
from rest_framework import serializers, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.accounts import permissions as perms_custom
from apps.locations.models import City, District
from shared.audit import record_audit_log
from shared import pagination as paginations
from shared.audit import AuditLogViewSetMixin
from shared.configs.variable_response import response_data
from ..models import Company, CompanyMember, JobSeekerProfile, Resume, ResumeImportJob
from ..serializers import CompanySerializer, JobSeekerProfileSerializer, ResumeSerializer
from ..services.vieclam24h_import_browser import get_vieclam24h_catalog
from ..tasks import run_vieclam24h_import


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


def _apply_job_seeker_profile_filters(queryset, request):
    filter_map = {
        "cityId": "resumes__city_id",
        "careerId": "resumes__career_id",
        "experienceId": "resumes__experience",
        "positionId": "resumes__position",
        "academicLevelId": "resumes__academic_level",
        "typeOfWorkplaceId": "resumes__type_of_workplace",
        "jobTypeId": "resumes__job_type",
        "genderId": "gender",
        "maritalStatusId": "marital_status",
    }

    for param_name, field_name in filter_map.items():
        raw_value = request.query_params.get(param_name)
        if raw_value in (None, ""):
            continue
        queryset = queryset.filter(**{field_name: raw_value})

    return queryset


class Vieclam24hImportSerializer(serializers.Serializer):
    sourceUrl = serializers.URLField()
    account = serializers.CharField(max_length=255)
    password = serializers.CharField(max_length=255, write_only=True)
    occupationIds = serializers.ListField(
        child=serializers.IntegerField(min_value=1),
        required=False,
        allow_empty=True,
    )
    destinationCityId = serializers.IntegerField(min_value=1, required=False, allow_null=True)
    destinationDistrictId = serializers.IntegerField(min_value=1, required=False, allow_null=True)

    def validate(self, attrs):
        city_id = attrs.get("destinationCityId")
        district_id = attrs.get("destinationDistrictId")

        if city_id in (None, "") and district_id in (None, ""):
            attrs["destinationCity"] = None
            attrs["destinationDistrict"] = None
            return attrs

        if city_id in (None, "") or district_id in (None, ""):
            raise serializers.ValidationError(
                {"destinationCityId": ["Ch?n c? t?nh/th?nh ph? v? qu?n/huy?n, ho?c ?? tr?ng c? hai."]}
            )

        city = City.objects.filter(id=city_id).first()
        if not city:
            raise serializers.ValidationError({"destinationCityId": ["T?nh/Th?nh ph? ??ch kh?ng h?p l?."]})

        district = District.objects.filter(id=district_id, city=city).first()
        if not district:
            raise serializers.ValidationError({"destinationDistrictId": ["Qu?n/Huy?n ??ch ph?i thu?c T?nh/Th?nh ph? ?? ch?n."]})

        attrs["destinationCity"] = city
        attrs["destinationDistrict"] = district
        return attrs


class Vieclam24hCatalogSerializer(serializers.Serializer):
    sourceUrl = serializers.URLField(required=False)

class Vieclam24hImportJobSerializer(serializers.ModelSerializer):
    createdCount = serializers.IntegerField(source="created_count", read_only=True)
    updatedCount = serializers.IntegerField(source="updated_count", read_only=True)
    skippedCount = serializers.IntegerField(source="skipped_count", read_only=True)
    sourceUrl = serializers.URLField(source="source_url", read_only=True)
    sourceAccount = serializers.CharField(source="source_account", read_only=True)
    targetCityId = serializers.IntegerField(source="target_city_id", read_only=True, allow_null=True)
    targetDistrictId = serializers.IntegerField(source="target_district_id", read_only=True, allow_null=True)
    sourcePayload = serializers.JSONField(source="source_payload", read_only=True)
    resultPayload = serializers.JSONField(source="result_payload", read_only=True)
    errorMessage = serializers.CharField(source="error_message", read_only=True)
    startedAt = serializers.DateTimeField(source="started_at", read_only=True, allow_null=True)
    finishedAt = serializers.DateTimeField(source="finished_at", read_only=True, allow_null=True)

    class Meta:
        model = ResumeImportJob
        fields = (
            "id",
            "status",
            "progress",
            "createdCount",
            "updatedCount",
            "skippedCount",
            "sourceUrl",
            "sourceAccount",
            "targetCityId",
            "targetDistrictId",
            "sourcePayload",
            "resultPayload",
            "errorMessage",
            "startedAt",
            "finishedAt",
            "create_at",
            "update_at",
        )


class BulkDeleteJobSeekerProfilesSerializer(serializers.Serializer):
    ids = serializers.ListField(
        child=serializers.IntegerField(min_value=1),
        allow_empty=False,
    )


class AdminCompanyViewSet(AuditLogViewSetMixin, viewsets.ModelViewSet):
    queryset = Company.objects.all().order_by("id")
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

    def perform_destroy(self, instance):
        with transaction.atomic():
            self._audit_instance("delete", instance)
            CompanyMember.objects.filter(Q(company=instance) | Q(role__company=instance)).delete()
            instance.delete()


class AdminJobSeekerProfileViewSet(AuditLogViewSetMixin, viewsets.ModelViewSet):
    queryset = JobSeekerProfile.objects.select_related("user", "user__avatar", "location").all().order_by("id")
    serializer_class = JobSeekerProfileSerializer
    permission_classes = [perms_custom.IsAdminUser]
    pagination_class = paginations.CustomPagination

    def get_queryset(self):
        queryset = _apply_search_ordering(
            super().get_queryset(),
            self.request,
            ["phone", "user__full_name", "user__email", "resumes__title"],
            {
                "id": "id",
                "phone": "phone",
                "createAt": "create_at",
                "updateAt": "update_at",
            },
        )
        queryset = _apply_job_seeker_profile_filters(queryset, self.request)
        return queryset.distinct()

    @action(detail=False, methods=["post"], url_path="bulk-delete")
    def bulk_delete(self, request):
        payload = BulkDeleteJobSeekerProfilesSerializer(data=request.data)
        payload.is_valid(raise_exception=True)

        ids = payload.validated_data["ids"]
        with transaction.atomic():
            deleted_count, deleted_breakdown = JobSeekerProfile.objects.filter(id__in=ids).delete()
            record_audit_log(
                request=request,
                action="bulk_delete",
                resource_type="profiles.JobSeekerProfile",
                metadata={
                    "ids": ids,
                    "deleted": deleted_count,
                    "deletedBreakdown": deleted_breakdown,
                },
            )

        return Response({"deleted": deleted_count})


class AdminResumeViewSet(AuditLogViewSetMixin, viewsets.ModelViewSet):
    queryset = Resume.objects.select_related(
        "user",
        "user__avatar",
        "file",
        "city",
        "career",
        "job_seeker_profile",
        "job_seeker_profile__user",
    ).all().order_by("id")
    serializer_class = ResumeSerializer
    permission_classes = [perms_custom.IsAdminUser]
    pagination_class = paginations.CustomPagination
    lookup_field = "id"

    def get_queryset(self):
        queryset = super().get_queryset()
        profile_id = self.request.query_params.get("jobSeekerProfileId") or self.request.query_params.get("jobSeekerProfile")
        user_id = self.request.query_params.get("userId") or self.request.query_params.get("user")

        if profile_id:
            queryset = queryset.filter(job_seeker_profile_id=profile_id)
        elif user_id:
            queryset = queryset.filter(user_id=user_id)

        return _apply_search_ordering(
            queryset,
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

    @action(detail=False, methods=["post"], url_path="import-vieclam24h")
    def import_vieclam24h(self, request):
        payload = Vieclam24hImportSerializer(data=request.data)
        payload.is_valid(raise_exception=True)

        job = ResumeImportJob.objects.create(
            status=ResumeImportJob.Status.PENDING,
            progress=0,
            source_url=payload.validated_data["sourceUrl"],
            source_account=payload.validated_data["account"],
            occupation_ids=list(payload.validated_data.get("occupationIds") or []),
            target_city=payload.validated_data["destinationCity"],
            target_district=payload.validated_data["destinationDistrict"],
            created_by=request.user,
            source_payload={
                "sourceUrl": payload.validated_data["sourceUrl"],
                "account": payload.validated_data["account"],
                "occupationIds": list(payload.validated_data.get("occupationIds") or []),
                "destinationCityId": payload.validated_data["destinationCity"].id if payload.validated_data["destinationCity"] else None,
                "destinationDistrictId": payload.validated_data["destinationDistrict"].id if payload.validated_data["destinationDistrict"] else None,
            },
        )

        transaction.on_commit(
            lambda: run_vieclam24h_import.delay(
                job.id,
                source_url=payload.validated_data["sourceUrl"],
                account=payload.validated_data["account"],
                password=payload.validated_data["password"],
                occupation_ids=list(payload.validated_data.get("occupationIds") or []),
                target_city_id=payload.validated_data["destinationCity"].id if payload.validated_data["destinationCity"] else None,
                target_district_id=payload.validated_data["destinationDistrict"].id if payload.validated_data["destinationDistrict"] else None,
            )
        )

        job.refresh_from_db()
        serializer = Vieclam24hImportJobSerializer(job)
        return response_data(status=202, data=serializer.data)

    @action(detail=False, methods=["get"], url_path="vieclam24h-catalog")
    def vieclam24h_catalog(self, request):
        payload = Vieclam24hCatalogSerializer(data=request.query_params)
        payload.is_valid(raise_exception=True)
        catalog = get_vieclam24h_catalog(payload.validated_data.get("sourceUrl"))
        return Response(catalog)


class ResumeImportJobViewSet(AuditLogViewSetMixin, viewsets.ReadOnlyModelViewSet):
    queryset = ResumeImportJob.objects.select_related("created_by", "target_city", "target_district").all().order_by("-id")
    serializer_class = Vieclam24hImportJobSerializer
    permission_classes = [perms_custom.IsAdminUser]
    pagination_class = paginations.CustomPagination
