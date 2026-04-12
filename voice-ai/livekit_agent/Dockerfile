# syntax=docker/dockerfile:1

# Use the official UV Python base image
ARG PYTHON_VERSION=3.12
FROM ghcr.io/astral-sh/uv:python${PYTHON_VERSION}-bookworm-slim AS base

ENV PYTHONUNBUFFERED=1 \
    HF_HOME=/home/appuser/.cache/huggingface \
    XDG_CACHE_HOME=/home/appuser/.cache

# Create a non-privileged user
ARG UID=10001
RUN adduser \
    --disabled-password \
    --gecos "" \
    --home "/home/appuser" \
    --shell "/sbin/nologin" \
    --uid "${UID}" \
    appuser

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc g++ libglib2.0-0 python3-dev ffmpeg git curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy dependency files
COPY pyproject.toml ./
RUN mkdir -p src

# Install dependencies using uv for speed and reliability
RUN uv pip install --system .

# Copy source code
COPY . .

# chown before downloading files
RUN chown -R appuser:appuser /app /home/appuser

# Switch to the non-privileged user
USER appuser

# Pre-download all necessary models (VAD, Turn Detector, etc.)
# This ensures they are baked into the image and don't fail at runtime
RUN python3 -m src.agent download-files

# Run the application
ENTRYPOINT ["python3", "-m", "src.agent"]
CMD ["start"]
