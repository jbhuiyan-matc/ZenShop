Write-Host "🚀 Starting ZenShop locally..."

# Check if .env exists
if (-not (Test-Path .env)) {
    Write-Host "⚠️ .env file not found. Creating from .env.example..."
    Copy-Item .env.example .env
    Write-Host "✅ .env created."
}

# Build and start containers
Write-Host "📦 Building and starting containers..."
docker-compose -f docker-compose.yml up --build -d

Write-Host "⏳ Waiting for services to be ready..."
Start-Sleep -Seconds 10

Write-Host "✅ ZenShop is running!"
Write-Host "Frontend: http://localhost:3000"
Write-Host "Backend: http://localhost:5001"
Write-Host "API Docs/Health: http://localhost:5001/health"
Write-Host ""
Write-Host "To stop: docker-compose down"
