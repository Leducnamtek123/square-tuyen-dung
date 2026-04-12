# syntax=docker/dockerfile:1.5
ARG MIRROR_PREFIX=docker.io/nvidia

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
# NOTE: PyTorch 2.6.0 is required to match the NCCL version in cuda:12.4.1-runtime
#       PyTorch 2.4.0 was built against an older NCCL, causing:
#       "undefined symbol: ncclCommWindowDeregister"
RUN uv venv /opt/venv && \
    uv pip install --no-cache \
    "torch==2.5.1" "torchaudio==2.5.1" --index-url https://download.pytorch.org/whl/cu124 && \
    uv pip install --no-cache "accelerate>=0.30.0" "vieneu[gpu]>=1.2.6" "loguru" "fastapi" "uvicorn" "pydantic" "numpy" && \
    uv pip install --no-cache "transformers>=4.45.0" "torchao>=0.6.0"

# Ensure PyTorch's bundled NCCL takes priority over the system one
ENV LD_LIBRARY_PATH="/opt/venv/lib/python3.10/site-packages/torch/lib:${LD_LIBRARY_PATH}"

# Copy our bridge script
COPY api.py ./

EXPOSE 8298

# Use the full path to python in the venv to be absolutely sure
CMD ["/opt/venv/bin/python3", "api.py"]
