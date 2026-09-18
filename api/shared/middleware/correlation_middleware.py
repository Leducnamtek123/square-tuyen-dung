import uuid
from typing import Callable
from django.http import HttpRequest, HttpResponse


class CorrelationIdMiddleware:
    """
    Middleware that captures or generates a correlation ID for every incoming HTTP request.
    Attaches the correlation ID to `request.correlation_id` and adds the `X-Correlation-Id`
    header to the outgoing response for end-to-end tracing.
    """

    HEADER_NAME = "HTTP_X_CORRELATION_ID"
    ALT_HEADER_NAME = "HTTP_X_REQUEST_ID"
    RESPONSE_HEADER = "X-Correlation-Id"

    def __init__(self, get_response: Callable[[HttpRequest], HttpResponse]):
        self.get_response = get_response

    def __call__(self, request: HttpRequest) -> HttpResponse:
        correlation_id = (
            request.META.get(self.HEADER_NAME)
            or request.META.get(self.ALT_HEADER_NAME)
            or str(uuid.uuid4())
        )
        request.correlation_id = correlation_id

        response = self.get_response(request)
        response[self.RESPONSE_HEADER] = correlation_id
        return response
