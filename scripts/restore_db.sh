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
  echo "[restore_db] ✅ Database restore complete from $(basename "${BACKUP_FILE}")."
else
  echo "[restore_db] No DB backup file found in '${BACKUP_DIR}'. Falling back to seeding sample data..."
  ${DOCKER} compose exec -T backend python manage.py run_seeding --type all
  echo "[restore_db] ✅ Sample data seeded via run_seeding."
fi

# --- Reindex Elasticsearch so public job/company listings reflect the data ---
echo "[restore_db] Rebuilding the Elasticsearch index (best-effort)..."
${DOCKER} compose exec -T backend python manage.py search_index --rebuild -f >/dev/null 2>&1 \
  && echo "[restore_db] ✅ Elasticsearch index rebuilt." \
  || echo "[restore_db] (skipped ES reindex — backend/elasticsearch not available)"

# --- Restore MinIO media (logos, avatars, banners, CVs, article images...) ---
MINIO_BACKUP="${MINIO_BACKUP:-${BACKUP_DIR}/minio_media_latest.tar.gz}"
MINIO_BUCKET="${MINIO_BUCKET:-square}"
COMPOSE_PROJECT_NAME="${COMPOSE_PROJECT_NAME:-$(grep -E '^COMPOSE_PROJECT_NAME=' .env 2>/dev/null | head -1 | cut -d= -f2-)}"
COMPOSE_PROJECT_NAME="${COMPOSE_PROJECT_NAME:-tuyendung_studio_vn}"
MINIO_VOLUME="${MINIO_VOLUME:-${COMPOSE_PROJECT_NAME}_minio-data}"

if [ -f "${MINIO_BACKUP}" ]; then
  echo "[restore_db] Restoring MinIO media from '${MINIO_BACKUP}' into volume '${MINIO_VOLUME}'..."
  ${DOCKER} run --rm \
    -v "${MINIO_VOLUME}:/data" \
    -v "$(pwd)/${BACKUP_DIR}:/in:ro" \
    alpine sh -c "mkdir -p /data/${MINIO_BUCKET} && tar -xzf /in/$(basename "${MINIO_BACKUP}") -C /data/${MINIO_BUCKET}"
  # Restart MinIO so it rescans the drive and serves the restored objects.
  ${DOCKER} compose restart minio >/dev/null 2>&1 || ${DOCKER} restart tuyendung-studio-minio >/dev/null 2>&1 || true
  echo "[restore_db] ✅ MinIO media restore complete."
else
  echo "[restore_db] No MinIO media archive at '${MINIO_BACKUP}' — skipping media restore."
fi

echo "[restore_db] Done. Database + MinIO media (accounts, companies, resumes, jobs, shifts, payroll, logos, avatars, banners, CVs) are ready."
