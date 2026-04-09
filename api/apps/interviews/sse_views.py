"""
Interview Module — SSE (Server-Sent Events) Views

Provides realtime event streaming for employer monitoring.
Uses Redis Pub/Sub to receive broadcast events from transcript/status changes.
Supports auth via query param (?token=...) since EventSource doesn't support headers.
"""

import json
import logging
import time

from django.http import StreamingHttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt

import redis
from django.conf import settings

logger = logging.getLogger(__name__)


def _get_redis_client():
    """Create a dedicated Redis client for Pub/Sub (non-pooled)."""
    return redis.Redis(
        host=settings.SERVICE_REDIS_HOST,
        port=settings.SERVICE_REDIS_PORT,
        password=settings.SERVICE_REDIS_PASSWORD or None,
        db=settings.SERVICE_REDIS_DB,
        decode_responses=True,
        socket_connect_timeout=5,
        socket_timeout=30,
    )


def _sse_event(event_type: str, data: dict) -> str:
    """Format an SSE message."""
    payload = json.dumps(data, ensure_ascii=False, default=str)
    return f"event: {event_type}\ndata: {payload}\n\n"


def _event_stream(session_id: int, user):
    """
    Generator that yields SSE events from Redis Pub/Sub.
    Sends a heartbeat every 15s to keep the connection alive.
    """
    channel_name = f"interview:{session_id}:events"
    r = None
    pubsub = None

    try:
        r = _get_redis_client()
        pubsub = r.pubsub()
        pubsub.subscribe(channel_name)
        logger.info("SSE: user %s subscribed to %s", user, channel_name)

        # Send initial connection event
        yield _sse_event("connected", {
            "sessionId": session_id,
            "message": "SSE connection established",
        })

        last_heartbeat = time.time()

        while True:
            message = pubsub.get_message(timeout=1.0)

            if message and message["type"] == "message":
                try:
                    event_data = json.loads(message["data"])
                    event_type = event_data.pop("_event_type", "update")
                    yield _sse_event(event_type, event_data)
                except (json.JSONDecodeError, KeyError) as exc:
                    logger.warning("SSE: bad message on %s: %s", channel_name, exc)

            # Heartbeat every 15 seconds
            now = time.time()
            if now - last_heartbeat >= 15:
                yield _sse_event("heartbeat", {"ts": int(now)})
                last_heartbeat = now

    except GeneratorExit:
        logger.info("SSE: client disconnected from %s", channel_name)
    except Exception as exc:
        logger.error("SSE: error on %s: %s", channel_name, exc)
        yield _sse_event("error", {"message": "Stream error, please reconnect."})
    finally:
        if pubsub:
            try:
                pubsub.unsubscribe(channel_name)
                pubsub.close()
            except Exception:
                pass
        if r:
            try:
                r.close()
            except Exception:
                pass


def _authenticate_from_token(request):
    """
    Authenticate user from query param ?token=... (for EventSource which doesn't support headers).
    Falls back to standard DRF auth if no query token provided.
    """
    token = request.GET.get("token", "")

    if not token:
        # Try standard Authorization header
        auth_header = request.META.get("HTTP_AUTHORIZATION", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:].strip()

    if not token:
        return None

    try:
        from oauth2_provider.models import AccessToken
        access_token = AccessToken.objects.select_related("user").get(token=token)
        if access_token.is_expired():
            return None
        return access_token.user
    except Exception:
        pass

    return None


@csrf_exempt
def interview_event_stream(request, session_id):
    """
    GET /api/v1/interview/web/sessions/{id}/stream/

    SSE endpoint for employer to receive realtime interview events.
    Events: transcript_added, status_changed, metrics_update, heartbeat

    Auth: supports both Authorization header and ?token= query param.
    """
    if request.method != "GET":
        return JsonResponse({"detail": "Method not allowed."}, status=405)

    from .models import InterviewSession

    # Authenticate
    user = _authenticate_from_token(request)
    if not user:
        return JsonResponse({"detail": "Authentication required."}, status=401)

    try:
        session = InterviewSession.objects.get(pk=session_id)
    except InterviewSession.DoesNotExist:
        return JsonResponse({"detail": "Session not found."}, status=404)

    # Permission: only employer/admin
    role = getattr(user, "role_name", None)
    if role not in ("EMPLOYER", "ADMIN"):
        return JsonResponse({"detail": "Forbidden."}, status=403)

    response = StreamingHttpResponse(
        _event_stream(session.id, user),
        content_type="text/event-stream",
    )
    response["Cache-Control"] = "no-cache"
    response["X-Accel-Buffering"] = "no"  # Disable nginx buffering
    response["Connection"] = "keep-alive"
    return response
