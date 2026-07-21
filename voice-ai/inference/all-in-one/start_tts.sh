#!/usr/bin/env bash
set -euo pipefail

sleep "${TTS_STARTUP_DELAY_SECONDS:-60}"

if [[ -n "${TTS_CUDA_VISIBLE_DEVICES:-}" ]]; then
  export CUDA_VISIBLE_DEVICES="${TTS_CUDA_VISIBLE_DEVICES}"
fi

export PORT="${TTS_PORT:-8298}"
exec /opt/tts-venv/bin/python /opt/square-ai/tts_api.py
