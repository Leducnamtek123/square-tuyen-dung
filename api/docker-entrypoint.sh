#!/bin/sh

MAX_RETRIES="${DB_WAIT_MAX_RETRIES:-60}"
SLEEP_SECONDS="${DB_WAIT_SLEEP_SECONDS:-2}"

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

if [ "${SYNC_OAUTH_CLIENT:-1}" = "1" ]; then
  if [ -n "${CLIENT_ID:-}" ] && [ -n "${CLIENT_SECRET:-}" ]; then
    echo "Syncing OAuth client from environment..."
    python manage.py sync_oauth_client
  else
    echo "Skipping OAuth client sync because CLIENT_ID or CLIENT_SECRET is missing."
  fi
else
  echo "SYNC_OAUTH_CLIENT disabled. Skipping OAuth client sync."
fi

exec "$@"
