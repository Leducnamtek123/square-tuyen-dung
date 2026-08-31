# =============================================================================
# frontend/Dockerfile — Development
# =============================================================================
FROM node:22-slim

WORKDIR /project_web_app

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Install dependencies first (layer caching)
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./

RUN pnpm install

# Copy application code
COPY . .

EXPOSE 80

CMD ["pnpm", "run", "dev"]
