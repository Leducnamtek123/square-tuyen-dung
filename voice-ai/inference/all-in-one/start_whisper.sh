#!/usr/bin/env bash
set -euo pipefail

sleep "${STT_STARTUP_DELAY_SECONDS:-30}"

if [[ -n "${STT_CUDA_VISIBLE_DEVICES:-}" ]]; then
  export CUDA_VISIBLE_DEVICES="${STT_CUDA_VISIBLE_DEVICES}"
fi

host="${STT_HOST:-0.0.0.0}"
port="${STT_PORT:-8080}"
repo_id="${VOXBOX_HF_REPO_ID:-Systran/faster-whisper-large-v3}"
data_dir="${DATA_DIR:-/models/whisper}"
device="${VOXBOX_DEVICE:-cuda}"

exec /opt/whisper-venv/bin/vox-box start \
  --host "$host" \
  --port "$port" \
  --huggingface-repo-id "$repo_id" \
  --data-dir "$data_dir" \
  --device "$device"
