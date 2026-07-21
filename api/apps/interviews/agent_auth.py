from __future__ import annotations

import hashlib
import hmac
import time

from django.conf import settings
from django.http import JsonResponse


TIMESTAMP_HEADER = "HTTP_X_SQUARE_AGENT_TIMESTAMP"
SIGNATURE_HEADER = "HTTP_X_SQUARE_AGENT_SIGNATURE"


def _auth_required() -> bool:
    secret = str(getattr(settings, "INTERVIEW_AGENT_SHARED_SECRET", "") or "")
    required = bool(getattr(settings, "INTERVIEW_AGENT_AUTH_REQUIRED", False))
    return bool(secret and required)


def build_signature(secret: str, method: str, path: str, timestamp: str, body: bytes) -> str:
    body_digest = hashlib.sha256(body or b"").hexdigest()
    message = "\n".join([method.upper(), path, timestamp, body_digest]).encode("utf-8")
    return hmac.new(secret.encode("utf-8"), message, hashlib.sha256).hexdigest()


def verify_interview_agent_request(request):
    """Return None when the request is accepted, otherwise a 401 JsonResponse."""
    if not _auth_required():
        return None

    django_request = getattr(request, "_request", request)
    secret = str(settings.INTERVIEW_AGENT_SHARED_SECRET)
    timestamp = django_request.META.get(TIMESTAMP_HEADER, "")
    signature = django_request.META.get(SIGNATURE_HEADER, "")
    if not timestamp or not signature:
        return JsonResponse({"detail": "Missing agent authentication headers."}, status=401)

    try:
        sent_at = int(timestamp)
    except (TypeError, ValueError):
        return JsonResponse({"detail": "Invalid agent authentication timestamp."}, status=401)

    allowed_skew = int(getattr(settings, "INTERVIEW_AGENT_AUTH_MAX_SKEW_SECONDS", 300))
    if abs(int(time.time()) - sent_at) > allowed_skew:
        return JsonResponse({"detail": "Expired agent authentication timestamp."}, status=401)

    expected = build_signature(
        secret,
        django_request.method,
        django_request.path,
        timestamp,
        django_request.body or b"",
    )
    if not hmac.compare_digest(expected, signature):
        return JsonResponse({"detail": "Invalid agent authentication signature."}, status=401)

    return None
