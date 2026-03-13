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
    body_text = raw_body.decode("utf-8") if isinstance(raw_body, (bytes, bytearray)) else str(raw_body)
    api_key = os.getenv("LIVEKIT_API_KEY", "")
    api_secret = os.getenv("LIVEKIT_API_SECRET", "")
    auth_header = request.headers.get("Authorization") or request.META.get("HTTP_AUTHORIZATION", "")
    auth_token = auth_header.strip()
    if auth_token.lower().startswith("bearer "):
        auth_token = auth_token[7:].strip()

    verified = False
    if api_key and api_secret:
        try:
            # Prefer LiveKit's verifier if the package is available.
            from livekit import api  # type: ignore

            receiver = api.WebhookReceiver(api.TokenVerifier(api_key, api_secret))
            event = receiver.receive(body_text, auth_token)
            verified = True
            payload = event  # already parsed by receiver
        except Exception as exc:
            logger.warning("LiveKit webhook verification failed: %s", exc)
            payload = _parse_json(raw_body)
    else:
        payload = _parse_json(raw_body)

    if not verified:
        logger.info("LiveKit webhook received without verification.")

    # Best-effort log to help debug disconnects even when enum parsing fails.
    if isinstance(payload, dict):
        event_name = payload.get("event") or payload.get("eventName")
        participant = payload.get("participant") or {}
        if isinstance(participant, dict):
            disconnect_reason = participant.get("disconnectReason")
            participant_identity = participant.get("identity")
        else:
            disconnect_reason = None
            participant_identity = None

        if event_name or disconnect_reason or participant_identity:
            logger.info(
                "LiveKit webhook event=%s participant=%s disconnectReason=%s",
                event_name,
                participant_identity,
                disconnect_reason,
            )

    # TODO: handle events if needed. For now, just acknowledge.
    return JsonResponse({"ok": True}, status=200)
