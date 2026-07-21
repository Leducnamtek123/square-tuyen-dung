import os
import threading
from typing import Any, Callable

from django.db import close_old_connections


_ASYNC_UNSAFE_ENV_LOCK = threading.RLock()


def run_django_sync_in_thread(func: Callable[..., Any], *args: Any, **kwargs: Any) -> Any:
    result: dict[str, Any] = {}

    def _target() -> None:
        with _ASYNC_UNSAFE_ENV_LOCK:
            previous_async_unsafe = os.environ.get("DJANGO_ALLOW_ASYNC_UNSAFE")
            os.environ["DJANGO_ALLOW_ASYNC_UNSAFE"] = "true"
            try:
                close_old_connections()
                result["value"] = func(*args, **kwargs)
            except Exception as exc:
                result["error"] = exc
            finally:
                close_old_connections()
                if previous_async_unsafe is None:
                    os.environ.pop("DJANGO_ALLOW_ASYNC_UNSAFE", None)
                else:
                    os.environ["DJANGO_ALLOW_ASYNC_UNSAFE"] = previous_async_unsafe

    thread = threading.Thread(target=_target)
    thread.start()
    thread.join()
    if "error" in result:
        raise result["error"]
    return result.get("value")
