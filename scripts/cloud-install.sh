#!/usr/bin/env bash
# =============================================================================
# scripts/cloud-install.sh — Cloud Agent `install` phase.
# Prepares Docker, local env/secrets, and pre-builds/pulls all images so that
# `start` can bring the stack up quickly. Idempotent and safe to re-run.
# =============================================================================
set -euo pipefail
cd "$(dirname "$0")/.."

# 1) Prepare the Docker-in-Docker host (engine, fuse-overlayfs, sysctls, dockerd).
bash scripts/cloud-docker-setup.sh

# 2) Local env + placeholder secret file required by the compose bind mount.
mkdir -p .secrets backups
[ -f .secrets/fpt_gpu_ssh_key ] || : > .secrets/fpt_gpu_ssh_key
chmod 600 .secrets/fpt_gpu_ssh_key || true
if [ ! -f .env ]; then
  echo "[cloud-install] Creating .env from .env.local.example"
  cp .env.local.example .env
fi

# 3) Pre-pull base images and build the dev app images.
echo "[cloud-install] Pulling base images ..."
sudo docker compose pull db redis minio minio-init livekit elasticsearch || true
echo "[cloud-install] Building application images (backend, frontend, gateway) ..."
sudo docker compose build backend frontend nginx-gateway

echo "[cloud-install] Install complete."
