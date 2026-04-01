
from console.jobs import queue_notification

# from infobip_channels.sms.channel import SMSChannel

from django.conf import settings

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

    Banner

)

from .serializers import (

    FeedbackSerializer,

    BannerSerializer

)

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

        # Initialize the SMS channel with your credentials.

        # channel = SMSChannel.from_auth_params(

        #         "base_url": settings.SMS_BASE_URL,

        #         "api_key": settings.SMS_API_KEY,

        # # Send a message with the desired fields.

        # sms_response = channel.send_sms_message(

        #         "messages": [

        #                 "destinations": [{"to": phone}],

        #                 "text": NOTIFICATION_MESSAGES["DOWNLOAD_APP_MESSAGE"].format(

        #                     company_name=settings.COMPANY_NAME,

        #                     link_google_play=var_sys.LINK_GOOGLE_PLAY,

        #                     link_appstore=var_sys.LINK_APPSTORE

        sms_response = "Mocked Response"

    except Exception as ex:

        helper.print_log_error("send_sms_download_app", ex)

        var_res.response_data(status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return var_res.response_data()

@api_view(http_method_names=['get'])
@permission_classes([perms_sys.AllowAny])
def get_web_banner(request):

    query_params = request.GET

    # Get banner type options

    banner_type_options = {item[1]: item[0] for item in var_sys.BANNER_TYPE}

    banner_type_param = query_params.get("type", None)  

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

    banner_type = request.GET.get("type", "HOME")

    if banner_type not in [x[1] for x in var_sys.BANNER_TYPE]:

        return var_res.response_data(status=status.HTTP_400_BAD_REQUEST)

    banner_queryset = Banner.objects.filter(is_active=True, platform="APP")

    serializer = BannerSerializer(banner_queryset, many=True, fields=[

        "id", "imageMobileUrl", "buttonText", "description",

        "buttonLink", "isShowButton", "descriptionLocation"

    ])

    return var_res.response_data(data=serializer.data)

@api_view(http_method_names=['post'])
@permission_classes([perms_sys.AllowAny])
def send_notification_demo(request):

    # Only allow in development environment

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

        # Handle web image upload
        web_image = request.FILES.get('imageFile')
        if web_image:
            file_record = self._handle_image_upload(
                web_image, File.WEB_BANNER_TYPE
            )
            if file_record:
                banner.image = file_record
                banner.save()

        # Handle mobile image upload
        mobile_image = request.FILES.get('imageMobileFile')
        if mobile_image:
            file_record = self._handle_image_upload(
                mobile_image, File.MOBILE_BANNER_TYPE
            )
            if file_record:
                banner.image_mobile = file_record
                banner.save()

        # Re-serialize with image URLs
        banner.refresh_from_db()
        output = self.get_serializer(banner)
        return var_res.response_data(data=output.data)

    def update(self, request, *args, **kwargs):
        from apps.files.models import File

        banner = self.get_object()
        serializer = self.get_serializer(banner, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        # Handle web image upload
        web_image = request.FILES.get('imageFile')
        if web_image:
            file_record = self._handle_image_upload(
                web_image, File.WEB_BANNER_TYPE, banner.image
            )
            if file_record:
                banner.image = file_record
                banner.save()

        # Handle mobile image upload
        mobile_image = request.FILES.get('imageMobileFile')
        if mobile_image:
            file_record = self._handle_image_upload(
                mobile_image, File.MOBILE_BANNER_TYPE, banner.image_mobile
            )
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
        # Ensure defaults exist
        for key, (default_val, desc) in DEFAULTS.items():
            SystemSetting.objects.get_or_create(
                key=key, defaults={'value': default_val, 'description': desc}
            )
        settings_qs = SystemSetting.objects.all()
        data = {}
        for s in settings_qs:
            # Convert string booleans
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
