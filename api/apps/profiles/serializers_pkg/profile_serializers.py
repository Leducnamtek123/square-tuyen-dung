"""
JobSeeker Profile serializers for the profiles app.
Extracted from the monolithic serializers.py.
"""
from datetime import date

from django.db import transaction
from rest_framework import serializers

from shared.configs import variable_system as var_sys
from console.jobs import queue_auth

from ..models import JobSeekerProfile
from apps.locations.models import Location
from apps.accounts import serializers as auth_serializers
from common import serializers as common_serializers


class JobSeekerProfileSerializer(serializers.ModelSerializer):
    phone = serializers.CharField(required=True, max_length=15)
    birthday = serializers.DateField(required=True,
                                     input_formats=[var_sys.DATE_TIME_FORMAT["ISO8601"],
                                                    var_sys.DATE_TIME_FORMAT["Ymd"]])
    gender = serializers.CharField(required=True, max_length=1)
    maritalStatus = serializers.CharField(source='marital_status',
                                          required=True, max_length=1)
    idCardNumber = serializers.CharField(source='id_card_number', required=False,
                                         allow_blank=True, allow_null=True, max_length=30)
    idCardIssueDate = serializers.DateField(source='id_card_issue_date', required=False, allow_null=True,
                                            input_formats=[var_sys.DATE_TIME_FORMAT["ISO8601"],
                                                           var_sys.DATE_TIME_FORMAT["Ymd"]])
    idCardIssuePlace = serializers.CharField(source='id_card_issue_place', required=False,
                                             allow_blank=True, allow_null=True, max_length=255)
    taxCode = serializers.CharField(source='tax_code', required=False,
                                    allow_blank=True, allow_null=True, max_length=30)
    socialInsuranceNo = serializers.CharField(source='social_insurance_no', required=False,
                                              allow_blank=True, allow_null=True, max_length=30)
    permanentAddress = serializers.CharField(source='permanent_address', required=False,
                                             allow_blank=True, allow_null=True, max_length=255)
    contactAddress = serializers.CharField(source='contact_address', required=False,
                                           allow_blank=True, allow_null=True, max_length=255)
    emergencyContactName = serializers.CharField(source='emergency_contact_name', required=False,
                                                 allow_blank=True, allow_null=True, max_length=100)
    emergencyContactPhone = serializers.CharField(source='emergency_contact_phone', required=False,
                                                  allow_blank=True, allow_null=True, max_length=20)
    location = common_serializers.ProfileLocationSerializer()

    user = auth_serializers.UserSerializer(fields=["fullName", "email", "avatarUrl"])

    userDict = serializers.SerializerMethodField(method_name="get_user_dict", read_only=True)

    old = serializers.SerializerMethodField(method_name="get_old", read_only=True)

    def __init__(self, *args, **kwargs):
        fields = kwargs.pop('fields', None)
        super().__init__(*args, **kwargs)
        if fields is not None:
            allowed = set(fields)
            existing = set(self.fields)
            for field_name in existing - allowed:
                self.fields.pop(field_name)

    def get_user_dict(self, profile):
        user = profile.user
        return {
            "fullName": user.full_name,
            "email": user.email,
            "avatar": user.avatar.get_full_url() if hasattr(user, 'avatar') and user.avatar else var_sys.AVATAR_DEFAULT["AVATAR"],
            "phone": profile.phone,
            "gender": profile.gender,
            "birthday": profile.birthday,
        }

    def get_old(self, job_seeker_profile):
        birthdate = job_seeker_profile.birthday
        if birthdate:
            today = date.today()
            age = today.year - birthdate.year - \
                ((today.month, today.day) < (birthdate.month, birthdate.day))
            return age
        return None

    class Meta:
        model = JobSeekerProfile
        fields = ('id', 'phone', 'birthday',
                  'gender', 'maritalStatus',
                  'idCardNumber', 'idCardIssueDate', 'idCardIssuePlace',
                  'taxCode', 'socialInsuranceNo',
                  'permanentAddress', 'contactAddress',
                  'emergencyContactName', 'emergencyContactPhone',
                  'location', 'user', 'userDict', 'old')

    def update(self, instance, validated_data):
        instance.birthday = validated_data.get('birthday', instance.birthday)
        instance.phone = validated_data.get('phone', instance.phone)
        instance.gender = validated_data.get('gender', instance.gender)
        instance.marital_status = validated_data.get('marital_status', instance.marital_status)
        instance.id_card_number = validated_data.get('id_card_number', instance.id_card_number)
        instance.id_card_issue_date = validated_data.get('id_card_issue_date', instance.id_card_issue_date)
        instance.id_card_issue_place = validated_data.get('id_card_issue_place', instance.id_card_issue_place)
        instance.tax_code = validated_data.get('tax_code', instance.tax_code)
        instance.social_insurance_no = validated_data.get('social_insurance_no', instance.social_insurance_no)
        instance.permanent_address = validated_data.get('permanent_address', instance.permanent_address)
        instance.contact_address = validated_data.get('contact_address', instance.contact_address)
        instance.emergency_contact_name = validated_data.get('emergency_contact_name', instance.emergency_contact_name)
        instance.emergency_contact_phone = validated_data.get('emergency_contact_phone', instance.emergency_contact_phone)
        location_obj = instance.location
        user_obj = instance.user
        location_data = validated_data.get("location")
        user_data = validated_data.get("user")

        if location_data:
            if location_obj:
                location_obj.city = location_data.get("city", location_obj.city)
                location_obj.district = location_data.get("district", location_obj.district)
                location_obj.address = location_data.get("address", location_obj.address)
                location_obj.save()
            else:
                location_new = Location.objects.create(**location_data)
                instance.location = location_new
        if user_data:
            user_obj.full_name = user_data.get("full_name", user_obj.full_name)
            user_obj.save()
            # update in firebase
            queue_auth.update_info.delay(user_obj.id, user_obj.full_name)

        instance.save()
        return instance


class SendMailToJobSeekerSerializer(serializers.Serializer):
    fullName = serializers.CharField(max_length=100, required=True)
    title = serializers.CharField(max_length=200, required=True)
    content = serializers.CharField(required=True)
    email = serializers.EmailField(max_length=100, required=True)
    isSendMe = serializers.BooleanField(default=False)
