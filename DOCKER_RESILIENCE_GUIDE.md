# Docker Resilience Implementation Guide

## Summary of Changes

All Docker services have been configured with health checks, automatic restart policies, and connection retry logic to ensure maximum uptime.

## What Was Implemented

### 1. Docker Compose Health Checks (`docker-compose.yml`)

#### PostgreSQL
- **Health Check**: `pg_isready -U zenshop`
- **Interval**: 10s
- **Timeout**: 5s
- **Retries**: 5
- **Start Period**: 30s

#### Redis
- **Health Check**: `redis-cli ping`
- **Interval**: 10s
- **Timeout**: 3s
- **Retries**: 5
- **Start Period**: 10s

#### Backend
- **Health Check**: HTTP GET to `/health` endpoint
- **Interval**: 15s
- **Timeout**: 10s
- **Retries**: 3
- **Start Period**: 60s

### 2. Service Dependencies with Health Conditions

The backend service now waits for PostgreSQL and Redis to be **healthy** (not just started) before launching:

```yaml
depends_on:
  zenshop-postgres:
    condition: service_healthy
  zenshop-redis:
    condition: service_healthy
```

### 3. Automatic Restart Policies

All services have `restart: unless-stopped` configured, meaning:
- Containers restart automatically on failure
- Containers restart after system reboot
- Only manual `docker stop` prevents restart

### 4. Database Connection Retry Logic

Created centralized database utility (`backend/src/utils/database.js`):
- **5 retry attempts** with exponential backoff
- Delays: 2s, 4s, 8s, 16s, 32s
- Logs each connection attempt
- Fails gracefully after all retries exhausted

### 5. Redis Connection Retry Logic

Updated Redis utility (`backend/src/utils/redis.js`):
- **5 retry attempts** with exponential backoff
- Delays: 2s, 4s, 8s, 16s, 32s
- Proceeds without caching if Redis unavailable
- Doesn't crash the application

### 6. Centralized Prisma Client

All routes now use a single Prisma instance with retry logic:
- `backend/src/utils/database.js` - Central database connection
- Updated all route files to use `getPrisma()`
- Eliminates multiple database connection overhead

### 7. Backend Dockerfile Enhancement

Added `wget` to the container for health check endpoint testing.

## Files Modified

1. **`docker-compose.yml`** - Health checks and dependency conditions
2. **`backend/Dockerfile`** - Added wget package
3. **`backend/src/utils/database.js`** - Created (new file)
4. **`backend/src/utils/redis.js`** - Added retry logic
5. **`backend/src/index.js`** - Initialize connections with retry
6. **`backend/src/routes/auth.js`** - Use centralized Prisma
7. **`backend/src/routes/products.js`** - Use centralized Prisma
8. **`backend/src/routes/cart.js`** - Use centralized Prisma
9. **`backend/src/routes/orders.js`** - Use centralized Prisma
10. **`backend/src/routes/admin.js`** - Use centralized Prisma
11. **`backend/src/routes/categories.js`** - Use centralized Prisma
12. **`backend/src/middleware/auth.js`** - Use centralized Prisma

## How to Test

### 1. Start All Services

```bash
sudo docker compose up --build
```

### 2. Verify Health Status

Check that all services show `(healthy)` status:

```bash
sudo docker ps
```

Expected output should show:
- `zenshop-postgres` - (healthy)
- `zenshop-redis` - (healthy)
- `zenshop-backend` - (healthy)

### 3. Test Auto-Restart on Failure

Kill the backend container:
```bash
sudo docker kill zenshop-backend
```

Verify it automatically restarts:
```bash
sudo docker ps
```

The container should be running again within seconds.

### 4. Test Database Dependency

Stop postgres to simulate database failure:
```bash
sudo docker stop zenshop-postgres
```

Watch backend logs:
```bash
sudo docker logs -f zenshop-backend
```

You should see retry attempts in the logs. Then restart postgres:
```bash
sudo docker start zenshop-postgres
```

### 5. Test Health Endpoint

```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "UP",
  "timestamp": "2026-03-27T03:47:00.000Z",
  "uptime": 123.456
}
```

### 6. Simulate System Restart

Reboot your system. After restart, verify all containers auto-start:
```bash
sudo docker ps
```

## Monitoring Commands

### View all container statuses
```bash
sudo docker ps
```

### View backend logs
```bash
sudo docker logs -f zenshop-backend
```

### View postgres logs
```bash
sudo docker logs -f zenshop-postgres
```

### View redis logs
```bash
sudo docker logs -f zenshop-redis
```

### Check health check details
```bash
sudo docker inspect zenshop-backend | grep -A 20 Health
```

## Troubleshooting

### Container keeps restarting
Check logs for errors:
```bash
sudo docker logs zenshop-backend
```

### Health check failing
Manually test the health endpoint:
```bash
sudo docker exec zenshop-backend wget --spider http://localhost:5000/health
```

### Database connection issues
Ensure postgres is healthy:
```bash
sudo docker exec zenshop-postgres pg_isready -U zenshop
```

### Redis connection issues
Ensure redis is responsive:
```bash
sudo docker exec zenshop-redis redis-cli ping
```

## Production Considerations

For production deployment, consider:

1. **Change restart policy** to `restart: always` for more aggressive recovery
2. **Set up monitoring** with tools like Prometheus/Grafana
3. **Configure log rotation** to prevent disk space issues
4. **Use Docker secrets** for sensitive environment variables
5. **Set resource limits** (memory, CPU) to prevent resource exhaustion
6. **Enable TLS/SSL** for database connections
7. **Add backup strategy** for PostgreSQL volumes
8. **Implement alerting** for repeated health check failures

## Notes

- Frontend is NOT dockerized (runs separately as requested)
- All backend services have automatic restart enabled
- Health checks ensure services are truly ready, not just started
- Connection retry logic prevents startup race conditions
- Exponential backoff prevents overwhelming failed services
