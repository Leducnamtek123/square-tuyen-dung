
import datetime

from shared.configs import variable_system as var_sys

from shared.helpers import helper

from shared.serializers import DynamicFieldsMixin

from rest_framework import serializers

from django.db import transaction
from django.utils import timezone

from .models import (

    JobPost,

    JobPostActivity,

    JobPostNotification

)

from apps.locations.models import Location

from common import serializers as common_serializers

from apps.profiles import serializers as info_serializers

from apps.accounts import serializers as auth_serializers

class JobPostSerializer(DynamicFieldsMixin, serializers.ModelSerializer):

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

        if deadline < timezone.localdate():

            return True

        return False




    def validate(self, attrs):
        errors = {}

        if 'salary_min' in attrs and 'salary_max' in attrs:
            if attrs['salary_min'] < 0:
                errors['salaryMin'] = "Lương tối thiểu không được nhỏ hơn 0."
            if attrs['salary_min'] > attrs['salary_max']:
                errors['salaryMax'] = "Lương tối đa phải lớn hơn hoặc bằng lương tối thiểu."

        if 'quantity' in attrs and attrs['quantity'] <= 0:
            errors['quantity'] = "Số lượng tuyển dụng phải lớn hơn 0."

        if 'deadline' in attrs and attrs['deadline'] < timezone.localdate():
            errors['deadline'] = "Hạn nộp hồ sơ không được trong quá khứ."

        if errors:
            raise serializers.ValidationError(errors)

        return attrs

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
                raise serializers.ValidationError({"errorMessage": ["Tài khoản của bạn chưa liên kết với công ty."]})

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
            location_data = validated_data.pop("location", None)

            # Only reset status to PENDING if sensitive fields changed
            SENSITIVE_FIELDS = {
                'job_name', 'job_description', 'job_requirement',
                'salary_min', 'salary_max', 'benefits_enjoyed',
                'quantity', 'position', 'experience', 'academic_level',
            }
            if set(validated_data.keys()) & SENSITIVE_FIELDS:
                validated_data['status'] = var_sys.JobPostStatus.PENDING

            with transaction.atomic():
                if location_data and instance.location:
                    for key, val in location_data.items():
                        setattr(instance.location, key, val)
                    instance.location.save()
                return super().update(instance, validated_data)
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


    def validate(self, attrs):
        errors = {}

        if 'salary_min' in attrs and 'salary_max' in attrs:
            if attrs['salary_min'] < 0:
                errors['salaryMin'] = "Lương tối thiểu không được nhỏ hơn 0."
            if attrs['salary_min'] > attrs['salary_max']:
                errors['salaryMax'] = "Lương tối đa phải lớn hơn hoặc bằng lương tối thiểu."

        if errors:
            raise serializers.ValidationError(errors)

        return attrs

    class Meta:
        model = JobPost

        fields = ('id', "latitude", "longitude",

                  "jobName", "deadline", "salaryMin", "salaryMax",

                  "mobileCompanyDict", "locationDict")

class JobSeekerJobPostActivitySerializer(DynamicFieldsMixin, serializers.ModelSerializer):

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


    def validate(self, attrs):
        job_post = attrs.get('job_post')
        if job_post:
            if job_post.status != var_sys.JobPostStatus.APPROVED:
                raise serializers.ValidationError({"job_post": "Tin tuyển dụng chưa được duyệt hoặc đã bị khóa."})

            if job_post.deadline < timezone.localdate():
                raise serializers.ValidationError({"job_post": "Tin tuyển dụng đã hết hạn ứng tuyển."})

        return attrs

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

class EmployerJobPostActivitySerializer(DynamicFieldsMixin, serializers.ModelSerializer):

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
    aiAnalysisProgress = serializers.IntegerField(source='ai_analysis_progress', read_only=True)

    aiAnalysisPros = serializers.CharField(source='ai_analysis_pros', read_only=True)

    aiAnalysisCons = serializers.CharField(source='ai_analysis_cons', read_only=True)

    aiAnalysisMatchingSkills = serializers.JSONField(source='ai_analysis_matching_skills', read_only=True)

    aiAnalysisMissingSkills = serializers.JSONField(source='ai_analysis_missing_skills', read_only=True)

    resumeFileUrl = serializers.SerializerMethodField(method_name='get_resume_file_url', read_only=True)

    def get_resume_file_url(self, activity):
        if activity.resume and activity.resume.file:
            return activity.resume.file.get_full_url()
        return None

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




    class Meta:
        model = JobPostActivity

        fields = ("id", "userId", "fullName", "email", "phone", "title", "type",

                  "resumeSlug", "jobName", "status", "createAt", "isSentEmail",

                  "aiAnalysisScore", "aiAnalysisSummary", "aiAnalysisSkills", "aiAnalysisStatus", "aiAnalysisProgress", "aiAnalysisPros", "aiAnalysisCons", "aiAnalysisMatchingSkills", "aiAnalysisMissingSkills",
                  "resumeFileUrl", "userDict", "jobPostDict", "companyDict")

class EmployerJobPostActivityExportSerializer(DynamicFieldsMixin, serializers.ModelSerializer):

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

class JobPostNotificationSerializer(DynamicFieldsMixin, serializers.ModelSerializer):

    jobName = serializers.CharField(source="job_name", required=True, max_length=255)

    position = serializers.IntegerField(required=False, allow_null=True)

    experience = serializers.IntegerField(required=False, allow_null=True)

    salary = serializers.IntegerField(required=False, allow_null=True)

    frequency = serializers.IntegerField(required=True)

    isActive = serializers.BooleanField(source='is_active', required=False)

    userDict = auth_serializers.UserSerializer(source='user', read_only=True,
                                                fields=['id', 'fullName', 'email', 'avatarUrl'])




    def validate(self, attrs):
        errors = {}

        if 'salary' in attrs and attrs['salary'] is not None:
            if attrs['salary'] < 0:
                errors['salary'] = "Mức lương không được nhỏ hơn 0."

        if 'frequency' in attrs and attrs['frequency'] not in [1, 7, 30]:
            errors['frequency'] = "Tần suất thông báo không hợp lệ."

        if errors:
            raise serializers.ValidationError(errors)

        return attrs

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

