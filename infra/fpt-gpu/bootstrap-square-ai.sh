#!/usr/bin/env bash
set -euo pipefail

export DEBIAN_FRONTEND=noninteractive

INSTALL_ROOT="${INSTALL_ROOT:-/models/square-ai}"
SRC_ROOT="${SRC_ROOT:-/models/src/square-tuyen-dung}"
VENV_ROOT="${VENV_ROOT:-/models/venvs}"
LOG_ROOT="${LOG_ROOT:-/models/logs/square-ai}"
PYTHON_VERSION="${PYTHON_VERSION:-3.10}"

LOCK_FILE="${LOCK_FILE:-/tmp/square-ai-bootstrap.lock}"
exec 9>"$LOCK_FILE"
if ! flock -n 9; then
  echo "Another Square AI bootstrap is already running."
  exit 0
fi

mkdir -p "$INSTALL_ROOT" "$SRC_ROOT" "$VENV_ROOT" "$LOG_ROOT" \
  /models/huggingface /models/whisper

APT_PACKAGES=(
  ca-certificates
  curl
  git
  ffmpeg
  espeak-ng
  libgomp1
  libsndfile1
  build-essential
  openssh-server
  supervisor
)

missing_packages=()
for package in "${APT_PACKAGES[@]}"; do
  if ! dpkg-query -W -f='${Status}' "$package" 2>/dev/null | grep -q "install ok installed"; then
    missing_packages+=("$package")
  fi
done

if [ "${#missing_packages[@]}" -gt 0 ]; then
  apt-get update
  apt-get install -y --no-install-recommends "${missing_packages[@]}"
fi

if [ -x /usr/sbin/sshd ]; then
  mkdir -p /run/sshd
  ssh-keygen -A >/dev/null 2>&1 || true
  if ! pgrep -x sshd >/dev/null 2>&1; then
    /usr/sbin/sshd || service ssh start || true
  fi
fi

if ! command -v uv >/dev/null 2>&1; then
  curl -LsSf https://astral.sh/uv/install.sh | sh
  export PATH="$HOME/.local/bin:$PATH"
  install -m 0755 "$HOME/.local/bin/uv" /usr/local/bin/uv
fi

uv python install "$PYTHON_VERSION"

git config --global --add safe.directory "$SRC_ROOT" || true

ensure_venv() {
  local path="$1"
  if [ ! -x "$path/bin/python" ] || ! "$path/bin/python" -c 'import sys' >/dev/null 2>&1; then
    rm -rf "$path"
    uv venv --seed --python "$PYTHON_VERSION" "$path"
  fi
}

install_if_missing() {
  local python="$1"
  local import_name="$2"
  shift 2
  if ! "$python" -c "import ${import_name}" >/dev/null 2>&1; then
    uv pip install --python "$python" --no-cache "$@"
  fi
}

if [ ! -d "$SRC_ROOT/.git" ]; then
  rm -rf "$SRC_ROOT"
  git clone --depth 1 --branch "${SQUARE_REPO_REF:-main}" \
    "${SQUARE_REPO_URL:-https://github.com/Leducnamtek123/square-tuyen-dung.git}" \
    "$SRC_ROOT"
else
  git -C "$SRC_ROOT" fetch --depth 1 origin "${SQUARE_REPO_REF:-main}"
  git -C "$SRC_ROOT" checkout FETCH_HEAD
fi

cp "$SRC_ROOT/voice-ai/inference/vieneu-text-to-speech/api.py" "$INSTALL_ROOT/tts_api.py"

existing_env_value() {
  local key="$1"
  [ -f "$INSTALL_ROOT/square-ai.env" ] || return 1
  awk -F= -v key="$key" '
    $1 == key {
      value = substr($0, length(key) + 2)
      if (value ~ /^".*"$/) {
        value = substr(value, 2, length(value) - 2)
      }
      print value
      found = 1
    }
    END { exit found ? 0 : 1 }
  ' "$INSTALL_ROOT/square-ai.env"
}

default_env() {
  local key="$1"
  local fallback="$2"
  local current="${!key:-}"
  local existing=""
  existing="$(existing_env_value "$key" || true)"
  if [ -n "$existing" ] && { [ -z "$current" ] || [ "$current" = "$fallback" ]; }; then
    printf -v "$key" '%s' "$existing"
  elif [ -n "$current" ]; then
    printf -v "$key" '%s' "$current"
  else
    printf -v "$key" '%s' "$fallback"
  fi
  export "$key"
}

default_env LLM_MODEL "Qwen/Qwen3-14B"
default_env LLM_SERVED_MODEL_NAME "qwen3-14b-interview"
default_env API_TOKEN "square_ai_secret_please_change"
default_env HF_HOME "/models/huggingface"
default_env VLLM_DOWNLOAD_DIR "/models/huggingface"
default_env DTYPE "bfloat16"
default_env GPU_MEMORY_UTILIZATION "0.55"
default_env MAX_MODEL_LEN "8192"
default_env MAX_NUM_SEQS "8"
default_env REASONING_PARSER "qwen3"
default_env VOXBOX_HF_REPO_ID "Systran/faster-whisper-large-v3"
default_env VOXBOX_DEVICE "cuda"
default_env DATA_DIR "/models/whisper"
default_env TTS_DEVICE "cuda"
default_env TTS_MODE "standard"
default_env TTS_BACKBONE_REPO "pnnbao-ump/VieNeu-TTS-0.3B"
default_env TTS_GPU_MEM_FRACTION "0.15"
default_env STT_STARTUP_DELAY_SECONDS "30"
default_env TTS_STARTUP_DELAY_SECONDS "60"

cat > "$INSTALL_ROOT/square-ai.env" <<EOF
LLM_MODEL="$LLM_MODEL"
LLM_SERVED_MODEL_NAME="$LLM_SERVED_MODEL_NAME"
API_TOKEN="$API_TOKEN"
HF_HOME="$HF_HOME"
VLLM_DOWNLOAD_DIR="$VLLM_DOWNLOAD_DIR"
DTYPE="$DTYPE"
GPU_MEMORY_UTILIZATION="$GPU_MEMORY_UTILIZATION"
MAX_MODEL_LEN="$MAX_MODEL_LEN"
MAX_NUM_SEQS="$MAX_NUM_SEQS"
REASONING_PARSER="$REASONING_PARSER"
VOXBOX_HF_REPO_ID="$VOXBOX_HF_REPO_ID"
VOXBOX_DEVICE="$VOXBOX_DEVICE"
DATA_DIR="$DATA_DIR"
TTS_DEVICE="$TTS_DEVICE"
TTS_MODE="$TTS_MODE"
TTS_BACKBONE_REPO="$TTS_BACKBONE_REPO"
TTS_GPU_MEM_FRACTION="$TTS_GPU_MEM_FRACTION"
STT_STARTUP_DELAY_SECONDS="$STT_STARTUP_DELAY_SECONDS"
TTS_STARTUP_DELAY_SECONDS="$TTS_STARTUP_DELAY_SECONDS"
EOF

ensure_venv "$VENV_ROOT/llm"
install_if_missing "$VENV_ROOT/llm/bin/python" "vllm" \
  "vllm==0.10.1" \
  "transformers>=4.55.0,<5.0"

ensure_venv "$VENV_ROOT/whisper"
uv pip install --python "$VENV_ROOT/whisper/bin/python" --no-cache \
  --force-reinstall pip "setuptools<82.0" wheel
if ! "$VENV_ROOT/whisper/bin/python" -c "import vox_box" >/dev/null 2>&1; then
  uv pip install --python "$VENV_ROOT/whisper/bin/python" --no-cache --no-build-isolation vox-box
fi

ensure_venv "$VENV_ROOT/tts"
install_if_missing "$VENV_ROOT/tts/bin/python" "torch" \
  "torch==2.5.1" "torchaudio==2.5.1" --index-url https://download.pytorch.org/whl/cu124
uv pip install --python "$VENV_ROOT/tts/bin/python" --no-cache \
  --force-reinstall pip "setuptools<82.0" wheel
install_if_missing "$VENV_ROOT/tts/bin/python" "vieneu" \
  "accelerate>=0.30.0" \
  "vieneu[gpu]==1.2.6" \
  "loguru" \
  "fastapi" \
  "uvicorn" \
  "pydantic" \
  "numpy" \
  "transformers>=4.45.0,<5.0" \
  "torchao==0.12.0"

cat > "$INSTALL_ROOT/start_llm.sh" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
set -a
source /models/square-ai/square-ai.env
set +a

args=(
  "serve" "$LLM_MODEL"
  "--host" "0.0.0.0"
  "--port" "8000"
  "--served-model-name" "$LLM_SERVED_MODEL_NAME"
)

if [[ -n "${API_TOKEN:-}" ]]; then
  args+=("--api-key" "$API_TOKEN")
fi
if [[ -n "${GPU_MEMORY_UTILIZATION:-}" ]]; then
  args+=("--gpu-memory-utilization" "$GPU_MEMORY_UTILIZATION")
fi
if [[ -n "${DTYPE:-}" ]]; then
  args+=("--dtype" "$DTYPE")
fi
if [[ -n "${MAX_MODEL_LEN:-}" ]]; then
  args+=("--max-model-len" "$MAX_MODEL_LEN")
fi
if [[ -n "${MAX_NUM_SEQS:-}" ]]; then
  args+=("--max-num-seqs" "$MAX_NUM_SEQS")
fi
if [[ -n "${REASONING_PARSER:-}" ]]; then
  args+=("--reasoning-parser" "$REASONING_PARSER")
fi
if [[ -n "${VLLM_DOWNLOAD_DIR:-}" ]]; then
  args+=("--download-dir" "$VLLM_DOWNLOAD_DIR")
fi

exec /models/venvs/llm/bin/vllm "${args[@]}"
EOF

cat > "$INSTALL_ROOT/start_whisper.sh" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
set -a
source /models/square-ai/square-ai.env
set +a
sleep "${STT_STARTUP_DELAY_SECONDS:-30}"
exec /models/venvs/whisper/bin/vox-box start \
  --host 0.0.0.0 \
  --port 8080 \
  --huggingface-repo-id "${VOXBOX_HF_REPO_ID:-Systran/faster-whisper-large-v3}" \
  --data-dir "${DATA_DIR:-/models/whisper}" \
  --device "${VOXBOX_DEVICE:-cuda}"
EOF

cat > "$INSTALL_ROOT/start_tts.sh" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
set -a
source /models/square-ai/square-ai.env
set +a
sleep "${TTS_STARTUP_DELAY_SECONDS:-60}"
export PORT=8298
exec /models/venvs/tts/bin/python /models/square-ai/tts_api.py
EOF

chmod +x "$INSTALL_ROOT/start_llm.sh" "$INSTALL_ROOT/start_whisper.sh" "$INSTALL_ROOT/start_tts.sh"

cat > "$INSTALL_ROOT/supervisord.conf" <<EOF
[supervisord]
nodaemon=true
loglevel=info
logfile=$LOG_ROOT/supervisord.log
pidfile=/tmp/square-ai-supervisord.pid

[program:llm]
command=$INSTALL_ROOT/start_llm.sh
autostart=true
autorestart=true
startsecs=10
stdout_logfile=$LOG_ROOT/llm.log
stderr_logfile=$LOG_ROOT/llm.err.log
stopasgroup=true
killasgroup=true

[program:whisper]
command=$INSTALL_ROOT/start_whisper.sh
autostart=true
autorestart=true
startsecs=10
stdout_logfile=$LOG_ROOT/whisper.log
stderr_logfile=$LOG_ROOT/whisper.err.log
stopasgroup=true
killasgroup=true

[program:tts]
command=$INSTALL_ROOT/start_tts.sh
autostart=true
autorestart=true
startsecs=10
stdout_logfile=$LOG_ROOT/tts.log
stderr_logfile=$LOG_ROOT/tts.err.log
stopasgroup=true
killasgroup=true
EOF

if supervisorctl pid >/dev/null 2>&1 && [ -d /etc/supervisor/conf.d ]; then
  awk 'BEGIN{skip=0} /^\[supervisord\]/{skip=1; next} /^\[/{skip=0} skip==0{print}' \
    "$INSTALL_ROOT/supervisord.conf" > /tmp/square-ai-programs.conf
  if ! cmp -s /tmp/square-ai-programs.conf /etc/supervisor/conf.d/square-ai-programs.conf; then
    install -m 0644 /tmp/square-ai-programs.conf /etc/supervisor/conf.d/square-ai-programs.conf
  fi
  cat > /etc/supervisor/conf.d/square-ai-bootstrap.conf <<EOF
[program:square-ai-bootstrap]
command=/bin/bash -lc "$INSTALL_ROOT/bootstrap-square-ai.sh >> $LOG_ROOT/bootstrap.log 2>&1 || true; exec sleep infinity"
autostart=true
autorestart=true
startsecs=1
stdout_logfile=$LOG_ROOT/bootstrap-supervisor.log
stderr_logfile=$LOG_ROOT/bootstrap-supervisor.err.log
priority=1
EOF
  supervisorctl reread || true
  supervisorctl update || true
  supervisorctl start llm whisper tts || true
else
  pkill -f "supervisord.*square-ai" || true
  nohup supervisord -c "$INSTALL_ROOT/supervisord.conf" > "$LOG_ROOT/supervisord.nohup.log" 2>&1 &
fi

cat <<'EOF'
Square AI services are installing/running under supervisord.

Useful commands:
  tail -f /models/logs/square-ai/llm.log
  tail -f /models/logs/square-ai/whisper.log
  tail -f /models/logs/square-ai/tts.log
  supervisorctl status
  supervisorctl -c /models/square-ai/supervisord.conf status

Health checks:
  source /models/square-ai/square-ai.env
  curl http://127.0.0.1:8000/v1/models -H "Authorization: Bearer $API_TOKEN"
  curl http://127.0.0.1:8080/v1/models
  curl http://127.0.0.1:8298/health
EOF
