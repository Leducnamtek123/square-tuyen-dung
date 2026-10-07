# syntax=docker/dockerfile:1.5
FROM ghcr.io/astral-sh/uv:python3.11-bookworm-slim@sha256:4f5d923c9dcea037f57bda425dd209f3ec643da2f0b74227f68d09dab0b3bb36

ENV DEBIAN_FRONTEND=noninteractive \
    PYTHONUNBUFFERED=1

# Install system runtime dependencies: ffmpeg, libgl1, libglib2.0, curl
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    libgl1 \
    libglib2.0-0 \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy dependency requirements
COPY requirements.txt .

# Install PyTorch with CUDA 12.1 for GPU acceleration, then other packages
RUN uv pip install --system --no-cache \
    torch torchvision --index-url https://download.pytorch.org/whl/cu121 && \
    uv pip install --system --no-cache -r requirements.txt

# Copy source code and default avatars
COPY . .

# Ensure media and data folders exist
RUN mkdir -p media/renders data && \
    groupadd -g 1001 appuser && \
    useradd -u 1001 -g appuser -m appuser && \
    chown -R appuser:appuser /app

USER appuser

EXPOSE 8010

CMD ["python", "app.py", "--transport", "webrtc", "--model", "wav2lip", "--avatar_id", "ng_c_linh", "--batch_size", "2", "--listenport", "8010", "--tts", "metaconnect"]
