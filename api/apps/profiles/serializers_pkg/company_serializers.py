"""
Company-related serializers for the profiles app.
Extracted from the monolithic serializers.py.
"""
import datetime

from django.conf import settings
from django.db import transaction
from django.utils import timezone
from rest_framework import serializers
from shared.serializers import DynamicFieldsMixin
from rest_framework.validators import UniqueValidator

from shared.configs import variable_system as var_sys
from shared.configs.messages import ERROR_MESSAGES
from shared.helpers import helper
from shared.helpers.cloudinary_service import CloudinaryService
from console.jobs import queue_auth

from ..models import (
    Company, CompanyFollowed, CompanyImage,
    CompanyRole, CompanyMember, TrustReport, CompanyVerification
)
from apps.files.models import File
from apps.locations.models import Location
from apps.accounts import serializers as auth_serializers
from common import serializers as common_serializers


class CompanyImageSerializer(DynamicFieldsMixin, serializers.ModelSerializer):

    imageUrl = serializers.SerializerMethodField(
        method_name='get_image_url', read_only=True)

    files = serializers.ListField(required=True, write_only=True)


    def get_image_url(self, company_image):
        try:
            if company_image.image:
                return company_image.image.get_full_url()
        except Exception as ex:
            helper.print_log_error("CompanyImageSerializer.get_image_url", ex)
        return None

    def validate(self, attrs):
        files = attrs.get("files", [])
        count_upload_file = len(files)
        request = self.context['request']
        user = request.user

        if user.role_name == var_sys.EMPLOYER:
            company = user.get_active_company()
            if not company:
                raise serializers.ValidationError(
                    {'errorMessage': ["Company not found."]}
                )

            if CompanyImage.objects.filter(company=company).count() + count_upload_file > 15:
                raise serializers.ValidationError(
                    {'errorMessage': [ERROR_MESSAGES["MAXIMUM_IMAGES"]]})

        return attrs

    def create(self, validated_data):
        files = validated_data.pop('files', [])
        request = self.context["request"]
        file_name_list = []

        with transaction.atomic():
            for file in files:
                company = request.user.get_active_company()
                if not company:
                    raise serializers.ValidationError(
                        {'errorMessage': ["Company not found."]}
                    )

                company_image = CompanyImage.objects.create(company=company)

                company_image_upload_result = CloudinaryService.upload_image(
                    file,
                    settings.CLOUDINARY_DIRECTORY["company_image"]
                )

                image = File.update_or_create_file_with_cloudinary(
                    None,
                    company_image_upload_result,
                    File.COMPANY_IMAGE_TYPE
                )

                company_image.image = image
                company_image.save()

                file_name_list.append({
                    'id': company_image.id,
                    'imageUrl': company_image.image.get_full_url() if company_image.image else None
                })

        return file_name_list

    class Meta:
        model = CompanyImage
        fields = ('id', 'imageUrl', 'files')


class CompanySerializer(DynamicFieldsMixin, serializers.ModelSerializer):

    taxCode = serializers.CharField(source="tax_code", required=True, max_length=30,
                                    validators=[UniqueValidator(Company.objects.all(),
                                                                message=ERROR_MESSAGES["COMPANY_TAX_CODE_EXISTS"])])

    companyName = serializers.CharField(source="company_name", required=True,
                                        validators=[UniqueValidator(Company.objects.all(),
                                                                    message=ERROR_MESSAGES["COMPANY_NAME_EXISTS"])])

    employeeSize = serializers.IntegerField(source="employee_size", required=True)

    isVerified = serializers.BooleanField(source="is_verified", read_only=True)

    fieldOperation = serializers.CharField(source="field_operation", required=True, max_length=255)

    location = common_serializers.LocationSerializer()

    since = serializers.DateField(required=True, allow_null=True, input_formats=[var_sys.DATE_TIME_FORMAT["ISO8601"],
                                                                                 var_sys.DATE_TIME_FORMAT["Ymd"]])

    companyEmail = serializers.CharField(source="company_email", required=True,
                                         max_length=100, validators=[UniqueValidator(Company.objects.all(),
                                                                                     message=ERROR_MESSAGES["COMPANY_EMAIL_EXISTS"])])

    companyPhone = serializers.CharField(source="company_phone", required=True,
                                         max_length=15, validators=[
                                             UniqueValidator(Company.objects.all(),
                                                             message='Số điện thoại công ty đã tồn tại.')
                                         ])

    websiteUrl = serializers.URLField(required=False, source="website_url", max_length=300,
                                      allow_null=True, allow_blank=True)

    facebookUrl = serializers.URLField(required=False, source="facebook_url", max_length=300,
                                       allow_null=True, allow_blank=True)

    youtubeUrl = serializers.URLField(required=False, source="youtube_url", max_length=300,
                                      allow_null=True, allow_blank=True)

    linkedinUrl = serializers.URLField(required=False, source="linkedin_url", max_length=300,
                                       allow_null=True, allow_blank=True)

    description = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    companyImageUrl = serializers.SerializerMethodField(
        method_name='get_company_logo_url', read_only=True)

    companyCoverImageUrl = serializers.SerializerMethodField(
        method_name='get_company_cover_image_url', read_only=True)

    locationDict = common_serializers.LocationSerializer(source="location",
                                                         fields=['city'],
                                                         read_only=True)

    followNumber = serializers.SerializerMethodField(
        method_name="get_follow_number", read_only=True)

    jobPostNumber = serializers.SerializerMethodField(
        method_name="get_job_post_number", read_only=True)

    isFollowed = serializers.SerializerMethodField(
        method_name='check_followed', read_only=True)

    companyImages = CompanyImageSerializer(source='company_images', many=True, read_only=True,
                                           fields=['id', 'imageUrl'])

    mobileUserDict = auth_serializers.UserSerializer(source='user', read_only=True,
                                                     fields=["id", "fullName", "email"])


    def get_company_logo_url(self, company):
        try:
            logo = company.logo
            if logo:
                return logo.get_full_url()
        except Exception as ex:
            helper.print_log_error("CompanySerializer.get_company_logo_url", ex)
        return var_sys.AVATAR_DEFAULT["COMPANY_LOGO"]

    def get_company_cover_image_url(self, company):
        try:
            cover_image = company.cover_image
            if cover_image:
                return cover_image.get_full_url()
        except Exception as ex:
            helper.print_log_error("CompanySerializer.get_company_cover_image_url", ex)
        return var_sys.AVATAR_DEFAULT["COMPANY_COVER_IMAGE"]

    def get_follow_number(self, company):
        if hasattr(company, "follow_count"):
            return company.follow_count
        if hasattr(company, "_prefetched_objects_cache") and "companyfollowed_set" in company._prefetched_objects_cache:
            return len(company.companyfollowed_set.all())
        return company.companyfollowed_set.count()

    def get_job_post_number(self, company):
        if hasattr(company, "active_job_post_count"):
            return company.active_job_post_count
        now = datetime.datetime.now().date()
        return company.job_posts.filter(deadline__gte=now, status=var_sys.JobPostStatus.APPROVED).count()

    def check_followed(self, company):
        request = self.context.get('request', None)
        if request is None:
            return False
        user = request.user
        if user.is_authenticated:
            if hasattr(company, "_prefetched_objects_cache") and "companyfollowed_set" in company._prefetched_objects_cache:
                return len(company.companyfollowed_set.all()) > 0
            return company.companyfollowed_set.filter(user=user).exists()
        return False

    class Meta:
        model = Company
        fields = ('id', 'slug', 'taxCode', 'companyName',
                  'employeeSize', 'fieldOperation', 'location',
                  'since', 'companyEmail', 'companyPhone',
                  'websiteUrl', 'facebookUrl', 'youtubeUrl', 'linkedinUrl',
                  'description',
                  'companyImageUrl', 'companyCoverImageUrl', 'locationDict', 'isVerified',
                  'followNumber', 'jobPostNumber', 'isFollowed',
                  'companyImages', 'mobileUserDict')

    def update(self, instance, validated_data):
        try:
            instance.tax_code = validated_data.get('tax_code', instance.tax_code)
            instance.company_name = validated_data.get('company_name', instance.company_name)
            instance.employee_size = validated_data.get('employee_size', instance.employee_size)
            instance.field_operation = validated_data.get('field_operation', instance.field_operation)
            instance.since = validated_data.get('since', instance.since)
            instance.company_email = validated_data.get('company_email', instance.company_email)
            instance.company_phone = validated_data.get('company_phone', instance.company_phone)
            instance.website_url = validated_data.get('website_url', instance.website_url)
            instance.facebook_url = validated_data.get('facebook_url', instance.facebook_url)
            instance.youtube_url = validated_data.get('youtube_url', instance.youtube_url)
            instance.linkedin_url = validated_data.get('linkedin_url', instance.linkedin_url)
            instance.description = validated_data.get('description', instance.description)

            location_obj = instance.location
            location_data = validated_data.get("location")

            with transaction.atomic():
                if location_data:
                    if location_obj:
                        location_obj.city = location_data.get("city", location_obj.city)
                        location_obj.district = location_data.get("district", location_obj.district)
                        location_obj.address = location_data.get("address", location_obj.address)
                        location_obj.lat = location_data.get("lat", location_obj.lat)
                        location_obj.lng = location_data.get("lng", location_obj.lng)
                        location_obj.save()
                    else:
                        location_new = Location.objects.create(**location_data)
                        instance.location = location_new
                instance.save()

                # update in firebase
                queue_auth.update_info.delay(instance.user_id, instance.company_name)

                return instance

        except Exception as ex:
            helper.print_log_error("update company", ex)
            raise


class CompanyFollowedSerializer(DynamicFieldsMixin, serializers.ModelSerializer):

    company = CompanySerializer(fields=['id', 'slug', 'companyName', 'companyImageUrl',
                                        'fieldOperation', 'followNumber', 'jobPostNumber',
                                        'isFollowed'])

    class Meta:
        model = CompanyFollowed
        fields = ('id', 'company',)


class TrustReportSerializer(DynamicFieldsMixin, serializers.ModelSerializer):
    targetType = serializers.CharField(source="target_type", required=True)
    reason = serializers.CharField(required=True)
    message = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    company = serializers.IntegerField(required=False, allow_null=True, source="company_id")
    jobPost = serializers.IntegerField(required=False, allow_null=True, source="job_post_id")
    reporterDict = auth_serializers.UserSerializer(source='reporter', read_only=True, fields=['id', 'fullName', 'email', 'avatarUrl'])
    targetTitle = serializers.SerializerMethodField()
    createAt = serializers.DateTimeField(source='create_at', read_only=True)

    def get_targetTitle(self, report):
        if report.company_id and report.company:
            return report.company.company_name
        if report.job_post_id and report.job_post:
            return report.job_post.job_name
        return ""

    def validate(self, attrs):
        errors = {}
        target_type = attrs.get("target_type")
        company_id = attrs.get("company_id")
        job_post_id = attrs.get("job_post_id")

        if target_type not in {TrustReport.TARGET_JOB, TrustReport.TARGET_COMPANY}:
            errors["targetType"] = "Invalid target type."

        if target_type == TrustReport.TARGET_JOB:
            if not job_post_id:
                errors["jobPost"] = "Job post is required."
            if company_id:
                errors["company"] = "Company must be empty for job reports."
        elif target_type == TrustReport.TARGET_COMPANY:
            if not company_id:
                errors["company"] = "Company is required."
            if job_post_id:
                errors["jobPost"] = "Job post must be empty for company reports."

        if attrs.get("reason") not in dict(TrustReport.REASON_CHOICES):
            errors["reason"] = "Invalid report reason."

        if errors:
            raise serializers.ValidationError(errors)
        return attrs

    def create(self, validated_data):
        from apps.jobs.models import JobPost

        request = self.context["request"]
        user = request.user
        company_id = validated_data.pop("company_id", None)
        job_post_id = validated_data.pop("job_post_id", None)

        if job_post_id:
            job_post = JobPost.objects.filter(pk=job_post_id).first()
            if not job_post:
                raise serializers.ValidationError({"jobPost": "Job post not found."})
            validated_data["job_post"] = job_post

        if company_id:
            company = Company.objects.filter(pk=company_id).first()
            if not company:
                raise serializers.ValidationError({"company": "Company not found."})
            validated_data["company"] = company

        validated_data["reporter"] = user
        report = TrustReport.objects.create(**validated_data)
        return report

    class Meta:
        model = TrustReport
        fields = (
            "id",
            "targetType",
            "reason",
            "message",
            "status",
            "company",
            "jobPost",
            "reporterDict",
            "targetTitle",
            "createAt",
        )


class AdminTrustReportSerializer(TrustReportSerializer):
    targetType = serializers.CharField(source="target_type", read_only=True)
    reason = serializers.CharField(read_only=True)
    message = serializers.CharField(read_only=True)
    company = serializers.IntegerField(read_only=True, source="company_id")
    jobPost = serializers.IntegerField(read_only=True, source="job_post_id")

    def validate_status(self, value):
        if value not in dict(TrustReport.STATUS_CHOICES):
            raise serializers.ValidationError("Invalid report status.")
        return value

    def validate(self, attrs):
        return attrs

    class Meta(TrustReportSerializer.Meta):
        read_only_fields = (
            "id",
            "targetType",
            "reason",
            "message",
            "company",
            "jobPost",
            "reporterDict",
            "targetTitle",
            "createAt",
        )


class CompanyVerificationSerializer(DynamicFieldsMixin, serializers.ModelSerializer):
    companyId = serializers.IntegerField(source="company_id", read_only=True)
    companyDict = CompanySerializer(source="company", read_only=True, fields=["id", "slug", "companyName", "taxCode", "isVerified"])
    companyName = serializers.CharField(source="legal_company_name", required=False, allow_blank=True)
    taxCode = serializers.CharField(source="tax_code", required=False, allow_blank=True)
    businessLicense = serializers.CharField(source="business_license", required=False, allow_blank=True)
    representative = serializers.CharField(source="representative_name", required=False, allow_blank=True)
    phone = serializers.CharField(source="contact_phone", required=False, allow_blank=True)
    email = serializers.EmailField(source="contact_email", required=False, allow_blank=True)
    website = serializers.URLField(required=False, allow_blank=True)
    scheduledAt = serializers.DateTimeField(source="verification_scheduled_at", required=False, allow_null=True)
    contactName = serializers.CharField(source="verification_contact_name", required=False, allow_blank=True)
    contactPhone = serializers.CharField(source="verification_contact_phone", required=False, allow_blank=True)
    notes = serializers.CharField(source="verification_notes", required=False, allow_blank=True)
    adminNote = serializers.CharField(source="admin_note", read_only=True)
    reviewedById = serializers.IntegerField(source="reviewed_by_id", read_only=True)
    reviewedAt = serializers.DateTimeField(source="reviewed_at", read_only=True)
    createAt = serializers.DateTimeField(source="create_at", read_only=True)
    updateAt = serializers.DateTimeField(source="update_at", read_only=True)

    class Meta:
        model = CompanyVerification
        fields = (
            "id",
            "companyId",
            "companyDict",
            "status",
            "companyName",
            "taxCode",
            "businessLicense",
            "representative",
            "phone",
            "email",
            "website",
            "scheduledAt",
            "contactName",
            "contactPhone",
            "notes",
            "adminNote",
            "reviewedById",
            "reviewedAt",
            "createAt",
            "updateAt",
        )
        read_only_fields = (
            "id",
            "companyId",
            "companyDict",
            "status",
            "adminNote",
            "reviewedById",
            "reviewedAt",
            "createAt",
            "updateAt",
        )


class AdminCompanyVerificationSerializer(CompanyVerificationSerializer):
    adminNote = serializers.CharField(source="admin_note", required=False, allow_blank=True)

    def validate_status(self, value):
        if value not in dict(CompanyVerification.STATUS_CHOICES):
            raise serializers.ValidationError("Invalid verification status.")
        return value

    def update(self, instance, validated_data):
        request = self.context.get("request")
        status_value = validated_data.get("status")
        instance = super().update(instance, validated_data)
        if status_value:
            instance.reviewed_by = request.user if request and request.user.is_authenticated else None
            instance.reviewed_at = timezone.now()
            instance.save(update_fields=["reviewed_by", "reviewed_at", "update_at"])
            if status_value == CompanyVerification.STATUS_APPROVED and not instance.company.is_verified:
                instance.company.is_verified = True
                instance.company.save(update_fields=["is_verified", "update_at"])
            elif status_value == CompanyVerification.STATUS_REJECTED and instance.company.is_verified:
                instance.company.is_verified = False
                instance.company.save(update_fields=["is_verified", "update_at"])
        return instance

    class Meta(CompanyVerificationSerializer.Meta):
        read_only_fields = (
            "id",
            "companyId",
            "companyDict",
            "reviewedById",
            "reviewedAt",
            "createAt",
            "updateAt",
        )


class CompanyRoleSerializer(DynamicFieldsMixin, serializers.ModelSerializer):
    companyId = serializers.IntegerField(source="company_id", read_only=True)
    createAt = serializers.DateTimeField(source="create_at", read_only=True)
    updateAt = serializers.DateTimeField(source="update_at", read_only=True)

    class Meta:
        model = CompanyRole
        fields = (
            "id", "companyId", "code", "name", "description",
            "permissions", "is_system", "is_active", "createAt", "updateAt",
        )
        read_only_fields = ("id", "companyId", "is_system", "createAt", "updateAt")


class CompanyMemberSerializer(DynamicFieldsMixin, serializers.ModelSerializer):
    roleId = serializers.IntegerField(source="role_id", required=True)
    role = CompanyRoleSerializer(read_only=True)
    userId = serializers.IntegerField(source="user_id", required=True)
    userDict = auth_serializers.UserSerializer(source="user", read_only=True, fields=["id", "fullName", "email", "avatarUrl"])
    invitedById = serializers.IntegerField(source="invited_by_id", read_only=True)
    companyId = serializers.IntegerField(source="company_id", read_only=True)
    createAt = serializers.DateTimeField(source="create_at", read_only=True)
    updateAt = serializers.DateTimeField(source="update_at", read_only=True)

    class Meta:
        model = CompanyMember
        fields = (
            "id", "companyId", "userId", "userDict", "roleId", "role",
            "status", "joined_at", "invited_email", "invitedById",
            "is_active", "createAt", "updateAt",
        )
        read_only_fields = ("id", "companyId", "userDict", "role", "invitedById", "createAt", "updateAt")


class LogoCompanySerializer(DynamicFieldsMixin, serializers.ModelSerializer):

    file = serializers.FileField(required=True, write_only=True)

    companyImageUrl = serializers.SerializerMethodField(
        method_name='get_company_logo_url', read_only=True)

    class Meta:
        model = Company
        fields = ('file', 'companyImageUrl')

    def get_company_logo_url(self, company):
        logo = company.logo
        if logo:
            return logo.get_full_url()
        return var_sys.AVATAR_DEFAULT["COMPANY_LOGO"]

    def update(self, company, validated_data):
        file = validated_data.pop('file')
        try:
            with transaction.atomic():
                public_id = None
                if company.logo:
                    path_list = company.logo.public_id.split('/')
                    public_id = path_list[-1] if path_list else None

                logo_upload_result = CloudinaryService.upload_image(
                    file,
                    settings.CLOUDINARY_DIRECTORY["logo"],
                    public_id=public_id
                )

                company.logo = File.update_or_create_file_with_cloudinary(
                    company.logo,
                    logo_upload_result,
                    File.LOGO_TYPE
                )
                company.save()

                queue_auth.update_avatar.delay(company.user_id, company.logo.get_full_url())

            return company
        except Exception as e:
            helper.print_log_error("update company logo", e)
            raise


class CompanyCoverImageSerializer(DynamicFieldsMixin, serializers.ModelSerializer):

    file = serializers.FileField(required=True, write_only=True)

    companyCoverImageUrl = serializers.SerializerMethodField(
        method_name='get_company_cover_image_url', read_only=True)

    class Meta:
        model = Company
        fields = ('file', 'companyCoverImageUrl')

    def get_company_cover_image_url(self, company):
        cover_image = company.cover_image
        if cover_image:
            return cover_image.get_full_url()
        return var_sys.AVATAR_DEFAULT["COMPANY_COVER_IMAGE"]

    def update(self, company, validated_data):
        file = validated_data.pop('file')
        try:
            with transaction.atomic():
                public_id = None
                if company.cover_image:
                    path_list = company.cover_image.public_id.split('/')
                    public_id = path_list[-1] if path_list else None

                company_cover_image_upload_result = CloudinaryService.upload_image(
                    file,
                    settings.CLOUDINARY_DIRECTORY["cover_image"],
                    public_id=public_id
                )

                company.cover_image = File.update_or_create_file_with_cloudinary(
                    company.cover_image,
                    company_cover_image_upload_result,
                    File.COVER_IMAGE_TYPE
                )
                company.save()

            return company
        except:
            helper.print_log_error("update company cover image", "unknown error")
            raise
