@echo off
echo Starting ZenShop locally...

REM Check if .env exists
if not exist .env (
    echo .env file not found. Creating from .env.example...
    copy .env.example .env
    echo .env created.
)

REM Build and start containers
echo Building and starting containers...
docker-compose -f docker-compose.yml up --build -d

echo Waiting for services to be ready...
timeout /t 10 /nobreak >nul

echo ZenShop is running!
echo Frontend: http://localhost:3000
echo Backend: http://localhost:5001
echo API Docs/Health: http://localhost:5001/health
echo.
echo To stop: docker-compose down
