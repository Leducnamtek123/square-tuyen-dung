# syntax=docker/dockerfile:1.5
ARG MIRROR_PREFIX=nvidia

# --- SINGLE STAGE BUILD FOR RELIABILITY ---
FROM ${MIRROR_PREFIX}/cuda:12.4.1-runtime-ubuntu22.04

ENV DEBIAN_FRONTEND=noninteractive \
    PYTHONUNBUFFERED=1 \
    HF_HOME=/root/.cache/huggingface \
    UV_HTTP_TIMEOUT=1000 \
    VIRTUAL_ENV=/opt/venv \
    PATH="/opt/venv/bin:$PATH"

# Install essential build tools and runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    software-properties-common \
    build-essential git curl ca-certificates ffmpeg espeak-ng libgomp1 \
    python3.10 python3.10-dev python3.10-venv \
    && rm -rf /var/lib/apt/lists/*

# Install UV
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /usr/bin/

WORKDIR /workspace

# Create virtual environment and install packages
# We use a single stage to ensure no path/symlink issues with the venv
RUN uv venv /opt/venv && \
    uv pip install --no-cache \
    "torch==2.4.0" "torchaudio==2.4.0" --index-url https://download.pytorch.org/whl/cu124 && \
    uv pip install --no-cache "vieneu[gpu]>=1.2.6" "loguru" "fastapi" "uvicorn" "pydantic" "numpy"

# Copy our bridge script
COPY api.py ./

EXPOSE 8298

# Use the full path to python in the venv to be absolutely sure
CMD ["/opt/venv/bin/python3", "api.py"]
