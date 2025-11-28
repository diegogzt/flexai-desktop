FROM node:20-bullseye-slim AS builder

# Install system dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    git \
    && rm -rf /var/lib/apt/lists/*

# Enable pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# Copy configuration files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.json biome.jsonc lefthook.yml ./

# Copy source directories
COPY packages/ ./packages/
COPY scripts/ ./scripts/
COPY patches/ ./patches/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build the application
# This runs the full monorepo build
RUN pnpm build

# Create production deployment in ./compiled
RUN node scripts/build-n8n.mjs

# ==============================================================================
# STAGE 2: Final Runtime Image
# ==============================================================================
FROM node:20-bullseye-slim

ENV NODE_ENV=production
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /home/node

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    tini \
    graphicsmagick \
    && rm -rf /var/lib/apt/lists/*

# Copy compiled app from builder stage
COPY --from=builder /app/compiled /usr/local/lib/node_modules/n8n

# Link n8n binary
RUN ln -s /usr/local/lib/node_modules/n8n/bin/n8n /usr/local/bin/n8n

# Create user directory and set permissions
RUN mkdir -p /home/node/.n8n && \
    chown -R node:node /home/node

# Switch to non-root user
USER node

# Expose default port
EXPOSE 5678

# Set entrypoint
ENTRYPOINT ["tini", "--"]
CMD ["n8n"]
