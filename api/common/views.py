from shared import pagination as paginations

from shared.configs import variable_system as var_sys

from shared.helpers import utils, helper

from shared.configs import variable_response as var_res

from django.db.models import Count

from rest_framework.decorators import api_view, permission_classes

from rest_framework.permissions import AllowAny, IsAuthenticated

from rest_framework import status

from rest_framework.response import Response

from django.db import connections

from django.db.utils import OperationalError

from redis import Redis

from django.conf import settings
from urllib.parse import urlparse

from django.core.cache import cache as django_cache
from apps.locations.models import City, District, Ward
from .models import Career

from .serializers import (

    CareerSerializer,

    CitySerializer,

    DistrictSerializer,

    WardSerializer,

    FileUploadSerializer

)

from apps.accounts import permissions as perms_custom
from shared.helpers.cloudinary_service import CloudinaryService

from rest_framework import viewsets

class AdminCareerViewSet(viewsets.ModelViewSet):

    queryset = Career.objects.all().order_by('id')

    serializer_class = CareerSerializer

    def get_permissions(self):
        return [perms_custom.IsAdminUser()]

    pagination_class = paginations.CustomPagination

    def get_serializer(self, *args, **kwargs):

        if self.action in ['list', 'retrieve']:

            kwargs['fields'] = ['id', 'name', 'iconUrl', 'appIconName', 'isHot', 'jobPostTotal', 'createAt', 'updateAt']

        return super().get_serializer(*args, **kwargs)

class AdminCityViewSet(viewsets.ModelViewSet):

    queryset = City.objects.all().order_by('id')

    serializer_class = CitySerializer

    def get_permissions(self):
        return [perms_custom.IsAdminUser()]

    pagination_class = paginations.CustomPagination

class AdminDistrictViewSet(viewsets.ModelViewSet):

    queryset = District.objects.select_related('city').all().order_by('id')

    serializer_class = DistrictSerializer

    def get_permissions(self):
        return [perms_custom.IsAdminUser()]

    pagination_class = paginations.CustomPagination

    filterset_fields = ['city']

class AdminWardViewSet(viewsets.ModelViewSet):

    queryset = Ward.objects.select_related('district').all().order_by('id')

    serializer_class = WardSerializer

    def get_permissions(self):
        return [perms_custom.IsAdminUser()]

    pagination_class = paginations.CustomPagination

    filterset_fields = ['district']

@api_view(http_method_names=["GET"])
@permission_classes([AllowAny])
def get_all_config(request):

    CACHE_KEY = 'common_all_config'
    CACHE_TTL = 300  # 5 minutes

    cached = django_cache.get(CACHE_KEY)
    if cached is not None:
        return var_res.response_data(data=cached)

    exclude_city_name = 'Toàn quốc'

    # system
    gender_tuple = utils.convert_tuple_or_list_to_options(var_sys.GENDER_CHOICES)
    marital_status_tuple = utils.convert_tuple_or_list_to_options(var_sys.MARITAL_STATUS_CHOICES)
    language_tuple = utils.convert_tuple_or_list_to_options(var_sys.LANGUAGE_CHOICES)
    language_level_tuple = utils.convert_tuple_or_list_to_options(var_sys.LANGUAGE_LEVEL_CHOICES)
    position_tuple = utils.convert_tuple_or_list_to_options(var_sys.POSITION_CHOICES)
    type_of_workplace_tuple = utils.convert_tuple_or_list_to_options(var_sys.TYPE_OF_WORKPLACE_CHOICES)
    job_type_tuple = utils.convert_tuple_or_list_to_options(var_sys.JOB_TYPE_CHOICES)
    academic_level_tuple = utils.convert_tuple_or_list_to_options(var_sys.ACADEMIC_LEVEL)
    experience_tuple = utils.convert_tuple_or_list_to_options(var_sys.EXPERIENCE_CHOICES)
    employee_size_tuple = utils.convert_tuple_or_list_to_options(var_sys.EMPLOYEE_SIZE_CHOICES)
    application_status_tuple = utils.convert_tuple_or_list_to_options(var_sys.APPLICATION_STATUS)
    frequency_notification_tuple = utils.convert_tuple_or_list_to_options(var_sys.FREQUENCY_NOTIFICATION)
    job_post_status_tuple = utils.convert_tuple_or_list_to_options(var_sys.JOB_POST_STATUS)

    # database
    cities = City.objects.exclude(name__icontains=exclude_city_name).values_list("id", "name")
    careers = Career.objects.values_list("id", "name")
    city_tuple = utils.convert_tuple_or_list_to_options(cities)
    career_tuple = utils.convert_tuple_or_list_to_options(careers)

    res_data = {
        "genderOptions": gender_tuple[0],
        "maritalStatusOptions": marital_status_tuple[0],
        "languageOptions": language_tuple[0],
        "languageLevelOptions": language_level_tuple[0],
        "positionOptions": position_tuple[0],
        "typeOfWorkplaceOptions": type_of_workplace_tuple[0],
        "jobTypeOptions": job_type_tuple[0],
        "experienceOptions": experience_tuple[0],
        "academicLevelOptions": academic_level_tuple[0],
        "employeeSizeOptions": employee_size_tuple[0],
        "applicationStatusOptions": application_status_tuple[0],
        "cityOptions": city_tuple[0],
        "careerOptions": career_tuple[0],
        "frequencyNotificationOptions": frequency_notification_tuple[0],
        "jobPostStatusOptions": job_post_status_tuple[0],
        "genderDict": gender_tuple[1],
        "maritalStatusDict": marital_status_tuple[1],
        "languageDict": language_tuple[1],
        "languageLevelDict": language_level_tuple[1],
        "positionDict": position_tuple[1],
        "typeOfWorkplaceDict": type_of_workplace_tuple[1],
        "jobTypeDict": job_type_tuple[1],
        "experienceDict": experience_tuple[1],
        "academicLevelDict": academic_level_tuple[1],
        "employeeSizeDict": employee_size_tuple[1],
        "applicationStatusDict": application_status_tuple[1],
        "cityDict": city_tuple[1],
        "careerDict": career_tuple[1],
        "frequencyNotificationDict": frequency_notification_tuple[1],
        "jobPostStatusDict": job_post_status_tuple[1],
    }

    django_cache.set(CACHE_KEY, res_data, CACHE_TTL)
    return var_res.response_data(data=res_data)

@api_view(http_method_names=["GET"])
@permission_classes([AllowAny])
def get_districts(request):

    params = request.query_params

    city_id_raw = params.get('cityId', None)

    district_queryset = District.objects.all()

    try:
        if city_id_raw not in (None, ""):
            city_id = int(str(city_id_raw).strip())
            district_queryset = district_queryset.filter(city_id=city_id)
    except (TypeError, ValueError):

        # Invalid cityId should not break dependent forms.
        return var_res.response_data(data=[])

    districts = district_queryset.values_list("id", "name")
    district_options = utils.convert_tuple_or_list_to_options(districts)[0]
    return var_res.response_data(data=district_options)

@api_view(http_method_names=["GET"])
@permission_classes([AllowAny])
def get_wards(request):

    params = request.query_params

    district_id_raw = params.get('districtId', None)

    ward_queryset = Ward.objects.all()

    try:
        if district_id_raw not in (None, ""):
            district_id = int(str(district_id_raw).strip())
            ward_queryset = ward_queryset.filter(district_id=district_id)
    except (TypeError, ValueError):

        return var_res.response_data(data=[])

    wards = ward_queryset.values_list("id", "name")
    ward_options = utils.convert_tuple_or_list_to_options(wards)[0]
    return var_res.response_data(data=ward_options)

@api_view(http_method_names=["GET"])
@permission_classes([AllowAny])
def get_top_10_careers(request):
    try:
        hot_qs = Career.objects.filter(is_hot=True).annotate(
            num_job_posts=Count('job_posts')
        ).order_by('-num_job_posts', 'id')
        hot_ids = list(hot_qs.values_list('id', flat=True))

        remaining = max(0, 10 - len(hot_ids))
        normal_qs = Career.objects.exclude(id__in=hot_ids).annotate(
            num_job_posts=Count('job_posts')
        ).order_by('-num_job_posts', 'id')[:remaining]

        queryset = list(hot_qs[:10]) + list(normal_qs)
    except Exception as ex:
        helper.print_log_error("get_top_careers_fallback", ex)
        # Fallback path to keep homepage usable when aggregate query fails.
        queryset = list(Career.objects.all().order_by('id')[:10])

    serializer = CareerSerializer(
        queryset,
        many=True,
        fields=['id', 'name', 'iconUrl', 'isHot', 'jobPostTotal']
    )

    return var_res.response_data(data=serializer.data)

@api_view(http_method_names=["GET"])
@permission_classes([AllowAny])
def get_all_careers(request):
    paginator = paginations.CustomPagination()
    queryset = Career.objects

    kw = request.query_params.get("kw", None)
    if kw:
        queryset = queryset.filter(name__icontains=kw)

    queryset = queryset.all().order_by('id')
    page = paginator.paginate_queryset(queryset, request)

    if page is not None:
        serializer = CareerSerializer(page, many=True, fields=[
            'id', 'name', 'appIconName', 'isHot', 'jobPostTotal'
        ])
        return paginator.get_paginated_response(serializer.data)

    serializer = CareerSerializer(queryset, many=True, fields=[
        'id', 'name', 'appIconName', 'isHot', 'jobPostTotal'
    ])
    return var_res.response_data(data=serializer.data)

@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):

    # Check database connection

    try:

        db_conn = connections['default']

        db_conn.cursor()

        db_status = True

    except OperationalError:

        db_status = False

    # Test Redis connection

    try:

        redis_client = Redis(

            host=settings.SERVICE_REDIS_HOST,

            port=settings.SERVICE_REDIS_PORT,

            db=settings.SERVICE_REDIS_DB,

            password=settings.SERVICE_REDIS_PASSWORD,

        )

        redis_status = redis_client.ping()

    except Exception:

        redis_status = False

    # Overall status

    is_healthy = all([db_status, redis_status])

    response_data = {

        "status": "healthy" if is_healthy else "unhealthy",

        "database": "connected" if db_status else "disconnected",

        "redis": "connected" if redis_status else "disconnected",

    }

    status_code = status.HTTP_200_OK if is_healthy else status.HTTP_503_SERVICE_UNAVAILABLE

    return Response(response_data, status=status_code)

@api_view(["GET"])
@permission_classes([AllowAny])
def presign_url(request):
    """
    Return a presigned URL for a MinIO object.
    Accepts either `url` (full URL) or `publicId` (object key).

    This endpoint ALWAYS generates a presigned URL, regardless of the
    MINIO_USE_PRESIGNED setting, because generating a presigned URL is
    exactly what it is supposed to do.
    """
    url = request.query_params.get("url", None)
    public_id = request.query_params.get("publicId", None)

    if not url and not public_id:
        return var_res.response_data(
            status=status.HTTP_400_BAD_REQUEST,
            errors={"errorMessage": ["Missing url or publicId."]},
            data=None,
        )

    target = url or public_id
    bucket = settings.MINIO_BUCKET
    base_url = getattr(settings, "MINIO_PUBLIC_URL", "").rstrip("/")
    expires = getattr(settings, "MINIO_PRESIGN_EXPIRES", 3600)

    try:
        object_path = None

        if isinstance(target, str) and (target.startswith("http://") or target.startswith("https://")):
            parsed = urlparse(target)
            # Extract object path from public URL (e.g. https://s3.domain.com/bucket/path)
            if base_url and target.startswith(f"{base_url}/"):
                object_path = target[len(base_url) + 1:]
                if object_path.startswith(f"{bucket}/"):
                    object_path = object_path[len(bucket) + 1:]
            else:
                # Try internal host match
                internal_host = str(getattr(settings, "MINIO_ENDPOINT", "minio")).replace("http://", "").replace("https://", "").split("/")[0]
                internal_host = internal_host.split(":")[0] if internal_host else "minio"
                if parsed.hostname in ("minio", internal_host):
                    object_path = parsed.path.lstrip("/")
                    if object_path.startswith(f"{bucket}/"):
                        object_path = object_path[len(bucket) + 1:]
        else:
            # Plain public_id
            object_path = str(target).lstrip("/") if target else None

        if not object_path:
            if url and _is_allowed_public_minio_url(url):
                return var_res.response_data(data={"url": url})
            return var_res.response_data(
                status=status.HTTP_400_BAD_REQUEST,
                errors={"errorMessage": ["Unable to generate presigned URL. Path identify failed."]},
                data=None,
            )

        from datetime import timedelta
        # Ensure expires is an int to prevent TypeError
        try:
            val_expires = int(expires)
        except (TypeError, ValueError):
            val_expires = 3600
            
        client = CloudinaryService._get_presign_client()
        presigned = client.presigned_get_object(
            bucket,
            object_path,
            expires=timedelta(seconds=val_expires),
        )
        presigned = CloudinaryService._rewrite_presigned_url(presigned)
        return var_res.response_data(data={"url": presigned})

    except Exception as e:
        helper.print_log_error(func_name="presign_url", error=e)
        # Fallback to original approach
        try:
            presigned, _ = CloudinaryService.get_url_from_public_id(target, {})
            if presigned:
                return var_res.response_data(data={"url": presigned})
        except Exception as e2:
            helper.print_log_error(func_name="presign_url_fallback", error=e2)

        if url and _is_allowed_public_minio_url(url):
            return var_res.response_data(data={"url": url})
            
        return var_res.response_data(
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            errors={"errorMessage": ["Internal error generating presigned URL."]},
            data=None,
        )


def _is_allowed_public_minio_url(value: str) -> bool:
    try:
        parsed = urlparse(value)
        if parsed.scheme not in ("http", "https"):
            return False

        public_base = getattr(settings, "MINIO_PUBLIC_URL", "").rstrip("/")
        if public_base and value.startswith(f"{public_base}/"):
            return True

        server_url = getattr(settings, "MINIO_SERVER_URL", "").rstrip("/")
        if server_url and value.startswith(f"{server_url}/"):
            return True

        return False
    except Exception:
        return False

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def upload_file(request):
    serializer = FileUploadSerializer(data=request.data)
    if serializer.is_valid():
        from apps.files.models import File
        from django.conf import settings
        from rest_framework import status
        
        file_obj = serializer.validated_data['file']
        file_type = serializer.validated_data['file_type']
        
        # Determine folder based on file type
        folder = "chat_attachments"
        if file_type == File.AVATAR_TYPE:
            folder = settings.CLOUDINARY_DIRECTORY.get("avatar", "avatar/")
        elif file_type == File.CV_TYPE:
            folder = settings.CLOUDINARY_DIRECTORY.get("cv", "cv/")
        elif file_type == File.LOGO_TYPE:
            folder = settings.CLOUDINARY_DIRECTORY.get("logo", "logo/")
            
        upload_result = CloudinaryService.upload_file(file_obj, folder)
        
        if upload_result:
            file_instance = File.update_or_create_file_with_cloudinary(
                None,
                upload_result,
                file_type
            )
            return var_res.response_data(data={
                "id": file_instance.id,
                "url": file_instance.get_full_url(),
                "name": file_obj.name,
                "format": upload_result.get("format"),
                "bytes": upload_result.get("bytes")
            })
        return var_res.response_data(status=status.HTTP_500_INTERNAL_SERVER_ERROR, errors={"errorMessage": ["Upload failed."]})
    
    return var_res.response_data(status=status.HTTP_400_BAD_REQUEST, errors=serializer.errors)
