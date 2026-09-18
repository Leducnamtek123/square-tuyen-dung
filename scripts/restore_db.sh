#!/bin/bash
# =============================================================================
# restore_db.sh — Restore MySQL database & MinIO media from backups
# =============================================================================
# Usage: ./scripts/restore_db.sh [path_to_db_backup.sql.gz]
# =============================================================================

set -euo pipefail

BACKUP_FILE="${1:-backups/db_backup_latest.sql.gz}"
MINIO_BACKUP="backups/minio_media_latest.tar.gz"
DB_CONTAINER="${DB_CONTAINER:-tuyendung-studio-db}"
DB_NAME="${DB_NAME:-square_db}"
DB_USER="${DB_USER:-root}"
DB_PASSWORD="${DB_PASSWORD:-5Dg-UfRnuEvcqJ9mkhrpaPccoijdKlQCIQKHEA-zaPHn-4vECYIVUNWJOi8XTJFV}"

if [ ! -f "${BACKUP_FILE}" ]; then
  echo "Error: Backup file '${BACKUP_FILE}' not found!"
  exit 1
fi

echo "[$(date)] Restoring ${DB_NAME} from ${BACKUP_FILE} into container ${DB_CONTAINER}..."

# Copy backup into container
docker cp "${BACKUP_FILE}" "${DB_CONTAINER}:/tmp/restore.sql.gz"

# Decompress and import inside container
docker exec "${DB_CONTAINER}" bash -c "gzip -dc /tmp/restore.sql.gz | mysql -u ${DB_USER} -p${DB_PASSWORD} ${DB_NAME} && rm -f /tmp/restore.sql.gz"

echo "[$(date)] Database restore completed successfully!"

# Restore MinIO media if backup file exists
if [ -f "${MINIO_BACKUP}" ]; then
  echo "[$(date)] Restoring MinIO media from ${MINIO_BACKUP}..."
  docker run --rm -v tuyendung_studio_vn_minio-data:/data -v "$(pwd)/backups:/in" alpine sh -c "mkdir -p /data/square && tar -xzf /in/minio_media_latest.tar.gz -C /data/square"
  echo "[$(date)] MinIO media restore completed successfully!"
fi

echo "[$(date)] Full system restore (Database + MinIO) finished!"
