#!/usr/bin/env bash
# ==============================================================================
# SSIP Production Deployment & Migration Script (TASK-10-03)
# Jeppiaar University — Student Skill Intelligence Platform
# ==============================================================================
set -euo pipefail

echo "======================================================================"
echo " Starting SSIP Production Deployment & Database Migration"
echo "======================================================================"

# 1. Check for .env file
if [ ! -f .env ]; then
    echo "[!] Error: .env file not found. Copy .env.example and populate production secrets."
    exit 1
fi

# 2. Build and launch database & cache services first
echo "[+] Starting PostgreSQL and Redis containers..."
docker compose -f docker-compose.prod.yml up -d postgres redis

# 3. Wait for PostgreSQL to be healthy
echo "[+] Waiting for PostgreSQL to be ready..."
until docker compose -f docker-compose.prod.yml exec postgres pg_isready -U "${POSTGRES_USER:-ssip_admin}" -d "${POSTGRES_DB:-ssip_prod}" > /dev/null 2>&1; do
    echo "    PostgreSQL starting up... retrying in 2s"
    sleep 2
done
echo "[✓] PostgreSQL is healthy."

# 4. Execute Alembic schema migrations on persistent DB
echo "[+] Running Alembic schema migrations..."
docker compose -f docker-compose.prod.yml run --rm api alembic upgrade head

# 5. Seed Jeppiaar University Academic Hierarchy & Skill Taxonomy
echo "[+] Seeding initial Jeppiaar University data..."
docker compose -f docker-compose.prod.yml run --rm api python -m app.scripts.seed_jeppiaar_data

# 6. Build and launch all application containers
echo "[+] Deploying SSIP API, Frontend, and Nginx Gateway..."
docker compose -f docker-compose.prod.yml up -d --build

# 7. Check container health status
echo "[+] Performing post-deployment health check..."
sleep 5
docker compose -f docker-compose.prod.yml ps

echo "======================================================================"
echo " [✓] Deployment Complete! SSIP is now live."
echo "     Health endpoint: https://ssip.jeppiaar.edu.in/api/v1/health"
echo "======================================================================"

