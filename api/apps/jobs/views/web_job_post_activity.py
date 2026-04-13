from django.conf import settings
from django.db import connection
from django.db.utils import OperationalError, ProgrammingError
from django.db.models import Case, CharField, F, When
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
import logging
from functools import lru_cache

from apps.accounts import permissions as perms_custom
from apps.files.models import File
from apps.profiles.serializers import SendMailToJobSeekerSerializer
from console.jobs import queue_mail
from shared import pagination as paginations
from shared import renderers
from shared.configs import table_export
from shared.configs import variable_response as var_res
from shared.configs import variable_system as var_sys
from shared.configs.messages import APPLICATION_STATUS_MESSAGES
from shared.helpers import helper, utils

from ..filters import AliasedOrderingFilter, EmployerJobPostActivityFilter
from ..models import JobPostActivity
from ..serializers import (
    EmployerJobPostActivityExportSerializer,
    EmployerJobPostActivitySerializer,
    JobSeekerJobPostActivitySerializer,
)

logger = logging.getLogger(__name__)


@lru_cache(maxsize=1)
def has_ai_analysis_progress_column() -> bool:
    try:
        with connection.cursor() as cursor:
            columns = {
                col.name if hasattr(col, "name") else col[0]
                for col in connection.introspection.get_table_description(cursor, JobPostActivity._meta.db_table)
            }
            return "ai_analysis_progress" in columns
    except (OperationalError, ProgrammingError):
        logger.exception("Could not introspect ai_analysis_progress column.")
        return False


class JobSeekerJobPostActivityViewSet(
    viewsets.ViewSet,
    generics.ListAPIView,
    generics.CreateAPIView,
):
    queryset = JobPostActivity.objects.select_related('job_post', 'job_post__company', 'job_post__location', 'resume')
    serializer_class = JobSeekerJobPostActivitySerializer
    permission_classes = [perms_custom.IsJobSeekerUser]
    renderer_classes = [renderers.MyJSONRenderer]
    pagination_class = paginations.CustomPagination

    def list(self, request, *args, **kwargs):
        user = request.user
        queryset = user.jobpostactivity_set.order_by('-create_at', '-update_at')

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(
                page,
                many=True,
                fields=[
                    "id",
                    "createAt",
                    "jobPostDict",
                    "resumeDict",
                ],
            )
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return var_res.response_data(data=serializer.data)

    @action(methods=["get"], detail=False, url_path="chat", url_name="job-seeker-job-posts-activity-chat")
    def job_seeker_job_posts_activity_chat(self, request):
        user = request.user
        queryset = (
            user.jobpostactivity_set.order_by('-create_at', '-update_at')
            .annotate(
                userId=F('job_post__company__user_id'),
                fullName=F('job_post__company__user__full_name'),
                userEmail=F('job_post__company__user__email'),
                companyId=F('job_post__company_id'),
                companyName=F('job_post__company__company_name'),
                companySlug=F('job_post__company__slug'),
                companyImageId=F('job_post__company__logo__id'),
                jobPostTitle=F('job_post__job_name'),
            )
            .values(
                'id',
                'userId',
                'fullName',
                'userEmail',
                'companyId',
                "companyName",
                "companySlug",
                'companyImageId',
                'jobPostTitle',
            )
        )

        page = self.paginate_queryset(queryset)
        res_data = page
        if page is not None:
            res_data = list(page)
            # Batch fetch all File objects to avoid N+1
            logo_ids = [item.get("companyImageId") for item in res_data if item.get("companyImageId")]
            logos_map = {f.id: f for f in File.objects.filter(id__in=logo_ids)} if logo_ids else {}
            for item in res_data:
                logo_id = item.pop("companyImageId", None)
                logo = logos_map.get(logo_id) if logo_id else None
                item["companyImageUrl"] = (
                    logo.get_full_url() if logo else var_sys.AVATAR_DEFAULT["COMPANY_LOGO"]
                )

            return self.get_paginated_response(res_data)

        return var_res.response_data(res_data)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        from ..services import JobActivityService
        try:
            job_post_activity = JobActivityService.apply_to_job(
                user=request.user,
                validated_data=serializer.validated_data
            )
        except ValueError as e:
            from rest_framework.exceptions import ValidationError
            raise ValidationError({"errorMessage": [str(e)]})

        response_serializer = self.get_serializer(job_post_activity)
        headers = self.get_success_headers(response_serializer.data)

        return var_res.response_data(status=status.HTTP_201_CREATED, data=response_serializer.data, headers=headers)


class EmployerJobPostActivityViewSet(
    viewsets.ViewSet,
    generics.ListAPIView,
    generics.RetrieveAPIView,
    generics.UpdateAPIView,
    generics.DestroyAPIView,
):
    queryset = JobPostActivity.objects.select_related('user', 'resume', 'job_post', 'job_post__company')
    serializer_class = EmployerJobPostActivitySerializer
    permission_classes = [perms_custom.IsEmployerUser]
    renderer_classes = [renderers.MyJSONRenderer]
    pagination_class = paginations.CustomPagination
    filterset_class = EmployerJobPostActivityFilter
    filter_backends = [DjangoFilterBackend, AliasedOrderingFilter]
    ordering_fields = (
        ('createAt', 'create_at'),
        ('status', 'status'),
        ('fullName', 'full_name'),
    )

    def get_queryset(self):
        queryset = super().get_queryset()
        if not has_ai_analysis_progress_column():
            return queryset.defer('ai_analysis_progress')
        return queryset

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.job_post.company != request.user.active_company:
            return var_res.response_data(status=status.HTTP_403_FORBIDDEN)
        fields = [
            "id",
            "fullName",
            "email",
            "title",
            "jobName",
            "resumeFileUrl",
            "aiAnalysisScore",
            "aiAnalysisSummary",
            "aiAnalysisSkills",
            "aiAnalysisStatus",
            "aiAnalysisPros",
            "aiAnalysisCons",
            "aiAnalysisMatchingSkills",
            "aiAnalysisMissingSkills",
        ]
        if has_ai_analysis_progress_column():
            fields.append("aiAnalysisProgress")
        serializer = self.get_serializer(
            instance,
            fields=fields,
        )
        return var_res.response_data(data=serializer.data)

    def list(self, request, *args, **kwargs):
        user = request.user
        queryset = (
            self.filter_queryset(
                self.get_queryset()
                .filter(job_post__company=user.active_company, is_deleted=False)
                .order_by('-id', 'create_at')
            )
        )

        page = self.paginate_queryset(queryset)
        if page is not None:
            fields = [
                "id",
                "userId",
                "fullName",
                "email",
                "title",
                "resumeSlug",
                "type",
                "jobName",
                "status",
                "createAt",
                "isSentEmail",
                "resumeFileUrl",
                "aiAnalysisScore",
                "aiAnalysisSummary",
                "aiAnalysisSkills",
                "aiAnalysisStatus",
            ]
            if has_ai_analysis_progress_column():
                fields.append("aiAnalysisProgress")
            serializer = self.get_serializer(
                page,
                many=True,
                fields=fields,
            )
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return var_res.response_data(data=serializer.data)

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            instance.is_deleted = True
            instance.save()
        except Exception as ex:
            helper.print_log_error("delete job post activity", ex)
            return var_res.response_data(status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            return var_res.response_data(status=status.HTTP_204_NO_CONTENT)

    @action(methods=["get"], detail=False, url_path="chat", url_name="employer-job-posts-activity-chat")
    def employer_job_posts_activity_chat(self, request):
        user = request.user
        queryset = (
            self.filter_queryset(
                self.get_queryset()
                .filter(job_post__company=user.active_company)
                .annotate(
                    userId=F('user_id'),
                    fullName=F('user__full_name'),
                    userEmail=F('user__email'),
                    avatarUrl=Case(
                        When(user__avatar__isnull=False, then=F('user__avatar__id')),
                        default=None,
                        output_field=CharField(),
                    ),
                    jobPostTitle=F('job_post__job_name'),
                )
                .values('id', 'userId', "fullName", 'userEmail', "avatarUrl", 'jobPostTitle')
                .order_by('-id', 'create_at')
            )
        )

        page = self.paginate_queryset(queryset)
        res_data = page
        if page is not None:
            # Batch fetch all File objects to avoid N+1
            avatar_ids = [item['avatarUrl'] for item in res_data if item.get('avatarUrl')]
            avatars_map = {f.id: f for f in File.objects.filter(id__in=avatar_ids)} if avatar_ids else {}
            for item in res_data:
                avatar_id = item.get('avatarUrl')
                avatar = avatars_map.get(avatar_id) if avatar_id else None
                item['avatarUrl'] = (
                    avatar.get_full_url() if avatar else var_sys.AVATAR_DEFAULT["AVATAR"]
                )
            return self.get_paginated_response(res_data)
        return var_res.response_data(res_data)

    @action(methods=["get"], detail=False, url_path="export", url_name="job-posts-activity-export")
    def export_job_posts_activity(self, request):
        user = request.user
        queryset = (
            self.filter_queryset(
                self.get_queryset().filter(job_post__company=user.active_company).order_by('-id', 'create_at')
            )
        )

        serializer = EmployerJobPostActivityExportSerializer(
            queryset,
            many=True,
            fields=[
                "title",
                "fullName",
                "email",
                "phone",
                "gender",
                "birthday",
                "address",
                "jobName",
                "createAt",
                "statusApply",
            ],
        )

        result_data = utils.convert_data_with_en_key_to_vn_kew(
            serializer.data,
            table_export.JOB_POST_ACTIVITY_FIELD,
        )

        return var_res.response_data(data=result_data)

    @action(methods=["put"], detail=True, url_path="application-status", url_name="application-status")
    def change_application_status(self, request, pk):
        data = request.data
        if data.get("status", None):
            try:
                stt = int(data["status"])
            except ValueError:
                return var_res.response_data(status=status.HTTP_400_BAD_REQUEST)
                
            job_post_activity = self.get_object()
            if job_post_activity.job_post.company != request.user.active_company:
                return var_res.response_data(status=status.HTTP_403_FORBIDDEN)

            from ..services import JobActivityService
            try:
                JobActivityService.change_application_status(job_post_activity, stt)
                return var_res.response_data(status=status.HTTP_200_OK)
            except ValueError:
                return var_res.response_data(status=status.HTTP_400_BAD_REQUEST)

        return var_res.response_data(status=status.HTTP_400_BAD_REQUEST)

    @action(methods=["post"], detail=True, url_path="send-email", url_name="send-email")
    def send_email(self, request, pk):
        try:
            data = request.data
            serializer = SendMailToJobSeekerSerializer(data=data)
            if not serializer.is_valid():
                return var_res.response_data(
                    status=status.HTTP_400_BAD_REQUEST,
                    errors=serializer.errors,
                )

            from ..services import JobActivityService
            activity = self.get_object()
            if activity.job_post.company != request.user.active_company:
                return var_res.response_data(status=status.HTTP_403_FORBIDDEN)
            JobActivityService.send_email_to_job_seeker(
                activity=activity,
                user=request.user,
                validated_data=serializer.validated_data
            )
            return var_res.response_data()
        except Exception as ex:
            helper.print_log_error("send_email", ex)
            return var_res.response_data(status=status.HTTP_500_INTERNAL_SERVER_ERROR)


    @action(methods=["post"], detail=True, url_path="analyze-resume", url_name="analyze-resume")
    def analyze_resume(self, request, pk):
        try:
            if not has_ai_analysis_progress_column():
                return var_res.response_data(
                    status=status.HTTP_503_SERVICE_UNAVAILABLE,
                    errors={"errorMessage": ["Database schema is outdated. Please run migrations first."]},
                )
            
            job_post_activity = self.get_object()
            if job_post_activity.job_post.company != request.user.active_company:
                return var_res.response_data(status=status.HTTP_403_FORBIDDEN)

            from ..services import JobActivityService
            JobActivityService.trigger_ai_analysis(job_post_activity)
            
            return var_res.response_data(data={"detail": "AI analysis task has been queued."}, status=status.HTTP_202_ACCEPTED)
        except Exception as ex:
            helper.print_log_error("analyze_resume", ex)
            return var_res.response_data(status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class AdminJobPostActivityViewSet(viewsets.ModelViewSet):
    queryset = JobPostActivity.objects.select_related('user', 'job_post', 'resume').all().order_by('id')
    serializer_class = EmployerJobPostActivitySerializer
    permission_classes = [perms_custom.IsAdminUser]
    pagination_class = paginations.CustomPagination
