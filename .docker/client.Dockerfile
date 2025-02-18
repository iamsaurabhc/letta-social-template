FROM node:18-alpine AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy workspace files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/client ./apps/client
COPY packages/common ./packages/common

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build
RUN pnpm --filter client build

FROM node:18-alpine AS runner

WORKDIR /app

COPY --from=builder /app/apps/client/.next ./.next
COPY --from=builder /app/apps/client/public ./public
COPY --from=builder /app/apps/client/package.json ./

EXPOSE 3000

CMD ["pnpm", "start"]