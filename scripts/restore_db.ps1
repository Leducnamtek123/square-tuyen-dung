param (
    [string]$BackupFile = "backups/db_backup_latest.sql.gz",
    [string]$MinioBackup = "backups/minio_media_latest.tar.gz",
    [string]$ContainerName = "tuyendung-studio-db",
    [string]$DbName = "square_db",
    [string]$DbUser = "root",
    [string]$DbPassword = "5Dg-UfRnuEvcqJ9mkhrpaPccoijdKlQCIQKHEA-zaPHn-4vECYIVUNWJOi8XTJFV"
)

if (-not (Test-Path $BackupFile)) {
    Write-Error "Backup file '$BackupFile' does not exist."
    exit 1
}

Write-Host "Restoring database '$DbName' from '$BackupFile' into container '$ContainerName'..." -ForegroundColor Cyan

docker cp $BackupFile "${ContainerName}:/tmp/restore.sql.gz"
docker exec $ContainerName bash -c "gzip -dc /tmp/restore.sql.gz | mysql -u $DbUser -p$DbPassword $DbName && rm -f /tmp/restore.sql.gz"

if ($LASTEXITCODE -eq 0) {
    Write-Host "Database restore completed successfully!" -ForegroundColor Green
} else {
    Write-Error "Database restore failed with exit code $LASTEXITCODE"
    exit $LASTEXITCODE
}

# Restore MinIO media if backup exists
if (Test-Path $MinioBackup) {
    Write-Host "Restoring MinIO media from '$MinioBackup' into MinIO volume..." -ForegroundColor Cyan
    docker run --rm -v tuyendung_studio_vn_minio-data:/data -v "${PWD}/backups:/in" alpine sh -c "mkdir -p /data/square && tar -xzf /in/minio_media_latest.tar.gz -C /data/square"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "MinIO media restore completed successfully!" -ForegroundColor Green
    } else {
        Write-Warning "MinIO restore exited with code $LASTEXITCODE"
    }
}

Write-Host "Full system restore (Database + MinIO) finished!" -ForegroundColor Green
