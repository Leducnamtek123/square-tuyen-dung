from rest_framework.views import APIView

from rest_framework import status
from rest_framework.permissions import AllowAny

from rest_framework.response import Response

from chatbot.services import JobSeekerDialogFlowService, EmployerDialogFlowService


class JobSeekerDialogFlowWebhookView(APIView):
    permission_classes = [AllowAny]
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.service = JobSeekerDialogFlowService()

    def post(self, request):
        try:
            res = self.service.handle_request(request.data)
            return Response(status=status.HTTP_200_OK, data=res)
        except Exception as e:
            print(f"[JobSeekerDialogFlowWebhookView] Error when processing: {e}")
            res = self.service.job_seeker_chat_response.get_error_intent_response()
            return Response(status=status.HTTP_200_OK, data=res)


class EmployerDialogFlowWebhookView(APIView):
    permission_classes = [AllowAny]
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.service = EmployerDialogFlowService()

    def post(self, request):
        try:
            res = self.service.handle_request(request.data)
            return Response(status=status.HTTP_200_OK, data=res)
        except Exception as e:
            print(f"[EmployerDialogFlowWebhookView] Error when processing: {e}")
            res = self.service.employer_chat_response.get_error_intent_response()
            return Response(status=status.HTTP_200_OK, data=res)
