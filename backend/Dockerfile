FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies and required libraries for Prisma
RUN apk add --no-cache openssl openssl-dev

COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Expose port
EXPOSE 5000

# Start simple test server instead of full application
CMD ["node", "src/simple-server.js"]
