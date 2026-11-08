# SSIP Production Deployment & Operations Runbook

**Document Reference:** `docs/DEPLOYMENT_RUNBOOK.md`  
**Governing Specifications:** [DEPLOYMENT.md](file:///D:/R/DEPLOYMENT.md), [SYSTEM_ARCHITECTURE.md](file:///D:/R/SYSTEM_ARCHITECTURE.md), [SECURITY_ARCHITECTURE.md](file:///D:/R/SECURITY_ARCHITECTURE.md), [DATA_PRIVACY_AND_RETENTION.md](file:///D:/R/DATA_PRIVACY_AND_RETENTION.md)  
**Target Environment:** Linux VPS (Ubuntu 24.04 LTS), KVM, Docker 26+, Docker Compose v2+  
**Institutional Scope:** Jeppiaar University  

---

## 1. System Requirements & Provisioning

### 1.1 VPS Hardware Specification
| Resource | Minimum Requirement | Production Recommended |
|---|---|---|
| **CPU** | 2 vCPU | 4 vCPU |
| **RAM** | 4 GB | 8 GB |
| **Storage** | 50 GB NVMe SSD | 100 GB NVMe SSD |
| **Network** | 1 Gbps port | 1 Gbps redundant uplink |
| **Public IP** | 1 Dedicated IPv4 | 1 Dedicated IPv4 + IPv6 |

### 1.2 DNS Architecture
Ensure the following DNS `A` records point to the VPS public IP:
- `ssip.jeppiaar.edu.in` -> VPS IPv4 (Frontend & Reverse Proxy)
- `api.ssip.jeppiaar.edu.in` -> VPS IPv4 (Direct API Gateway fallback)

---

## 2. Server Hardening & Base Setup

Log in as `root` via SSH and execute the initial security baseline:

```bash
# 1. Update system packages
apt update && apt upgrade -y

# 2. Create non-root deployer user with sudo privileges
adduser deployer
usermod -aG sudo deployer

# 3. Configure UFW Firewall
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP (Let's Encrypt challenge & redirect)
ufw allow 443/tcp   # HTTPS
ufw enable

# 4. Install Docker Engine and Docker Compose Plugin
apt install -y ca-certificates curl gnupg lsb-release
mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# 5. Grant deployer user Docker permissions
usermod -aG docker deployer
```

---

## 3. Application Deployment Workflow

Switch to the `deployer` user:
```bash
su - deployer
git clone https://github.com/jeppiaar-university/ssip.git
cd ssip
```

### 3.1 Environment Configuration
Create the production `.env` file:
```bash
cp .env.example .env
nano .env
```
Ensure the following production secrets are configured:
```env
APP_ENV=production
DEBUG=false
SECRET_KEY=<GENERATE_64_CHAR_HEX_SECRET>
POSTGRES_DB=ssip_prod
POSTGRES_USER=ssip_admin
POSTGRES_PASSWORD=<STRONG_POSTGRES_PASSWORD>
REDIS_URL=redis://redis:6379/0
CORS_ORIGINS=https://ssip.jeppiaar.edu.in
MAX_UPLOAD_SIZE_MB=20
SESSION_RETENTION_HOURS=24
```

### 3.2 SSL Certificate Generation (Certbot)
Before starting Nginx with SSL, obtain a Let's Encrypt certificate:
```bash
# Initial standalone certbot issuance
docker run -it --rm -p 80:80 \
  -v $(pwd)/certbot/conf:/etc/letsencrypt \
  -v $(pwd)/certbot/www:/var/www/certbot \
  certbot/certbot certonly --standalone \
  -d ssip.jeppiaar.edu.in --email admin@jeppiaar.edu.in --agree-tos --no-eff-email
```

### 3.3 Execute Automated Deployment Runner
Run the deployment script:
```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

---

## 4. Verification and Smoke Testing

Verify that all services are operational:
```bash
# 1. Container status check
docker compose -f docker-compose.prod.yml ps

# 2. Backend healthcheck probe
curl -k https://localhost/api/v1/health

# 3. Verify zero database retention
docker compose -f docker-compose.prod.yml exec postgres psql -U ssip_admin -d ssip_prod -c "\dt"
```
The table list must **never** contain student identifiers, roll numbers, or student assessment data.

---

## 5. Maintenance & Disaster Recovery

### 5.1 Database Backup (Persistent Structure Only)
Only persistent taxonomy, academic structures, and user accounts are backed up:
```bash
# Nightly backup cron
docker compose -f docker-compose.prod.yml exec -T postgres pg_dump -U ssip_admin -d ssip_prod | gzip > /backups/ssip_structure_$(date +%F).sql.gz
```

### 5.2 Zero-Retention Emergency Data Purge
To immediately purge all active ephemeral assessment sessions and unlinked files:
```bash
# Flush Redis volatile cache
docker compose -f docker-compose.prod.yml exec redis redis-cli FLUSHALL

# Remove temporary export files
docker compose -f docker-compose.prod.yml exec api rm -rf /tmp/ssip_exports/*
```

### 5.3 Automated Rollback Procedure
If a release causes degradation:
```bash
# Stop current release
docker compose -f docker-compose.prod.yml down

# Checkout prior stable Git commit
git checkout HEAD~1

# Re-run deployment script
./scripts/deploy.sh
```

