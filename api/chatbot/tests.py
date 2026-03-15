from django.test import TestCase
from rest_framework.test import APIClient

from chatbot.chat_responses.job_seeker_chat_response import JobSeekerChatResponse
from chatbot.chat_responses.employer_chat_response import EmployerChatResponse


class ChatbotWebhookTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_jobseeker_missing_intent_returns_error(self):
        response = self.client.post(
            "/api/chatbot/jobseeker/webhook/",
            data={"queryResult": {}},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("fulfillmentMessages", response.data)

    def test_jobseeker_welcome_intent(self):
        payload = {
            "queryResult": {
                "intent": {"displayName": JobSeekerChatResponse.WELCOME_INTENT}
            }
        }
        response = self.client.post(
            "/api/chatbot/jobseeker/webhook/",
            data=payload,
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("fulfillmentMessages", response.data)

    def test_employer_welcome_intent(self):
        payload = {
            "queryResult": {
                "intent": {"displayName": EmployerChatResponse.WELCOME_INTENT}
            }
        }
        response = self.client.post(
            "/api/chatbot/employer/webhook/",
            data=payload,
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("fulfillmentMessages", response.data)
