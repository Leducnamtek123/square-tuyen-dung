# syntax=docker/dockerfile:1.5
ARG MIRROR_PREFIX=docker.io/nvidia
ARG WHISPER_BASE=${MIRROR_PREFIX}/cuda:12.4.1-cudnn-runtime-ubuntu22.04
FROM ${WHISPER_BASE}

ENV PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PYTHONUNBUFFERED=1

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    build-essential \
    ca-certificates \
    curl \
    python3-pip \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

# Install uv for fast & reliable package management
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

WORKDIR /app

# Install vox-box using uv with cache
RUN --mount=type=cache,target=/root/.cache/uv \
    uv pip install --system --no-cache-dir "setuptools<82.0" wheel \
    && uv pip install --system --no-build-isolation vox-box

ENV DATA_DIR=/data

CMD ["sh", "-c", "vox-box start --host 0.0.0.0 --port 8080 --huggingface-repo-id ${VOXBOX_HF_REPO_ID:-Systran/faster-whisper-medium} --data-dir ${DATA_DIR} --device ${VOXBOX_DEVICE:-cpu}"]
