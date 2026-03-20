
import datetime

from shared.configs import variable_system as var_sys

from shared.helpers import helper

from rest_framework import serializers

from django.db import transaction

from .models import (

    JobPost,

    JobPostActivity,

    JobPostNotification

)

from apps.locations.models import Location

from common import serializers as common_serializers

from apps.profiles import serializers as info_serializers

from apps.accounts import serializers as auth_serializers

class JobPostSerializer(serializers.ModelSerializer):

    jobName = serializers.CharField(source="job_name", required=True, max_length=255)

    deadline = serializers.DateField(required=True,

                                     input_formats=[var_sys.DATE_TIME_FORMAT["ISO8601"],

                                                    var_sys.DATE_TIME_FORMAT["Ymd"]],

                                     )

    quantity = serializers.IntegerField(required=True)

    genderRequired = serializers.CharField(source="gender_required", required=False,

                                           max_length=1, allow_blank=True, allow_null=True)

    jobDescription = serializers.CharField(source="job_description", required=True)

    jobRequirement = serializers.CharField(source="job_requirement", required=True)

    benefitsEnjoyed = serializers.CharField(source="benefits_enjoyed", required=True)

    position = serializers.IntegerField(required=True)

    typeOfWorkplace = serializers.IntegerField(source="type_of_workplace", required=True)

    experience = serializers.IntegerField(required=True)

    academicLevel = serializers.IntegerField(source='academic_level', required=True)

    jobType = serializers.IntegerField(source="job_type", required=True)

    salaryMin = serializers.IntegerField(source="salary_min", required=True)

    salaryMax = serializers.IntegerField(source="salary_max", required=True)

    isHot = serializers.BooleanField(source="is_hot", required=False, allow_null=True, read_only=True)

    isUrgent = serializers.BooleanField(source="is_urgent", default=False)

    contactPersonName = serializers.CharField(source="contact_person_name", required=True, max_length=100)

    contactPersonPhone = serializers.CharField(source="contact_person_phone", required=True, max_length=15)

    contactPersonEmail = serializers.EmailField(source="contact_person_email", required=True, max_length=100)

    updateAt = serializers.DateTimeField(source="update_at", read_only=True)

    createAt = serializers.DateTimeField(source="create_at", read_only=True)

    location = common_serializers.LocationSerializer()

    companyDict = info_serializers.CompanySerializer(source='company',

                                                     fields=['id', 'slug', 'employeeSize',

                                                             'companyImageUrl', 'companyName', 'mobileUserDict'],

                                                     read_only=True)

    mobileCompanyDict = info_serializers.CompanySerializer(source='company',

                                                           fields=['id', 'slug', 'taxCode', 'companyName',

                                                                   'employeeSize', 'fieldOperation', 'location',

                                                                   'since', 'companyEmail', 'companyPhone',

                                                                   'websiteUrl', 'facebookUrl', 'youtubeUrl',

                                                                   'linkedinUrl', 'description',

                                                                   'companyImageUrl', 'companyImages'],

                                                           read_only=True)

    locationDict = common_serializers.LocationSerializer(source="location",

                                                         fields=['city'],

                                                         read_only=True)

    status = serializers.IntegerField(read_only=True)

    views = serializers.IntegerField(read_only=True)

    salary = serializers.SerializerMethodField(read_only=True)

    city = serializers.SerializerMethodField(read_only=True)

    appliedNumber = serializers.SerializerMethodField(method_name="get_applied_number", read_only=True)

    isSaved = serializers.SerializerMethodField(method_name='check_saved', read_only=True)

    isApplied = serializers.SerializerMethodField(method_name='check_applied', read_only=True)

    isExpired = serializers.SerializerMethodField(method_name='check_is_expired', read_only=True)

    def get_salary(self, obj):
        return f"{obj.salary_min} - {obj.salary_max}"

    def get_city(self, obj):
        return obj.location.city.name if obj.location and obj.location.city else None

    def get_applied_number(self, job_post):

        if hasattr(job_post, 'applied_total'):
            return job_post.applied_total

        if hasattr(job_post, '_prefetched_objects_cache') and 'peoples_applied' in job_post._prefetched_objects_cache:
            return len(job_post.peoples_applied.all())

        return job_post.peoples_applied.count()

    def check_saved(self, job_post):

        request = self.context.get('request', None)

        if request is None:
            return False

        user = request.user

        if user.is_authenticated:
            if hasattr(job_post, '_prefetched_objects_cache') and 'savedjobpost_set' in job_post._prefetched_objects_cache:
                return any(saved.user_id == user.id for saved in job_post.savedjobpost_set.all())
            return job_post.savedjobpost_set.filter(user=user).exists()

        return False

    def check_applied(self, job_post):

        request = self.context.get('request', None)

        if request is None:
            return False

        user = request.user

        if user.is_authenticated:
            if hasattr(job_post, '_prefetched_objects_cache') and 'jobpostactivity_set' in job_post._prefetched_objects_cache:
                return any(activity.user_id == user.id for activity in job_post.jobpostactivity_set.all())
            return job_post.jobpostactivity_set.filter(user=user).exists()

        return False

    def check_is_expired(self, job_post):

        deadline = job_post.deadline

        if deadline < datetime.datetime.now().date():

            return True

        return False

    def __init__(self, *args, **kwargs):

        fields = kwargs.pop('fields', None)

        super().__init__(*args, **kwargs)

        if fields is not None:

            allowed = set(fields)

            existing = set(self.fields)

            for field_name in existing - allowed:

                self.fields.pop(field_name)

    class Meta:

        model = JobPost

        fields = ('id', 'slug', 'jobName', 'deadline', 'quantity', 'genderRequired',

                  'jobDescription', 'jobRequirement', 'benefitsEnjoyed', 'career',

                  'position', 'typeOfWorkplace', 'experience', 'academicLevel',

                  'jobType', 'salaryMin', 'salaryMax', 'isHot', 'isUrgent', 'status',

                  'contactPersonName', 'contactPersonPhone', 'contactPersonEmail',

                  'location', 'createAt', 'updateAt', 'appliedNumber',

                  'isSaved', 'isApplied', 'companyDict', 'mobileCompanyDict', 'locationDict', 'views',

                  'isExpired', 'salary', 'city')

    def create(self, validated_data):

        try:

            request = self.context['request']

            user = request.user

            company = getattr(user, "company", None)
            if not company:
                raise serializers.ValidationError({"errorMessage": "Tài khoản của bạn chưa liên kết với công ty."})

            location_data = validated_data.pop('location')

            location = Location(**location_data)

            job_post = JobPost(**validated_data)

            with transaction.atomic():

                location.save()

                job_post.location = location

                job_post.user = user

                job_post.company = company

                job_post.save()

        except Exception as ex:
            helper.print_log_error("create job post", error=ex)
            raise
        else:

            return job_post

    def update(self, instance, validated_data):
        try:
            instance.job_name = validated_data.get('job_name', instance.job_name)

            instance.deadline = validated_data.get('deadline', instance.deadline)

            instance.quantity = validated_data.get('quantity', instance.quantity)

            instance.gender_required = validated_data.get('gender_required', instance.gender_required)

            instance.job_description = validated_data.get('job_description', instance.job_description)

            instance.job_requirement = validated_data.get('job_requirement', instance.job_requirement)

            instance.benefits_enjoyed = validated_data.get('benefits_enjoyed', instance.benefits_enjoyed)

            instance.position = validated_data.get('position', instance.position)

            instance.type_of_workplace = validated_data.get('type_of_workplace', instance.type_of_workplace)

            instance.experience = validated_data.get('experience', instance.experience)

            instance.academic_level = validated_data.get('academic_level', instance.academic_level)

            instance.job_type = validated_data.get('job_type', instance.job_type)

            instance.salary_min = validated_data.get('salary_min', instance.salary_min)

            instance.salary_max = validated_data.get('salary_max', instance.salary_max)

            instance.is_urgent = validated_data.get('is_urgent', instance.is_urgent)

            instance.contact_person_name = validated_data.get('contact_person_name', instance.contact_person_name)

            instance.contact_person_phone = validated_data.get('contact_person_phone', instance.contact_person_phone)

            instance.contact_person_email = validated_data.get('contact_person_email', instance.contact_person_email)

            instance.status = var_sys.JobPostStatus.PENDING

            location_obj = instance.location
            location_data = validated_data.get("location")

            with transaction.atomic():
                if location_data and location_obj:
                    location_obj.city = location_data.get("city", location_obj.city)
                    location_obj.district = location_data.get("district", location_obj.district)
                    location_obj.address = location_data.get("address", location_obj.address)
                    location_obj.lat = location_data.get("lat", location_obj.lat)
                    location_obj.lng = location_data.get("lng", location_obj.lng)
                    location_obj.save()
                instance.save()
                return instance
        except Exception as ex:
            helper.print_log_error("update job post", ex)
            raise

class JobPostAroundFilterSerializer(serializers.Serializer):

    currentLatitude = serializers.FloatField(required=True)

    currentLongitude = serializers.FloatField(required=True)

    radius = serializers.IntegerField(required=True)

class JobPostAroundSerializer(serializers.ModelSerializer):

    latitude = serializers.PrimaryKeyRelatedField(source="location.lat", read_only=True)

    longitude = serializers.PrimaryKeyRelatedField(source="location.lng", read_only=True)

    jobName = serializers.CharField(source="job_name", required=True, max_length=255)

    deadline = serializers.DateField(required=True,

                                     input_formats=[var_sys.DATE_TIME_FORMAT["ISO8601"],

                                                    var_sys.DATE_TIME_FORMAT["Ymd"]],

                                     )

    salaryMin = serializers.IntegerField(source="salary_min", required=True)

    salaryMax = serializers.IntegerField(source="salary_max", required=True)

    mobileCompanyDict = info_serializers.CompanySerializer(source='company',

                                                           fields=['companyName',

                                                                   'companyImageUrl'],

                                                           read_only=True)

    locationDict = common_serializers.LocationSerializer(source="location",

                                                         fields=['city'],

                                                         read_only=True)

    class Meta:

        model = JobPost

        fields = ('id', "latitude", "longitude",

                  "jobName", "deadline", "salaryMin", "salaryMax",

                  "mobileCompanyDict", "locationDict")

class JobSeekerJobPostActivitySerializer(serializers.ModelSerializer):

    fullName = serializers.CharField(source="full_name", required=True, max_length=100)

    email = serializers.EmailField(required=True, max_length=100)

    phone = serializers.CharField(required=True, max_length=15)

    createAt = serializers.DateTimeField(source='create_at', read_only=True)

    updateAt = serializers.DateTimeField(source='update_at', read_only=True)

    jobPostDict = JobPostSerializer(source="job_post", fields=[

        'id', 'slug', 'companyDict', "salaryMin", "salaryMax",

        'jobName', 'isHot', 'isUrgent', 'salary', 'city', 'deadline',

        'locationDict'

    ], read_only=True)

    mobileJobPostDict = JobPostSerializer(source="job_post", fields=[

        'id', 'companyDict', "salaryMin", "salaryMax",

        'jobName', 'career', 'position', 'experience', 'academicLevel',

        'city', 'jobType', 'typeOfWorkplace', 'deadline',

        'locationDict', 'updateAt'

    ], read_only=True)

    resumeDict = info_serializers.ResumeSerializer(source="resume", fields=[

        'id', 'slug', 'title', 'type'

    ], read_only=True)

    def __init__(self, *args, **kwargs):

        fields = kwargs.pop('fields', None)

        super().__init__(*args, **kwargs)

        if fields is not None:

            allowed = set(fields)

            existing = set(self.fields)

            for field_name in existing - allowed:

                self.fields.pop(field_name)

    class Meta:

        model = JobPostActivity

        fields = ("id", "job_post", "resume", "fullName", "email", "phone",

                  "createAt", "updateAt", "jobPostDict", "mobileJobPostDict", "resumeDict")

    def create(self, validated_data):
        request = self.context["request"]
        try:
            with transaction.atomic():
                job_post_activity = JobPostActivity.objects.create(**validated_data, user=request.user)
            return job_post_activity
        except Exception as ex:
            helper.print_log_error("create job post activity", ex)
            raise

class EmployerJobPostActivitySerializer(serializers.ModelSerializer):

    userId = serializers.IntegerField(source="user.id", read_only=True)

    fullName = serializers.CharField(source="full_name", required=True, max_length=100)

    email = serializers.EmailField(required=True, max_length=100)

    phone = serializers.CharField(required=True, max_length=15)

    title = serializers.ReadOnlyField(source="resume.title")

    type = serializers.ReadOnlyField(source="resume.type")

    resumeSlug = serializers.ReadOnlyField(source="resume.slug")

    jobName = serializers.ReadOnlyField(source="job_post.job_name")

    createAt = serializers.DateTimeField(source='create_at', read_only=True)

    isSentEmail = serializers.BooleanField(source='is_sent_email', required=False)

    aiAnalysisScore = serializers.IntegerField(source='ai_analysis_score', read_only=True)

    aiAnalysisSummary = serializers.CharField(source='ai_analysis_summary', read_only=True)

    aiAnalysisSkills = serializers.CharField(source='ai_analysis_skills', read_only=True)

    aiAnalysisStatus = serializers.CharField(source='ai_analysis_status', read_only=True)

    aiAnalysisPros = serializers.CharField(source='ai_analysis_pros', read_only=True)

    aiAnalysisCons = serializers.CharField(source='ai_analysis_cons', read_only=True)

    aiAnalysisMatchingSkills = serializers.JSONField(source='ai_analysis_matching_skills', read_only=True)

    aiAnalysisMissingSkills = serializers.JSONField(source='ai_analysis_missing_skills', read_only=True)

    userDict = serializers.SerializerMethodField(method_name="get_user_dict", read_only=True)

    def get_user_dict(self, activity):
        user = activity.user
        return {
            "id": user.id,
            "fullName": user.full_name,
            "email": user.email,
            "avatar": user.avatar.get_full_url() if hasattr(user, 'avatar') and user.avatar else var_sys.AVATAR_DEFAULT["AVATAR"],
            "phone": activity.phone,
        }

    jobPostDict = serializers.SerializerMethodField(method_name="get_job_post_dict", read_only=True)
    companyDict = serializers.SerializerMethodField(method_name="get_company_dict", read_only=True)

    def get_job_post_dict(self, activity):
        return {
            "id": activity.job_post.id,
            "jobName": activity.job_post.job_name,
            "slug": activity.job_post.slug,
        }

    def get_company_dict(self, activity):
        company = activity.job_post.company
        return {
            "id": company.id,
            "companyName": company.company_name,
            "slug": company.slug,
        }

    def __init__(self, *args, **kwargs):

        fields = kwargs.pop('fields', None)

        super().__init__(*args, **kwargs)

        if fields is not None:

            allowed = set(fields)

            existing = set(self.fields)

            for field_name in existing - allowed:

                self.fields.pop(field_name)

    class Meta:

        model = JobPostActivity

        fields = ("id", "userId", "fullName", "email", "phone", "title", "type",

                  "resumeSlug", "jobName", "status", "createAt", "isSentEmail",

                  "aiAnalysisScore", "aiAnalysisSummary", "aiAnalysisSkills", "aiAnalysisStatus", "aiAnalysisPros", "aiAnalysisCons", "aiAnalysisMatchingSkills", "aiAnalysisMissingSkills",
                  "userDict", "jobPostDict", "companyDict")

class EmployerJobPostActivityExportSerializer(serializers.ModelSerializer):

    title = serializers.ReadOnlyField(source="resume.title")

    fullName = serializers.ReadOnlyField(source="full_name")

    email = serializers.ReadOnlyField()

    phone = serializers.ReadOnlyField()

    gender = serializers.ReadOnlyField(source="resume.job_seeker_profile.gender")

    birthday = serializers.ReadOnlyField(source="resume.job_seeker_profile.birthday")

    address = serializers.ReadOnlyField(source="resume.job_seeker_profile.location.city.name")

    jobName = serializers.ReadOnlyField(source="job_post.job_name")

    createAt = serializers.DateTimeField(source='create_at', read_only=True)

    statusApply = serializers.SerializerMethodField(method_name="get_status_apply")

    def __init__(self, *args, **kwargs):

        fields = kwargs.pop('fields', None)

        super().__init__(*args, **kwargs)

        if fields is not None:

            allowed = set(fields)

            existing = set(self.fields)

            for field_name in existing - allowed:

                self.fields.pop(field_name)

    def get_status_apply(self, job_post_activity):

        status = job_post_activity.status

        result = "Chờ xác nhận"

        for x in var_sys.APPLICATION_STATUS:

            if x[0] == status:

                result = x[1]

                break

        return result

    class Meta:

        model = JobPostActivity

        fields = ("title", "fullName", "email", "phone",

                  "gender", "birthday", "address",

                  "jobName", "createAt", "statusApply")

class JobPostNotificationSerializer(serializers.ModelSerializer):

    jobName = serializers.CharField(source="job_name", required=True, max_length=255)

    position = serializers.IntegerField(required=False, allow_null=True)

    experience = serializers.IntegerField(required=False, allow_null=True)

    salary = serializers.IntegerField(required=False, allow_null=True)

    frequency = serializers.IntegerField(required=True)

    isActive = serializers.BooleanField(source='is_active', required=False)

    userDict = auth_serializers.UserSerializer(source='user', read_only=True,
                                                fields=['id', 'fullName', 'email', 'avatarUrl'])

    def __init__(self, *args, **kwargs):

        fields = kwargs.pop('fields', None)

        super().__init__(*args, **kwargs)

        if fields is not None:

            allowed = set(fields)

            existing = set(self.fields)

            for field_name in existing - allowed:

                self.fields.pop(field_name)

    class Meta:

        model = JobPostNotification

        fields = ("id", "jobName", "position",

                  "experience", "salary",

                  "frequency", "isActive",

                  "career", "city", "userDict")

    def create(self, validated_data):

        try:

            request = self.context['request']

            user = request.user

            job_post_notification = JobPostNotification(**validated_data)

            with transaction.atomic():

                job_post_notification.user = user

                job_post_notification.save()

        except Exception as ex:
            helper.print_log_error("create job post notification", error=ex)
            raise
        else:

            return job_post_notification

class StatisticsSerializer(serializers.Serializer):

    startDate = serializers.DateField(required=True)

    endDate = serializers.DateField(required=True)

