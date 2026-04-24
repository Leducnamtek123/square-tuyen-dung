
from console.jobs import queue_notification

from django.conf import settings
from django.db import models

from shared.helpers import helper, utils

from shared import renderers
from shared import pagination as paginations
from shared.configs import variable_response as var_res, variable_system as var_sys, app_setting as app_set
from shared.configs.messages import NOTIFICATION_MESSAGES, ERROR_MESSAGES

from rest_framework.decorators import api_view, permission_classes

from rest_framework import status

from rest_framework import viewsets

from rest_framework import generics

from rest_framework import permissions as perms_sys

from .models import (
    Feedback,
    Banner,
    BannerType,
    Article,
)

from .serializers import (
    FeedbackSerializer,
    BannerSerializer,
    AdminBannerTypeSerializer,
    ArticleListSerializer,
    ArticleDetailSerializer,
    AdminArticleSerializer,
    EmployerArticleSerializer,
)


def get_banner_type_value_map():
    type_map = {
        str(item[1]).upper(): int(item[0]) for item in var_sys.BANNER_TYPE
    }
    db_types = BannerType.objects.all().values("code", "value")
    for row in db_types:
        code = str(row.get("code", "")).upper()
        value = row.get("value")
        if code and value is not None:
            type_map[code] = int(value)
    return type_map


class FeedbackViewSet(viewsets.ViewSet,

                      generics.CreateAPIView,

                      generics.ListAPIView):

    queryset = Feedback.objects.all()

    serializer_class = FeedbackSerializer

    renderer_classes = [renderers.MyJSONRenderer]

    def get_permissions(self):

        if self.action in ["create"]:

            return [perms_sys.IsAuthenticated()]

        return [perms_sys.AllowAny()]

    def list(self, request, *args, **kwargs):

        queryset = self.filter_queryset(self.get_queryset()

                                        .filter(is_active=True).order_by('-rating')[:10])

        serializer = self.get_serializer(queryset, many=True,

                                         fields=['id', 'content', 'rating', 'isActive', 'userDict'])

        return var_res.response_data(data=serializer.data)


@api_view(http_method_names=['post'])
@permission_classes([perms_sys.AllowAny])
def send_sms_download_app(request):

    data = request.data

    if "phone" not in data:

        return var_res.response_data(status=status.HTTP_400_BAD_REQUEST,

                                     errors={"phone": [ERROR_MESSAGES["PHONE_REQUIRED"]]})

    phone = data.get("phone")

    if not phone:

        return var_res.response_data(status=status.HTTP_400_BAD_REQUEST,

                                     errors={"phone": [ERROR_MESSAGES["INVALID_PHONE"]]})

    try:
        sms_response = "Mocked Response"

    except Exception as ex:

        helper.print_log_error("send_sms_download_app", ex)

        var_res.response_data(status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return var_res.response_data()


@api_view(http_method_names=['get'])
@permission_classes([perms_sys.AllowAny])
def get_web_banner(request):

    query_params = request.GET

    banner_type_options = get_banner_type_value_map()
    banner_type_param = str(query_params.get("type", "")).upper()
    banner_type = banner_type_options.get(banner_type_param, None)

    banner_queryset = Banner.objects.filter(is_active=True, platform="WEB")

    if banner_type:

        banner_queryset = banner_queryset.filter(type=banner_type)

    serializer = BannerSerializer(banner_queryset, many=True, fields=[

        "id", "imageUrl", "buttonText", "description",

        "buttonLink", "isShowButton", "descriptionLocation"

    ])

    return var_res.response_data(data=serializer.data)


@api_view(http_method_names=['get'])
@permission_classes([perms_sys.AllowAny])
def get_mobile_banner(request):

    banner_type_param = str(request.GET.get("type", "HOME")).upper()
    banner_type_options = get_banner_type_value_map()
    banner_type = banner_type_options.get(banner_type_param, None)
    if banner_type is None:
        return var_res.response_data(
            status=status.HTTP_400_BAD_REQUEST,
            errors={"type": ["Invalid banner type."]},
        )

    banner_queryset = Banner.objects.filter(is_active=True, platform="APP")
    banner_queryset = banner_queryset.filter(type=banner_type)

    serializer = BannerSerializer(banner_queryset, many=True, fields=[

        "id", "imageMobileUrl", "buttonText", "description",

        "buttonLink", "isShowButton", "descriptionLocation"

    ])

    return var_res.response_data(data=serializer.data)


@api_view(http_method_names=['post'])
@permission_classes([perms_sys.AllowAny])
def send_notification_demo(request):

    if settings.APP_ENVIRONMENT == app_set.ENV_PROD:

        return var_res.response_data(status=status.HTTP_403_FORBIDDEN)

    data = request.data

    title = data.get("title", "TEST")

    content = data.get('content', "TEST CONTENT")

    user_list = data.get('userList', [])

    notification_type = data.get("type", "SYSTEM")

    body_content = data.get('bodyContent', {})

    image_link = data.get("imageLink", None)

    queue_notification.add_notification_to_user.delay(

        title=title,

        content=content,

        type_name=notification_type,

        image=image_link,

        content_of_type=body_content,

        user_id_list=user_list

    )

    return var_res.response_data()


# ===== Admin ViewSets =====

class AdminBannerViewSet(viewsets.ModelViewSet):
    """Admin CRUD for Banners with MinIO image upload."""
    queryset = Banner.objects.all().select_related('image', 'image_mobile').order_by('-create_at')
    permission_classes = [perms_sys.IsAdminUser]
    renderer_classes = [renderers.MyJSONRenderer]
    pagination_class = paginations.CustomPagination

    def get_serializer_class(self):
        from .serializers import AdminBannerSerializer
        return AdminBannerSerializer

    def _handle_image_upload(self, file_obj, file_type, existing_file=None):
        """Upload image to MinIO and create/update File record."""
        from shared.helpers.cloudinary_service import CloudinaryService
        from apps.files.models import File

        folder = 'banners'
        upload_result = CloudinaryService.upload_image(file_obj, folder)
        if not upload_result:
            return None

        return File.update_or_create_file_with_cloudinary(
            existing_file, upload_result, file_type
        )

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        platform = request.GET.get('platform', None)
        banner_type = request.GET.get('type', None)
        is_active = request.GET.get('is_active', None)

        if platform:
            queryset = queryset.filter(platform=platform)
        if banner_type:
            queryset = queryset.filter(type=banner_type)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active in ['true', '1', 'True'])

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return var_res.response_data(data=serializer.data)

    def create(self, request, *args, **kwargs):
        from apps.files.models import File

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        banner = serializer.save()

        web_image = request.FILES.get('imageFile')
        if web_image:
            file_record = self._handle_image_upload(web_image, File.WEB_BANNER_TYPE)
            if file_record:
                banner.image = file_record
                banner.save()

        mobile_image = request.FILES.get('imageMobileFile')
        if mobile_image:
            file_record = self._handle_image_upload(mobile_image, File.MOBILE_BANNER_TYPE)
            if file_record:
                banner.image_mobile = file_record
                banner.save()

        banner.refresh_from_db()
        output = self.get_serializer(banner)
        return var_res.response_data(data=output.data)

    def update(self, request, *args, **kwargs):
        from apps.files.models import File

        banner = self.get_object()
        serializer = self.get_serializer(banner, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        web_image = request.FILES.get('imageFile')
        if web_image:
            file_record = self._handle_image_upload(web_image, File.WEB_BANNER_TYPE, banner.image)
            if file_record:
                banner.image = file_record
                banner.save()

        mobile_image = request.FILES.get('imageMobileFile')
        if mobile_image:
            file_record = self._handle_image_upload(mobile_image, File.MOBILE_BANNER_TYPE, banner.image_mobile)
            if file_record:
                banner.image_mobile = file_record
                banner.save()

        banner.refresh_from_db()
        output = self.get_serializer(banner)
        return var_res.response_data(data=output.data)


class AdminFeedbackViewSet(viewsets.ModelViewSet):
    """Admin management for Feedbacks."""
    queryset = Feedback.objects.all().select_related('user').order_by('-create_at')
    permission_classes = [perms_sys.IsAdminUser]
    renderer_classes = [renderers.MyJSONRenderer]
    pagination_class = paginations.CustomPagination

    def get_serializer_class(self):
        from .serializers import AdminFeedbackSerializer
        return AdminFeedbackSerializer

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        is_active = request.GET.get('is_active', None)
        rating = request.GET.get('rating', None)

        if is_active is not None:
            queryset = queryset.filter(is_active=is_active in ['true', '1', 'True'])
        if rating:
            queryset = queryset.filter(rating=int(rating))

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return var_res.response_data(data=serializer.data)


class AdminBannerTypeViewSet(viewsets.ModelViewSet):
    queryset = BannerType.objects.all().order_by('value')
    permission_classes = [perms_sys.IsAdminUser]
    renderer_classes = [renderers.MyJSONRenderer]
    pagination_class = paginations.CustomPagination
    serializer_class = AdminBannerTypeSerializer

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        kw = request.GET.get('kw') or request.GET.get('search')
        ordering = request.GET.get('ordering')
        is_active = request.GET.get('is_active', None)
        if kw:
            queryset = queryset.filter(
                models.Q(code__icontains=kw) | models.Q(name__icontains=kw)
            )
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active in ['true', '1', 'True'])
        if ordering:
            queryset = queryset.order_by(ordering)
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return var_res.response_data(data=serializer.data)

    def destroy(self, request, *args, **kwargs):
        banner_type = self.get_object()
        in_use = Banner.objects.filter(type=banner_type.value).exists()
        if in_use:
            return var_res.response_data(
                status=status.HTTP_400_BAD_REQUEST,
                errors={"detail": ["Cannot delete banner type that is in use."]},
            )
        return super().destroy(request, *args, **kwargs)


@api_view(http_method_names=['GET', 'PUT'])
@permission_classes([perms_sys.IsAdminUser])
def system_settings_view(request):
    """GET/PUT system settings (key-value store)."""
    from .models import SystemSetting

    DEFAULTS = {
        'maintenanceMode': ('false', 'Enable maintenance mode'),
        'autoApproveJobs': ('false', 'Auto-approve job posts'),
        'emailNotifications': ('true', 'Enable email notifications'),
    }

    if request.method == 'GET':
        for key, (default_val, desc) in DEFAULTS.items():
            SystemSetting.objects.get_or_create(
                key=key, defaults={'value': default_val, 'description': desc}
            )
        settings_qs = SystemSetting.objects.all()
        data = {}
        for s in settings_qs:
            if s.value.lower() in ('true', 'false'):
                data[s.key] = s.value.lower() == 'true'
            else:
                data[s.key] = s.value
        return var_res.response_data(data=data)

    elif request.method == 'PUT':
        for key, value in request.data.items():
            str_value = str(value).lower() if isinstance(value, bool) else str(value)
            SystemSetting.objects.update_or_create(
                key=key, defaults={'value': str_value}
            )
        return var_res.response_data()


# ===== Article ViewSets =====

class ArticlePublicViewSet(viewsets.ReadOnlyModelViewSet):
    """Public read-only access to published articles."""
    permission_classes = [perms_sys.AllowAny]
    renderer_classes = [renderers.MyJSONRenderer]
    pagination_class = paginations.CustomPagination
    lookup_field = 'slug'

    def get_queryset(self):
        qs = Article.objects.filter(status=Article.STATUS_PUBLISHED).select_related('author', 'thumbnail')
        category = self.request.GET.get('category')
        tag = self.request.GET.get('tag')
        search = self.request.GET.get('search') or self.request.GET.get('kw')
        if category:
            qs = qs.filter(category=category)
        if tag:
            qs = qs.filter(tags__icontains=tag)
        if search:
            qs = qs.filter(
                models.Q(title__icontains=search) | models.Q(excerpt__icontains=search)
            )
        return qs

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ArticleDetailSerializer
        return ArticleListSerializer

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # Increment view count
        Article.objects.filter(pk=instance.pk).update(view_count=models.F('view_count') + 1)
        instance.refresh_from_db()
        serializer = self.get_serializer(instance)
        return var_res.response_data(data=serializer.data)

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return var_res.response_data(data=serializer.data)


class AdminArticleViewSet(viewsets.ModelViewSet):
    """Admin full CRUD for articles (news + blog)."""
    queryset = Article.objects.all().select_related('author', 'thumbnail').order_by('-create_at')
    permission_classes = [perms_sys.IsAdminUser]
    renderer_classes = [renderers.MyJSONRenderer]
    pagination_class = paginations.CustomPagination
    serializer_class = AdminArticleSerializer
    lookup_field = 'pk'

    def get_queryset(self):
        qs = super().get_queryset()
        category = self.request.GET.get('category')
        status_filter = self.request.GET.get('status')
        search = self.request.GET.get('search') or self.request.GET.get('kw')
        if category:
            qs = qs.filter(category=category)
        if status_filter:
            qs = qs.filter(status=status_filter)
        if search:
            qs = qs.filter(
                models.Q(title__icontains=search) | models.Q(excerpt__icontains=search)
            )
        return qs

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return var_res.response_data(data=serializer.data)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        article = serializer.save(author=request.user if not request.data.get('author') else None)
        self._handle_thumbnail(request, article)
        article.refresh_from_db()
        return var_res.response_data(data=self.get_serializer(article).data)

    def update(self, request, *args, **kwargs):
        article = self.get_object()
        serializer = self.get_serializer(article, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        self._handle_thumbnail(request, article)
        article.refresh_from_db()
        return var_res.response_data(data=self.get_serializer(article).data)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return var_res.response_data(data=serializer.data)

    def _handle_thumbnail(self, request, article):
        from shared.helpers.cloudinary_service import CloudinaryService
        from apps.files.models import File
        thumb_file = request.FILES.get('thumbnailFile')
        if thumb_file:
            upload_result = CloudinaryService.upload_image(thumb_file, 'articles')
            if upload_result:
                file_record = File.update_or_create_file_with_cloudinary(
                    article.thumbnail, upload_result, 'ARTICLE_THUMBNAIL'
                )
                if file_record:
                    article.thumbnail = file_record
                    article.save()


class EmployerArticleViewSet(viewsets.ModelViewSet):
    """Employer CRUD for their own blog posts."""
    permission_classes = [perms_sys.IsAuthenticated]
    renderer_classes = [renderers.MyJSONRenderer]
    pagination_class = paginations.CustomPagination
    serializer_class = EmployerArticleSerializer
    lookup_field = 'pk'

    def get_queryset(self):
        qs = Article.objects.filter(
            category=Article.CATEGORY_BLOG,
            author=self.request.user
        ).select_related('thumbnail').order_by('-create_at')
        status_filter = self.request.GET.get('status')
        search = self.request.GET.get('search') or self.request.GET.get('kw')
        if status_filter:
            qs = qs.filter(status=status_filter)
        if search:
            qs = qs.filter(models.Q(title__icontains=search))
        return qs

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return var_res.response_data(data=serializer.data)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        article = serializer.save()
        self._handle_thumbnail(request, article)
        article.refresh_from_db()
        return var_res.response_data(data=self.get_serializer(article).data)

    def update(self, request, *args, **kwargs):
        article = self.get_object()
        if article.author != request.user:
            return var_res.response_data(status=status.HTTP_403_FORBIDDEN)
        serializer = self.get_serializer(article, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        self._handle_thumbnail(request, article)
        article.refresh_from_db()
        return var_res.response_data(data=self.get_serializer(article).data)

    def destroy(self, request, *args, **kwargs):
        article = self.get_object()
        if article.author != request.user:
            return var_res.response_data(status=status.HTTP_403_FORBIDDEN)
        article.delete()
        return var_res.response_data()

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return var_res.response_data(data=serializer.data)

    def _handle_thumbnail(self, request, article):
        from shared.helpers.cloudinary_service import CloudinaryService
        from apps.files.models import File
        thumb_file = request.FILES.get('thumbnailFile')
        if thumb_file:
            upload_result = CloudinaryService.upload_image(thumb_file, 'articles')
            if upload_result:
                file_record = File.update_or_create_file_with_cloudinary(
                    article.thumbnail, upload_result, 'ARTICLE_THUMBNAIL'
                )
                if file_record:
                    article.thumbnail = file_record
                    article.save()
