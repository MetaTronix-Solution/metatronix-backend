# Stage 1: Build
FROM node:24-alpine AS builder

WORKDIR /app

# Copy dependency files first
COPY package*.json ./

# Install all dependencies including devDependencies
RUN npm ci

# Copy source code and TypeScript configuration
COPY tsconfig.json ./
COPY src ./src

# Compile TypeScript
RUN npm run build

# Stage 2: Production
FROM node:24-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev && npm cache clean --force

# Copy compiled application from builder
COPY --from=builder /app/dist ./dist

# Application port
EXPOSE 4000

# Start application
CMD ["node", "dist/server.js"]