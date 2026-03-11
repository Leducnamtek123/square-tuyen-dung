import json
import logging
import os
from typing import Any

from django.http import HttpRequest, JsonResponse
from django.views.decorators.csrf import csrf_exempt

logger = logging.getLogger("livekit.webhook")


def _parse_json(raw: bytes) -> dict[str, Any]:
    if not raw:
        return {}
    try:
        return json.loads(raw.decode("utf-8"))
    except Exception:
        return {}


@csrf_exempt
def livekit_webhook(request: HttpRequest):
    """
    POST /api/livekit/webhook
    Receives LiveKit webhook events.
    Verifies signature when livekit-api helpers are available and secret is set.
    """
    if request.method != "POST":
        return JsonResponse({"detail": "Method not allowed."}, status=405)

    raw_body = request.body or b""
    secret = os.getenv("LIVEKIT_API_SECRET", "")
    auth_header = request.headers.get("Authorization") or request.META.get("HTTP_AUTHORIZATION", "")

    verified = False
    if secret:
        try:
            # Prefer LiveKit's verifier if the package is available.
            from livekit import api  # type: ignore

            receiver = api.WebhookReceiver(secret)
            event = receiver.receive(raw_body, auth_header)
            verified = True
            payload = event  # already parsed by receiver
        except Exception as exc:
            logger.warning("LiveKit webhook verification failed: %s", exc)
            payload = _parse_json(raw_body)
    else:
        payload = _parse_json(raw_body)

    if not verified:
        logger.info("LiveKit webhook received without verification.")

    # TODO: handle events if needed. For now, just acknowledge.
    return JsonResponse({"ok": True}, status=200)
