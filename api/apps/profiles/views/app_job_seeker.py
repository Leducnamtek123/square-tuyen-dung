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

        resume_type = query_params.get("resumeType", None)

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
                if not resumes.first():
                    return var_res.response_data()

                serializer = ResumeSerializer(
                    resumes.first(),
                    fields=[
                        "id",
                        "title",
                        "experience",
                        "position",
                        "salaryMin",
                        "salaryMax",
                        "updateAt",
                        "user",
                        "isActive",
                    ],
                )
            else:
                serializer = ResumeSerializer(
                    resumes,
                    many=True,
                    fields=["id", "title", "updateAt", "imageUrl", "fileUrl", "isActive"],
                )

        return var_res.response_data(data=serializer.data)
