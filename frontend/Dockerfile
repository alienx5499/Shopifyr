FROM node:22-alpine AS builder

WORKDIR /app

# Enable pnpm via corepack
RUN corepack enable

# Copy dependency manifests
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install dependencies (including devDependencies for build)
RUN pnpm install --frozen-lockfile

# Copy the rest of the frontend source
COPY . .

# Build Next.js app
RUN pnpm build

FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production

RUN corepack enable

# Copy built app and node_modules from builder
COPY --from=builder /app ./

EXPOSE 3000

CMD ["pnpm", "start", "-p", "3000", "-H", "0.0.0.0"]

