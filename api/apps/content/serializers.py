from html import unescape

from django.utils.html import strip_tags
from rest_framework import serializers
from shared.serializers import DynamicFieldsMixin

from .models import (
    Feedback,
    Banner,
    BannerType,
    Article,
    ContactMessage,
)

from apps.accounts import serializers as auth_serializers
from apps.accounts.models import User
from apps.files.models import File
from shared.helpers.cloudinary_service import CloudinaryService


class FeedbackSerializer(DynamicFieldsMixin, serializers.ModelSerializer):

    content = serializers.CharField(max_length=500)

    rating = serializers.IntegerField(default=5, min_value=1, max_value=5)

    isActive = serializers.BooleanField(source='is_active', default=False)

    evidenceImageFile = serializers.ImageField(
        write_only=True,
        required=False,
        allow_null=True,
    )

    evidenceImageUrl = serializers.SerializerMethodField(read_only=True)

    userDict = auth_serializers.UserSerializer(
        source="user",
        fields=['id', 'fullName', 'avatarUrl'],
        read_only=True
    )

    def get_evidenceImageUrl(self, feedback):
        if feedback.evidence_image:
            return feedback.evidence_image.get_full_url()
        return None

    def _upload_evidence_image(self, image_file):
        upload_result = CloudinaryService.upload_image(
            image_file,
            'feedback-evidence',
        )
        if not upload_result:
            return None
        return File.update_or_create_file_with_cloudinary(
            None,
            upload_result,
            File.OTHER_TYPE,
        )

    def create(self, validated_data):
        request = self.context['request']
        evidence_image_file = validated_data.pop('evidenceImageFile', None)
        evidence_image = None
        if evidence_image_file:
            evidence_image = self._upload_evidence_image(evidence_image_file)
            if not evidence_image:
                raise serializers.ValidationError({
                    'evidenceImageFile': ['Upload failed.'],
                })
        user = request.user if getattr(request, "user", None) and request.user.is_authenticated else None
        feedback = Feedback.objects.create(
            **validated_data,
            user=user,
            evidence_image=evidence_image,
        )
        return feedback

    class Meta:
        model = Feedback
        fields = (
            'id', 'content', 'rating', 'isActive',
            'evidenceImageFile', 'evidenceImageUrl', 'userDict',
        )


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

    button_link = serializers.URLField(
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
        for bool_field in ('is_show_button', 'is_active'):
            val = attrs.get(bool_field)
            if isinstance(val, str):
                attrs[bool_field] = val.lower() in ('true', '1', 'yes')
        if attrs.get('button_link') == '':
            attrs['button_link'] = None
        if 'type' in attrs and not BannerType.objects.filter(
            value=attrs['type'],
            is_active=True,
        ).exists():
            raise serializers.ValidationError({
                'type': ['Invalid banner type.'],
            })
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
    evidenceImageUrl = serializers.SerializerMethodField(read_only=True)
    rating = serializers.IntegerField(min_value=1, max_value=5)
    isActive = serializers.BooleanField(source='is_active', required=False)
    userId = serializers.PrimaryKeyRelatedField(
        source='user',
        queryset=User.objects.all(),
        required=False,
        allow_null=True,
    )
    evidenceImageFile = serializers.ImageField(
        write_only=True,
        required=False,
        allow_null=True,
    )

    userDict = auth_serializers.UserSerializer(
        source="user",
        fields=['id', 'fullName', 'avatarUrl', 'email'],
        read_only=True
    )

    def get_evidenceImageUrl(self, feedback):
        if feedback.evidence_image:
            return feedback.evidence_image.get_full_url()
        return None

    def _upload_evidence_image(self, image_file):
        upload_result = CloudinaryService.upload_image(
            image_file,
            'feedback-evidence',
        )
        if not upload_result:
            return None
        return File.update_or_create_file_with_cloudinary(
            None,
            upload_result,
            File.OTHER_TYPE,
        )

    def _save_feedback_evidence(self, feedback, validated_data):
        evidence_image_file = validated_data.pop('evidenceImageFile', None)
        if evidence_image_file:
            evidence_image = self._upload_evidence_image(evidence_image_file)
            if not evidence_image:
                raise serializers.ValidationError({
                    'evidenceImageFile': ['Upload failed.'],
                })
            feedback.evidence_image = evidence_image

    class Meta:
        model = Feedback
        fields = (
            'id', 'content', 'rating', 'isActive',
            'userId', 'userDict', 'evidenceImageFile', 'evidenceImageUrl',
            'create_at', 'update_at',
        )
        read_only_fields = (
            'id', 'create_at', 'update_at',
            'userDict', 'evidenceImageUrl',
        )

    def create(self, validated_data):
        evidence_image_file = validated_data.pop('evidenceImageFile', None)
        evidence_image = None
        if evidence_image_file:
            evidence_image = self._upload_evidence_image(evidence_image_file)
            if not evidence_image:
                raise serializers.ValidationError({
                    'evidenceImageFile': ['Upload failed.'],
                })
        feedback = Feedback.objects.create(
            **validated_data,
            evidence_image=evidence_image,
        )
        return feedback

    def update(self, instance, validated_data):
        self._save_feedback_evidence(instance, validated_data)
        return super().update(instance, validated_data)


class AdminBannerTypeSerializer(DynamicFieldsMixin, serializers.ModelSerializer):
    class Meta:
        model = BannerType
        fields = (
            'id', 'code', 'name', 'value',
            'web_aspect_ratio', 'mobile_aspect_ratio',
            'is_active', 'create_at', 'update_at',
        )
        read_only_fields = ('id', 'create_at', 'update_at')


# ─── Article Serializers ────────────────────────────────────────────────────────

class ArticleListSerializer(DynamicFieldsMixin, serializers.ModelSerializer):
    """Lightweight serializer for list views (public)."""
    thumbnailUrl = serializers.SerializerMethodField()
    authorName = serializers.SerializerMethodField()
    tagList = serializers.SerializerMethodField()
    publishedAt = serializers.DateTimeField(source='published_at', read_only=True)
    viewCount = serializers.IntegerField(source='view_count', read_only=True)

    class Meta:
        model = Article
        fields = (
            'id', 'title', 'slug', 'excerpt',
            'thumbnailUrl', 'category', 'status',
            'authorName', 'publishedAt', 'viewCount', 'tagList',
        )

    def get_thumbnailUrl(self, obj):
        if obj.thumbnail:
            return obj.thumbnail.get_full_url()
        return None

    def get_authorName(self, obj):
        if obj.author:
            return getattr(obj.author, 'full_name', '') or obj.author.email
        return None

    def get_tagList(self, obj):
        if obj.tags:
            return [t.strip() for t in obj.tags.split(',') if t.strip()]
        return []


class ArticleDetailSerializer(ArticleListSerializer):
    """Full article content for public detail view."""
    class Meta(ArticleListSerializer.Meta):
        fields = ArticleListSerializer.Meta.fields + ('content',)


def _article_content_has_text(value):
    text = unescape(strip_tags(value or '')).replace('\xa0', ' ').strip()
    return bool(text)


class AdminArticleSerializer(DynamicFieldsMixin, serializers.ModelSerializer):
    """Full CRUD serializer for admin."""
    thumbnailUrl = serializers.SerializerMethodField(read_only=True)
    authorDict = serializers.SerializerMethodField(read_only=True)
    tagList = serializers.SerializerMethodField(read_only=True)
    publishedAt = serializers.DateTimeField(source='published_at', required=False, allow_null=True)
    viewCount = serializers.IntegerField(source='view_count', read_only=True)

    class Meta:
        model = Article
        fields = (
            'id', 'title', 'slug', 'excerpt', 'content',
            'thumbnail', 'thumbnailUrl', 'category', 'status',
            'author', 'authorDict', 'viewCount', 'publishedAt',
            'tags', 'tagList', 'create_at', 'update_at',
        )
        read_only_fields = ('id', 'slug', 'viewCount', 'create_at', 'update_at', 'thumbnailUrl', 'authorDict', 'tagList')

    def get_thumbnailUrl(self, obj):
        if obj.thumbnail:
            return obj.thumbnail.get_full_url()
        return None

    def get_authorDict(self, obj):
        if obj.author:
            return {'id': obj.author.id, 'fullName': getattr(obj.author, 'full_name', '') or obj.author.email}
        return None

    def get_tagList(self, obj):
        if obj.tags:
            return [t.strip() for t in obj.tags.split(',') if t.strip()]
        return []

    def validate_content(self, value):
        if not _article_content_has_text(value):
            raise serializers.ValidationError('Content is required.')
        return value


class EmployerArticleSerializer(DynamicFieldsMixin, serializers.ModelSerializer):
    """Serializer for employer blog posts. Forces category=blog."""
    thumbnailUrl = serializers.SerializerMethodField(read_only=True)
    tagList = serializers.SerializerMethodField(read_only=True)
    publishedAt = serializers.DateTimeField(source='published_at', read_only=True)
    viewCount = serializers.IntegerField(source='view_count', read_only=True)
    statusDisplay = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Article
        fields = (
            'id', 'title', 'slug', 'excerpt', 'content',
            'thumbnail', 'thumbnailUrl', 'status', 'statusDisplay',
            'viewCount', 'publishedAt', 'tags', 'tagList',
            'create_at', 'update_at',
        )
        read_only_fields = ('id', 'slug', 'viewCount', 'publishedAt', 'create_at', 'update_at', 'status', 'statusDisplay')

    def get_thumbnailUrl(self, obj):
        if obj.thumbnail:
            return obj.thumbnail.get_full_url()
        return None

    def get_tagList(self, obj):
        if obj.tags:
            return [t.strip() for t in obj.tags.split(',') if t.strip()]
        return []

    def validate_content(self, value):
        if not _article_content_has_text(value):
            raise serializers.ValidationError('Content is required.')
        return value

    def create(self, validated_data):
        request = self.context['request']
        validated_data['author'] = request.user
        validated_data['category'] = Article.CATEGORY_BLOG
        validated_data['status'] = Article.STATUS_PENDING  # requires admin approval
        return super().create(validated_data)

    def update(self, instance, validated_data):
        # Reset to pending if content changed and was published
        if ('content' in validated_data or 'title' in validated_data):
            if instance.status == Article.STATUS_PUBLISHED:
                validated_data['status'] = Article.STATUS_PENDING
        return super().update(instance, validated_data)


# ─── ContactMessage Serializers ─────────────────────────────────────────────────

class ContactMessageSerializer(DynamicFieldsMixin, serializers.ModelSerializer):
    """Public serializer for creating contact messages (no auth required)."""

    category = serializers.ChoiceField(
        choices=ContactMessage.CATEGORY_CHOICES,
        required=False,
        default=ContactMessage.CATEGORY_BUG_REPORT,
    )
    subject = serializers.CharField(required=False, allow_blank=True, max_length=150)
    pageUrl = serializers.URLField(
        source='page_url',
        required=False,
        allow_blank=True,
        allow_null=True,
    )

    class Meta:
        model = ContactMessage
        fields = (
            'id', 'category', 'subject', 'pageUrl', 'name', 'email', 'phone', 'content',
            'create_at',
        )
        read_only_fields = ('id', 'create_at')


class AdminContactMessageSerializer(DynamicFieldsMixin, serializers.ModelSerializer):
    """Admin serializer for managing contact messages."""

    category = serializers.ChoiceField(
        choices=ContactMessage.CATEGORY_CHOICES,
        required=False,
    )
    subject = serializers.CharField(required=False, allow_blank=True, max_length=150)
    pageUrl = serializers.URLField(source='page_url', required=False, allow_blank=True, allow_null=True)

    class Meta:
        model = ContactMessage
        fields = (
            'id', 'category', 'subject', 'pageUrl', 'name', 'email', 'phone', 'content',
            'is_read', 'create_at', 'update_at',
        )
        read_only_fields = (
            'id', 'create_at', 'update_at',
            'name', 'email', 'phone', 'content',
        )
