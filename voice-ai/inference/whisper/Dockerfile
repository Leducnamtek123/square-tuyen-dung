# syntax=docker/dockerfile:1.5
ARG MIRROR_PREFIX=docker.io/nvidia
ARG WHISPER_BASE=docker.io/nvidia/cuda:12.4.1-cudnn-runtime-ubuntu22.04@sha256:2fcc4280646484290cc50dce5e65f388dd04352b07cbe89a635703bd1f9aedb6
FROM docker.io/nvidia/cuda:12.4.1-cudnn-runtime-ubuntu22.04@sha256:2fcc4280646484290cc50dce5e65f388dd04352b07cbe89a635703bd1f9aedb6

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

# Install vox-box using pip to avoid wheel metadata issues with uv
# We must upgrade pip first to fix the resolvelib AssertionError bug in old pip versions
RUN pip3 install --no-cache-dir --upgrade pip \
    && pip3 install --no-cache-dir "setuptools<82.0" wheel \
    && pip3 install --no-cache-dir --no-build-isolation vox-box

ENV DATA_DIR=/data

RUN groupadd -g 1001 appuser && \
    useradd -u 1001 -g appuser -m appuser && \
    mkdir -p /data && \
    chown -R appuser:appuser /app /data

USER appuser

CMD ["sh", "-c", "vox-box start --host 0.0.0.0 --port 8080 --huggingface-repo-id ${VOXBOX_HF_REPO_ID:-deepdml/faster-whisper-large-v3-turbo-ct2} --data-dir ${DATA_DIR} --device ${VOXBOX_DEVICE:-cuda}"]
