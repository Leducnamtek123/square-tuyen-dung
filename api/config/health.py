from django.http import JsonResponse
from django.db import connections
from django.core.cache import cache
import logging
from concurrent.futures import ThreadPoolExecutor, TimeoutError as FuturesTimeoutError

logger = logging.getLogger(__name__)

def _check_database():
    try:
        with connections['default'].cursor() as cursor:
            cursor.execute("SELECT 1")
        return True
    except Exception:
        return False

def _check_cache():
    try:
        cache.set("health_check_ping", "ok", 5)
        return cache.get("health_check_ping") == "ok"
    except Exception:
        return False

def health_check(request):
    """
    GET /health/ — Returns system health status.
    Uses a ThreadPoolExecutor to avoid SynchronousOnlyOperation in async-capable environments.
    """
    def _run(func):
        with ThreadPoolExecutor(max_workers=1) as executor:
            future = executor.submit(func)
            try:
                return future.result(timeout=5)
            except (FuturesTimeoutError, Exception):
                return False

    db_ok = _run(_check_database)
    cache_ok = _run(_check_cache)

    is_healthy = db_ok and cache_ok
    
    status_data = {
        "status": "ok" if is_healthy else "degraded",
        "checks": {
            "database": "ok" if db_ok else "error",
            "cache": "ok" if cache_ok else "error",
        }
    }
    
    return JsonResponse(status_data, status=200 if is_healthy else 503)
