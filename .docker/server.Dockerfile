FROM node:18-alpine AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy workspace files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/server ./apps/server
COPY packages/common ./packages/common

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build
RUN pnpm --filter server build

FROM node:18-alpine AS runner

WORKDIR /app

COPY --from=builder /app/apps/server/dist ./dist
COPY --from=builder /app/apps/server/package.json ./

EXPOSE 3000

CMD ["node", "dist/main"]