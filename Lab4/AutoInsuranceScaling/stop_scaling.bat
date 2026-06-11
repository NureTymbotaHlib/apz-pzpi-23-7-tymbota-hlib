@echo off
docker compose -f docker-compose.single.yml down
docker compose -f docker-compose.scaled.yml down
