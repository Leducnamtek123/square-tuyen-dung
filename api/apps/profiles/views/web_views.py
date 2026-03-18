from shared import pagination as paginations
from shared import renderers

from console.jobs import queue_mail

from shared.helpers import utils

from shared.configs import variable_system as var_sys, table_export

from shared.configs import variable_response as var_res

from shared.configs.messages import NOTIFICATION_MESSAGES, ERROR_MESSAGES

from django.db.models import Count, F, Q, Prefetch

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

    AdvancedSkill, Company,

    CompanyFollowed, CompanyImage,

    CompanyRole, CompanyMember,

    ContactProfile

)

from ..filters import (

    ResumeFilter,

    ResumeSavedFilter,

    CompanyFilter

)

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

    CompanySerializer,

    CompanyFollowedSerializer,

    LogoCompanySerializer,

    CompanyCoverImageSerializer,

    CompanyImageSerializer,

    CompanyRoleSerializer,

    CompanyMemberSerializer,

    SendMailToJobSeekerSerializer

)

from apps.jobs.models import (

    JobPost,
    JobPostActivity

)

from apps.jobs import serializers as job_serializers

from shared.helpers.cloudinary_service import CloudinaryService

def _get_user_company(user):
    try:
        return user.get_active_company()
    except Exception:
        return None

def _get_company_membership(user, company):
    return CompanyMember.objects.select_related("role").filter(
        user=user,
        company=company,
        is_active=True,
        status=CompanyMember.STATUS_ACTIVE,
    ).first()

def _has_company_permission(user, company, permission_key):
    if company.user_id == user.id:
        return True

    membership = _get_company_membership(user, company)
    if not membership or not membership.role:
        return False

    permissions = membership.role.permissions or []
    if "*" in permissions:
        return True
    return permission_key in permissions

class JobSeekerProfileViewSet(viewsets.ViewSet,
                              generics.ListAPIView,
                              generics.RetrieveAPIView):
    queryset = JobSeekerProfile.objects
    serializer_class = JobSeekerProfileSerializer
    permission_classes = [perms_sys.IsAuthenticated]

    def get_permissions(self):
        if self.action in ["get_resumes"]:
            return [perms_custom.IsJobSeekerUser()]
        return self.permission_classes

    @action(methods=["get"], detail=True,

            url_path="resumes", url_name="get-resumes")

    def get_resumes(self, request, pk):

        query_params = request.query_params

        resume_type = query_params.get("resumeType", None)

        job_seeker_profile = self.get_object()

        if not job_seeker_profile:

            raise Exception(

                ERROR_MESSAGES["USER_DOESNT_HAVE_JOB_SEEKER_PROFILE"])

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

class PrivateResumeViewSet(viewsets.ViewSet,

                           generics.CreateAPIView,

                           generics.UpdateAPIView,

                           generics.DestroyAPIView):

    queryset = Resume.objects.all()

    serializer_class = ResumeSerializer

    lookup_field = 'slug'

    def get_permissions(self):

        if self.action in ["get_resume_detail_of_job_seeker",

                           "update", "partial_update",

                           "resume_active",

                           "destroy",

                           "get_experiences_detail",

                           "get_educations_detail",

                           "get_certificates_detail",

                           "get_language_skills",

                           "get_advanced_skills"]:

            return [perms_custom.ResumeOwnerPerms()]

        elif self.action in ["create"]:

            return [perms_custom.IsJobSeekerUser()]

        return [perms_sys.IsAuthenticated()]

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

        return Response(serializer.data)

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

        try:

            cv_serializer.save()

        except Exception as ex:

            helper.print_log_error("update_cv_file", error=ex)

            return var_res.response_data(status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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
        company = getattr(user, 'company', None) if getattr(user, 'is_authenticated', False) else None
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

            company=user.company, resume=self.get_object())

        is_saved = False

        if saved_resumes.exists():

            saved_resume = saved_resumes.first()

            saved_resume.delete()

        else:

            ResumeSaved.objects.create(

                company=request.user.company,

                resume=self.get_object()

            )

            is_saved = True

        # send notification

        company = user.company

        notification_content = NOTIFICATION_MESSAGES[

            'RESUME_SAVED'] if is_saved else NOTIFICATION_MESSAGES['RESUME_UNSAVED']

        helper.add_employer_saved_resume_notifications(

            company.company_name,

            notification_content,

            company.logo.get_full_url(

            ) if company.logo else var_sys.AVATAR_DEFAULT["COMPANY_LOGO"],

            self.get_object().user_id

        )

        return Response(data={

            "isSaved": is_saved

        })

    @action(methods=["post"], detail=True,

            url_path="view-resume", url_name="view-resume")

    def view_resume(self, request, slug):

        user = request.user

        v, _ = ResumeViewed.objects.get_or_create(

            resume=self.get_object(),

            company=user.company

        )

        try:

            v.views = F('views') + 1

            v.save()

            v.refresh_from_db()

            # send notification

            company = user.company

            helper.add_employer_viewed_resume_notifications(

                company.company_name,

                "Đã xem hồ sơ của bạn",

                company.logo.get_full_url(

                ) if company.logo else var_sys.AVATAR_DEFAULT["COMPANY_LOGO"],

                self.get_object().user_id

            )

        except Exception as ex:

            helper.print_log_error("view_resume", ex)

            return var_res.response_data(status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        else:

            return var_res.response_data(status=status.HTTP_200_OK)

    @action(methods=["post"], detail=True,

            url_path="send-email", url_name="send-email")

    def send_email(self, request, slug):

        try:

            data = request.data

            user = request.user

            company = user.company

            serializer = SendMailToJobSeekerSerializer(data=data)

            if not serializer.is_valid():

                return var_res.response_data(status=status.HTTP_400_BAD_REQUEST,

                                             errors=serializer.errors)

            validate_data = serializer.data

            to = [validate_data.get("email")]

            is_send_me = validate_data.pop("isSendMe")

            if is_send_me:

                to.append(user.email)

            email_data = {

                'content': validate_data.get("content"),

                'company_image': company.logo.get_full_url() if company.logo else var_sys.AVATAR_DEFAULT["COMPANY_LOGO"],

                'company_name': company.company_name,

                'company_phone': company.company_phone,

                'company_email': company.company_email,

                'company_address': company.location.address,

                'company_website_url': company.website_url

            }

            queue_mail.send_email_reply_job_seeker_task.delay(

                to=to,

                subject=validate_data.get("title"),

                data=email_data

            )

            # save contact profile

            ContactProfile.objects.create(

                company=company, resume=self.get_object())

        except Exception as ex:

            helper.print_log_error("send_email", ex)

            return var_res.response_data(status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        else:

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

        ).order_by('-update_at', '-create_at')

        paginator = self.pagination_class()

        page = paginator.paginate_queryset(queryset, request)

        if page is not None:

            serializer = ResumeViewedSerializer(page, many=True)

            return paginator.get_paginated_response(serializer.data)

        serializer = ResumeViewedSerializer(queryset, many=True)

        return Response(data=serializer.data)

class ResumeSavedViewSet(viewsets.ViewSet,

                         generics.ListAPIView):

    queryset = ResumeSaved.objects

    permission_classes = [perms_custom.IsEmployerUser]

    renderer_classes = [renderers.MyJSONRenderer]

    pagination_class = paginations.CustomPagination

    serializer_class = ResumeSavedSerializer

    filterset_class = ResumeSavedFilter

    filter_backends = [DjangoFilterBackend]

    def list(self, request, *args, **kwargs):

        # danh sach ho so da luu cua nha tuyen dung

        user = request.user

        queryset = self.filter_queryset(self.get_queryset()

                                        .filter(company=user.company, resume__is_active=True)

                                        .order_by("-create_at"))

        paginator = self.pagination_class()

        page = paginator.paginate_queryset(queryset, request)

        if page is not None:

            serializer = ResumeSavedSerializer(page, many=True, fields=[

                "id", "resume", "createAt"

            ])

            return paginator.get_paginated_response(serializer.data)

        serializer = ResumeSavedSerializer(queryset, many=True)

        return Response(data=serializer.data)

    @action(methods=["get"], detail=False,

            url_path="export", url_name="resumes-export")

    def export_resumes(self, request):

        user = request.user

        queryset = self.filter_queryset(self.get_queryset()

                                        .filter(company=user.company,

                                                resume__is_active=True)

                                        .order_by("-create_at"))

        serializer = ResumeSavedExportSerializer(queryset, many=True)

        result_data = utils.convert_data_with_en_key_to_vn_kew(serializer.data,

                                                               table_export.RESUMES_EXPORT_FIELD)

        return Response(data=result_data)

class EducationDetailViewSet(viewsets.ViewSet,

                             generics.CreateAPIView,

                             generics.RetrieveUpdateDestroyAPIView):

    queryset = EducationDetail.objects

    serializer_class = EducationSerializer

    renderer_classes = [renderers.MyJSONRenderer]

class ExperienceDetailViewSet(viewsets.ViewSet,

                              generics.CreateAPIView,

                              generics.RetrieveUpdateDestroyAPIView):

    queryset = ExperienceDetail.objects

    serializer_class = ExperienceSerializer

    renderer_classes = [renderers.MyJSONRenderer]

class CertificateDetailViewSet(viewsets.ViewSet,

                               generics.CreateAPIView,

                               generics.RetrieveUpdateDestroyAPIView):

    queryset = Certificate.objects

    serializer_class = CertificateSerializer

    renderer_classes = [renderers.MyJSONRenderer]

class LanguageSkillViewSet(viewsets.ViewSet,

                           generics.CreateAPIView,

                           generics.RetrieveUpdateDestroyAPIView):

    queryset = LanguageSkill.objects

    serializer_class = LanguageSkillSerializer

    renderer_classes = [renderers.MyJSONRenderer]

class AdvancedSkillViewSet(viewsets.ViewSet,

                           generics.CreateAPIView,

                           generics.RetrieveUpdateDestroyAPIView):

    queryset = AdvancedSkill.objects

    serializer_class = AdvancedSkillSerializer

    renderer_classes = [renderers.MyJSONRenderer]

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

        company_image_url_serializer = LogoCompanySerializer(

            request.user.company, data=files)

        if not company_image_url_serializer.is_valid():

            return Response(status=status.HTTP_400_BAD_REQUEST)

        try:

            company_image_url_serializer.save()

        except Exception as ex:

            helper.print_log_error("update_company_image_url", ex)

            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        else:

            return Response(status=status.HTTP_200_OK, data=company_image_url_serializer.data)

    @action(methods=["put"], detail=False,

            url_path="company-cover-image-url", url_name="company-cover-image-url")

    def update_company_cover_image_url(self, request):

        files = request.FILES

        company_cover_image_url_serializer = CompanyCoverImageSerializer(

            request.user.company, data=files)

        if not company_cover_image_url_serializer.is_valid():

            return Response(status=status.HTTP_400_BAD_REQUEST)

        try:

            company_cover_image_url_serializer.save()

        except Exception as ex:

            helper.print_log_error("update_company_cover_image_url", ex)

            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        else:

            return Response(status=status.HTTP_200_OK, data=company_cover_image_url_serializer.data)

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
        queryset = self.filter_queryset(self.get_queryset())
        queryset = queryset.annotate(
            follow_count=Count('companyfollowed_set', distinct=True),
            active_job_post_count=Count(
                'job_posts',
                filter=Q(
                    job_posts__deadline__gte=timezone.now().date(),
                    job_posts__status=var_sys.JOB_POST_STATUS[2][0]
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

            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)

        return var_res.response_data(data=serializer.data)

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

        return Response(data=serializer.data)

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

            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(data=serializer.data)

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

        return Response(data={

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

        return Response(data=serializer.data)

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

            queryset = queryset.filter(company=self.request.user.company) \
                .order_by('update_at', 'create_at')

        return queryset

    def create(self, request, *args, **kwargs):

        files = request.FILES

        serializer = self.get_serializer(data=files)

        serializer.is_valid(raise_exception=True)

        results = serializer.save()

        return Response(results, status=status.HTTP_201_CREATED)

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

            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        else:

            return Response(status=status.HTTP_204_NO_CONTENT)

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

class AdminCompanyViewSet(viewsets.ModelViewSet):

    queryset = Company.objects.all().order_by('id')

    serializer_class = CompanySerializer

    permission_classes = [perms_custom.IsAdminUser]

class AdminJobSeekerProfileViewSet(viewsets.ModelViewSet):

    queryset = JobSeekerProfile.objects.all().order_by('id')

    serializer_class = JobSeekerProfileSerializer

    permission_classes = [perms_custom.IsAdminUser]

class AdminResumeViewSet(viewsets.ModelViewSet):

    queryset = Resume.objects.all().order_by('id')

    serializer_class = ResumeSerializer

    permission_classes = [perms_custom.IsAdminUser]

    lookup_field = 'id'
