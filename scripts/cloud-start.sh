#!/usr/bin/env bash
# =============================================================================
# scripts/cloud-start.sh — Cloud Agent `start` phase (runs every boot).
# Re-applies host settings, ensures dockerd is up, and starts the core stack.
# Migrations run automatically (AUTO_MIGRATE=1). Idempotent.
# The site is served through the Nginx gateway at http://localhost:8080
# =============================================================================
set -euo pipefail
cd "$(dirname "$0")/.."

bash scripts/cloud-docker-setup.sh

mkdir -p .secrets backups
[ -f .secrets/fpt_gpu_ssh_key ] || : > .secrets/fpt_gpu_ssh_key
[ -f .env ] || cp .env.local.example .env

# Bring up the core web stack (pulls in db, redis, migrate, backend, frontend,
# livekit, minio via dependency chain) plus Elasticsearch.
sudo docker compose up -d nginx-gateway elasticsearch

echo "[cloud-start] Stack starting. Gateway will be available at http://localhost:8080"
