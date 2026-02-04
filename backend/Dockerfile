FROM node:18-alpine
LABEL org.opencontainers.image.source https://github.com/jbhuiyan-matc/ZenShop

# Set working directory
WORKDIR /app

# Install dependencies and required libraries for Prisma
RUN apk add --no-cache openssl openssl-dev

COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 5000

# Regenerate Prisma client at runtime to ensure correct binary target
CMD npx prisma generate && npm start
