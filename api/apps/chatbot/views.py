"""Chatbot webhook views kept for backward compatibility and tests."""

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from apps.chatbot.services import EmployerDialogFlowService, JobSeekerDialogFlowService


@api_view(["POST"])
@permission_classes([AllowAny])
def jobseeker_webhook(request):
    return Response(JobSeekerDialogFlowService().handle_request(request.data))


@api_view(["POST"])
@permission_classes([AllowAny])
def employer_webhook(request):
    return Response(EmployerDialogFlowService().handle_request(request.data))
