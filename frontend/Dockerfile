# =============================================================================
# frontend/Dockerfile — Development
# =============================================================================
FROM node:20-slim

WORKDIR /project_web_app

# Install dependencies first (layer caching)
COPY --chown=node:node package*.json ./

ENV NPM_CONFIG_INCLUDE_OPTIONAL=true
RUN npm ci --include=optional --no-audit --no-fund --legacy-peer-deps

# Copy application code
COPY --chown=node:node . .

USER node

EXPOSE 80

CMD ["npm", "run", "dev"]
