from shared.configs import variable_system as var_sys
from shared.configs import variable_response as var_res

from rest_framework import status, viewsets, generics
from rest_framework.decorators import action
from rest_framework import permissions as perms_sys

from apps.accounts import permissions as perms_custom
from apps.locations.models import Location
from shared.helpers import helper

from ..models import JobSeekerProfile, Resume, AdvancedSkill
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
                resume_obj = resumes.filter(type=var_sys.CV_WEBSITE).first()
                if not resume_obj:
                    donor_resume = job_seeker_profile.resumes.order_by('-update_at').first()
                    if donor_resume:
                        donor_resume.type = var_sys.CV_WEBSITE
                        donor_resume.save(update_fields=['type', 'update_at'])
                        resume_obj = donor_resume
                    else:
                        user_label = getattr(job_seeker_profile.user, 'full_name', None) or getattr(job_seeker_profile.user, 'email', '')
                        resume_obj = Resume.objects.create(
                            user=job_seeker_profile.user,
                            job_seeker_profile=job_seeker_profile,
                            type=var_sys.CV_WEBSITE,
                            title=f"Hồ sơ trực tuyến của {user_label}".strip()
                        )
                else:
                    donor_resume = job_seeker_profile.resumes.exclude(id=resume_obj.id).order_by('-update_at').first()
                    if donor_resume:
                        needs_repair = (
                            not resume_obj.career_id or
                            not resume_obj.city_id or
                            (resume_obj.title and resume_obj.title.startswith("Hồ sơ trực tuyến của")) or
                            resume_obj.advanced_skills.count() < donor_resume.advanced_skills.count()
                        )
                        if needs_repair:
                            if not resume_obj.career_id and donor_resume.career_id:
                                resume_obj.career = donor_resume.career
                            if not resume_obj.city_id and donor_resume.city_id:
                                resume_obj.city = donor_resume.city
                            if (resume_obj.title and resume_obj.title.startswith("Hồ sơ trực tuyến của")) and donor_resume.title:
                                resume_obj.title = donor_resume.title
                            if (not resume_obj.experience or resume_obj.experience == 1) and donor_resume.experience:
                                resume_obj.experience = donor_resume.experience
                            if (not resume_obj.academic_level or resume_obj.academic_level == 1) and donor_resume.academic_level:
                                resume_obj.academic_level = donor_resume.academic_level
                            if not resume_obj.type_of_workplace and donor_resume.type_of_workplace:
                                resume_obj.type_of_workplace = donor_resume.type_of_workplace
                            if not resume_obj.salary_min and donor_resume.salary_min:
                                resume_obj.salary_min = donor_resume.salary_min
                            if not resume_obj.salary_max and donor_resume.salary_max:
                                resume_obj.salary_max = donor_resume.salary_max
                            if not resume_obj.expected_salary and donor_resume.expected_salary:
                                resume_obj.expected_salary = donor_resume.expected_salary
                            if donor_resume.skills_summary and (not resume_obj.skills_summary or resume_obj.skills_summary != donor_resume.skills_summary):
                                resume_obj.skills_summary = donor_resume.skills_summary
                            if donor_resume.file and not resume_obj.file:
                                f = donor_resume.file
                                donor_resume.file = None
                                donor_resume.save(update_fields=['file'])
                                resume_obj.file = f

                            donor_skills = list(donor_resume.advanced_skills.all())
                            if len(donor_skills) > resume_obj.advanced_skills.count():
                                for s in donor_skills:
                                    AdvancedSkill.objects.get_or_create(resume=resume_obj, name=s.name, defaults={'level': s.level})

                            resume_obj.save()
                            if donor_resume.is_active:
                                donor_resume.is_active = False
                                donor_resume.save(update_fields=['is_active'])

                # Bidirectional profile synchronization
                if resume_obj:
                    try:
                        if resume_obj.city_id and (not job_seeker_profile.location or not job_seeker_profile.location.city_id):
                            if not job_seeker_profile.location:
                                job_seeker_profile.location = Location.objects.create(city=resume_obj.city)
                                job_seeker_profile.save(update_fields=['location'])
                            else:
                                job_seeker_profile.location.city = resume_obj.city
                                job_seeker_profile.location.save(update_fields=['city'])

                        if not job_seeker_profile.phone and job_seeker_profile.user.phone_number:
                            job_seeker_profile.phone = job_seeker_profile.user.phone_number
                            job_seeker_profile.save(update_fields=['phone'])
                        elif not job_seeker_profile.user.phone_number and job_seeker_profile.phone:
                            job_seeker_profile.user.phone_number = job_seeker_profile.phone
                            job_seeker_profile.user.save(update_fields=['phone_number'])
                    except Exception as sync_err:
                        helper.print_log_error("app_get_resumes_sync_profile", sync_err)


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
                        "file",
                        "fileUrl",
                        "fileDict",
                        "imageUrl",
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
