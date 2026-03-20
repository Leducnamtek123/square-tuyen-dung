from rest_framework import viewsets

from apps.accounts import permissions as perms_custom

from ..models import Company, JobSeekerProfile, Resume
from ..serializers import CompanySerializer, JobSeekerProfileSerializer, ResumeSerializer


class AdminCompanyViewSet(viewsets.ModelViewSet):

    queryset = Company.objects.all().order_by('id')

    serializer_class = CompanySerializer

    permission_classes = [perms_custom.IsAdminUser]


class AdminJobSeekerProfileViewSet(viewsets.ModelViewSet):

    queryset = JobSeekerProfile.objects.all().order_by('id')

    serializer_class = JobSeekerProfileSerializer

    permission_classes = [perms_custom.IsAdminUser]


class AdminResumeViewSet(viewsets.ModelViewSet):

    queryset = Resume.objects.all().order_by('id')

    serializer_class = ResumeSerializer

    permission_classes = [perms_custom.IsAdminUser]

    lookup_field = 'id'
