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

    permission_classes = [perms_custom.IsAdminUser]

    pagination_class = paginations.CustomPagination

    def get_serializer(self, *args, **kwargs):

        if self.action in ['list', 'retrieve']:

            kwargs['fields'] = ['id', 'name', 'iconUrl', 'appIconName', 'isHot', 'jobPostTotal', 'createAt', 'updateAt']

        return super().get_serializer(*args, **kwargs)

class AdminCityViewSet(viewsets.ModelViewSet):

    queryset = City.objects.all().order_by('id')

    serializer_class = CitySerializer

    permission_classes = [perms_custom.IsAdminUser]

    pagination_class = paginations.CustomPagination

class AdminDistrictViewSet(viewsets.ModelViewSet):

    queryset = District.objects.select_related('city').all().order_by('id')

    serializer_class = DistrictSerializer

    permission_classes = [perms_custom.IsAdminUser]

    pagination_class = paginations.CustomPagination

    filterset_fields = ['city']

class AdminWardViewSet(viewsets.ModelViewSet):

    queryset = Ward.objects.select_related('district').all().order_by('id')

    serializer_class = WardSerializer

    permission_classes = [perms_custom.IsAdminUser]

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

    try:

        # system

        gender_tuple = utils.convert_tuple_or_list_to_options(

            var_sys.GENDER_CHOICES)

        marital_status_tuple = utils.convert_tuple_or_list_to_options(

            var_sys.MARITAL_STATUS_CHOICES)

        language_tuple = utils.convert_tuple_or_list_to_options(

            var_sys.LANGUAGE_CHOICES)

        language_level_tuple = utils.convert_tuple_or_list_to_options(

            var_sys.LANGUAGE_LEVEL_CHOICES)

        position_tuple = utils.convert_tuple_or_list_to_options(

            var_sys.POSITION_CHOICES)

        type_of_workplace_tuple = utils.convert_tuple_or_list_to_options(

            var_sys.TYPE_OF_WORKPLACE_CHOICES)

        job_type_tuple = utils.convert_tuple_or_list_to_options(

            var_sys.JOB_TYPE_CHOICES)

        academic_level_tuple = utils.convert_tuple_or_list_to_options(

            var_sys.ACADEMIC_LEVEL)

        experience_tuple = utils.convert_tuple_or_list_to_options(

            var_sys.EXPERIENCE_CHOICES)

        employee_size_tuple = utils.convert_tuple_or_list_to_options(

            var_sys.EMPLOYEE_SIZE_CHOICES)

        application_status_tuple = utils.convert_tuple_or_list_to_options(

            var_sys.APPLICATION_STATUS)

        frequency_notification_tuple = utils.convert_tuple_or_list_to_options(

            var_sys.FREQUENCY_NOTIFICATION)

        job_post_status_tuple = utils.convert_tuple_or_list_to_options(

            var_sys.JOB_POST_STATUS)

        # database

        cities = City.objects.exclude(

            name__icontains=exclude_city_name).values_list("id", "name")

        careers = Career.objects.values_list("id", "name")

        city_tuple = utils.convert_tuple_or_list_to_options(cities)

        career_tuple = utils.convert_tuple_or_list_to_options(careers)

        gender_options = gender_tuple[0]

        marital_status_options = marital_status_tuple[0]

        language_options = language_tuple[0]

        language_level_options = language_level_tuple[0]

        position_options = position_tuple[0]

        type_of_workplace_options = type_of_workplace_tuple[0]

        job_type_options = job_type_tuple[0]

        experience_options = experience_tuple[0]

        academic_level_options = academic_level_tuple[0]

        employee_size_options = employee_size_tuple[0]

        application_status_options = application_status_tuple[0]

        city_options = city_tuple[0]

        career_options = career_tuple[0]

        frequency_notification_options = frequency_notification_tuple[0]

        job_post_status_options = job_post_status_tuple[0]

        gender_dict = gender_tuple[1]

        marital_status_dict = marital_status_tuple[1]

        language_dict = language_tuple[1]

        language_level_dict = language_level_tuple[1]

        position_dict = position_tuple[1]

        type_of_workplace_dict = type_of_workplace_tuple[1]

        job_type_dict = job_type_tuple[1]

        experience_dict = experience_tuple[1]

        academic_level_dict = academic_level_tuple[1]

        employee_size_dict = employee_size_tuple[1]

        application_status_dict = application_status_tuple[1]

        city_dict = city_tuple[1]

        career_dict = career_tuple[1]

        frequency_notification_dict = frequency_notification_tuple[1]

        job_post_status_dict = job_post_status_tuple[1]

        res_data = {

            "genderOptions": gender_options,

            "maritalStatusOptions": marital_status_options,

            "languageOptions": language_options,

            "languageLevelOptions": language_level_options,

            "positionOptions": position_options,

            "typeOfWorkplaceOptions": type_of_workplace_options,

            "jobTypeOptions": job_type_options,

            "experienceOptions": experience_options,

            "academicLevelOptions": academic_level_options,

            "employeeSizeOptions": employee_size_options,

            "applicationStatusOptions": application_status_options,

            "cityOptions": city_options,

            "careerOptions": career_options,

            "frequencyNotificationOptions": frequency_notification_options,

            "jobPostStatusOptions": job_post_status_options,

            "genderDict": gender_dict,

            "maritalStatusDict": marital_status_dict,

            "languageDict": language_dict,

            "languageLevelDict": language_level_dict,

            "positionDict": position_dict,

            "typeOfWorkplaceDict": type_of_workplace_dict,

            "jobTypeDict": job_type_dict,

            "experienceDict": experience_dict,

            "academicLevelDict": academic_level_dict,

            "employeeSizeDict": employee_size_dict,

            "applicationStatusDict": application_status_dict,

            "cityDict": city_dict,

            "careerDict": career_dict,

            "frequencyNotificationDict": frequency_notification_dict,

            "jobPostStatusDict": job_post_status_dict

        }

    except Exception as ex:

        helper.print_log_error(func_name="get_all_config", error=ex)

        return var_res.response_data(status=status.HTTP_500_INTERNAL_SERVER_ERROR,

                                     data=None)

    else:

        django_cache.set(CACHE_KEY, res_data, CACHE_TTL)
        return var_res.response_data(data=res_data)

@api_view(http_method_names=["GET"])
@permission_classes([AllowAny])
def get_districts(request):

    params = request.query_params

    city_id_raw = params.get('cityId', None)

    try:

        district_queryset = District.objects.all()

        if city_id_raw not in (None, ""):

            city_id = int(str(city_id_raw).strip())

            district_queryset = district_queryset.filter(city_id=city_id)

        districts = district_queryset.values_list("id", "name")

        district_options = utils.convert_tuple_or_list_to_options(districts)[0]

    except (TypeError, ValueError):

        # Invalid cityId should not break dependent forms.
        return var_res.response_data(data=[])

    except Exception as ex:

        helper.print_log_error(func_name="get_districts", error=ex)

        return var_res.response_data(status=status.HTTP_500_INTERNAL_SERVER_ERROR,

                                     data=None)

    else:

        return var_res.response_data(data=district_options)

@api_view(http_method_names=["GET"])
@permission_classes([AllowAny])
def get_wards(request):

    params = request.query_params

    district_id_raw = params.get('districtId', None)

    try:

        ward_queryset = Ward.objects.all()

        if district_id_raw not in (None, ""):

            district_id = int(str(district_id_raw).strip())

            ward_queryset = ward_queryset.filter(district_id=district_id)

        wards = ward_queryset.values_list("id", "name")

        ward_options = utils.convert_tuple_or_list_to_options(wards)[0]

    except (TypeError, ValueError):

        return var_res.response_data(data=[])

    except Exception as ex:

        helper.print_log_error(func_name="get_wards", error=ex)

        return var_res.response_data(status=status.HTTP_500_INTERNAL_SERVER_ERROR,

                                     data=None)

    else:

        return var_res.response_data(data=ward_options)

@api_view(http_method_names=["GET"])
@permission_classes([AllowAny])
def get_top_10_careers(request):

    try:
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
        except Exception:
            # Fallback path to keep homepage usable when aggregate query fails.
            queryset = list(Career.objects.all().order_by('id')[:10])

        serializer = CareerSerializer(
            queryset,
            many=True,
            fields=['id', 'name', 'iconUrl', 'isHot', 'jobPostTotal']
        )

    except Exception as ex:

        helper.print_log_error("get_top_careers", ex)

        return var_res.response_data(status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return var_res.response_data(data=serializer.data)

@api_view(http_method_names=["GET"])
@permission_classes([AllowAny])
def get_all_careers(request):

    try:

        paginator = paginations.CustomPagination()

        queryset = Career.objects

        kw = request.query_params.get("kw", None)

        if kw:

            queryset = queryset.filter(name__icontains=kw)

        queryset = queryset.all().order_by('id')

        page = paginator.paginate_queryset(queryset, request)

        if page is not None:

            serializer = CareerSerializer(page, many=True, fields=[

                                          'id', 'name', 'appIconName', 'isHot', 'jobPostTotal'])

            return paginator.get_paginated_response(serializer.data)

        serializer = CareerSerializer(queryset, many=True, fields=[

                                      'id', 'name', 'appIconName', 'isHot', 'jobPostTotal'])

        return var_res.response_data(data=serializer.data)

    except Exception as ex:

        helper.print_log_error("get_all_careers", ex)

        return var_res.response_data(status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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

    except:

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
            object_path = target.lstrip("/") if target else None

        if not object_path:
            if url and _is_allowed_public_minio_url(url):
                return var_res.response_data(data={"url": url})
            return var_res.response_data(
                status=status.HTTP_400_BAD_REQUEST,
                errors={"errorMessage": ["Unable to generate presigned URL."]},
                data=None,
            )

        from datetime import timedelta
        client = CloudinaryService._get_presign_client()
        presigned = client.presigned_get_object(
            bucket,
            object_path,
            expires=timedelta(seconds=expires),
        )
        presigned = CloudinaryService._rewrite_presigned_url(presigned)
        return var_res.response_data(data={"url": presigned})

    except Exception:
        # Fallback to original approach
        presigned, _ = CloudinaryService.get_url_from_public_id(target, {})
        if presigned:
            return var_res.response_data(data={"url": presigned})
        if url and _is_allowed_public_minio_url(url):
            return var_res.response_data(data={"url": url})
        return var_res.response_data(
            status=status.HTTP_400_BAD_REQUEST,
            errors={"errorMessage": ["Unable to generate presigned URL."]},
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
