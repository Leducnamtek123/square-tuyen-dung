from shared import pagination as paginations
from shared import renderers
from shared.permissions import PermissionActionMapMixin

from shared.helpers import utils

from shared.configs import variable_system as var_sys, table_export

from shared.configs import variable_response as var_res

from shared.configs.messages import NOTIFICATION_MESSAGES, ERROR_MESSAGES

from django.db.models import Count, Q, Prefetch

from django.db import transaction
from django.utils import timezone

from django_filters.rest_framework import DjangoFilterBackend

from shared.helpers import helper
from .. import filters

from rest_framework import viewsets, generics, views

from rest_framework.decorators import action, api_view, permission_classes

from rest_framework.response import Response

from rest_framework import permissions as perms_sys

from apps.accounts import permissions as perms_custom

from rest_framework import status

from ..models import (

    JobSeekerProfile,

    Resume, ResumeViewed,

    ResumeSaved,

    EducationDetail, ExperienceDetail,

    Certificate, LanguageSkill,

    AdvancedSkill,

    ContactProfile

)

from ..filters import (

    ResumeFilter,

    ResumeSavedFilter

)

from ..exceptions import ActiveCompanyRequiredError
from ..services import ResumeService

from ..serializers import (

    JobSeekerProfileSerializer,

    ResumeSerializer,

    ResumeDetailSerializer,

    ResumeViewedSerializer,

    ResumeSavedSerializer,

    ResumeSavedExportSerializer,

    CvSerializer,

    EducationSerializer,

    ExperienceSerializer,

    CertificateSerializer,

    LanguageSkillSerializer,

    AdvancedSkillSerializer,

    SendMailToJobSeekerSerializer

)

from apps.jobs.models import JobPostActivity

from .web_companies import (
    CompanyView,
    PrivateCompanyViewSet,
    CompanyViewSet,
    CompanyFollowedAPIView,
    CompanyImageViewSet,
    CompanyRoleViewSet,
    CompanyMemberViewSet,
)
from .web_admin import (
    AdminCompanyViewSet,
    AdminJobSeekerProfileViewSet,
    AdminResumeViewSet,
)

class JobSeekerProfileViewSet(viewsets.ViewSet,
                              generics.ListAPIView,
                              generics.RetrieveAPIView):
    queryset = JobSeekerProfile.objects
    serializer_class = JobSeekerProfileSerializer
    permission_classes = [perms_sys.IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)

    def get_permissions(self):
        if self.action in ["get_resumes"]:
            return [perms_custom.IsJobSeekerUser()]
        return [perm() for perm in self.permission_classes]

    @action(methods=["get"], detail=True,

            url_path="resumes", url_name="get-resumes")

    def get_resumes(self, request, pk):

        query_params = request.query_params

        resume_type = query_params.get("resumeType", None)

        job_seeker_profile = JobSeekerProfile.objects.filter(pk=pk, user=request.user).first()

        if not job_seeker_profile:
            return var_res.response_data(
                status=status.HTTP_404_NOT_FOUND,
                errors={"errorMessage": [ERROR_MESSAGES["USER_DOESNT_HAVE_JOB_SEEKER_PROFILE"]]},
            )

        resumes = job_seeker_profile.resumes

        # get all

        if resume_type is None:

            serializer = ResumeSerializer(resumes, many=True, fields=[

                "id", "slug", "title", "type", "updateAt", "isActive"

            ])

        else:

            # get by type

            if not (resume_type == var_sys.CV_WEBSITE) and not (resume_type == var_sys.CV_UPLOAD):

                return var_res.response_data(status=status.HTTP_400_BAD_REQUEST,

                                             errors={"detail": "resumeType is invalid."})

            resumes = resumes.filter(type=resume_type)

            if resume_type == var_sys.CV_WEBSITE:

                if not resumes.first():

                    return var_res.response_data()

                serializer = ResumeSerializer(resumes.first(),

                                              fields=["id", "slug", "title", "experience", "position",

                                                      "salaryMin", "salaryMax", "updateAt", "user", "isActive",

                                                      "positionChooseData", "experienceChooseData", "academicLevelChooseData",

                                                      "typeOfWorkplaceChooseData", "jobTypeChooseData",

                                                      "experienceDetails", "educationDetails", "certificateDetails",

                                                      "languageSkills", "advancedSkills"])

            else:

                serializer = ResumeSerializer(resumes, many=True,

                                              fields=["id", "slug", "title", "updateAt",

                                                      "imageUrl", "fileUrl", "isActive"])

        return var_res.response_data(data=serializer.data)

class PrivateResumeViewSet(PermissionActionMapMixin, viewsets.ViewSet,

                           generics.CreateAPIView,

                           generics.UpdateAPIView,

                           generics.DestroyAPIView):

    queryset = Resume.objects.select_related(
        'user', 'user__avatar', 'city', 'career', 'file',
        'job_seeker_profile'
    )

    serializer_class = ResumeSerializer

    lookup_field = 'slug'

    permission_action_map = {
        "get_resume_detail_of_job_seeker": [perms_custom.ResumeOwnerPerms],
        "update": [perms_custom.ResumeOwnerPerms],
        "partial_update": [perms_custom.ResumeOwnerPerms],
        "active_resume": [perms_custom.ResumeOwnerPerms],
        "get_cv": [perms_custom.ResumeOwnerPerms],
        "update_cv_file": [perms_custom.ResumeOwnerPerms],
        "destroy": [perms_custom.ResumeOwnerPerms],
        "get_experiences_detail": [perms_custom.ResumeOwnerPerms],
        "get_educations_detail": [perms_custom.ResumeOwnerPerms],
        "get_certificates_detail": [perms_custom.ResumeOwnerPerms],
        "get_language_skills": [perms_custom.ResumeOwnerPerms],
        "get_advanced_skills": [perms_custom.ResumeOwnerPerms],
        "create": [perms_custom.IsJobSeekerUser],
    }
    default_permission_classes = [perms_sys.IsAuthenticated]

    def create(self, request, *args, **kwargs):

        data = request.data.copy()

        serializer = ResumeSerializer(data=data, fields=[

            "title", "description", "salaryMin", "salaryMax",

            "position", "experience", "academicLevel", "typeOfWorkplace",

            "jobType", "city", "career", "file"

        ], context={'request': request})

        if not serializer.is_valid():

            return var_res.response_data(status=status.HTTP_400_BAD_REQUEST,

                                         errors=serializer.errors)

        self.perform_create(serializer)

        return var_res.response_data(data=serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):

        partial = kwargs.pop('partial', False)

        instance = self.get_object()

        serializer = self.get_serializer(instance, data=request.data, partial=partial,

                                         fields=[

                                             "id", "slug", "title", "description",

                                             "salaryMin", "salaryMax",

                                             "position", "experience", "academicLevel",

                                             "typeOfWorkplace", "jobType", "isActive",

                                             "city", "career", "updateAt", "file",

                                             "imageUrl", "fileUrl", "user", "city",

                                         ])

        serializer.is_valid(raise_exception=True)

        self.perform_update(serializer)

        if getattr(instance, '_prefetched_objects_cache', None):

            # If 'prefetch_related' has been applied to a queryset, we need to

            # forcibly invalidate the prefetch cache on the instance.

            instance._prefetched_objects_cache = {}

        return var_res.response_data(data=serializer.data)

    @action(methods=["get"], detail=True,

            url_path='resume-active', url_name="resume-active", )

    def active_resume(self, request, slug):

        resume = self.get_object()

        if resume.is_active:

            resume.is_active = False

            resume.save()

        else:

            Resume.objects.filter(user=self.request.user) \
                .exclude(slug=resume.slug) \
                .update(is_active=False)

            resume.is_active = True

            resume.save()

        return var_res.response_data()

    @action(methods=["get"], detail=True,

            url_path='resume-owner', url_name="get-resume-detail-of-job-seeker", )

    def get_resume_detail_of_job_seeker(self, request, slug):

        resume_queryset = self.get_object()

        resume_serializer = ResumeSerializer(resume_queryset,

                                             fields=["id", "slug", "title", "salaryMin", "salaryMax",

                                                     "position", "experience", "academicLevel",

                                                     "typeOfWorkplace", "jobType", "description",

                                                     "isActive", "city", "career"])

        return var_res.response_data(data=resume_serializer.data)

    @action(methods=["get"], detail=True,

            url_path='cv', url_name="get-cv", )

    def get_cv(self, request, slug):

        resume_queryset = self.get_object()

        resume_serializer = CvSerializer(resume_queryset,

                                         fields=["id", "slug", "title", "fileUrl"])

        return var_res.response_data(data=resume_serializer.data)

    @get_cv.mapping.put

    def update_cv_file(self, request, slug):

        files = request.FILES

        cv_serializer = CvSerializer(

            self.get_object(), data=files, fields=["file"])

        if not cv_serializer.is_valid():

            return var_res.response_data(status=status.HTTP_400_BAD_REQUEST,

                                         errors=cv_serializer.errors)

        cv_serializer.save()

        return var_res.response_data()

    @action(methods=["get"], detail=True,

            url_path="educations-detail", url_name="get-educations-detail")

    def get_educations_detail(self, request, slug):

        educations_detail_queryset = self.get_object().education_details

        educations_detail_serializer = EducationSerializer(

            educations_detail_queryset,

            many=True)

        return var_res.response_data(data=educations_detail_serializer.data)

    @action(methods=["get"], detail=True,

            url_path="experiences-detail", url_name="get-experiences-detail")

    def get_experiences_detail(self, request, slug):

        experiences_detail_queryset = self.get_object().experience_details

        experiences_detail_serializer = ExperienceSerializer(

            experiences_detail_queryset,

            many=True)

        return var_res.response_data(data=experiences_detail_serializer.data)

    @action(methods=["get"], detail=True,

            url_path="certificates-detail", url_name="get-certificates-detail")

    def get_certificates_detail(self, request, slug):

        certificates_detail_queryset = self.get_object().certificates

        certificates_detail_serializer = CertificateSerializer(

            certificates_detail_queryset,

            many=True)

        return var_res.response_data(data=certificates_detail_serializer.data)

    @action(methods=["get"], detail=True,

            url_path="language-skills", url_name="get-language-skills")

    def get_language_skills(self, request, slug):

        language_skill_queryset = self.get_object().language_skills

        language_skill_serializer = LanguageSkillSerializer(

            language_skill_queryset,

            many=True)

        return var_res.response_data(data=language_skill_serializer.data)

    @action(methods=["get"], detail=True,

            url_path="advanced-skills", url_name="get-advanced-skills")

    def get_advanced_skills(self, request, slug):

        advanced_skill_queryset = self.get_object().advanced_skills

        advanced_skill_serializer = AdvancedSkillSerializer(

            advanced_skill_queryset,

            many=True)

        return var_res.response_data(data=advanced_skill_serializer.data)

class ResumeViewSet(viewsets.ViewSet,

                    generics.ListAPIView,

                    generics.RetrieveAPIView):

    queryset = Resume.objects.select_related(
        'user', 'user__avatar',
        'job_seeker_profile', 'job_seeker_profile__location', 'job_seeker_profile__location__city',
        'city', 'career', 'file'
    )

    serializer_class = ResumeSerializer

    permission_classes = [perms_custom.IsEmployerUser]

    renderer_classes = [renderers.MyJSONRenderer]

    pagination_class = paginations.CustomPagination

    filterset_class = ResumeFilter

    filter_backends = [DjangoFilterBackend, filters.AliasedOrderingFilter]

    ordering_fields = (
        ('updateAt', 'update_at'), ('createAt', 'create_at'),
        ('salaryMin', 'salary_min'), ('salaryMax', 'salary_max'),
        'experience'
    )

    lookup_field = "slug"

    def get_serializer_class(self):

        if self.action in ["retrieve"]:

            return ResumeDetailSerializer

        return self.serializer_class

    def list(self, request, *args, **kwargs):
        user = request.user
        company = user.active_company if getattr(user, 'is_authenticated', False) else None
        queryset = self.filter_queryset(
            self.get_queryset()
            .filter(is_active=True)
            .prefetch_related(
                Prefetch(
                    'resumesaved_set',
                    queryset=ResumeSaved.objects.filter(company=company) if company else ResumeSaved.objects.none(),
                ),
                Prefetch(
                    'resumeviewed_set',
                    queryset=ResumeViewed.objects.filter(company=company) if company else ResumeViewed.objects.none(),
                ),
                Prefetch(
                    'contactprofile_set',
                    queryset=ContactProfile.objects.filter(company=company) if company else ContactProfile.objects.none(),
                ),
                Prefetch(
                    'jobpostactivity_set',
                    queryset=JobPostActivity.objects.filter(job_post__company=company).select_related('job_post').order_by('-create_at') if company else JobPostActivity.objects.none(),
                ),
            )
            .order_by('-id', 'update_at', 'create_at')
        )

        page = self.paginate_queryset(queryset)

        if page is not None:

            serializer = self.get_serializer(page, many=True, fields=[

                'id', 'slug', 'title', 'salaryMin', 'salaryMax',

                'experience', 'viewEmployerNumber', 'updateAt',

                'userDict', 'jobSeekerProfileDict', 'city',

                'isSaved', 'type', 'lastViewedDate'

            ])

            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)

        return var_res.response_data(data=serializer.data)

    @action(methods=["post"], detail=True,

            url_path="resume-saved", url_name="resume-saved")

    def resume_saved(self, request, slug):

        user = request.user

        saved_resumes = ResumeSaved.objects.filter(

            company=user.active_company, resume=self.get_object())

        is_saved = False

        if saved_resumes.exists():

            saved_resume = saved_resumes.first()

            saved_resume.delete()

        else:

            ResumeSaved.objects.create(

                company=request.user.active_company,

                resume=self.get_object()

            )

            is_saved = True

        # send notification

        company = user.active_company

        notification_content = NOTIFICATION_MESSAGES[

            'RESUME_SAVED'] if is_saved else NOTIFICATION_MESSAGES['RESUME_UNSAVED']

        helper.add_employer_saved_resume_notifications(

            company.company_name,

            notification_content,

            company.logo.get_full_url(

            ) if company.logo else var_sys.AVATAR_DEFAULT["COMPANY_LOGO"],

            self.get_object().user_id

        )

        return var_res.response_data(data={

            "isSaved": is_saved

        })

    @action(methods=["post"], detail=True,

            url_path="view-resume", url_name="view-resume")

    def view_resume(self, request, slug):

        user = request.user

        company = user.active_company

        if company is None:

            return var_res.response_data(

                status=status.HTTP_400_BAD_REQUEST,

                errors={"errorMessage": ["User has no active company."]},

            )

        resume = self.get_object()

        ResumeService.increment_resume_view(company=company, resume=resume)

        # Notification failure must not break the view-record operation.

        try:

            helper.add_employer_viewed_resume_notifications(

                company.company_name,

                "Da xem ho so cua ban",

                company.logo.get_full_url() if company.logo else var_sys.AVATAR_DEFAULT["COMPANY_LOGO"],

                resume.user_id

            )

        except Exception as ex:

            helper.print_log_error("view_resume_notification", ex)

        return var_res.response_data(status=status.HTTP_200_OK)

    @action(methods=["post"], detail=True,

            url_path="send-email", url_name="send-email")

    def send_email(self, request, slug):

        serializer = SendMailToJobSeekerSerializer(data=request.data)

        if not serializer.is_valid():

            return var_res.response_data(

                status=status.HTTP_400_BAD_REQUEST,

                errors=serializer.errors,

            )

        try:

            ResumeService.contact_resume_owner(

                requester=request.user,

                company=request.user.active_company,

                resume=self.get_object(),

                validated_data=serializer.validated_data,

            )

        except ActiveCompanyRequiredError as ex:

            return var_res.response_data(

                status=status.HTTP_400_BAD_REQUEST,

                errors={"errorMessage": [str(ex)]},

            )

        return var_res.response_data()

class ResumeViewedAPIView(views.APIView):

    permission_classes = [perms_custom.IsJobSeekerUser]

    renderer_classes = [renderers.MyJSONRenderer]

    pagination_class = paginations.CustomPagination

    # danh sach luot xem cua NTD doi voi ung vien hien tai

    def get(self, request):

        user = request.user

        queryset = ResumeViewed.objects.filter(

            resume__user=user

        ).select_related(
            'company', 'company__logo', 'resume', 'resume__user'
        ).order_by('-update_at', '-create_at')

        paginator = self.pagination_class()

        page = paginator.paginate_queryset(queryset, request)

        if page is not None:

            serializer = ResumeViewedSerializer(page, many=True)

            return paginator.get_paginated_response(serializer.data)

        serializer = ResumeViewedSerializer(queryset, many=True)

        return var_res.response_data(data=serializer.data)

class ResumeSavedViewSet(viewsets.ViewSet,

                         generics.ListAPIView):

    queryset = ResumeSaved.objects

    permission_classes = [perms_custom.IsEmployerUser]

    renderer_classes = [renderers.MyJSONRenderer]

    pagination_class = paginations.CustomPagination

    serializer_class = ResumeSavedSerializer

    filterset_class = ResumeSavedFilter

    filter_backends = [DjangoFilterBackend, filters.AliasedOrderingFilter]

    ordering_fields = (
        ('createAt', 'create_at'),
    )

    @staticmethod
    def _empty_result():
        return {"count": 0, "results": []}

    def list(self, request, *args, **kwargs):

        # danh sach ho so da luu cua nha tuyen dung
        try:
            user = request.user

            company = user.get_active_company()

            if not company:

                return var_res.response_data(data=self._empty_result())

            queryset = self.filter_queryset(self.get_queryset()

                                            .filter(company=company, resume__is_active=True)

                                            .select_related(
                                                'resume', 'resume__user', 'resume__user__avatar',
                                                'resume__city', 'resume__career', 'company'
                                            )

                                            .order_by("-create_at"))

            paginator = self.pagination_class()

            page = paginator.paginate_queryset(queryset, request)

            if page is not None:

                serializer = ResumeSavedSerializer(page, many=True, fields=[

                    "id", "resume", "resumeSlug", "createAt"

                ])

                return paginator.get_paginated_response(serializer.data)

            serializer = ResumeSavedSerializer(queryset, many=True)

            return var_res.response_data(data=serializer.data)
        except Exception as ex:
            helper.print_log_error("ResumeSavedViewSet.list", ex)
            return var_res.response_data(data=self._empty_result())

    @action(methods=["get"], detail=False,

            url_path="export", url_name="resumes-export")

    def export_resumes(self, request):
        try:
            user = request.user

            company = user.get_active_company()

            if not company:

                return var_res.response_data(data=[])

            queryset = self.filter_queryset(self.get_queryset()

                                            .filter(company=company,

                                                    resume__is_active=True)

                                            .order_by("-create_at"))

            serializer = ResumeSavedExportSerializer(queryset, many=True)

            result_data = utils.convert_data_with_en_key_to_vn_kew(serializer.data,

                                                                   table_export.RESUMES_EXPORT_FIELD)

            return var_res.response_data(data=result_data)
        except Exception as ex:
            helper.print_log_error("ResumeSavedViewSet.export_resumes", ex)
            return var_res.response_data(data=[])

class EducationDetailViewSet(viewsets.ViewSet,

                             generics.CreateAPIView,

                             generics.RetrieveUpdateDestroyAPIView):

    queryset = EducationDetail.objects

    serializer_class = EducationSerializer

    renderer_classes = [renderers.MyJSONRenderer]

    permission_classes = [perms_custom.IsJobSeekerUser]

    def get_queryset(self):
        return self.queryset.filter(resume__user=self.request.user)

class ExperienceDetailViewSet(viewsets.ViewSet,

                              generics.CreateAPIView,

                              generics.RetrieveUpdateDestroyAPIView):

    queryset = ExperienceDetail.objects

    serializer_class = ExperienceSerializer

    renderer_classes = [renderers.MyJSONRenderer]

    permission_classes = [perms_custom.IsJobSeekerUser]

    def get_queryset(self):
        return self.queryset.filter(resume__user=self.request.user)

class CertificateDetailViewSet(viewsets.ViewSet,

                               generics.CreateAPIView,

                               generics.RetrieveUpdateDestroyAPIView):

    queryset = Certificate.objects

    serializer_class = CertificateSerializer

    renderer_classes = [renderers.MyJSONRenderer]

    permission_classes = [perms_custom.IsJobSeekerUser]

    def get_queryset(self):
        return self.queryset.filter(resume__user=self.request.user)

class LanguageSkillViewSet(viewsets.ViewSet,

                           generics.CreateAPIView,

                           generics.RetrieveUpdateDestroyAPIView):

    queryset = LanguageSkill.objects

    serializer_class = LanguageSkillSerializer

    renderer_classes = [renderers.MyJSONRenderer]

    permission_classes = [perms_custom.IsJobSeekerUser]

    def get_queryset(self):
        return self.queryset.filter(resume__user=self.request.user)

class AdvancedSkillViewSet(viewsets.ViewSet,

                           generics.CreateAPIView,

                           generics.RetrieveUpdateDestroyAPIView):

    queryset = AdvancedSkill.objects

    serializer_class = AdvancedSkillSerializer

    renderer_classes = [renderers.MyJSONRenderer]

    permission_classes = [perms_custom.IsJobSeekerUser]

    def get_queryset(self):
        return self.queryset.filter(resume__user=self.request.user)
