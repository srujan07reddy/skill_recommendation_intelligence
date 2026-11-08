\# DEPLOYMENT.md



\*\*Project:\*\* Student Skill Intelligence Platform (SSIP)  

\*\*Document Version:\*\* 1.0  

\*\*Status:\*\* Proposed Deployment Architecture  

\*\*Application:\*\* React + TypeScript + FastAPI  

\*\*Infrastructure:\*\* Linux VPS + Docker  

\*\*Reverse Proxy:\*\* Nginx  

\*\*Deployment Model:\*\* Single-region, modular monolith



\---



\## 1. Purpose



This document defines the deployment architecture, infrastructure requirements, environment configuration, containerization, networking, security, monitoring, backup, and operational procedures for SSIP.



The deployment architecture must support:



\- Secure access to the web application.

\- Reliable communication between frontend and backend.

\- Temporary assessment-data processing.

\- Bulk file uploads.

\- Analytical processing.

\- Background jobs where required.

\- Report and export generation.

\- Automatic temporary-data cleanup.

\- Role-based access.

\- Controlled application updates.

\- Operational monitoring.



The deployment must maintain the platform's central data-retention requirement:



\*\*Student skill assessment records must not be permanently stored.\*\*



Persistent platform configuration, identity records, and approved governance records must be handled separately.



\## 2. Deployment Objectives



1\. Deploy the application as a publicly accessible web platform.

2\. Separate frontend and backend responsibilities.

3\. Use HTTPS for all production communication.

4\. Containerize backend services.

5\. Provide controlled temporary storage.

6\. Support file uploads and analytical processing.

7\. Automate session and export cleanup.

8\. Protect application secrets.

9\. Monitor resource usage and application health.

10\. Support repeatable releases and rollback.



\## 3. Deployment Architecture



\### 3.1 Recommended architecture



The proposed initial deployment uses:



\- Frontend: Vercel or Nginx-hosted static application.

\- Backend: Linux VPS.

\- Application server: FastAPI with Uvicorn.

\- Reverse proxy: Nginx.

\- Containerization: Docker.

\- Orchestration: Docker Compose.

\- Temporary shared storage: Redis, when multiple workers or shared state are required.

\- Persistent database: Only for approved persistent entities.

\- File storage: Protected temporary filesystem.



\### 3.2 Architecture diagram



```text

&#x20;                   INTERNET

&#x20;                      |

&#x20;                      v

&#x20;                 DOMAIN / DNS

&#x20;                      |

&#x20;                      v

&#x20;                HTTPS / TLS

&#x20;                      |

&#x20;             +--------+--------+

&#x20;             |                 |

&#x20;             v                 v

&#x20;       FRONTEND             BACKEND

&#x20;       Vercel or             Linux VPS

&#x20;       Nginx hosting             |

&#x20;                                 v

&#x20;                             NGINX

&#x20;                                 |

&#x20;                                 v

&#x20;                          FASTAPI / UVICORN

&#x20;                                 |

&#x20;            +--------------------+--------------------+

&#x20;            |                    |                    |

&#x20;            v                    v                    v

&#x20;      Application           Processing           API Services

&#x20;        Modules                Worker

&#x20;            |                    |

&#x20;            +--------------------+

&#x20;                                 |

&#x20;                  +--------------+--------------+

&#x20;                  |              |              |

&#x20;                  v              v              v

&#x20;             Redis /         Protected       Persistent

&#x20;             Temporary       Temporary       Configuration

&#x20;             State           Filesystem      Store

```



This architecture is a deployment target, not a requirement to deploy every supporting service from the first development iteration.



\### 3.3 Request flow



1\. The user accesses the frontend through the configured domain.

2\. The frontend communicates with the backend over HTTPS.

3\. DNS directs backend API requests to the VPS.

4\. Nginx terminates TLS and forwards requests to FastAPI.

5\. FastAPI authenticates and authorizes the request.

6\. Business modules process the operation.

7\. Temporary state and files are handled by their designated storage components.

8\. The backend returns the result or processing-job reference.

9\. The frontend displays the response or tracks the processing operation.



\## 4. Infrastructure Requirements



\### 4.1 Initial VPS configuration



The proposed initial production configuration is a Linux KVM VPS.



| Resource | Recommended starting point |

|---|---|

| CPU | 2 vCPU |

| RAM | 4 GB |

| Storage | 100 GB NVMe |

| Bandwidth | According to provider plan |

| Operating system | Ubuntu Server LTS |

| Public IP | Dedicated IPv4 |

| Virtualization | KVM |

| Access | SSH with administrative control |



These are planning values, not guaranteed capacity requirements.



The actual configuration must be validated through load testing using realistic dataset sizes, upload volumes, concurrent sessions, and export workloads.



A 1 vCPU / 2 GB VPS may be sufficient for development or a low-volume prototype, but it provides limited room for Redis, background processing, and simultaneous analytical operations.



\### 4.2 Infrastructure components



| Component | Purpose |

|---|---|

| Domain | Public application identity |

| DNS | Domain resolution |

| VPS | Backend infrastructure |

| Ubuntu | Server operating system |

| Docker | Application containers |

| Docker Compose | Multi-container management |

| Nginx | Reverse proxy |

| TLS certificate | HTTPS |

| Redis | Shared temporary state, if required |

| Persistent database | Approved configuration and identity records |

| Monitoring | Application and infrastructure health |



\## 5. Domain and DNS Configuration



The production domain must be configured through the selected domain registrar.



Proposed DNS structure:



| Record | Purpose |

|---|---|

| `A` record for `@` | Main frontend, if hosted on VPS |

| `CNAME` for `www` | Main frontend alias |

| `A` record for `api` | Backend VPS |



Example:



```text

example.com       -> Frontend

www.example.com   -> Frontend

api.example.com   -> Backend VPS

```



If the frontend is hosted on Vercel, configure the DNS records according to Vercel's domain setup instructions.



The backend API should use a dedicated subdomain.



The actual domain and DNS provider must be confirmed before production configuration.



\## 6. Frontend Deployment



\### 6.1 Build process



The React application must be built into static production assets.



Example:



```bash

npm install

npm run build

```



The production build is generated in:



```text

frontend/dist/

```



\### 6.2 Frontend environment configuration



Example:



```env

VITE\_API\_BASE\_URL=https://api.example.com/api/v1

```



Only public frontend configuration may use Vite environment variables.



Secrets must never be included in frontend environment variables because they are exposed in the browser build.



\### 6.3 Frontend hosting options



\*\*Option A: Vercel\*\*



Advantages:

\- Managed frontend deployment.

\- Git-based deployments.

\- CDN distribution.

\- Simplified HTTPS.

\- Preview deployments.



Considerations:

\- Configure the backend API domain.

\- Configure CORS correctly.

\- Do not store shared assessment-session state in frontend serverless memory.

\- Do not rely on frontend hosting for backend processing.



\*\*Option B: VPS with Nginx\*\*



Advantages:

\- Centralized infrastructure.

\- Direct control over static files.

\- No separate frontend hosting provider required.

\- Shared deployment environment.



Considerations:

\- Static assets and backend routing must be configured correctly.

\- CDN and caching configuration become operational responsibilities.

\- Frontend releases are coupled more closely to VPS deployment.



The initial deployment may use either option. The selected option must be documented in the release configuration.



\## 7. Backend Deployment



\### 7.1 Production application server



The FastAPI application will run using Uvicorn.



Example development command:



```bash

uvicorn app.main:app --reload

```



Example production command:



```bash

uvicorn app.main:app --host 0.0.0.0 --port 8000

```



The application should run inside a Docker container.



The production configuration must disable development reload behavior.



\### 7.2 Backend environment variables



Example:



```env

APP\_ENV=production

APP\_NAME=SSIP



API\_V1\_PREFIX=/api/v1



SECRET\_KEY=

DATABASE\_URL=

REDIS\_URL=



ALLOWED\_ORIGINS=https://example.com



MAX\_UPLOAD\_SIZE\_MB=20



SESSION\_RETENTION\_MINUTES=1440

EXPORT\_RETENTION\_MINUTES=1440



LOG\_LEVEL=INFO

```



Values are illustrative. Retention periods, upload limits, authentication configuration, and other operational values require approval.



Secrets must be injected through protected environment configuration or a secret-management mechanism.



They must not be committed to Git.



\## 8. Docker Architecture



\### 8.1 Container strategy



The initial deployment may contain:



| Container | Responsibility |

|---|---|

| `ssip-api` | FastAPI application |

| `ssip-worker` | Background processing, if deployed separately |

| `ssip-redis` | Temporary shared state, if required |

| `ssip-db` | Persistent configuration database, if approved |

| `ssip-nginx` | Reverse proxy and TLS routing |



The frontend may be deployed independently or served through Nginx.



Avoid creating a separate container for every logical backend module.



\### 8.2 Dockerfile example



```dockerfile

FROM python:3.12-slim



WORKDIR /app



ENV PYTHONDONTWRITEBYTECODE=1

ENV PYTHONUNBUFFERED=1



COPY requirements.txt .



RUN pip install --no-cache-dir -r requirements.txt



COPY . .



EXPOSE 8000



CMD \["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

```



The production Dockerfile should additionally:

\- Run as a non-root user.

\- Use pinned dependencies.

\- Exclude unnecessary files.

\- Avoid copying development secrets.

\- Use a controlled build context.

\- Support health checks.

\- Be scanned for known vulnerabilities.



\### 8.3 Docker Compose example



The following is a deployment template. Optional Redis and database services must only be enabled after their storage and persistence policies are approved.



```yaml

services:

&#x20; api:

&#x20;   build:

&#x20;     context: ./backend

&#x20;   container\_name: ssip-api

&#x20;   restart: unless-stopped

&#x20;   env\_file:

&#x20;     - .env

&#x20;   expose:

&#x20;     - "8000"

&#x20;   networks:

&#x20;     - ssip-network



&#x20; nginx:

&#x20;   image: nginx:stable

&#x20;   container\_name: ssip-nginx

&#x20;   restart: unless-stopped

&#x20;   ports:

&#x20;     - "80:80"

&#x20;     - "443:443"

&#x20;   volumes:

&#x20;     - ./nginx/conf.d:/etc/nginx/conf.d:ro

&#x20;     - ./certbot/www:/var/www/certbot:ro

&#x20;     - ./certbot/conf:/etc/letsencrypt:ro

&#x20;   depends\_on:

&#x20;     - api

&#x20;   networks:

&#x20;     - ssip-network



networks:

&#x20; ssip-network:

&#x20;   driver: bridge

```



Additional services should be introduced with explicit volume, network, resource, and persistence policies.



\## 9. Nginx Configuration



Nginx acts as the reverse proxy between external clients and the FastAPI application.



Responsibilities:

\- HTTPS termination.

\- HTTP-to-HTTPS redirection.

\- API routing.

\- Request-size limits.

\- Forwarding client information.

\- Security headers.

\- Basic connection management.



Example configuration:



```nginx

server {

&#x20;   listen 80;

&#x20;   server\_name api.example.com;



&#x20;   location /.well-known/acme-challenge/ {

&#x20;       root /var/www/certbot;

&#x20;   }



&#x20;   location / {

&#x20;       return 301 https://$host$request\_uri;

&#x20;   }

}



server {

&#x20;   listen 443 ssl;

&#x20;   server\_name api.example.com;



&#x20;   ssl\_certificate /etc/letsencrypt/live/api.example.com/fullchain.pem;

&#x20;   ssl\_certificate\_key /etc/letsencrypt/live/api.example.com/privkey.pem;



&#x20;   client\_max\_body\_size 20M;



&#x20;   location / {

&#x20;       proxy\_pass http://api:8000;



&#x20;       proxy\_set\_header Host $host;

&#x20;       proxy\_set\_header X-Real-IP $remote\_addr;

&#x20;       proxy\_set\_header X-Forwarded-For $proxy\_add\_x\_forwarded\_for;

&#x20;       proxy\_set\_header X-Forwarded-Proto $scheme;



&#x20;       proxy\_read\_timeout 120s;

&#x20;   }

}

```



The timeout and upload limits must be aligned with backend processing behavior and approved resource limits.



Long-running processing should preferably use asynchronous jobs rather than holding an HTTP request open for an extended period.



\## 10. HTTPS and TLS



All production communication must use HTTPS.



Requirements:

\- Valid TLS certificate.

\- Automatic certificate renewal.

\- HTTP-to-HTTPS redirection.

\- Secure TLS configuration.

\- No mixed-content requests.

\- Secure cookies where cookie-based authentication is selected.

\- HSTS after confirming all relevant domains support HTTPS.



Let's Encrypt may be used for certificate issuance.



Certificate renewal must be monitored and tested.



\## 11. Temporary Data Deployment Architecture



This is a critical deployment requirement.



\### 11.1 Student assessment data



The following data must remain temporary:



\- Student submissions.

\- Original uploaded datasets.

\- Normalized student records.

\- Validation outputs containing student-level information.

\- Analytical intermediate data.

\- Temporary skill-gap results.

\- Temporary recommendations.

\- Temporary processing artifacts.



\### 11.2 Temporary storage



Temporary data may be stored in:

\- Application memory for a single-process prototype.

\- Redis for shared temporary state.

\- Protected temporary filesystem locations for uploaded and generated files.



Temporary storage must not be placed in publicly accessible directories.



\### 11.3 Redis requirements



If Redis is deployed for student assessment data:



\- Disable RDB snapshots.

\- Disable AOF persistence.

\- Exclude its data from backups.

\- Apply TTL to temporary records.

\- Restrict Redis network access.

\- Apply authentication and access controls.

\- Monitor memory usage.

\- Define behavior when memory limits are reached.



Redis must not silently become a permanent assessment database.



\### 11.4 Temporary filesystem



Requirements:

\- Store files outside the frontend public directory.

\- Restrict file permissions.

\- Use generated server-side filenames.

\- Validate filenames and content.

\- Prevent path traversal.

\- Apply storage quotas.

\- Remove expired files.

\- Exclude prohibited temporary data from backup jobs.



Deleting a file does not guarantee forensic erasure from every storage medium or provider snapshot.



\### 11.5 Cleanup service



The cleanup service must remove:



\- Expired sessions.

\- Assessment submissions.

\- Original upload files.

\- Normalized datasets.

\- Temporary analysis outputs.

\- Temporary recommendations.

\- Expired exports.

\- Temporary job data.



Cleanup must be idempotent and safe to retry.



A cleanup failure must generate an operational alert without logging sensitive student information.



\## 12. Persistent Data and Backup Policy



Persistent data may include:

\- User accounts.

\- Roles and permissions.

\- Skill taxonomy.

\- Proficiency configuration.

\- Recommendation rules.

\- Platform settings.

\- Approved governance records.



These records require a separate storage and backup policy.



\### 12.1 Backup rules



| Data category | Backup policy |

|---|---|

| Student assessment data | Must not be backed up |

| Temporary upload files | Must not be backed up |

| Temporary analysis outputs | Must not be backed up |

| Persistent user/configuration data | Back up according to approved policy |

| Application source code | Version-controlled |

| Deployment configuration | Version-controlled without secrets |

| Secret values | Protected secret-management mechanism |



If the VPS provider performs automated snapshots, confirm whether those snapshots include temporary assessment data.



A backup policy must not contradict the platform's no-permanent-assessment-storage requirement.



\### 12.2 Recovery planning



Recovery procedures must cover:

\- Application container failure.

\- VPS failure.

\- Persistent database failure.

\- Redis failure.

\- Certificate expiry.

\- Disk exhaustion.

\- Failed deployment.



Temporary assessment data may be lost during infrastructure failure or process restart according to the approved temporary-storage policy.



The platform must not promise recovery of temporary records unless a separate, approved retention design supports it.



\## 13. Network and Firewall Configuration



Only required external ports should be exposed.



| Port | Protocol | Purpose | Exposure |

|---|---|---|---|

| 22 | TCP | SSH | Restricted source IPs where possible |

| 80 | TCP | HTTP and certificate validation | Public |

| 443 | TCP | HTTPS | Public |

| 8000 | TCP | FastAPI | Internal only |

| 6379 | TCP | Redis | Internal only |

| 5432 | TCP | PostgreSQL, if used | Internal only |



Redis and database ports must not be publicly exposed.



SSH should use key-based authentication. Password-based root login should be disabled where operationally possible.



The firewall must deny unnecessary inbound traffic.



\## 14. Server Hardening



Production VPS requirements:



\- Install security updates.

\- Use a non-root application user.

\- Restrict SSH access.

\- Configure firewall rules.

\- Disable unnecessary services.

\- Use SSH keys.

\- Protect environment files.

\- Apply Docker security best practices.

\- Restrict container capabilities.

\- Monitor failed login attempts.

\- Configure disk and memory monitoring.

\- Review access logs.

\- Scan container images and dependencies.



The host operating system and containers must be maintained as separate security responsibilities.



\## 15. CI/CD and Release Management



\### 15.1 Proposed release flow



```text

Developer

&#x20;  |

&#x20;  v

Git Repository

&#x20;  |

&#x20;  v

Automated Tests

&#x20;  |

&#x20;  v

Code Quality Checks

&#x20;  |

&#x20;  v

Dependency / Security Scanning

&#x20;  |

&#x20;  v

Production Build

&#x20;  |

&#x20;  v

Container Image

&#x20;  |

&#x20;  v

Deployment

&#x20;  |

&#x20;  v

Health Verification

&#x20;  |

&#x20;  +----> Success

&#x20;  |

&#x20;  +----> Rollback

```



\### 15.2 CI checks



Before production deployment:

\- Run unit tests.

\- Run integration tests.

\- Run frontend build.

\- Run backend linting.

\- Validate dependency versions.

\- Scan dependencies.

\- Scan container images.

\- Check configuration files.

\- Validate API compatibility.



\### 15.3 Deployment procedure



1\. Review the release changes.

2\. Run automated tests.

3\. Build the frontend and backend.

4\. Build or retrieve the approved container image.

5\. Back up permitted persistent data where required.

6\. Deploy the new version.

7\. Run health checks.

8\. Verify authentication.

9\. Verify core API endpoints.

10\. Verify temporary storage behavior.

11\. Verify cleanup execution.

12\. Monitor logs and metrics.



\### 15.4 Rollback



If deployment fails:



\- Stop the unhealthy release.

\- Restore the previous application image.

\- Restore compatible deployment configuration.

\- Restore permitted persistent data only when necessary.

\- Verify application health.

\- Investigate the failed release.



Do not restore prohibited student assessment data from backups.



Database migrations must be backward-compatible where practical, with a documented recovery procedure.



\## 16. Monitoring and Observability



Monitor the following:



\### Infrastructure

\- CPU usage.

\- RAM usage.

\- Disk utilization.

\- Network traffic.

\- Container health.

\- VPS availability.



\### Application

\- API response time.

\- HTTP error rates.

\- Authentication failures.

\- Authorization failures.

\- Upload errors.

\- Processing duration.

\- Processing failures.

\- Export generation duration.



\### Temporary data operations

\- Active sessions.

\- Expired sessions.

\- Cleanup execution.

\- Cleanup failures.

\- Temporary storage utilization.

\- Redis memory usage, if deployed.

\- Export expiry.



\### Alert conditions



Alerts should be configured for:

\- High CPU usage.

\- High memory usage.

\- Low disk space.

\- Repeated API failures.

\- Application unavailable.

\- Redis unavailable.

\- Persistent database unavailable.

\- Cleanup failures.

\- Certificate renewal failures.

\- Unexpected temporary storage growth.



Logs and metrics must not expose sensitive student assessment records.



\## 17. Resource Management



The platform must limit resource consumption.



Controls:

\- Maximum upload size.

\- Maximum rows per upload.

\- Maximum concurrent processing jobs.

\- Maximum active sessions.

\- Processing timeouts.

\- Memory limits.

\- Temporary storage quotas.

\- Export size limits.

\- Request rate limits.



Initial limits must be established through benchmarking.



Pandas operations can consume substantially more memory than the source CSV or XLSX file. Capacity planning must account for in-memory expansion and intermediate copies.



\## 18. Deployment Environments



The project should maintain separate environments.



\### Development

\- Local developer machine.

\- Docker Compose.

\- Test datasets.

\- Debug logging.

\- Development secrets.

\- No real student data unless explicitly authorized.



\### Staging

\- Production-like deployment.

\- Test accounts.

\- Synthetic or anonymized datasets.

\- Integration and acceptance testing.

\- Deployment validation.



\### Production

\- Public domain.

\- HTTPS.

\- Restricted infrastructure access.

\- Production secrets.

\- Monitoring and alerts.

\- Approved retention policies.

\- Controlled releases.



Staging and production must not share temporary assessment storage.



\## 19. Operational Procedures



\### 19.1 Application startup



The deployment process should:

\- Load configuration.

\- Verify required dependencies.

\- Initialize application modules.

\- Verify permitted persistent storage.

\- Verify temporary storage connectivity.

\- Start FastAPI.

\- Expose health endpoints.



\### 19.2 Health checks



Provide separate checks for:



\*\*Liveness\*\*

\- Determines whether the application process is alive.



\*\*Readiness\*\*

\- Determines whether the application can accept requests.

\- Checks required dependencies without exposing sensitive configuration.



Health endpoints must not disclose secrets, internal connection strings, or detailed infrastructure information.



\### 19.3 Disk exhaustion



If temporary storage approaches its configured limit:

\- Alert operators.

\- Prevent additional uploads where necessary.

\- Continue safe cleanup.

\- Avoid deleting active files unexpectedly.

\- Return a clear service error when capacity is unavailable.



\### 19.4 Redis failure



If Redis is unavailable:

\- Do not silently switch to process-local memory in a multi-worker deployment.

\- Return a controlled service error for operations requiring shared state.

\- Alert operators.

\- Restore service only after storage consistency is verified.



\### 19.5 Cleanup failure



Cleanup must:

\- Record the failed operation.

\- Retry safely.

\- Avoid duplicate destructive operations.

\- Alert operators when retention requirements may be violated.



\## 20. Deployment Acceptance Checklist



\### Infrastructure

\- \[ ] VPS provisioned.

\- \[ ] Operating system updated.

\- \[ ] Domain configured.

\- \[ ] DNS verified.

\- \[ ] Firewall configured.

\- \[ ] SSH secured.



\### Application

\- \[ ] Frontend deployed.

\- \[ ] Backend deployed.

\- \[ ] Docker containers healthy.

\- \[ ] Nginx configured.

\- \[ ] HTTPS operational.

\- \[ ] Environment variables configured.



\### Storage and privacy

\- \[ ] Temporary storage protected.

\- \[ ] Redis persistence disabled for prohibited data, if used.

\- \[ ] Temporary files excluded from prohibited backups.

\- \[ ] Cleanup service operational.

\- \[ ] Persistent data separated.

\- \[ ] Export retention verified.



\### Security

\- \[ ] No secrets committed.

\- \[ ] No unnecessary public ports.

\- \[ ] Authentication operational.

\- \[ ] Authorization tested.

\- \[ ] Upload restrictions tested.

\- \[ ] TLS configuration verified.



\### Operations

\- \[ ] Health checks operational.

\- \[ ] Logs configured.

\- \[ ] Resource monitoring enabled.

\- \[ ] Alerts configured.

\- \[ ] Backup and recovery policy tested.

\- \[ ] Rollback procedure documented.



\## 21. Open Deployment Decisions



| Decision | Current proposal |

|---|---|

| VPS provider | BigRock or another suitable VPS provider |

| VPS plan | 2 vCPU / 4 GB RAM starting point |

| Operating system | Ubuntu Server LTS |

| Frontend hosting | Vercel or VPS/Nginx |

| Backend hosting | Linux VPS |

| Containerization | Docker |

| Orchestration | Docker Compose |

| Reverse proxy | Nginx |

| Temporary shared state | Redis if required |

| Persistent database | Only for approved persistent entities |

| Background worker | Separate container if required |

| TLS | Let's Encrypt or provider-supported certificate |

| Monitoring | Lightweight infrastructure and application monitoring |

| Backup policy | Persistent data only; no student assessment records |

| CI/CD | Git-based automated pipeline |



\## 22. Definition of Completion



Deployment is considered production-ready when:



1\. The application is accessible through its configured domain.

2\. All production traffic uses HTTPS.

3\. Frontend and backend communicate securely.

4\. FastAPI operates reliably behind Nginx.

5\. Docker deployment is reproducible.

6\. Temporary assessment data is not permanently retained.

7\. Cleanup is automated and verified.

8\. Persistent configuration data is protected.

9\. Authentication and authorization are enforced.

10\. Monitoring and alerting are operational.

11\. Backup policies exclude prohibited assessment data.

12\. Deployment and rollback procedures are tested.

13\. Resource limits are validated under realistic workloads.

14\. Security checks pass before release.



\---



\*\*End of DEPLOYMENT.md\*\*

