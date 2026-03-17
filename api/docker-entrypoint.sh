#!/bin/sh
set -e

MAX_RETRIES="${DB_WAIT_MAX_RETRIES:-30}"
SLEEP_SECONDS="${DB_WAIT_SLEEP_SECONDS:-2}"

echo "Waiting for database and applying migrations..."
i=1
while [ "$i" -le "$MAX_RETRIES" ]; do
  if python manage.py migrate --noinput; then
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

exec "$@"
