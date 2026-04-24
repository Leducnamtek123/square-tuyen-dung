from rest_framework import serializers
from shared.serializers import DynamicFieldsMixin

from .models import (
    Feedback,
    Banner,
    BannerType,
    Article,
)

from apps.accounts import serializers as auth_serializers


class FeedbackSerializer(DynamicFieldsMixin, serializers.ModelSerializer):

    content = serializers.CharField(max_length=255)

    rating = serializers.IntegerField(default=5)

    isActive = serializers.BooleanField(source='is_active', default=False)

    userDict = auth_serializers.UserSerializer(
        source="user",
        fields=['id', 'fullName', 'avatarUrl'],
        read_only=True
    )

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
        for bool_field in ('is_show_button', 'is_active'):
            val = attrs.get(bool_field)
            if isinstance(val, str):
                attrs[bool_field] = val.lower() in ('true', '1', 'yes')
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
        read_only_fields = ('id', 'viewCount', 'create_at', 'update_at', 'thumbnailUrl', 'authorDict', 'tagList')

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
