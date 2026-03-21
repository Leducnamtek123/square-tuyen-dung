"""
Health check endpoint for load balancers and monitoring.
"""
import logging

from django.http import JsonResponse
from django.db import connection

logger = logging.getLogger(__name__)


def health_check(request):
    """
    GET /health/ — Returns system health status.
    Checks: database connectivity, basic app responsiveness.
    """
    status = {
        "status": "ok",
        "checks": {}
    }
    overall_ok = True

    # Database check
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        status["checks"]["database"] = "ok"
    except Exception as e:
        status["checks"]["database"] = f"error: {str(e)}"
        overall_ok = False
        logger.error("Health check - DB failed: %s", e)

    # Redis check
    try:
        from django.core.cache import cache
        cache.set("health_check", "ok", 10)
        val = cache.get("health_check")
        status["checks"]["cache"] = "ok" if val == "ok" else "degraded"
    except Exception as e:
        status["checks"]["cache"] = f"error: {str(e)}"
        logger.warning("Health check - Cache failed: %s", e)

    if not overall_ok:
        status["status"] = "degraded"

    http_status = 200 if overall_ok else 503
    return JsonResponse(status, status=http_status)
