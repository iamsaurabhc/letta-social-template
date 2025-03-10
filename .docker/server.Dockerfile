# Build Stage
FROM node:18-alpine AS builder

# Install basic shell utilities and set environment
RUN apk add --no-cache bash
ENV SHELL=/bin/bash
ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="${PNPM_HOME}:${PATH}"

# Install pnpm with specific version matching package.json
RUN corepack enable && \
    corepack prepare pnpm@8.15.4 --activate

# Set working directory
WORKDIR /app

# Copy workspace config files first
COPY pnpm-workspace.yaml ./
COPY package.json pnpm-lock.yaml ./
COPY .npmrc ./

# Copy package.json files for workspace packages
COPY apps/server/package.json ./apps/server/
COPY packages/common/package.json ./packages/common/

# Install all dependencies (including devDependencies)
RUN pnpm install --no-frozen-lockfile

# Copy source code
COPY packages/common ./packages/common
COPY apps/server ./apps/server

# Build common package first
WORKDIR /app/packages/common
# Install dependencies and ensure types are available
RUN pnpm install typescript@5.3.3 --save-dev
RUN pnpm install --no-frozen-lockfile && \
    pnpm exec tsc --declaration --skipLibCheck

# Build server
WORKDIR /app/apps/server
RUN NODE_OPTIONS='--max-old-space-size=4096' pnpm build

# Production Stage
FROM node:18-alpine AS production

# Install Redis
RUN apk add --no-cache redis

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

WORKDIR /app

# Copy production files and common package
COPY --from=builder /app/apps/server/dist ./dist
COPY --from=builder /app/apps/server/package.json ./
COPY --from=builder /app/packages/common/dist ./node_modules/common/dist
COPY --from=builder /app/packages/common/package.json ./node_modules/common/

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/api/health || exit 1

# Start application
CMD ["node", "dist/main"]