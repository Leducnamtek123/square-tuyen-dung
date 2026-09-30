#!/bin/sh
# =============================================================================
# scripts/backup-service-entrypoint.sh
# Production-Grade Automated Backup Service (MySQL + MinIO S3 Media + Validation)
# =============================================================================

set -e

BACKUP_INTERVAL_SECONDS="${BACKUP_INTERVAL_SECONDS:-86400}" # Default: every 24h
RETENTION_DAYS="${RETENTION_DAYS:-30}"
DB_NAME="${MYSQL_DATABASE:-square_db}"
DB_HOST="${DB_HOST:-db}"
DB_USER="${DB_USER:-root}"

send_telegram_alert() {
  STATUS="$1"
  MSG="$2"
  if [ -n "$BACKUP_TELEGRAM_BOT_TOKEN" ] && [ -n "$BACKUP_TELEGRAM_CHAT_ID" ]; then
    ICON="🛡️"
    if [ "$STATUS" = "SUCCESS" ]; then
      ICON="✅"
    elif [ "$STATUS" = "CRITICAL ERROR" ]; then
      ICON="🚨"
    fi
    TEXT="${ICON} <b>[InfoHR Backup - ${STATUS}]</b>
⏰ <b>Thời gian:</b> $(date '+%Y-%m-%d %H:%M:%S')

${MSG}"
    curl -s -X POST "https://api.telegram.org/bot${BACKUP_TELEGRAM_BOT_TOKEN}/sendMessage" \
      -d chat_id="${BACKUP_TELEGRAM_CHAT_ID}" \
      -d parse_mode="HTML" \
      -d text="${TEXT}" > /dev/null 2>&1 || true
  fi
}

echo "🚀 [Backup Service] Initializing Automated Database & MinIO Backup System..."
echo "ℹ️  Schedule: Every ${BACKUP_INTERVAL_SECONDS}s | Retention: ${RETENTION_DAYS} days | Target DB: ${DB_NAME}"

while true; do
  DATE=$(date +%Y-%m-%d_%H%M%S)
  DB_FILE="/backups/db_backup_square_${DATE}.sql.gz"
  DB_TEMP="${DB_FILE}.tmp"
  MINIO_FILE="/backups/minio_media_${DATE}.tar.gz"
  MINIO_TEMP="${MINIO_FILE}.tmp"

  echo "-------------------------------------------------------------------"
  echo "[$DATE] 🔄 Starting scheduled backup..."

  # --- 1. MySQL Zero-Downtime Backup with Strict Pipe Validation ---
  echo "[$DATE] 📦 Dumping MySQL database '${DB_NAME}'..."
  DB_SUCCESS=0

  # Wait up to 60s if DB is momentarily unreachable
  RETRY=0
  while [ $RETRY -lt 6 ]; do
    if MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysqladmin ping -h "$DB_HOST" -u "$DB_USER" --silent > /dev/null 2>&1; then
      break
    fi
    echo "[$DATE] ⏳ Waiting for MySQL to become ready (attempt $((RETRY+1))/6)..."
    sleep 10
    RETRY=$((RETRY+1))
  done

  if (set -o pipefail; MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysqldump -h "$DB_HOST" -u "$DB_USER" \
      --single-transaction --quick --routines --triggers --events "$DB_NAME" | gzip > "$DB_TEMP"); then
    
    DB_SIZE=$(wc -c < "$DB_TEMP" 2>/dev/null || stat -c%s "$DB_TEMP" 2>/dev/null || echo 0)
    
    # Must be greater than 50 KB (prevent 20-byte empty gzip failure)
    if [ "$DB_SIZE" -gt 51200 ]; then
      mv -f "$DB_TEMP" "$DB_FILE"
      (cd /backups && ln -sf "$(basename "$DB_FILE")" db_backup_latest.sql.gz 2>/dev/null) || cp -f "$DB_FILE" /backups/db_backup_latest.sql.gz 2>/dev/null || true
      DB_READABLE_SIZE=$(du -sh "$DB_FILE" 2>/dev/null | cut -f1)
      echo "[$DATE] ✅ Database backup completed successfully: $DB_FILE ($DB_READABLE_SIZE)"
      DB_SUCCESS=1
    else
      echo "[$DATE] ❌ Database backup FAILED: Output size too small ($DB_SIZE bytes, minimum required: 50 KB)."
      rm -f "$DB_TEMP"
      send_telegram_alert "CRITICAL ERROR" "Database backup generated corrupt or empty file ($DB_SIZE bytes). Please check MySQL container immediately."
    fi
  else
    echo "[$DATE] ❌ mysqldump command failed with non-zero exit code!"
    rm -f "$DB_TEMP"
    send_telegram_alert "CRITICAL ERROR" "mysqldump command failed to execute. Database unreachable or permission denied."
  fi

  # --- 2. MinIO S3 Media Storage Backup ---
  MINIO_SUCCESS=0
  if [ -d "/minio_data/square" ] || [ -d "/minio_data" ]; then
    echo "[$DATE] 📦 Archiving MinIO media storage..."
    MINIO_TARGET_DIR="/minio_data/square"
    if [ ! -d "$MINIO_TARGET_DIR" ]; then
      MINIO_TARGET_DIR="/minio_data"
    fi

    if tar -czf "$MINIO_TEMP" -C "$(dirname "$MINIO_TARGET_DIR")" "$(basename "$MINIO_TARGET_DIR")" 2>/dev/null; then
      MINIO_SIZE=$(wc -c < "$MINIO_TEMP" 2>/dev/null || stat -c%s "$MINIO_TEMP" 2>/dev/null || echo 0)
      if [ "$MINIO_SIZE" -gt 10240 ]; then
        mv -f "$MINIO_TEMP" "$MINIO_FILE"
        (cd /backups && ln -sf "$(basename "$MINIO_FILE")" minio_media_latest.tar.gz 2>/dev/null) || cp -f "$MINIO_FILE" /backups/minio_media_latest.tar.gz 2>/dev/null || true
        MINIO_READABLE_SIZE=$(du -sh "$MINIO_FILE" 2>/dev/null | cut -f1)
        echo "[$DATE] ✅ MinIO media backup completed: $MINIO_FILE ($MINIO_READABLE_SIZE)"
        MINIO_SUCCESS=1
      else
        echo "[$DATE] ⚠️ MinIO backup generated unusually small file ($MINIO_SIZE bytes)."
        rm -f "$MINIO_TEMP"
      fi
    else
      echo "[$DATE] ⚠️ Tar creation failed for MinIO storage."
      rm -f "$MINIO_TEMP"
    fi
  else
    echo "[$DATE] ℹ️ /minio_data volume not mounted or not found. Skipping MinIO media backup."
  fi

  # --- 3. Manage Retention (Prune files older than RETENTION_DAYS) ---
  DELETED_DB=$(find /backups -name 'db_backup_square_*.sql.gz' -mtime "+$RETENTION_DAYS" -print -delete 2>/dev/null | wc -l || echo 0)
  DELETED_MINIO=$(find /backups -name 'minio_media_*.tar.gz' -mtime "+$RETENTION_DAYS" -print -delete 2>/dev/null | wc -l || echo 0)
  if [ "$DELETED_DB" -gt 0 ] || [ "$DELETED_MINIO" -gt 0 ]; then
    echo "[$DATE] 🧹 Retention cleanup: removed $DELETED_DB old DB dumps and $DELETED_MINIO old MinIO archives (> $RETENTION_DAYS days)."
  fi

  if [ $DB_SUCCESS -eq 1 ]; then
    MINIO_INFO="Bỏ qua (không có data)"
    if [ $MINIO_SUCCESS -eq 1 ]; then
      MINIO_INFO="Thành công ($MINIO_READABLE_SIZE)"
    fi
    send_telegram_alert "SUCCESS" "Sao lưu hệ thống tự động định kỳ thành công!
• <b>MySQL DB:</b> ${DB_READABLE_SIZE} (${DB_NAME})
• <b>MinIO Media:</b> ${MINIO_INFO}
• <b>Lưu trữ:</b> retention ${RETENTION_DAYS} ngày
• <b>Chu kỳ kế tiếp:</b> Sau $((BACKUP_INTERVAL_SECONDS / 3600)) giờ."
    echo "[$DATE] 💤 Next automated backup cycle in $((BACKUP_INTERVAL_SECONDS / 3600)) hours ($BACKUP_INTERVAL_SECONDS seconds)."
  else
    echo "[$DATE] ⚠️ Backup had errors! Will retry in 1800 seconds (30 minutes)..."
    sleep 1800
    continue
  fi

  sleep "$BACKUP_INTERVAL_SECONDS"
done
