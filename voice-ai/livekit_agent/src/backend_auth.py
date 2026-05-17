import hashlib
import hmac
import time
from urllib.parse import urlparse

import httpx

from .config import config


async def sign_backend_request(request: httpx.Request) -> None:
    secret = (config.INTERVIEW_AGENT_SHARED_SECRET or "").strip()
    if not secret:
        return

    body = request.content or b""
    timestamp = str(int(time.time()))
    path = urlparse(str(request.url)).path
    body_digest = hashlib.sha256(body).hexdigest()
    message = "\n".join([request.method.upper(), path, timestamp, body_digest]).encode("utf-8")
    signature = hmac.new(secret.encode("utf-8"), message, hashlib.sha256).hexdigest()
    request.headers["X-Square-Agent-Timestamp"] = timestamp
    request.headers["X-Square-Agent-Signature"] = signature


def auth_event_hook():
    return sign_backend_request
