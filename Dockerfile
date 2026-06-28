# ---- Build stage ----
# Use Node 20 LTS slim image for smaller size
FROM node:20-slim AS build

WORKDIR /app

# Copy package files first for better layer caching.
# If package*.json doesn't change, npm ci is cached.
COPY package*.json ./

# Use npm ci for reproducible installs from package-lock.json
RUN npm ci

# Copy the rest of the source
COPY . .

# Build the Vite frontend into /app/dist
RUN npm run build

# ---- Runtime stage ----
# Smaller, leaner production image
FROM node:20-slim AS runtime

WORKDIR /app

ENV NODE_ENV=production

# Copy package files and install ONLY production deps + tsx (needed to run server.ts).
# tsx is in devDependencies, so we install it explicitly here.
COPY package*.json ./
RUN npm ci --omit=dev && npm install tsx@^4.21.0 --no-save

# Copy built assets and server source from build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/server.ts ./server.ts
COPY --from=build /app/tsconfig.json ./tsconfig.json
COPY --from=build /app/src ./src
COPY --from=build /app/firebase-applet-config.json ./firebase-applet-config.json

# Cloud Run injects the PORT env var (default 8080). Document it for clarity.
ENV PORT=8080
EXPOSE 8080

# Run the Express server which serves the built /dist assets in production
CMD ["npm", "start"]
