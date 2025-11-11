# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY packages/game-engine/package*.json ./packages/game-engine/
COPY packages/backend/package*.json ./packages/backend/

# Install dependencies
RUN npm ci

# Copy source code
COPY packages/game-engine ./packages/game-engine
COPY packages/backend ./packages/backend
COPY tsconfig.json ./

# Build
RUN npm run build:engine
RUN npm run build:backend

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY packages/game-engine/package*.json ./packages/game-engine/
COPY packages/backend/package*.json ./packages/backend/

# Install production dependencies only
RUN npm ci --production

# Copy built files from builder
COPY --from=builder /app/packages/game-engine/dist ./packages/game-engine/dist
COPY --from=builder /app/packages/backend/dist ./packages/backend/dist

# Create logs directory
RUN mkdir -p logs

# Expose port
EXPOSE 3000

# Start server
CMD ["node", "packages/backend/dist/server.js"]
