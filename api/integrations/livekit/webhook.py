import json
import logging
from collections.abc import Mapping, Sequence
from typing import Any

from django.conf import settings
from django.db import connection
from django.http import HttpRequest, JsonResponse
from django.views.decorators.csrf import csrf_exempt

from apps.interviews.models import InterviewSession
from apps.interviews.services import update_interview_status
from config.django_threading import run_django_sync_in_thread

logger = logging.getLogger("livekit.webhook")

_URL_KEYS = ("recording_url", "recordingUrl", "recordingURL", "file_url", "fileUrl", "url", "downloadUrl")
_ROOM_KEYS = ("roomName", "room_name", "room")
_EGRESS_KEYS = ("egressInfo", "egress_info", "egress", "recording")
_FILE_RESULT_KEYS = ("fileResults", "file_results")
_FILE_URL_KEYS = ("location", "url", "fileUrl", "file_url", "downloadUrl", "filepath", "path")


def _run_in_thread(func, *args, **kwargs):
    if connection.in_atomic_block:
        return func(*args, **kwargs)
    return run_django_sync_in_thread(func, *args, **kwargs)


def _get_attr_or_item(node: Any, key: str, default: Any = None) -> Any:
    if isinstance(node, Mapping):
        return node.get(key, default)
    return getattr(node, key, default)


def _iter_nodes(value: Any) -> list[Any]:
    if value is None:
        return []
    if isinstance(value, (str, bytes, bytearray)):
        return [value]
    if isinstance(value, Sequence):
        return list(value)
    return [value]


def _parse_json(raw: bytes) -> dict[str, Any]:
    if not raw:
        return {}
    try:
        return json.loads(raw.decode("utf-8"))
    except Exception:
        return {}

def _extract_room_name(payload: Any) -> str | None:
    for key in _ROOM_KEYS:
        value = _get_attr_or_item(payload, key)
        if isinstance(value, str) and value:
            return value

    room = _get_attr_or_item(payload, "room")
    if isinstance(room, dict):
        for key in ("name", "roomName", "room_name"):
            value = room.get(key)
            if isinstance(value, str) and value:
                return value
    elif room is not None:
        for key in ("name", "roomName", "room_name"):
            value = _get_attr_or_item(room, key)
            if isinstance(value, str) and value:
                return value

    return None


def _extract_recording_url(payload: Any) -> str | None:
    candidates = []
    for key in _URL_KEYS:
        value = _get_attr_or_item(payload, key)
        if isinstance(value, str):
            candidates.append(value)

    for key in _EGRESS_KEYS:
        node = _get_attr_or_item(payload, key)
        if not node:
            continue

        for url_key in _FILE_URL_KEYS:
            value = _get_attr_or_item(node, url_key)
            if isinstance(value, str):
                candidates.append(value)

        for file_key in _FILE_RESULT_KEYS:
            file_results = _get_attr_or_item(node, file_key)
            for file_result in _iter_nodes(file_results):
                for url_key in _FILE_URL_KEYS:
                    value = _get_attr_or_item(file_result, url_key)
                    if isinstance(value, str):
                        candidates.append(value)
                file_node = _get_attr_or_item(file_result, "file")
                if file_node:
                    for url_key in _FILE_URL_KEYS:
                        value = _get_attr_or_item(file_node, url_key)
                        if isinstance(value, str):
                            candidates.append(value)

    for value in candidates:
        if value:
            return value

    return None


def _handle_livekit_event(payload: Any) -> None:
    event_name = _get_attr_or_item(payload, "event") or _get_attr_or_item(payload, "eventName") or ""
    event = str(event_name).lower()
    room_name = _extract_room_name(payload)
    if not room_name:
        egress_info = _get_attr_or_item(payload, "egressInfo") or _get_attr_or_item(payload, "egress_info")
        if egress_info is not None:
            room_name = _get_attr_or_item(egress_info, "roomName") or _get_attr_or_item(egress_info, "room_name")
    if not room_name:
        return

    session = InterviewSession.objects.filter(room_name=room_name).first()
    if not session:
        logger.warning("LiveKit webhook: session not found for room %s", room_name)
        return

    if event in {"room_started", "room_start"}:
        if session.status in {"draft", "scheduled", "calibration", "processing", "interrupted"}:
            update_interview_status(session, "in_progress")
            logger.info("LiveKit webhook: session %s marked in_progress", session.id)
    elif event in {"room_finished", "room_ended", "room_stopped", "room_disconnected"}:
        if session.status not in {"completed", "cancelled", "processing"}:
            update_interview_status(session, "interrupted")
            logger.info("LiveKit webhook: session %s marked interrupted", session.id)

    recording_url = _extract_recording_url(payload)
    if recording_url and recording_url != session.recording_url:
        session.recording_url = recording_url
        session.save(update_fields=["recording_url", "update_at"])
        logger.info("LiveKit webhook: session %s recording_url updated", session.id)

@csrf_exempt
def livekit_webhook(request: HttpRequest):
    """
    POST /api/v1/interview/livekit/webhook
    Receives LiveKit webhook events.
    Verifies signature when livekit-api helpers are available and secret is set.
    """
    if request.method != "POST":
        return JsonResponse({"detail": "Method not allowed."}, status=405)

    raw_body = request.body or b""
    body_text = raw_body.decode("utf-8") if isinstance(raw_body, (bytes, bytearray)) else str(raw_body)
    api_key = getattr(settings, "LIVEKIT_API_KEY", "")
    api_secret = getattr(settings, "LIVEKIT_API_SECRET", "")
    webhook_token = getattr(settings, "LIVEKIT_WEBHOOK_TOKEN", "")
    strict_mode = bool(getattr(settings, "LIVEKIT_WEBHOOK_STRICT", True))
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
    elif webhook_token and auth_token == webhook_token:
        verified = True
        payload = _parse_json(raw_body)
    else:
        payload = _parse_json(raw_body)

    if not verified and strict_mode:
        return JsonResponse({"detail": "Unauthorized webhook request."}, status=401)
    if not verified:
        logger.warning("LiveKit webhook received without verification in non-strict mode.")

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

    try:
        _run_in_thread(_handle_livekit_event, payload)
    except Exception as exc:
        logger.warning("LiveKit webhook handling error: %s", exc)

    return JsonResponse({"ok": True}, status=200)
