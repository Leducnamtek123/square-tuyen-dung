"""
Custom authentication classes for public/hybrid endpoints.
"""
from oauth2_provider.contrib.rest_framework import OAuth2Authentication


class SafeOAuth2Authentication(OAuth2Authentication):
    """
    Tolerates invalid/expired tokens for public or hybrid endpoints:
    instead of raising 401 AuthenticationFailed, returns None so that
    request.user becomes AnonymousUser, allowing view and permission logic
    to proceed safely without hard 401 crashes.
    """

    def authenticate(self, request):
        try:
            return super().authenticate(request)
        except Exception:
            return None
