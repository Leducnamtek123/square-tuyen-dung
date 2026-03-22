"""
Custom DRF throttle classes for AI endpoints.

Rates:
  - AIRequestThrottle   : 20 req/min per IP  → /api/ai/chat/
  - AIHeavyThrottle     : 10 req/min per IP  → /api/ai/tts/ and /api/ai/transcribe/
"""
from rest_framework.throttling import AnonRateThrottle, UserRateThrottle


class AIChatThrottle(AnonRateThrottle):
    """20 requests per minute for AI chat (unauthenticated)."""
    scope = "ai_chat_anon"
    rate = "20/min"


class AIChatUserThrottle(UserRateThrottle):
    """30 requests per minute for AI chat (authenticated)."""
    scope = "ai_chat_user"
    rate = "30/min"


class AIHeavyAnonThrottle(AnonRateThrottle):
    """10 requests per minute for TTS / STT (unauthenticated)."""
    scope = "ai_heavy_anon"
    rate = "10/min"


class AIHeavyUserThrottle(UserRateThrottle):
    """20 requests per minute for TTS / STT (authenticated)."""
    scope = "ai_heavy_user"
    rate = "20/min"
