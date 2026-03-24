
from rest_framework import serializers
from shared.serializers import DynamicFieldsMixin

from .models import (

    Feedback,

    Banner

)

from apps.accounts import serializers as auth_serializers

class FeedbackSerializer(DynamicFieldsMixin, serializers.ModelSerializer):

    content = serializers.CharField(max_length=255)

    rating = serializers.IntegerField(default=5)

    isActive = serializers.BooleanField(source='is_active', default=False)

    userDict = auth_serializers.UserSerializer(source="user",

                                               fields=['id', 'fullName', 'avatarUrl'],

                                               read_only=True)


    def create(self, validated_data):

        request = self.context['request']

        feedback = Feedback.objects.create(**validated_data, user=request.user)

        return feedback

    class Meta:

        model = Feedback

        fields = ('id', 'content', 'rating', 'isActive', 'userDict')

class BannerSerializer(DynamicFieldsMixin, serializers.ModelSerializer):

    imageUrl = serializers.SerializerMethodField(method_name='get_image_url', read_only=True)

    imageMobileUrl = serializers.SerializerMethodField(method_name='get_image_mobile_url', read_only=True)

    buttonText = serializers.CharField(source='button_text', read_only=True)

    description = serializers.CharField(read_only=True)

    buttonLink = serializers.URLField(source="button_link", read_only=True)

    isShowButton = serializers.BooleanField(source='is_show_button', read_only=True)

    isActive = serializers.BooleanField(source='is_active', read_only=True)

    descriptionLocation = serializers.IntegerField(source='description_location', read_only=True)


    def get_image_url(self, banner):

        if banner.image:

            return banner.image.get_full_url()

        return None

    def get_image_mobile_url(self, banner):

        if banner.image_mobile:

            return banner.image_mobile.get_full_url()

        return None

    class Meta:

        model = Banner

        fields = ('id', 'imageUrl', 'imageMobileUrl',

                  'buttonText', 'description',

                  'buttonLink', 'isShowButton',

                  'isActive', 'descriptionLocation')


class AdminBannerSerializer(DynamicFieldsMixin, serializers.ModelSerializer):
    """Full admin serializer for Banner CRUD."""
    imageUrl = serializers.SerializerMethodField(read_only=True)
    imageMobileUrl = serializers.SerializerMethodField(read_only=True)

    # Allow relative paths like /nha-tuyen-dung/tim-ung-vien (URLField rejects them)
    button_link = serializers.CharField(
        allow_blank=True, allow_null=True, required=False
    )

    class Meta:
        model = Banner
        fields = (
            'id', 'button_text', 'description', 'button_link',
            'is_show_button', 'description_location', 'platform',
            'type', 'is_active', 'image', 'image_mobile',
            'imageUrl', 'imageMobileUrl', 'create_at', 'update_at',
        )
        read_only_fields = ('id', 'create_at', 'update_at', 'imageUrl', 'imageMobileUrl')

    def validate(self, attrs):
        """Convert string booleans sent via multipart/FormData to proper Python booleans."""
        for bool_field in ('is_show_button', 'is_active'):
            val = attrs.get(bool_field)
            if isinstance(val, str):
                attrs[bool_field] = val.lower() in ('true', '1', 'yes')
        # Treat empty string as None for button_link
        if attrs.get('button_link') == '':
            attrs['button_link'] = None
        return attrs

    def get_imageUrl(self, banner):
        if banner.image:
            return banner.image.get_full_url()
        return None

    def get_imageMobileUrl(self, banner):
        if banner.image_mobile:
            return banner.image_mobile.get_full_url()
        return None


class AdminFeedbackSerializer(DynamicFieldsMixin, serializers.ModelSerializer):
    """Full admin serializer for Feedback management."""
    userDict = auth_serializers.UserSerializer(
        source="user",
        fields=['id', 'fullName', 'avatarUrl', 'email'],
        read_only=True
    )

    class Meta:
        model = Feedback
        fields = (
            'id', 'content', 'rating', 'is_active',
            'user', 'userDict', 'create_at', 'update_at',
        )
        read_only_fields = ('id', 'create_at', 'update_at', 'userDict')

