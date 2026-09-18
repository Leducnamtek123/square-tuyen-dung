# =============================================================================
# restore_db.ps1 — Restore the MySQL database from a gzipped mysqldump backup.
# =============================================================================
# Usage (Windows PowerShell):
#   ./scripts/restore_db.ps1                       # restore newest backup in ./backups
#   ./scripts/restore_db.ps1 path\to\dump.sql.gz   # restore a specific file
#
# If no backup file is found, falls back to seeding sample data with
# `manage.py run_seeding --type all`. DB credentials are read from .env.
# =============================================================================
[CmdletBinding()]
param(
    [string]$BackupFile
)
$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootDir = Split-Path -Parent $ScriptDir
Set-Location $RootDir

# --- Load DB settings from .env ---
function Get-EnvValue([string]$key) {
    if (Test-Path ".env") {
        $line = Select-String -Path ".env" -Pattern "^$key=" | Select-Object -First 1
        if ($line) { return ($line.Line -split "=", 2)[1] }
    }
    return $null
}

$DbContainer = if ($env:DB_CONTAINER) { $env:DB_CONTAINER } else { "tuyendung-studio-db" }
$DbName = if ($env:DB_NAME) { $env:DB_NAME } elseif (Get-EnvValue "DB_NAME") { Get-EnvValue "DB_NAME" } else { "square_db" }
$DbUser = if ($env:DB_USER) { $env:DB_USER } elseif (Get-EnvValue "DB_USER") { Get-EnvValue "DB_USER" } else { "root" }
$DbPassword = if ($env:DB_PASSWORD) { $env:DB_PASSWORD } else { Get-EnvValue "DB_PASSWORD" }
$BackupDir = if ($env:BACKUP_DIR) { $env:BACKUP_DIR } else { "./backups" }

if (-not $DbPassword) { throw "DB_PASSWORD must be set (in .env or environment)." }

# --- Determine backup file ---
if (-not $BackupFile) {
    $latest = Join-Path $BackupDir "db_backup_latest.sql.gz"
    if (Test-Path $latest) {
        $BackupFile = $latest
    } else {
        $newest = Get-ChildItem -Path $BackupDir -Filter "*.sql.gz" -ErrorAction SilentlyContinue |
            Sort-Object LastWriteTime -Descending | Select-Object -First 1
        if ($newest) { $BackupFile = $newest.FullName }
    }
}

# --- Wait for DB readiness ---
Write-Host "[restore_db] Waiting for $DbContainer to accept connections..."
for ($i = 0; $i -lt 60; $i++) {
    docker exec $DbContainer sh -c "MYSQL_PWD='$DbPassword' mysqladmin ping -u '$DbUser' --silent" 2>$null
    if ($LASTEXITCODE -eq 0) { break }
    Start-Sleep -Seconds 2
    if ($i -eq 59) { throw "Database container '$DbContainer' not ready." }
}

if ($BackupFile -and (Test-Path $BackupFile)) {
    Write-Host "[restore_db] Restoring '$BackupFile' into database '$DbName'..."
    docker cp $BackupFile "${DbContainer}:/tmp/restore.sql.gz"
    docker exec $DbContainer sh -c "gzip -dc /tmp/restore.sql.gz | MYSQL_PWD='$DbPassword' mysql -u '$DbUser' '$DbName' && rm -f /tmp/restore.sql.gz"
    Write-Host "[restore_db] Database restore complete from $(Split-Path -Leaf $BackupFile)."
} else {
    Write-Host "[restore_db] No DB backup file found in '$BackupDir'. Falling back to seeding sample data..."
    docker compose exec -T backend python manage.py run_seeding --type all
    Write-Host "[restore_db] Sample data seeded via run_seeding."
}

# --- Reindex Elasticsearch so public job/company listings reflect the data ---
Write-Host "[restore_db] Rebuilding the Elasticsearch index (best-effort)..."
docker compose exec -T backend python manage.py search_index --rebuild -f 2>$null
if ($LASTEXITCODE -eq 0) { Write-Host "[restore_db] Elasticsearch index rebuilt." }
else { Write-Host "[restore_db] (skipped ES reindex - backend/elasticsearch not available)" }

# --- Restore MinIO media (logos, avatars, banners, CVs, article images...) ---
$MinioBackup = if ($env:MINIO_BACKUP) { $env:MINIO_BACKUP } else { Join-Path $BackupDir "minio_media_latest.tar.gz" }
$MinioBucket = if ($env:MINIO_BUCKET) { $env:MINIO_BUCKET } elseif (Get-EnvValue "MINIO_BUCKET") { Get-EnvValue "MINIO_BUCKET" } else { "square" }
$ProjectName = if ($env:COMPOSE_PROJECT_NAME) { $env:COMPOSE_PROJECT_NAME } elseif (Get-EnvValue "COMPOSE_PROJECT_NAME") { Get-EnvValue "COMPOSE_PROJECT_NAME" } else { "tuyendung_studio_vn" }
$MinioVolume = if ($env:MINIO_VOLUME) { $env:MINIO_VOLUME } else { "${ProjectName}_minio-data" }

if (Test-Path $MinioBackup) {
    Write-Host "[restore_db] Restoring MinIO media from '$MinioBackup' into volume '$MinioVolume'..."
    $backupsAbs = (Resolve-Path $BackupDir).Path
    $archiveName = Split-Path -Leaf $MinioBackup
    docker run --rm -v "${MinioVolume}:/data" -v "${backupsAbs}:/in:ro" alpine sh -c "mkdir -p /data/$MinioBucket && tar -xzf /in/$archiveName -C /data/$MinioBucket"
    docker compose restart minio 2>$null
    Write-Host "[restore_db] MinIO media restore complete."
} else {
    Write-Host "[restore_db] No MinIO media archive at '$MinioBackup' - skipping media restore."
}

Write-Host "[restore_db] Done. Database + MinIO media (accounts, companies, resumes, jobs, shifts, payroll, logos, avatars, banners, CVs) are ready."
