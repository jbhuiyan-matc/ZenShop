FROM node:20-slim

WORKDIR /app

# Install OpenSSL for Prisma and wget for health checks
RUN apt-get update -y && apt-get install -y openssl wget

# Install PM2 globally for process management
RUN npm install -g pm2

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies and generate Prisma client
RUN npm ci
RUN npx prisma generate

# Copy source code
COPY . .

# Expose port
EXPOSE 5000

# Start script that runs migrations, seeds, then starts the app with PM2
CMD ["sh", "-c", "npx prisma migrate deploy && node prisma/seed.js && pm2-runtime ecosystem.config.cjs"]
