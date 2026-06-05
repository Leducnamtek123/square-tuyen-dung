from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.views import APIView

from apps.accounts import permissions as perms_custom
from shared.configs.variable_response import response_data

from .models import AgentMessage
from .serializers import AgentMessageSerializer, AgentThreadSerializer, AgentToolCallSerializer
from .services import AgentAssistantError, AgentAssistantService


class AgentToolsAPIView(APIView):
    permission_classes = [perms_custom.IsEmployerOrAdminUser]

    def get(self, request):
        return response_data(data={"tools": AgentAssistantService.tool_registry()})


class AgentThreadListCreateAPIView(APIView):
    permission_classes = [perms_custom.IsEmployerOrAdminUser]

    def get(self, request):
        threads = AgentAssistantService.thread_queryset(request)
        return response_data(data={"threads": AgentThreadSerializer(threads, many=True).data})

    def post(self, request):
        try:
            thread = AgentAssistantService.create_thread(request, portal=request.data.get("portal"))
        except AgentAssistantError as exc:
            return response_data(
                status=status.HTTP_400_BAD_REQUEST,
                errors={"portal": exc.message, "details": exc.details},
            )
        return response_data(status=status.HTTP_201_CREATED, data=AgentThreadSerializer(thread).data)


class AgentThreadDetailAPIView(APIView):
    permission_classes = [perms_custom.IsEmployerOrAdminUser]

    def get_thread(self, request, thread_id):
        return get_object_or_404(AgentAssistantService.thread_queryset(request), id=thread_id)

    def delete(self, request, thread_id):
        thread = self.get_thread(request, thread_id)
        thread.delete()
        return response_data(status=status.HTTP_204_NO_CONTENT)


class AgentThreadMessagesAPIView(APIView):
    permission_classes = [perms_custom.IsEmployerOrAdminUser]

    def get_thread(self, request, thread_id):
        return get_object_or_404(AgentAssistantService.thread_queryset(request), id=thread_id)

    def get(self, request, thread_id):
        thread = self.get_thread(request, thread_id)
        messages = AgentMessage.objects.filter(thread=thread).prefetch_related("tool_calls")
        return response_data(data={"messages": AgentMessageSerializer(messages, many=True).data})

    def post(self, request, thread_id):
        thread = self.get_thread(request, thread_id)
        try:
            result = AgentAssistantService.process_user_message(
                request,
                thread,
                request.data.get("content", ""),
            )
        except AgentAssistantError as exc:
            return response_data(
                status=status.HTTP_400_BAD_REQUEST,
                errors={"message": exc.message, "details": exc.details},
            )

        return response_data(
            data={
                "thread": AgentThreadSerializer(thread).data,
                "userMessage": AgentMessageSerializer(result.user_message).data,
                "assistantMessage": AgentMessageSerializer(result.assistant_message).data,
                "toolCalls": AgentToolCallSerializer(result.tool_calls, many=True).data,
            }
        )
