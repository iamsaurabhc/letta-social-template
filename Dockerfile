# Build Stage
FROM node:18-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@8.15.4 --activate

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/server/package.json ./apps/server/
COPY packages/common/package.json ./packages/common/

# Install dependencies with production flag
RUN pnpm install --frozen-lockfile

# Copy source code
COPY apps/server ./apps/server
COPY packages/common ./packages/common

# Build application
WORKDIR /app/apps/server
RUN pnpm add -D ts-loader @types/node typescript @nestjs/cli
RUN NODE_OPTIONS='--max-old-space-size=4096' pnpm build

# Production Stage
FROM node:18-alpine AS production

# Install Redis
RUN apk add --no-cache redis

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

WORKDIR /app

# Copy built assets and install only production dependencies
COPY --from=builder --chown=nestjs:nodejs /app/apps/server/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/apps/server/package.json ./
RUN corepack enable && corepack prepare pnpm@8.15.4 --activate && \
    pnpm install --prod --frozen-lockfile

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