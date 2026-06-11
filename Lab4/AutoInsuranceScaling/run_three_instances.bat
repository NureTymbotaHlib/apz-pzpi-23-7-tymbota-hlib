@echo off
docker compose -f docker-compose.scaled.yml up -d --build
echo Scaled backend is available at http://localhost:8080/api/health
