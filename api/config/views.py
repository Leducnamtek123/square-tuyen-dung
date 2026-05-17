from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from apps.accounts.permissions import IsAdminUser
from apps.content.system_settings import load_system_settings, update_system_settings
from shared.audit import record_audit_log


class SystemSettingsAPIView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        return Response(load_system_settings())

    def put(self, request):
        data = update_system_settings(request.data)
        record_audit_log(
            request=request,
            action="update",
            resource_type="config.SystemSettings",
            metadata={"keys": sorted(list(request.data.keys()))},
        )
        return Response(data, status=status.HTTP_200_OK)
