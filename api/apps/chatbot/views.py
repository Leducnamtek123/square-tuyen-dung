"""Chatbot webhook views kept for backward compatibility and tests."""

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from apps.chatbot.chat_responses.employer_chat_response import EmployerChatResponse
from apps.chatbot.chat_responses.job_seeker_chat_response import JobSeekerChatResponse


def _extract_intent_name(payload):
    query_result = payload.get("queryResult", {}) if isinstance(payload, dict) else {}
    intent = query_result.get("intent", {}) if isinstance(query_result, dict) else {}
    return intent.get("displayName")


@api_view(["POST"])
@permission_classes([AllowAny])
def jobseeker_webhook(request):
    chatbot = JobSeekerChatResponse()
    intent_name = _extract_intent_name(request.data)
    if intent_name == JobSeekerChatResponse.WELCOME_INTENT:
        return Response(chatbot.get_welcome_intent_response())
    return Response({
        "fulfillmentMessages": [
            {"text": {"text": ["Không xác định được intent hợp lệ."]}}
        ]
    })


@api_view(["POST"])
@permission_classes([AllowAny])
def employer_webhook(request):
    chatbot = EmployerChatResponse()
    intent_name = _extract_intent_name(request.data)
    if intent_name == EmployerChatResponse.WELCOME_INTENT:
        return Response(chatbot.get_welcome_intent_response())
    return Response({
        "fulfillmentMessages": [
            {"text": {"text": ["Không xác định được intent hợp lệ."]}}
        ]
    })
