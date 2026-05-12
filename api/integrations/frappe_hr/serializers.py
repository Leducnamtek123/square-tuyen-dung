from rest_framework import serializers


class FrappeEmployeeFromApplicationSerializer(serializers.Serializer):
    applicationId = serializers.IntegerField(required=True)
    fullName = serializers.CharField(source="full_name", required=False, allow_blank=True, max_length=100)
    email = serializers.EmailField(required=False, allow_blank=True)
    phone = serializers.CharField(required=False, allow_blank=True, max_length=20)
    gender = serializers.CharField(required=False, allow_blank=True, max_length=20)
    dateOfBirth = serializers.DateField(source="date_of_birth", required=False, allow_null=True)
    jobTitle = serializers.CharField(source="job_title", required=False, allow_blank=True, max_length=150)
    department = serializers.CharField(required=False, allow_blank=True, max_length=120)
    startDate = serializers.DateField(source="start_date", required=False, allow_null=True)
    createFrappeAccount = serializers.BooleanField(source="create_user_account", required=False, default=True)
    sendWelcomeEmail = serializers.BooleanField(source="send_welcome_email", required=False, default=False)
    frappeRoles = serializers.ListField(
        child=serializers.CharField(max_length=80),
        required=False,
        allow_empty=True,
    )
    notes = serializers.CharField(required=False, allow_blank=True)
