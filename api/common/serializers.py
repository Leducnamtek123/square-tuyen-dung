
from rest_framework import serializers
from django.conf import settings
from django.db import transaction
from shared.helpers import helper
from shared.helpers.cloudinary_service import CloudinaryService
from shared.serializers import DynamicFieldsMixin

from apps.files.models import File
from apps.locations.models import City, District, Location, Ward
from .models import AuditLog, Career

class CitySerializer(serializers.ModelSerializer):

    class Meta:

        model = City

        fields = ('id', 'name', 'code', 'create_at', 'update_at')

class DistrictSerializer(serializers.ModelSerializer):

    class Meta:

        model = District

        fields = ('id', 'name', 'code', 'city')

class WardSerializer(serializers.ModelSerializer):

    class Meta:

        model = Ward

        fields = ('id', 'name', 'code', 'district')

class CareerSerializer(DynamicFieldsMixin, serializers.ModelSerializer):

    name = serializers.CharField(max_length=150)

    iconUrl = serializers.SerializerMethodField(method_name='get_icon_url', read_only=True)

    appIconName = serializers.CharField(source='app_icon_name', required=False, allow_blank=True, allow_null=True)

    isHot = serializers.BooleanField(source='is_hot', required=False)

    iconFile = serializers.ImageField(write_only=True, required=False)

    createAt = serializers.DateTimeField(source='create_at', read_only=True)

    updateAt = serializers.DateTimeField(source='update_at', read_only=True)

    jobPostTotal = serializers.SerializerMethodField(method_name='get_job_post_total')



    def get_icon_url(self, career):
        try:
            icon = career.icon
        except File.DoesNotExist:
            # Data can be inconsistent if icon_id points to a deleted file.
            return None
        except Exception:
            return None

        if not icon:
            return None

        try:
            return icon.get_full_url()
        except Exception:
            return None

    def get_job_post_total(self, career):
        try:
            return career.job_posts.count()
        except Exception:
            return 0

    def _upload_icon(self, instance, icon_file):

        if not icon_file:
            return instance

        public_id = None
        if instance.icon:
            path_list = instance.icon.public_id.split('/')
            public_id = path_list[-1] if path_list else None

        upload_result = CloudinaryService.upload_image(
            icon_file,
            settings.CLOUDINARY_DIRECTORY["career_image"],
            public_id=public_id
        )

        instance.icon = File.update_or_create_file_with_cloudinary(
            instance.icon,
            upload_result,
            File.CAREER_IMAGE_TYPE
        )
        instance.save()
        return instance

    def create(self, validated_data):
        icon_file = validated_data.pop("iconFile", None)
        try:
            with transaction.atomic():
                career = Career.objects.create(**validated_data)
                self._upload_icon(career, icon_file)
                return career
        except Exception as ex:
            helper.print_log_error("career_serializer_create", ex)
            raise

    def update(self, instance, validated_data):
        icon_file = validated_data.pop("iconFile", None)
        try:
            with transaction.atomic():
                instance.name = validated_data.get("name", instance.name)
                instance.app_icon_name = validated_data.get("app_icon_name", instance.app_icon_name)
                instance.is_hot = validated_data.get("is_hot", instance.is_hot)
                instance.save()
                self._upload_icon(instance, icon_file)
                return instance
        except Exception as ex:
            helper.print_log_error("career_serializer_update", ex)
            raise

    class Meta:

        model = Career

        fields = ('id', 'name', 'iconUrl', 'iconFile', 'appIconName', 'isHot', 'createAt', 'updateAt', 'jobPostTotal')

class ProfileDistrictSerializers(serializers.ModelSerializer):

    class Meta:

        model = District

        fields = ('id', 'name')

class ProfileWardSerializers(serializers.ModelSerializer):

    class Meta:

        model = Ward

        fields = ('id', 'name')


def get_location_validation_instance(serializer):
    if getattr(serializer, "instance", None):
        return serializer.instance

    parent_instance = getattr(getattr(serializer, "parent", None), "instance", None)
    return getattr(parent_instance, "location", None)


def validate_location_hierarchy(attrs, instance=None):
    city = attrs.get("city") if "city" in attrs else getattr(instance, "city", None)
    district = attrs.get("district") if "district" in attrs else getattr(instance, "district", None)
    ward = attrs.get("ward") if "ward" in attrs else getattr(instance, "ward", None)
    address = attrs.get("address") if "address" in attrs else getattr(instance, "address", None)
    errors = {}

    if not city:
        errors["city"] = ["City is required."]

    if not district:
        errors["district"] = ["District is required."]

    if not str(address or "").strip():
        errors["address"] = ["Address is required."]

    if city and district and district.city_id != city.id:
        errors["district"] = ["District does not belong to the selected city."]

    if district and ward and ward.district_id != district.id:
        errors["ward"] = ["Ward does not belong to the selected district."]

    if city and ward and ward.district.city_id != city.id:
        errors["ward"] = ["Ward does not belong to the selected city."]

    if errors:
        raise serializers.ValidationError(errors)

    return attrs


class ProfileLocationSerializer(serializers.ModelSerializer):

    districtDict = ProfileDistrictSerializers(source="district", read_only=True)

    wardDict = ProfileWardSerializers(source="ward", read_only=True)

    def validate(self, attrs):
        attrs = super().validate(attrs)
        return validate_location_hierarchy(attrs, get_location_validation_instance(self))

    class Meta:

        model = Location

        fields = ('city', 'districtDict', 'wardDict', 'address', 'district', 'ward')

class LocationSerializer(DynamicFieldsMixin, serializers.ModelSerializer):

    address = serializers.CharField(required=True, max_length=255)

    lat = serializers.FloatField(required=False, allow_null=True)

    lng = serializers.FloatField(required=False, allow_null=True)


    def validate(self, attrs):
        attrs = super().validate(attrs)
        return validate_location_hierarchy(attrs, get_location_validation_instance(self))


    class Meta:

        model = Location

        fields = ('city', 'district', 'ward', 'address', 'lat', 'lng')

class FileUploadSerializer(serializers.Serializer):
    file = serializers.FileField(required=True)
    file_type = serializers.ChoiceField(choices=File.FILE_TYPES, default=File.OTHER_TYPE)


class AuditLogSerializer(serializers.ModelSerializer):
    actorEmail = serializers.EmailField(source="actor_email", read_only=True)
    resourceType = serializers.CharField(source="resource_type", read_only=True)
    resourceId = serializers.CharField(source="resource_id", read_only=True)
    resourceRepr = serializers.CharField(source="resource_repr", read_only=True)
    ipAddress = serializers.IPAddressField(source="ip_address", read_only=True)
    userAgent = serializers.CharField(source="user_agent", read_only=True)
    requestMethod = serializers.CharField(source="request_method", read_only=True)
    requestPath = serializers.CharField(source="request_path", read_only=True)
    createAt = serializers.DateTimeField(source="create_at", read_only=True)

    class Meta:
        model = AuditLog
        fields = (
            "id",
            "actor",
            "actorEmail",
            "action",
            "resourceType",
            "resourceId",
            "resourceRepr",
            "ipAddress",
            "userAgent",
            "requestMethod",
            "requestPath",
            "metadata",
            "createAt",
        )
