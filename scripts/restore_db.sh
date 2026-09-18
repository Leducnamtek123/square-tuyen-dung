#!/bin/bash
# =============================================================================
# restore_db.sh — Restore the MySQL database from a gzipped mysqldump backup.
# =============================================================================
# Usage:
#   ./scripts/restore_db.sh                       # restore newest backup in ./backups
#   ./scripts/restore_db.sh path/to/dump.sql.gz   # restore a specific file
#
# If no backup file is found, falls back to seeding sample data with
# `manage.py run_seeding --type all` so the app still ends up populated.
# DB credentials are read from the repo .env (DB_PASSWORD/DB_NAME/DB_USER).
# =============================================================================
set -euo pipefail

# --- Resolve repo root ---
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${ROOT_DIR}"

# --- Load DB settings from .env when present ---
if [ -f .env ]; then
  DB_PASSWORD="${DB_PASSWORD:-$(grep -E '^DB_PASSWORD=' .env | head -1 | cut -d= -f2-)}"
  DB_NAME="${DB_NAME:-$(grep -E '^DB_NAME=' .env | head -1 | cut -d= -f2-)}"
  DB_USER="${DB_USER:-$(grep -E '^DB_USER=' .env | head -1 | cut -d= -f2-)}"
fi
DB_CONTAINER="${DB_CONTAINER:-tuyendung-studio-db}"
DB_NAME="${DB_NAME:-square_db}"
DB_USER="${DB_USER:-root}"
BACKUP_DIR="${BACKUP_DIR:-./backups}"
: "${DB_PASSWORD:?DB_PASSWORD must be set (in .env or environment)}"

# --- Choose docker command (fall back to sudo when needed) ---
DOCKER="docker"
if ! ${DOCKER} info >/dev/null 2>&1; then
  if command -v sudo >/dev/null 2>&1 && sudo docker info >/dev/null 2>&1; then
    DOCKER="sudo docker"
  else
    echo "ERROR: cannot talk to the Docker daemon. Is it running?" >&2
    exit 1
  fi
fi

# --- Determine which backup file to restore ---
BACKUP_FILE="${1:-}"
if [ -z "${BACKUP_FILE}" ]; then
  if [ -f "${BACKUP_DIR}/db_backup_latest.sql.gz" ]; then
    BACKUP_FILE="${BACKUP_DIR}/db_backup_latest.sql.gz"
  else
    BACKUP_FILE="$(ls -1t "${BACKUP_DIR}"/*.sql.gz 2>/dev/null | head -1 || true)"
  fi
fi

# --- Wait for the DB container to be reachable ---
echo "[restore_db] Waiting for ${DB_CONTAINER} to accept connections..."
for i in $(seq 1 60); do
  if ${DOCKER} exec "${DB_CONTAINER}" sh -c "MYSQL_PWD='${DB_PASSWORD}' mysqladmin ping -u '${DB_USER}' --silent" >/dev/null 2>&1; then
    break
  fi
  sleep 2
  if [ "$i" -eq 60 ]; then
    echo "ERROR: database container '${DB_CONTAINER}' not ready." >&2
    exit 1
  fi
done

if [ -n "${BACKUP_FILE}" ] && [ -f "${BACKUP_FILE}" ]; then
  echo "[restore_db] Restoring '${BACKUP_FILE}' into database '${DB_NAME}'..."
  ${DOCKER} cp "${BACKUP_FILE}" "${DB_CONTAINER}:/tmp/restore.sql.gz"
  ${DOCKER} exec "${DB_CONTAINER}" sh -c \
    "gzip -dc /tmp/restore.sql.gz | MYSQL_PWD='${DB_PASSWORD}' mysql -u '${DB_USER}' '${DB_NAME}' && rm -f /tmp/restore.sql.gz"
  echo "[restore_db] ✅ Restore complete from $(basename "${BACKUP_FILE}")."
else
  echo "[restore_db] No backup file found in '${BACKUP_DIR}'. Falling back to seeding sample data..."
  ${DOCKER} compose exec -T backend python manage.py run_seeding --type all
  echo "[restore_db] ✅ Sample data seeded via run_seeding."
fi

echo "[restore_db] Done. Sample data (accounts, companies, resumes, jobs, shifts, payroll) is ready."
