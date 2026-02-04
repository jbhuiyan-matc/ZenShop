#!/bin/bash
echo "🚀 Starting ZenShop locally..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️ .env file not found. Creating from .env.example..."
    cp .env.example .env
    echo "✅ .env created."
fi

# Build and start containers
echo "📦 Building and starting containers..."
docker-compose -f docker-compose.yml up --build -d

echo "⏳ Waiting for services to be ready..."
sleep 10

echo "✅ ZenShop is running!"
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:5001"
echo "API Docs/Health: http://localhost:5001/health"
echo ""
echo "To stop: docker-compose down"
