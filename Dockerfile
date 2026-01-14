# Build stage
FROM oven/bun:1-slim AS builder

WORKDIR /app

# Copy package files
COPY package.json bun.lock ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy application code
COPY . .

# Generate database types
RUN bun db:generate

# Set dummy variables for build time to prevent crashes during static analysis
ARG DATABASE_URL="postgresql://user:password@localhost/placeholder"
ARG BETTER_AUTH_SECRET="placeholder_secret_at_least_32_characters_long"
ARG BETTER_AUTH_URL="http://localhost:3000"
ARG NEXT_PUBLIC_APP_URL="http://localhost:3000"
ARG RESEND_API_KEY="re_placeholder"
ARG GOOGLE_CLIENT_ID="placeholder_id"
ARG GOOGLE_CLIENT_SECRET="placeholder_secret"
ARG EMAIL_SENDER_NAME="Inflow"
ARG EMAIL_SENDER_ADDRESS="onboarding@resend.dev"

ENV DATABASE_URL=$DATABASE_URL
ENV BETTER_AUTH_SECRET=$BETTER_AUTH_SECRET
ENV BETTER_AUTH_URL=$BETTER_AUTH_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV RESEND_API_KEY=$RESEND_API_KEY
ENV GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID
ENV GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET
ENV EMAIL_SENDER_NAME=$EMAIL_SENDER_NAME
ENV EMAIL_SENDER_ADDRESS=$EMAIL_SENDER_ADDRESS
ENV NEXT_TELEMETRY_DISABLED=1

RUN bun run build

# Production stage
FROM oven/bun:1-slim AS runner

WORKDIR /app

# Set environment to production
ENV NODE_ENV=production

# Create a non-root user
RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 --gid nodejs --create-home --shell /bin/false nextjs

# Copy necessary files from builder
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to non-root user
USER nextjs

# Expose the application port
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the application
CMD ["bun", "server.js"]
