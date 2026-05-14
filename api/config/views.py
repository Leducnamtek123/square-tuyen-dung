from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from apps.accounts.permissions import IsAdminUser
from apps.content.system_settings import load_system_settings, update_system_settings


class SystemSettingsAPIView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        return Response(load_system_settings())

    def put(self, request):
        return Response(update_system_settings(request.data), status=status.HTTP_200_OK)
