
from shared.configs import variable_response as var_res

from rest_framework import viewsets

from rest_framework import permissions as perms_sys

from apps.accounts import permissions as perms_custom

from rest_framework import status

from ..models import (

    JobSeekerProfile,

)

from ..serializers import (

    JobSeekerProfileSerializer,

)

class ProfileView(viewsets.ViewSet):

    def get_permissions(self):

        if self.action in ["get_profile_info",

                           "update_profile_info",

                           "get_profile_info_detail"]:

            return [perms_custom.IsJobSeekerUser()]

        return [perms_sys.IsAuthenticated()]

    def get_profile_info(self, request):

        user = request.user

        profile, _ = JobSeekerProfile.objects.select_related(
            'location', 'location__city', 'location__district', 'user'
        ).get_or_create(user_id=user.id)

        profile_serializer = JobSeekerProfileSerializer(profile)
        return var_res.response_data(data=profile_serializer.data)

    def update_profile_info(self, request):

        data = request.data

        job_seeker_profile = getattr(request.user, 'job_seeker_profile', None)
        if not job_seeker_profile:
            job_seeker_profile, _ = JobSeekerProfile.objects.get_or_create(user=request.user)

        serializer = JobSeekerProfileSerializer(job_seeker_profile, data=data, partial=True)
        if not serializer.is_valid():
            return var_res.response_data(
                status=status.HTTP_400_BAD_REQUEST,
                errors=serializer.errors,
            )

        serializer.save()
        return var_res.response_data(data=serializer.data)
