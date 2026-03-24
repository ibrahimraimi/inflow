# Base stage for oven/bun
FROM oven/bun:1-slim AS base
WORKDIR /app

# Build stage
FROM base AS builder
ARG APP_NAME
ENV APP_NAME=$APP_NAME

# Set dummy variables for build time
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Copy all files for build
COPY . .

# Install dependencies
RUN bun install --frozen-lockfile

# Generate database types
RUN bun --filter @inflow/db db:generate

# Build the specific app
RUN bun x turbo build --filter=$APP_NAME...

# Production stage
FROM base AS runner
ARG APP_NAME
ENV APP_NAME=$APP_NAME
WORKDIR /app

# Set environment to production
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create a non-root user
RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 --gid nodejs --create-home --shell /bin/false nextjs

# Copy necessary files from builder
# Next.js standalone output in monorepo includes all necessary files
COPY --from=builder --chown=nextjs:nodejs /app/apps/${APP_NAME}/public ./apps/${APP_NAME}/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/${APP_NAME}/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/${APP_NAME}/.next/static ./apps/${APP_NAME}/.next/static

# Switch to non-root user
USER nextjs

# Expose the application port
EXPOSE 3000

# Start the application
# Use the APP_NAME to find the server.js
CMD ["sh", "-c", "bun apps/${APP_NAME}/server.js"]
