param (
    [string]$BackupFile = "backups/db_backup_latest.sql.gz",
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
}
