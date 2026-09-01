from shared.configs import variable_system as var_sys
from shared.configs import variable_response as var_res

from rest_framework import status, viewsets, generics
from rest_framework.decorators import action
from rest_framework import permissions as perms_sys

from apps.accounts import permissions as perms_custom

from ..models import JobSeekerProfile
from ..serializers import JobSeekerProfileSerializer, ResumeSerializer


class JobSeekerProfileViewSet(
    viewsets.ViewSet, generics.ListAPIView, generics.RetrieveAPIView
):
    queryset = JobSeekerProfile.objects
    serializer_class = JobSeekerProfileSerializer
    permission_classes = [perms_sys.IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)

    def get_permissions(self):
        if self.action in ["get_resumes"]:
            return [perms_custom.IsJobSeekerUser()]
        return [perm() for perm in self.permission_classes]

    @action(methods=["get"], detail=True, url_path="resumes", url_name="get-resumes")
    def get_resumes(self, request, pk):
        query_params = request.query_params

        raw_type = query_params.get("resumeType", None) or query_params.get("type", None)
        resume_type = None
        if raw_type is not None:
            if str(raw_type).upper() == "WEBSITE" or str(raw_type) == "1":
                resume_type = var_sys.CV_WEBSITE
            elif str(raw_type).upper() == "UPLOAD" or str(raw_type) == "2":
                resume_type = var_sys.CV_UPLOAD
            else:
                resume_type = raw_type

        job_seeker_profile = JobSeekerProfile.objects.filter(pk=pk, user=request.user).first()

        if not job_seeker_profile:
            return var_res.response_data(
                status=status.HTTP_404_NOT_FOUND,
                errors={"errorMessage": ["Không tìm thấy hồ sơ ứng viên của bạn."]},
            )

        resumes = job_seeker_profile.resumes.select_related(
            "user", "job_seeker_profile", "file"
        ).prefetch_related(
            "experience_details",
            "education_details",
            "certificates",
            "language_skills",
            "advanced_skills",
        )

        # get all
        if resume_type is None:
            serializer = ResumeSerializer(resumes, many=True, fields=["id", "title", "type"])
        else:
            # get by type
            if not (resume_type == var_sys.CV_WEBSITE) and not (
                resume_type == var_sys.CV_UPLOAD
            ):
                return var_res.response_data(
                    status=status.HTTP_400_BAD_REQUEST,
                    errors={"detail": "resumeType is invalid."},
                )

            resumes = resumes.filter(type=resume_type)

            if resume_type == var_sys.CV_WEBSITE:
                resume_obj = resumes.first()
                if not resume_obj:
                    user_label = getattr(job_seeker_profile.user, 'full_name', None) or getattr(job_seeker_profile.user, 'email', '')
                    resume_obj = Resume.objects.create(
                        user=job_seeker_profile.user,
                        job_seeker_profile=job_seeker_profile,
                        type=var_sys.CV_WEBSITE,
                        title=f"Hồ sơ trực tuyến của {user_label}".strip()
                    )

                serializer = ResumeSerializer(
                    resume_obj,
                    fields=[
                        "id",
                        "slug",
                        "title",
                        "description",
                        "career",
                        "city",
                        "academicLevel",
                        "experience",
                        "position",
                        "salaryMin",
                        "salaryMax",
                        "expectedSalary",
                        "skillsSummary",
                        "updateAt",
                        "user",
                        "isActive",
                        "positionChooseData",
                        "experienceChooseData",
                        "academicLevelChooseData",
                        "typeOfWorkplaceChooseData",
                        "jobTypeChooseData",
                        "careerChooseData",
                        "cityChooseData",
                        "experienceDetails",
                        "educationDetails",
                        "certificateDetails",
                        "languageSkills",
                        "advancedSkills",
                    ],
                )
            else:
                serializer = ResumeSerializer(
                    resumes,
                    many=True,
                    fields=["id", "title", "updateAt", "imageUrl", "fileUrl", "isActive"],
                )

        return var_res.response_data(data=serializer.data)
