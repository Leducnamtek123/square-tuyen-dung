
import datetime

from shared.configs import variable_system as var_sys

from shared.helpers import helper

from shared.serializers import DynamicFieldsMixin

from rest_framework import serializers

from django.db import transaction
from django.db.models import Q
from django.utils import timezone
from apps.content.system_settings import auto_approve_jobs_enabled

from .models import (

    JobPost,

    JobPostActivity,

    JobPostNotification

)

from apps.locations.models import Location
from apps.profiles.models import Resume

from common import serializers as common_serializers

from apps.profiles import serializers as info_serializers

from apps.accounts import serializers as auth_serializers
from apps.profiles.serializers_pkg.profile_serializers import PHONE_PATTERN

MAX_JOB_POST_SALARY = 2_147_483_647
JOB_POST_CHOICE_FIELD_MAP = {
    "position": ("position", var_sys.POSITION_CHOICES),
    "experience": ("experience", var_sys.EXPERIENCE_CHOICES),
    "academic_level": ("academicLevel", var_sys.ACADEMIC_LEVEL),
    "type_of_workplace": ("typeOfWorkplace", var_sys.TYPE_OF_WORKPLACE_CHOICES),
    "job_type": ("jobType", var_sys.JOB_TYPE_CHOICES),
    "gender_required": ("genderRequired", var_sys.GENDER_CHOICES),
}
JOB_POST_NOTIFICATION_CHOICE_FIELD_MAP = {
    "position": ("position", var_sys.POSITION_CHOICES),
    "experience": ("experience", var_sys.EXPERIENCE_CHOICES),
    "frequency": ("frequency", var_sys.FREQUENCY_NOTIFICATION),
}


def _choice_values(choices):
    return {choice[0] for choice in choices}


def _validate_choice_fields(attrs, field_map):
    errors = {}
    for model_field, (api_field, choices) in field_map.items():
        value = attrs.get(model_field)
        if model_field in attrs and value is not None and value not in _choice_values(choices):
            errors[api_field] = "Invalid choice."
    return errors

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

                                                             'companyImageUrl', 'companyName', 'mobileUserDict', 'isVerified'],

                                                     read_only=True)

    mobileCompanyDict = info_serializers.CompanySerializer(source='company',

                                                           fields=['id', 'slug', 'taxCode', 'companyName',

                                                                   'employeeSize', 'fieldOperation', 'location',

                                                                   'since', 'companyEmail', 'companyPhone',

                                                                   'websiteUrl', 'facebookUrl', 'youtubeUrl',

                                                                   'linkedinUrl', 'description',

                                                                   'companyImageUrl', 'companyImages', 'isVerified'],

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

    aiRecommendedCount = serializers.SerializerMethodField(method_name="get_ai_recommended_count", read_only=True)
    ai_recommended_count = serializers.SerializerMethodField(method_name="get_ai_recommended_count", read_only=True)
    aiRecommendedAvatars = serializers.SerializerMethodField(method_name="get_ai_recommended_avatars", read_only=True)
    ai_recommended_avatars = serializers.SerializerMethodField(method_name="get_ai_recommended_avatars", read_only=True)

    from apps.interviews.models import QuestionGroup
    interviewTemplate = serializers.PrimaryKeyRelatedField(
        source='interview_template',
        queryset=QuestionGroup.objects.all(),
        required=False,
        allow_null=True
    )
    isAutoSourcingEnabled = serializers.BooleanField(source='is_auto_sourcing_enabled', required=False, default=True)
    autoSourcingLimit = serializers.IntegerField(source='auto_sourcing_limit', required=False, default=10)
    autoInterviewEnabled = serializers.BooleanField(source='auto_interview_enabled', required=False, default=True)
    minScreeningScore = serializers.IntegerField(source='min_screening_score', required=False, default=70)

    def get_fields(self):
        fields = super().get_fields()
        template_field = fields.get("interviewTemplate")
        if template_field is None:
            return fields

        request = self.context.get("request")
        user = getattr(request, "user", None)
        if user and getattr(user, "is_authenticated", False) and (
            getattr(user, "role_name", None) == var_sys.ADMIN
            or getattr(user, "is_staff", False)
            or getattr(user, "is_superuser", False)
        ):
            return fields

        try:
            company = user.get_active_company() if user else None
        except Exception:
            company = None

        from apps.interviews.models import QuestionGroup

        if company:
            template_field.queryset = QuestionGroup.objects.filter(Q(company__isnull=True) | Q(company=company))
        else:
            template_field.queryset = QuestionGroup.objects.none()
        return fields

    def get_salary(self, obj):
        return f"{obj.salary_min} - {obj.salary_max}"

    def get_city(self, obj):
        return obj.location.city.name if obj.location and obj.location.city else None

    def get_applied_number(self, job_post):

        if hasattr(job_post, 'applied_total'):
            return job_post.applied_total

        if hasattr(job_post, '_prefetched_objects_cache') and 'jobpostactivity_set' in job_post._prefetched_objects_cache:
            return sum(1 for activity in job_post.jobpostactivity_set.all() if not activity.is_deleted)

        return job_post.jobpostactivity_set.filter(is_deleted=False).count()

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
                return any(
                    activity.user_id == user.id and not activity.is_deleted
                    for activity in job_post.jobpostactivity_set.all()
                )
            return job_post.jobpostactivity_set.filter(user=user, is_deleted=False).exists()

        return False

    def check_is_expired(self, job_post):
        deadline = job_post.deadline
        if deadline < timezone.localdate():
            return True
        return False

    def _get_matching_resumes_info(self, job_post):
        if hasattr(job_post, '_cached_matching_info'):
            return job_post._cached_matching_info

        # Single optimized queryset without multiple sequential .exists() checks
        qs = Resume.objects.filter(
            Q(job_seeker_profile__isnull=True) | Q(job_seeker_profile__is_seeking_job=True),
            is_active=True
        ).select_related('user', 'user__avatar')

        if job_post.career_id:
            matching = qs.filter(career_id=job_post.career_id)
        elif job_post.job_name:
            words = [w.strip() for w in job_post.job_name.split() if len(w.strip()) > 2]
            if words:
                query = Q()
                for w in words:
                    query |= Q(title__icontains=w) | Q(skills_summary__icontains=w)
                matching = qs.filter(query)
            else:
                matching = qs
        else:
            matching = qs

        resumes = list(matching[:3])
        count = len(resumes) if len(resumes) < 3 else matching.count()

        avatars = []
        for r in resumes:
            u = getattr(r, 'user', None)
            name = (getattr(u, 'full_name', '') or getattr(u, 'username', '') or getattr(r, 'title', '') or "Ứng viên").strip()
            initial = name[0].upper() if name else "U"
            avatar_url = None
            if u and getattr(u, 'avatar', None) and getattr(u.avatar, 'file', None):
                try:
                    avatar_url = helper.get_presigned_url(u.avatar.file.name)
                except Exception:
                    avatar_url = None

            avatars.append({
                "name": name,
                "initial": initial,
                "avatarUrl": avatar_url
            })

        info = (count, avatars)
        job_post._cached_matching_info = info
        return info

    def get_ai_recommended_count(self, job_post):
        count, _ = self._get_matching_resumes_info(job_post)
        return count

    def get_ai_recommended_avatars(self, job_post):
        _, avatars = self._get_matching_resumes_info(job_post)
        return avatars




    def validate(self, attrs):
        errors = {}
        errors.update(_validate_choice_fields(attrs, JOB_POST_CHOICE_FIELD_MAP))

        salary_min = attrs.get('salary_min', getattr(self.instance, 'salary_min', None))
        salary_max = attrs.get('salary_max', getattr(self.instance, 'salary_max', None))
        if 'salary_min' in attrs and attrs['salary_min'] < 0:
            errors['salaryMin'] = "Lương tối thiểu không được nhỏ hơn 0."
        if 'salary_min' in attrs and attrs['salary_min'] > MAX_JOB_POST_SALARY:
            errors['salaryMin'] = "Salary exceeds the allowed limit."
        if 'salary_max' in attrs and attrs['salary_max'] < 0:
            errors['salaryMax'] = "Lương tối đa không được nhỏ hơn 0."
        if 'salary_max' in attrs and attrs['salary_max'] > MAX_JOB_POST_SALARY:
            errors['salaryMax'] = "Salary exceeds the allowed limit."
        if salary_min is not None and salary_max is not None and salary_min > salary_max:
            errors['salaryMax'] = "Lương tối đa phải lớn hơn hoặc bằng lương tối thiểu."

        if 'quantity' in attrs and attrs['quantity'] <= 0:
            errors['quantity'] = "Số lượng tuyển dụng phải lớn hơn 0."

        if 'deadline' in attrs and attrs['deadline'] < timezone.localdate():
            errors['deadline'] = "Hạn nộp hồ sơ không được trong quá khứ."

        contact_person_phone = attrs.get('contact_person_phone')
        if (
            'contact_person_phone' in attrs
            and contact_person_phone
            and not PHONE_PATTERN.fullmatch(str(contact_person_phone).strip())
        ):
            errors['contactPersonPhone'] = "Invalid phone number."

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

                  'isExpired', 'salary', 'city', 'interviewTemplate',
                  'isAutoSourcingEnabled', 'autoSourcingLimit', 'autoInterviewEnabled', 'minScreeningScore',
                  'aiRecommendedCount', 'aiRecommendedAvatars', 'ai_recommended_count', 'ai_recommended_avatars')


    def create(self, validated_data):

        try:

            request = self.context['request']

            user = request.user

            company = user.get_active_company()
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
                validated_data['status'] = (
                    var_sys.JobPostStatus.APPROVED
                    if auto_approve_jobs_enabled()
                    else var_sys.JobPostStatus.PENDING
                )

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

        salary_min = attrs.get('salary_min', getattr(self.instance, 'salary_min', None))
        salary_max = attrs.get('salary_max', getattr(self.instance, 'salary_max', None))
        if 'salary_min' in attrs and attrs['salary_min'] < 0:
            errors['salaryMin'] = "Lương tối thiểu không được nhỏ hơn 0."
        if 'salary_max' in attrs and attrs['salary_max'] < 0:
            errors['salaryMax'] = "Lương tối đa không được nhỏ hơn 0."
        if salary_min is not None and salary_max is not None and salary_min > salary_max:
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

    def to_internal_value(self, data):
        if hasattr(data, "copy"):
            data = data.copy()
        else:
            data = dict(data)

        if "jobPost" in data and "job_post" not in data:
            data["job_post"] = data.get("jobPost")

        return super().to_internal_value(data)

    def validate(self, attrs):
        phone = attrs.get('phone')
        if phone and not PHONE_PATTERN.fullmatch(str(phone).strip()):
            raise serializers.ValidationError({"phone": "Invalid phone number."})

        job_post = attrs.get('job_post')
        if job_post:
            if job_post.status != var_sys.JobPostStatus.APPROVED:
                raise serializers.ValidationError({"job_post": "Tin tuyển dụng chưa được duyệt hoặc đã bị khóa."})

            if job_post.deadline < timezone.localdate():
                raise serializers.ValidationError({"job_post": "Tin tuyển dụng đã hết hạn ứng tuyển."})

            if not job_post.company.is_verified:
                raise serializers.ValidationError({"job_post": "Công ty của tin tuyển dụng chưa được xác thực."})

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

    userId = serializers.SerializerMethodField(method_name="get_user_id", read_only=True)

    fullName = serializers.CharField(source="full_name", required=True, max_length=100)

    email = serializers.EmailField(required=True, max_length=100)

    phone = serializers.CharField(required=True, max_length=15)

    title = serializers.SerializerMethodField(method_name="get_title", read_only=True)

    type = serializers.SerializerMethodField(method_name="get_type", read_only=True)

    resumeSlug = serializers.SerializerMethodField(method_name="get_resume_slug", read_only=True)

    jobName = serializers.ReadOnlyField(source="job_post.job_name")
    statusName = serializers.SerializerMethodField()
    isManualCandidate = serializers.SerializerMethodField(method_name="get_is_manual_candidate", read_only=True)
    manualCandidateProfile = serializers.IntegerField(source="manual_candidate_profile_id", read_only=True)
    hrmEmployeeId = serializers.CharField(source="frappe_employee_id", read_only=True)
    hrmUserId = serializers.CharField(source="frappe_user_id", read_only=True)
    hrmSyncStatus = serializers.CharField(source="frappe_sync_status", read_only=True)
    hrmSyncError = serializers.CharField(source="frappe_sync_error", read_only=True)
    hrmSyncedAt = serializers.DateTimeField(source="frappe_synced_at", read_only=True)
    hrmEmployeeUrl = serializers.SerializerMethodField()

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

    aiAnalysisCriteria = serializers.JSONField(source='ai_analysis_criteria', read_only=True)

    aiAnalysisEvidence = serializers.JSONField(source='ai_analysis_evidence', read_only=True)

    aiAnalysisReviewStatus = serializers.CharField(source='ai_analysis_review_status', read_only=True)

    aiAnalysisHrOverrideScore = serializers.IntegerField(source='ai_analysis_hr_override_score', read_only=True)

    aiAnalysisHrOverrideNote = serializers.CharField(source='ai_analysis_hr_override_note', read_only=True)

    aiAnalysisReviewedAt = serializers.DateTimeField(source='ai_analysis_reviewed_at', read_only=True)

    aiAnalysisReviewedBy = serializers.SerializerMethodField(method_name='get_ai_analysis_reviewed_by', read_only=True)

    aiAnalysisEffectiveScore = serializers.SerializerMethodField(method_name='get_ai_analysis_effective_score', read_only=True)

    resumeFileUrl = serializers.SerializerMethodField(method_name='get_resume_file_url', read_only=True)

    def get_user_id(self, activity):
        return activity.user_id

    def get_title(self, activity):
        if activity.resume:
            return activity.resume.title
        if activity.manual_candidate_profile:
            return activity.manual_candidate_profile.title
        return None

    def get_type(self, activity):
        if activity.resume:
            return activity.resume.type
        if activity.manual_candidate_profile:
            return var_sys.CV_UPLOAD if activity.manual_candidate_profile.file else ""
        return ""

    def get_resume_slug(self, activity):
        if activity.resume:
            return activity.resume.slug
        return None

    def get_is_manual_candidate(self, activity):
        return bool(activity.manual_candidate_profile_id)

    def get_resume_file_url(self, activity):
        if activity.resume and activity.resume.file:
            return activity.resume.file.get_full_url()
        if activity.manual_candidate_profile and activity.manual_candidate_profile.file:
            return activity.manual_candidate_profile.file.get_full_url()
        return None

    def get_ai_analysis_reviewed_by(self, activity):
        user = getattr(activity, 'ai_analysis_reviewed_by', None)
        if not user:
            return None
        return {
            "id": user.id,
            "fullName": user.full_name,
            "email": user.email,
        }

    def get_ai_analysis_effective_score(self, activity):
        if activity.ai_analysis_hr_override_score is not None:
            return activity.ai_analysis_hr_override_score
        return activity.ai_analysis_score

    def get_statusName(self, activity):
        try:
            return var_sys.ApplicationStatus(activity.status).label
        except ValueError:
            return ""

    def get_hrmEmployeeUrl(self, activity):
        if not activity.frappe_employee_id:
            return ""
        from django.conf import settings

        base_url = (settings.FRAPPE_HR_PUBLIC_URL or settings.FRAPPE_HR_BASE_URL or "").rstrip("/")
        return f"{base_url}/app/employee/{activity.frappe_employee_id}" if base_url else ""

    userDict = serializers.SerializerMethodField(method_name="get_user_dict", read_only=True)

    def get_user_dict(self, activity):
        user = activity.user
        if not user:
            return {
                "id": None,
                "fullName": activity.full_name,
                "email": activity.email,
                "avatar": None,
                "phone": activity.phone,
            }
        return {
            "id": user.id,
            "fullName": user.full_name,
            "email": user.email,
            "avatar": user.avatar.get_full_url() if hasattr(user, 'avatar') and user.avatar else None,
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

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        if self.context.get("blind_screening"):
            representation["fullName"] = f"Candidate #{instance.id}"
            representation["email"] = None
            representation["phone"] = None
            representation["resumeFileUrl"] = None
            representation["resumeSlug"] = None
            representation["userDict"] = {
                "id": instance.user_id,
                "fullName": f"Candidate #{instance.id}",
                "email": None,
                "avatar": None,
                "phone": None,
            }
        return representation

    def validate_status(self, value):
        if self.instance:
            current_status = self.instance.status
            if current_status in [var_sys.ApplicationStatus.HIRED, var_sys.ApplicationStatus.NOT_SELECTED]:
                if value == var_sys.ApplicationStatus.PENDING_CONFIRMATION:
                    raise serializers.ValidationError("Không thể chuyển ngược trạng thái từ Đã Tuyển Dụng / Không Trúng Tuyển về Chờ Xác Nhận.")
        return value




    class Meta:
        model = JobPostActivity

        fields = ("id", "userId", "fullName", "email", "phone", "title", "type",

                  "resumeSlug", "jobName", "status", "statusName", "isManualCandidate", "manualCandidateProfile",
                  "hrmEmployeeId", "hrmUserId",
                  "hrmSyncStatus", "hrmSyncError", "hrmSyncedAt", "hrmEmployeeUrl", "createAt", "isSentEmail",

                  "aiAnalysisScore", "aiAnalysisSummary", "aiAnalysisSkills", "aiAnalysisStatus", "aiAnalysisProgress", "aiAnalysisPros", "aiAnalysisCons", "aiAnalysisMatchingSkills", "aiAnalysisMissingSkills",
                  "aiAnalysisCriteria", "aiAnalysisEvidence",
                  "aiAnalysisReviewStatus", "aiAnalysisHrOverrideScore", "aiAnalysisHrOverrideNote",
                  "aiAnalysisReviewedAt", "aiAnalysisReviewedBy", "aiAnalysisEffectiveScore",
                  "resumeFileUrl", "userDict", "jobPostDict", "companyDict")

class EmployerJobPostActivityExportSerializer(DynamicFieldsMixin, serializers.ModelSerializer):

    title = serializers.SerializerMethodField(method_name="get_title")

    fullName = serializers.ReadOnlyField(source="full_name")

    email = serializers.ReadOnlyField()

    phone = serializers.ReadOnlyField()

    gender = serializers.SerializerMethodField(method_name="get_gender")

    birthday = serializers.SerializerMethodField(method_name="get_birthday")

    address = serializers.SerializerMethodField(method_name="get_address")

    jobName = serializers.ReadOnlyField(source="job_post.job_name")

    createAt = serializers.DateTimeField(source='create_at', read_only=True)

    statusApply = serializers.SerializerMethodField(method_name="get_status_apply")

    def get_title(self, job_post_activity):
        if job_post_activity.resume:
            return job_post_activity.resume.title
        if getattr(job_post_activity, "manual_candidate_profile", None):
            return job_post_activity.manual_candidate_profile.title
        return ""

    def _profile(self, job_post_activity):
        resume = getattr(job_post_activity, "resume", None)
        return getattr(resume, "job_seeker_profile", None)

    def get_gender(self, job_post_activity):
        return getattr(self._profile(job_post_activity), "gender", "") or ""

    def get_birthday(self, job_post_activity):
        return getattr(self._profile(job_post_activity), "birthday", "") or ""

    def get_address(self, job_post_activity):
        profile = self._profile(job_post_activity)
        location = getattr(profile, "location", None)
        city = getattr(location, "city", None)
        if city:
            return getattr(city, "name", "") or ""

        manual_profile = getattr(job_post_activity, "manual_candidate_profile", None)
        manual_city = getattr(manual_profile, "city", None)
        return getattr(manual_city, "name", "") or ""



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

        errors.update(_validate_choice_fields(attrs, JOB_POST_NOTIFICATION_CHOICE_FIELD_MAP))

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


class JobOfferLetterSerializer(serializers.ModelSerializer):
    statusLabel = serializers.CharField(source="get_status_display", read_only=True)
    candidateName = serializers.CharField(source="candidate.full_name", read_only=True)
    candidateEmail = serializers.CharField(source="candidate.email", read_only=True)
    companyName = serializers.CharField(source="company.company_name", read_only=True)
    jobName = serializers.CharField(source="job_post.job_name", read_only=True)

    class Meta:
        from .models import JobOfferLetter
        model = JobOfferLetter
        fields = (
            "id", "application", "job_post", "company", "candidate",
            "candidateName", "candidateEmail", "companyName", "jobName",
            "position_title", "salary_offered", "allowance", "start_date",
            "expiration_date", "work_location", "benefits_note",
            "terms_and_conditions", "status", "statusLabel",
            "candidate_signed_at", "candidate_feedback", "create_at", "update_at"
        )
        read_only_fields = ("id", "application", "company", "candidate", "job_post", "candidate_signed_at", "create_at", "update_at")

    def validate(self, attrs):
        start_date = attrs.get('start_date')
        expiration_date = attrs.get('expiration_date')
        salary_offered = attrs.get('salary_offered')
        allowance = attrs.get('allowance')

        if salary_offered is not None and salary_offered < 0:
            raise serializers.ValidationError({"salary_offered": "Mức lương đề xuất không được là số âm."})
        if allowance is not None and allowance < 0:
            raise serializers.ValidationError({"allowance": "Phụ cấp không được là số âm."})
        if start_date and expiration_date and expiration_date > start_date:
            raise serializers.ValidationError({"expiration_date": "Hạn phản hồi thư mời phải trước hoặc bằng ngày nhận việc."})
        return attrs


