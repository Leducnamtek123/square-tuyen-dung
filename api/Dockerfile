# =============================================================================
# api/Dockerfile — Development
# =============================================================================
FROM python:3.11-slim

# Prevent .pyc files and enable unbuffered output
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libssl-dev \
    libffi-dev \
    libopenblas-dev \
    default-libmysqlclient-dev \
    pkg-config \
    curl \
    netcat-traditional \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN groupadd --gid 1000 appuser \
    && useradd --uid 1000 --gid appuser --create-home appuser

WORKDIR /api

# Install Python dependencies first (better layer caching)
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip setuptools wheel \
    && pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Ensure STATIC_ROOT exists to avoid WhiteNoise warnings
RUN mkdir -p /api/staticfiles

# Change ownership to non-root user
RUN chown -R appuser:appuser /api

# Switch to non-root user
USER appuser

EXPOSE 8001

CMD ["sh", "docker-entrypoint.sh", "python", "manage.py", "runserver", "0.0.0.0:8001"]
