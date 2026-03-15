import json
import logging
import os
from typing import Any

from django.http import HttpRequest, JsonResponse
from django.views.decorators.csrf import csrf_exempt

from interview.models import InterviewSession
from interview.services import update_interview_status

logger = logging.getLogger("livekit.webhook")

def _parse_json(raw: bytes) -> dict[str, Any]:
    if not raw:
        return {}
    try:
        return json.loads(raw.decode("utf-8"))
    except Exception:
        return {}

def _extract_room_name(payload: dict[str, Any]) -> str | None:
    for key in ("roomName", "room_name", "room"):
        value = payload.get(key)
        if isinstance(value, str) and value:
            return value

    room = payload.get("room")
    if isinstance(room, dict):
        for key in ("name", "roomName", "room_name"):
            value = room.get(key)
            if isinstance(value, str) and value:
                return value

    return None

def _extract_recording_url(payload: dict[str, Any]) -> str | None:
    candidates = []
    for key in ("recording_url", "recordingUrl", "recordingURL", "file_url", "fileUrl", "url", "downloadUrl"):
        value = payload.get(key)
        if isinstance(value, str):
            candidates.append(value)

    for key in ("egressInfo", "egress", "recording"):
        node = payload.get(key)
        if isinstance(node, dict):
            for sub_key in ("file", "output", "recording"):
                sub = node.get(sub_key)
                if isinstance(sub, dict):
                    for url_key in ("location", "url", "fileUrl", "file_url", "downloadUrl"):
                        value = sub.get(url_key)
                        if isinstance(value, str):
                            candidates.append(value)
            for url_key in ("location", "url", "fileUrl", "file_url", "downloadUrl"):
                value = node.get(url_key)
                if isinstance(value, str):
                    candidates.append(value)

    for value in candidates:
        if value:
            return value

    return None

def _handle_livekit_event(payload: dict[str, Any]) -> None:
    event_name = payload.get("event") or payload.get("eventName") or ""
    event = str(event_name).lower()
    room_name = _extract_room_name(payload)
    if not room_name:
        return

    session = InterviewSession.objects.filter(room_name=room_name).first()
    if not session:
        logger.warning("LiveKit webhook: session not found for room %s", room_name)
        return

    if event in {"room_started", "room_start"}:
        if session.status in {"draft", "scheduled", "calibration", "processing"}:
            update_interview_status(session, "in_progress")
            logger.info("LiveKit webhook: session %s marked in_progress", session.id)
    elif event in {"room_finished", "room_ended", "room_stopped", "room_disconnected"}:
        if session.status not in {"completed", "cancelled"}:
            update_interview_status(session, "completed")
            logger.info("LiveKit webhook: session %s marked completed", session.id)

    recording_url = _extract_recording_url(payload)
    if recording_url and recording_url != session.recording_url:
        session.recording_url = recording_url
        session.save(update_fields=["recording_url", "update_at"])
        logger.info("LiveKit webhook: session %s recording_url updated", session.id)

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

    if isinstance(payload, dict):
        try:
            _handle_livekit_event(payload)
        except Exception as exc:
            logger.warning("LiveKit webhook handling error: %s", exc)

    return JsonResponse({"ok": True}, status=200)
