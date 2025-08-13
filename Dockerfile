# Base stage
FROM node:20-alpine AS base
RUN npm install -g pnpm
WORKDIR /app
COPY package*.json pnpm-lock.yaml ./

# Development stage
FROM base AS development
RUN pnpm install
COPY . .
EXPOSE 3030
CMD ["pnpm", "run", "start:dev"]

# Build stage
FROM base AS build
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build

# Production stage
FROM node:20-alpine AS production
RUN npm install -g pnpm
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package*.json ./
EXPOSE 3030
CMD ["pnpm", "run", "start:prod"]
