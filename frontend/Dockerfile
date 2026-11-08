# Multi-stage production Dockerfile for SSIP Frontend (TASK-10-02)
# Traceability: DEPLOYMENT.md §5.2, FRONTEND_ARCHITECTURE.md §3.1

# ----------------- Stage 1: Build Application -----------------
FROM node:20-alpine AS builder

WORKDIR /app

# Enable pnpm via corepack
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy dependency manifests
COPY package.json pnpm-lock.yaml ./

# Install dependencies (frozen lockfile for repeatable builds)
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build static bundle for production
RUN pnpm run build

# ----------------- Stage 2: Serve via Nginx Alpine -----------------
FROM nginx:1.25-alpine AS runtime

# Remove default nginx configurations
RUN rm -rf /etc/nginx/conf.d/*

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled static assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]

