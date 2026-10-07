# =============================================================================
# frontend/Dockerfile — Development
# =============================================================================
FROM node:22-slim@sha256:43ac6c60b8f89723f746e8a92ce91abd5017e627ce1ddfe4238355d3a30b772c

WORKDIR /project_web_app

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Install dependencies first (layer caching)
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* .npmrc* ./

RUN pnpm install --ignore-scripts

# Copy application code
COPY . .

# Use non-root user
USER node

EXPOSE 80

CMD ["pnpm", "run", "dev"]
