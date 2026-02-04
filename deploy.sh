#!/bin/bash
set -e

# ZenShop Deployment Script
echo " Starting ZenShop deployment..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo " Error: .env file not found!"
    echo "Please create a .env file from .env.example"
    exit 1
fi

# Create required directories
echo "📁 Creating required directories..."
mkdir -p logs
mkdir -p infra/nginx/logs
mkdir -p infra/nginx/ssl

# Check if SSL certificates exist
if [ ! -f infra/nginx/ssl/fullchain.pem ] || [ ! -f infra/nginx/ssl/privkey.pem ]; then
    echo "Warning: SSL certificates not found in infra/nginx/ssl/"
    echo "You should add proper SSL certificates before going to production."
    echo "For testing, you can generate self-signed certificates with:"
    echo "openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout infra/nginx/ssl/privkey.pem -out infra/nginx/ssl/fullchain.pem"
fi

# Pull latest code if in a git repository
if [ -d .git ]; then
    echo "Pulling latest code..."
    git pull
fi

# Build and start containers
echo " Building Docker containers..."
docker-compose -f docker-compose.prod.yml build

echo "Starting Docker containers..."
docker-compose -f docker-compose.prod.yml up -d

# Run database migrations
echo "Running database migrations..."
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy

# Optional: Seed the database
read -p "Do you want to seed the database with initial data? (y/n): " seed_db
if [ "$seed_db" = "y" ]; then
    echo " Seeding database..."
    docker-compose -f docker-compose.prod.yml exec backend npm run seed
fi

# Check container health
echo " Checking container health..."
docker-compose -f docker-compose.prod.yml ps

echo " Deployment completed! Your ZenShop application should be running at:"
echo "https://YOUR_DOMAIN"
echo ""
echo "Next steps:"
echo "1. Configure your domain DNS to point to this server"
echo "2. Set up a firewall according to your network diagram"
echo "3. Configure monitoring with Security Onion"
