# ── Stage 1: Build ────────────────────────────────────────────────────────────
# Use Node 20 LTS on Alpine (small base image)
FROM node:20-alpine AS builder

WORKDIR /app

# Copy manifests first — Docker layer cache skips npm install if unchanged
COPY package*.json ./

# Install ALL deps (includes devDependencies for `prisma generate`)
RUN npm ci

# Copy Prisma schema and generate the Prisma client
COPY prisma ./prisma
RUN npx prisma generate

# ── Stage 2: Production image ─────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

# Copy manifests and install production deps only
COPY package*.json ./
RUN npm ci --omit=dev

# Copy the generated Prisma client from the builder stage
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client

# Copy application source
COPY . .

# Expose the port the server listens on
EXPOSE 5000

# Run the server (migrations are handled externally via render.yaml / compose)
CMD ["node", "server.js"]
