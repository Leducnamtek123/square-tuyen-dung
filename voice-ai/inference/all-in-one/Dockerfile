# syntax=docker/dockerfile:1.5
ARG VLLM_IMAGE=vllm/vllm-openai:v0.10.1
FROM ${VLLM_IMAGE}

ENV DEBIAN_FRONTEND=noninteractive \
    PYTHONUNBUFFERED=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    HF_HOME=/models/huggingface \
    TRANSFORMERS_CACHE=/models/huggingface \
    DATA_DIR=/models/whisper \
    VLLM_HOST=0.0.0.0 \
    VLLM_PORT=8000 \
    STT_HOST=0.0.0.0 \
    STT_PORT=8080 \
    TTS_PORT=8298 \
    LLM_MODEL=Qwen/Qwen3-14B \
    LLM_SERVED_MODEL_NAME=qwen3-14b-interview \
    DTYPE=bfloat16 \
    GPU_MEMORY_UTILIZATION=0.55 \
    MAX_MODEL_LEN=8192 \
    MAX_NUM_SEQS=8 \
    TTS_GPU_MEM_FRACTION=0.30 \
    VOXBOX_HF_REPO_ID=Systran/faster-whisper-large-v3 \
    VOXBOX_DEVICE=cuda \
    TTS_DEVICE=cuda \
    TTS_CODEC_DEVICE=cuda \
    TTS_MODE=fast \
    TTS_BACKBONE_REPO=pnnbao-ump/VieNeu-TTS \
    TTS_GGUF_FILENAME=

USER root

RUN apt-get update && apt-get install -y --no-install-recommends \
      ca-certificates \
      curl \
      ffmpeg \
      espeak-ng \
      libgomp1 \
      libsndfile1 \
      python3.10 \
      python3.10-dev \
      python3.10-venv \
      build-essential \
      supervisor \
    && rm -rf /var/lib/apt/lists/*

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /usr/local/bin/

RUN python3.10 -m venv /opt/whisper-venv \
    && /opt/whisper-venv/bin/python -m pip install --no-cache-dir --upgrade pip "setuptools<82.0" wheel \
    && /opt/whisper-venv/bin/python -m pip install --no-cache-dir --no-build-isolation vox-box

RUN python3.10 -m venv /opt/tts-venv \
    && uv pip install --python /opt/tts-venv/bin/python --no-cache \
      "torch==2.7.1" "torchaudio==2.7.1" "torchvision==0.22.1" --index-url https://download.pytorch.org/whl/cu128 \
    && uv pip install --python /opt/tts-venv/bin/python --no-cache \
      "accelerate>=0.30.0" \
      "vieneu[gpu]==2.7.0" \
      "loguru" \
      "fastapi" \
      "uvicorn" \
      "pydantic" \
      "numpy" \
      "transformers>=4.45.0" \
      "torchao==0.12.0"

WORKDIR /opt/square-ai

COPY vieneu-text-to-speech/api.py /opt/square-ai/tts_api.py
COPY all-in-one/start_llm.sh /opt/square-ai/start_llm.sh
COPY all-in-one/start_whisper.sh /opt/square-ai/start_whisper.sh
COPY all-in-one/start_tts.sh /opt/square-ai/start_tts.sh
COPY all-in-one/supervisord.conf /etc/supervisor/conf.d/square-ai.conf

RUN chmod +x /opt/square-ai/start_llm.sh \
    /opt/square-ai/start_whisper.sh \
    /opt/square-ai/start_tts.sh \
    && mkdir -p /models/huggingface /models/whisper /var/log/square-ai

EXPOSE 8000 8080 8298

CMD ["supervisord", "-c", "/etc/supervisor/supervisord.conf", "-n"]
