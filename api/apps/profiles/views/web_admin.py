from rest_framework import viewsets

from apps.accounts import permissions as perms_custom
from shared import pagination as paginations

from ..models import Company, JobSeekerProfile, Resume
from ..serializers import CompanySerializer, JobSeekerProfileSerializer, ResumeSerializer


class AdminCompanyViewSet(viewsets.ModelViewSet):

    queryset = Company.objects.all().order_by('id')

    serializer_class = CompanySerializer

    permission_classes = [perms_custom.IsAdminUser]

    pagination_class = paginations.CustomPagination


class AdminJobSeekerProfileViewSet(viewsets.ModelViewSet):

    queryset = JobSeekerProfile.objects.all().order_by('id')

    serializer_class = JobSeekerProfileSerializer

    permission_classes = [perms_custom.IsAdminUser]

    pagination_class = paginations.CustomPagination


class AdminResumeViewSet(viewsets.ModelViewSet):

    queryset = Resume.objects.all().order_by('id')

    serializer_class = ResumeSerializer

    permission_classes = [perms_custom.IsAdminUser]

    pagination_class = paginations.CustomPagination

    lookup_field = 'id'
