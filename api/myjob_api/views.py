from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from rest_framework import status
from django.conf import settings
import json

class SystemSettingsAPIView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        # For demo, return hardcoded settings
        # In real app, store in DB or settings
        data = {
            'maintenanceMode': getattr(settings, 'MAINTENANCE_MODE', False),
            'autoApproveJobs': getattr(settings, 'AUTO_APPROVE_JOBS', False),
            'emailNotifications': getattr(settings, 'EMAIL_NOTIFICATIONS', True),
        }
        return Response(data)

    def put(self, request):
        # For demo, just return success
        # In real app, update settings/DB
        return Response({'message': 'Settings updated'}, status=status.HTTP_200_OK)