#!/bin/sh

MAX_RETRIES="${DB_WAIT_MAX_RETRIES:-30}"
SLEEP_SECONDS="${DB_WAIT_SLEEP_SECONDS:-2}"

if ! python - <<'PY' >/dev/null 2>&1
import pkg_resources  # noqa: F401
PY
then
  echo "pkg_resources missing. Installing setuptools (user site)..."
  python -m pip install --no-cache-dir --user --upgrade setuptools
fi

if ! python - <<'PY' >/dev/null 2>&1
import pkg_resources  # noqa: F401
PY
then
  echo "pkg_resources still missing after install. Check pip permissions or PYTHONNOUSERSITE."
  exit 1
fi

if [ "${AUTO_MIGRATE:-0}" = "1" ]; then
  echo "AUTO_MIGRATE enabled. Waiting for database and applying migrations..."
  i=1
  while [ "$i" -le "$MAX_RETRIES" ]; do
    if python manage.py migrate --noinput --fake-initial; then
      echo "Migrations applied successfully."
      break
    fi

    if [ "$i" -eq "$MAX_RETRIES" ]; then
      echo "Failed to apply migrations after ${MAX_RETRIES} attempts."
      exit 1
    fi

    echo "Migration attempt ${i}/${MAX_RETRIES} failed. Retrying in ${SLEEP_SECONDS}s..."
    i=$((i + 1))
    sleep "$SLEEP_SECONDS"
  done
else
  echo "AUTO_MIGRATE disabled. Skipping migrations."
fi

exec "$@"
