#!/usr/bin/env bash
# =============================================================================
# scripts/cloud-docker-setup.sh
# Idempotent host preparation for running the full docker-compose stack inside
# a Cloud Agent VM (Docker-in-Docker). Safe to run repeatedly.
#
#   - Installs Docker Engine + the docker compose plugin (if missing)
#   - Installs fuse-overlayfs (overlayfs snapshotter fails in the nested VM)
#   - Writes /etc/docker/daemon.json to use the fuse-overlayfs storage driver
#   - Applies sysctls required by Elasticsearch and container-to-container
#     networking on the custom bridge networks
#   - Starts the Docker daemon if it is not already running
# =============================================================================
set -euo pipefail

log() { echo "[cloud-docker-setup] $*"; }

# --- Docker Engine -----------------------------------------------------------
if ! command -v docker >/dev/null 2>&1; then
  log "Installing Docker Engine via get.docker.com ..."
  curl -fsSL https://get.docker.com -o /tmp/get-docker.sh
  sudo sh /tmp/get-docker.sh
else
  log "Docker already installed: $(docker --version)"
fi

# --- fuse-overlayfs ----------------------------------------------------------
if ! command -v fuse-overlayfs >/dev/null 2>&1; then
  log "Installing fuse-overlayfs ..."
  sudo apt-get update -qq
  # The package post-install trigger may fail to start a service; the binary
  # itself installs fine, so tolerate a non-zero dpkg trigger exit.
  sudo apt-get install -y -qq fuse-overlayfs || true
fi
command -v fuse-overlayfs >/dev/null 2>&1 || { log "ERROR: fuse-overlayfs not available"; exit 1; }

# --- Docker daemon storage driver -------------------------------------------
log "Writing /etc/docker/daemon.json (fuse-overlayfs) ..."
sudo mkdir -p /etc/docker
printf '%s\n' '{
  "features": { "containerd-snapshotter": false },
  "storage-driver": "fuse-overlayfs"
}' | sudo tee /etc/docker/daemon.json >/dev/null

# --- Kernel sysctls ----------------------------------------------------------
# Elasticsearch requires a high mmap count.
sudo sysctl -w vm.max_map_count=262144 >/dev/null
# Docker's nftables FORWARD rules do not install cleanly in this nested VM, so
# route intra-bridge traffic as pure L2 (restores container-to-container comms).
sudo sysctl -w net.bridge.bridge-nf-call-iptables=0 >/dev/null 2>&1 || true
sudo sysctl -w net.bridge.bridge-nf-call-ip6tables=0 >/dev/null 2>&1 || true

# --- Start the Docker daemon -------------------------------------------------
if sudo docker info >/dev/null 2>&1; then
  log "Docker daemon already running."
else
  log "Starting dockerd ..."
  sudo dockerd >/tmp/dockerd.log 2>&1 &
  for i in $(seq 1 30); do
    if sudo docker info >/dev/null 2>&1; then
      log "Docker daemon is up."
      break
    fi
    sleep 1
  done
  sudo docker info >/dev/null 2>&1 || { log "ERROR: dockerd did not start"; sudo tail -20 /tmp/dockerd.log || true; exit 1; }
fi

log "Host is ready for docker compose."
