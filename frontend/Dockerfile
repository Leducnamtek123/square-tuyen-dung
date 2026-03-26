# =============================================================================
# frontend/Dockerfile — Development
# =============================================================================
FROM node:20-slim

WORKDIR /project_web_app

# Install dependencies first (layer caching)
COPY package*.json ./

ENV NPM_CONFIG_INCLUDE_OPTIONAL=true
RUN npm ci --include=optional --no-audit --no-fund --legacy-peer-deps

# Copy application code
COPY . .

# Ownership for non-root user (node user exists in base image)
RUN chown -R node:node /project_web_app

USER node

EXPOSE 80

CMD ["npm", "run", "dev"]
