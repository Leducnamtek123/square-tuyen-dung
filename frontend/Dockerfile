# Frontend development environment
FROM node:18.18

WORKDIR /myjob_web_app

# Optional proxy support for npm during build
ARG HTTP_PROXY
ARG HTTPS_PROXY
ARG NO_PROXY

# Make proxies available to npm if provided
ENV HTTP_PROXY=${HTTP_PROXY}
ENV HTTPS_PROXY=${HTTPS_PROXY}
ENV NO_PROXY=${NO_PROXY}

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN if [ -n "$HTTP_PROXY" ]; then npm config set proxy "$HTTP_PROXY"; fi \
  && if [ -n "$HTTPS_PROXY" ]; then npm config set https-proxy "$HTTPS_PROXY"; fi \
  && npm config set fetch-retries 5 \
  && npm config set fetch-retry-mintimeout 20000 \
  && npm config set fetch-retry-maxtimeout 120000 \
  && npm config set fetch-timeout 300000 \
  && npm install --no-audit --no-fund

# Copy all remaining application files
COPY . .

# Expose port for dev server
EXPOSE 3000

# Default command when container starts
CMD ["npm", "run", "start"]
