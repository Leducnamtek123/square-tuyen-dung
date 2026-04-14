from shared import pagination as paginations
from shared import renderers

from shared.configs import variable_response as var_res

from shared.helpers import helper

from rest_framework import viewsets, generics, views
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import permissions as perms_sys
from rest_framework import status

from apps.accounts import permissions as perms_custom

from ..models import (
    Resume,
    ResumeViewed,
    EducationDetail,
    ExperienceDetail,
    Certificate,
    LanguageSkill,
    AdvancedSkill,
)

from ..serializers import (
    ResumeSerializer,
    ResumePdfViewSerializer,
    ResumeViewedSerializer,
    CvSerializer,
    EducationSerializer,
    ExperienceSerializer,
    CertificateSerializer,
    LanguageSkillSerializer,
    AdvancedSkillSerializer,
)


class PrivateResumeViewSet(
    viewsets.ViewSet, generics.CreateAPIView, generics.UpdateAPIView, generics.DestroyAPIView
):
    queryset = Resume.objects.all()
    serializer_class = ResumeSerializer

    def get_permissions(self):
        if self.action in [
            "get_resume_detail_of_job_seeker",
            "update",
            "partial_update",
            "resume_active",
            "destroy",
            "get_cv_pdf",
            "get_experiences_detail",
            "get_educations_detail",
            "get_certificates_detail",
            "get_language_skills",
            "get_advanced_skills",
        ]:
            return [perms_custom.ResumeOwnerPerms()]
        elif self.action in ["create"]:
            return [perms_custom.IsJobSeekerUser()]

        return [perms_sys.IsAuthenticated()]

    def create(self, request, *args, **kwargs):
        data = request.data.copy()

        serializer = ResumeSerializer(
            data=data,
            fields=[
                "title",
                "description",
                "salaryMin",
                "salaryMax",
                "position",
                "experience",
                "academicLevel",
                "typeOfWorkplace",
                "jobType",
                "city",
                "career",
                "file",
            ],
            context={"request": request},
        )

        if not serializer.is_valid():
            return var_res.response_data(
                status=status.HTTP_400_BAD_REQUEST, errors=serializer.errors
            )

        self.perform_create(serializer)

        return var_res.response_data(
            data=serializer.data, status=status.HTTP_201_CREATED
        )

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)

        instance = self.get_object()

        serializer = self.get_serializer(
            instance,
            data=request.data,
            partial=partial,
            fields=[
                "id",
                "title",
                "description",
                "salaryMin",
                "salaryMax",
                "position",
                "experience",
                "academicLevel",
                "typeOfWorkplace",
                "jobType",
                "isActive",
                "city",
                "career",
                "updateAt",
                "file",
                "imageUrl",
                "fileUrl",
                "user",
                "city",
            ],
        )

        serializer.is_valid(raise_exception=True)

        self.perform_update(serializer)

        if getattr(instance, "_prefetched_objects_cache", None):
            # If 'prefetch_related' has been applied to a queryset, we need to
            # forcibly invalidate the prefetch cache on the instance.
            instance._prefetched_objects_cache = {}

        return var_res.response_data(data=serializer.data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()

        self.perform_destroy(instance)

        return var_res.response_data(status=status.HTTP_200_OK)

    @action(methods=["get"], detail=True, url_path="resume-active", url_name="resume-active")
    def active_resume(self, request, pk):
        resume = self.get_object()

        if resume.is_active:
            resume.is_active = False

            resume.save()

            return var_res.response_data(data={"isActive": False})

        Resume.objects.filter(user=self.request.user).exclude(slug=resume.slug).update(
            is_active=False
        )

        resume.is_active = True

        resume.save()

        return var_res.response_data(data={"isActive": True})

    @action(
        methods=["get"],
        detail=True,
        url_path="resume-owner",
        url_name="get-resume-detail-of-job-seeker",
    )
    def get_resume_detail_of_job_seeker(self, request, pk):
        resume_queryset = self.get_object()

        resume_serializer = ResumeSerializer(
            resume_queryset,
            fields=[
                "id",
                "title",
                "salaryMin",
                "salaryMax",
                "position",
                "experience",
                "academicLevel",
                "typeOfWorkplace",
                "jobType",
                "description",
                "isActive",
                "city",
                "career",
            ],
        )

        return var_res.response_data(data=resume_serializer.data)

    @action(methods=["get"], detail=True, url_path="cv", url_name="get-cv")
    def get_cv(self, request, pk):
        resume_queryset = self.get_object()

        resume_serializer = CvSerializer(
            resume_queryset, fields=["id", "title", "fileUrl", "updateAt"]
        )

        return var_res.response_data(data=resume_serializer.data)

    @get_cv.mapping.put
    def update_cv_file(self, request, pk):
        files = request.FILES

        cv_serializer = CvSerializer(self.get_object(), data=files, fields=["file"])

        if not cv_serializer.is_valid():
            return var_res.response_data(
                status=status.HTTP_400_BAD_REQUEST, errors=cv_serializer.errors
            )

        try:
            cv_serializer.save()

        except Exception as ex:
            helper.print_log_error("update_cv_file", error=ex)

            return var_res.response_data(status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return var_res.response_data()

    @action(methods=["get"], detail=True, url_path="cv-pdf", url_name="get-cv-pdf")
    def get_cv_pdf(self, request, pk):
        resume = self.get_object()

        serializer = ResumePdfViewSerializer(resume)

        return var_res.response_data(status=status.HTTP_200_OK, data=serializer.data)

    @action(
        methods=["get"],
        detail=True,
        url_path="educations-detail",
        url_name="get-educations-detail",
    )
    def get_educations_detail(self, request, pk):
        educations_detail_queryset = self.get_object().education_details

        educations_detail_serializer = EducationSerializer(
            educations_detail_queryset, many=True
        )

        return var_res.response_data(data=educations_detail_serializer.data)

    @action(
        methods=["get"],
        detail=True,
        url_path="experiences-detail",
        url_name="get-experiences-detail",
    )
    def get_experiences_detail(self, request, pk):
        experiences_detail_queryset = self.get_object().experience_details

        experiences_detail_serializer = ExperienceSerializer(
            experiences_detail_queryset, many=True
        )

        return var_res.response_data(data=experiences_detail_serializer.data)

    @action(
        methods=["get"],
        detail=True,
        url_path="certificates-detail",
        url_name="get-certificates-detail",
    )
    def get_certificates_detail(self, request, pk):
        certificates_detail_queryset = self.get_object().certificates

        certificates_detail_serializer = CertificateSerializer(
            certificates_detail_queryset, many=True
        )

        return var_res.response_data(data=certificates_detail_serializer.data)

    @action(
        methods=["get"],
        detail=True,
        url_path="language-skills",
        url_name="get-language-skills",
    )
    def get_language_skills(self, request, pk):
        language_skill_queryset = self.get_object().language_skills

        language_skill_serializer = LanguageSkillSerializer(
            language_skill_queryset, many=True
        )

        return var_res.response_data(data=language_skill_serializer.data)

    @action(
        methods=["get"],
        detail=True,
        url_path="advanced-skills",
        url_name="get-advanced-skills",
    )
    def get_advanced_skills(self, request, pk):
        advanced_skill_queryset = self.get_object().advanced_skills

        advanced_skill_serializer = AdvancedSkillSerializer(
            advanced_skill_queryset, many=True
        )

        return var_res.response_data(data=advanced_skill_serializer.data)


class ResumeViewedAPIView(views.APIView):
    permission_classes = [perms_custom.IsJobSeekerUser]
    renderer_classes = [renderers.MyJSONRenderer]
    pagination_class = paginations.CustomPagination

    def get(self, request):
        user = request.user

        queryset = ResumeViewed.objects.filter(resume__user=user).order_by(
            "-update_at", "-create_at"
        )

        paginator = self.pagination_class()

        page = paginator.paginate_queryset(queryset, request)

        if page is not None:
            serializer = ResumeViewedSerializer(page, many=True)

            return paginator.get_paginated_response(serializer.data)

        serializer = ResumeViewedSerializer(queryset, many=True)

        return var_res.response_data(data=serializer.data)


class EducationDetailViewSet(
    viewsets.ViewSet, generics.CreateAPIView, generics.RetrieveUpdateDestroyAPIView
):
    queryset = EducationDetail.objects
    serializer_class = EducationSerializer
    renderer_classes = [renderers.MyJSONRenderer]
    permission_classes = [perms_custom.IsJobSeekerUser]

    def get_queryset(self):
        return self.queryset.filter(resume__user=self.request.user)


    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()

        self.perform_destroy(instance)

        return var_res.response_data(status=status.HTTP_200_OK)


class ExperienceDetailViewSet(
    viewsets.ViewSet, generics.CreateAPIView, generics.RetrieveUpdateDestroyAPIView
):
    queryset = ExperienceDetail.objects
    serializer_class = ExperienceSerializer
    renderer_classes = [renderers.MyJSONRenderer]
    permission_classes = [perms_custom.IsJobSeekerUser]

    def get_queryset(self):
        return self.queryset.filter(resume__user=self.request.user)


    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()

        self.perform_destroy(instance)

        return var_res.response_data(status=status.HTTP_200_OK)


class CertificateDetailViewSet(
    viewsets.ViewSet, generics.CreateAPIView, generics.RetrieveUpdateDestroyAPIView
):
    queryset = Certificate.objects
    serializer_class = CertificateSerializer
    renderer_classes = [renderers.MyJSONRenderer]
    permission_classes = [perms_custom.IsJobSeekerUser]

    def get_queryset(self):
        return self.queryset.filter(resume__user=self.request.user)


    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()

        self.perform_destroy(instance)

        return var_res.response_data(status=status.HTTP_200_OK)


class LanguageSkillViewSet(
    viewsets.ViewSet, generics.CreateAPIView, generics.RetrieveUpdateDestroyAPIView
):
    queryset = LanguageSkill.objects
    serializer_class = LanguageSkillSerializer
    renderer_classes = [renderers.MyJSONRenderer]
    permission_classes = [perms_custom.IsJobSeekerUser]

    def get_queryset(self):
        return self.queryset.filter(resume__user=self.request.user)


    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()

        self.perform_destroy(instance)

        return var_res.response_data(status=status.HTTP_200_OK)


class AdvancedSkillViewSet(
    viewsets.ViewSet, generics.CreateAPIView, generics.RetrieveUpdateDestroyAPIView
):
    queryset = AdvancedSkill.objects
    serializer_class = AdvancedSkillSerializer
    renderer_classes = [renderers.MyJSONRenderer]
    permission_classes = [perms_custom.IsJobSeekerUser]

    def get_queryset(self):
        return self.queryset.filter(resume__user=self.request.user)


    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()

        self.perform_destroy(instance)

        return var_res.response_data(status=status.HTTP_200_OK)
