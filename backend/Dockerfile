FROM node:20-slim

WORKDIR /app

# Install OpenSSL for Prisma and wget for health checks
RUN apt-get update -y && apt-get install -y openssl wget

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

# Start script that runs migrations then starts the app
CMD ["npm", "start"]
