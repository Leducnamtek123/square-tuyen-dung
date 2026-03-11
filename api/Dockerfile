FROM python:3.11-slim

WORKDIR /myjob_api

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

COPY requirements.txt .

RUN pip install --upgrade pip setuptools wheel
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["sh","-c","sleep 30 && python manage.py runserver 0.0.0.0:8000"]

EXPOSE 8000