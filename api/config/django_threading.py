import os
import threading
from typing import Any, Callable

from django.db import close_old_connections


_ASYNC_UNSAFE_ENV_LOCK = threading.RLock()


def run_django_sync_in_thread(func: Callable[..., Any], *args: Any, **kwargs: Any) -> Any:
    try:
        return func(*args, **kwargs)
    except Exception as exc:
        if "SynchronousOnlyOperation" in type(exc).__name__:
            previous_async_unsafe = os.environ.get("DJANGO_ALLOW_ASYNC_UNSAFE")
            os.environ["DJANGO_ALLOW_ASYNC_UNSAFE"] = "true"
            try:
                close_old_connections()
                return func(*args, **kwargs)
            finally:
                close_old_connections()
                if previous_async_unsafe is None:
                    os.environ.pop("DJANGO_ALLOW_ASYNC_UNSAFE", None)
                else:
                    os.environ["DJANGO_ALLOW_ASYNC_UNSAFE"] = previous_async_unsafe
        raise

