"""
Shared serializer mixins for DRF.
"""

from rest_framework import serializers
from shared.configs.messages import ERROR_MESSAGES


class DynamicFieldsMixin:
    """
    Mixin cho ModelSerializer hỗ trợ chọn fields khi khởi tạo.

    Usage:
        class MySerializer(DynamicFieldsMixin, serializers.ModelSerializer):
            ...

        # Chỉ serialize 2 fields:
        MySerializer(instance, fields=['id', 'name'])
    """

    def __init__(self, *args, **kwargs):
        fields = kwargs.pop('fields', None)
        super().__init__(*args, **kwargs)
        if fields is not None:
            allowed = set(fields)
            for field_name in set(self.fields) - allowed:
                self.fields.pop(field_name)


class PlatformValidationMixin:
    """
    Mixin validate trường platform chỉ chấp nhận "WEB" hoặc "APP".
    """

    def validate_platform(self, platform):
        if platform not in ["WEB", "APP"]:
            raise serializers.ValidationError(ERROR_MESSAGES['INVALID_PLATFORM'])
        return platform


class PasswordConfirmMixin:
    """
    Mixin validate newPassword và confirmPassword phải trùng khớp.
    """

    def validate(self, attrs):
        attrs = super().validate(attrs)
        new_pass = attrs.get('newPassword', '') or attrs.get('password', '')
        confirm_pass = attrs.get('confirmPassword', '')
        if new_pass and confirm_pass and new_pass != confirm_pass:
            raise serializers.ValidationError(
                {'confirmPassword': ERROR_MESSAGES['CONFIRM_PASSWORD_MISMATCH']}
            )
        return attrs
