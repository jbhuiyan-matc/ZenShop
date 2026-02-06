@echo off
echo Starting ZenShop locally...

REM Check if .env exists
if not exist .env (
    echo .env file not found. Creating from .env.example...
    copy .env.example .env
    echo .env created.
)

REM Detect docker compose command (v2 plugin vs v1 standalone)
docker compose version >nul 2>&1
if %errorlevel%==0 (
    set DC=docker compose
) else (
    docker-compose version >nul 2>&1
    if %errorlevel%==0 (
        set DC=docker-compose
    ) else (
        echo ERROR: Docker Compose is not installed.
        echo Please install Docker Desktop from https://www.docker.com/products/docker-desktop
        exit /b 1
    )
)

REM Build and start containers
echo Building and starting containers...
%DC% -f docker-compose.yml up --build -d

echo Waiting for services to be ready...
timeout /t 10 /nobreak >nul

echo ZenShop is running!
echo Frontend: http://localhost:3000
echo Backend: http://localhost:5001
echo API Docs/Health: http://localhost:5001/health
echo.
echo To stop: %DC% down
