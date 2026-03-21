"""
Resume-related serializers for the profiles app.
Extracted from the monolithic serializers.py.
"""
from django.conf import settings
from django.db import transaction
from rest_framework import serializers

from shared.configs import variable_system as var_sys
from shared.configs.messages import ERROR_MESSAGES
from shared.helpers.cloudinary_service import CloudinaryService

from ..models import (
    Resume, ResumeViewed, ResumeSaved,
    EducationDetail, ExperienceDetail,
    Certificate, LanguageSkill, AdvancedSkill,
)
from apps.files.models import File
from apps.jobs.models import JobPostActivity
from apps.accounts import serializers as auth_serializers

# Import from sibling submodules
from .profile_serializers import JobSeekerProfileSerializer
from .company_serializers import CompanySerializer


class CvSerializer(serializers.ModelSerializer):
    title = serializers.CharField(required=True, max_length=200)
    fileUrl = serializers.SerializerMethodField(
        method_name="get_cv_file_url", read_only=True)
    file = serializers.FileField(required=True, write_only=True)
    updateAt = serializers.DateTimeField(source='update_at', read_only=True)

    def __init__(self, *args, **kwargs):
        fields = kwargs.pop('fields', None)
        super().__init__(*args, **kwargs)
        if fields is not None:
            allowed = set(fields)
            existing = set(self.fields)
            for field_name in existing - allowed:
                self.fields.pop(field_name)

    class Meta:
        model = Resume
        fields = ("id", "slug", "title", "fileUrl", "file", "updateAt")

    def get_cv_file_url(self, resume):
        cv_file = resume.file
        if cv_file:
            return cv_file.get_full_url()
        return None

    def update(self, instance, validated_data):
        pdf_file = validated_data.pop('file')
        public_id = None

        if instance.file:
            path_list = instance.file.public_id.split('/')
            public_id = path_list[-1] if path_list else None

        pdf_upload_result = CloudinaryService.upload_file(
            pdf_file,
            settings.CLOUDINARY_DIRECTORY["cv"],
            public_id=public_id
        )

        instance.file = File.update_or_create_file_with_cloudinary(
            instance.file,
            pdf_upload_result,
            File.CV_TYPE
        )
        instance.save()
        return instance


class ResumeSerializer(serializers.ModelSerializer):
    title = serializers.CharField(required=True, max_length=200)
    description = serializers.CharField(
        required=False, allow_null=True, allow_blank=True)
    salaryMin = serializers.IntegerField(source="salary_min", required=True)
    salaryMax = serializers.IntegerField(source="salary_max", required=True)
    expectedSalary = serializers.IntegerField(source="expected_salary", required=False, allow_null=True)
    skillsSummary = serializers.CharField(source="skills_summary", required=False, allow_null=True, allow_blank=True)
    position = serializers.IntegerField(required=True)
    positionChooseData = serializers.SerializerMethodField(
        method_name="get_position_data", read_only=True)
    experience = serializers.IntegerField(required=True)
    experienceChooseData = serializers.SerializerMethodField(
        method_name="get_experience_data", read_only=True)
    academicLevel = serializers.IntegerField(source="academic_level", required=True)
    academicLevelChooseData = serializers.SerializerMethodField(
        method_name="get_academic_level_data", read_only=True)
    typeOfWorkplace = serializers.IntegerField(source="type_of_workplace", required=True)
    typeOfWorkplaceChooseData = serializers.SerializerMethodField(
        method_name="get_type_of_workplace_data", read_only=True)
    jobType = serializers.IntegerField(source="job_type", required=True)
    jobTypeChooseData = serializers.SerializerMethodField(
        method_name="get_job_type_data", read_only=True)
    isActive = serializers.BooleanField(source="is_active", default=False)
    updateAt = serializers.DateTimeField(source="update_at", read_only=True)
    imageUrl = serializers.SerializerMethodField(
        method_name="get_cv_image_url", read_only=True)
    fileUrl = serializers.SerializerMethodField(
        method_name="get_cv_file_url", read_only=True)
    file = serializers.FileField(required=True, write_only=True)
    user = auth_serializers.UserSerializer(
        fields=["id", "fullName", "avatarUrl"], read_only=True)
    isSaved = serializers.SerializerMethodField(
        method_name='check_saved', read_only=True)
    viewEmployerNumber = serializers.SerializerMethodField(
        method_name="get_view_number", read_only=True)
    userDict = auth_serializers.UserSerializer(
        source='user', fields=["id", "fullName"], read_only=True)
    jobSeekerProfileDict = JobSeekerProfileSerializer(source="job_seeker_profile",
                                                      fields=["id", "old"],
                                                      read_only=True)
    lastViewedDate = serializers.SerializerMethodField(
        method_name='get_last_viewed_date', read_only=True)
    type = serializers.CharField(required=False, read_only=True)
    experienceDetails = serializers.SerializerMethodField(
        method_name="get_experience_details", read_only=True)
    educationDetails = serializers.SerializerMethodField(
        method_name="get_education_details", read_only=True)
    certificateDetails = serializers.SerializerMethodField(
        method_name="get_certificate_details", read_only=True)
    languageSkills = serializers.SerializerMethodField(
        method_name="get_language_skills", read_only=True)
    advancedSkills = serializers.SerializerMethodField(
        method_name="get_advanced_skills", read_only=True)

    def __init__(self, *args, **kwargs):
        fields = kwargs.pop('fields', None)
        super().__init__(*args, **kwargs)
        if fields is not None:
            allowed = set(fields)
            existing = set(self.fields)
            for field_name in existing - allowed:
                self.fields.pop(field_name)

    def get_fields(self, *args, **kwargs):
        fields = super(ResumeSerializer, self).get_fields(*args, **kwargs)
        request = self.context.get('request', None)
        if request and getattr(request, 'method', None) in ["PUT"]:
            fields['file'].required = False
        return fields

    def get_view_number(self, resume):
        if hasattr(resume, "_prefetched_objects_cache") and "resumesaved_set" in resume._prefetched_objects_cache:
            return len(resume.resumesaved_set.all())
        return resume.resumesaved_set.count()

    def check_saved(self, resume):
        request = self.context.get('request', None)
        if request is None:
            return None
        user = request.user
        if user.is_authenticated and user.role_name == var_sys.EMPLOYER:
            if hasattr(resume, "_prefetched_objects_cache") and "resumesaved_set" in resume._prefetched_objects_cache:
                return len(resume.resumesaved_set.all()) > 0
            return resume.resumesaved_set.filter(company=user.company).exists()
        return None

    def get_last_viewed_date(self, resume):
        request = self.context.get('request', None)
        if request is None:
            return None
        company = getattr(request.user, 'company', None)
        if not company:
            return None
        if hasattr(resume, "_prefetched_objects_cache") and "resumeviewed_set" in resume._prefetched_objects_cache:
            viewed_items = list(resume.resumeviewed_set.all())
            return viewed_items[0].update_at if viewed_items else None
        resume_viewed = ResumeViewed.objects.filter(company=company, resume=resume).first()
        if not resume_viewed:
            return None
        return resume_viewed.update_at

    def get_cv_image_url(self, resume):
        cv_file = resume.file
        if cv_file:
            return cv_file.get_full_url().replace(f".{cv_file.format}", ".jpg")
        return None

    def get_cv_file_url(self, resume):
        cv_file = resume.file
        if cv_file:
            return cv_file.get_full_url()
        return None

    def get_position_data(self, resume):
        if resume.position is not None:
            return {'id': resume.position, 'name': resume.get_position_display()}
        return None

    def get_experience_data(self, resume):
        if resume.experience is not None:
            return {'id': resume.experience, 'name': resume.get_experience_display()}
        return None

    def get_academic_level_data(self, resume):
        if resume.academic_level is not None:
            return {'id': resume.academic_level, 'name': resume.get_academic_level_display()}
        return None

    def get_type_of_workplace_data(self, resume):
        if resume.type_of_workplace is not None:
            return {'id': resume.type_of_workplace, 'name': resume.get_type_of_workplace_display()}
        return None

    def get_job_type_data(self, resume):
        if resume.job_type is not None:
            return {'id': resume.job_type, 'name': resume.get_job_type_display()}
        return None

    def get_experience_details(self, resume):
        experiences = []
        for exp in resume.experience_details.all():
            experiences.append({
                'id': exp.id, 'jobName': exp.job_name, 'companyName': exp.company_name,
                'startDate': exp.start_date.isoformat() if exp.start_date else None,
                'endDate': exp.end_date.isoformat() if exp.end_date else None,
                'description': exp.description, 'lastSalary': exp.last_salary,
                'leaveReason': exp.leave_reason
            })
        return experiences

    def get_education_details(self, resume):
        educations = []
        for edu in resume.education_details.all():
            educations.append({
                'id': edu.id, 'degreeName': edu.degree_name, 'major': edu.major,
                'trainingPlaceName': edu.training_place_name,
                'startDate': edu.start_date.isoformat() if edu.start_date else None,
                'completedDate': edu.completed_date.isoformat() if edu.completed_date else None,
                'description': edu.description, 'gradeOrRank': edu.grade_or_rank
            })
        return educations

    def get_certificate_details(self, resume):
        certificates = []
        for cert in resume.certificates.all():
            certificates.append({
                'id': cert.id, 'name': cert.name, 'trainingPlace': cert.training_place,
                'startDate': cert.start_date.isoformat() if cert.start_date else None,
                'expirationDate': cert.expiration_date.isoformat() if cert.expiration_date else None
            })
        return certificates

    def get_language_skills(self, resume):
        languages = []
        for lang in resume.language_skills.all():
            languages.append({
                'id': lang.id,
                'language': lang.get_language_display() if lang.language else None,
                'level': lang.level
            })
        return languages

    def get_advanced_skills(self, resume):
        skills = []
        for skill in resume.advanced_skills.all():
            skills.append({'id': skill.id, 'name': skill.name, 'level': skill.level})
        return skills

    class Meta:
        model = Resume
        fields = ("id", "slug", "title", "description",
                  "salaryMin", "salaryMax", "expectedSalary", "skillsSummary",
                  "position", "experience", "academicLevel",
                  "typeOfWorkplace", "jobType", "isActive",
                  "career", "updateAt", "file",
                  "imageUrl", "fileUrl", "user", "city", 'isSaved',
                  "viewEmployerNumber", "lastViewedDate",
                  "userDict", "jobSeekerProfileDict",
                  "type", "positionChooseData", "experienceChooseData", "academicLevelChooseData",
                  "typeOfWorkplaceChooseData", "jobTypeChooseData",
                  "experienceDetails", "educationDetails", "certificateDetails",
                  "languageSkills", "advancedSkills")

    def create(self, validated_data):
        with transaction.atomic():
            request = self.context['request']
            user = request.user
            job_seeker_profile = user.job_seeker_profile
            pdf_file = validated_data.pop('file')

            resume = Resume.objects.create(**validated_data,
                                           user=user,
                                           job_seeker_profile=job_seeker_profile)

            pdf_upload_result = CloudinaryService.upload_file(
                pdf_file, settings.CLOUDINARY_DIRECTORY["cv"])

            resume.file = File.update_or_create_file_with_cloudinary(
                resume.file, pdf_upload_result, File.CV_TYPE)
            resume.save()
            return resume


class ExperiencePdfSerializer(serializers.ModelSerializer):
    jobName = serializers.CharField(source='job_name', read_only=True)
    companyName = serializers.CharField(source='company_name', read_only=True)
    startDate = serializers.DateField(source='start_date', read_only=True)
    endDate = serializers.DateField(source='end_date', read_only=True)
    description = serializers.CharField(read_only=True)
    lastSalary = serializers.IntegerField(source='last_salary', read_only=True)
    leaveReason = serializers.CharField(source='leave_reason', read_only=True)

    class Meta:
        model = ExperienceDetail
        fields = ('id', 'jobName', 'companyName', 'startDate', 'endDate',
                  'description', 'lastSalary', 'leaveReason')


class EducationPdfSerializer(serializers.ModelSerializer):
    degreeName = serializers.CharField(source='degree_name', read_only=True)
    major = serializers.CharField(read_only=True)
    trainingPlaceName = serializers.CharField(source='training_place_name', read_only=True)
    startDate = serializers.DateField(source='start_date', read_only=True)
    completedDate = serializers.DateField(source='completed_date', read_only=True)
    description = serializers.CharField(read_only=True)
    gradeOrRank = serializers.CharField(source='grade_or_rank', read_only=True)

    class Meta:
        model = EducationDetail
        fields = ('id', 'degreeName', 'major', 'trainingPlaceName',
                  'startDate', 'completedDate', 'description', 'gradeOrRank')


class CertificatePdfSerializer(serializers.ModelSerializer):
    name = serializers.CharField(read_only=True)
    trainingPlace = serializers.CharField(source='training_place', read_only=True)
    startDate = serializers.DateField(source='start_date', read_only=True)
    expirationDate = serializers.DateField(read_only=True)

    class Meta:
        model = Certificate
        fields = ('id', 'name', 'trainingPlace', 'startDate', 'expirationDate')


class LanguageSkillPdfSerializer(serializers.ModelSerializer):
    language = serializers.IntegerField(read_only=True)
    level = serializers.IntegerField(read_only=True)

    class Meta:
        model = LanguageSkill
        fields = ('id', 'language', 'level')


class AdvancedSkillPdfSerializer(serializers.ModelSerializer):
    name = serializers.CharField(read_only=True)
    level = serializers.IntegerField(read_only=True)

    class Meta:
        model = AdvancedSkill
        fields = ('id', 'name', 'level')


class ResumePdfViewSerializer(serializers.ModelSerializer):
    title = serializers.CharField(read_only=True)
    description = serializers.CharField(read_only=True)
    salaryMin = serializers.IntegerField(source="salary_min", read_only=True)
    salaryMax = serializers.IntegerField(source="salary_max", read_only=True)
    expectedSalary = serializers.IntegerField(source="expected_salary", read_only=True)
    skillsSummary = serializers.CharField(source="skills_summary", read_only=True)
    experience = serializers.IntegerField(read_only=True)
    academicLevel = serializers.IntegerField(source="academic_level", read_only=True)
    typeOfWorkplace = serializers.IntegerField(source="type_of_workplace", read_only=True)
    jobType = serializers.IntegerField(source="job_type", read_only=True)
    user = auth_serializers.UserSerializer(read_only=True, fields=["fullName", "avatarUrl", "email"])
    jobSeekerProfile = JobSeekerProfileSerializer(source='job_seeker_profile', read_only=True,
                                                  fields=["phone", "birthday"])
    experienceDetails = ExperiencePdfSerializer(source='experience_details', read_only=True, many=True)
    educationDetails = EducationPdfSerializer(source='education_details', read_only=True, many=True)
    certificates = CertificatePdfSerializer(read_only=True, many=True)
    languageSkills = LanguageSkillPdfSerializer(source='language_skills', read_only=True, many=True)
    advancedSkills = AdvancedSkillPdfSerializer(source='advanced_skills', read_only=True, many=True)

    class Meta:
        model = Resume
        fields = ("title", "description", "salaryMin", "salaryMax", "expectedSalary", "skillsSummary",
                  "position", "experience", "academicLevel", "typeOfWorkplace", "jobType",
                  "career", "user", "city", "user", "jobSeekerProfile",
                  "experienceDetails", "educationDetails", "certificates",
                  "languageSkills", "advancedSkills")


class ResumeViewedSerializer(serializers.ModelSerializer):
    resume = ResumeSerializer(fields=["id", "title"])
    company = CompanySerializer(fields=['id', 'slug', 'companyName', 'companyImageUrl'])
    createAt = serializers.DateTimeField(source='create_at', read_only=True)
    isSavedResume = serializers.SerializerMethodField(method_name="check_employer_save_my_resume")

    def check_employer_save_my_resume(self, resume_viewed):
        return ResumeSaved.objects.filter(
            resume=resume_viewed.resume, company=resume_viewed.company
        ).exists()

    class Meta:
        model = ResumeViewed
        fields = ('id', 'views', 'createAt', 'resume', 'company', 'isSavedResume')


class ResumeSavedSerializer(serializers.ModelSerializer):
    resume = ResumeSerializer(fields=[
        "id", "slug", "title", "salaryMin", "salaryMax",
        "experience", "city", "userDict", "jobSeekerProfileDict", "type"
    ])
    createAt = serializers.DateTimeField(source='create_at', read_only=True)
    updateAt = serializers.DateTimeField(source='update_at', read_only=True)

    def __init__(self, *args, **kwargs):
        fields = kwargs.pop('fields', None)
        super().__init__(*args, **kwargs)
        if fields is not None:
            allowed = set(fields)
            existing = set(self.fields)
            for field_name in existing - allowed:
                self.fields.pop(field_name)

    class Meta:
        model = ResumeSaved
        fields = ("id", "resume", "createAt", "updateAt")


class ResumeSavedExportSerializer(serializers.ModelSerializer):
    title = serializers.PrimaryKeyRelatedField(source="resume.title", read_only=True)
    fullName = serializers.PrimaryKeyRelatedField(source="resume.user.full_name", read_only=True)
    email = serializers.PrimaryKeyRelatedField(source="resume.user.email", read_only=True)
    phone = serializers.PrimaryKeyRelatedField(source="resume.job_seeker_profile.phone", read_only=True)
    gender = serializers.PrimaryKeyRelatedField(source="resume.job_seeker_profile.gender", read_only=True)
    birthday = serializers.PrimaryKeyRelatedField(source="resume.job_seeker_profile.birthday", read_only=True)
    address = serializers.PrimaryKeyRelatedField(source="resume.job_seeker_profile.location.city.name", read_only=True)
    createAt = serializers.DateTimeField(source='create_at', read_only=True)

    def __init__(self, *args, **kwargs):
        fields = kwargs.pop('fields', None)
        super().__init__(*args, **kwargs)
        if fields is not None:
            allowed = set(fields)
            existing = set(self.fields)
            for field_name in existing - allowed:
                self.fields.pop(field_name)

    class Meta:
        model = ResumeSaved
        fields = ("title", "fullName", "email", "phone",
                  "gender", "birthday", "address", "createAt")


class EducationSerializer(serializers.ModelSerializer):
    degreeName = serializers.CharField(source='degree_name', required=True, max_length=200)
    major = serializers.CharField(required=True, max_length=255)
    trainingPlaceName = serializers.CharField(source='training_place_name', required=True, max_length=255)
    startDate = serializers.DateField(source='start_date', required=True,
                                      input_formats=[var_sys.DATE_TIME_FORMAT["ISO8601"],
                                                     var_sys.DATE_TIME_FORMAT["Ymd"]])
    completedDate = serializers.DateField(source='completed_date', required=False, allow_null=True,
                                          input_formats=[var_sys.DATE_TIME_FORMAT["ISO8601"],
                                                         var_sys.DATE_TIME_FORMAT["Ymd"]])
    description = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    gradeOrRank = serializers.CharField(source='grade_or_rank', required=False,
                                        allow_blank=True, allow_null=True, max_length=100)
    resume = serializers.SlugRelatedField(required=False, slug_field="slug", queryset=Resume.objects.all())
    resumeId = serializers.PrimaryKeyRelatedField(source='resume', queryset=Resume.objects.all(), required=False)

    def __init__(self, *args, **kwargs):
        fields = kwargs.pop('fields', None)
        super().__init__(*args, **kwargs)
        if fields is not None:
            allowed = set(fields)
            existing = set(self.fields)
            for field_name in existing - allowed:
                self.fields.pop(field_name)

    def validate(self, attrs):
        if EducationDetail.objects.count() >= 10:
            raise serializers.ValidationError(
                {'errorMessage': ERROR_MESSAGES["MAXIMUM_EDUCATION"]})
        return attrs

    class Meta:
        model = EducationDetail
        fields = ('id', 'degreeName', 'major', 'trainingPlaceName',
                  'startDate', 'completedDate', 'description', 'gradeOrRank', 'resume', 'resumeId')


class ExperienceSerializer(serializers.ModelSerializer):
    jobName = serializers.CharField(source='job_name', required=True, max_length=200)
    companyName = serializers.CharField(source='company_name', required=True, max_length=255)
    startDate = serializers.DateField(source='start_date', required=True,
                                      input_formats=[var_sys.DATE_TIME_FORMAT["ISO8601"],
                                                     var_sys.DATE_TIME_FORMAT["Ymd"]])
    endDate = serializers.DateField(source='end_date', required=True,
                                    input_formats=[var_sys.DATE_TIME_FORMAT["ISO8601"],
                                                   var_sys.DATE_TIME_FORMAT["Ymd"]])
    description = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    lastSalary = serializers.IntegerField(source='last_salary', required=False, allow_null=True)
    leaveReason = serializers.CharField(source='leave_reason', required=False,
                                        allow_blank=True, allow_null=True, max_length=255)
    resume = serializers.SlugRelatedField(required=False, slug_field="slug", queryset=Resume.objects.all())
    resumeId = serializers.PrimaryKeyRelatedField(source='resume', queryset=Resume.objects.all(), required=False)

    def __init__(self, *args, **kwargs):
        fields = kwargs.pop('fields', None)
        super().__init__(*args, **kwargs)
        if fields is not None:
            allowed = set(fields)
            existing = set(self.fields)
            for field_name in existing - allowed:
                self.fields.pop(field_name)

    def validate(self, attrs):
        if ExperienceDetail.objects.count() >= 10:
            raise serializers.ValidationError(
                {'errorMessage': ERROR_MESSAGES["MAXIMUM_EXPERIENCE"]})
        return attrs

    class Meta:
        model = ExperienceDetail
        fields = ('id', 'jobName', 'companyName', 'startDate', 'endDate',
                  'description', 'lastSalary', 'leaveReason', 'resume', 'resumeId')


class CertificateSerializer(serializers.ModelSerializer):
    name = serializers.CharField(required=True, max_length=200)
    trainingPlace = serializers.CharField(source='training_place', required=True, max_length=255)
    startDate = serializers.DateField(source='start_date', required=True,
                                      input_formats=[var_sys.DATE_TIME_FORMAT["ISO8601"],
                                                     var_sys.DATE_TIME_FORMAT["Ymd"]])
    expirationDate = serializers.DateField(source='expiration_date', required=False, allow_null=True,
                                           input_formats=[var_sys.DATE_TIME_FORMAT["ISO8601"],
                                                          var_sys.DATE_TIME_FORMAT["Ymd"]])
    resume = serializers.SlugRelatedField(required=False, slug_field="slug", queryset=Resume.objects.all())
    resumeId = serializers.PrimaryKeyRelatedField(source='resume', queryset=Resume.objects.all(), required=False)

    def __init__(self, *args, **kwargs):
        fields = kwargs.pop('fields', None)
        super().__init__(*args, **kwargs)
        if fields is not None:
            allowed = set(fields)
            existing = set(self.fields)
            for field_name in existing - allowed:
                self.fields.pop(field_name)

    def validate(self, attrs):
        if Certificate.objects.count() >= 10:
            raise serializers.ValidationError(
                {'errorMessage': ERROR_MESSAGES["MAXIMUM_CERTIFICATE"]})
        return attrs

    class Meta:
        model = Certificate
        fields = ('id', 'name', 'trainingPlace', 'startDate', 'expirationDate', 'resume', 'resumeId')


class LanguageSkillSerializer(serializers.ModelSerializer):
    language = serializers.IntegerField(required=True)
    level = serializers.IntegerField(required=True)
    resume = serializers.SlugRelatedField(required=False, slug_field="slug", queryset=Resume.objects.all())
    resumeId = serializers.PrimaryKeyRelatedField(source='resume', queryset=Resume.objects.all(), required=False)

    def __init__(self, *args, **kwargs):
        fields = kwargs.pop('fields', None)
        super().__init__(*args, **kwargs)
        if fields is not None:
            allowed = set(fields)
            existing = set(self.fields)
            for field_name in existing - allowed:
                self.fields.pop(field_name)

    class Meta:
        model = LanguageSkill
        fields = ('id', 'language', 'level', 'resume', 'resumeId')


class AdvancedSkillSerializer(serializers.ModelSerializer):
    name = serializers.CharField(required=True, max_length=200)
    level = serializers.IntegerField(required=True)
    resume = serializers.SlugRelatedField(required=False, slug_field="slug", queryset=Resume.objects.all())
    resumeId = serializers.PrimaryKeyRelatedField(source='resume', queryset=Resume.objects.all(), required=False)

    def __init__(self, *args, **kwargs):
        fields = kwargs.pop('fields', None)
        super().__init__(*args, **kwargs)
        if fields is not None:
            allowed = set(fields)
            existing = set(self.fields)
            for field_name in existing - allowed:
                self.fields.pop(field_name)

    def validate(self, attrs):
        if AdvancedSkill.objects.count() >= 15:
            raise serializers.ValidationError(
                {'errorMessage': ERROR_MESSAGES["MAXIMUM_ADVANCED"]})
        return attrs

    class Meta:
        model = AdvancedSkill
        fields = ('id', 'name', 'level', 'resume', "resumeId")


class ResumeDetailSerializer(serializers.ModelSerializer):
    title = serializers.CharField(required=True, max_length=200)
    description = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    salaryMin = serializers.IntegerField(source="salary_min", required=True)
    salaryMax = serializers.IntegerField(source="salary_max", required=True)
    expectedSalary = serializers.IntegerField(source="expected_salary", required=False, allow_null=True)
    skillsSummary = serializers.CharField(source="skills_summary", required=False, allow_null=True, allow_blank=True)
    position = serializers.IntegerField(required=True)
    experience = serializers.IntegerField(required=True)
    academicLevel = serializers.IntegerField(source="academic_level", required=True)
    typeOfWorkplace = serializers.IntegerField(source="type_of_workplace", required=True)
    jobType = serializers.IntegerField(source="job_type", required=True)
    isActive = serializers.BooleanField(source="is_active", default=False)
    updateAt = serializers.DateTimeField(source="update_at", read_only=True)
    fileUrl = serializers.SerializerMethodField(method_name='get_cv_file_url', read_only=True)
    filePublicId = serializers.SerializerMethodField(method_name='get_cv_file_public_id', read_only=True)
    type = serializers.CharField(required=False, read_only=True)
    isSaved = serializers.SerializerMethodField(method_name='check_saved', read_only=True)
    user = auth_serializers.UserSerializer(fields=["id", "fullName", "email", "avatarUrl"], read_only=True)
    jobSeekerProfile = JobSeekerProfileSerializer(
        source="job_seeker_profile",
        fields=["id", "phone", "birthday", "gender", "maritalStatus", "location",
                "idCardNumber", "idCardIssueDate", "idCardIssuePlace",
                "taxCode", "socialInsuranceNo",
                "permanentAddress", "contactAddress",
                "emergencyContactName", "emergencyContactPhone"],
        read_only=True)
    experiencesDetails = ExperienceSerializer(
        source="experience_details",
        fields=['id', 'jobName', 'companyName', 'startDate', 'endDate',
                'description', 'lastSalary', 'leaveReason'],
        read_only=True, many=True)
    educationDetails = EducationSerializer(
        source="education_details",
        fields=['id', 'degreeName', 'major', 'trainingPlaceName',
                'startDate', 'completedDate', 'description', 'gradeOrRank'],
        read_only=True, many=True)
    certificates = CertificateSerializer(
        fields=['id', 'name', 'trainingPlace', 'startDate', 'expirationDate'],
        read_only=True, many=True)
    languageSkills = LanguageSkillSerializer(
        source="language_skills",
        fields=['id', 'language', 'level'],
        read_only=True, many=True)
    advancedSkills = AdvancedSkillSerializer(
        source="advanced_skills",
        fields=['id', 'name', 'level'],
        read_only=True, many=True)
    lastViewedDate = serializers.SerializerMethodField(method_name='get_last_viewed_date', read_only=True)
    isSentEmail = serializers.SerializerMethodField(method_name='check_sent_email', read_only=True)
    aiAnalysis = serializers.SerializerMethodField(method_name='get_ai_analysis', read_only=True)

    def check_saved(self, resume):
        request = self.context.get('request', None)
        if request is None:
            return None
        user = request.user
        if user.is_authenticated and user.role_name == var_sys.EMPLOYER:
            if hasattr(resume, "_prefetched_objects_cache") and "resumesaved_set" in resume._prefetched_objects_cache:
                return len(resume.resumesaved_set.all()) > 0
            return resume.resumesaved_set.filter(company=user.company).exists()
        return None

    def get_last_viewed_date(self, resume):
        request = self.context.get('request', None)
        if request is None:
            return None
        company = getattr(request.user, 'company', None)
        if not company:
            return None
        if hasattr(resume, "_prefetched_objects_cache") and "resumeviewed_set" in resume._prefetched_objects_cache:
            viewed_items = list(resume.resumeviewed_set.all())
            return viewed_items[0].update_at if viewed_items else None
        resume_viewed = ResumeViewed.objects.filter(company=company, resume=resume).first()
        if not resume_viewed:
            return None
        return resume_viewed.update_at

    def check_sent_email(self, resume):
        request = self.context.get('request', None)
        if request is None:
            return False
        company = getattr(request.user, 'company', None)
        if not company:
            return False
        if hasattr(resume, "_prefetched_objects_cache") and "contactprofile_set" in resume._prefetched_objects_cache:
            return len(resume.contactprofile_set.all()) > 0
        return resume.contactprofile_set.filter(company=company, resume=resume).exists()

    def get_ai_analysis(self, resume):
        request = self.context.get('request', None)
        if request is None:
            return None
        company = getattr(request.user, 'company', None)
        if not company:
            return None
        if hasattr(resume, "_prefetched_objects_cache") and "jobpostactivity_set" in resume._prefetched_objects_cache:
            activities = list(resume.jobpostactivity_set.all())
            latest_activity = activities[0] if activities else None
        else:
            latest_activity = JobPostActivity.objects.filter(
                resume=resume, job_post__company=company
            ).order_by('-create_at').first()
        if latest_activity:
            return {
                'activityId': latest_activity.id,
                'score': latest_activity.ai_analysis_score,
                'summary': latest_activity.ai_analysis_summary,
                'skills': latest_activity.ai_analysis_skills,
                'status': latest_activity.ai_analysis_status
            }
        return None

    def get_cv_file_url(self, resume):
        cv_file = resume.file
        if cv_file:
            return cv_file.get_full_url()
        return None

    def get_cv_file_public_id(self, resume):
        cv_file = resume.file
        if cv_file:
            return cv_file.public_id
        return None

    class Meta:
        model = Resume
        fields = ("id", "slug", "title", "description",
                  "salaryMin", "salaryMax", "expectedSalary", "skillsSummary",
                  "position", "experience", "academicLevel",
                  "typeOfWorkplace", "jobType", "isActive",
                  "city", "career", "updateAt", "fileUrl",
                  "filePublicId", "city", 'isSaved', "type",
                  "user", "jobSeekerProfile",
                  "experiencesDetails", "educationDetails",
                  "certificates", "languageSkills", "advancedSkills",
                  "lastViewedDate", "isSentEmail", "aiAnalysis")
