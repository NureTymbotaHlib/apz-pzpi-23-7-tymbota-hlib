@echo off
docker compose -f docker-compose.single.yml up -d --build
echo Single-instance backend is available at http://localhost:8080/api/health
