#!/bin/bash
# =============================================================================
# backup_db.sh — MySQL Database Backup Script
# =============================================================================
# Usage: ./scripts/backup_db.sh
# Cron:  0 2 * * * /path/to/backup_db.sh >> /var/log/db-backup.log 2>&1
# =============================================================================

set -euo pipefail

# --- Configuration ---
BACKUP_DIR="${BACKUP_DIR:-/backups/mysql}"
RETENTION_DAYS="${RETENTION_DAYS:-7}"
DB_CONTAINER="${DB_CONTAINER:-tuyendung-studio-db}"
DB_NAME="${DB_NAME:-square_db}"
DB_USER="${DB_USER:-root}"
DB_PASSWORD="${DB_PASSWORD:-secret}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/${DB_NAME}_${TIMESTAMP}.sql.gz"

# --- Create backup directory ---
mkdir -p "${BACKUP_DIR}"

echo "[$(date)] Starting backup of ${DB_NAME}..."

# --- Perform backup ---
docker exec "${DB_CONTAINER}" \
  mysqldump \
    -u "${DB_USER}" \
    -p"${DB_PASSWORD}" \
    --single-transaction \
    --routines \
    --triggers \
    --events \
    "${DB_NAME}" \
  | gzip > "${BACKUP_FILE}"

BACKUP_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
echo "[$(date)] Backup complete: ${BACKUP_FILE} (${BACKUP_SIZE})"

# --- Remove old backups ---
DELETED=$(find "${BACKUP_DIR}" -name "${DB_NAME}_*.sql.gz" -mtime +"${RETENTION_DAYS}" -print -delete | wc -l)
echo "[$(date)] Cleaned up ${DELETED} old backup(s) older than ${RETENTION_DAYS} days"

echo "[$(date)] Backup finished successfully."
